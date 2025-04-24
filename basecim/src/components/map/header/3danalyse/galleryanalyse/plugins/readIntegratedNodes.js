import axios from 'axios';
import * as THREE from 'three';

class ReadIntegratedNodes {
    constructor(options) {
        var _self = this;
        _self.view = options.view;
        _self.geometryEngine = options.geometryEngine;
        _self.externalRenderers = options.externalRenderers;
        _self.Polygon = options.Polygon;
        _self.Graphic = options.Graphic;
        _self.Point = options.Point;

        _self.layerUrl = options.layerUrl;
        _self.limitGeometry = options.geometry || null;
        _self.nodePagesArray = options.nodePagesArray || [0];
        _self.layerSpatialReference =
            options.layerSpatialReference || options.view.SpatialReference;
        _self.callbackFunc = options.callbackFunc;
        _self.webglRenderer = options.webglRenderer || null;

        //全局变量
        _self.nodePagesInfos = [];
        _self.nodePagesUrls = _self.nodePagesArray.map(function (value) {
            return _self.layerUrl + '/nodepages/' + value;
        });
        _self.nodesNeedsArray = [];
        _self.parseBinIndex = 0;
        _self.resultMeshsGroup = null;
        _self.resultMeshs = [];
        //url查找
        _self.getNodePages();
    }

    createArrayByNum(start, num) {
        console.log('步骤11');
        var arr = [],
            length = start + num,
            i = start;
        for (; arr.push(i++) < length; ) {}
        return arr;
    }

    compare(key) {
        return function (a, b) {
            var val1 = a[key];
            var val2 = b[key];
            return val2 - val1;
        };
    }

    //X大，Y小
    compareXY(index1, index2) {
        return function (a, b) {
            var x1 = a[index1].toFixed(4);
            var x2 = b[index1].toFixed(4);
            if (x1 === x2) {
                var y1 = a[index2];
                var y2 = b[index2];
                return y1 - y2;
                // Y升序
            } else {
                return x2 - x1;
                //X降序
            }
        };
    }

    //获取0节点信息，获取到所有index的obb范围
    getNodePages() {
        let that = this;
        console.log(that.nodePagesUrls,'that.nodePagesUrls');

        if (that.nodePagesUrls.length > 0) {
            axios.get(that.nodePagesUrls[0]).then(function (res) {
                let nodeInfo = res.data;
                nodeInfo.nodes.forEach((pages, k) => {
                    if (!pages.children) {
                        that.nodePagesInfos.push(pages);
                    }
                });

                that.nodePagesUrls.shift();
                if (that.nodePagesUrls.length > 0) {
                    that.getNodePages();
                } else {
                    that.getNodesByGeometry();
                }
            });
        }
    }

    //根据nodepades信息，几何，查找对应的node，以及对应的bin
    getNodesByGeometry() {
        let that = this;
        // console.log(that.nodePagesInfos, 'that.nodePagesInfos');

        let binOrigintUrl = that.layerUrl + '/nodes/';
        //console.log(that.nodePagesInfos);
        this.resultMeshsGroup = new THREE.Group();
        if (that.limitGeometry) {
            //取与节点范围都相交的数据bin
            that.nodePagesInfos.forEach(function (pageInfo) {
                //只取跟给定几何相交的节点的bin文件
                let baseGeo = that.getObbBoxBaseGeo(pageInfo);
                let Insersects =
                    baseGeo &&
                    that.geometryEngine.intersect(that.limitGeometry, baseGeo);
                if (Insersects && Boolean(pageInfo.mesh)) {
                    let binUrl =
                        binOrigintUrl +
                        pageInfo.mesh.geometry.resource +
                        '/geometries/0';
                    that.nodesNeedsArray.push({ binUrl: binUrl });
                    that.parseBinUrl(pageInfo, binUrl, baseGeo);
                }
            });
        } else {
            //取所有节点的数据
            //获取nodes数组
            that.nodePagesInfos.forEach(function (pageInfo) {
                let binUrl =
                    binOrigintUrl +
                    pageInfo.mesh.geometry.resource +
                    '/geometries/0';
                that.nodesNeedsArray.push({ binUrl: binUrl });
                that.parseBinUrl(pageInfo, binUrl, null);
            });
        }
    }

