<!--
 * @Author: WCL
 * @Date: 2022-02-18 10:29:33
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-28 16:56:45
 * @FilePath: \webgis\src\components\onemap\onemap-project\vue\OnemapProject.vue
 * @Description: 项目核查
-->
<template>
    <div class="">
        <el-dialog
            :title="comTitle"
            :visible.sync="dialogVisible"
            :before-close="closeDialog"
            :modal="false"
            :close-on-click-modal="false"
            custom-class="project"
            v-if="dialogVisible"
            v-dialogDrag
        >
            <!-- 自定义范围 -->
            <div>
                <div class="sub-title">
                    <i class="el-icon-caret-right"></i>
                    <span>自定义范围</span>
                </div>
                <div class="sub-content">
                    <el-button
                        type="warning"
                        size="small"
                        @click="drawPolygon()"
                        >绘制范围</el-button
                    >
                </div>
            </div>

            <!-- 选择文件上传 -->
            <div>
                <div class="sub-title">
                    <i class="el-icon-caret-right"></i>
                    <span>选择文件上传</span>
                </div>
                <div class="sub-content">
                    <div class="up-btn-list">
                        <span v-for="(item, index) in upBtnList" :key="index">
                            <el-upload
                                :ref="item.ref"
                                action="action"
                                :http-request="uploadFile"
                                :accept="item.accept"
                                :show-file-list="false"
                            >
                                <div class="up-btn">
                                    <el-image :src="item.url"></el-image>
                                </div>
                            </el-upload>
                        </span>
                    </div>
                    <div class="up-txt">
                        {{ upTXT }}
                    </div>
                    <div class="up-tips">
                        上传面积为：<span
                            style="font-weight: bold; color: green"
                            >{{ upArea }}
                        </span>
                        公顷
                    </div>
                </div>
            </div>

            <!-- 缓冲距离设置 -->
            <div>
                <div class="sub-title">
                    <i class="el-icon-caret-right"></i>
                    <span>缓冲距离设置</span>
                </div>
                <div class="sub-content buffer-content">
                    <span class="sub-check">
                        <el-checkbox v-model="isBuffer">
                            缓冲距离：
                            <el-input
                                v-model="bufferDistance"
                                placeholder="请输入距离"
                                :disabled="!isBuffer"
                                size="small"
                            ></el-input>
                            (米)
                        </el-checkbox></span
                    >
                    <el-button
                        type="primary"
                        size="small"
                        :disabled="!isBuffer"
                        @click="bufferOK"
                        >确定</el-button
                    >
                </div>
            </div>

            <!-- 分析内容 -->
            <div>
                <div class="sub-title">
                    <i class="el-icon-caret-right"></i>
                    <span>分析内容</span>
                </div>
                <div class="sub-content">
                    <el-table
                        ref="table"
                        :data="tableData"
                        @row-click="tableDataRowClick"
                        tooltip-effect="dark"
                        stripe
                        border
                        size="mini"
                    >
                        <el-table-column width="55" align="center">
                            <template slot-scope="scope">
                                <el-radio
                                    :label="scope.row.index"
                                    v-model="radioID"
                                    @input="changeRadio(scope.row)"
                                ></el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="name"
                            label="名称"
                            align="center"
                        >
                        </el-table-column>
                        <el-table-column
                            prop="area"
                            label="面积(公顷)"
                            align="center"
                        >
                        </el-table-column>
                        <el-table-column
                            prop="distance"
                            label="距离(公里)"
                            align="center"
                        >
                        </el-table-column>
                        <el-table-column
                            label="操作"
                            align="center"
                            min-width="120"
                        >
                            <template slot-scope="scope">
                                <el-button
                                    @click="exportZJDBtnClick(scope.row)"
                                    type="primary"
                                    size="mini"
                                    >导出界址点</el-button
                                >
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <!-- 选择图层 -->
            <div>
                <div class="sub-title">
                    <i class="el-icon-caret-right"></i>
                    <span>选择图层</span>
                </div>
                <div class="sub-content">
                    <el-select
                        v-model="selectLayer"
                        placeholder="请选择核查图层"
                        size="small"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="item in layerOptions"
                            :key="item.PID"
                            :label="item.LAYERNAME"
                            :value="item.PID"
                        >
                        </el-option>
                    </el-select>
                    <!-- <el-tree :data="treeData" show-checkbox highlight-current :props="layerProps"
						@check-change="handleTreeCheck">
					</el-tree> -->
                </div>
                <br />
                <div class="exam-box">
                    <el-button
                        type="primary"
                        size="small"
                        class="begin-exam"
                        @click="handleBeginExam"
                        >开始审查</el-button
                    >
                </div>
            </div>
        </el-dialog>

        <!-- 地块审查上拉框 -->
        <el-drawer
            :visible.sync="landDrawer"
            direction="btt"
            :modal="false"
            :wrapperClosable="false"
            ref="landDrawer"
            custom-class="drawer"
            :size="drawerSize"
            @closed="drawerClosed"
            destroy-on-close
        >
            <i
                class="showDrawer"
                :class="switchDrawerIcon"
                :switch="switchDrawer"
                @click="switchHeight"
            ></i>
            <div slot="title">
                <span class="drawer-slot-title">审查结果</span>
                <el-button style="float:right;"
                    type="primary"
                    size="small"
                    class="begin-exam"
                    @click="exportData"
                    >导出数据</el-button
                >
                <el-button style="float:right;margin-right:20px"
                    type="primary"
                    size="small"
                    class="begin-exam"
                    @click="exportPdf"
                    >导出分析报告</el-button
                >
            </div>

            <span>
                <el-table
                    :data="scResultTable"
                    @row-click="scRowClick"
                    height="300"
                    border
                    stripe
                    size="small"
                    v-loading="loading"
                    element-loading-text="拼命加载中"
                    id="scResultTable"
                >
                    <el-table-column
                        v-for="(item, index) in tableColsData"
                        :key="index"
                        :label="item.LABEL"
                        :prop="item.PROP ? item.PROP : ''"
                        min-width="120"
                        align="center"
                    >
                        <template v-if="item.CHILDREN.length > 0">
                            <el-table-column
                                v-for="(subItem, subIndex) in item.CHILDREN"
                                :key="subIndex"
                                :prop="subItem.PROP"
                                :label="subItem.LABEL"
                                max-width="120"
                                align="center"
                            ></el-table-column>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- 分页 -->
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="pagesizeArr"
                    :page-size="pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="scResultTable.length"
                    background
                >
                </el-pagination>
            </span>
        </el-drawer>
    </div>
</template>

<script>
export { default } from "../js/onemap-project";
</script>

<style scoped lang="scss">
@import "../style/onemap-project.scss";
</style>
