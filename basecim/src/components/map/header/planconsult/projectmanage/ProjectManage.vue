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
            class="tool-basemap"
            @close="closeDialog"
        >
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">项目管理</span>
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

            项目列表：
            <el-select
                v-model="proListValue"
                filterable
                placeholder="请选择项目"
                @change="getSchemeData"
                value-key="pid"
            >
                <el-option
                    v-for="item in options"
                    :key="item.pid"
                    :label="item.name"
                    :value="item"
                />
            </el-select>

            <el-scrollbar>
                <div class="tool-main">
                    <div v-if="projectList.length == 0">
                        <el-empty description="暂无方案" />
                    </div>
                    <div
                        v-for="(item, index) in projectList"
                        :key="index"
                        class="tool-item"
                    >
                        <div class="item-label">{{ item.name }}</div>
                        <div class="tool-body">
                            <div class="tool-l">
                                <el-image
                                    fit="cover"
                                    :src="returnUrl(item) as any"
                                ></el-image>
                            </div>
                            <div class="tool-r">
                                <el-button
                                    v-for="(subItem, subIndex) in scemesOptions"
                                    :key="subIndex"
                                    type="primary"
                                    size="small"
                                    @click="handleClick(subItem, item)"
                                    >{{ subItem.label }}</el-button
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, toRaw, nextTick, reactive, onMounted } from 'vue';
import useStore from '@/stores';

/* ArcGIS API */
import SliceViewModel from '@arcgis/core/widgets/Slice/SliceViewModel.js';
import SliceAnalysis from '@arcgis/core/analysis/SliceAnalysis.js';
import * as projection from '@arcgis/core/geometry/projection.js';
import Point from '@arcgis/core/geometry/Point.js';
import Graphic from '@arcgis/core/Graphic.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import SceneModifications from '@arcgis/core/layers/support/SceneModifications.js';
import SceneModification from '@arcgis/core/layers/support/SceneModification.js';
import Query from '@arcgis/core/rest/support/Query.js';
import * as query from '@arcgis/core/rest/query.js';
import GroupLayer from '@arcgis/core/layers/GroupLayer.js';

/* API */
import {
    getProjectsList,
    getprojectsSchemes,
    getBindLayerApi,
    getHyLayerApi,
} from '@/components/map/header/planconsult/projectmanage/components/schemeintro/schemeintro-api';
import { initLayerByKind } from '@/utils/common-map';
import { ElMessage } from 'element-plus';

const { menuStore, viewStore, mapStore } = useStore();

let scemesOptions = ref([
    {
        label: '方案简介',
        code: 'fajj',
        isShow: false,
    },
    {
        label: '三维模型',
        code: 'swmx',
        isShow: false,
    },
    {
        label: '控制指标',
        code: 'kzzb',
        isShow: false,
    },
    {
        label: '经济指标',
        code: 'jjzb',
        isShow: false,
    },
    {
        label: '方案汇演',
        code: 'fahy',
        isShow: false,
    },
]);

//选择的项目
let proListValue = ref<any>();

/* 获取项目列表 */
const getProData = async () => {
    const { data: res } = await getProjectsList({ searchKey: '' });
    if (res.code !== 200) return ElMessage.warning(res.msg);
    options = res.data;
    proListValue.value = options[0];
};

/* 获取方案 */
const getSchemeData = async () => {
    const { data: res } = await getprojectsSchemes({
        projectId: proListValue.value.pid,
    });
    if (res.code !== 200) return ElMessage.warning(res.msg);
    projectList.value = res.data;
};