    //获取底面坐标
    getObbBoxBaseGeo(pageInfo) {
        //let THREE = window.THREE;
        const obb = pageInfo.obb;
        // center 表示OBB相对于场景坐标系的位置
        let position_GPS = obb.center;
        let position_XYZ = [];

        // 中心点坐标转换
        // ? 转换前后值相同
        this.externalRenderers.toRenderCoordinates(
            this.view,
            position_GPS,
            0,
            this.layerSpatialReference,
            position_XYZ,
            0,
            1
        );

        // halfsize 是OBB的半尺寸，指OBB在每个轴上的一半长度，可以确定OBB在各个方向上的大小
        let cubeGeometry = new THREE.BoxGeometry(
            obb.halfSize[0] * 2,
            obb.halfSize[2] * 2,
            obb.halfSize[1] * 2,
            1,
            1,
            1
        );

        let cubeMaterial = new THREE.MeshLambertMaterial({
            color: 'rgba(250,0,0)',
            opacity: 0.1,
            transparent: true,
        });

        // quaternion 表示OBB旋转信息的一种数学方法，是一个四元组包含（x,y,z,w）
        let vectorQuaternion = new THREE.Quaternion();
        vectorQuaternion.x = obb.quaternion[0];
        vectorQuaternion.y = obb.quaternion[1];
        vectorQuaternion.z = obb.quaternion[2];
        vectorQuaternion.w = obb.quaternion[3];

        let object3D = new THREE.Object3D();
        let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        object3D.add(cubeMesh);

        object3D.position.set(
            position_XYZ[0],
            position_XYZ[1],
            position_XYZ[2]
        );
        object3D.applyQuaternion(vectorQuaternion);
        object3D.rotateX(Math.PI / 2);

        // 更新物体及其后代的全局变换
        object3D.updateMatrixWorld(true);

        //获取节点坐标
        let verticesArray = null;
        if (cubeMesh.geometry.vertices) {
            verticesArray = cubeMesh.geometry.vertices;
        } else {
            verticesArray = [];
            let positionArray = cubeMesh.geometry.attributes.position.array;
            for (let i = 0; i < positionArray.length - 2; i = i + 3) {
                let coords = [
                    positionArray[i],
                    positionArray[i + 1],
                    positionArray[i + 2],
                ];
                if (
                    // 没有则push
                    verticesArray.toString().indexOf(coords.toString()) === -1
                ) {
                    verticesArray.push(coords);
                }
            }
        }

        //保留底面坐标
        let rings = [];
        let temps = [];
        for (let k = 0; k < verticesArray.length; k++) {
            //给所有节点坐标应用变换
            let vec = new THREE.Vector3(
                verticesArray[k].x || verticesArray[k][0],
                verticesArray[k].y || verticesArray[k][1],
                verticesArray[k].z || verticesArray[k][2]
            );
            let objectQuaternion = object3D.quaternion;
            /*
                通过调用 makeRotationFromQuaternion 方法将四元数转换为变换矩阵，并将变换矩阵应用到节点坐标上，实现了节点坐标的旋转变换.
                使用变换矩阵对节点坐标进行变换的目的是使其适应不同的场景和视图需求。
                例如，在三维图形中，可以通过旋转变换改变节点的朝向或方位角，从而实现节点的正确渲染和定位。
                总结来说，调用 Vector3 对象的 applyMatrix4 方法是为了利用变换矩阵对节点坐标进行几何变换，从而实现节点在不同场景中的位置和方向的调整。
            */
            // matrix 矩阵
            let objectMatrix = new THREE.Matrix4();
            objectMatrix.makeRotationFromQuaternion(objectQuaternion);
            // 向量矩阵变换
            vec.applyMatrix4(objectMatrix);
            // position_XYZ 中心点坐标
            // ? 为何要节点坐标+中心点坐标:局部坐标系 -> 全局坐标系
            /*
                节点坐标（vec）和中心点坐标（position_XYZ）进行相加的目的是将节点坐标从局部坐标系转换到全局坐标系。
                在这段代码中，vec 是一个相对于物体（object3D）的局部坐标表示的节点坐标。
                而 position_XYZ 表示物体的中心点在全局坐标系中的坐标。
                通过将节点坐标和中心点坐标相加，可以将节点从局部坐标系转换为以全局坐标系为参考的坐标。
                这样做的目的是为了确保节点在正确的位置上进行渲染和处理。
                简单来说，将节点坐标和中心点坐标相加，是为了获得节点在全局坐标系中的准确位置，以便后续的坐标变换和图形构建操作。
            */
            let vec0 = new THREE.Vector3(
                vec.x + position_XYZ[0],
                vec.y + position_XYZ[1],
                vec.z + position_XYZ[2]
            );
            // console.log(vec, 'vec');
            // console.log(vec0, 'vec0');
            let cameraPositionGeographic = [];
            this.externalRenderers.fromRenderCoordinates(
                this.view,
                [vec0.x, vec0.y, vec0.z],
                0,
                cameraPositionGeographic,
                0,
                this.layerSpatialReference,
                1
            );
            // console.log(cameraPositionGeographic, 'cameraPositionGeographic');
            rings.push(cameraPositionGeographic);
            temps.push(cameraPositionGeographic);
            if (k === verticesArray.length - 1) {
                //查找Z值较小的4个点
                temps.sort(this.compare(2));
                let baseRings = [];
                // 因为是BoxGeometry,所以最多只有8个顶点，数组长度为8
                if (rings.length === 8)
                    rings.forEach(function (value) {
                        if (
                            [
                                temps[4][2],
                                temps[5][2],
                                temps[6][2],
                                temps[7][2],
                            ].indexOf(value[2]) > -1
                        ) {
                            baseRings.push(value);
                        }
                    });
                else baseRings = rings.concat();
                //顺时针点排序构建面,0,2,3,1,0

                baseRings.sort(this.compareXY(0, 1));
                //console.log([baseRings[0], baseRings[2], baseRings[3], baseRings[1], baseRings[0]]);
                if (baseRings.length < 4) return null;
                var basePolygon = new this.Polygon({
                    hasZ: false,
                    rings: [
                        [
                            baseRings[0],
                            baseRings[2],
                            baseRings[3],
                            baseRings[1],
                            baseRings[0],
                        ],
                    ],
                    spatialReference: { wkid: this.layerSpatialReference.wkid },
                });
                // 效果为所有建筑颜色覆盖
                let graphic = new this.Graphic({
                    geometry: basePolygon,
                    symbol: {
                        type: 'simple-fill',
                        color: [253, 133, 218, 0.5],
                        outline: {
                            color: [255, 153, 0],
                            width: 1.2,
                        },
                    },
                });
                // this.view.graphics.add(graphic);
                return basePolygon;
            }
        }
    }

