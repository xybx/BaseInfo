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
                    <span class="title-txt">缓冲区分析</span>
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
                        <span class="build-label">分析图层</span>
                        <el-select
                            v-model="currServe"
                            placeholder="请选择服务"
                            @change="changeServe"
                            value-key="pid"
                        >
                            <el-option
                                v-for="item in serveOptions"
                                :key="item.pid"
                                :label="item.label"
                                :value="item"
                            />
                        </el-select>
                    </div>
                    <div>
                        <span class="build-label">缓冲距离</span>
                        <el-slider v-model="wideValue" @change="changeWide" />
                    </div>
                    <div>
                        <el-radio-group v-model="bufferType">
                            <el-radio-button label="点" />
                            <el-radio-button label="线" />
                            <el-radio-button label="面" />
                        </el-radio-group>
                    </div>
                </div>

                <div>
                    <el-button type="primary" @click="handleRender"
                        >绘制范围</el-button
                    >
                    <el-button type="warning" @click="clearRender"
                        >清除</el-button
                    >
                </div>
                <div class="result-box" v-if="showResult">
                    <div>
                        <span class="res-label">涉及数量：</span>
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
// TODO 得用geometryService计算服务地址,geometryEngine使用的是自带的
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic.js';
import * as promiseUtils from '@arcgis/core/core/promiseUtils.js';

/* API */
import { initLayerByKind } from '@/utils/common-map';

const { menuStore, viewStore, mapStore } = useStore();

/* 缓冲区绘制类型 */
const wideValue = ref(0);
const bufferType = ref('点');
const currServe = ref<any>(null);
const serveOptions = ref<any>(window.demoBuildObj.options);

/* 服务下拉选择 */
let groupLayer = <any>null;
const changeServe = async (obj: any) => {
    console.log(obj, 'obj');
    if (!groupLayer) {
        groupLayer = new GroupLayer({
            id: 'buffergroup',
            visibilityMode: 'exclusive',
        });
        toRaw(viewStore.mapInstance).map.add(groupLayer);
    }

    /* 避免与主图层重复 */
    let showLayer = groupLayer.findLayerById(`buffer-${currServe.value.pid}`);
    if (!showLayer) {
        let obj = Object.assign({}, currServe.value, {
            pid: `buffer-${currServe.value.pid}`,
        });
        showLayer = await initLayerByKind(obj, true);
        groupLayer.add(showLayer, currServe.value.order);
    } else {
        showLayer.visible = true;
    }
};

/* val:缓冲距离 */
let sketchGeometryDiff = <any>null;
const changeWide = promiseUtils.debounce((val: any) => {
    if (!sketchGeometry) return;
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
                                outline: { color: 'yellow' },
                                pattern: {
                                    type: 'style',
                                    style: 'cross',
                                },
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
        highlightHandle = sceneLayerView.highlight(response);
    });

    sceneLayerView.queryFeatures(query).then((response: any) => {
        /*
            !字段需要接口
        */
        console.log(response, 'response');
        if (response.features.length > 0) {
            // response.features.map((item: any) => {
            //     areaTotal.value +=
            //         item.attributes[window.demoBuildObj.areafield] *
            //         Number(item.attributes[window.demoBuildObj.floorfield]);
            // });
            buildCount.value = response.features.length;

            showResult.value = true;
        }
    });
};

/* 绘制范围 */
let sketchLayer = <any>null;
let bufferLayer = <any>null;
let sketchTool = <any>null;
let sketchGeometry = <any>null;
let highlightHandle = <any>null;
let sceneLayerView = <any>null;
const showResult = ref(false);
const buildCount = ref(0);
const handleRender = () => {
    if (!Boolean(currServe.value)) return ElMessage.warning('请先选择分析图层');

    /* 绘制图层 */
    if (!sketchLayer) {
        sketchLayer = new GraphicsLayer({
            id: 'drawsketch',
            elevationInfo: {
                mode: 'on-the-ground',
            },
        });
        toRaw(viewStore.mapInstance).map.layers.add(sketchLayer);
    }

    /* 缓冲图层 */
    if (!bufferLayer) {
        bufferLayer = new GraphicsLayer({
            id: 'buffersketch',
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
                        // outline: { color: 'yellow' },
                        // pattern: {
                        //     type: 'style',
                        //     style: 'cross',
                        // },
                    },
                ],
            },
            polylineSymbol: {
                type: 'simple-line',
                color: [255, 0, 0],
                width: 2,
            },
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
        } as any);
    }

    sketchLayer.graphics.removeAll();
    bufferLayer.graphics.removeAll();
    sketchTool.cancel();
    highlightHandle?.remove();
    highlightHandle = null;
    switch (bufferType.value) {
        case '点':
            sketchTool.create('point');
            break;
        case '线':
            sketchTool.create('polyline');
            break;
        case '面':
            sketchTool.create('polygon');
            break;
        default:
            break;
    }

    sketchTool.on('create', (evt: any) => {
        if (evt.state === 'complete') {
            console.log(evt, 'evt');
            sketchGeometry = evt.graphic.geometry;

            sketchTool.destroy();
            sketchTool = null;

            let analyseLayer = groupLayer.findLayerById(
                `buffer-${currServe.value.pid}`
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

/* 清除范围 */
const clearRender = () => {
    showResult.value = false;
    highlightHandle?.remove();
    highlightHandle = null;
    sketchLayer?.removeAll();
    bufferLayer?.removeAll();
    sketchGeometry = null;
};

/* 弹窗相关 */
const dialogVisible = ref(false);
const closeDialog = () => {
    if (groupLayer) {
        toRaw(viewStore.mapInstance).map.remove(groupLayer);
        groupLayer = null;
    }
    currServe.value = null;
    wideValue.value = 0;
    clearRender();
    // 菜单恢复初始值
    if (menuStore.currFunc == 'hcqfx') {
        menuStore.handleFunc('');
    }
};

/* 监听功能栏子功能点击 */
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'hcqfx') {
        dialogVisible.value = true;
    } else {
        // 后续补充
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './bufferanalyse.scss';
</style>
