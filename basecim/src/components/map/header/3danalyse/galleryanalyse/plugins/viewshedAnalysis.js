import viewImg from '@/assets/images/limitheight-images/view.png';
import * as THREE from 'three';
import * as projection from '@arcgis/core/geometry/projection.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polyline from "@arcgis/core/geometry/Polyline.js";

class ViewshedAnalysis {
    constructor(options) {
        options = options || {};
        console.log(options, 'options');

        this.GraphicsLayer = options.GraphicsLayer;
        this.Graphic = options.Graphic;
        this.Point = options.Point;
        this.Polygon = options.Polygon;
        this.geometryEngine = options.geometryEngine;
        this.supportsExtension = options.supportsExtension;
        this.externalRenderers = options.externalRenderers;
        this.webMercatorUtils = options.webMercatorUtils;

        this.view = options.view || null;
        this.geoMeshs = options.geoMeshs;
        this.startPoint = options.startPoint || null;
        this.endPoint = options.endPoint || null;
        this.layerSpatialReference = options.layerSpatialReference;
        this.visibleColor = options.visibleColor || 'rgb(255,0,0)';
        this.inVisibleColor = options.inVisibleColor || 'rgb(0,153,51)';
        this.dataType = options.dataType || 'integrate';

        // 创建相交点图层
        this.intersectPointLayer = new this.GraphicsLayer({
            title: 'intersectPoint',
            spatialReference: options.layerSpatialReference,
        });
        this.view.map.add(this.intersectPointLayer);
    }

    setup(context) {
        let that = this;
        this.renderer = new THREE.WebGLRenderer({
            context: context.gl,
            premultipliedAlpha: false,
            antialias: true,
            logarithmicDepthBuffer: true,
            polygonOffset: true,
            //polygonoffset 是一个比较常见的消除 z-fighting 的设置项。
            // 在 threejs 中我们可以设置 material 的 polygonoffset 属性来达到启用的目的。
            // 其原理是在渲染的时候，将模型的订单稍微向靠近或远离相机的方向做一定的偏移，从而错开两个靠近的面的目的。
            alpha: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
        var originalSetRenderTarget = this.renderer.setRenderTarget.bind(
            this.renderer
        );
        this.renderer.setRenderTarget = function (target) {
            originalSetRenderTarget(target);
            this.state.viewport(
                new THREE.Vector4(0, 0, that.view.width, that.view.height)
            );
            if (target == null) {
                context.bindRenderTarget();
            }
        }.bind(this.renderer);

        // 开启模型对象的局部剪裁平面功能
        this.renderer.localClippingEnabled = true;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera();
        this.camera.far = 10000000;
        this.ambient = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(this.ambient);

        // capabilities - 功能
        // WEBGL_depth_texture - WEBGL深度纹理
        // 检查WEBGL是否支持深度纹理扩展
        if (
            this.renderer.capabilities.isWebGL2 === false &&
            this.renderer.extensions.has('WEBGL_depth_texture') === false
        ) {
            this.supportsExtension = false;
            console.log(this.supportsExtension, 'supportsExtension');
        }
        let startP = [];
        let targetP = [];
        this.externalRenderers.toRenderCoordinates(
            this.view,
            this.startPoint,
            0,
            this.layerSpatialReference,
            startP,
            0,
            1
        );
        this.externalRenderers.toRenderCoordinates(
            this.view,
            this.endPoint,
            0,
            this.layerSpatialReference,
            targetP,
            0,
            1
        );

        /*
            起始点和目标点的几何球体
        */
        let startGeometry = new THREE.SphereGeometry(2, 32, 32);
        let targetGeometry = new THREE.SphereGeometry(2, 32, 32);
        let targetMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color('#01d8d2'),
        });
        this.targetObj = new THREE.Mesh(targetGeometry, targetMaterial);
        this.startObj = new THREE.Mesh(startGeometry, targetMaterial);
        this.targetObj.position.set(targetP[0], targetP[1], targetP[2]);
        this.startObj.position.set(startP[0], startP[1], startP[2]);
        this.scene.add(this.startObj);
        this.scene.add(this.targetObj);

        this.depthTarget = null;
        this.depthScene = null;
        this.orthCamera = null;

        this.clock = new THREE.Clock();
        //初始化
        this.init(context);
        context.resetWebGLState();
    }
    render(context) {
        //let THREE = window.THREE;
        var cam = context.camera;
        this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
        this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);

