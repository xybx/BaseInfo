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
                    <span class="title-txt">漫游导览</span>
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
                <el-form :model="form">
                    <el-form-item label="漫游模式" prop="mode">
                        <el-select v-model="form.mode">
                            <el-option
                                v-for="item in modeList"
                                :key="item.pid"
                                :label="item.label"
                                :value="item.pid"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="高度" prop="height">
                        <el-input v-model="form.height" />
                    </el-form-item>
                    <el-form-item label="速度" prop="speed">
                        <el-input v-model="form.speed" />
                    </el-form-item>
                    <el-form-item label="视角" prop="view">
                        <el-select v-model="form.view" placeholder="请选择视角">
                            <el-option label="跟随视角" :value="1" />
                            <el-option label="固定视角" :value="2" />
                        </el-select>
                    </el-form-item>
                    <div class="btn-box">
                        <el-button type="primary">开始预览</el-button>
                        <el-button type="warning">结束</el-button>
                    </div>
                </el-form>
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

const { menuStore, viewStore, mapStore } = useStore();

/* 漫游表单 */
const form = reactive({
    mode: '',
    height: null,
    speed: null,
    view: 1,
});
const modeList = ref<any>([
    {
        pid: 1,
        label: '飞行',
    },
    {
        pid: 2,
        label: '步行',
    },
    {
        pid: 3,
        label: '驾驶',
    },
]);

/* 弹窗 */
const dialogVisible = ref(false);
const closeDialog = () => {
    // 菜单恢复初始值
    if (menuStore.currFunc == 'mydl') {
        menuStore.handleFunc('');
    }
};

/* 监听功能栏子功能点击 */
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'mydl') {
        dialogVisible.value = true;
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './wanderguide.scss';
</style>
