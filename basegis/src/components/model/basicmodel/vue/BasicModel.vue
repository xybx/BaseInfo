<!--
 * @Author: WCL
 * @Date: 2022-01-13 10:05:27
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-28 17:04:36
 * @FilePath: \webgis\src\components\model\basicmodel\vue\BasicModel.vue
 * @Description: 模型管理-基础配置
-->
<template>
    <div class="basicmodel-container">
        <div class="title">
            数据源列表
            <span class="add-btns">
                <el-button type="primary" size="mini" @click="addSJY"
                    >新增数据源</el-button
                >
            </span>
        </div>
        <div class="table-box">
            <el-table
                :data="sjyTableData"
                stripe
                border
                size="small"
                :default-sort="{ prop: 'pid', order: 'descending' }"
                v-loading="SJYloading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
            >
                <el-table-column
                    prop="ID"
                    sortable
                    label="序号"
                    align="center"
                    min-width="80"
                >
                </el-table-column>
                <el-table-column
                    prop="NAME"
                    label="数据源名称"
                    align="center"
                    min-width="200"
                >
                </el-table-column>
                <el-table-column
                    prop="SERVER"
                    label="ip地址"
                    align="center"
                    min-width="150"
                >
                </el-table-column>
                <el-table-column
                    prop="USERNAME"
                    label="用户名"
                    align="center"
                    min-width="120"
                >
                </el-table-column>
                <!-- <el-table-column label="密码" align="center" min-width="150">
                    ***
                </el-table-column> -->
                <el-table-column
                    prop="INSTANCE"
                    label="数据库名称"
                    align="center"
                    min-width="200"
                >
                </el-table-column>
                <el-table-column label="操作" align="center" min-width="150">
                    <template v-slot="scope">
                        <el-button
                            type="primary"
                            size="mini"
                            plain
                            @click="handleSJYEdit(scope.row)"
                            >编辑</el-button
                        >
                        <el-popconfirm
                            confirm-button-text="确定"
                            cancel-button-text="取消"
                            icon="el-icon-info"
                            icon-color="#f56c6c"
                            title="确定删除此条数据吗?"
                            @confirm="confirmSJYDel(scope.row)"
                        >
                            <el-button
                                slot="reference"
                                type="danger"
                                size="mini"
                                plain
                                class="del-btn"
                                >删除</el-button
                            >
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-pagination
            background
            @size-change="handleSizeChangeTop"
            @current-change="handleCurrentChangeTop"
            :current-page.sync="currentPageTop"
            :page-size="pagesizeTop"
            :page-sizes="pagesizeArrTop"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalTop"
        >
        </el-pagination>

        <!-- 新增/编辑数据源弹窗 -->
        <el-dialog
            title="数据源"
            :visible.sync="SJYVisible"
            :close-on-click-modal="false"
            custom-class="addSLdialog"
            @closed="closeSJY"
            width="30%"
            v-dialogDrag
        >
            <el-form
                :model="SJYForm"
                ref="SJYForm"
                size="small"
                label-width="auto"
                :rules="SJYRules"
            >
                <el-form-item label="数据源名称" prop="NAME">
                    <el-input
                        v-model="SJYForm.NAME"
                        placeholder="请输入数据源名称"
                    ></el-input>
                </el-form-item>
                <el-form-item label="ip地址" prop="SERVER">
                    <el-input
                        v-model="SJYForm.SERVER"
                        placeholder="请输入ip地址"
                    ></el-input>
                </el-form-item>
                <el-form-item label="用户名" prop="USERNAME">
                    <el-input
                        v-model="SJYForm.USERNAME"
                        placeholder="请输入用户名"
                    ></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="PASSWORD">
                    <el-input
                        v-model="SJYForm.PASSWORD"
                        placeholder="请输入密码"
                        type="password"
                    ></el-input>
                </el-form-item>
                <el-form-item label="数据库名称" prop="DATABASE">
                    <el-input
                        v-model="SJYForm.DATABASE"
                        placeholder="请输入数据库名称"
                    ></el-input>
                </el-form-item>
                <div class="btns">
                    <el-button
                        type="warning"
                        size="small"
                        @click="SJYVisible = false"
                        >取消</el-button
                    >
                    <el-button type="primary" size="small" @click="saveSJY"
                        >保存</el-button
                    >
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
export { default } from '../js/basicmodel';
</script>

<style scoped lang="scss">
@import '../style/basicmodel.scss';
</style>
