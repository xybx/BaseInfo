/*
 * @Author: WCL
 * @Date: 2021-12-28 11:03:04
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-10 11:51:38
 * @FilePath: \webgis\src\views\plan\planlist\components\plandetail\js\plandetail.js
 * @Description: 项目阶段JS
 */

import {
    getList,
    getJDList,
    saveStage,
    getJDType,
    delStage,
    uploadPackage,
    createExamReport,
    checkSchemeApi,
} from "../api/plandetail-api";
import { uploadFile } from "@/utils/common-api";
import {
    getGistApi,
    getRelationApi,
} from "@/views/plan/spaceconsist/api/spaceconsist-api";
import { getEnableRelationApi } from "../api/plandetail-api";

import ResultManger from "@/components/plan/detailinfo/vue/ResultManger.vue";
import DetailInfo from "@/components/plan/detailinfo/vue/DetailInfo.vue";

import qs from "qs";
export default {
    name: "",
    props: {},
    components: { DetailInfo, ResultManger },
    data() {
        return {
            uploading: false, //文件是否在上传中
            saving: false,
            loading: true,
            searchform: {
                keywords: "",
                ghtype: "",
            },
            // 规划类型选项
            regionData: [],
            // 表格数据
            tableData: [],
            currentPage: 1,
            pagesize: 10,
            pagesizeArr: [10, 20, 50, 100],
            tableTotal: 0,
            dialogAddItem: false,
            addForm: {
                jdbh: "",
                gharea: "",
                bzunit: "",
                wtunit: "",
                wtdept: "",
                ghfw: "",
                zbfilepath: "",
                zipfilepath: "",
                scnumdesc: "",
                // sc_num:0
            },
            addFormRule: {
                jdbh: [
                    {
                        required: true,
                        message: "阶段编号不能为空",
                        trigger: "change",
                    },
                ],
                gharea: [
                    {
                        required: true,
                        message: "规划面积不能为空",
                        trigger: "blur",
                    },
                ],
                bzunit: [
                    {
                        required: true,
                        message: "编制单位不能为空",
                        trigger: "blur",
                    },
                ],
                wtunit: [
                    {
                        required: true,
                        message: "委托单位不能为空",
                        trigger: "blur",
                    },
                ],
                wtdept: [
                    {
                        required: true,
                        message: "委托部门不能为空",
                        trigger: "blur",
                    },
                ],
                ghfw: [
                    {
                        required: true,
                        message: "规划范围不能为空",
                        trigger: "blur",
                    },
                ],
            },
            jdData: [], // 项目阶段
            // 项目类型列表
            JDTypeList: [],
            // 详细信息开关
            dialogInfo: false,
            // 项目信息ID
            pid: null,
            // 项目信息/编辑开关
            showBtn: false,
            // 当前阶段信息
            currentInfo: {},
            // 成功阶段控制
            resultInfo: false,
            addTitle: "上传阶段审查成果",
            examVisible: false,
            examTree: [],
            defaultProps: {
                children: "Items",
                label: "Thematic",
            },
            gistProps: {
                children: "Items",
                label: "Name",
            },
            gistTree: [],
            currPID: null,
            examLoading: true,
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.getTableData();
    },
    methods: {
        // 模板下载
        downTemplate() {
            window.location.href =
                apiURL_file +
                "/FileResources/GHSCTemplate/规划编制项目信息和项目指标导入模板.xlsx";
        },
        //成果列表页
        reback() {
            this.$router.push("/planlist");
        },
        // 搜索项目
        onSearch() {
            console.log("搜索项目");
        },

        // 每条页数改变
        handleSizeChange(val) {
            this.pagesize = val;
        },

        // 当前页码改变
        handleCurrentChange() {
            this.currentPage = val;
        },

        // 添加阶段
        addItem() {
            this.dialogAddItem = true;

            if (this.tableData.length > 0) {
                this.addForm.wtdept = this.tableData[0].WTDEPT;
                this.addForm.wtunit = this.tableData[0].WTUNIT;
                this.addForm.gharea = this.tableData[0].GHAREA;
                this.addForm.bzunit = this.tableData[0].BZUNIT;
                this.addForm.ghfw = this.tableData[0].GHFW;
            }

            this.getJDTypeList();
        },

        // 关闭阶段
        closeAddDialog() {
            this.dialogAddItem = false;
            this.$refs.addFormRef.resetFields();
        },

        // 保存阶段
        addFormInfo() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return this.$message.error("请补充必填项");
                console.log(this.addForm, "addForm");
                if (this.uploading) {
                    this.$message.error(
                        "正在上传文件中，请等待文件上传成功，点击保存"
                    );
                    return;
                }
                this.saving = true;
                let loading = this.$message({
                    iconClass: "el-icon-loading",
                    message: "正在保存数据中,请耐心等待片刻......",
                    duration: 0,
                    customClass: "prop-search",
                });
                // PID: 0为新增
                let data = {
                    PID: 0,
                    PROJECTID: this.$route.params.pid,
                    JDBH: this.addForm.jdbh,
                    GHAREA: this.addForm.gharea,
                    BZUNIT: this.addForm.bzunit,
                    WTUNIT: this.addForm.wtunit,
                    WTDEPT: this.addForm.wtdept,
                    GHFW: this.addForm.ghfw,
                    USERID: sessionStorage.getItem("userid"),
                    ZBFILEPATH: this.addForm.zbfilepath,
                    ZIPFILEPATH: this.addForm.zipfilepath,
                    SC_NUMDESC: this.addForm.scnumdesc,
                };

                const { data: res } = await saveStage(qs.stringify(data));
                debugger;
                if (res.code === 1) {
                    this.saving = false;
                    loading.close();
                    this.$message.success("添加成功");
                    this.dialogAddItem = false;
                    this.getTableData();
                } else {
                    this.saving = false;
                    loading.close();
                    this.$message.error(res.msg);
                }
            });
        },

        // 获取项目阶段列表
        async getTableData1() {
            console.log(this.$route);
            let params = {
                prjid: this.$route.params.pid,
                keyword: "",
                currentPage: this.currentPage,
                pagesize: this.pagesize,
            };
            const { data: res } = await getList(params);
            console.log(res, "res");
            if (res.code === 1) {
                this.tableData = res.data.datas;
                this.tableTotal = res.data.total;
                this.loading = false;
            } else {
                this.$message.error(res.msg);
            }
        },

        async getTableData() {
            console.log(this.$route);
            let params = {
                prjid: this.$route.params.pid,
                keyword: "",
            };
            const { data: res } = await getJDList(params);
            console.log(res, "res");
            if (res.code === 1) {
                this.tableData = res.data.datas;
                this.tableTotal = res.data.total;
                this.loading = false;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 获取阶段类型
        async getJDTypeList() {
            const { data: res } = await getJDType();
            console.log(res, "阶段类型");
            if (res.code === 1) {
                this.JDTypeList = res.data;
            }
        },

        // 详细信息
        handleDetail(row, boo) {
            this.pid = row.PID;
            this.showBtn = boo;
            this.dialogInfo = true;
            console.log(this.pid, this.showBtn, this.dialogInfo);
        },

        // 关闭详细信息
        closePlanUser() {
            this.dialogInfo = false;
        },

        // 成功管理详细信息
        handleReslut(row, boo) {
            this.pid = row.PID;
            this.showBtn = boo;
            this.resultInfo = true;
            console.log(this.pid, this.showBtn, this.resultInfo);
        },
        // 关闭详细信息
        closeResult() {
            this.resultInfo = false;
        },

        // 删除阶段
        async handleDelete(row) {
            console.log(row);
            let params = {
                pid: row.PID,
            };
            const { data: res } = await delStage(params);
            if (res.code === 1) {
                this.$message.success("删除成功");
                this.getTableData();
            } else {
                this.$message.error(res.msg);
            }
        },

        // 上传材料
        uploadFile(row) {
            console.log(row, "row");
            this.currentInfo = row;
        },

        // 自定义上传事件，上传材料
        async handleUpload(params) {
            let loading = this.$message({
                iconClass: "el-icon-loading",
                message: "上传中...",
                duration: 0,
                customClass: "prop-search",
            });

            let form = new FormData();
            form.append("pid", this.currentInfo.PID);
            form.append("projectname", this.$route.query.name);
            form.append("file", params.file);

            debugger;
            const { data: res } = await uploadPackage(form);

            console.log(res, "upres");
            if (res.code === 1) {
                loading.close();
                this.$message.success("上传成功");
            } else {
                loading.close();
                this.$message.error(res.msg);
            }
        },

        onChange(file, fileList) {
            if (fileList.length > 1 && file.status !== "fail") {
                fileList.splice(0, 1);
            } else if (file.status === "fail") {
                this.$message.error("上传失败，请重新上传！");
                fileList.splice(0, 1);
            }
        },

        onZIPChange(file, fileList) {
            if (fileList.length > 1 && file.status !== "fail") {
                fileList.splice(0, 1);
            } else if (file.status === "fail") {
                this.$message.error("上传失败，请重新上传！");
                fileList.splice(0, 1);
            }
        },

        //上传文件
        async tempUpload(params) {
            this.uploading = true;
            let loading = this.$message({
                iconClass: "el-icon-loading",
                message: "上传中...",
                duration: 0,
                customClass: "prop-search",
            });
            let namearr = params.file.name.split(".");
            let ext = namearr[namearr.length - 1];
            //console.log(params.file,"FILE");
            let form = new FormData();
            form.append("filepath", "GHSCTemp");
            form.append("file", params.file);
            const { data: res } = await uploadFile(form);
            if (res.code === 1) {
                this.uploading = false;
                loading.close();
                if (ext.toLowerCase() == "zip") {
                    this.addForm.zipfilepath = res.data;
                } else {
                    this.addForm.zbfilepath = res.data;
                }
            } else {
                this.uploading = false;
                loading.close();
                this.$message.error(res.msg);
            }
        },

        // 审查
        async handleReview(row) {
            // 4.10 暂时注释
            // let loading = this.$message({
            //     iconClass: 'el-icon-loading',
            //     message: '正在进行成果审查......',
            //     duration: 0,
            //     customClass: 'prop-search',
            // });
            // let params = {
            //     jdid: row.PID,
            //     uid: sessionStorage.getItem('userid'),
            // };
            // const { data: res } = await createExamReport(params);
            // if (res.data != null) {
            //     this.getTableData();
            //     loading.close();
            //     window.open(apiURL_file + res.data);
            // } else {
            //     loading.close();
            //     this.$message.error(res.msg);
            // }

            this.examVisible = true;
            this.getExamData();
            console.log(row, "row");
            this.currPID = row.PID;
        },

        /* 获取审查方案列表 */
        async getExamData() {
            let params = {
                uid: sessionStorage.getItem("userid"),
            };
            const { data: res } = await getGistApi(params);
            console.log(res, "res");
            if (res.code === 1) {
                this.examTree = res.data;
            } else {
                this.$message.warning(res.msg);
            }
        },

        /* 开始方案审查 */
        async setCheckScheme() {
            debugger;
            let nodeArr = this.$refs.gistTree.getCheckedNodes();
            let pnode = this.$refs.gistPTree.getCurrentNode();
            if (!pnode) {
                return this.$message.warning("请选择审查方案");
            }
            let leafArr = [];
            nodeArr.map((item) => {
                if (item.Isleaf === 1 && item.Code) {
                    leafArr.push(item.Code);
                }
            });
            this.deCheckedKeys = leafArr;
            if (this.gistTree.length == 0)
                return this.$message.warning("审查要点为空");
            let examLoad = this.$loading({
                lock: true,
                text: "正在审查中...",
                spinner: "el-icon-loading",
                background: "rgba(0,0,0,0)",
            });
            let params = {
                jdid: this.currPID,
                uid: sessionStorage.getItem("userid"),
                checkList: leafArr.join(","),
                thematic:pnode.Thematic,
            };
            const { data: res } = await createExamReport(params);
            console.log(res, "res");
            if (res.code === 1) {
                setTimeout(() => {
                    window.open(apiURL_file + res.data);
                    // this.examLoading = false;
                    examLoad.close();
                    this.examVisible = false;
                }, 10000);
            } else {
                setTimeout(() => {
                    this.$message.warning(res.msg);
                    // this.examLoading = false;
                    examLoad.close();
                }, 10000);
            }
        },

        //复审
        async handleResetReview(row) {
            this.dialogAddItem = true;
            this.getJDTypeList();

            this.addTitle = "复审编辑阶段信息";
            this.dialogAddItem = true;
            Object.assign(this.addForm, {
                jdbh: row.JDBH,
                gharea: row.GHAREA,
                bzunit: row.BZUNIT,
                wtunit: row.WTUNIT,
                wtdept: row.WTDEPT,
                ghfw: row.GHFW,
                zbfilepath: "",
                zipfilepath: "",
                //sc_num:row.SC_NUM
            });
        },

        /*
            点击左侧审查数据
            !暂定只有两个层级
        */
        async handleExamTree(data, node) {
            console.log(data, "data");
            console.log(node, "node");
            if (node.level === 2) {
                let params = {
                    uid: sessionStorage.getItem("userid"),
                    name: data.Thematic,
                };
                const { data: res } = await getEnableRelationApi(params);
                if (res.code === 1) {
                    this.gistTree = res.data;
                    this.$nextTick(() => {
                        this.$refs.gistTree.setCheckedNodes(this.gistTree);
                    });
                } else {
                    this.$message.warning(res.msg);
                }
            } else {
                this.gistTree = [];
            }
        },

        /*
            审查结论
            !暂时传固定值
        */
        handleConclusion(row) {
            console.log(row, "row");
            this.$router.push({
                path: "/spaceaccess",
                query: {
                    pid: row.PID,
                },
            });
        },

        /* 审查方案弹窗关闭 */
        handleClose() {
            this.examVisible = false;
        },
    },
};
