<template>
    <div class="container">
        <!-- 顶部表单 -->
        <div class="handle-box">
            <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="addType">新增</el-button>
            <div style="position: absolute;right: 2%;display:inline;">
                <el-upload style="display:inline;padding: 5px;" class="tem-upload" ref="tempUpload" action="action"
                    :http-request="tempUpload" :show-file-list="false" accept=".xlsx">
                    <el-button type="success" size="small" icon="el-icon-upload2">
                        导入数据
                    </el-button>
                </el-upload>
                <el-button type="success" size="small" icon="el-icon-download" @click="ExportExcel">
                    导出数据
                </el-button>
            </div>
            <!-- <el-button type="success" icon="el-icon-upload2" class="handle-del mr10" @click="ImportZB" style="float: right;">导入指标</el-button>
            <el-button type="success" icon="el-icon-download" class="handle-del mr10" @click="ExportZB" style="float: right;">导出指标</el-button> -->
        </div>

        <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"
            row-key="PID" :tree-props="{ children: 'CHILDREN' }" stripe v-loading="tableloading">
            <el-table-column prop="PID" label="ID" width="120" align="center"></el-table-column>
            <el-table-column prop="NAME" label="名称" align="center"></el-table-column>
            <el-table-column prop="STYLE" label="指标类型" align="center">
                <template v-slot="scope">
                    <span v-if="scope.row.STYLE === 1">基本指标</span>
                    <span v-else-if="scope.row.STYLE === 2">推荐指标</span>
                </template>
            </el-table-column>
            <el-table-column prop="ORDERNUM" label="排序" width="100" align="center">
            </el-table-column>

            <el-table-column label="操作" align="center">
                <template v-slot="scope">
                    <el-button type="primary" plain size="mini" v-if="scope.row.CHILDREN == 0 || !scope.row.CHILDREN"
                        @click="handleList(scope.row)">指标列表项</el-button>

                    <el-button type="success" plain size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" plain size="mini" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 新增/编辑弹窗 -->
        <el-dialog :title="setTitle" :visible.sync="setVisible" width="35%" custom-class="set-dialog"
            @close="closedSetDialog" :close-on-click-modal="false">
            <el-form ref="setForm" :model="setForm" label-width="auto" class="set-form" :rules="setFormRules">
                <el-form-item label="指标名称" prop="NAME">
                    <el-input v-model.trim="setForm.NAME" placeholder="请输入指标名称"></el-input>
                </el-form-item>
                <el-form-item label="指标层级" prop="LEVEL">
                    <el-radio-group v-model="setForm.LEVEL">
                        <el-radio :label="1">一级</el-radio>
                        <el-radio :label="2">二级</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="一级列表" v-if="setForm.LEVEL == 2" prop="PARENTID">
                    <el-select v-model="setForm.PARENTID" placeholder="请选择一级列表">
                        <el-option v-for="(item, index) in tableData" :key="index" :label="item.NAME"
                            :value="item.PID"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="指标类型" prop="STYLE">
                    <el-radio-group v-model="setForm.STYLE">
                        <el-radio :label="1">基本指标</el-radio>
                        <el-radio :label="2">推荐指标</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="排序" prop="ORDERNUM">
                    <el-input v-model.number="setForm.ORDERNUM" placeholder="请输入排序" type="number" min="0"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export { default } from '../js/indexmanage';
</script>

<style scoped lang="scss">
@import '../style/indexmanage.scss';
</style>
