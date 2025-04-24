<template>
    <div></div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import useStore from '@/stores';

/* UI 相关 */
import { ElMessage } from 'element-plus';

const { menuStore, viewStore, mapStore } = useStore();

/* 监听功能栏子功能点击 */
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'fx') {
        ElMessage.warning('此模块正在开发中，即将上线');
        menuStore.handleFunc('');
    } else {
        // 后续补充
    }
});
</script>
