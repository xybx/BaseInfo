<!--
 * @Author: LJX
 * @Date: 2023-04-19 09:37:10
 * @LastEditors: LJX
 * @LastEditTime:2023-04-19 10:09:54
 * @FilePath: \webgis\src\views\model\indexmanage\vue\Indexmenu.vue
 * @Description: 指标管理
-->
<template>
    <div class="modelmanage-container">
        <div class="table-contain animate__animated">
        <div class="left-menu">
                <el-menu :default-active="activeIndex" class="el-menu-vertical-demo" mode="vertical" @select="handleSelect">
                    <el-menu-item :index="item.id" v-for="(item, index) in modelRadioData" :key="index" :label="item.label">
                        <i :class="item.icon"></i>
                        {{
                            item.label
                        }}</el-menu-item>
                    <!-- <el-menu-item index="1">处理中心</el-menu-item>
            									 <el-menu-item index="2">处理中心</el-menu-item> -->

                </el-menu>
            </div>
            <div class="right-table">
                <div class="manage-inbox">
                    <div class="content">
                        <index-manage v-if="activeIndex === '1'"></index-manage>
                        <system-manage v-else-if="activeIndex === '2'"></system-manage>
                        <value-manage v-else="activeIndex==='3'"></value-manage>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import IndexManage from './IndexManage.vue';
import SystemManage from './SystemManage.vue';
import ValueManage from './ValueManage.vue';
export default {
    name: '',
    props: {},
    components: { IndexManage, SystemManage,ValueManage },
    data() {
        return {
            activeIndex: '1',
            // modelRadio:'1',
            modelRadioData: [
                { label: '指标管理', id: "1", icon: 'el-icon-s-operation' },
                { label: '指标体系管理', id: "2", icon: 'el-icon-box' },
                { label: '指标值管理', id: "3", icon: 'el-icon-cpu' },
            ],
        };
    },
    computed: {},
    watch: {},
    created() { },
    mounted() {
        this.activeIndex = this.modelRadioData[0].id;
    },
    methods: {
        handleSelect(key, keyPath) {
            this.activeIndex = key;
            // console.log(key, keyPath);
        }
    },
};

</script>

<style scoped lang="scss">
.modelmanage-container {
    height: 100%;
    background-color: #f2f5fa;
    padding: 10px;
    box-sizing: border-box;
}

.table-contain {
    flex: 1;
    display: flex;

    .left-menu {
        width: 130px;
        height: 100%;
        margin-right: 10px;

        .el-menu {
            width: 100%;

            .el-menu-item {
                padding: 0 !important;
                // text-align: center;
            }
        }
    }

    .right-table {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-x: auto;
    }

    :deep(.el-table) {
        .cell {
            font-size: 15px;
        }

        .el-button {
            font-size: 13px;
        }

        .el-button--mini {
            padding: 0.265vw 0.381vw;
        }
    }

    .manage-inbox {
        height: 100%;
        background-color: #fff;
        padding: 10px;
        display: flex;
        flex-direction: column;

        .el-radio-group {
            margin-bottom: 10px;
        }

        .content {
            height: 81.796vh;
        }
    }
}
</style>