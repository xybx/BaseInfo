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
                    <span class="title-txt">控制指标</span>
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
                    <el-table :data="tableData" border stripe size="small">
                        <el-table-column
                            prop="name"
                            label="名称"
                            align="center"
                            min-width="100"
                        />
                        <el-table-column
                            prop="standard"
                            label="控制标准"
                            align="center"
                        />
                        <el-table-column
                            prop="count"
                            label="计算值"
                            align="center"
                        />
                        <el-table-column
                            prop="result"
                            label="结果"
                            align="center"
                        />
                    </el-table>
                </div>
            </el-scrollbar>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, toRaw, nextTick, reactive } from 'vue';
import useStore from '@/stores';
import { getprojectsIndexs } from '@/components/map/header/planconsult/projectmanage/components/schemeintro/schemeintro-api';
const { menuStore, viewStore, mapStore } = useStore();

const tableData = ref<any>([]);

/* 弹窗 */
const dialogVisible = ref<boolean>(false);
const closeDialog = () => {
    // 菜单恢复初始值
    if (menuStore.proShow?.code == 'kzzb') {
        menuStore.handleProShow(
            Object.assign(menuStore.proShow, { isShow: false })
        );
    }
};

// 监听功能栏子功能点击
menuStore.$subscribe(async (mutation, state) => {
    debugger;
    if (state.proShow?.code == 'kzzb' && state.proShow?.isShow) {
        tableData.value = [];
        console.log(state.proShow);
        let { data } = await getprojectsIndexs({
            schemeId: state.proShow.moduleid,
            indexType: 1,
        });
        console.log(data);
        data.data.forEach((item: any) => {
            tableData.value.push({
                name: item.indexName,
                standard: item.standardValue,
                count: item.indexValue,
                result:
                    item.indexValue > item.standardValue ? '符合' : '不符合',
            });
        });
        dialogVisible.value = true;
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './controlindex.scss';
</style>
