<template>
    <div class="container">
        <div class="left">
            <el-menu default-active="2" class="el-menu1">
                <el-menu-item index="2">
                    <i class="el-icon-menu"></i>
                    <span slot="title">总体规划</span>
                </el-menu-item>
                <el-menu-item index="3">
                    <i class="el-icon-document"></i>
                    <span slot="title">专项规划</span>
                </el-menu-item>
            </el-menu>
        </div>
        <div class="right">
            <div class="form-box">
                <el-input v-model="inputVal" placeholder="请输入关键字">
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>

                <el-button type="primary">上传审查依据</el-button>
            </div>
            <el-table
                :data="tableData"
                row-key="id"
                border
                default-expand-all
                :tree-props="{
                    children: 'children',
                    hasChildren: 'hasChildren',
                }"
            >
                <el-table-column prop="date" label="项目名称">
                </el-table-column>
                <el-table-column label="组织单位" align="center">
                </el-table-column>
                <el-table-column label="编制单位" align="center">
                </el-table-column>
                <el-table-column label="审查阶段" align="center">
                </el-table-column>
                <el-table-column label="创建时间" align="center">
                </el-table-column>
                <el-table-column label="审查状态" align="center">
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template v-slot="scope">
                        <el-button type="text" @click="handleExam(scope)"
                            >启动机器审查</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 审查方案弹窗 -->
        <el-dialog
            title="审查方案"
            :visible.sync="dialogVisible"
            width="30%"
            :before-close="handleClose"
        >
            <div>
                <div class="dialog-left">
                    <el-tree :data="treeData" :props="defaultProps"></el-tree>
                </div>
                <div class="dialog-right">
                    <div></div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false"
                    >开始审查</el-button
                >
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            inputVal: '',
            tableData: [
                {
                    id: 1,
                    date: '空间一致性',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄',
                },
                {
                    id: 2,
                    date: '2016-05-04',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1517 弄',
                },
                {
                    id: 3,
                    date: '空间一致性',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1519 弄',
                    children: [
                        {
                            id: 31,
                            date: '城镇开发边界',
                            name: '王小虎',
                            address: '上海市普陀区金沙江路 1519 弄',
                        },
                        {
                            id: 32,
                            date: '2016-05-01',
                            name: '王小虎',
                            address: '上海市普陀区金沙江路 1519 弄',
                        },
                    ],
                },
                {
                    id: 4,
                    date: '2016-05-03',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1516 弄',
                },
            ],
            dialogVisible: false,
            treeData: [
                {
                    label: '一级 1',
                    children: [
                        {
                            label: '二级 1-1',
                            children: [
                                {
                                    label: '三级 1-1-1',
                                },
                            ],
                        },
                    ],
                },
                {
                    label: '一级 2',
                    children: [
                        {
                            label: '二级 2-1',
                            children: [
                                {
                                    label: '三级 2-1-1',
                                },
                            ],
                        },
                        {
                            label: '二级 2-2',
                            children: [
                                {
                                    label: '三级 2-2-1',
                                },
                            ],
                        },
                    ],
                },
                {
                    label: '一级 3',
                    children: [
                        {
                            label: '二级 3-1',
                            children: [
                                {
                                    label: '三级 3-1-1',
                                },
                            ],
                        },
                        {
                            label: '二级 3-2',
                            children: [
                                {
                                    label: '三级 3-2-1',
                                },
                            ],
                        },
                    ],
                },
            ],
            defaultProps: {
                children: 'children',
                label: 'label',
            },
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {
        handleExam(scope) {
            console.log(scope, 'scope');
            this.dialogVisible = true;
        },
        handleClose() {},
    },
};
</script>

<style scoped lang="scss">
@import '../style/figureconsist.scss';
</style>
