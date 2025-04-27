<template>
    <div class="container">
        <div class="tree">
            <div class="cont-head">方案目录</div>
            <div class="input-box">
                <el-input
                    placeholder="输入关键字进行搜索"
                    v-model="filterText"
                    size="small"
                >
                </el-input>
            </div>
            <el-tree
                :data="treeData"
                :props="defaultProps"
                ref="gistTree"
                :filter-node-method="filterNode"
                @node-click="handleTree"
                :expand-on-click-node="false"
            ></el-tree>
        </div>
        <div class="table">
            <!-- <el-button icon="el-icon-plus" type="primary" class="add-top-btn"
                >新增要点分类</el-button
            > -->
            <el-table
                :data="tableData"
                row-key="ID"
                border
                :tree-props="{
                    children: 'Items',
                }"
                default-expand-all
            >
                <el-table-column prop="Name" label="名称"> </el-table-column>
                <el-table-column label="要点配置" align="center">
                    <template v-slot="scope">
                        <!-- <el-button type="text" disabled>新增</el-button>
                        <el-button type="text" disabled>删除</el-button> -->
                        <el-button
                            type="text"
                            v-if="scope.row.Isleaf === 1"
                            @click="handleEdit(scope.row)"
                            >修改</el-button
                        >
                    </template>
                </el-table-column>
                <el-table-column label="要点使用" align="center">
                    <template v-slot="scope">
                        <el-switch
                            v-model="scope.row.IsEnabled"
                            active-color="#2d559d"
                            inactive-color="#ff4949"
                            :active-value="1"
                            :inactive-value="0"
                            v-if="scope.row.Isleaf === 1"
                            @change="changePoint($event, scope.row)"
                        >
                        </el-switch>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 修改要点名称 -->
        <el-dialog
            title="要点修改"
            :visible.sync="dialogPoint"
            width="30%"
            class="edit-dialog"
            @closed="closeDialog"
            v-dialogDrag
            :close-on-click-modal="false"
        >
            <el-form
                :model="editForm"
                :rules="editFormRule"
                ref="editFormRef"
                label-width="auto"
            >
                <el-form-item label="要点名称" prop="Name">
                    <el-input
                        v-model.trim="editForm.Name"
                        autocomplete="off"
                        placeholder="请输入要点名称"
                        size="small"
                    ></el-input>
                </el-form-item>

                <div class="dialog-footer">
                    <el-button
                        type="primary"
                        @click="handleEditForm"
                        size="small"
                        >保 存</el-button
                    >
                    <el-button
                        size="small"
                        type="warning"
                        @click="dialogPoint = false"
                        >取消</el-button
                    >
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
export { default } from '../js/spaceconsist';
</script>

<style scoped lang="scss">
@import '../style/spaceconsist.scss';
</style>
