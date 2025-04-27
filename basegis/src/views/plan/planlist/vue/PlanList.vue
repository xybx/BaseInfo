<!--
 * @Author: WCL
 * @Date: 2021-12-22 11:02:29
 * @LastEditors: WCL
 * @LastEditTime: 2022-04-01 08:53:29
 * @FilePath: \webgis\src\views\plan\planlist\vue\PlanList.vue
 * @Description: 规划审查-成果审查列表
-->
<template>
    <div class="admin-container">
        <div class="animate__animated animate__fadeIn">
            <el-form
                ref="searchform"
                :model="searchform"
                :inline="true"
                style="float: left"
            >
                <el-form-item label="关键字">
                    <el-input
                        v-model="searchform.keywords"
                        size="small"
                        placeholder="请输入规划名称/委托单位"
                        clearable
                    ></el-input>
                </el-form-item>
                <!-- <el-form-item label="规划类型">
                    <el-select
                        v-model="searchform.ghtype"
                        placeholder="请选择规划类型"
                        size="small"
                        value-key="id"
                        clearable
                    >
                        <el-option
                            v-for="item in regionData"
                            :label="item.TYPENAME"
                            :value="item.ID"
                            :key="item.ID"
                        ></el-option>
                    </el-select>
                </el-form-item> -->
                <el-form-item>
                    <el-button type="primary" @click="onSearch" size="small"
                        >立即搜索</el-button
                    >
                </el-form-item>
            </el-form>
            <el-button
                type="primary"
                style="float: right"
                size="small"
                icon="el-icon-plus"
                @click="addItem"
                >添加</el-button
            >
        </div>

        <div class="table-contain animate__animated animate__fadeIn">
            <div class="left-menu">
                <el-menu
                    default-active="1"
                    class="el-menu1"
                    @select="selectType"
                >
                    <el-menu-item
                        v-for="item in regionData"
                        :index="String(item.ID)"
                        :key="item.ID"
                    >
                        <i class="el-icon-menu"></i>
                        <span slot="title">{{ item.TYPENAME }}</span>
                    </el-menu-item>
                </el-menu>
            </div>
            <div class="right-table">
                <el-table
                    :data="tableData"
                    border
                    stripe
                    :default-sort="{ prop: 'PID', order: 'descending' }"
                    v-loading="loading"
                    size="small"
                >
                    <el-table-column
                        prop="PID"
                        label="序号"
                        min-width="60"
                        sortable
                        align="center"
                    ></el-table-column>
                    <el-table-column
                        prop="PRJNAME"
                        label="规划名称"
                        min-width="250"
                        align="center"
                    >
                        <template v-slot="scope">
                            <el-input
                                v-model.trim="scope.row.PRJNAME"
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

                            <span v-else>{{ scope.row.PRJNAME }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="TYPEID"
                        label="规划类型"
                        min-width="100"
                        align="center"
                    >
                        <template v-slot="scope">
                            {{
                                scope.row.TYPEID == 1 ? '总体规划' : '专项规划'
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="YEARSTART"
                        label="规划起始年"
                        min-width="80"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="YEARTARGET"
                        label="规划目标年"
                        min-width="80"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="GHAREA"
                        label="规划范围"
                        min-width="300"
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
                        label="操作"
                        min-width="300"
                        align="center"
                        class-name="handle-col"
                    >
                        <template slot-scope="scope">
                            <el-button
                                @click="handleDetail(scope.row)"
                                type="primary"
                                plain
                                size="mini"
                                >成果阶段审查</el-button
                            >
                            <el-button
                                size="mini"
                                type="warning"
                                plain
                                @click="handleEdit(scope.row, true)"
                                >修改</el-button
                            >
                            <el-popconfirm
                                title="确定删除当前数据吗？"
                                @confirm="handleDelete(scope.row)"
                            >
                                <el-button
                                    slot="reference"
                                    size="mini"
                                    type="danger"
                                    plain
                                    >删除</el-button
                                >
                            </el-popconfirm>
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
        </div>

        <!-- 添加/修改项目 -->
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
                <el-form-item label="规划名称" prop="ghname">
                    <el-input
                        v-model.trim="addForm.ghname"
                        autocomplete="off"
                        placeholder="请输入规划名称(必填)"
                        size="small"
                    ></el-input>
                </el-form-item>
                <el-form-item label="规划类型" prop="ghtype">
                    <el-select
                        v-model="addForm.ghtype"
                        placeholder="请选择规划类型(必选)"
                        size="small"
                    >
                        <el-option
                            v-for="item in regionData"
                            :label="item.TYPENAME"
                            :value="String(item.ID)"
                            :key="item.ID"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="规划起始年" prop="yearstart">
                    <el-date-picker
                        v-model.trim="addForm.yearstart"
                        type="year"
                        placeholder="选择规划起始年(必填)"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="规划目标年" prop="yeartarget">
                    <el-date-picker
                        v-model.trim="addForm.yeartarget"
                        type="year"
                        placeholder="选择规划目标年(必填)"
                    >
                    </el-date-picker>
                </el-form-item>
                <!-- <el-form-item label="委托单位" prop="ounit">
					<el-input v-model.trim="addForm.ounit" autocomplete="off" placeholder="请输入委托单位(必填)"
						size="small"></el-input>
				</el-form-item> -->
                <el-form-item label="项目简介" prop="ghintro">
                    <el-input
                        v-model.trim="addForm.ghintro"
                        autocomplete="off"
                        size="small"
                        type="textarea"
                        placeholder="请输入项目简介"
                    ></el-input>
                </el-form-item>
                <el-form-item label="规划范围" prop="gharea">
                    <el-input
                        v-model.trim="addForm.gharea"
                        autocomplete="off"
                        size="small"
                        type="textarea"
                        placeholder="请输入规划面积"
                    ></el-input>
                </el-form-item>

                <div class="dialog-footer">
                    <el-button type="primary" @click="addFormInfo" size="small"
                        >保 存</el-button
                    >
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
export { default } from '../js/planlist';
</script>

<style scoped lang="scss">
@import '../style/planlist.scss';
</style>