const handleClick = (subItem: any, item: any) => {
    // 三维模型
    if (subItem.code === 'swmx') {
        getRedLayer(item);
        menuStore.handleProShow(
            Object.assign(subItem, {
                name: item.name,
                intro: item.intro,
                moduleid: item.pid,
            })
        );
    }
    // 方案汇演
    else if (subItem.code === 'fahy') {
        // 第一次点击
        if (!menuStore.proShow) {
            let findBIM = toRaw(viewStore.mapInstance).map.findLayerById(
                String(currLayerId)
            );
            if (!findBIM || !findBIM.visible)
                return ElMessage.warning('请先选择三维模型');
        }
        // 不同方案点击
        else if (menuStore.proShow.moduleid != item.pid) {
            console.log('不同方案点击', currLayerId);
            console.log('已叠加的图层树服务', menuStore.proAddArr);
            if (menuStore.proAddArr.value?.length > 0) {
                menuStore.proAddArr.value.map((item: any) => {
                    menuStore.treeRef.value.setChecked(item, false, true);
                });
            }
            menuStore.handleProAddArr([]);

            if (currLayerId) {
                menuStore.treeRef.value.setChecked(currLayerId, false, true);
            }
            // 取消倾斜摄影压平
            let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
                String(proListValue.value.layerId)
            );
            if (findLayer) {
                findLayer.modifications?.removeAll();
            }

            // 标注图层组清除
            let labelGroup = toRaw(viewStore.mapInstance).map.findLayerById(
                'schemeGroup'
            );
            if (labelGroup) {
                labelGroup.removeAll();
            }

            currLayerId = null;
            console.log(currLayerId, 'currLayerId');

            let findBIM = toRaw(viewStore.mapInstance).map.findLayerById(
                String(currLayerId)
            );

            if (!findBIM || !findBIM.visible)
                return ElMessage.warning('请先选择三维模型');
            menuStore.handleProShow(
                Object.assign(subItem, {
                    name: item.name,
                    intro: item.intro,
                    moduleid: item.pid,
                })
            );
        } else {
            // 标注图层组清除
            let labelGroup = toRaw(viewStore.mapInstance).map.findLayerById(
                'schemeGroup'
            );
            if (labelGroup) {
                labelGroup.removeAll();
            }
            let findBIM = toRaw(viewStore.mapInstance).map.findLayerById(
                String(currLayerId)
            );
            console.log(findBIM, 'findBIM');
            if (!findBIM) return ElMessage.warning('请先选择三维模型');
            menuStore.handleProShow(
                Object.assign(subItem, {
                    name: item.name,
                    intro: item.intro,
                    moduleid: item.pid,
                })
            );
        }
    }
    // 其他指标
    else {
        subItem.isShow = true;
        menuStore.handleProShow(
            Object.assign(subItem, {
                name: item.name,
                intro: item.intro,
                moduleid: item.pid,
            })
        );
    }
};

/* 初始化 */
const initLayer = () => {
    // 自动选中并展开图层树-倾斜摄影
    menuStore.treeRef.value.setCurrentKey(proListValue.value.layerId, true);
    menuStore.treeRef.value.setChecked(proListValue.value.layerId, true, true);
    if (!groupLayer) {
        groupLayer = new GroupLayer({
            id: 'projectGroup',
            visibilityMode: 'exclusive',
        });
        toRaw(viewStore.mapInstance).map.add(groupLayer);
    }
};