    //绘制obb范围盒子
    drawObbBox(pageInfo) {
        //let THREE = window.THREE;
        const obb = pageInfo.obb;
        var point = new this.Point({
            type: 'point', // autocasts as new Point()
            x: obb.center[0],
            y: obb.center[1],
            z: obb.center[2],
            spatialReference: { wkid: this.layerSpatialReference.wkid },
        });
        let eulerOrder = 'xyz';
        var vectorQuaternion = new THREE.Quaternion();
        vectorQuaternion.w = obb.quaternion[3];
        vectorQuaternion.x = obb.quaternion[0];
        vectorQuaternion.y = obb.quaternion[1];
        vectorQuaternion.z = obb.quaternion[2];
        var vectorEuler = new THREE.Euler(0, 0, 0, eulerOrder);
        vectorEuler.setFromQuaternion(vectorQuaternion, eulerOrder);
        if (point !== null) {
            let graphic = new this.Graphic({
                geometry: point,
                symbol: {
                    type: 'point-3d', // autocasts as new PointSymbol3D()
                    symbolLayers: [
                        {
                            type: 'object', // autocasts as new ObjectSymbol3DLayer()
                            width: obb.halfSize[0] * 2, // diameter of the object from east to west in meters
                            height: obb.halfSize[2] * 2, // height of the object in meters
                            depth: obb.halfSize[1] * 2, // diameter of the object from north to south in meters
                            resource: { primitive: 'cube' },
                            material: { color: [255, 0, 0, 0.5] },
                            tilt: this.radToSpecific(vectorEuler.x), //around x axis
                            roll: this.radToSpecific(vectorEuler.y), // around the y axis
                            heading: this.radToSpecific(vectorEuler.z), //around z
                        },
                    ],
                },
                attributes: {
                    ObjectId: pageInfo.index,
                    all: pageInfo,
                },
            });
            this.view.graphics.add(graphic);
        }
    }

