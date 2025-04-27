<!--
 * @Author: WCL
 * @Date: 2021-12-22 11:02:29
 * @LastEditors: WCL
 * @LastEditTime: 2023-01-04 14:37:44
 * @FilePath: \webgis\src\views\plan\planhuijiao\vue\PlanHuiJiao_NY.vue
 * @Description: 规划审查-数据汇交（张家口与河北省厅的汇交对接）
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
                <el-form-item label="规划类型">
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
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="规划名称">
                    <el-input
                        v-model="searchform.keywords"
                        size="small"
                        placeholder="请输入规划名称"
                        clearable
                    ></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch" size="small"
                        >开始搜索</el-button
                    >
                </el-form-item>
            </el-form>
            <el-button
                type="primary"
                style="float: right"
                size="small"
                @click="addItem"
                >上传汇交</el-button
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
            >
                <el-table-column
                    prop="PID"
                    label="序号"
                    min-width="80"
                    align="center"
                ></el-table-column>
                <el-table-column
                    prop="PLANTYPE"
                    label="规划类型"
                    align="center"
                >
                    <template v-slot="scope">
                        <div v-if="scope.row.PLANTYPE == '1'">总体规划</div>
                        <div v-else-if="scope.row.PLANTYPE == '2'">
                            专项规划
                        </div>
                        <div v-else>详细规划</div>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="JDNAME"
                    label="规划成果阶段"
                    align="center"
                    min-width="100"
                >
                </el-table-column>
                <el-table-column
                    prop="NAME"
                    label="规划名称"
                    min-width="100"
                    align="center"
                >
                    <template v-slot="scope">
                        <el-input
                            v-model.trim="scope.row.NAME"
                            size="small"
                            v-if="scope.row.isread"
                            ref="stage"
                        >
                            <el-button
                                slot="append"
                                size="small"
                                type="primary"
                                @click="changeStageName(scope.row)"
                                >保存
                            </el-button>
                        </el-input>

                        <span v-else>{{ scope.row.NAME }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="FILENAME"
                    label="成果文件名称"
                    align="center"
                    min-width="200"
                >
                </el-table-column>
                <el-table-column
                    prop="YEARSTART"
                    label="规划起始年"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="YEARSTANDARD"
                    label="近期目标年"
                    align="center"
                >
                </el-table-column>

                <el-table-column
                    prop="YEARTARGET"
                    label="远景目标年"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="STATUS"
                    min-width="200"
                    label="汇交状态"
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
                        <!-- <el-button size="small" type="warning" v-if="scope.row.STATUSCODE >= 5 && scope.row.STATUSCODE < 11"
                        @click="handleResume(scope.row)">继续上报汇交成果</el-button> -->
                        <el-popconfirm
                            v-if="scope.row.STATUSCODE < 11"
                            title="确定删除当前数据吗？"
                            @confirm="handleDelete(scope.row)"
                            style="margin-left: 8px"
                        >
                            <el-button
                                type="danger"
                                size="mini"
                                slot="reference"
                                >删除</el-button
                            ></el-popconfirm
                        >

                        <el-button
                            v-if="scope.row.STATUSCODE == 11"
                            size="small"
                            type="success"
                            @click="lookZip(scope.row)"
                            >查看成果</el-button
                        >

                        <!-- <el-upload class="upload-pf" action="#" :show-file-list="false" :http-request="handleResetUpload"
                                                                                    accept=".zip">
                                                                                    <el-button size="small" type="warning" v-if="scope.row.STATUSCODE>=5 && scope.row.STATUSCODE<11" @click="resetUpload(scope.row)">继续上报汇交成果</el-button>
                                                                                </el-upload> -->
                        <!-- <el-button size="mini" type="primary"
                                                                                    v-if="scope.row.STATUS != null ? (scope.row.STATUS.includes('成功')) : false"
                                                                                    @click="handleDownload(scope.row)">下载文件
                                                                                </el-button> -->
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

        <!-- 添加/修改项目 -->
        <el-dialog
            :title="addTitle"
            :visible.sync="dialogAddItem"
            width="37%"
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
                :inline="true"
            >
                <el-form-item label="行政区代码" prop="areaCode">
                    <el-input
                        v-model.trim="addForm.areaCode"
                        autocomplete="off"
                        size="small"
                        placeholder="请输入行政区代码"
                    >
                    </el-input>
                </el-form-item>
                <el-form-item label="行政区名称" prop="areaName">
                    <el-input
                        v-model.trim="addForm.areaName"
                        autocomplete="off"
                        size="small"
                        placeholder="请输入行政区名称"
                    >
                    </el-input>
                </el-form-item>
                <el-form-item label="规划类型" prop="planType">
                    <el-select
                        v-model="addForm.planType"
                        placeholder="请选择规划类型"
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
                <el-form-item label="规划名称" prop="name">
                    <el-input
                        v-model.trim="addForm.name"
                        autocomplete="off"
                        size="small"
                        placeholder="请输入规划名称"
                    >
                    </el-input>
                </el-form-item>
                <el-form-item label="规划成果阶段" prop="jdName">
                    <el-select
                        v-model="addForm.jdName"
                        placeholder="请选择规划成果阶段"
                        size="small"
                    >
                        <el-option
                            v-for="item in JDTypeList"
                            :label="item.JDNAME"
                            :value="item.JDBH"
                            :key="item.ID"
                        ></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="规划起始年" prop="yearStart">
                    <el-date-picker
                        v-model="addForm.yearStart"
                        type="year"
                        value-format="yyyy"
                        placeholder="请选择规划起始年"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="近期目标年" prop="yearStandard">
                    <el-date-picker
                        v-model="addForm.yearStandard"
                        type="year"
                        value-format="yyyy"
                        placeholder="请选择近期目标年"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="远景目标年" prop="yearTarget">
                    <el-date-picker
                        v-model="addForm.yearTarget"
                        type="year"
                        value-format="yyyy"
                        placeholder="请选择远景目标年"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="矢量数据格式" prop="vectorType">
                    <el-select
                        v-model="addForm.vectorType"
                        placeholder="请选择数据类型"
                        size="small"
                    >
                        <el-option
                            v-for="item in vectorData"
                            :label="item.TYPENAME"
                            :value="String(item.ID)"
                            :key="item.ID"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <div class="dialog-footer">
                    <el-upload
                        class="upload-demo"
                        action="#"
                        :show-file-list="false"
                        :http-request="uploadLeader"
                        accept=".zip"
                        :disabled="!isReportedSuccess"
                    >
                        <el-button
                            size="small"
                            type="success"
                            :disabled="!isReportedSuccess"
                            >上传成果（zip）文件</el-button
                        >
                    </el-upload>
                    <!-- <el-button type="primary" @click="closeAddDialog" size="small">
                                                                            取消
                                                                        </el-button> -->
                    <el-button
                        type="primary"
                        @click="startDataReport"
                        size="small"
                    >
                        开始上报
                    </el-button>
                </div>
                <!-- <el-steps :active="active" finish-status="success" style="margin-top: 20px;width: 100%; ">
                                                                            <el-step title="上传文件"></el-step>
                                                                            <el-step title="加密压缩文件"></el-step>
                                                                            <el-step title="文件分片"></el-step>
                                                                            <el-step title="分片上传"></el-step>
                                                                            <el-step title="合并分片"></el-step>
                                                                            <el-step title="提交压缩密码"></el-step>
                                                                            <el-step title="完成"></el-step>
                                                                        </el-steps> -->
            </el-form>
        </el-dialog>
        <!-- 查看成果管理 -->
        <result-manger
            v-if="resultInfo"
            :resultInfo="resultInfo"
            :pid="pid"
            :source="2"
            :showBtn="false"
            @closePlanUser="closeResult()"
        ></result-manger>
    </div>
</template>

<script>
import {
    getType,
    saveProject,
    getList,
    delProject,
    getDownFile,
    uploadLocalhost,
    updateProjectStatus,
    uploadData,
    ZipDirecortyFiles,
    SpliteFiles,
    UploadSplite,
    UnionFiles,
    SaveResult,
    SaveZip,
    BreakPointResume,
    deleteProject,
    getSCReport,
} from "../api/planhuijiao-api";

import { getJDType } from "../../planlist/components/plandetail/api/plandetail-api";
import ResultManger from "@/components/plan/detailinfo/vue/ResultManger.vue";
import qs from "qs";
import { red } from "color-name";
export default {
    name: "",
    props: {},
    components: { ResultManger },
    data() {
        return {
            // 成功阶段控制
            resultInfo: false,
            isReportedSuccess: true,
            active: 0,
            loading: true,
            searchform: {
                keywords: "",
                ghtype: "",
            },
            // 规划类型选项
            regionData: [
                { ID: 1, TYPENAME: "总体规划" },
                { ID: 2, TYPENAME: "专项规划" },
                { ID: 3, TYPENAME: "详细规划" },
            ],
            // 数据类型选项
            vectorData: [
                { ID: 1, TYPENAME: "GDB" },
                { ID: 2, TYPENAME: "SHP" },
                { ID: 3, TYPENAME: "MDB" },
            ],
            // 表格数据
            tableData: [],
            tableHeader: [],
            currentPage: 1,
            pagesize: 10,
            pagesizeArr: [10, 20, 50, 100],
            tableTotal: 0,
            dialogAddItem: false,
            addForm: {
                areaCode: "",
                areaName: "",
                planType: "",
                name: "",
                yearStart: "",
                yearStandard: "",
                yearTarget: "",
                vectorType: "",
                jdName: "",
            },
            addFormRule: {
                areaCode: [
                    {
                        required: true,
                        message: "行政区代码不能为空",
                        trigger: "blur",
                    },
                ],
                areaName: [
                    {
                        required: true,
                        message: "行政区名称不能为空",
                        trigger: "blur",
                    },
                ],
                planType: [
                    {
                        required: true,
                        message: "规划类型不能为空",
                        trigger: "change",
                    },
                ],
                name: [
                    {
                        required: true,
                        message: "规划名称不能为空",
                        trigger: "blur",
                    },
                ],
            },
            jdData: [], // 项目阶段
            addTitle: "",
            focusReply: {},
            JDTypeList: [],
            projectInfo: {}, //文件上传成功返回的数据汇交记录
            zipFilePath: "", //加密压缩文件完成返回压缩包的地址
            uploading: null,
            pid: 0,
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.isReportedSuccess = true;
        this.addForm.areaCode = window.sessionStorage.getItem("usercode");
        this.addForm.areaName = window.sessionStorage.getItem("xzqname");
        this.pagesize = this.pagesizeArr[0];
        this.getTableData();
    },
    methods: {
        // 搜索项目
        onSearch() {
            this.getTableData(this.searchform);
        },
        async getJDTypeList() {
            const { data: res } = await getJDType();
            console.log(res, "阶段类型");
            if (res.code === 1) {
                this.JDTypeList = res.data;
            }
        },

        // 规划项目列表数据组装
        getTableData(form) {
            let params = {
                // uid: sessionStorage.getItem('userid'),
                plantype: "",
                name: "",
                pageindex: this.currentPage,
                pagesize: this.pagesize,
            };

            if (form?.ghtype) {
                Object.assign(params, {
                    plantype: form.ghtype,
                });
            }
            if (form?.keywords) {
                Object.assign(params, {
                    name: form.keywords,
                });
            }
            this.getTableList(params);
        },

        // 获取规划项目列表
        async getTableList(params) {
            // 不做分页
            const { data: res } = await getList(params);
            if (res.code === 1) {
                // this.tableData = res.data.datas;
                // this.tableTotal = res.data.total;
                this.tableData = res.data;
                this.tableTotal = res.total;
                this.loading = false;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 获取规划类型
        async getRegionData() {
            const { data: res } = await getType();
            if (res.code === 1) {
                this.regionData = res.data;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 每条页数改变
        handleSizeChange(val) {
            this.pagesize = val;
            this.getTableData(this.searchform);
        },

        // 当前页码改变
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getTableData(this.searchform);
        },

        // 添加项目
        addItem() {
            this.addForm.areaCode = window.sessionStorage.getItem("usercode");
            this.addForm.areaName = window.sessionStorage.getItem("xzqname");
            this.getJDTypeList();
            this.addTitle = "数据上报";
            this.dialogAddItem = true;
        },

        // 添加项目-关闭
        closeAddDialog() {
            this.dialogAddItem = false;
            this.addForm = this.$options.data().addForm;
            this.$refs.addFormRef.resetFields();
        },
        stepnext() {
            if (this.active++ > 2) this.active = 0;
        },
        // 上传文件
        uploadLeader(params) {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return this.$message.warning("请补充必填项");
                let loading = this.$message({
                    iconClass: "el-icon-loading",
                    message: "正在上传文件,请耐心等待......",
                    duration: 0,
                    customClass: "prop-search",
                });
                let formData = new FormData();
                formData.append("file", params.file);
                formData.append("areaCode", this.addForm.areaCode);
                formData.append("areaName", this.addForm.areaName);
                formData.append("name", this.addForm.name);
                formData.append("yearStandard", this.addForm.yearStandard);
                formData.append("yearStart", this.addForm.yearStart);
                formData.append("yearTarget", this.addForm.yearTarget);
                formData.append("planType", this.addForm.planType);
                formData.append("vectorType", this.addForm.vectorType);
                formData.append("jdName", this.addForm.jdName);
                formData.append("uid", window.sessionStorage.getItem("userid"));
                formData.append(
                    "pid",
                    !this.projectInfo.PID ? 0 : this.projectInfo.PID
                );
                //上传文件到远程接口
                const { data: res } = await uploadData(formData);
                console.log(res, "res");
                if (res.code === 1) {
                    loading.close();
                    this.projectInfo = res.data;
                    console.log("projectInfo", this.projectInfo);
                    this.$message.success("成果文件上传成功");
                    this.getTableData();
                    // this.stepnext();    //下一步开始上报
                    //this.dialogAddItem = false;
                    //this.closeAddDialog();
                } else {
                    loading.close();
                    this.$message.error(res.msg);
                    // this.getTableData();
                    //this.dialogAddItem = false;
                    //this.closeAddDialog();
                }
            });
        },
        //开始上报
        async startDataReport() {
            if (!this.projectInfo.PID) {
                this.$message.error("请先上传成果文件");
                return;
            }
            this.isReportedSuccess = false;
            // let loading = this.$message({
            //     iconClass: 'el-icon-loading',
            //     message: '正在对文件进行加密压缩......',
            //     duration: 0,
            //     customClass: 'prop-search',
            // });
            //加密压缩文件
            let params = {
                hjid: this.projectInfo.PID,
                uid: window.sessionStorage.getItem("userid"),
            };
            // const { data: res } = await ZipDirecortyFiles(params);
            // if (res.code === 1) {
            //     this.getTableData();
            //     loading.close();
            //     //this.stepnext();
            //     this.zipFilePath = res.data;
            //压缩文件分片
            let loading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在生成分片......",
                duration: 0,
                customClass: "prop-search",
            });
            const { data: res1 } = await SpliteFiles(params);
            let sm3 = "";
            let splitespath = "";
            if (res1.code == 1) {
                this.getTableData();
                loading.close();
                //this.stepnext();
                sm3 = res1.data.sm3;
                splitespath = res1.data.splitespath;
                //分片上传
                loading = this.$message({
                    iconClass: "el-icon-loading",
                    message: "正在进行分片上传......",
                    duration: 0,
                    customClass: "prop-search",
                });
                // debugger;
                params = {
                    sm3: sm3,
                    spliteFilepath: splitespath,
                    uid: window.sessionStorage.getItem("userid"),
                    hjid: this.projectInfo.PID,
                };
                const { data: res2 } = await UploadSplite(params);
                if (res2.code == 1) {
                    this.getTableData();
                    loading.close();
                    //合并文件
                    //this.stepnext();
                    loading = this.$message({
                        iconClass: "el-icon-loading",
                        message: "正在合并分片文件......",
                        duration: 0,
                        customClass: "prop-search",
                    });
                    params = {
                        uid: window.sessionStorage.getItem("userid"),
                        hjid: this.projectInfo.PID,
                    };
                    const { data: res3 } = await UnionFiles(params);
                    if (res3.code == 1) {
                        this.getTableData();
                        loading.close();
                        //解压保存成果(提交压缩)
                        //this.stepnext();
                        loading = this.$message({
                            iconClass: "el-icon-loading",
                            message: "正在获取公钥......",
                            duration: 0,
                            customClass: "prop-search",
                        });
                        params = {
                            uid: window.sessionStorage.getItem("userid"),
                        };
                        const { data: res4 } = await SaveResult(params);
                        if (res4.code == 1) {
                            this.getTableData();
                            loading.close();
                            let sm2 = res4.data;
                            //完成保存成果包
                            //this.stepnext();
                            loading = this.$message({
                                iconClass: "el-icon-loading",
                                message: "正在保存成果......",
                                duration: 0,
                                customClass: "prop-search",
                            });
                            params = {
                                uid: window.sessionStorage.getItem("userid"),
                                hjid: this.projectInfo.PID,
                                sm2: sm2,
                            };
                            const { data: res5 } = await SaveZip(params);
                            if (res5.code == 1) {
                                this.getTableData();
                                this.isReportedSuccess = false;
                                loading.close();
                                //this.stepnext();
                                this.$message.success("本次成果上报已完成");
                                this.dialogAddItem = false;
                                this.closeAddDialog();
                            } else {
                                this.getTableData();
                                this.isReportedSuccess = true;
                                loading.close();
                                this.$message.error("保存成果包及信息失败");
                            }
                        } else {
                            this.getTableData();
                            this.isReportedSuccess = true;
                            loading.close();
                            this.$message.error("提交压缩密码失败");
                        }
                    } else {
                        this.getTableData();
                        this.isReportedSuccess = true;
                        loading.close();
                        this.$message.error("合并文件失败");
                    }
                } else {
                    this.getTableData();
                    this.isReportedSuccess = true;
                    loading.close();
                    this.$message.error("分片上传失败");
                }
            } else {
                this.getTableData();
                this.isReportedSuccess = true;
                loading.close();
                this.$message.error("文件分片失败");
            }
            // }
            // else {
            //     this.getTableData();
            //     this.isReportedSuccess = true;
            //     loading.close();
            //     this.$message.error("加密压缩文件失败");
            // }
        },

        // 下载文件
        async handleDownload(row) {
            // 模板下载
            window.open(`${apiURL_file}/${row.FILEPATH}/${row.FILENAME}`);
        },

        //断点续传
        async handleResume(row) {
            debugger;
            //上次汇交到分片上传的步骤
            if (row.STATUSCODE == 5 || row.STATUSCODE == 6) {
                //TODO:分片上传
                //分片上传
                let loading = this.$message({
                    iconClass: "el-icon-loading",
                    message: "正在进行分片上传......",
                    duration: 0,
                    customClass: "prop-search",
                });
                let params = {
                    uid: window.sessionStorage.getItem("userid"),
                    hjid: row.PID,
                    isSplite: row.STATUSCODE,
                };
                const { data: res } = await BreakPointResume(params);
                if (res.code == 1) {
                    this.getTableData();
                    loading.close();
                    //合并文件
                    res = await setUnionFiles(row.PID);
                    if (res.code == 1) {
                        this.uploading.close();
                        //请求公钥
                        res = await setRequestKey();
                        if (res.code == 1) {
                            this.getTableData();
                            this.uploading.close();
                            //保存成果文件
                            let sm2 = res.data;
                            res = await setSaveZip(sm2, row.PID);
                            if (res.code == 1) {
                                this.getTableData();
                                this.uploading.close();
                                this.$message.success("本次成果上报已完成");
                            } else {
                                this.getTableData();
                                this.uploading.close();
                                this.$message.error(res.msg);
                            }
                        } else {
                            this.getTableData();
                            this.uploading.close();
                            this.$message.error(res.msg);
                        }
                    } else {
                        this.getTableData();
                        this.uploading.close();
                        this.$message.error(res.msg);
                    }
                } else {
                    this.getTableData();
                    loading.close();
                    this.$message.error(res.msg);
                }
            }
            //上次汇交到合并文件的步骤
            else if (row.STATUSCODE == 7 || row.STATUSCODE == 8) {
                //TODO:请求合并文件
                let res = await setUnionFiles(row.PID);
                if (res.code == 1) {
                    this.getTableData();
                    this.uploading.close();
                    //请求公钥
                    res = await setRequestKey();
                    if (res.code == 1) {
                        this.getTableData();
                        this.uploading.close();
                        //保存成果文件
                        let sm2 = res.data;
                        res = await setSaveZip(sm2, row.PID);
                        if (res.code == 1) {
                            this.getTableData();
                            this.uploading.close();
                            this.$message.success("本次成果上报已完成");
                        } else {
                            this.getTableData();
                            this.uploading.close();
                            this.$message.error(res.msg);
                        }
                    } else {
                        this.getTableData();
                        this.uploading.close();
                        this.$message.error(res.msg);
                    }
                } else {
                    this.getTableData();
                    this.uploading.close();
                    this.$message.error(res.msg);
                }
            }
            //上传汇交到保存成果文件的步骤
            else if (row.STATUSCODE == 9 || row.STATUSCODE == 10) {
                //TODO:请求保存成果文件
                //请求公钥
                res = await setRequestKey();
                if (res.code == 1) {
                    this.getTableData();
                    this.uploading.close();
                    //保存成果文件
                    let sm2 = res.data;
                    res = await setSaveZip(sm2, row.PID);
                    if (res.code == 1) {
                        this.getTableData();
                        this.uploading.close();
                        this.$message.success("本次成果上报已完成");
                    } else {
                        this.getTableData();
                        this.uploading.close();
                        this.$message.error(res.msg);
                    }
                } else {
                    this.getTableData();
                    this.uploading.close();
                    this.$message.error(res.msg);
                }
            }
        },

        //请求合并文件
        async setUnionFiles(PID) {
            uploading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在合并分片文件......",
                duration: 0,
                customClass: "prop-search",
            });
            params = {
                uid: window.sessionStorage.getItem("userid"),
                hjid: PID,
            };
            const { data: res3 } = await UnionFiles(params);
            return res3;
        },
        //请求公钥
        async setRequestKey() {
            uploading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在获取公钥......",
                duration: 0,
                customClass: "prop-search",
            });
            params = {
                uid: window.sessionStorage.getItem("userid"),
            };
            const { data: res4 } = await SaveResult(params);
            return res4;
        },
        //保存成果文件
        async setSaveZip(sm2, PID) {
            uploading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在保存成果......",
                duration: 0,
                customClass: "prop-search",
            });
            params = {
                uid: window.sessionStorage.getItem("userid"),
                hjid: PID,
                sm2: sm2,
            };
            const { data: res5 } = await SaveZip(params);
            return res5;
        },
        lookZip(row) {
            this.pid = row.PID;
            this.resultInfo = true;
            console.log(this.pid, this.resultInfo);
        },
        // 关闭查看成果弹框
        closeResult() {
            this.resultInfo = false;
        },
        //删除上报成果
        async handleDelete(row) {
            let params = {
                pid: row.PID,
            };
            const { data: res } = await deleteProject(params);
            if (res.code === 1) {
                this.$message.success("删除成功");
                this.getTableData();
            } else {
                this.$message.error(res.msg);
            }
        },

        
    },
};
</script>

<style scoped lang="scss">
@import "../style/planhuijiao.scss";
</style>
