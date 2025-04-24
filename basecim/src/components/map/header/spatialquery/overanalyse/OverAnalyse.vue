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
                    <span class="title-txt">叠加分析</span>
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
                    <div class="tool-label">模型服务</div>
                    <el-select
                        v-model="currSel"
                        value-key="pid"
                        @change="changeServe"
                    >
                        <el-option
                            v-for="item in selList"
                            :label="item.label"
                            :value="item"
                            :key="item.pid"
                        ></el-option>
                    </el-select>
                </div>
                <div class="tool-item">
                    <div class="tool-label">矢量数据</div>
                    <el-upload
                        class="upload-demo"
                        action="#"
                        accept=".txt,.dwg,.zip"
                        :show-file-list="false"
                        :http-request="handleUpload"
                    >
                        <el-button type="primary">上传文件</el-button>
                    </el-upload>
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
import { ElMessage, ElLoading } from 'element-plus';

/* ArcGIS API */
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import Graphic from '@arcgis/core/Graphic.js';
import { union } from '@arcgis/core/geometry/geometryEngine.js';

/* API */
import { initLayerByKind } from '@/utils/common-map';
import { uploadApi } from './overanalyse-api';

const { menuStore, viewStore, mapStore } = useStore();

/* 弹窗相关 */
const dialogVisible = ref(false);
const closeDialog = () => {
    currSel.value = null;
    if (groupLayer) {
        toRaw(viewStore.mapInstance).map.remove(groupLayer);
        toRaw(viewStore.mapInstance).graphics.removeAll();
        groupLayer.destroy();
        groupLayer = null;
    }
    // 菜单恢复初始值
    if (menuStore.currFunc == 'djfx') {
        menuStore.handleFunc('');
    }
};

/* 上传文件 */
const handleUpload: any = async (params: any) => {
    let formData = new FormData();
    formData.append('file', params.file);

    const loading = ElMessage({
        message: '文件上传解析中',
        grouping: true,
        type: 'warning',
        duration: 0,
    });

    const { data: res } = await uploadApi(formData);
    loading.close();
    if (res.code !== 200) return ElMessage.warning(res.msg);
    const geo = createGraphic(res.data, toRaw(viewStore.mapInstance));
    if (geo) {
        toRaw(viewStore.mapInstance).graphics.removeAll();
        toRaw(viewStore.mapInstance).graphics.add(geo);
        toRaw(viewStore.mapInstance).extent = geo.geometry.extent;
        toRaw(viewStore.mapInstance).zoom -= 2;
    }
};

/* 创建图形 */
const createGraphic = (pointData: any, view: any) => {
    // 多地块(*)
    if (pointData.indexOf('*') > 0) {
        let geo = <any>null;
        let pointArr = pointData.split('*');
        console.log(pointArr, 'pointArr');

        pointArr.map((item: any) => {
            let pointItems = item.split(';');
            let pt = new Array();
            pointItems.map((subItem: any) => {
                if (subItem) {
                    let point = new Array();
                    point.push(Number(subItem.split(',')[0]));
                    point.push(Number(subItem.split(',')[1]));
                    pt.push(point); // 点数组
                }
            });

            let polygonJSON = {
                rings: pt,
                spatialReference: {
                    wkid: view.spatialReference.wkid,
                },
            };

            let polygon = new Polygon(polygonJSON);

            if (geo == null) {
                geo = polygon;
            } else {
                geo = union([geo, polygon]);
            }
        });
        let graphic = new Graphic({
            geometry: geo,
            symbol: {
                type: 'simple-fill',
                color: [255, 255, 0, 0.2],
                style: 'solid',
                outline: {
                    color: 'red',
                    width: 2,
                },
            },
        } as any);

        return graphic;
    }
    // 单地块
    else {
        let pt = new Array();
        let pointItems = pointData.split(';');
        pointItems.map((item: any) => {
            let point = new Array();
            point.push(Number(item.split(',')[0]));
            point.push(Number(item.split(',')[1]));
            pt.push(point); // 点数组
        });

        let polygonJSON = {
            rings: pt,
            spatialReference: {
                wkid: view.spatialReference.wkid,
            },
        };

        let polygon = new Polygon(polygonJSON);

        let graphic = new Graphic({
            geometry: polygon,
            symbol: {
                type: 'simple-fill',
                color: [255, 255, 0, 0.2],
                style: 'solid',
                outline: {
                    color: 'red',
                    width: 2,
                },
            },
        } as any);

        return graphic;
    }
};

/* 模型选择列表 */
let groupLayer = <any>null;
const currSel = ref<any>();
const selList = ref<any>(window.overData);
const changeServe = async (obj: any) => {
    console.log(obj, 'obj');
    if (!groupLayer) {
        groupLayer = new GroupLayer({
            id: 'overgroup',
            visibilityMode: 'exclusive',
        });
        toRaw(viewStore.mapInstance).map.add(groupLayer);
    }

    /* 避免与主图层重复 */
    let showLayer = groupLayer.findLayerById(`over-${currSel.value.pid}`);
    if (!showLayer) {
        let obj = Object.assign({}, currSel.value, {
            pid: `over-${currSel.value.pid}`,
        });
        showLayer = await initLayerByKind(obj, true);
        groupLayer.add(showLayer, currSel.value.order);
    } else {
        showLayer.visible = true;
    }
};

/* 监听功能栏子功能点击 */
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'djfx') {
        dialogVisible.value = true;
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './overanalyse.scss';
</style>
