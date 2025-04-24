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
                    <span class="title-txt">道路拓宽</span>
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
                <div class="build-form">
                    <div>
                        <span class="build-label">建筑图层</span>
                        <el-select
                            v-model="buildSel"
                            placeholder="请选择服务"
                            @change="changeBuild"
                            value-key="pid"
                        >
                            <el-option
                                v-for="item in buildOptions"
                                :key="item.pid"
                                :label="item.label"
                                :value="item"
                            />
                        </el-select>
                    </div>
                    <div>
                        <span class="build-label">拓宽距离</span>
                        <el-slider v-model="wideValue" @change="changeWide" />
                    </div>
                </div>

                <div>
                    <el-button type="primary" @click="handleRender"
                        >绘制道路</el-button
                    >
                    <el-button type="warning" @click="clearRender"
                        >清除</el-button
                    >
                </div>
                <div class="result-box" v-if="showResult">
                    <div>
                        <span class="res-label">建筑总量：</span>
                        <span class="res-val"
                            >{{ areaTotal.toFixed(2) }} m²</span
                        >
                    </div>
                    <div>
                        <span class="res-label">建筑数量：</span>
                        <span class="res-val">{{ buildCount }} 个</span>
                    </div>
                </div>
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
import GroupLayer from '@arcgis/core/layers/GroupLayer.js';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic.js';
import * as promiseUtils from '@arcgis/core/core/promiseUtils.js';

/* API */
import { initLayerByKind } from '@/utils/common-map';

const { menuStore, viewStore, mapStore } = useStore();

const locateVisible = ref(false);

const closeLocate = () => {
    if (groupLayer.value) {
        toRaw(viewStore.mapInstance).map.remove(toRaw(groupLayer.value));
        groupLayer.value = null;
    }
    buildSel.value = null;
    clearRender();
    // 菜单恢复初始值
    if (menuStore.currFunc == 'dltk') {
        menuStore.handleFunc('');
    }
};

/*
    图层选择
    TODO 暂时固定数据、功能未完成
*/
const buildSel = ref<any>(null);
const buildOptions = ref<any>(window.demoBuildObj.options);

const wideValue = ref(0);
let sketchGeometryDiff = <any>null;
/*
    val:拓宽距离
*/
const changeWide = promiseUtils.debounce((val: any) => {
    if (!sketchGeometry) return;
    console.log(val, 'wideval');
    if (val > 0) {
        const bufferGeometry = geometryEngine.buffer(
            sketchGeometry,
            val,
            'meters'
        );

        const sketchGeometryUnion = geometryEngine.union([
            bufferGeometry,
            sketchGeometry,
        ]);

        sketchGeometryDiff = geometryEngine.difference(
            sketchGeometryUnion,
            sketchGeometry
        );
        console.log(sketchGeometryDiff, 'sketchGeometryDiff');

        if (bufferLayer.graphics.length === 0) {
            bufferLayer.add(
                new Graphic({
                    geometry: bufferGeometry,
                    symbol: {
                        type: 'polygon-3d',
                        symbolLayers: [
                            {
                                type: 'fill',
                                material: { color: 'yellow' },
                                // outline: { color: 'yellow' },
                                // pattern: {
                                //     type: 'style',
                                //     style: 'cross',
                                // },
                            },
                        ],
                    },
                } as any)
            );
        } else {
            bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
        }
    } else {
        bufferLayer.removeAll();
        highlightHandle?.remove();
        highlightHandle = null;
        sketchGeometryDiff = null;
        showResult.value = false;
    }

    return promiseUtils.eachAlways([updateSceneLayer()]);
});