/*
    获取方案红线范围
    根据方案ID
*/
let groupLayer = <any>null;
let redOpts = <any>null;
let currLayerId = <any>null;
const getRedLayer = async (schemeItem: any) => {
    const { data: res } = await getBindLayerApi({ schemeId: schemeItem.pid });
    if (res.code !== 200) return ElMessage.warning(res.msg);
    if (res.data.length == 0) {
        ElMessage.warning('当前方案没有模型服务');
        groupLayer?.removeAll();
        if (menuStore.proAddArr.value?.length > 0) {
            menuStore.proAddArr.value.map((item: any) => {
                menuStore.treeRef.value.setChecked(item, false, true);
            });
        }
        menuStore.handleProAddArr([]);

        if (currLayerId) {
            menuStore.treeRef.value.setChecked(currLayerId, false, true);
        }
        // 标注图层组清除
        let labelGroup = toRaw(viewStore.mapInstance).map.findLayerById(
            'schemeGroup'
        );
        if (labelGroup) {
            labelGroup.removeAll();
        }
        // 取消倾斜摄影压平
        let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
            String(proListValue.value.layerId)
        );
        if (findLayer) {
            findLayer.modifications.removeAll();
        }
        // 用地范围红线删除
        toRaw(viewStore.mapInstance).graphics.removeAll();
    } else {
        res.data.map(async (item: any) => {
            // 用地范围线
            if (item.kind == 2) {
                // redUrl = item.url;
                redOpts = item;
            }
            // BIM
            // 当前BIM服务ID赋值给currLayerId
            else {
                menuStore.treeRef.value.setChecked(currLayerId, false, true);
                currLayerId = item.pid;
                menuStore.treeRef.value.setCurrentKey(item.pid, true);
                menuStore.treeRef.value.setChecked(item.pid, true, true);
                getReplace(item);
            }
        });
    }
};

/* 压平 */
const getReplace = async (item: any) => {
    let bimLayer = await initLayerByKind(item, true);
    toRaw(viewStore.mapInstance).goTo(bimLayer.fullExtent);

    // 先固定字段
    let queryParams = new Query({
        where: `${redOpts.searchField}= '${redOpts.schemeId}'`,
        returnGeometry: true,
        outFields: ['*'],
    });

    const result = await query.executeQueryJSON(redOpts.url, queryParams);
    if (result && result.features.length > 0) {
        let geo = result.features[0].geometry;
        let polygon = geo.clone() as any;
        polygon.hasZ = true;
        polygon.rings.map((item: any) => {
            item.map((subItem: any) => {
                subItem.push(bimLayer.fullExtent.zmin);
            });
        });

        let modifications = new SceneModifications([
            new SceneModification({ geometry: polygon, type: 'replace' }),
        ]);

        let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
            String(proListValue.value.layerId)
        );
        findLayer.modifications = modifications;
    } else {
        ElMessage.warning('没有当前用地范围数据');
    }
};

/* 弹窗 */
const dialogVisible = ref<boolean>(false);
const closeDialog = () => {
    menuStore.handleProShow('');
    groupLayer?.removeAll();

    if (menuStore.proAddArr.value?.length > 0) {
        menuStore.proAddArr.value.map((item: any) => {
            menuStore.treeRef.value.setChecked(item, false, true);
        });
    }
    menuStore.handleProAddArr([]);

    // 标注图层组清除
    let labelGroup = toRaw(viewStore.mapInstance).map.findLayerById(
        'schemeGroup'
    );
    if (labelGroup) {
        labelGroup.removeAll();
    }

    let findBIM = toRaw(viewStore.mapInstance).map.findLayerById(
        String(currLayerId)
    );
    if (findBIM) {
        findBIM.visible = false;
        menuStore.treeRef.value.setChecked(Number(findBIM.id), false, true);
    }

    // 取消倾斜摄影压平
    let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
        String(proListValue.value.layerId)
    );
    if (findLayer) {
        findLayer.modifications?.removeAll();
        menuStore.treeRef.value.setChecked(Number(findLayer.id), false, true);
    }
    // 用地范围红线删除
    toRaw(viewStore.mapInstance).graphics.removeAll();

    // 菜单恢复初始值
    if (menuStore.currFunc == 'xmgl') {
        menuStore.handleFunc('');
    }
};

const returnUrl = (item: any) => {
    return window.apiResource + item.thumbnailUrl;
};

let options: any = reactive([]);
let projectList = ref<any>([]);

// 监听功能栏子功能点击
menuStore.$subscribe(async (mutation, state) => {
    if (state.currFunc == 'xmgl') {
        dialogVisible.value = true;
        await getProData();
        await getSchemeData();
        initLayer();
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './projectmanage.scss';
</style>