    //弧度转角度degree的方法
    radToSpecific(radiansIn) {
        //let THREE = window.THREE;
        let eulerAngleFormat = '';
        if (eulerAngleFormat == 'Radians') {
            return radiansIn;
        }
        return THREE.Math.radToDeg(radiansIn);
    }

    //解析bin文件地址
    parseBinUrl(pageInfo, url, baseGeo) {
        let that = this;
        //let THREE = window.THREE;
        const obb = pageInfo.obb;

        axios({
            method: 'get',
            url: url,
            responseType: 'blob',
        })
            .then(function (res) {
                var render = new FileReader();
                render.readAsArrayBuffer(res.data);
                render.onload = function () {
                    that.parseBinInfo(render.result, obb.center, baseGeo);
                };
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    //解析节点bin
    parseBinInfo(readerResult, mbs, baseGeo) {
        let that = this;
        this.parseBinIndex++;
        var uInt32View = new Uint32Array(readerResult);
        //解析顶点 要素数目
        var verticesNum = uInt32View[0];
        var float32View = new Float32Array(readerResult);
        // 顶点位置数组
        var float32View_sub_position = float32View.subarray(
            2,
            verticesNum * 3 + 2
        );
        // 法线数组
        var normalArray = float32View.subarray(
            verticesNum * 3 + 2,
            verticesNum * 6 + 2
        );
        // UV坐标数组
        var uv0Array = float32View.subarray(
            verticesNum * 6 + 2,
            verticesNum * 8 + 2
        );

        // 从Uint8Array视图中提取颜色数组
        var uInt8View = new Uint8Array(readerResult);
        var colorArray = uInt8View.subarray(
            verticesNum * 8 + 2,
            verticesNum * 12 + 2
        );
        // mbs中心坐标与bin解析的GPS相对数值求和，经过坐标转换，得到每个点的笛卡尔坐标
        var lengthTemp = float32View_sub_position.length - 2;
        let xyz_pos = [];
        let gps_pos = [];
        for (var i = 0; i < lengthTemp; i = i + 3) {
            var position_GPS = [
                float32View_sub_position[i] + mbs[0],
                float32View_sub_position[i + 1] + mbs[1],
                float32View_sub_position[i + 2] + mbs[2],
            ];
            var position_XYZ = [0, 0, 0];
            // debugger
            this.externalRenderers.toRenderCoordinates(
                this.view,
                position_GPS,
                0,
                that.nowSpatialReference,
                position_XYZ,
                0,
                1
            );
            float32View_sub_position[i] = position_XYZ[0];
            float32View_sub_position[i + 1] = position_XYZ[1];
            float32View_sub_position[i + 2] = position_XYZ[2];
            // 原始GPS坐标
            gps_pos.push(position_GPS);
            // 转换后的笛卡尔坐标
            xyz_pos.push(position_XYZ);
        }
        console.log(gps_pos, 'gps_pos');
        console.log(xyz_pos, 'xyz_pos');
        // positionArray 是个Float32Array数组
        var positionArray = float32View_sub_position;
        // console.log(positionArray, 'positionArray');

        if (this.nodesNeedsArray.length === this.parseBinIndex) {
            if (this.callbackFunc) {
                // debugger;
                this.callbackFunc(this.resultMeshsGroup, this.resultMeshs);
            }
        }

        let mesh = that.addGeometry(
            positionArray,
            normalArray,
            uv0Array,
            colorArray,
            mbs
        );
        this.resultMeshsGroup.add(mesh);
        this.resultMeshs.push({ mesh, baseGeo });
    }

    //构建mesh
    addGeometry(positionArray, normalArray, uv0Array, colorArray, mbs) {
        let that = this;
        var group = new THREE.Group();
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positionArray, 3)
        );
        //计算包围盒，得到geometry中心
        geometry.computeBoundingBox();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positionArray, 3)
        );
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(normalArray, 3)
        );
        geometry.setAttribute('uv', new THREE.BufferAttribute(uv0Array, 2));
        geometry.setAttribute(
            'color',
            new THREE.BufferAttribute(colorArray, 3)
        );

        var material = new THREE.MeshPhongMaterial({
            color: '#FF0000',
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            polygonOffset: true,
            polygonOffsetFactor: -0.5,
            polygonOffsetUnits: -0.5,
        });
        var mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        return mesh;
    }
}

export default ReadIntegratedNodes;
