import axios from "axios";

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
        _self.layerSpatialReference = options.layerSpatialReference || options.view.SpatialReference;
        _self.callbackFunc = options.callbackFunc;
        _self.webglRenderer = options.webglRenderer || null;

        //全局变量
        _self.nodePagesInfos = [];
        _self.nodePagesUrls = _self.nodePagesArray.map(function (value) {
            return _self.layerUrl + "/nodepages/" + value;
        });
        _self.nodesNeedsArray = [];
        _self.parseBinIndex = 0;
        _self.resultMeshsGroup = null;
        _self.resultMeshs = [];
        //url查找
        _self.getNodePages();
    }

    createArrayByNum(start, num) {
        var arr = [], length = start + num, i = start;
        for (; arr.push(i++) < length;) { }
        return arr;
    }

    compare (key) {
        return function (a, b) {
            var val1 = a[key];
            var val2 = b[key];
            return val2 - val1;
        }
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
            } else {
                return x2 - x1;
            }
        }
    }

    //获取0节点信息，获取到所有index的obb范围
    getNodePages() {
        let that = this;
        if (that.nodePagesUrls.length > 0) {
            axios.get(that.nodePagesUrls[0]).then(function (res) {
                let nodeInfo = res.data;
                nodeInfo.nodes.forEach((pages, k) => {
                    if (!pages.children) {
                        that.nodePagesInfos.push(pages);
                    }
                })

                that.nodePagesUrls.shift();
                if (that.nodePagesUrls.length > 0) {
                    that.getNodePages();
                } else {
                    that.getNodesByGeometry();
                }
            })
        }
    }

    //根据nodepades信息，几何，查找对应的node，以及对应的bin
    getNodesByGeometry() {
        let that = this;
        let THREE = window.THREE;
        debugger;
        let binOrigintUrl = that.layerUrl + "/nodes/"
        console.log(that.nodePagesInfos);
        this.resultMeshsGroup = new THREE.Group();
        if (that.limitGeometry) {//取与节点范围都相交的数据bin
            that.nodePagesInfos.forEach(function (pageInfo) {
                //只取跟给定几何相交的节点的bin文件
                let baseGeo = that.getObbBoxBaseGeo(pageInfo);
                let Insersects = baseGeo && that.geometryEngine.intersect(that.limitGeometry, baseGeo);
                if (Insersects) {
                    let binUrl = binOrigintUrl + pageInfo.mesh.geometry.resource + "/geometries/0";
                    that.nodesNeedsArray.push({ binUrl: binUrl });
                    that.parseBinUrl(pageInfo, binUrl, baseGeo);
                }
            });
        }
        else {//取所有节点的数据
            //获取nodes数组
            that.nodePagesInfos.forEach(function (pageInfo) {
                let binUrl = binOrigintUrl + pageInfo.mesh.geometry.resource + "/geometries/0";
                that.nodesNeedsArray.push({ binUrl: binUrl });
                that.parseBinUrl(pageInfo, binUrl, null);
            });
        }
    }

    //获取底面坐标
    getObbBoxBaseGeo(pageInfo) {
        let THREE = window.THREE;
        const obb = pageInfo.obb;
        let position_GPS = obb.center;
        let position_XYZ = [];
        this.externalRenderers.toRenderCoordinates(this.view, position_GPS, 0, this.layerSpatialReference, position_XYZ, 0, 1);
        let cubeGeometry = new THREE.BoxGeometry(obb.halfSize[0] * 2, obb.halfSize[2] * 2, obb.halfSize[1] * 2, 1, 1, 1);
        let cubeMaterial = new THREE.MeshLambertMaterial({
            color: 'rgba(250,0,0)',
            opacity: 0.1,
            transparent: true,
        });
        let vectorQuaternion = new THREE.Quaternion();
        vectorQuaternion.w = obb.quaternion[3];
        vectorQuaternion.x = obb.quaternion[0];
        vectorQuaternion.y = obb.quaternion[1];
        vectorQuaternion.z = obb.quaternion[2];

        let object3D = new THREE.Object3D();
        let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        object3D.add(cubeMesh);
        //let rotObjectMatrix = new THREE.Matrix4()
        //rotObjectMatrix.makeRotationFromQuaternion(vectorQuaternion);
        //cubeMesh.rotation.setFromRotationMatrix(rotObjectMatrix);

        object3D.position.set(position_XYZ[0], position_XYZ[1], position_XYZ[2]);
        object3D.applyQuaternion(vectorQuaternion);
        object3D.rotateX(Math.PI / 2);

        //if (this.webglRenderer) this.webglRenderer.scene.add(object3D);
        object3D.updateMatrixWorld(true);

        //获取节点坐标
        let verticesArray = null;
        if (cubeMesh.geometry.vertices) {
            verticesArray = cubeMesh.geometry.vertices
        } else {
            verticesArray = [];
            let positionArray = cubeMesh.geometry.attributes.position.array;
            for (let i = 0; i < positionArray.length - 2; i = i + 3) {
                let coords = [positionArray[i], positionArray[i + 1], positionArray[i + 2]];
                if (verticesArray.toString().indexOf(coords.toString()) === -1) {
                    verticesArray.push(coords);
                }
            }
        }
        //保留底面坐标
        let rings = [];
        let temps = [];
        for (let k = 0; k < verticesArray.length; k++) {
            //给所有节点坐标应用变换
            let vec = new THREE.Vector3(verticesArray[k].x || verticesArray[k][0], verticesArray[k].y || verticesArray[k][1], verticesArray[k].z || verticesArray[k][2]);
            let objectQuaternion = object3D.quaternion;
            let objectMatrix = new THREE.Matrix4()
            objectMatrix.makeRotationFromQuaternion(objectQuaternion);
            vec.applyMatrix4(objectMatrix);
            let vec0 = new THREE.Vector3(vec.x + position_XYZ[0], vec.y + position_XYZ[1], vec.z + position_XYZ[2]);
            let cameraPositionGeographic = [];
            this.externalRenderers.fromRenderCoordinates(this.view,
                [vec0.x, vec0.y, vec0.z], 0,
                cameraPositionGeographic, 0, this.layerSpatialReference,
                1);
            rings.push(cameraPositionGeographic);
            temps.push(cameraPositionGeographic);
            if (k === verticesArray.length - 1) {
                //查找Z值较小的4个点
                temps.sort(this.compare(2));
                let baseRings = [];
                if (rings.length === 8)
                    rings.forEach(function (value) {
                        if ([temps[4][2], temps[5][2], temps[6][2], temps[7][2],].indexOf(value[2]) > -1) {
                            baseRings.push(value);
                        }
                    });
                else
                    baseRings = rings.concat();
                //顺时针点排序构建面,0,2,3,1,0
                baseRings.sort(this.compareXY(0, 1));
                //console.log([baseRings[0], baseRings[2], baseRings[3], baseRings[1], baseRings[0]]);
                if (baseRings.length < 4) return null;
                var basePolygon = new this.Polygon({
                    hasZ: false,
                    rings: [[baseRings[0], baseRings[2], baseRings[3], baseRings[1], baseRings[0]]],
                    spatialReference: { wkid: this.layerSpatialReference.wkid }
                });
                let graphic = new this.Graphic({
                    geometry: basePolygon,
                    symbol: {
                        type: "simple-fill",
                        color: [253, 133, 218, 1],
                        outline: {
                            color: [255, 153, 0],
                            width: 1.2
                        }
                    }
                });
                //this.view.graphics.add(graphic);
                return basePolygon;
            }
        }
    }

    //绘制obb范围盒子
    drawObbBox(pageInfo) {
        let THREE = window.THREE;
        const obb = pageInfo.obb;
        var point = new this.Point({
            type: "point", // autocasts as new Point()
            x: obb.center[0],
            y: obb.center[1],
            z: obb.center[2],
            spatialReference: { wkid: this.layerSpatialReference.wkid }
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
                    type: "point-3d",  // autocasts as new PointSymbol3D()
                    symbolLayers: [{
                        type: "object",  // autocasts as new ObjectSymbol3DLayer()
                        width: obb.halfSize[0] * 2,  // diameter of the object from east to west in meters
                        height: obb.halfSize[2] * 2,  // height of the object in meters
                        depth: obb.halfSize[1] * 2,  // diameter of the object from north to south in meters
                        resource: { primitive: "cube" },
                        material: { color: [255, 0, 0, 0.5] },
                        tilt: this.radToSpecific(vectorEuler.x),//around x axis
                        roll: this.radToSpecific(vectorEuler.y),// around the y axis
                        heading: this.radToSpecific(vectorEuler.z),//around z
                    }]
                },
                attributes: {
                    ObjectId: pageInfo.index,
                    all: pageInfo
                }
            });
            this.view.graphics.add(graphic);
        }
    }

    //弧度转角度degree的方法
    radToSpecific(radiansIn) {
        let THREE = window.THREE;
        let eulerAngleFormat = '';
        if (eulerAngleFormat == "Radians") { return radiansIn; }
        return THREE.Math.radToDeg(radiansIn);
    }

    //解析bin文件地址
    parseBinUrl(pageInfo, url, baseGeo) {
        let that = this;
        let THREE = window.THREE;
        const obb = pageInfo.obb;
        axios({
            method: 'get',
            url: url,
            responseType: 'blob'
        }).then(function (res) {
            var render = new FileReader();
            render.readAsArrayBuffer(res.data);
            render.onload = function () {
                that.parseBinInfo(render.result, obb.center, baseGeo);
            };
        }).catch(function (error) {
            console.log(error);
        });
    }

    //解析节点bin
    parseBinInfo(readerResult, mbs, baseGeo) {
        // debugger;
        let that = this;
        this.parseBinIndex++;
        var uInt32View = new Uint32Array(readerResult);
        //解析顶点 要素数目
        var verticesNum = uInt32View[0];
        var float32View = new Float32Array(readerResult);
        var float32View_sub_position = float32View.subarray(2, verticesNum * 3 + 2);
        var normalArray = float32View.subarray(verticesNum * 3 + 2, verticesNum * 6 + 2);
        var uv0Array = float32View.subarray(verticesNum * 6 + 2, verticesNum * 8 + 2);
        var uInt8View = new Uint8Array(readerResult);
        var colorArray = uInt8View.subarray(verticesNum * 8 + 2, verticesNum * 12 + 2);
        // mbs中心坐标与bin解析的GPS相对数值求和，经过坐标转换，得到每个点的笛卡尔坐标
        var lengthTemp = float32View_sub_position.length - 2;
        let xyz_pos = [];
        let gps_pos = [];
        for (var i = 0; i < lengthTemp; i = i + 3) {
            var position_GPS = [float32View_sub_position[i] + mbs[0], float32View_sub_position[i + 1] + mbs[1], float32View_sub_position[i + 2] + mbs[2]];
            var position_XYZ = [0, 0, 0];
            // debugger
            this.externalRenderers.toRenderCoordinates(this.view, position_GPS, 0, that.nowSpatialReference, position_XYZ, 0, 1);
            float32View_sub_position[i] = position_XYZ[0];
            float32View_sub_position[i + 1] = position_XYZ[1];
            float32View_sub_position[i + 2] = position_XYZ[2];
            gps_pos.push(position_GPS);
            xyz_pos.push(position_XYZ);
        }
        var positionArray = float32View_sub_position;

        if (this.nodesNeedsArray.length === this.parseBinIndex) {
            if (this.callbackFunc) {
                // debugger;
                this.callbackFunc(this.resultMeshsGroup, this.resultMeshs);
            }
        }

        let mesh = that.addGeometry(positionArray, normalArray, uv0Array, colorArray, mbs);
        this.resultMeshsGroup.add(mesh);
        this.resultMeshs.push({ mesh, baseGeo });
    }

    //构建mesh
    addGeometry(positionArray, normalArray, uv0Array, colorArray, mbs) {
        let that = this;
        let THREE = window.THREE;
        var group = new THREE.Group();
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        //计算包围盒，得到geometry中心
        geometry.computeBoundingBox();
        //geometry.computeVertexNormals();
        //geometry.computeFaceNormals();
        var boundingMin = geometry.boundingBox.min;
        var boundingMax = geometry.boundingBox.max;
        var boundingCenter = [(boundingMax.x + boundingMin.x) / 2, (boundingMax.y + boundingMin.y) / 2, (boundingMin.z + boundingMax.z) / 2];
        // positionArray减掉geometry中心坐标
        // var relativePositionArray = new Float32Array(positionArray.length);
        // for (var pIndex in positionArray) {
        // 	// @ts-ignore
        // 	relativePositionArray[pIndex] = positionArray[pIndex] - boundingCenter[(pIndex % 3)];
        // }
        geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uv0Array, 2));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        var material = new THREE.MeshPhongMaterial({
            color: '#FF0000',
            vertexColors: THREE.VertexColors,
            transparent: true,
            opacity: 0.3,
            polygonOffset: true,
            polygonOffsetFactor: -0.5,
            polygonOffsetUnits: -0.5
        });
        var mesh = new THREE.Mesh(geometry, material);
        //mesh.position.set(boundingCenter[0], boundingCenter[1], (boundingCenter[2]));
        group.add(mesh);
        //if (that.webglRenderer) that.webglRenderer.scene.add(group);
        return mesh;
    }
}

export default ReadIntegratedNodes;