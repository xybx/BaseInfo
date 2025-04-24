<template>
    <div
        class="tool-bar"
        :class="menuStore.layerIsShow ? '' : 'tool-transform'"
    >
        <el-dialog
            v-model="locateVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-basemap"
            @close="closeLocate"
        >
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">控高分析</span>
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
                <div class="height-box">
                    <span>限高</span>
                    <el-input
                        v-model.number="limitHeight"
                        placeholder="单位：米"
                        @change="changeHeight"
                    />
                </div>
                <el-button type="primary" @click="handleRender"
                    >绘制范围</el-button
                >
                <el-button type="warning" @click="clearRender">清除</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, reactive, watch, toRaw, onMounted } from 'vue';
import useStore from '@/stores';

/* UI 相关 */
import { ElMessage } from 'element-plus';

/* ArcGIS API */
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import * as externalRenderers from '@arcgis/core/views/3d/externalRenderers.js';
import Graphic from '@arcgis/core/Graphic.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';

/* 其他 */
import * as THREE from 'three';
import LimitHight_WallLayer from './plugins/limitHight';
import ReadIntegratedNodes from './plugins/readIntegratedNodes';

/* API */

const { menuStore, viewStore, mapStore } = useStore();
window.THREE = THREE;

const locateVisible = ref(false);

const input = ref('');

/* 绘制范围 */
let sketchTool = <any>null;
let findLayer = <any>null;
let currGeo = <any>null;
let gLayer = <any>null;
const handleRender = () => {
    findLayer = toRaw(viewStore.mapInstance).map.findLayerById('147');
    console.log(findLayer, 'findlayer');

    gLayer = new GraphicsLayer({
        id: 'limitLayer',
        // elevationInfo: {
        //     mode: 'absolute-height',
        //     offset: limitHeight.value,
        // },
    });
    toRaw(viewStore.mapInstance).map.layers.add(gLayer);

    /* 渲染器 */
    assignRender();

    sketchTool = new SketchViewModel({
        layer: gLayer,
        view: toRaw(viewStore.mapInstance),
        polygonSymbol: {
            type: 'polygon-3d',
            symbolLayers: [
                {
                    type: 'fill',
                    material: { color: 'yellow' },
                    outline: { color: 'yellow' },
                    pattern: {
                        type: 'style',
                        style: 'cross',
                    },
                },
            ],
        },
    } as any);

    sketchTool.create('polygon');
    sketchTool.on('create', (evt: any) => {
        if (evt.state == 'complete') {
            // toRaw(viewStore.mapInstance)
            //     .whenLayerView(findLayer)
            //     .then((layerView: any) => {
            //         const query = layerView.createQuery();
            //         query.geometry = evt.graphic.geometry;
            //         query.outFields = ['*'];
            //         let geoArr1 = <any>[];
            //         layerView.queryFeatures(query).then((response: any) => {
            //             console.log(response, 'response');
            //             response.features.map((item: any) => {
            //                 geoArr1.push(item.geometry);
            //             });
            //         });

            //         let intersecting = geometryEngine.intersect(
            //             geoArr1,
            //             evt.graphic.geometry
            //         );
            //         console.log(intersecting, 'intersecting');
            //     });
            currGeo = evt.graphic;

            layerUrl = findLayer.url + '/layers/0';
            debugger;
            // parseModel(layerUrl, evt.graphic.geometry);
            parseModel()
            startAnalysis();
        }
    });
};
let layerUrl = <any>null;

/* 控制高度 */
const changeHeight = (val: any) => {
    console.log(val, 'val');
    console.log(limitHeight.value, 'limitHeight.value');

    // gLayer.elevationInfo = {
    //     mode: 'absolute-height',
    //     offset: limitHeight.value,
    // };
    if (limitHeightRenders) {
        limitHeightRenders.limitHeight = limitHeight.value;
    }
};

/* 清除 */
const clearRender = () => {
    if (limitHeightRenders) {
        externalRenderers.remove(
            toRaw(viewStore.mapInstance),
            limitHeightRenders
        );
        limitHeightRenders = null;
    }
};

