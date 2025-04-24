<template>
    <div
        class="tool-bar"
        :class="menuStore.layerIsShow ? '' : 'tool-transform'"
    >
        <el-dialog
            v-model="dialogVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-dialog"
            @close="closeDialog"
        >
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">视域分析</span>
                    <el-popover
                        placement="bottom-start"
                        :width="200"
                        trigger="hover"
                        content="注意事项文本占位"
                    >
                        <template #reference>
                            <i class="iconfont icon-shuxing"></i>
                        </template>
                    </el-popover>
                </span>
            </template>
            <div class="tool-main">
                <el-button type="primary" @click="drawEvent"
                    >绘制视线</el-button
                >
                <el-button type="warning" @click="clearRender">清除</el-button>
                <el-button type="success" @click="handleRender"
                    >开始分析</el-button
                >
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, reactive, watch, toRaw, onMounted, nextTick } from 'vue';
import useStore from '@/stores';

/* ArcGIS 相关 */
import * as externalRenderers from '@arcgis/core/views/3d/externalRenderers.js';
import Graphic from '@arcgis/core/Graphic.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import Draw from '@arcgis/core/views/draw/Draw.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import Point from '@arcgis/core/geometry/Point.js';
import Circle from '@arcgis/core/geometry/Circle.js';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils.js';
import * as projection from '@arcgis/core/geometry/projection.js';

/* UI 相关 */
import { ElMessage } from 'element-plus';

/* 其他 */
import * as THREE from 'three';
import ReadIntegratedNodes from './plugins/readIntegratedNodes';
import ViewshedAnalysis from './plugins/viewshedAnalysis';

const { menuStore, viewStore, mapStore } = useStore();
window.THREE = THREE;

/* 弹窗 */
const dialogVisible = ref(false);
const closeDialog = () => {
    graLayer?.removeAll();
    drawPoints = [];
    if (viewshedRender) {
        viewshedRender.dispose();
        externalRenderers.remove(toRaw(viewStore.mapInstance), viewshedRender);
    }
    // 菜单恢复初始值
    if (menuStore.currFunc == 'syfx') {
        menuStore.handleFunc('');
    }
};

/* 绘制视线 */
const handleRender = () => {
    funClickEvent('viewshed');
};

/* 渲染器 */
let webglRenderer = <any>null;
let webScene = <any>null;
let webCamera = <any>null;
let webAmbient = <any>null;
let graLayer = <any>null;
let intersectGeomerty = <any>null;
let draw = <any>null;
const assignRender = () => {
    draw = new Draw({
        view: toRaw(viewStore.mapInstance),
    });

    webglRenderer = {
        renderer: webglRenderer,
        scene: webScene,
        camera: webCamera,
        setup: function (context: any) {
            webglRenderer = new THREE.WebGLRenderer({
                context: context.gl,
                premultipliedAlpha: false,
                antialias: true,
                logarithmicDepthBuffer: true,
                polygonOffset: true,
                alpha: true,
            } as any);
            webglRenderer.shadowMap.enabled = true;
            webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
            // 设备像素比
            webglRenderer.setPixelRatio(window.devicePixelRatio);
            // 设置视口大小
            webglRenderer.setViewport(
                0,
                0,
                toRaw(viewStore.mapInstance).width,
                toRaw(viewStore.mapInstance).height
            );
            // 防止 Three.js 清除 ArcGIS 提供的缓冲区
            webglRenderer.autoClearDepth = false;
            webglRenderer.autoClearStencil = false;
            webglRenderer.autoClearColor = false;

            let originalSetRenderTarget =
                webglRenderer.setRenderTarget.bind(webglRenderer);
            originalSetRenderTarget.setRenderTarget = function (target: any) {
                originalSetRenderTarget(target);
                webglRenderer.state.viewport(
                    new THREE.Vector4(
                        0,
                        0,
                        toRaw(viewStore.mapInstance).width,
                        toRaw(viewStore.mapInstance).height
                    )
                );
                if (target == null) {
                    context.bindRenderTarget();
                }
            }.bind(webglRenderer);

            webScene = new THREE.Scene();
            webCamera = new THREE.PerspectiveCamera();
            webCamera.far = 10000000;
            // webCamera.far = 1000;
            webAmbient = new THREE.AmbientLight(0xffffff, 1);
            webScene.add(webAmbient);
            context.resetWebGLState();
        },
        render: function (context: any) {
            let cam = context.camera;
            webCamera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            webCamera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            webCamera.lookAt(
                new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2])
            );
            // 投影矩阵可以直接复制
            webCamera.projectionMatrix.fromArray(cam.projectionMatrix);
            // 绘制场景
            webglRenderer.state.reset();
            webglRenderer.state.setBlending(THREE.NoBlending);
            webglRenderer.render(webScene, webCamera);
            // 请求重绘视图
            externalRenderers.requestRender(toRaw(viewStore.mapInstance));
            context.resetWebGLState();
        },
    };
    externalRenderers.add(toRaw(viewStore.mapInstance), webglRenderer);
    graLayer = new GraphicsLayer({});
    toRaw(viewStore.mapInstance).map.add(graLayer);
};