        this.camera.lookAt(
            new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2])
        );
        // 投影矩阵可以直接复制
        this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
        debugger;
        // console.log("----------------------" + this.viewshedMesh);
        // 6.28 暂时注释
        if (this.viewshedMesh.material.uniforms) {
            this.viewshedMesh.material.uniforms.tDepth.value =
                this.depthTarget.texture;
        }
        // 绘制场景
        this.renderer.state.reset();
        this.renderer.state.setBlending(THREE.NoBlending);
        this.renderer.render(this.scene, this.camera);
        // 请求重绘视图。
        this.externalRenderers.requestRender(this.view);
        context.resetWebGLState();
    }
    //初始化
    async init(context) {
        // 计算两点的角度差
        this.nAngle = await this.caculateAngle(this.startPoint, this.endPoint);
        // 计算两点的距离
        this.distance_se = this.caculateDistance(
            this.startPoint,
            this.endPoint
        );
        // 存储圆弧的几何体对象
        this.baseArcRings = null;
        // 根据角度和距离创建圆弧
        await this.getArcGeometry(this.nAngle, this.distance_se);
        // 存储剪裁面的数组
        this.clipPanels = [];
        // 根据上下文对象创建剪裁面的几何体
        this.clipGeomerty(context);
    }
    clipGeomerty(context) {
        //let THREE = window.THREE;
        debugger;
        let startP = [];
        let endP = [];
        let baseM_Hp = [];
        let baseMPoint = [];
        this.externalRenderers.toRenderCoordinates(
            this.view,
            this.startPoint,
            0,
            this.layerSpatialReference,
            startP,
            0,
            1
        );
        this.externalRenderers.toRenderCoordinates(
            this.view,
            this.endPoint,
            0,
            this.layerSpatialReference,
            endP,
            0,
            1
        );
        this.externalRenderers.toRenderCoordinates(
            this.view,
            [
                this.baseArcRings[parseInt(this.baseArcRings.length / 2)][0],
                this.baseArcRings[parseInt(this.baseArcRings.length / 2)][1],
                this.baseArcRings[parseInt(this.baseArcRings.length / 2)][2] +
                    100,
            ],
            0,
            this.layerSpatialReference,
            baseM_Hp,
            0,
            1
        );
        this.externalRenderers.toRenderCoordinates(
            this.view,
            [this.endPoint[0], this.endPoint[1], 0],
            0,
            this.layerSpatialReference,
            baseMPoint,
            0,
            1
        );
        let baseArcSp = [];
        let topArcSp = [];
        this.externalRenderers.toRenderCoordinates(
            this.view,
            this.baseArcRings[0],
            0,
            this.layerSpatialReference,
            baseArcSp,
            0,
            1
        );
        this.externalRenderers.toRenderCoordinates(
            this.view,
            [
                this.baseArcRings[0][0],
                this.baseArcRings[0][1],
                this.baseArcRings[0][2] + 100,
            ],
            0,
            this.layerSpatialReference,
            topArcSp,
            0,
            1
        );
        let baseArcEp = [];
        let topArcEp = [];
        this.externalRenderers.toRenderCoordinates(
            this.view,
            this.baseArcRings[this.baseArcRings.length - 3],
            0,
            this.layerSpatialReference,
            baseArcEp,
            0,
            1
        );
        this.externalRenderers.toRenderCoordinates(
            this.view,
            [
                this.baseArcRings[this.baseArcRings.length - 3][0],
                this.baseArcRings[this.baseArcRings.length - 3][1],
                this.baseArcRings[this.baseArcRings.length - 3][2] + 100,
            ],
            0,
            this.layerSpatialReference,
            topArcEp,
            0,
            1
        );
        let circleGeometry = new THREE.SphereGeometry(2, 32, 32);
        let targetMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color('#01d8d2'),
        });

        let plane1 = new THREE.Plane();
        let p1_1 = new THREE.Vector3(startP[0], startP[1], startP[2]);
        let p2_1 = new THREE.Vector3(baseArcSp[0], baseArcSp[1], baseArcSp[2]);
        let p3_1 = new THREE.Vector3(topArcSp[0], topArcSp[1], topArcSp[2]);
        plane1.setFromCoplanarPoints(p1_1, p2_1, p3_1);
        let plane2 = new THREE.Plane();
        let p1_2 = new THREE.Vector3(startP[0], startP[1], startP[2]);
        let p2_2 = new THREE.Vector3(baseArcEp[0], baseArcEp[1], baseArcEp[2]);
        let p3_2 = new THREE.Vector3(topArcEp[0], topArcEp[1], topArcEp[2]);
        plane2.setFromCoplanarPoints(p1_2, p3_2, p2_2);
        //
        let plane3 = new THREE.Plane();
        let p1_3 = new THREE.Vector3(baseM_Hp[0], baseM_Hp[1], baseM_Hp[2]);
        let p2_3 = new THREE.Vector3(
            baseMPoint[0],
            baseMPoint[1],
            baseMPoint[2]
        );
        let p3_3 = new THREE.Vector3(baseArcEp[0], baseArcEp[1], baseArcEp[2]);
        plane3.setFromCoplanarPoints(p1_3, p2_3, p3_3);
        let plane4 = new THREE.Plane();
        let p1_4 = new THREE.Vector3(baseArcSp[0], baseArcSp[1], baseArcSp[2]);
        let p2_4 = new THREE.Vector3(
            baseMPoint[0],
            baseMPoint[1],
            baseMPoint[2]
        );
        let p3_4 = new THREE.Vector3(baseM_Hp[0], baseM_Hp[1], baseM_Hp[2]);
        plane4.setFromCoplanarPoints(p1_4, p2_4, p3_4);

        this.clipPanels.push(plane1);
        this.clipPanels.push(plane2);
        this.clipPanels.push(plane3);
        this.clipPanels.push(plane4);

        let radius = this.distance_se;
        let width = radius * Math.tan((30 * Math.PI) / 180);
        let height = radius * Math.tan((20 * Math.PI) / 180);
        let radio = width / height;
        let camera_per = new THREE.PerspectiveCamera(
            40,
            radio,
            1,
            parseInt(radius)
        );
        camera_per.position.set(startP[0], startP[1], startP[2]);
        this.scene.add(camera_per);
        let upVec = p3_1.clone().sub(p2_1).normalize();
        camera_per.up.set(upVec.x, upVec.y, upVec.z);
        debugger;
        camera_per.lookAt(endP[0], endP[1], endP[2]);

        var frustum = new THREE.Frustum();
        // frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera_per.projectionMatrix, camera_per.matrixWorldInverse));
        frustum.setFromMatrix(
            new THREE.Matrix4().multiplyMatrices(
                camera_per.projectionMatrix,
                camera_per.matrixWorldInverse
            )
        );

        let p_s = new THREE.Vector3(startP[0], startP[1], startP[2]);
        let p_e = new THREE.Vector3(endP[0], endP[1], endP[2]);
        let lightVec = p_e.clone().sub(p_s).normalize();

        let that = this;
        let newBufferGemoetry = this.mergeBufferGeometry(
            this.geoMeshs,
            this.arcGeometry
        );

        let meshMaterial = new THREE.MeshLambertMaterial({
            transparent: true,
            opacity: 0.0,
            clippingPlanes: this.clipPanels,
            polygonOffset: true,
            polygonOffsetFactor: -0.5,
            polygonOffsetUnits: -0.5,
        });
        if (this.dataType === 'scene_bm') {
            let filterGeometry = this.setFilterGeometry(
                newBufferGemoetry,
                this.arcGeometry
            );
            filterGeometry.computeBoundingBox();
            newBufferGemoetry = filterGeometry.clone();
            let bufferMergeMesh = new THREE.Mesh(
                newBufferGemoetry,
                meshMaterial
            );
            this.scene.add(bufferMergeMesh);
            let rayPoints = this.getRayPoints();
            this.buildingViewshed(rayPoints, p_s);
        }
        let materialShader = this.caculateShadowMap(camera_per);
        materialShader.clippingPlanes = this.clipPanels;
        debugger;
        this.viewshedMesh = new THREE.Mesh(newBufferGemoetry, materialShader);
        this.scene.add(this.viewshedMesh);
        this.createDepth(camera_per, this.viewshedMesh);
    }
    buildingViewshed(rayPoints, startVec) {
        //;
        debugger;
        let that = this;
        let rayGeos = [];
        let rayCoords = [];
        let minIndex = -1;
        this.rayIntersectPoints = [];
        rayPoints.forEach(function (obj) {
            let vec = obj.vec;
            let index = obj.index;
            let ray = new THREE.Raycaster(
                startVec,
                vec.sub(startVec).normalize()
            );
            let rayIntersects = ray.intersectObjects(that.scene.children, true);
            if (rayIntersects[0]) {
                let intersectP = rayIntersects[0].point;
                that.rayIntersectPoints.push(intersectP);
                //添加到地图上
                let position_XYZ = [intersectP.x, intersectP.y, intersectP.z];
                let position_GPS = [0, 0, 0];
                that.externalRenderers.fromRenderCoordinates(
                    that.view,
                    position_XYZ,
                    0,
                    position_GPS,
                    0,
                    that.view.spatialReference,
                    1
                );
                let pointGeo = new that.Point({
                    latitude: position_GPS[1],
                    longitude: position_GPS[0],
                    z: position_GPS[2],
                });
                let line = new that.Polyline({
                    paths: [that.startPoint, position_GPS],
                    spatialReference: that.view.spatialReference,
                });
                //绘制出相交点
                const inputGraphic = new that.Graphic({
                    geometry: pointGeo,
                    symbol: {
                        type: 'simple-marker',
                        color: [0, 140, 0],
                        outline: {
                            color: [0, 140, 0],
                            width: 1,
                        },
                    },
                    spatialReference: that.view.spatialReference,
                });
                const lineGra = new that.Graphic({
                    geometry: line,
                    symbol: {
                        type: 'simple-line',
                        color: [255, 0, 0],
                        width: 1.5,
                    },
                    spatialReference: that.view.spatialReference,
                });
                debugger;
                that.intersectPointLayer.add(inputGraphic);
                that.intersectPointLayer.add(lineGra);
                rayGeos.push(pointGeo);
            }
        });
        let baseSp = [];
        this.externalRenderers.toRenderCoordinates(
            this.view,
            [this.startPoint[0], this.startPoint[1], 1],
            0,
            this.layerSpatialReference,
            baseSp,
            0,
            1
        );
        let baseSpVec = new THREE.Vector3(baseSp[0], baseSp[1], baseSp[2]);
        this.baseArcRings.forEach(function (coords, k) {
            if (k < that.baseArcRings.length - 1) {
                let vecP = [];
                that.externalRenderers.toRenderCoordinates(
                    that.view,
                    [coords[0], coords[1], 1],
                    0,
                    that.layerSpatialReference,
                    vecP,
                    0,
                    1
                );
                let vec = new THREE.Vector3(vecP[0], vecP[1], vecP[2]);
                let ray = new THREE.Raycaster(
                    baseSpVec,
                    vec.sub(baseSpVec).normalize()
                );
                let rayIntersects = ray.intersectObjects(
                    that.scene.children,
                    true
                );
                if (rayIntersects[0]) {
                    let intersectP = rayIntersects[0].point;
                    //添加到地图上
                    let position_XYZ = [
                        intersectP.x,
                        intersectP.y,
                        intersectP.z,
                    ];
                    let position_GPS = [0, 0, 0];
                    that.externalRenderers.fromRenderCoordinates(
                        that.view,
                        position_XYZ,
                        0,
                        position_GPS,
                        0,
                        that.view.spatialReference,
                        1
                    );
                    rayCoords.push(position_GPS);
                }
            }
        });
        let baseVisRings = rayCoords.concat([that.startPoint]);
        let baseVisPolygon = new this.Polygon({
            rings: baseVisRings,
            hasZ: false,
            spatialReference: this.view.spatialReference,
        });

        const baseVisGra = new this.Graphic({
            geometry: baseVisPolygon,
            symbol: {
                type: 'simple-fill',
                color: that.visibleColor,
                //width: 1.5
            },
            spatialReference: this.view.spatialReference,
        });

        let _rayCoords = rayCoords.concat();
        _rayCoords.reverse();
        let baseInVisRings = _rayCoords.concat(
            this.baseArcRings.slice(0, this.baseArcRings.length - 1)
        );
        let baseInVisPolygon = new this.Polygon({
            rings: baseInVisRings,
            hasZ: false,
            spatialReference: this.view.spatialReference,
        });
        const baseInVisGra = new this.Graphic({
            geometry: baseInVisPolygon,
            symbol: {
                type: 'simple-fill',
                color: that.inVisibleColor,
                //width: 1.5
            },
            spatialReference: this.view.spatialReference,
        });

        that.intersectPointLayer.add(baseVisGra);
        that.intersectPointLayer.add(baseInVisGra);
    }
    mergeBufferGeometry(meshObjects, filterGeo) {
        let objects = [];
        //let THREE = window.THREE;
        let that = this;
        meshObjects.forEach(function (item) {
            if (item.baseGeo) {
                let intersectGeos = that.geometryEngine.intersect(
                    filterGeo,
                    item.baseGeo
                );
                if (intersectGeos) {
                    objects.push(item.mesh);
                }
            } else {
                objects.push(item.mesh);
            }
        });
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
            const posAttArr =
                objects[a].geometry.getAttribute('position').array;

            for (let b = 0; b < posAttArr.length; b++) {
                sumPosArr[b + sumPosCursor] = posAttArr[b];
            }

            sumPosCursor += posAttArr.length;

            const numAttArr = objects[a].geometry.getAttribute('normal').array;

            for (let b = 0; b < numAttArr.length; b++) {
                sumNormArr[b + sumNormCursor] = numAttArr[b];
            }

            sumNormCursor += numAttArr.length;

            const groupArr = objects[a].geometry.groups;

            for (let b = 0; b < groupArr.length; b++) {
                startGroupCount = lastGroupCount;
                modelGeometry.addGroup(
                    startGroupCount,
                    groupArr[b].count,
                    groupArr[b].materialIndex
                );
                lastGroupCount = startGroupCount + groupArr[b].count;
            }
        }
        modelGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(sumPosArr, 3)
        );
        sumNormArr.length &&
            modelGeometry.setAttribute(
                'normal',
                new THREE.Float32BufferAttribute(sumNormArr, 3)
            );
        sumUvArr.length &&
            modelGeometry.setAttribute(
                'uv',
                new THREE.Float32BufferAttribute(sumUvArr, 2)
            );

        return modelGeometry;
    }
    setFilterGeometry(geometry, filterGeo) {
        //let THREE = window.THREE;
        var geometryResult = new THREE.BufferGeometry();
        var positions = [];
        var normals = [];
        let float32View_sub_position = geometry.getAttribute('position').array;
        let lengthTemp = float32View_sub_position.length - 8;
        //每3个点 一个面
        for (var i = 0; i < lengthTemp; i = i + 9) {
            //计算中心点
            let point1 = [
                float32View_sub_position[i],
                float32View_sub_position[i + 1],
                float32View_sub_position[i + 2],
            ];
            let point2 = [
                float32View_sub_position[i + 3],
                float32View_sub_position[i + 4],
                float32View_sub_position[i + 5],
            ];
            let point3 = [
                float32View_sub_position[i + 6],
                float32View_sub_position[i + 7],
                float32View_sub_position[i + 8],
            ];
            let x_center = (point1[0] + point2[0] + point3[0]) / 3;
            let y_center = (point1[1] + point2[1] + point3[1]) / 3;
            let z_center = (point1[2] + point2[2] + point3[2]) / 3;
            let position_XYZ = [x_center, y_center, z_center];
            let position_GPS = [0, 0, 0];
            this.externalRenderers.fromRenderCoordinates(
                this.view,
                position_XYZ,
                0,
                position_GPS,
                0,
                this.layerSpatialReference,
                1
            );
            let point = new this.Point({
                x: position_GPS[0],
                y: position_GPS[1],
                spatialReference: this.layerSpatialReference,
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
                cb.normalize(); //三角面法向量
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
        geometryResult.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );
        geometryResult.setAttribute(
            'normal',
            new THREE.Float32BufferAttribute(normals, 3)
        );
        geometryResult.computeFaceNormals();
        return geometryResult;
    }
    createDepth(_camera, mesh) {
        //let THREE = window.THREE;
        this.depthTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight
        );
        this.depthTarget.texture.format = THREE.RGBFormat;
        this.depthTarget.texture.minFilter = THREE.NearestFilter;
        this.depthTarget.texture.magFilter = THREE.NearestFilter;
        this.depthTarget.texture.generateMipmaps = false;
        this.depthTarget.depthBuffer = true;
        this.depthTarget.depthTexture = new THREE.DepthTexture();
        this.depthTarget.depthTexture.format = THREE.DepthFormat;
        this.depthTarget.depthTexture.type = THREE.UnsignedShortType;
        this.perCamera = _camera;

        const helper = new THREE.CameraHelper(this.perCamera);
        this.scene.add(helper);

        this.depthScene = new THREE.Scene();
        let ver = `
        precision highp float;
        uniform float cameraNear;
        uniform float cameraFar;
        varying float depth;
        varying vec4 vPosition;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            depth = gl_Position.z / (cameraFar-cameraNear);
            //depth=gl_Position.z / 2.0 + 0.5;
            vPosition=modelViewMatrix * vec4(position, 1.0);
        }
        `;
        let fra = `
        precision highp float;
        varying float depth;
        void main() {
            float hex = abs(depth) * 16777215.0; // 0xffffff
            float r = floor(hex / 65535.0);
            float g = floor((hex - r * 65535.0) / 255.0);
            float b = floor(hex - r * 65535.0 - g * 255.0);
            float a = sign(depth) >= 0.0 ? 1.0 : 0.0; // depth大于等于0，为1.0；小于0，为0.0。
            gl_FragColor = vec4(r / 255.0, g / 255.0, b / 255.0, a);
        }
        `;

        let materialShader = new THREE.ShaderMaterial({
            vertexShader: ver,
            fragmentShader: fra,
            uniforms: {
                cameraNear: { value: _camera.near },
                cameraFar: { value: _camera.far },
                uLightLocation: {
                    value: new THREE.Vector3(
                        _camera.position.x,
                        _camera.position.y,
                        _camera.position.z
                    ),
                },
            },
        });
        this.depthScene.overrideMaterial = materialShader;
        //let mesh = new THREE.Mesh(meshGeo, materialShader);
        this.renderer.setRenderTarget(this.depthTarget);
        this.depthScene.children = [this.perCamera, mesh];
        this.renderer.clear();
        this.renderer.render(this.depthScene, this.perCamera);
        this.renderer.setRenderTarget(null);
    }
    //阴影贴图
    caculateShadowMap(camera) {
        let that = this;
        //let THREE = window.THREE;
        let texture = new THREE.TextureLoader().load(viewImg);
        let material = new THREE.MeshBasicMaterial({
            map: texture,
            opacity: 0.7,
            // opacity: 1,
            color: new THREE.Color(this.inVisibleColor),
            transparent: true,
            side: THREE.DoubleSide,
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
              varying vec3 vPositionNormal;
              varying mat4 uMVPMatrixGY;
              #include <common>
              `;
            const begin_vertex = `
              #include <worldpos_vertex>
              vPosition= modelMatrix * vec4(transformed, 1.0 );
              vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
              uMVPMatrixGY= cameraMatrix * modelMatrix;
              vPositionNormal=normal;
              `;
            const depth_vary = `
              uniform float time;
              uniform sampler2D tDepth;
              uniform float opacity;
              uniform vec3 uLightLocation;
              //uniform vec3 intersectPoints[1000];
              uniform mat4 projectionMatrixInverse;
              uniform float cameraNear;
              uniform float cameraFar;
              uniform vec3 visColor;
              varying float depth;
              varying vec2 depthUv;
              varying vec4 vPosition;
              varying vec3 vPositionNormal;
              varying mat4 uMVPMatrixGY;
              float calculateCos(vec3 a, vec3 b){
                float dista = length(a);
                float distb = length(b);
                return (dot(a, b) / (dista * distb));
            }
              `;

            const depth_frag = `
              float cosa=calculateCos(vPositionNormal, normalize(vPosition.xyz-uLightLocation));
              if(cosa>=-0.4){
                gl_FragColor = vec4( outgoingLight, diffuseColor.a );
              }else{
                vec4 gytyPosition=uMVPMatrixGY * vec4(vPosition.xyz,1);
                gytyPosition=gytyPosition/gytyPosition.w;
                float s=(gytyPosition.s+1.0)/2.0;
                float t=(gytyPosition.t+1.0)/2.0;
                vec2 uv_depth=vec2(s,t);
                vec4 depth4=texture2D(tDepth, uv_depth);
                float hex = (depth4.r *255.0* 65535.0 + depth4.g * 255.0* 255.0 + depth4.b* 255.0) / 16777215.0;
                float cameraDepth = hex * cameraFar;
                vec4 H = vec4(s*2.0-1.0, t*2.0-1.0, hex, 1.0);
                vec4 D =projectionMatrixInverse*H;
                vec4 wordPos= D/D.w;
                float minDis=distance(wordPos.xyz,uLightLocation);
                float currDis=distance(vPosition.xyz,uLightLocation);
                //float minZA=depth4.r*256.0*256.0+depth4.g*256.0+depth4.b+depth4.a/32.0;
                if(s>=0.0&&s<=1.0&&t>=0.0&&t<=1.0) {
                    if(cameraDepth<=currDis-8.0){
                      gl_FragColor = vec4( outgoingLight, diffuseColor.a );
                    }else{
                      gl_FragColor= vec4(visColor.rgb,diffuseColor.a);
                    }
                } else{
                    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
                }
              }
              `;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                getFoot
            );
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                begin_vertex
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                'uniform float opacity;',
                depth_vary
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
                depth_frag
            );
            shader.uniforms.cameraMatrix = {
                value: new THREE.Matrix4().multiplyMatrices(
                    camera.projectionMatrix,
                    camera.matrixWorldInverse
                ),
            };
            shader.uniforms.projectionMatrixInverse = {
                value: camera.projectionMatrixInverse,
            };
            shader.uniforms.tDepth = {
                value: null,
            };
            shader.uniforms.uLightLocation = {
                value: new THREE.Vector3(
                    camera.position.x,
                    camera.position.y,
                    camera.position.z
                ),
            };
            // shader.uniforms.intersectPoints = {
            //   value: array,
            // }
            shader.uniforms.cameraNear = {
                value: camera.near,
            };
            shader.uniforms.cameraFar = {
                value: camera.far,
            };
            shader.uniforms.visColor = {
                value: new THREE.Color(that.visibleColor),
            };
            material.uniforms = shader.uniforms;
        };
        return material;
    }
    async getRayPoints() {
        let that = this;
        //let THREE = window.THREE;
        this.rayObjects = [];
        let radius = parseInt(this.distance_se) + 50;
        let maxAngle = 110;
        let pointNum = 100;
        let heightPoints = new Array();
        //最低 最高视角线之间取弧线点
        for (let k = 0; k < 20; k++) {
            let angle = maxAngle - (40 / 25) * k;
            const pointArray = await this.getHarcPoints(
                [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
                radius,
                this.nAngle - 30,
                this.nAngle + 30,
                pointNum,
                angle,
                null
            );
            heightPoints = heightPoints.concat(pointArray);
        }
        let targetArr = new Array();
        heightPoints.forEach(function (coords, i) {
            let targetP = [];
            let index = parseInt(i / 20);
            that.externalRenderers.toRenderCoordinates(
                that.view,
                coords,
                0,
                that.layerSpatialReference,
                targetP,
                0,
                1
            );
            targetArr.push({
                index,
                vec: new THREE.Vector3(targetP[0], targetP[1], targetP[2]),
            });
        });
        return targetArr;
    }
    async caculateAngle(pointS, pointE) {
        let outSp = new SpatialReference({
            wkid: 4326,
        });
        let PS = new Point({
            x: pointS[0],
            y: pointS[1],
            z: pointS[2],
            spatialReference: this.layerSpatialReference,
        });
        let PE = new Point({
            x: pointE[0],
            y: pointE[1],
            z: pointE[2],
            spatialReference: this.layerSpatialReference,
        });

        const resPro = await projection.load();
        const resArr = projection.project([PS, PE], outSp);
        console.log(resArr, 'resarr');
        let newPS = [resArr[0].x, resArr[0].y];
        let newPE = [resArr[1].x, resArr[1].y];

        let anlng_a = newPS[0];
        let anlat_a = newPS[1];
        let anlng_b = newPE[0];
        let anlat_b = newPE[1];
        var d = 0;
        var lat_a = (anlat_a * Math.PI) / 180;
        var lng_a = (anlng_a * Math.PI) / 180;
        var lat_b = (anlat_b * Math.PI) / 180;
        var lng_b = (anlng_b * Math.PI) / 180;

        d =
            Math.sin(lat_a) * Math.sin(lat_b) +
            Math.cos(lat_a) * Math.cos(lat_b) * Math.cos(lng_b - lng_a);
        d = Math.sqrt(1 - d * d);
        d = (Math.cos(lat_b) * Math.sin(lng_b - lng_a)) / d;
        d = (Math.asin(d) * 180) / Math.PI;
        if (anlat_a > anlat_b) {
            d = 180 - d;
        }
        if (d < 0) {
            d = 360 + d;
        }
        console.log(d, 'd');
        return d;
    }
    caculateDistance(pointS, pointE) {
        // !6.19 测试修改【可用】
        let x1 = pointS[0];
        let y1 = pointS[1];
        let z1 = pointS[2];
        let x2 = pointE[0];
        let y2 = pointE[1];
        let z2 = pointE[2];

        // Compute the Euclidean distance between the points
        let distance = Math.sqrt(
            Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
        );
        // alert(distance);
        return distance;

        // let long1 = pointS[0];
        // let lat1 = pointS[1];
        // let long2 = pointE[0];
        // let lat2 = pointE[1];
        // const R = 6371393;
        // lat1 = (lat1 * Math.PI) / 180.0;
        // lat2 = (lat2 * Math.PI) / 180.0;
        // let a = lat1 - lat2;
        // let b = ((long1 - long2) * Math.PI) / 180.0;
        // let sa2 = Math.sin(a / 2.0);
        // let sb2 = Math.sin(b / 2.0);
        // return Math.sqrt(
        //     (long1 - long2) * (long1 - long2) + (lat1 - lat2) * (lat1 - lat2)
        // );
        // //return 2 * R * Math.asin(Math.sqrt(sa2 * sa2 + Math.cos(lat1) * Math.cos(lat2) * sb2 * sb2));
    }
    //获取扇形几何
    async getArcGeometry(nAngle, R) {
        //默认夹角60
        console.log('半径：' + R);
        let radius = parseInt(R) + 50;
        //扇形底面rings---center, radius, startAngle, endAngle, pointNum, A, B
        var apointSxPolygon = await this.getHarcPoints(
            [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
            radius,
            nAngle - 30,
            nAngle + 30,
            50,
            90,
            null
        );
        console.log(apointSxPolygon, 'apointSxPolygon');
        apointSxPolygon[apointSxPolygon.length] = [
            this.startPoint[0],
            this.startPoint[1],
            this.startPoint[2],
        ];
        //扇形上侧弧线
        var apointArcHeight = await this.getHarcPoints(
            [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
            radius,
            nAngle - 30,
            nAngle + 30,
            1000,
            70,
            null
        );
        console.log(apointArcHeight, 'apointArcHeight');
        //中间
        var apointArcHeight_M = await this.getHarcPoints(
            [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
            radius,
            nAngle - 30,
            nAngle + 30,
            1000,
            80,
            null
        );
        //竖直弧线
        var heightArcStart = await this.getHarcPoints(
            [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
            radius,
            -10,
            20,
            1000,
            null,
            90 - (nAngle - 30)
        );
        var heightArcCenter1 = await this.getHarcPoints(
            [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
            radius,
            -10,
            20,
            1000,
            null,
            75 - (nAngle - 30)
        );
        var heightArcCenter2 = await this.getHarcPoints(
            [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
            radius,
            -10,
            20,
            1000,
            null,
            60 - (nAngle - 30)
        );
        var heightArcCenter3 = await this.getHarcPoints(
            [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
            radius,
            -10,
            20,
            1000,
            null,
            45 - (nAngle - 30)
        );
        var heightArcEnd = await this.getHarcPoints(
            [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
            radius,
            -10,
            20,
            1000,
            null,
            30 - (nAngle - 30)
        );
        debugger;
        var apoint2 = new Array();
        for (var k = 0; k < apointSxPolygon.length; k++) {
            //var centerline = webMercatorUtils.xyToLngLat(apointSxPolygon[k][0], apointSxPolygon[k][1]);
            apoint2[k] = [
                apointSxPolygon[k][0],
                apointSxPolygon[k][1],
                this.startPoint[2],
            ];
        }
        let lineSymbol = {
            type: 'simple-line',
            color: [255, 0, 0],
            color: [255, 153, 0],
            width: 1.2,
            // width: 10.2,
        };
        //上侧弧线graphic
        var polylineArcH = {
            type: 'polyline',
            paths: apointArcHeight,
            // hasZ: true,
            spatialReference:this.layerSpatialReference
        };
        var polylineArcHGraphic = new this.Graphic({
            geometry: polylineArcH,
            symbol: lineSymbol,
            spatialReference: this.layerSpatialReference,
        });
        //中间弧线graphic
        var polylineArcH_M = {
            type: 'polyline',
            paths: apointArcHeight_M,
            spatialReference:this.layerSpatialReference
        };
        var polylineArcHGraphic_M = new this.Graphic({
            geometry: polylineArcH_M,
            symbol: lineSymbol,
            spatialReference: this.layerSpatialReference,
        });
        //起点连上侧弧线
        var polylineSH1 = {
            type: 'polyline', // autocasts as new Polyline()
            paths: [
                [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
                [
                    apointArcHeight[0][0],
                    apointArcHeight[0][1],
                    apointArcHeight[0][2],
                ],
            ],
        };

        var polylineGraphicSH1 = new this.Graphic({
            geometry: polylineSH1,
            symbol: lineSymbol,
            spatialReference: this.layerSpatialReference,
        });

        var polylineSH2 = {
            type: 'polyline', // autocasts as new Polyline()
            paths: [
                [this.startPoint[0], this.startPoint[1], this.startPoint[2]],
                [
                    apointArcHeight[apointArcHeight.length - 1][0],
                    apointArcHeight[apointArcHeight.length - 1][1],
                    apointArcHeight[apointArcHeight.length - 1][2],
                ],
            ],
            spatialReference:this.layerSpatialReference
        };
        var polylineGraphicSH2 = new this.Graphic({
            geometry: polylineSH2,
            symbol: lineSymbol,
            spatialReference: this.layerSpatialReference,
        });
        //上下弧线连接线
        var polylineUD1 = {
            type: 'polyline',
            paths: heightArcStart,
            spatialReference:this.layerSpatialReference
        };
        var polylineGraphicUD1 = new this.Graphic({
            geometry: polylineUD1,
            symbol: lineSymbol,
            spatialReference: this.layerSpatialReference,
        });
        var polylineUD2 = {
            type: 'polyline',
            paths: heightArcEnd,
            spatialReference:this.layerSpatialReference
        };
        var polylineGraphicUD2 = new this.Graphic({
            geometry: polylineUD2,
            symbol: lineSymbol,
            spatialReference: this.layerSpatialReference,
        });

        var polylineUD3 = {
            type: 'polyline',
            paths: heightArcCenter1,
            spatialReference:this.layerSpatialReference
        };
        var polylineGraphicUD3 = new this.Graphic({
            geometry: polylineUD3,
            symbol: lineSymbol,
            spatialReference: this.layerSpatialReference,
        });
        var polylineUD4 = {
            type: 'polyline',
            paths: heightArcCenter2,
            spatialReference:this.layerSpatialReference
        };
        var polylineGraphicUD4 = new this.Graphic({
            geometry: polylineUD4,
            symbol: lineSymbol,
            spatialReference: this.layerSpatialReference,
        });
        var polylineUD5 = {
            type: 'polyline',
            paths: heightArcCenter3,
            spatialReference:this.layerSpatialReference
        };
        var polylineGraphicUD5 = new this.Graphic({
            geometry: polylineUD5,
            symbol: lineSymbol,
            spatialReference: this.layerSpatialReference,
        });

        //扇形面
        var polygonArc = new this.Polygon({
            hasZ: false,
            hasM: false,
            rings: apoint2,
            spatialReference: this.layerSpatialReference,
        });
        console.log(polygonArc, 'polygonArc');
        var grArc = new this.Graphic({
            geometry: polygonArc,
            symbol: {
                type: 'simple-fill',
                color: [255, 0, 0, 0],
                outline: {
                    color: [255, 153, 0],
                    width: 1.2,
                },
            },
            spatialReference: this.layerSpatialReference,
        });
        this.view.graphics.add(grArc);
        this.view.graphics.add(polylineArcHGraphic);
        console.log(this.view.graphics,'this.view.graphics');
        this.view.graphics.add(polylineArcHGraphic_M);
        this.view.graphics.add(polylineGraphicSH1);
        this.view.graphics.add(polylineGraphicSH2);
        this.view.graphics.add(polylineGraphicUD1);
        this.view.graphics.add(polylineGraphicUD2);
        this.view.graphics.add(polylineGraphicUD3);
        this.view.graphics.add(polylineGraphicUD4);
        this.view.graphics.add(polylineGraphicUD5);

        this.arcGeometry = polygonArc;
        this.baseArcRings = apoint2;
    }
    //获弧线点
    getHarcPoints2(center, radius, startAngle, endAngle, pointNum, A, B) {
        debugger;
        //A为与Z轴夹角，B为与X轴夹角
        var sinA;
        var cosA;
        var sinB;
        var cosB;
        var x;
        var y;
        var z;
        var angle;
        var points = new Array();
        if (A != null && B == null) {
            //获取横向弧线（带高程）
            sinA = Math.sin((A * Math.PI) / 180);
            cosA = Math.cos((A * Math.PI) / 180);
            // var centerZ = this.webMercatorUtils.xyToLngLat(center[0], center[1]);
            for (var i = 0; i < pointNum; i++) {
                angle = startAngle + ((endAngle - startAngle) * i) / pointNum;
                cosB = Math.cos((angle * Math.PI) / 180);
                sinB = Math.sin((angle * Math.PI) / 180);
                x = center[0] + radius * sinA * cosB;
                y = center[1] + radius * sinA * sinB;
                z = center[2];
                // var centerline = this.webMercatorUtils.lngLatToXY(x, y);
                points[i] = [x, y, z];
            }
            var point = points;
            return point;
        } else if (A == null && B != null) {
            //获取竖向弧线点
            sinB = Math.sin((B * Math.PI) / 180);
            cosB = Math.cos((B * Math.PI) / 180);
            // var centerZ = this.webMercatorUtils.xyToLngLat(center[0], center[1]);
            for (var i = 0; i < pointNum; i++) {
                angle = startAngle + ((endAngle - startAngle) * i) / pointNum;
                cosA = Math.sin((angle * Math.PI) / 180);
                sinA = Math.cos((angle * Math.PI) / 180);
                x = center[0] + radius * sinA * cosB;
                y = center[1] + radius * sinA * sinB;
                z = center[2] + radius * cosA;
                // var centerline = this.webMercatorUtils.lngLatToXY(x, y);
                points[i] = [x, y, z];
            }
            var point = points;
            return point;
        }
    }
    dispose(content) {
        this.view.graphics.removeAll();
        this.intersectPointLayer.removeAll();
    }
    //获弧线点
    async getHarcPoints(center, radius, startAngle, endAngle, pointNum, A, B) {
        // !6.19 测试修改【未知】
        let _that = this;
        var sinA;
        var cosA;
        var sinB;
        var cosB;
        var x;
        var y;
        var z;
        var angle;
        var points = new Array();
        const loadPro = await projection.load();
        if (A != null && B == null) {
            //获取横向弧线（带高程）
            sinA = Math.sin((A * Math.PI) / 180);
            cosA = Math.cos((A * Math.PI) / 180);
            // 先转成墨卡托
            const resCenter = projection.project(
                new Point({
                    x: center[0],
                    y: center[1],
                    z: center[2],
                    spatialReference: this.layerSpatialReference,
                }),
                new SpatialReference({
                    wkid: 102100,
                })
            );
            // console.log(resCenter, 'rescenter');

            for (var i = 0; i < pointNum; i++) {
                angle = startAngle + ((endAngle - startAngle) * i) / pointNum;
                cosB = Math.sin((angle * Math.PI) / 180);
                sinB = Math.cos((angle * Math.PI) / 180);
                x = resCenter.x + radius * sinA * cosB;
                y = resCenter.y + radius * sinA * sinB;
                z = resCenter.z + radius * cosA;

                const pointCenter = projection.project(
                    new Point({
                        x,
                        y,
                        z,
                        spatialReference: {
                            wkid: 102100,
                        },
                    }),
                    _that.layerSpatialReference
                );
                // console.log(pointCenter, 'pointCenter');
                points[i] = [pointCenter.x, pointCenter.y, pointCenter.z];
            }
            var point = points;
            return point;
        } else if (A == null && B != null) {
            //获取竖向弧线点
            sinB = Math.sin((B * Math.PI) / 180);
            cosB = Math.cos((B * Math.PI) / 180);
            // 先转成墨卡托
            const resCenter = projection.project(
                new Point({
                    x: center[0],
                    y: center[1],
                    z: center[2],
                    spatialReference: this.layerSpatialReference,
                }),
                new SpatialReference({
                    wkid: 102100,
                })
            );
            console.log(resCenter, 'rescenter');

            for (var i = 0; i < pointNum; i++) {
                angle = startAngle + ((endAngle - startAngle) * i) / pointNum;
                cosA = Math.sin((angle * Math.PI) / 180);
                sinA = Math.cos((angle * Math.PI) / 180);
                x = resCenter.x + radius * sinA * cosB;
                y = resCenter.y + radius * sinA * sinB;
                z = resCenter.z + radius * cosA;
                const pointCenter = projection.project(
                    new Point({
                        x,
                        y,
                        z,
                        spatialReference: {
                            wkid: 102100,
                        },
                    }),
                    _that.layerSpatialReference
                );
                points[i] = [pointCenter.x, pointCenter.y, pointCenter.z];
            }
            var point = points;
            return point;
        }

        // debugger;
        // //A为与Z轴夹角，B为与X轴夹角
        // var sinA;
        // var cosA;
        // var sinB;
        // var cosB;
        // var x;
        // var y;
        // var z;
        // var angle;
        // var points = new Array();
        // if (A != null && B == null) {
        //     //获取横向弧线（带高程）
        //     sinA = Math.sin((A * Math.PI) / 180);
        //     cosA = Math.cos((A * Math.PI) / 180);
        //     // var centerZ = this.webMercatorUtils.xyToLngLat(center[0], center[1]);
        //     for (var i = 0; i < pointNum; i++) {
        //         angle = startAngle + ((endAngle - startAngle) * i) / pointNum;
        //         cosB = Math.sin((angle * Math.PI) / 180);
        //         sinB = Math.cos((angle * Math.PI) / 180);
        //         x = center[0] + radius * sinA * cosB;
        //         y = center[1] + radius * sinA * sinB;
        //         z = center[2];
        //         // var centerline = this.webMercatorUtils.lngLatToXY(x, y);
        //         points[i] = [x, y, z];
        //     }
        //     var point = points;
        //     return point;
        // } else if (A == null && B != null) {
        //     //获取竖向弧线点
        //     sinB = Math.sin((B * Math.PI) / 180);
        //     cosB = Math.cos((B * Math.PI) / 180);
        //     // var centerZ = this.webMercatorUtils.xyToLngLat(center[0], center[1]);
        //     for (var i = 0; i < pointNum; i++) {
        //         angle = startAngle + ((endAngle - startAngle) * i) / pointNum;
        //         cosA = Math.sin((angle * Math.PI) / 180);
        //         sinA = Math.cos((angle * Math.PI) / 180);
        //         x = center[0] + radius * sinA * cosB;
        //         y = center[1] + radius * sinA * sinB;
        //         z = center[2] + radius * cosA;
        //         // var centerline = this.webMercatorUtils.lngLatToXY(x, y);
        //         points[i] = [x, y, z];
        //     }
        //     var point = points;
        //     return point;
        // }
    }
    dispose(content) {
        this.view.graphics.removeAll();
        this.intersectPointLayer.removeAll();
    }
}

export default ViewshedAnalysis;