const parseModel = () => {
    let readSceneNodeClass = new ReadIntegratedNodes({
        view: toRaw(viewStore.mapInstance),
        Point,
        Polygon,
        externalRenderers,
        Graphic,
        geometryEngine,
        layerUrl,
        type: 'scene',
        geometry: currGeo?.geometry,
        // limitHeight: limitHeight.value,
        // 可能需要CityEngine SDK
        nodePagesArray: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
            36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
            53, 54,
        ],
        layerSpatialReference: new SpatialReference({
            wkid: toRaw(viewStore.mapInstance).spatialReference.wkid,
        }),
        webglRenderer,
        callbackFunc: addModelsAndProject,
    });
};

// 取到坐标点后，进行下一步分析
let geoMeshs = <any>[];
let meshGroup = <any>null;
const addModelsAndProject = (group: any, meshs: any) => {
    debugger;
    geoMeshs = meshs;
    meshGroup = group;
    //webglRenderer.scene.add(meshGroup);
    if (!geoMeshs) {
        console.log('未获取几何');
        return;
    }
    // startAnalysis();
};

let limitHeightRenders = <any>null;
let limitHeight = ref(0);
const startAnalysis = () => {
    if (!geoMeshs) return;
    debugger;
    // currGeo.geometry.hasZ = false;
    let newVertices = [];
    for (let k = 0; k < currGeo.geometry.rings[0].length; k++) {
        newVertices.push([currGeo.geometry.rings[0][k][0], currGeo.geometry.rings[0][k][1], 0]);
    }
    var polygon = new Polygon({
        hasZ: false,
        rings: newVertices,
        spatialReference: currGeo.geometry.spatialReference,
    });
    limitHeightRenders = new LimitHight_WallLayer({
        view: toRaw(viewStore.mapInstance),
        externalRenderers,
        Point,
        limitHeight: limitHeight.value,
        analysisMeshs: geoMeshs,
        meshGroup,
        drawPolygon: polygon,
    });
    externalRenderers.add(toRaw(viewStore.mapInstance), limitHeightRenders);
};

let webglRenderer = <any>null;
let webScene = <any>null;
let webCamera = <any>null;
let webAmbient = <any>null;
// TODO
const assignRender = () => {
    webglRenderer = {
        renderer: webglRenderer,
        scene: webScene,
        camera: webCamera,
        // ambient: webAmbient,
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
            webglRenderer.autoClearDepth = false;
            webglRenderer.autoClearStencil = false;
            webglRenderer.autoClearColor = false;

            let originalSetRenderTarget =
                webglRenderer.setRenderTarget.bind(webglRenderer);
            webglRenderer.setRenderTarget = function (target: any) {
                originalSetRenderTarget(target);
                console.log(webglRenderer, 'webglRenderer');
                webglRenderer.state.viewport(
                    new THREE.Vector4(
                        0,
                        0,
                        toRaw(viewStore.mapInstance).width,
                        toRaw(viewStore.mapInstance).height
                    )
                );

                // TODO
                if (target == null) {
                    context.bindRenderTarget();
                }
            }.bind(webglRenderer);
            webScene = new THREE.Scene();
            webCamera = new THREE.PerspectiveCamera();
            webCamera.far = 10000000;
            webAmbient = new THREE.AmbientLight(0xffffff, 1);
            webScene.add(webAmbient);
            debugger;
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

    findLayer = toRaw(viewStore.mapInstance).map.findLayerById('147');
    layerUrl = findLayer.url + '/layers/0';
    /* 解析数据节点 */
    parseModel();
};

const closeLocate = () => {
    // // 菜单恢复初始值
    // if (menuStore.currFunc == 'kgfx') {
    //     menuStore.handleFunc('');
    // }
};

// 监听功能栏子功能点击
// menuStore.$subscribe((mutation, state) => {
//     debugger;
//     if (state.currFunc == 'kgfx') {
//         locateVisible.value = true;
//     } else {
//         locateVisible.value = false;
//     }
// });
</script>

<style scoped lang="scss">
@use './heightcontrol.scss';
</style>
