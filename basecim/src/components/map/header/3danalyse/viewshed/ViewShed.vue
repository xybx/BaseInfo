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
                    <span class="title-txt">视廊分析</span>
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
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet.js';
import LinearUnit from '@arcgis/core/rest/support/LinearUnit.js';
import * as geoprocessor from '@arcgis/core/rest/geoprocessor.js';

/* UI 相关 */
import { ElMessage } from 'element-plus';

/* 其他 */
import * as THREE from 'three';

const { menuStore, viewStore, mapStore } = useStore();

/* 弹窗 */
const dialogVisible = ref(false);
const closeDialog = () => {
    // 菜单恢复初始值
    // if (menuStore.currFunc == 'slfx') {
    //     menuStore.handleFunc('');
    // }
};

/* 绘制视线 */
let sketchLayer = <any>null;
let sketchTool = <any>null;
let gpUrl =
    'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed';
const handleRender = () => {
    /* 绘制图层 */
    if (!sketchLayer) {
        sketchLayer = new GraphicsLayer({
            id: 'drawsketch',
            // elevationInfo: {
            //     mode: 'on-the-ground',
            // },
        });
        toRaw(viewStore.mapInstance).map.add(sketchLayer);
    }

    if (!sketchTool) {
        sketchTool = new SketchViewModel({
            layer: sketchLayer,
            view: toRaw(viewStore.mapInstance),
            pointSymbol: {
                type: 'simple-marker',
                style: 'circle',
                size: 6,
                color: [255, 0, 0],
                outline: {
                    color: [50, 50, 50],
                    width: 1,
                },
            },
        });
    }

    sketchLayer.graphics.removeAll();
    sketchTool.cancel();
    sketchTool.create('point');
    sketchTool.on('create', async (evt: any) => {
        if (evt.state === 'complete') {
            console.log(evt, 'evt');
            sketchTool.destroy();
            sketchTool = null;

            // 观察点
            const inputGraphicContainer = [];
            inputGraphicContainer.push(evt.graphic);

            const featureSet = new FeatureSet();
            featureSet.features = inputGraphicContainer;

            // 视野范围
            const vsDistance = new LinearUnit();
            vsDistance.distance = 50;
            vsDistance.units = 'meters';

            const params = {
                Input_Observation_Point: featureSet,
                Viewshed_Distance: vsDistance,
            };
            const options = {
                outSpatialReference: {
                    wkid: 4549,
                },
            } as any;
            const res = await geoprocessor.execute(gpUrl, params, options);
            console.log(res, 'res');
        }
    });
};

/* 绘制视线（起点、终点） */
const drawEvent = () => {};

/* 清除 */
const clearRender = () => {};

/* 监听功能栏子功能点击 */
menuStore.$subscribe((mutation, state) => {
    // if (state.currFunc == 'slfx') {
    //     dialogVisible.value = true;
    // } else {
    //     dialogVisible.value = false;
    // }
});
</script>

<style scoped lang="scss">
@use './viewshed.scss';
</style>
