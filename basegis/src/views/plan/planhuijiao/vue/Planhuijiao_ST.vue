<!--
 * @Author: WCL
 * @Date: 2021-12-22 11:02:29
 * @LastEditors: WCL
 * @LastEditTime: 2023-01-04 14:37:44
 * @FilePath: \webgis\src\views\plan\planhuijiao\vue\Planhuijiao_ST.vue
 * @Description: 规划审查-数据汇交（标准版）
-->
<template>
    <div>
        <div class="content">
            <div>
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
                <el-table
                    :data="tableData"
                    border
                    stripe
                    :default-sort="{ prop: 'PID', order: 'descending' }"
                    v-loading="loading"
                    size="small"
                >
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-form
                                label-position="left"
                                inline
                                class="demo-table-expand"
                            >
                                <el-form-item label="规划起始年">
                                    {{ props.row.YEARSTART }}
                                </el-form-item>
                                <el-form-item label="近期目标年">
                                    {{ props.row.YEARSTANDARD }}
                                </el-form-item>
                                <el-form-item label="远景目标年">
                                    {{ props.row.YEARTARGET }}
                                </el-form-item>
                                <el-form-item label="数据类型">
                                    <span v-if="props.row.VECTORTYPE == 1"
                                        >GDB</span
                                    >
                                    <span v-if="props.row.VECTORTYPE == 2"
                                        >SHP</span
                                    >
                                    <span v-if="props.row.VECTORTYPE == 3"
                                        >MDB</span
                                    >
                                </el-form-item>
                                <el-form-item label="上报用户id">
                                    {{ props.row.USERID }}
                                </el-form-item>
                                <el-form-item label="文件分片后的总数">
                                    {{ props.row.FILETOTAL }}
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="PID"
                        label="序号"
                        min-width="60"
                        width="60"
                        align="center"
                    ></el-table-column>
                    <el-table-column
                        prop="AREACODE"
                        label="行政区"
                        width="150"
                        align="center"
                    >
                        <template v-slot="scope"
                            >{{ scope.row.AREACODE }}:{{
                                scope.row.AREANAME
                            }}</template
                        >
                    </el-table-column>
                    <el-table-column
                        prop="PLANTYPENAME"
                        label="规划类型"
                        align="center"
                    >
                        <!-- <template v-slot="scope">
                            <div v-if="scope.row.PLANTYPE == '1'">总体规划</div>
                            <div v-else-if="scope.row.PLANTYPE == '2'">
                                专项规划
                            </div>
                            <div v-else>详细规划</div>
                        </template> -->
                    </el-table-column>
                    <el-table-column
                        prop="JDNAMESTR"
                        label="阶段"
                        align="center"
                        min-width="100"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="NAME"
                        label="规划名称"
                        min-width="200"
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
                        min-width="250"
                    >
                        <template v-slot="scope">
                            <a
                                style="
                                    cursor: pointer;
                                    text-decoration: underline;
                                "
                                title="点击成果文件名称，下载成果"
                                @click="downLoadZip(scope.row)"
                                >{{ scope.row.FILENAME }}</a
                            >
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="CREATETIME"
                        label="上报时间"
                        width="180"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="STATUS"
                        min-width="200"
                        label="汇交状态"
                        align="center"
                    >
                        <template slot-scope="scope">
                            <span
                                v-if="
                                    scope.row.STATUSCODE >= 1 &&
                                    scope.row.STATUSCODE < 11
                                "
                                style="color: red"
                                >{{ scope.row.STATUS }}</span
                            >
                            <span
                                v-else-if="scope.row.STATUSCODE == 11"
                                style="color: green"
                                >{{ scope.row.STATUS }}</span
                            >
                            <span v-else>{{ scope.row.STATUS }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="SC_STATUSNAME"
                        min-width="200"
                        label="审查状态"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        label="操作"
                        min-width="280"
                        class-name="handle-col"
                    >
                        <template slot-scope="scope">
                            <el-button
                                v-if="scope.row.STATUSCODE < 11"
                                size="mini"
                                type="primary"
                                @click="restItem(scope.row)"
                                >重新上报</el-button
                            >
                            <!-- <el-button size="mini" type="success" @click="lookZip(scope.row)">下载成果</el-button> -->
                            <el-button
                                v-if="scope.row.STATUSCODE == 11"
                                size="mini"
                                type="success"
                                @click="lookZip(scope.row)"
                                >查看成果</el-button
                            >
                            <el-button
                                v-if="scope.row.STATUSCODE == 11"
                                size="small"
                                type="success"
                                @click="getSCResult(scope.row)"
                                >获取审查结果</el-button
                            >
                            <!-- <el-button size="small" type="warning"
                                v-if="scope.row.STATUSCODE >= 6 && scope.row.STATUSCODE < 11"
                                @click="handleResume(scope.row)">继续上报</el-button> -->
                            <!-- <el-button size="small" type="danger"
                                v-if="scope.row.STATUSCODE<=5"
                                @click="handleDelete(scope.row)">删除</el-button> -->
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
                <el-form-item> </el-form-item>
                <el-form-item
                    label="上传成果文件"
                    prop="vectorType"
                    style="width: 100%"
                >
                    <el-upload
                        class="upload-demo"
                        action="#"
                        :show-file-list="true"
                        :http-request="uploadFile"
                        accept=".zip"
                        :disabled="!isReportedSuccess"
                        :on-change="onZIPChange"
                    >
                        <el-button
                            size="small"
                            type="success"
                            :disabled="!isReportedSuccess"
                            >上传成果（zip）文件</el-button
                        >
                    </el-upload>
                </el-form-item>
                <div class="dialog-footer" style="text-align: center">
                    <el-button
                        type="primary"
                        @click="FileFragment"
                        size="small"
                    >
                        开始上报
                    </el-button>
                </div>
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
    getList,
    uploaSTdData,
    BreakPointResume,
    getUserToken,
    reportFileInfo,
    uploadDataToLeader,
    uploadDataMerge,
    saveSTProject,
    deleteProject,
    getSCReport,
} from "../api/planhuijiao-api";
import { uploadFile } from "@/utils/common-api";
import { getJDType } from "../../planlist/components/plandetail/api/plandetail-api";
import ResultManger from "@/components/plan/detailinfo/vue/ResultManger.vue";
import PlanHuiJiaoXQ from "./PlanHuiJiaoXQ.vue";
import qs from "qs";
import { red } from "color-name";
import { Row } from "element-ui";

