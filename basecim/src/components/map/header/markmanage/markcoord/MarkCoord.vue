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
                    <span class="title-txt">标注坐标</span>
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
                <ul class="main-ul">
                    <li v-for="item in coordList" :key="item.pid">
                        <span class="coord-label">
                            X：{{ item.x.toFixed(2) }}, Y：{{
                                item.y.toFixed(2)
                            }}, Z：{{ item.z.toFixed(2) }}
                        </span>
                        <span>
                            <el-tooltip
                                content="定位"
                                placement="bottom"
                                effect="light"
                            >
                                <i
                                    class="iconfont icon-dingwei"
                                    @click="locateCoord(item)"
                                ></i>
                            </el-tooltip>
                            <el-tooltip
                                content="删除"
                                placement="bottom"
                                effect="light"
                            >
                                <i
                                    class="iconfont icon-shanchu"
                                    @click="delCoord(item)"
                                ></i>
                            </el-tooltip>
                        </span>
                    </li>
                </ul>
                <el-pagination
                    v-model:current-page="currentPage"
                    small
                    background
                    layout="prev, pager, next"
                    :total="coordTotal"
                    @current-change="handlePageSize"
                />
                <div>
                    <el-button type="primary" @click="handleMark"
                        >标注坐标</el-button
                    >
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, reactive, watch, toRaw, onMounted } from 'vue';
import useStore from '@/stores';

/* ArcGIS API */
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import SceneLayer from '@arcgis/core/layers/SceneLayer.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';

/* UI 相关 */
import {
    ElMessage,
    type FormInstance,
    type FormRules,
    ElMessageBox,
} from 'element-plus';

/* API */
import { getDataApi, saveCoordApi, delCoordApi } from './markcoord-api';

const { menuStore, viewStore, mapStore } = useStore();

const locateVisible = ref(false);

const closeLocate = () => {
    // 菜单恢复初始值
    if (menuStore.currFunc == 'bzzb') {
        menuStore.handleFunc('');
    }
    clickEvent.value?.remove();
    toRaw(viewStore.mapInstance).graphics.removeAll();
};

/* 坐标列表 */
const coordList = ref<any>([]);
const coordTotal = ref<number>();

/* 获取坐标列表 */
const getCoordData = async () => {
    let params = {
        page: currentPage.value,
        paseSize: 10,
    };
    const { data: res } = await getDataApi(params);
    console.log(res, 'res');
    coordList.value = res.data.records;
    coordTotal.value = res.data.total;
};

/* 定位坐标 */
const locateCoord = (item: any) => {
    let symbolPt = {
        type: 'simple-marker',
        color: [255, 255, 255],
        size: 5,
        outline: {
            color: [255, 0, 0],
            width: 3,
        },
    };

    // 点符号
    let symbol = {
        type: 'point-3d',
        verticalOffset: {
            screenLength: 40,
        },
        callout: {
            type: 'line',
            size: 1.5,
            color: [255, 255, 255, 1],
        },
        symbolLayers: [
            // {
            //     type: 'icon',
            //     size: 10,
            //     resource: {
            //         primitive: 'circle',
            //     },
            //     material: {
            //         color: [255, 255, 255],
            //     },
            //     outline: {
            //         color: [255, 0, 0],
            //         size: 5,
            //     },
            // },
            {
                type: 'text',
                size: 14,
                text: `X:${item.x.toFixed(2)}，Y:${item.y.toFixed(
                    2
                )}，Z:${item.z.toFixed(2)}`,
                material: {
                    color: 'yellow',
                },
                background: {
                    color: [0, 0, 0, 0.7],
                },
            },
        ],
    };

    let point = new Point({
        x: item.x,
        y: item.y,
        z: item.z,
        spatialReference: {
            wkid: toRaw(viewStore.mapInstance).spatialReference.wkid,
        },
    });

    let graphic = new Graphic({
        symbol,
        geometry: point,
    } as any);

    let graphicPt = new Graphic({
        symbol: symbolPt,
        geometry: point,
    });

    toRaw(viewStore.mapInstance).graphics.removeAll();
    toRaw(viewStore.mapInstance).graphics.addMany([graphic, graphicPt]);
    toRaw(viewStore.mapInstance).goTo(graphic);
};

/* 删除坐标 */
const delCoord = async (item: any) => {
    console.log(item, 'item');
    const { data: res } = await delCoordApi(item.pid);
    if (res.code !== 200) return ElMessage.warning(res.msg);
    ElMessage.success(res.msg);
    getCoordData();
};

/* 坐标列表分页点击 */
const currentPage = ref(1);
const handlePageSize = (val: number) => {
    getCoordData();
};

/* 标注坐标 */
const clickEvent = ref();
const handleMark = () => {
    clickEvent.value?.remove();
    clickEvent.value = toRaw(viewStore.mapInstance).on(
        'click',
        async (evt: any) => {
            console.log(evt.mapPoint, 'mapPoint');
            let symbolPt = {
                type: 'simple-marker',
                color: [255, 255, 255],
                size: 5,
                outline: {
                    color: [255, 0, 0],
                    width: 3,
                },
            };

            // 点符号
            let symbol = {
                type: 'point-3d',
                verticalOffset: {
                    screenLength: 40,
                },
                callout: {
                    type: 'line',
                    size: 1.5,
                    color: [255, 255, 255, 1],
                },
                symbolLayers: [
                    // {
                    //     type: 'icon',
                    //     size: 10,
                    //     resource: {
                    //         primitive: 'circle',
                    //     },
                    //     material: {
                    //         color: [255, 255, 255],
                    //     },
                    //     outline: {
                    //         color: [255, 0, 0],
                    //         size: 5,
                    //     },
                    // },
                    {
                        type: 'text',
                        size: 14,
                        text: `X:${evt.mapPoint.x.toFixed(
                            2
                        )}，Y:${evt.mapPoint.y.toFixed(
                            2
                        )}，Z:${evt.mapPoint.z.toFixed(2)}`,
                        material: {
                            color: 'yellow',
                        },
                        background: {
                            color: [0, 0, 0, 0.7],
                        },
                    },
                ],
            };

            let point = new Point({
                x: evt.mapPoint.x,
                y: evt.mapPoint.y,
                z: evt.mapPoint.z,
                spatialReference: {
                    wkid: evt.mapPoint.spatialReference.wkid,
                },
            });

            let graphic = new Graphic({
                symbol,
                geometry: point,
            } as any);

            let graphicPt = new Graphic({
                symbol: symbolPt,
                geometry: point,
            });
            toRaw(viewStore.mapInstance).graphics.removeAll();
            toRaw(viewStore.mapInstance).graphics.addMany([graphic, graphicPt]);

            let data = {
                x: evt.mapPoint.x,
                y: evt.mapPoint.y,
                z: evt.mapPoint.z,
                wkid: evt.mapPoint.spatialReference.wkid,
            };
            const { data: res } = await saveCoordApi(data);
            if (res.code !== 200) return ElMessage.warning(res.msg);
            getCoordData();
        }
    );
};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'bzzb') {
        locateVisible.value = true;
        getCoordData();
    } else {
        locateVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './markcoord.scss';
</style>
