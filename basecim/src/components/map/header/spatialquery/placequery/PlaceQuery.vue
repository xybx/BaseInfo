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
                    <span class="title-txt">地名查询</span>
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
                <div class="tool-item">
                    <div class="search-box">
                        <span class="tool-label">地名查询</span>
                        <el-input
                            v-model.trim="inputVal"
                            placeholder="请输入地名"
                            clearable
                        />
                        <el-button
                            :icon="Search"
                            type="primary"
                            @click="handleSearch"
                        ></el-button>
                    </div>
                    <div class="res-box" v-loading="resLoading">
                        <el-select
                            v-model="currSel"
                            placeholder="请选择查询类型"
                            @change="changeSel"
                        >
                            <el-option
                                v-for="item in selOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                        <ul v-if="showResult" class="res-ul">
                            <el-scrollbar>
                                <li
                                    v-for="item in liData"
                                    :key="item.id"
                                    @click="clickLi(item)"
                                >
                                    {{ item.label }}
                                </li>
                            </el-scrollbar>
                        </ul>
                        <div v-else>暂无数据</div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, reactive, watch, toRaw, onMounted, nextTick } from 'vue';
import useStore from '@/stores';

/* UI 相关 */
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

/* ArcGIS API */
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import * as find from '@arcgis/core/rest/find.js';
import FindParameters from '@arcgis/core/rest/support/FindParameters.js';
import Graphic from '@arcgis/core/Graphic.js';
import TextSymbol from '@arcgis/core/symbols/TextSymbol.js';
import Extent from '@arcgis/core/geometry/Extent';

/* 其他 */
import pointImg from '@/assets/images/map-images/point.gif';

const { menuStore, viewStore, mapStore } = useStore();

const inputVal = ref<string>('');
const handleSearch = () => {
    if (!inputVal.value) return ElMessage.warning('查询内容不能为空');
    resLoading.value = true;
    selOptions.value = [];
    let findIndex = 0;
    let geometryIndex = 0;
    findResult(findIndex, geometryIndex);
};
const resLoading = ref<boolean>(false);

let userLayer = <any>null;
const findResult = async (findIndex: number, geometryIndex: number) => {
    if (findIndex == 0) {
        userLayer = new GraphicsLayer();
    }
    var layerids = Array.from(new Set(window.placeData[findIndex].childlist));
    let findParams = new FindParameters({
        layerIds: layerids,
        searchFields: window.placeData[findIndex].childfield,
        searchText: inputVal.value,
        outSpatialReference: {
            wkid: toRaw(viewStore.mapInstance).spatialReference.wkid,
        },
        returnGeometry: true,
    } as any);
    // debugger;
    let result = await find.find(window.placeData[findIndex].url, findParams);
    console.log(result, 'result');
    if (result != null) {
        if (result.results.length > 0) {
            // 图层名称
            let obj = new Object() as any;
            obj.value = result.results[0].layerName;
            obj.label = result.results[0].layerName;
            obj.children = [];
            // 数据liData
            result.results.map((i: any) => {
                let b = {
                    value: i.value,
                    label: i.feature.attributes[
                        window.placeData[findIndex].showfield
                    ],
                    index: geometryIndex,
                    geometrytype: i.feature.geometry.type,
                };
                obj.children.push(b);
                // 临时保存图形
                let symbol;
                switch (i.feature.geometry.type) {
                    case 'polygon':
                        symbol = {
                            type: 'simple-fill',
                            color: [255, 255, 0, 0.2],
                            style: 'solid',
                            outline: {
                                color: 'red',
                                width: 2,
                            },
                        };
                        break;
                    case 'polyline':
                        symbol = {
                            type: 'simple-line',
                            color: 'red',
                            width: 2,
                            style: 'solid',
                        };
                        break;
                    case 'point':
                        symbol = {
                            type: 'picture-marker',
                            url: pointImg,
                            width: '50px',
                            height: '50px',
                        } as any;
                        break;
                    default:
                        break;
                }
                let g = new Graphic({
                    geometry: i.feature.geometry,
                    attributes: i.feature.attributes,
                    symbol,
                });
                userLayer.graphics.add(g);
                geometryIndex++;
            });
            selOptions.value.push(obj);
            currSel.value = selOptions.value[0].label;
            debugger;
            liData.value = selOptions.value[0].children;
            resLoading.value = false;
            findIndex++;
            if (findIndex < window.placeData.length) {
                findResult(findIndex, geometryIndex);
            }
        } else {
            resLoading.value = false;
        }
    } else {
        findIndex++;
        if (findIndex < window.placeData.length) {
            findResult(findIndex, geometryIndex);
        }
    }
    showResult.value = true;
};

const clickLi = (item: any) => {
    toRaw(viewStore.mapInstance).graphics.removeAll();
    let graphic = userLayer.graphics.items[item.index];

    // 创建标记位置
    let g = new Graphic({
        geometry: graphic.geometry,
        symbol: graphic.symbol,
    });
    toRaw(viewStore.mapInstance).graphics.add(g);

    // 创建标记文字
    let text = new TextSymbol({
        text: item.label,
        font: { size: '16px' },
        color: [255, 0, 0],
        yoffset:
            graphic.geometry.type == 'polygon' ||
            graphic.geometry.type == 'polyline'
                ? 0
                : -25,
    });
    let geo =
        graphic.geometry.type == 'polygon' ||
        graphic.geometry.type == 'polyline'
            ? graphic.geometry.extent.center
            : graphic.geometry;

    let g_text = new Graphic({ geometry: geo, symbol: text });
    toRaw(viewStore.mapInstance).graphics.add(g_text);

    if (
        graphic.geometry.type == 'polygon' ||
        graphic.geometry.type == 'polyline'
    ) {
        toRaw(viewStore.mapInstance).extent = graphic.geometry.extent;
        toRaw(viewStore.mapInstance).zoom =
            toRaw(viewStore.mapInstance).zoom - 2;
    }

    if (graphic.geometry.type == 'point') {
        let extent = new Extent({
            xmin: graphic.geometry.x - 200,
            ymin: graphic.geometry.y - 200,
            xmax: graphic.geometry.x + 200,
            ymax: graphic.geometry.y + 200,
            spatialReference: {
                wkid: toRaw(viewStore.mapInstance).spatialReference.wkid,
            },
        });
        toRaw(viewStore.mapInstance).extent = extent;
    }
};

/* 查询类型 */
const currSel = ref<any>();
const showResult = ref(false);
const changeSel = () => {
    showResult.value = true;
};
const selOptions = ref<any>([]);
const liData = ref<any>([]);

/* 弹窗 */
const dialogVisible = ref(false);
const closeDialog = () => {
    showResult.value = false;
    currSel.value = null;
    inputVal.value = '';
    // 清除图形
    toRaw(viewStore.mapInstance).graphics.removeAll();

    // 菜单恢复初始值
    if (menuStore.currFunc == 'dmcx') {
        menuStore.handleFunc('');
    }
};

/* 监听功能栏子功能点击 */
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'dmcx') {
        dialogVisible.value = true;
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './placequery.scss';
</style>