export default {
    name: "",
    props: {},
    components: { ResultManger, PlanHuiJiaoXQ },
    data() {
        return {
            xzqLevel: xzqLevel,
            activeIndex: "1",
            // modelRadio:'1',
            modelRadioData: [
                { label: "数据上报", id: "1", icon: "el-icon-upload2" },
                { label: "县区数据汇交", id: "2", icon: "el-icon-box" },
            ],
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
                // { ID: 1, TYPENAME: '总体规划' },
                // { ID: 2, TYPENAME: '专项规划' },
                // { ID: 3, TYPENAME: '详细规划' },
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
            zippath: "", //上传成果的压缩包地址
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
        this.getRegionData();
    },
    methods: {
        // 获取规划类型
        async getRegionData() {
            const { data: res } = await getType();
            if (res.code === 1) {
                this.regionData = res.data;
            } else {
                this.$message.error(res.msg);
            }
        },
        handleSelect(key, keyPath) {
            this.activeIndex = key;
        },
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
        restItem(row) {
            this.addTitle = "数据上报";
            this.getJDTypeList();
            this.dialogAddItem = true;
            // this.addForm = this.$options.data().addForm;
            this.addForm.areaCode = row.AREACODE;
            this.addForm.areaName = row.AREANAME;
            (this.addForm.planType = row.PLANTYPE),
                (this.addForm.name = row.NAME);
            this.addForm.yearStart = row.YEARSTART;
            this.addForm.yearStandard = row.YEARSTANDARD;
            this.addForm.yearTarget = row.YEARTARGET;
            this.addForm.vectorType = row.VECTORTYPE;
            this.addForm.jdName = row.JDNAME;
        },
        // 添加项目-关闭
        closeAddDialog() {
            this.dialogAddItem = false;
            this.addForm = this.$options.data().addForm;
            this.$refs.addFormRef.resetFields();
        },
        onZIPChange(file, fileList) {
            if (fileList.length > 1 && file.status !== "fail") {
                fileList.splice(0, 1);
            } else if (file.status === "fail") {
                this.$message.error("上传失败，请重新上传！");
                fileList.splice(0, 1);
            }
        },
        // 1.上传文件
        async uploadFile(params) {
            this.upLoading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在上传文件,请耐心等待......",
                duration: 0,
                customClass: "prop-search",
            });
            let form = new FormData();
            form.append("filepath", "SJHJ");
            form.append("file", params.file);
            const { data: res } = await uploadFile(form);
            if (res.code === 1) {
                this.upLoading.close();
                this.zippath = res.data;
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        //2.本地分片接口,分片完成，数据上报
        async FileFragment() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return this.$message.warning("请补充必填项");
                let loading = this.$message({
                    iconClass: "el-icon-loading",
                    message: "正在对成果包进行分片，请耐心等待......",
                    duration: 0,
                    customClass: "prop-search",
                });
                let formData = new FormData();
                //formData.append('file', params.file);
                formData.append("areaCode", this.addForm.areaCode);
                formData.append("areaName", this.addForm.areaName);
                formData.append("name", this.addForm.name);
                formData.append("yearStandard", this.addForm.yearStandard);
                formData.append("yearStart", this.addForm.yearStart);
                formData.append("yearTarget", this.addForm.yearTarget);
                formData.append("planType", this.addForm.planType);
                formData.append("vectorType", this.addForm.vectorType);
                formData.append("jdName", this.addForm.jdName);
                formData.append("zippath", this.zippath);
                //formData.append('pid', !this.projectInfo.PID ? 0 : this.projectInfo.PID);
                const { data: res } = await uploaSTdData(formData);
                console.log(res, "res");
                if (res.code === 1) {
                    loading.close();
                    this.projectInfo = res.data;
                    this.getTableData();
                    //3.下一步开始上报-获取上报token接口(身份认证)
                    loading = this.$message({
                        iconClass: "el-icon-loading",
                        message: "正在获取上报身份认证......",
                        duration: 0,
                        customClass: "prop-search",
                    });
                    const { data: res1 } = await getUserToken();
                    if (res1.code === 1) {
                        let usertoken = res1.data;
                        // 4.上报项目成果文件的基本信息到上级单位
                        const { data: res2 } = await reportFileInfo({
                            projectid: this.projectInfo.PID,
                            usertoken: usertoken,
                        });
                        if (res2.code == 1) {
                            loading.close();
                            let fileid = res2.data;
                            //5.分片上传
                            loading = this.$message({
                                iconClass: "el-icon-loading",
                                message: "正在分片上传......",
                                duration: 0,
                                customClass: "prop-search",
                            });
                            const { data: res3 } = await uploadDataToLeader({
                                fileid: fileid,
                                projectid: this.projectInfo.PID,
                                usertoken: usertoken,
                            });
                            if (res3.code == 1) {
                                //6.数据合并
                                loading.close();
                                loading = this.$message({
                                    iconClass: "el-icon-loading",
                                    message: "正在合并成果文件......",
                                    duration: 0,
                                    customClass: "prop-search",
                                });
                                const { data: res4 } = await uploadDataMerge({
                                    fileid: fileid,
                                    projectid: this.projectInfo.PID,
                                    usertoken: usertoken,
                                });
                                if (res4.code == 1) {
                                    //7.提交保存项目信息
                                    loading.close();
                                    loading = this.$message({
                                        iconClass: "el-icon-loading",
                                        message:
                                            "成果文件合并完成，正在提交项目信息......",
                                        duration: 0,
                                        customClass: "prop-search",
                                    });
                                    const { data: res5 } = await saveSTProject({
                                        fileid: fileid,
                                        projectid: this.projectInfo.PID,
                                        usertoken: usertoken,
                                    });
                                    if (res5.code == 1) {
                                        loading.close();
                                        this.getTableData();
                                        this.$message.success("数据上报完成！");
                                        this.dialogAddItem = false;
                                    } else {
                                        loading.close();
                                        this.$message.error(res5.msg);
                                        this.getTableData();
                                    }
                                } else {
                                    loading.close();
                                    this.$message.error(res4.msg);
                                    this.getTableData();
                                }
                            } else {
                                loading.close();
                                this.$message.error(res3.msg);
                                this.getTableData();
                            }
                        } else {
                            loading.close();
                            this.$message.error(res2.msg);
                            this.getTableData();
                        }
                    } else {
                        loading.close();
                        this.$message.error(res1.msg);
                        this.getTableData();
                    }
                } else {
                    loading.close();
                    this.$message.error(res.msg);
                    this.dialogAddItem = false;
                    this.getTableData();
                }
            });
        },
        // 下载文件
        async handleDownload(row) {
            // 模板下载
            window.open(`${apiURL_file}/${row.FILEPATH}/${row.FILENAME}`);
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
            console.log(row);
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
        //下载成果文件
        downLoadZip(row) {
            let zippath = row.FILEPATH + "\\" + row.FILENAME;
            let filepath = zippath.substring(zippath.indexOf("FileResources"));
            window.location.href = apiURL_file + "/" + filepath;
        },
        async getSCResult(row) {
            let loading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在获取身份认证......",
                duration: 0,
                customClass: "prop-search",
            });
            const { data: res1 } = await getUserToken();
            if (res1.code === 1) {
                let usertoken = res1.data;
                loading.close();
                loading = this.$message({
                    iconClass: "el-icon-loading",
                    message: "正在获取审查结果......",
                    duration: 0,
                    customClass: "prop-search",
                });
                const { data: res2 } = await getSCReport({
                    projectid: row.PID,
                    usertoken: usertoken,
                });
                if (res2.code === 1) {
                    loading.close();
                    this.getTableData();
                    let filepath = res2.data.substring(
                        res2.data.indexOf("FileResources")
                    );
                    window.open(apiURL_file + "/" + filepath);
                   // window.location.href = apiURL_file + "/" + filepath;
                } else {
                    loading.close();
                    this.$message.error(res2.msg);
                }
            }
        },
    },
};
</script>

<style scoped lang="scss">
@import "../style/planhuijiao.scss";
</style>
<style scoped lang="scss">
div {
    box-sizing: border-box;
}

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
    }

    :deep(.el-table) {
        .cell {
            font-size: 15px;
        }

        .el-button {
            font-size: 15px;
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
<style lang="scss">
.demo-table-expand {
    font-size: 0;
    margin-left: 10px;
}

.demo-table-expand label {
    width: 150px !important;
    color: #99a9bf !important;
    font-weight: bold !important;
}

.demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 100%;
}
</style>
