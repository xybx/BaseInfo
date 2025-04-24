<template>
    <transition name="el-fade-in-linear">
        <div id="project-hy" v-if="menuStore.proShow?.code === 'fahy'">
            <div
                v-for="(item, index) in hyList"
                :key="index"
                class="pro-item"
                @click="handleClick(item)"
            >
                <i class="iconfont" :class="item.icon"></i>
                <span>{{ item.label }}</span>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, toRaw, nextTick, reactive } from 'vue';
import useStore from '@/stores';

/* ArcGIS API */
import Query from '@arcgis/core/rest/support/Query.js';
import * as query from '@arcgis/core/rest/query.js';
import GroupLayer from '@arcgis/core/layers/GroupLayer.js';

/* API */
import { getHyLayerApi } from '@/components/map/header/planconsult/projectmanage/components/schemeintro/schemeintro-api';
import { ElMessage } from 'element-plus';
import { initLayerByKind } from '@/utils/common-map';

const { menuStore, viewStore, mapStore, iconProjectStore } = useStore();

/* 方案汇演 */
const hyList = ref<any>([
    {
        icon: 'icon-chaxun',
        label: '上位规划',
        pid: 1,
    },
    {
        icon: 'icon-liucheng',
        label: '配套分析',
        pid: 2,
    },
    {
        icon: 'icon-huo',
        label: '消防分析',
        pid: 3,
    },
    {
        icon: 'icon-lujingfenxi',
        label: '出入口',
        pid: 4,
    },
]);

/* 模块点击 */
let currOverArr = ref<any>([]);
let groupLayer = <any>null;
const handleClick = async (item: any) => {
    if (!groupLayer) {
        groupLayer = new GroupLayer({
            id: 'schemeGroup',
            visibilityMode: 'inherited',
        });
        toRaw(viewStore.mapInstance).map.add(groupLayer);
    }
    groupLayer.removeAll();
    console.log(currOverArr.value, 'currOverArr.value');

    if (currOverArr.value.length && currOverArr.value.length > 0) {
        currOverArr.value.map((item: any) => {
            menuStore.treeRef.value.setChecked(item, false, true);
        });

        menuStore.handleProAddArr([]);
    }

    let params = {
        schemeId: menuStore.proShow.moduleid,
        demoType: item.pid,
    };
    const { data: res } = await getHyLayerApi(params);
    if (res.code !== 200) return ElMessage.warning(res.msg);
    if (res.data.length == 0) return ElMessage.warning('没有相关数据');
    res.data.map(async (item: any) => {
        console.log(item, '配置图层');
        // 三维叠加服务
        if (item.mapType === 2) {
            menuStore.treeRef.value.setCurrentKey(item.pid, true);
            menuStore.treeRef.value.setChecked(item.pid, true, true);
            currOverArr.value.push(item.pid);
        }
        // 二维从服务里根据方案ID查询
        else {
            let initLayer = await initLayerByKind(item, true);
            initLayer.definitionExpression = `${item.searchField} = '${item.schemeId}'`;
            groupLayer.add(initLayer);
        }
    });

    // 添加到pinia
    menuStore.handleProAddArr(currOverArr);
    console.log(currOverArr, 'currOverArr');
};

/* 弹窗 */
const dialogVisible = ref<boolean>(false);
const closeDialog = () => {
    // 菜单恢复初始值
    if (menuStore.proShow?.code == 'fahy') {
        menuStore.handleProShow(
            Object.assign(menuStore.proShow, { isShow: false })
        );
    }
};

/* 当前方案 */
let currScheme = ref<any>(null);

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    if (state.proShow?.code == 'fahy') {
        dialogVisible.value = true;
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './schemehy.scss';
</style>