/* 更新 */
const updateSceneLayer = () => {
    if (!sketchGeometryDiff) {
        return;
    }

    if (highlightHandle) {
        highlightHandle.remove();
        highlightHandle = null;
    }

    const query = sceneLayerView.createQuery();
    query.geometry = sketchGeometryDiff;
    sceneLayerView.queryObjectIds(query).then((response: any) => {
        console.log(response, 'response');
        highlightHandle = sceneLayerView.highlight(response);
    });

    sceneLayerView.queryFeatures(query).then((response: any) => {
        /*
            !字段需要接口
        */
        console.log(response, 'response');
        if (response.features.length > 0) {
            response.features.map((item: any) => {
                areaTotal.value +=
                    item.attributes[window.demoBuildObj.areafield] *
                    Number(item.attributes[window.demoBuildObj.floorfield]);
            });
            buildCount.value = response.features.length;

            showResult.value = true;
        }
    });
};

/* 绘制范围 */
let highlightHandle = <any>null;
const groupLayer = ref<any>(null);
const areaTotal = ref<number>(0);
const showResult = ref(false);
const buildCount = ref<number>(0);
let bufferLayer = <any>null;
let sketchLayer = <any>null;
let sceneLayerView = <any>null;
let sketchTool = <any>null;
let sketchGeometry = <any>null;
const handleRender = async () => {
    if (!Boolean(buildSel.value)) return ElMessage.warning('请先选择建筑图层');

    /* 绘制图层 */
    if (!sketchLayer) {
        sketchLayer = new GraphicsLayer({
            id: 'roadsketch',
            elevationInfo: {
                mode: 'on-the-ground',
            },
        });
        toRaw(viewStore.mapInstance).map.layers.add(sketchLayer);
    }

    /* 缓冲图层 */
    if (!bufferLayer) {
        bufferLayer = new GraphicsLayer({
            id: 'roadbuffer',
            elevationInfo: {
                mode: 'on-the-ground',
            },
        });
        toRaw(viewStore.mapInstance).map.layers.add(bufferLayer);
    }

    /* 绘制工具 */
    if (!sketchTool) {
        sketchTool = new SketchViewModel({
            layer: sketchLayer,
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
            polylineSymbol: {
                type: 'simple-line',
                color: [255, 0, 0],
                width: 2,
            },
        } as any);
    }

    sketchLayer.graphics.removeAll();
    bufferLayer.graphics.removeAll();

    toRaw(sketchTool).create('polyline');
    toRaw(sketchTool).on('create', (evt: any) => {
        if (evt.state == 'complete') {
            sketchGeometry = evt.graphic.geometry;
            console.log(evt, 'evt');

            let analyseLayer = <any>null;
            sketchTool.destroy();
            sketchTool = null;

            analyseLayer = toRaw(groupLayer.value).findLayerById(
                `build-${buildSel.value.pid}`
            );

            console.log(analyseLayer, 'analyseLayer');

            toRaw(viewStore.mapInstance)
                .whenLayerView(analyseLayer)
                .then((layerView: any) => {
                    sceneLayerView = layerView;
                    changeWide(wideValue.value);
                });
        }
    });
};

/* 下拉框选择事件 */
const changeBuild = async (obj: any) => {
    console.log(obj, 'obj');

    if (!groupLayer.value) {
        groupLayer.value = new GroupLayer({
            id: 'buildGroupLayer',
            visibilityMode: 'exclusive',
        });
        toRaw(viewStore.mapInstance).map.add(toRaw(groupLayer.value));
    }

    /* 避免与主图层重复 */
    let showLayer = toRaw(groupLayer.value).findLayerById(
        `build-${buildSel.value.pid}`
    );
    if (!showLayer) {
        let obj = Object.assign({}, buildSel.value, {
            pid: `build-${buildSel.value.pid}`,
        });
        showLayer = await initLayerByKind(obj, true);
        toRaw(groupLayer.value).add(showLayer, buildSel.value.order);
    } else {
        showLayer.visible = true;
    }
};

/* 清除范围 */
const clearRender = () => {
    showResult.value = false;
    wideValue.value = 0;

    highlightHandle?.remove();
    highlightHandle = null;
    sketchLayer?.removeAll();
    bufferLayer?.removeAll();
    sketchGeometry = null;
};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'dltk') {
        locateVisible.value = true;
    } else {
        locateVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './roadwide.scss';
</style>