const parseModel = () => {
    let readSceneNodeClass = new ReadIntegratedNodes({
        view: toRaw(viewStore.mapInstance),
        layerUrl: window.viewServer.url + '/layers/0',
        type: 'integrated',
        geometryEngine,
        externalRenderers,
        Polygon,
        Graphic,
        Point,
        geometry: intersectGeomerty,
        nodePagesArray: window.viewServer.nodePagesArray,
        layerSpatialReference: toRaw(viewStore.mapInstance).spatialReference,
        callbackFunc: addModelsAndProject,
    });
};

// 取到坐标点后，进行下一步分析
let geoMeshs = <any>[];
let meshGroup = <any>null;
let viewshedRender = <any>null;
let startPoint = <any>[];
let endPoint = <any>[];
const addModelsAndProject = (group: any, meshs: any) => {
    debugger;
    geoMeshs = meshs;
    meshGroup = group;

    if (!geoMeshs) {
        console.log('未获取几何');
        return;
    }
    if (viewshedRender) {
        viewshedRender.dispose();
        graLayer.removeAll();
        externalRenderers.remove(toRaw(viewStore.mapInstance), viewshedRender);
    }

    console.log(startPoint, 'startPoint');
    console.log(endPoint, 'endPoint');

    viewshedRender = new ViewshedAnalysis({
        view: toRaw(viewStore.mapInstance),
        GraphicsLayer,
        Graphic,
        Point,
        Polygon,
        geometryEngine,
        webMercatorUtils,
        externalRenderers,
        geoMeshs,
        startPoint,
        endPoint,
        layerSpatialReference: toRaw(viewStore.mapInstance).spatialReference,
        dataType: 'integrate',
        visibleColor: 'rgb(0,153,51)',
        inVisibleColor: 'rgb(255,0,0)',
    });
    externalRenderers.add(toRaw(viewStore.mapInstance), viewshedRender);

    // 测试坐标系转换
    // let outSp = new SpatialReference({
    //     wkid: 4326,
    // });
    // projection.load().then(() => {
    //     // let newPt = projection.project(point, outSp);
    //     // console.log(newPt, 'newPt');
    //     let startPt = new Point({
    //         x: startPoint[0],
    //         y: startPoint[1],
    //         spatialReference: {
    //             wkid: 4549,
    //         },
    //     });
    //     let endPt = new Point({
    //         x: endPoint[0],
    //         y: endPoint[1],
    //         spatialReference: {
    //             wkid: 4549,
    //         },
    //     });

    //     let newStart = projection.project(startPt, outSp) as any;
    //     let newEnd = projection.project(endPt, outSp) as any;
    //     let resStart = [newStart.x, newStart.y, startPoint[2]];
    //     let resEnd = [newEnd.x, newEnd.y, endPoint[2]];
    //     debugger;
    //     viewshedRender = new ViewshedAnalysis({
    //         view: toRaw(viewStore.mapInstance),
    //         GraphicsLayer,
    //         Graphic,
    //         Point,
    //         Polygon,
    //         geometryEngine,
    //         webMercatorUtils,
    //         externalRenderers,
    //         geoMeshs,
    //         startPoint: resStart,
    //         endPoint: resEnd,
    //         // layerSpatialReference: toRaw(viewStore.mapInstance)
    //         //     .spatialReference,
    //         layerSpatialReference: outSp,
    //         dataType: 'integrate',
    //         visibleColor: 'rgb(0,153,51)',
    //         inVisibleColor: 'rgb(255,0,0)',
    //     });
    //     externalRenderers.add(toRaw(viewStore.mapInstance), viewshedRender);
    // });
};

