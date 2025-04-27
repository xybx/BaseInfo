<!--
 * @Author: LJX
 * @Date: 2021-12-22 11:02:29
 * @LastEditors: LJX
 * @LastEditTime: 2023-01-04 14:37:44
 * @FilePath: \webgis\src\views\plan\planhuijiao\vue\PlanHuiJiaoXQ.vue
 * @Description: 规划审查-数据汇交（县区上报）
-->
<template>
    <div>
        <div class="content">
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
                                {{ props.row.YEAREND }}
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
                            <el-form-item label="文件分片后的总数">
                                {{ props.row.FRAGMENT_NUMS }}
                            </el-form-item>
                            <el-form-item label="上报的用户信息">
                                {{ props.row.USERINFO }}
                            </el-form-item>
                        </el-form>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="PID"
                    label="序号"
                    min-width="80"
                    align="center"
                ></el-table-column>
                <el-table-column
                    prop="AREACODE"
                    label="行政区"
                    min-width="80"
                    width="180"
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
                </el-table-column>
                <el-table-column
                    prop="JDINFO"
                    label="规划成果阶段"
                    align="center"
                    min-width="100"
                >
                </el-table-column>
                <el-table-column
                    prop="NAME"
                    label="规划成果名称"
                    min-width="100"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    prop="FILENAME"
                    label="成果文件名称"
                    align="center"
                    min-width="250"
                >
                    <template v-slot="scope">
                        <a
                            style="cursor: pointer; text-decoration: underline"
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
                    prop="SC_STATUSNAME"
                    label="审查状态"
                    width="180"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    label="操作"
                    min-width="200"
                    align="center"
                    class-name="handle-col"
                >
                    <template slot-scope="scope">
                        <el-button
                            size="mini"
                            type="success"
                            @click="lookZip(scope.row)"
                            >查看成果</el-button
                        >
                        <el-button
                            v-if="scope.row.SC_STATUS < 2"
                            size="mini"
                            type="warning"
                            @click="handleReview(scope.row)"
                            >成果审查</el-button
                        >
                        <!-- <el-button size="mini" type="success" @click="lookZip(scope.row)">下载成果</el-button>  -->
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

        <!-- 查看成果管理 -->
        <result-manger
            v-if="resultInfo"
            :resultInfo="resultInfo"
            :pid="pid"
            :source="3"
            :showBtn="false"
            @closePlanUser="closeResult()"
        ></result-manger>
    </div>
</template>

<script>
import {
    getType,
    getLowerList,
    ByteToZip,
    createExamReport,
} from "../api/planhuijiao-api";
import {
    getGistApi,
    getRelationApi,
} from "@/views/plan/spaceconsist/api/spaceconsist-api";
import {
    getJDType,
    getEnableRelationApi,
} from "../../planlist/components/plandetail/api/plandetail-api";
import ResultManger from "@/components/plan/detailinfo/vue/ResultManger.vue";
export default {
    name: "",
    props: {},
    components: { ResultManger },
    data() {
        return {
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
        this.pagesize = this.pagesizeArr[0];
        this.getTableData();
        //this.getJUserToken();
    },
    methods: {
        /* 审查方案弹窗关闭 */
        handleClose() {
            this.examVisible = false;
        },
        // 审查
        async handleReview(row) {
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
                pid: this.currPID,
                uid: sessionStorage.getItem("userid"),
                checkList: leafArr.join(","),
                thematic: pnode.Thematic,
            };
            const { data: res } = await createExamReport(params);
            console.log(res, "res");
            if (res.code === 1) {
                setTimeout(() => {
                    let filepath = res.data.substring(
                        res.data.indexOf("FileResources")
                    );
                    window.open(apiURL_file + "/" + filepath);
                    // this.examLoading = false;
                    examLoad.close();
                    this.examVisible = false;
                    this.getTableData();
                }, 5000);
            } else {
                setTimeout(() => {
                    this.$message.warning(res.msg);
                    // this.examLoading = false;
                    examLoad.close();
                }, 5000);
            }
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

        //下载成果文件
        async downLoadZip(row) {
            debugger;
            if (row.ZIPPATH == "" || row.ZIPPATH == null) {
                this.$message.error(
                    "成果文件缺少，请联系相关工作人员重新上传！"
                );
            } else {
                let filepath = row.ZIPPATH.substring(
                    row.ZIPPATH.indexOf("FileResources")
                );
                window.location.href = apiURL_file + "/" + filepath;
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
            const { data: res } = await getLowerList(params);
            if (res.code === 1) {
                // this.tableData = res.data.datas;
                // this.tableTotal = res.data.total;
                this.tableData = res.data.datas;
                this.tableTotal = res.data.total;
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

        // 下载文件
        // async handleDownload(row) {
        //     // 模板下载
        //     window.open(
        //         `${apiURL_file}/${row.FILEPATH}/${row.FILENAME}`
        //     );
        // },
        lookZip(row) {
            this.pid = row.PID;
            this.resultInfo = true;
            console.log(this.pid, this.resultInfo);
        },
        // 关闭查看成果弹框
        closeResult() {
            this.resultInfo = false;
        },
    },
};
</script>

<style scoped lang="scss">
@import "../style/planhuijiao.scss";
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
