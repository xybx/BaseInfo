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
                    <span class="title-txt">图文关联</span>
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
                <el-tree :data="treeData" :props="defaultProps">
                    <template #default="{ node, data }">
                        <span class="custom-tree-node" v-if="data.path == ''">
                            <el-icon>
                                <Files />
                            </el-icon>
                            <span>{{ data.name }}</span>
                        </span>
                        <span
                            class="custom-tree-node"
                            v-else
                            @click="lookFile(data)"
                        >
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span>{{ data.name }}</span>
                        </span>
                    </template>
                </el-tree>
            </div>
        </el-dialog>
    </div>

    <div class="iframe">
        <el-dialog
            v-model="dialogVisibleiFrame"
            title="在线预览"
            class="iframeDialog"
            width="71%"
        >
            <iframe
                :src="iframeSrc"
                frameborder="0"
                height="100%"
                width="100%"
            ></iframe>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, toRaw, nextTick, reactive } from 'vue';
import useStore from '@/stores';

/* API */
import { getLayerFileApi } from '../layer-api';

/* 其他 */
import { Base64 } from 'js-base64';

const { menuStore, viewStore, mapStore } = useStore();

/* 父节点传入参数 */
//let props = defineProps(["layerId"]);
/*
    树结构
    treeType:1 文件夹；2 文件
*/
let dialogVisibleiFrame = ref(false);
const treeData = ref([
    {
        label: '基本农田数据',
        treeType: 1,
        children: [
            {
                label: '文档1',
                treeType: 2,
            },
            {
                label: '文档2',
                treeType: 2,
            },
            {
                label: '文档3',
                treeType: 2,
            },
            {
                label: '文档4',
                treeType: 2,
            },
        ],
    },
]);
const defaultProps = {
    children: 'childList',
    label: 'name',
};

//获取图文列表
const getTreeData = async () => {
    let currentLayer = toRaw(menuStore.currentLayer);
    console.log(toRaw(menuStore.currentLayer), 'menuStore.currentLayer.value');
    const { data: res } = await getLayerFileApi({ layerId: currentLayer.pid });
    console.log(res, 'res');
    treeData.value = res.data;
};

let iframeSrc = ref('');
//在线预览文件
const lookFile = (data: any) => {
    debugger;
    //let Base64 = require('js-base64').Base64;
    console.log(data, 'data');
    console.log(!data.url, 'data');
    if (data.url != '') {
        console.log(window.kkfileVersion, 'kkfileVersion');
        dialogVisibleiFrame.value = true;
        if (window.kkfileVersion === 1) {
            // kkfileview 4.0版本
            iframeSrc.value =
                window.previewURL +
                encodeURIComponent(
                    Base64.encode(window.apiResource + '/' + data.url)
                );
            console.log(iframeSrc.value);
        } else {
            console.log(window.apiResource + '/' + data.url);
            // kkfileview 2.2.1 版本
            iframeSrc.value =
                window.previewURL +
                encodeURIComponent(window.apiResource + '/' + data.url);
        }
    }
};

/* 弹窗 */
const dialogVisible = ref<boolean>(false);

/* 关闭弹窗 */
const closeDialog = () => {
    // 菜单恢复初始值
    if (menuStore.currFunc == 'twgl') {
        menuStore.handleFunc('');
    }
};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'twgl') {
        dialogVisible.value = true;
        getTreeData();
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './layerlink.scss';
</style>