/* 绘制视线（起点、终点） */
let drawPoints = <any>[];
let drawAction = <any>null;
const drawEvent = () => {
    if (drawPoints.length == 2) {
        drawPoints = [];
        graLayer.removeAll();
    }
    drawAction = draw.create('point', { mode: 'click' });
    drawAction.on('draw-complete', (evt: any) => {
        debugger;
        showDrawGeo(evt);
    });
};

let lineLength = <any>300;
const showDrawGeo = (evt: any) => {
    if (drawPoints.length < 2) {
        const inputGraphic = new Graphic({
            geometry: new Point({
                x: evt.vertices[0][0],
                y: evt.vertices[0][1],
                z: evt.vertices[0][2],
                hasZ: true,
                spatialReference: toRaw(viewStore.mapInstance).spatialReference,
            }),
            symbol: {
                type: 'simple-marker',
                color: [255, 0, 0],
                outline: {
                    color: [255, 255, 255],
                    width: 1,
                },
            },
        } as any);

        graLayer.add(inputGraphic);
        drawPoints.push(evt.vertices[0]);

        if (drawPoints.length == 2) {
            drawAction.destroy();
            drawAction = null;

            // 利用半径生成圆，作为相交几何
            let polyline = {
                type: 'polyline',
                paths: drawPoints,
                spatialReference: toRaw(viewStore.mapInstance).spatialReference,
            };

            const inputGraphic = new Graphic({
                geometry: polyline,
                symbol: {
                    type: 'simple-line',
                    color: [0, 150, 0],
                    width: 1.5,
                },
            } as any);
            graLayer.add(inputGraphic);
            console.log(drawPoints, 'drawPoints');

            // 暂时注释
            // lineLength = calcDistance(drawPoints[0], drawPoints[1]);
        } else {
            drawAction.destroy();
            drawAction = null;
            drawAction = draw.create('point', { mode: 'click' });
            drawAction.on('draw-complete', (evt: any) => {
                showDrawGeo(evt);
            });
        }
    }
};

const calcDistance = (pointS: any, pointE: any) => {
    let long1 = pointS[0];
    let lat1 = pointS[1];
    let long2 = pointE[0];
    let lat2 = pointE[1];
    // 地球半径的平均值，
    const R = 6371393;
    lat1 = (lat1 * Math.PI) / 180.0;
    lat2 = (lat2 * Math.PI) / 180.0;
    let a = lat1 - lat2;
    let b = ((long1 - long2) * Math.PI) / 180.0;
    let sa2 = Math.sin(a / 2.0);
    let sb2 = Math.sin(b / 2.0);
    return (
        2 *
        R *
        Math.asin(
            Math.sqrt(sa2 * sa2 + Math.cos(lat1) * Math.cos(lat2) * sb2 * sb2)
        )
    );
};

const funClickEvent = (type: any) => {
    switch (type) {
        case 'viewshed':
            if (drawPoints.length < 2) {
                alert('请先绘制视线');
                return;
            }
            startPoint = drawPoints[0];
            endPoint = drawPoints[1];
            intersectGeomerty = new Circle({
                center: {
                    x: startPoint[0],
                    y: startPoint[1],
                    hasZ: false,
                    spatialReference: toRaw(viewStore.mapInstance)
                        .spatialReference,
                },
                radius: parseInt(lineLength) + 50,
            });
            let graphic = new Graphic({
                geometry: intersectGeomerty,
                symbol: {
                    type: 'simple-fill',
                    color: [253, 133, 218, 1],
                    outline: {
                        color: [255, 153, 0],
                        width: 1.2,
                    },
                },
            } as any);
            //graLayer.add(graphic);
            parseModel();
            break;
        case 'clear':
            graLayer.removeAll();
            drawPoints = [];
            if (viewshedRender) {
                viewshedRender.dispose();
                externalRenderers.remove(
                    toRaw(viewStore.mapInstance),
                    viewshedRender
                );
            }
            break;
    }
};

/* 清除 */
const clearRender = () => {
    funClickEvent('clear');
};

/* 监听功能栏子功能点击 */
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'syfx') {
        dialogVisible.value = true;
        nextTick(() => {
            assignRender();
        });
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './galleryanalyse.scss';
</style>
