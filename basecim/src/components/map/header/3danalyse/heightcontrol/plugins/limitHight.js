import viewImg from '@/assets/images/limitheight-images/view.png';

class LimitHight_WallLayer {
    constructor(options) {

        options = options || {};
        this.view = options.view;
        this.limitHeight = options.limitHeight || 0;
        this.analysisMeshs = options.analysisMeshs || [];
        this.meshGroup = options.meshGroup || null;
        this.drawPolygon = options.drawPolygon || null;

        this.Point = options.Point;
        // this.SpatialReference = options.SpatialReference;
        this.externalRenderers = options.externalRenderers;
        // this.webMercatorUtils = options.webMercatorUtils;
        // this.watchUtils = options.watchUtils;
        // this.geometryEngine = options.geometryEngine;
    }

    setup(context) {
        let THREE = window.THREE;
        this.renderer = new THREE.WebGLRenderer({
            context: context.gl,
            premultipliedAlpha: false,
            antialias: true,
            logarithmicDepthBuffer: true,
            polygonOffset: true,
            alpha: true
        });
        //设置设备像素比，可以避免HiDPI设备上绘图模糊
        this.renderer.setPixelRatio(window.devicePixelRatio);
        //设置视口大小和三维场景的大小一样
        this.renderer.setViewport(0, 0, this.view.width, this.view.height);
        // 防止Three.js清除ArcGIS JS API提供的缓冲区
        this.renderer.autoClearDepth = false; // 定义renderer是否清除深度缓存
        this.renderer.autoClearStencil = false; // 定义renderer是否清除模板缓存
        this.renderer.autoClearColor = false; // 定义renderer是否清除颜色缓存
        //ArcGIS JS API渲染自定义离屏缓冲区，而不是默认的帧缓冲区。
        //我们必须将这段代码注入到Three.js运行时中，以便绑定这些缓冲区而不是默认的缓冲区。
        var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
        this.renderer.setRenderTarget = function (target) {
            originalSetRenderTarget(target);
            this.state.viewport(new THREE.Vector4(0, 0, this.view.width, this.view.height));
            if (target == null) {
                context.bindRenderTarget();
            }
        }.bind(this.renderer);

        //支持裁切
        this.renderer.localClippingEnabled = true;

        this.scene = new THREE.Scene(); // 场景
        this.camera = new THREE.PerspectiveCamera(); // 相机
        // 添加坐标轴辅助工具
        const axesHelper = new THREE.AxesHelper(1);
        axesHelper.position.copy(1000000, 100000, 100000);
        this.scene.add(axesHelper);

        // setup scene lighting
        this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambient);
        this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
        this.sun.position.set(-600, 300, 60000);
        this.scene.add(this.sun);
        this.start(context);
        this.clock = new THREE.Clock();
        context.resetWebGLState();
    }
    render(context) {
        let THREE = window.THREE;
        // 更新相机参数
        const cam = context.camera;
        this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
        this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
        this.camera.lookAt(
            new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2])
        );
        // 投影矩阵可以直接复制
        this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

        //更新操作
        if (this.bufferMergeMesh && this.bufferMergeMesh.material.uniforms && this.bufferMergeMesh.material.uniforms.limit) {
            debugger
            this.bufferMergeMesh.material.uniforms.limit.value = this.limitHeight;
            this.bufferMergeMesh.material.needsUpdate = true;
        }

        // 绘制场景
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        // 请求重绘视图。
        this.externalRenderers.requestRender(this.view);
        // cleanup
        context.resetWebGLState();
    }
    start(context) {
        let THREE = window.THREE;
        let that = this;
        if (this.analysisMeshs.length > 0) {
            let newBufferGemoetry = this.mergeBufferGeometry(this.meshGroup.children);
            let filterGeometry = this.setFilterGeometry(newBufferGemoetry, this.drawPolygon);
            filterGeometry.computeBoundingBox();
            var boundingMin = filterGeometry.boundingBox.min;
            var boundingMax = filterGeometry.boundingBox.max;
            var boundingCenter = [(boundingMax.x + boundingMin.x) / 2, (boundingMax.y + boundingMin.y) / 2, (boundingMin.z + boundingMax.z) / 2];

            let position_GPS = [0, 0, 0];
            this.externalRenderers.fromRenderCoordinates(this.view, boundingCenter, 0, position_GPS, 0, this.view.spatialReference, 1);
            let target_XYZ = [];
            this.externalRenderers.toRenderCoordinates(this.view, [position_GPS[0], position_GPS[1], 0], 0, this.view.spatialReference, target_XYZ, 0, 1);

            let basePosition = new THREE.Vector3(target_XYZ[0], target_XYZ[1], target_XYZ[2]);
            let meshMaterial = this.analysisRender(basePosition);
            this.bufferMergeMesh = new THREE.Mesh(filterGeometry, meshMaterial);
            this.scene.add(this.bufferMergeMesh);
        }
    }

    analysisRender(basePosition) {
        debugger
        let that = this;
        let THREE = window.THREE;
        let texture = new THREE.TextureLoader().load(viewImg);
        let material = new THREE.MeshBasicMaterial({
            map: texture,
            color: '#FF0000',
            opacity: 0.8,
            transparent: true, side: THREE.DoubleSide
        });
        material.onBeforeCompile = function (shader, renderer) {
            //声明用到的变量和常量
            const getFoot = `
              uniform mat4 cameraMatrix;
              uniform mat4 projectionMatrixInverse;
              varying float depth;
              varying vec2 depthUv;
              //varying vec2 vUv;
              varying vec4 vPosition;
              #include <common>
              `;
            const begin_vertex = `
              #include <worldpos_vertex>
              vPosition= modelMatrix * vec4(transformed, 1.0 );
              `;
            const height_vary = `
              uniform float opacity;
              uniform float limit;
              uniform vec3 basePosition;
              varying vec4 vPosition;
              `;
            const height_frag = `
              float ph=length(vPosition.xyz)-length(basePosition);
              if(ph>=limit){
                gl_FragColor = vec4( outgoingLight, diffuseColor.a );
              }else{
                discard;
              }
              `
            shader.vertexShader = shader.vertexShader.replace(
                "#include <common>",
                getFoot
            );
            shader.vertexShader = shader.vertexShader.replace(
                "#include <worldpos_vertex>",
                begin_vertex
            );
            shader.fragmentShader = shader.fragmentShader.replace('uniform float opacity;', height_vary)
            shader.fragmentShader = shader.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', height_frag)
            shader.uniforms.limit = {
                value: 0.0
            }
            shader.uniforms.basePosition = {
                value: basePosition
            }
            material.uniforms = shader.uniforms;
        };
        material.needsUpdate = true;
        return material;
    }

    mergeBufferGeometry(objects) {
        let THREE = window.THREE;
        //再次过滤
        let that = this;
        const sumPosArr = new Array();
        const sumNormArr = new Array();
        const sumUvArr = new Array();

        const modelGeometry = new THREE.BufferGeometry();

        let sumPosCursor = 0;
        let sumNormCursor = 0;
        let sumUvCursor = 0;

        let startGroupCount = 0;
        let lastGroupCount = 0;

        for (let a = 0; a < objects.length; a++) {
            const posAttArr = objects[a].geometry.getAttribute('position').array;

            for (let b = 0; b < posAttArr.length; b++) {
                sumPosArr[b + sumPosCursor] = posAttArr[b];
            }

            sumPosCursor += posAttArr.length;


            const numAttArr = objects[a].geometry.getAttribute('normal').array;

            for (let b = 0; b < numAttArr.length; b++) {
                sumNormArr[b + sumNormCursor] = numAttArr[b];
            }

            sumNormCursor += numAttArr.length;


            const uvAttArr = objects[a].geometry.getAttribute('uv').array;

            for (let b = 0; b < uvAttArr.length; b++) {
                sumUvArr[b + sumUvCursor] = uvAttArr[b];
            }

            sumUvCursor += uvAttArr.length;

            const groupArr = objects[a].geometry.groups;

            for (let b = 0; b < groupArr.length; b++) {
                startGroupCount = lastGroupCount
                modelGeometry.addGroup(startGroupCount, groupArr[b].count, groupArr[b].materialIndex)
                lastGroupCount = startGroupCount + groupArr[b].count
            }
        }
        modelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sumPosArr, 3));
        sumNormArr.length && modelGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(sumNormArr, 3));
        sumUvArr.length && modelGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(sumUvArr, 2));

        return modelGeometry
    }
    setFilterGeometry(geometry, filterGeo) {
        let THREE = window.THREE;
        var geometryResult = new THREE.BufferGeometry();
        var positions = [];
        var normals = [];
        let float32View_sub_position = geometry.getAttribute('position').array;
        let lengthTemp = float32View_sub_position.length - 8;
        //每3个点 一个面
        for (var i = 0; i < lengthTemp; i = i + 9) {
            //计算中心点
            let point1 = [float32View_sub_position[i], float32View_sub_position[i + 1], float32View_sub_position[i + 2]];
            let point2 = [float32View_sub_position[i + 3], float32View_sub_position[i + 4], float32View_sub_position[i + 5]];
            let point3 = [float32View_sub_position[i + 6], float32View_sub_position[i + 7], float32View_sub_position[i + 8]];
            let x_center = (point1[0] + point2[0] + point3[0]) / 3;
            let y_center = (point1[1] + point2[1] + point3[1]) / 3;
            let z_center = (point1[2] + point2[2] + point3[2]) / 3;
            let position_XYZ = [x_center, y_center, z_center];
            let position_GPS = [0, 0, 0];
            this.externalRenderers.fromRenderCoordinates(this.view, position_XYZ, 0, position_GPS, 0, this.view.spatialReference, 1);
            let point = new this.Point({
                x: position_GPS[0],
                y: position_GPS[1],
                spatialReference: this.view.spatialReference
            });
            //在范围内，保留点
            if (filterGeo.contains(point)) {
                var pA = new THREE.Vector3();
                var pB = new THREE.Vector3();
                var pC = new THREE.Vector3();
                var cb = new THREE.Vector3();
                var ab = new THREE.Vector3();
                pA.set(point1[0], point1[1], point1[2]);
                pB.set(point2[0], point2[1], point2[2]);
                pC.set(point3[0], point3[1], point3[2]);
                cb.subVectors(pC, pB);
                ab.subVectors(pA, pB);
                cb.cross(ab);
                cb.normalize();//三角面法向量
                //坐标
                positions.push(point1[0]);
                positions.push(point1[1]);
                positions.push(point1[2]);

                positions.push(point2[0]);
                positions.push(point2[1]);
                positions.push(point2[2]);

                positions.push(point3[0]);
                positions.push(point3[1]);
                positions.push(point3[2]);
                //法向量
                var nx = cb.x;
                var ny = cb.y;
                var nz = cb.z;

                normals.push(nx);
                normals.push(ny);
                normals.push(nz);

                normals.push(nx);
                normals.push(ny);
                normals.push(nz);

                normals.push(nx);
                normals.push(ny);
                normals.push(nz);
            }
        }
        geometryResult.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometryResult.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometryResult.computeFaceNormals();
        return geometryResult;
    }
}

export default LimitHight_WallLayer;