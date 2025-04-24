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
                    <span class="title-txt">建筑量分析</span>
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
                    <span class="build-label">分析服务</span>
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
                    <el-button type="primary" @click="handleRender"
                        >绘制范围</el-button
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
import * as promiseUtils from '@arcgis/core/core/promiseUtils';

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
    if (menuStore.currFunc == 'jzlfx') {
        menuStore.handleFunc('');
    }
};

/*
    图层选择
    TODO 暂时固定数据
*/
const buildSel = ref<any>(null);
// const buildOptions = ref<any>([
//     {
//         isdig: true,
//         kind: 3,
//         label: '全域建筑白模',
//         level: 3,
//         maptype: 2,
//         opacity: 100,
//         order: 0,
//         pid: 147,
//         range: 'null',
//         uncheck: false,
//         url: 'https://a3d.dpinfo.com.cn/a3d/rest/services/Hosted/fqjz4549/SceneServer',
//         visible: true,
//     },
// ]);
const buildOptions = ref<any>(window.demoBuildObj.options);

/* 绘制范围 */
const sketchTool = ref<any>(null);
const highlightHandle = ref<any>(null);
const groupLayer = ref<any>(null);
const areaTotal = ref<number>(0);
const showResult = ref(false);
const handleRender = async () => {
    if (!Boolean(buildSel.value)) return ElMessage.warning('请先选择地图服务');

    let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
        'buildanalyse'
    );
    if (!findLayer) {
        findLayer = new GraphicsLayer({
            id: 'buildanalyse',
            elevationInfo: {
                mode: 'on-the-ground',
            },
        });
        toRaw(viewStore.mapInstance).map.layers.add(findLayer);
    }
    if (!sketchTool.value) {
        sketchTool.value = new SketchViewModel({
            layer: findLayer,
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
    }

    findLayer.graphics.removeAll();
    highlightHandle.value?.remove();
    highlightHandle.value = null;

    toRaw(sketchTool.value).create('polygon');
    toRaw(sketchTool.value).on('create', (evt: any) => {
        if (evt.state == 'complete') {
            console.log(evt, 'evt');
            let analyseLayer = <any>null;

            toRaw(sketchTool.value).destroy();
            sketchTool.value = null;

            analyseLayer = toRaw(groupLayer.value).findLayerById(
                `build-${buildSel.value.pid}`
            );

            toRaw(viewStore.mapInstance)
                .whenLayerView(analyseLayer)
                .then((layerView: any) => {
                    const query = layerView.createQuery();
                    query.geometry = evt.graphic.geometry;
                    layerView.queryObjectIds(query).then((response: any) => {
                        console.log(response, 'response');
                        highlightHandle.value = layerView.highlight(response);
                    });

                    layerView.queryFeatures(query).then((response: any) => {
                        /*
                            !字段需要接口
                            !面积单位需确定
                            !字段值为number类型
                        */
                        console.log(response, 'response');

                        if (response.features.length > 0) {
                            response.features.map((item: any) => {
                                // areaTotal.value +=
                                //     item.attributes['YDMJ'] *
                                //     Number(item.attributes['实际层']);
                                areaTotal.value +=
                                    item.attributes[
                                        window.demoBuildObj.areafield
                                    ] *
                                    Number(
                                        item.attributes[
                                            window.demoBuildObj.floorfield
                                        ]
                                    );
                            });
                            showResult.value = true;
                        }
                    });
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
    areaTotal.value = 0;
    showResult.value = false;

    let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
        'buildanalyse'
    );
    if (findLayer) {
        findLayer.graphics.removeAll();
        highlightHandle.value?.remove();
        highlightHandle.value = null;
    }
};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'jzlfx') {
        locateVisible.value = true;
    } else {
        locateVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './buildanalyse.scss';
</style>
