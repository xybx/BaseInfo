<template>
    <div class="container">
        <div class="tree">
            <div class="cont-head">指标体系目录</div>
            <div class="input-box">
                <el-input
                    placeholder="输入关键字进行搜索"
                    v-model="filterText"
                    size="small"
                    style="width: 80%"
                >
                </el-input>
                <el-button type="primary" @click="onSearch" size="small"
                    >搜索</el-button
                >
            </div>
            <el-tree
                :data="tableData"
                :props="defaultProps"
                ref="gistTree"
                @node-click="handleTree"
                :expand-on-click-node="false"
            >
                <span slot-scope="scope">
                    <span v-if="scope.data.PARENTID == 0">{{
                        scope.data.YEAR
                    }}</span>
                    {{ scope.data.NAME }}
                    <span style="color: blue"
                        >(<span style="color: green">{{
                            scope.data.VALUECOUNT
                        }}</span
                        >/{{ scope.data.ZBCOUNT }})</span
                    >
                </span>
            </el-tree>
            <el-pagination
                small
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-size="pagesize"
                :page-sizes="pagesizeArr"
                layout="total,  prev, pager, next"
                :total="tableTotal"
                background
                style="bottom: 5px; position: absolute"
            >
            </el-pagination>
        </div>
        <div class="table">
            <el-form
                ref="searchform"
                :inline="true"
                style="padding-bottom: 10px"
            >
                <el-input
                    v-model="ZBListDialog.searchkey"
                    size="small"
                    placeholder="指标名称/指标编码/指标分类"
                    style="width: 400px"
                    clearable
                    @clear="InputClear"
                >
                </el-input
                ><el-button type="primary" @click="onZBSearch" size="small"
                    >立即搜索</el-button
                >
            </el-form>
            <!-- 顶部表单 -->
            <div
                class="handle-box"
                style="padding-bottom: 10px; right: 50px; position: absolute"
            >
                <!-- <el-button type="primary" icon="el-icon-plus" @click="addZBSys">新增指标体系</el-button> -->
                <el-button
                    type="success"
                    icon="el-icon-download"
                    @click="downTemplate"
                    >下载导入指标值模板</el-button
                >

                <el-upload
                    style="display: inline; padding: 5px"
                    class="tem-upload"
                    ref="tempUpload"
                    action="action"
                    :http-request="tempUpload"
                    :show-file-list="false"
                    accept=".xlsx"
                >
                    <el-button
                        type="primary"
                        size="small"
                        icon="el-icon-upload2"
                    >
                        导入指标值
                    </el-button>
                </el-upload>
                <el-button
                    type="primary"
                    icon="el-icon-download"
                    @click="ExportExcel"
                    >导出数据表</el-button
                >
            </div>
            <el-table
                :data="ZBListDialog.zblist"
                border
                class="table"
                ref="zbTable"
                header-cell-class-name="table-header"
                v-loading="ZBListDialog.tableloading"
                row-key="PID"
                stripe
            >
                <el-table-column type="selection" width="55" reserve-selection>
                </el-table-column>
                <el-table-column
                    prop="PID"
                    label="ID"
                    width="120"
                    align="center"
                ></el-table-column>
                <el-table-column
                    prop="TYPENAME"
                    label="所属分类"
                    align="center"
                    width="180"
                ></el-table-column>
                <el-table-column
                    prop="NAME"
                    label="指标名称"
                    align="center"
                    width="300"
                ></el-table-column>
                <el-table-column
                    prop="CODE"
                    label="指标编码"
                    align="center"
                    width="150"
                ></el-table-column>
                <el-table-column prop="VALUE" label="指标值" align="center">
                    <template v-slot="scope">
                        <el-input
                            v-if="scope.row.ISEDIT == 1"
                            v-model="scope.row.VALUE"
                            size="small"
                            placeholder="请输入指标值"
                            style="width: 160px"
                        ></el-input>
                        <span v-else>{{ scope.row.VALUE }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="UNIT"
                    label="指标单位"
                    align="center"
                    width="300"
                >
                    <template v-slot="scope">
                        <el-input
                            v-if="scope.row.ISEDIT == 1"
                            v-model="scope.row.UNIT"
                            size="small"
                            placeholder="请输入指标单位"
                            style="width: 160px"
                        ></el-input>
                        <span v-else>{{ scope.row.UNIT }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200">
                    <template v-slot="scope">
                        <el-button
                            v-if="scope.row.ISEDIT == 1"
                            type="success"
                            plain
                            size="mini"
                            @click="handleSaveValue(scope.row)"
                            title="点完成保存当前项的修改"
                            >完成</el-button
                        >
                        <el-button
                            type="primary"
                            v-if="scope.row.ISEDIT == 0"
                            plain
                            size="mini"
                            @click="handleEditValue(scope.row)"
                            >修改值</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChangeZB"
                @current-change="handleCurrentChangeZB"
                :current-page.sync="ZBListDialog.currentPage"
                :page-size="ZBListDialog.pagesize"
                :page-sizes="ZBListDialog.pagesizeArr"
                layout="total, sizes, prev, pager, next, jumper"
                :total="ZBListDialog.tableTotal"
                background
            >
            </el-pagination>
        </div>

        <!-- 新增/编辑弹窗 -->
        <!-- <el-dialog :title="setTitle" :visible.sync="setVisible" width="35%" custom-class="set-dialog"
            @close="closedSetDialog" :close-on-click-modal="false">
            <el-form ref="setForm" :model="setForm" label-width="auto" class="set-form" :rules="setFormRules">
                <el-form-item :label="!addType ? '指标体系名称' : '分类名称'" prop="NAME">
                    <el-input v-model.trim="setForm.NAME" placeholder="请输入指标体系名称(必填)"></el-input>
                </el-form-item>
                <el-form-item label="指标体系类型" prop="TYPEID" v-if="!addType">
                    <el-select v-model="setForm.TYPEID" placeholder="请选择指标体系类型(必选)" size="small">
                        <el-option v-for="item in sysTypes" :label="item.DICTNAME" :value="String(item.DICTVALUE)"
                            :key="item.PID"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属年份" prop="YEAR" v-if="!addType">
                    <el-date-picker v-model.trim="setForm.YEAR" type="year" format="yyyy" value-format="yyyy"
                        placeholder="请选择年份(必填)">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveZBSYS">确 定</el-button>
            </span>
        </el-dialog> -->
        <!--已关联/未关联指标列表-->
        <!-- <el-dialog :title="ZBListDialog.setTitle" :visible.sync="ZBListDialog.setVisible" width="45%"
            custom-class="set-dialog" @close="closedSetZBDialog" :close-on-click-modal="false">
            <div style="padding-bottom: 10px;">
                <el-input v-model="ZBListDialog.searchkey" size="small" placeholder="指标名称/指标编码/指标分类" style="width: 400px;"
                    clearable @clear="InputClear">
                </el-input><el-button type="primary" @click="onZBSearch" size="small">立即搜索</el-button>
            </div>
            <el-table
                :data="ZBListDialog.zblist.slice((ZBListDialog.currentPage - 1) * ZBListDialog.pagesize, ZBListDialog.currentPage * ZBListDialog.pagesize)"
                border class="table" ref="zbTable" header-cell-class-name="table-header" v-loading="tableloading"
                row-key="PID" stripe>
                <el-table-column type="selection" width="55" reserve-selection>
                </el-table-column>
                <el-table-column prop="PID" label="ID" width="120" align="center"></el-table-column>
                <el-table-column prop="NAME" label="指标名称" align="center"></el-table-column>
                <el-table-column prop="CODE" label="指标编码" align="center"></el-table-column>
                <el-table-column prop="TYPENAME" label="所属分类" align="center"></el-table-column>               
            </el-table>
            <el-pagination @size-change="handleSizeChangeZB" @current-change="handleCurrentChangeZB"
                :current-page.sync="ZBListDialog.currentPage" :page-size="ZBListDialog.pagesize"
                :page-sizes="ZBListDialog.pagesizeArr" layout="total, sizes, prev, pager, next, jumper"
                :total="ZBListDialog.tableTotal" background>
            </el-pagination>
            <br />
            <el-checkbox v-if="ZBListDialog.type == 0 && this.ZBListDialog.currentSys.PARENTID == 0"
                v-model="ZBListDialog.zbchecked" style="color: green;font-weight: bold;">是否复制指标分类为当前指标体系的子分类</el-checkbox>
            <span slot="footer" class="dialog-footer">
                <el-button @click="ZBListDialog.setVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveZBs()" v-if="ZBListDialog.type == 0">确 定</el-button>
                <el-button type="danger" @click="deleteZBs()" v-if="ZBListDialog.type == 1">删 除</el-button>
            </span>
        </el-dialog> -->
    </div>
</template>

<script>
import { keyword } from "color-convert";
import {
    getSysList,
    getSysTypeList,
    SaveZBValue,
    GetZBValueList,
    saveZBList,
    deleteZBList,
    importValueExcel,
    ExportValueExcel,
} from "../api/indexmanage-api";
import { uploadFile } from "@/utils/common-api";
export default {
    name: "",
    props: {},
    components: {},
    data() {
        return {
            defaultProps: {
                children: "CHILDREN",
                label: "NAME",
            },
            filterText: "",
            tableloading: true,
            tableData: [],
            sysTypes: [],
            currentPage: 1,
            pagesize: 15,
            pagesizeArr: [20, 40, 60, 100],
            tableTotal: 0,
            setTitle: "新增",
            setVisible: false,
            ZBListDialog: {
                tableloading: true,
                zblist: [],
                zblistAll: [],
                currentPage: 1,
                pagesize: 15,
                pagesizeArr: [15, 30, 50, 100],
                tableTotal: 0,
                currentSys: null,
                searchkey: "",
            },
            currentSysPID: 0,
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.pagesize = this.pagesizeArr[0];
        this.getData();
        this.getZBList();
    },
    methods: {
        //指标体系目录的点击事件
        async handleTree(data, node) {
            debugger;
            console.log("NODE", node);
            if (node.level === 1) {
                this.currentSysPID = data.PID;
            } else if (node.level === 2) {
                this.currentSysPID = node.parent.data.PID;
            } else if (node.level === 3) {
                this.currentSysPID = node.parent.parent.data.PID;
            }

            this.ZBListDialog.currentSys = data;
            this.ZBListDialog.currentPage = 1;
            this.getZBList();
        },

        //搜索
        onSearch() {
            this.getData();
        },
        // 获取指标体系列表数据
        async getData() {
            debugger;
            let params = {
                uid: window.sessionStorage.getItem("userid"),
                typeid: 0,
                year: 0,
                keyword: this.filterText,
                currentpage: this.currentPage,
                pagesize: this.pagesize,
            };
            const { data: res } = await getSysList(params);
            if (res.code === 1) {
                this.tableloading = false;
                this.tableTotal = res.data.total;
                this.tableData = res.data.datas;
                console.log(this.tableData, "tableData");
            } else {
                this.tableloading = false;
                this.$message.error(res.msg);
            }
        },
        //获取指标体系类型
        async getSysTypes() {
            const { data: res } = await getSysTypeList();
            if (res.code == 1) {
                this.sysTypes = res.data;
            }
        },
        // 每条页数改变
        handleSizeChange(val) {
            this.pagesize = val;
            this.getData();
        },

        // 当前页码改变
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getData();
        },

        //获取指标列表
        async getZBList() {
            let params = {
                syspid: this.ZBListDialog.currentSys
                    ? this.ZBListDialog.currentSys.PID
                    : 0,
                keyword: this.ZBListDialog.searchkey,
                pagesize: this.ZBListDialog.pagesize,
                currentpage: this.ZBListDialog.currentPage,
            };
            const { data: res } = await GetZBValueList(params);
            if (res.code === 1) {
                this.ZBListDialog.tableloading = false;
                this.ZBListDialog.tableTotal = res.data.total;
                this.ZBListDialog.zblist = res.data.datas;
                this.ZBListDialog.zblistAll = this.ZBListDialog.zblist;
                this.$refs.zbTable.clearSelection();
                //console.log(this.tableData, 'tableData');
            } else {
                this.ZBListDialog.tableloading = false;
                this.$message.error(res.msg);
            }
        },

        //修改指标值
        handleEditValue(row) {
            row.ISEDIT = 1;
        },

        //保存 指标值修改
        async handleSaveValue(row) {
            let data = {
                // syspid: this.currentSysPID,
                pid: row.PID,
                value: row.VALUE,
                unit: row.UNIT,
            };
            const { data: res } = await SaveZBValue(data);
            if (res.code === 1) {
                this.$message.success("保存成功");
                this.getZBList();
                this.getData();
            } else {
                this.$message.error(res.msg);
            }
        },
        //保存选择的关联指标项
        async saveZBs() {
            let loading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在保存关联指标...",
                duration: 0,
                customClass: "prop-search",
            });
            //获取所有选中行
            let selectrows = this.$refs.zbTable.selection;
            console.log(selectrows, "selectrows");
            if (selectrows.length == 0) {
                this.$message.warning("请选择要关联的指标项");
                return;
            }
            let selectZBList = [];
            selectrows.forEach((row) => {
                selectZBList.push({ CODE: row.CODE, NAME: row.NAME });
            });

            let data = {
                zblist: selectZBList,
                iscopytype: this.ZBListDialog.zbchecked ? 1 : 0,
                syspid: this.ZBListDialog.currentSys.PID,
            };
            const { data: res } = await saveZBList(data);
            if (res.code === 1) {
                loading.close();
                this.$message.success("保存成功");
                this.ZBListDialog.setVisible = false;
                this.getData();
            } else {
                loading.close();
                this.$message.error(res.msg);
            }
        },
        //批量删除已关联指标
        async deleteZBs() {
            //获取所有选中行
            let selectrows = this.$refs.zbTable.selection;
            if (selectrows.length == 0) {
                this.$message.warning("请选择要删除的指标项");
                return;
            }
            let zbpids = [];
            selectrows.forEach((row) => {
                zbpids.push(row.PID);
            });
            const { data: res } = await deleteZBList(zbpids);
            if (res.code === 1) {
                this.$message.success("删除成功");
                this.getZBList(
                    this.ZBListDialog.currentSys,
                    this.ZBListDialog.type
                );
                //this.ZBListDialog.setVisible = false;
            } else {
                this.$message.error(res.msg);
            }
        },
        // 每条页数改变
        handleSizeChangeZB(val) {
            this.ZBListDialog.pagesize = val;
            this.getZBList();
        },

        // 当前页码改变
        handleCurrentChangeZB(val) {
            this.ZBListDialog.currentPage = val;
            this.getZBList();
        },

        // 模板下载
        downTemplate() {
            window.location.href =
                apiURL_file + "/FileResources/Template/指标值导入模板.xlsx";
        },

        onChange(file, fileList) {
            if (fileList.length > 1 && file.status !== "fail") {
                fileList.splice(0, 1);
            } else if (file.status === "fail") {
                this.$message.error("上传失败，请重新上传！");
                fileList.splice(0, 1);
            }
        },

        //上传文件
        async tempUpload(params) {
            //this.uploading = true;
            let loading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在导入excel...",
                duration: 0,
                customClass: "prop-search",
            });
            let namearr = params.file.name.split(".");
            let ext = namearr[namearr.length - 1];
            //console.log(params.file,"FILE");
            let form = new FormData();
            form.append("filepath", "ZBTXExcel");
            form.append("file", params.file);
            const { data: res } = await uploadFile(form);
            if (res.code === 1) {
                const { data: resdata } = await importValueExcel({
                    filepath: res.data,
                });
                if (resdata.code === 1) {
                    loading.close();
                    this.getData();
                    this.getZBList();
                } else {
                    loading.close();
                    this.$message.error(resdata.msg);
                }
            } else {
                this.uploading = false;
                loading.close();
                this.$message.error(res.msg);
            }
        },

        //导出数据表
        async ExportExcel() {
            let loading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在导出数据excel...",
                duration: 0,
                customClass: "prop-search",
            });
            const { data: res } = await ExportValueExcel();
            if (res.code === 1) {
                loading.close();
                let filepath = res.data.substring(
                    res.data.indexOf("FileResources")
                );
                window.location.href = apiURL_file + "/" + filepath;
                //console.log(res.data,"ExportExcel");
            } else {
                loading.close();
                this.$message.error(res.msg);
            }
        },
        onZBSearch() {
            this.getZBList();
        },
        //清空搜索框
        InputClear() {
            this.getZBList();
        },
    },
};
</script>

<style scoped lang="scss">
.container {
    height: 100%;
    display: flex;
    padding: 10px;
    box-sizing: border-box;
}

.tree {
    position: relative;
    width: 400px;
    border: 1px solid #ccc;
    margin-right: 10px;

    .cont-head {
        height: 40px;
        background-color: $el-main-color;
        line-height: 40px;
        text-align: center;
        font-size: 16px;
        color: #fff;
    }

    .input-box {
        padding: 10px;
        box-sizing: border-box;
    }

    :deep(.el-tree-node__label) {
        font-size: 15px;
    }
}

.table {
    flex: 1;
    // border: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    overflow-x: auto;

    .add-top-btn {
        width: 200px;
    }

    :deep(.el-table) {
        flex: 1;
        overflow-y: auto;

        th {
            text-align: center;

            .cell {
                text-align: center;
            }
        }

        .cell {
            font-size: 15px;
        }

        .el-button {
            font-size: 15px;
        }
    }

    .add-top-btn {
        margin: 5px;
    }
}
</style>
