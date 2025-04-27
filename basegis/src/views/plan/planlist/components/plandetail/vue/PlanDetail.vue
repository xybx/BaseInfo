<!--
 * @Author: WCL
 * @Date: 2021-12-28 11:02:37
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-16 10:58:30
 * @FilePath: \webgis\src\views\plan\planlist\components\plandetail\vue\PlanDetail.vue
 * @Description: 项目列表-详细阶段记录
-->
<template>
    <div class="admin-container">
        <div class="animate__animated animate__fadeIn add-box">
            <div class="prj-name">
                当前规划成果 -【 {{ $route.query.name }}】阶段列表
                <i
                    class="el-icon-s-fold"
                    title="返回成果列表"
                    style="font-size: larger; cursor: pointer"
                    @click="reback"
                ></i>
            </div>
            <el-button
                type="primary"
                size="small"
                icon="el-icon-plus"
                @click="addItem"
                >上传阶段审查成果</el-button
            >
        </div>
        <div class="table-contain animate__animated animate__fadeIn">
            <el-table
                :data="tableData"
                border
                stripe
                :default-sort="{ prop: 'PID', order: 'descending' }"
                v-loading="loading"
                size="small"
                row-key="PID"
                :tree-props="{ children: 'children' }"
                default-expand-all
            >
                <el-table-column
                    prop="PID"
                    label="序号"
                    min-width="70"
                    sortable
                    align="center"
                ></el-table-column>
                <el-table-column
                    prop="JDNAME"
                    label="审查阶段"
                    min-width="120"
                    align="center"
                >
                    <template v-slot="scope">
                        <el-input
                            v-model.trim="scope.row.JDNAME"
                            size="small"
                            v-if="scope.row.isread"
                            ref="stage"
                        >
                            <el-button
                                slot="append"
                                size="small"
                                type="primary"
                                @click="changeStageName(scope.row)"
                                >保存</el-button
                            >
                        </el-input>

                        <span v-else>{{ scope.row.JDNAME }}</span>
                    </template>
                </el-table-column>

                <el-table-column
                    prop="BZUNIT"
                    label="编制单位"
                    min-width="180"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="WTUNIT"
                    label="委托单位"
                    min-width="150"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="WTDEPT"
                    label="委托部门"
                    min-width="100"
                    align="center"
                >
                </el-table-column>
                <!-- <el-table-column prop="GHFW" label="规划范围" min-width="350" align="center">
						</el-table-column> -->
                <el-table-column
                    prop="GHAREA"
                    label="规划面积(平方公里)"
                    min-width="100"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="CREATETIME"
                    label="创建时间"
                    min-width="135"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="UPDATETIME"
                    label="更新时间"
                    min-width="135"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="SC_NUMDESC"
                    label="审查轮次"
                    min-width="80"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="SC_DATE"
                    label="审查时间"
                    min-width="135"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="SC_STATUSNAME"
                    label="审查状态"
                    min-width="100"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    label="操作"
                    min-width="350"
                    align="center"
                    class-name="handle-col"
                >
                    <template slot-scope="scope">
                        <!-- <el-upload class="upload" ref="upload" action="action" :http-request="handleUpload" accept=".zip"
									:show-file-list="false">
									<el-button type="success" size="mini" title="更新成果包会替换掉原来的成果包，成果包必须是zip文件" plain
										@click="uploadFile(scope.row)">更新成果包</el-button>
								</el-upload> -->
                        <el-button
                            @click="handleReslut(scope.row, false)"
                            type="success"
                            plain
                            size="mini"
                            >成果管理</el-button
                        >
                        <el-button
                            v-if="scope.row.SC_STATUS == 0"
                            size="mini"
                            type="primary"
                            plain
                            @click="handleDetail(scope.row, true)"
                            >修改</el-button
                        >

                        <el-button
                            v-if="scope.row.SC_STATUS == 0"
                            @click="handleReview(scope.row)"
                            type="warning"
                            plain
                            size="mini"
                            >审查</el-button
                        >
                        <el-button
                            v-if="scope.row.SC_STATUS >= 2"
                            type="success"
                            plain
                            size="mini"
                            @click="handleConclusion(scope.row)"
                            >审查结论</el-button
                        >
                        <el-button
                            v-if="
                                scope.row.SC_STATUS == 3 &&
                                !scope.row.isChildren
                            "
                            @click="handleResetReview(scope.row)"
                            type="warning"
                            plain
                            size="mini"
                            >复审</el-button
                        >
                        <el-button
                            v-if="
                                scope.row.SC_STATUS == 3 ||
                                scope.row.SC_STATUS == 2
                            "
                            @click="handleDetail(scope.row, false)"
                            type="info"
                            plain
                            size="mini"
                            >查看</el-button
                        >
                        <el-popconfirm
                            title="确定删除当前数据吗？"
                            @confirm="handleDelete(scope.row)"
                        >
                            <el-button
                                type="danger"
                                size="mini"
                                plain
                                slot="reference"
                                >删除</el-button
                            ></el-popconfirm
                        >
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-size="pagesize"
                :page-sizes="pagesizeArr"
                layout="total, sizes, prev, pager, next, jumper"
                :total="tableTotal"
                background
            >
            </el-pagination>
        </div>

        <!-- 添加项目 -->
        <el-dialog
            :title="addTitle"
            :visible.sync="dialogAddItem"
            width="30%"
            class="add-dialog"
            @closed="closeAddDialog"
            v-dialogDrag
            :close-on-click-modal="false"
        >
            <el-form
                :model="addForm"
                :rules="addFormRule"
                ref="addFormRef"
                label-width="auto"
            >
                <el-form-item label="选择阶段" prop="jdbh">
                    <el-select
                        v-model="addForm.jdbh"
                        placeholder="请选择阶段"
                        size="small"
                        value-key="JDBH"
                        clearable
                    >
                        <el-option
                            v-for="item in JDTypeList"
                            :label="item.JDNAME"
                            :value="item.JDBH"
                            :key="item.JDBH"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="审查轮次" prop="scnumdesc">
                    <el-input
                        v-model.trim="addForm.scnumdesc"
                        autocomplete="off"
                        size="small"
                        placeholder="审查轮次"
                    ></el-input>
                </el-form-item>
                <el-form-item label="规划面积" prop="gharea">
                    <el-input
                        v-model.trim="addForm.gharea"
                        autocomplete="off"
                        size="small"
                        placeholder="请输入规划面积(平方公里)"
                    ></el-input>
                </el-form-item>
                <el-form-item label="编制单位" prop="bzunit">
                    <el-input
                        v-model.trim="addForm.bzunit"
                        autocomplete="off"
                        size="small"
                        placeholder="组织单位"
                    ></el-input>
                </el-form-item>
                <el-form-item label="委托单位" prop="wtunit">
                    <el-input
                        v-model.trim="addForm.wtunit"
                        autocomplete="off"
                        size="small"
                        placeholder="请输入委托单位"
                    ></el-input>
                </el-form-item>
                <el-form-item label="委托部门" prop="wtdept">
                    <el-input
                        v-model.trim="addForm.wtdept"
                        autocomplete="off"
                        size="small"
                        placeholder="请输入委托部门"
                    ></el-input>
                </el-form-item>
                <el-form-item label="规划范围" prop="ghfw">
                    <el-input
                        v-model.trim="addForm.ghfw"
                        autocomplete="off"
                        size="small"
                        placeholder="请输入规划范围"
                        type="textarea"
                    ></el-input>
                </el-form-item>
                <el-form-item label="导入上位指标">
                    <el-upload
                        class="tem-upload"
                        ref="tempUpload"
                        action="action"
                        :http-request="tempUpload"
                        :on-change="onChange"
                        :show-file-list="true"
                        accept=".xlsx"
                    >
                        <el-button
                            type="primary"
                            size="small"
                            icon="el-icon-upload2"
                        >
                            导入上位指标
                        </el-button>
                    </el-upload>
                    <a
                        style="color: green; cursor: pointer"
                        @click="downTemplate"
                        >规划指标模板下载</a
                    >
                </el-form-item>
                <el-form-item label="导入审查成果包">
                    <el-upload
                        class="tem-upload"
                        ref="ZIPUpload"
                        action="action"
                        :http-request="tempUpload"
                        :on-change="onZIPChange"
                        :show-file-list="true"
                        accept=".zip"
                    >
                        <el-button
                            type="primary"
                            size="small"
                            icon="el-icon-upload2"
                        >
                            导入审查成果包
                        </el-button>
                    </el-upload>
                    <span style="color: gray">注：请选择zip压缩包文件</span>
                </el-form-item>
                <div class="dialog-footer">
                    <el-button
                        type="primary"
                        @click="addFormInfo"
                        :loading="saving"
                        size="small"
                        >保 存</el-button
                    >
                    <el-button type="info" @click="closeAddDialog" size="small"
                        >取消</el-button
                    >
                </div>
            </el-form>
        </el-dialog>
        <!-- <div> -->
        <!-- 成果管理 -->
        <result-manger
            v-if="resultInfo"
            :resultInfo="resultInfo"
            :pid="pid"
            :source="1"
            :showBtn="showBtn"
            @closePlanUser="closeResult()"
        ></result-manger>
        <!-- </div> -->

        <!-- 详细信息 -->
        <detail-info
            v-if="dialogInfo"
            :dialogInfo="dialogInfo"
            :pid="pid"
            :showBtn="showBtn"
            @closePlanUser="closePlanUser"
        ></detail-info>

        <!-- 审查方案 -->
        <el-dialog
            title="审查方案"
            :visible.sync="examVisible"
            width="30%"
            :before-close="handleClose"
            class="exam-dialog"
            :close-on-click-modal="false"
        >
            <div class="exam-main">
                <div class="dialog-left">
                    <el-tree
                        :data="examTree"
                        :props="defaultProps"
                        ref="gistPTree"
                        @node-click="handleExamTree"
                        :expand-on-click-node="false"
                        default-expand-all
                    ></el-tree>
                </div>
                <div class="dialog-right">
                    <div class="exam-title">审查要点</div>
                    <el-tree
                        :data="gistTree"
                        :props="gistProps"
                        show-checkbox
                        ref="gistTree"
                        node-key="ID"
                        default-expand-all
                    ></el-tree>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="examVisible = false">取 消</el-button>
                <el-button type="primary" @click="setCheckScheme"
                    >开始审查</el-button
                >
            </span>
        </el-dialog>
    </div>
</template>

<script>
export { default } from "../js/plandetail";
</script>

<style scoped lang="scss">
@import "../style/plandetail.scss";
</style>
