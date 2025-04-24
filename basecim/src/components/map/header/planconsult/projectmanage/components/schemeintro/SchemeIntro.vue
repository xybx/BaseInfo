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
                    <span class="title-txt">方案简介</span>
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
            <el-scrollbar>
                <div class="tool-main">
                    {{ text }}
                </div>
            </el-scrollbar>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, toRaw, nextTick, reactive, onMounted } from 'vue';
import useStore from '@/stores';

const { menuStore } = useStore();

/* 弹窗 */
const dialogVisible = ref<boolean>(false);
const closeDialog = () => {
    // 菜单恢复初始值
    if (menuStore.proShow?.code == 'fajj') {
        menuStore.handleProShow(
            Object.assign(menuStore.proShow, { isShow: false })
        );
    }
};

let text = ref('');
// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    if (state.proShow?.code == 'fajj') {
        dialogVisible.value = true;
        text.value = state.proShow.intro;
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './schemeintro.scss';
</style>
