<template>
    <div class="container">
        <el-form ref="searchform" :model="searchForm" :inline="true" style="float: left">
            <el-form-item label="">
                <el-select v-model="searchForm.typeid" placeholder="请选择指标体系类型" size="small" clearable>
                    <el-option v-for="item in sysTypes" :label="item.DICTNAME" :value="item.DICTVALUE" :key="item.PID">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="">
                <el-date-picker v-model.trim="searchForm.year" type="year" format="yyyy" value-format="yyyy"
                    placeholder="请选择年份">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="">
                <el-input v-model="searchForm.searchkey" size="small" placeholder="请输入指标体系名称" style="width: 400px;"
                    clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSearch" size="small">立即搜索</el-button>
            </el-form-item>
        </el-form>

        <!-- 顶部表单 -->
        <div class="handle-box" style="float: right;">
            <el-button type="primary" icon="el-icon-plus" @click="addZBSys">新增指标体系</el-button>
            <el-button type="success" icon="el-icon-download" @click="downTemplate">下载导入Excel模板</el-button>
            <!-- <el-button type="primary" icon="el-icon-upload2" @click="openImportExcel">导入Excel</el-button> -->
            <el-upload style="display:inline;padding: 5px;" class="tem-upload" ref="tempUpload" action="action"
                :http-request="tempUpload" :show-file-list="false" accept=".xlsx">
                <el-button type="primary" size="small" icon="el-icon-upload2">
                    导入Excel
                </el-button>
            </el-upload>
            <el-button type="primary" icon="el-icon-download" @click="ExportExcel">导出数据表</el-button>
        </div>

        <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"
            v-loading="tableloading" row-key="PID" :tree-props="{ children: 'CHILDREN' }" stripe>
            <el-table-column prop="NAME" label="名称(已填报数量/总指标数量)" align="letf">
                <template v-slot="scope">
                    {{ scope.row.NAME }} <span style="color:blue;">(<span style="color: green;">{{ scope.row.VALUECOUNT
                    }}</span>/{{
    scope.row.ZBCOUNT }})</span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="PID" label="ID" width="120" align="center"></el-table-column> -->
            <el-table-column prop="YEAR" label="所属年份" align="center" width="100"></el-table-column>

            <el-table-column prop="TYPENAME" label="指标体系类型" align="center" width="300">
            </el-table-column>
            <el-table-column label="操作" align="left" width="550">
                <template v-slot="scope">
                    <el-button type="success" plain size="mini" @click="editZBSys(scope.row)">编辑</el-button>
                    <el-button type="success" plain size="mini" v-if="scope.row.CHILDREN"
                        @click="addZBSysCategroy(scope.row)">新建分类</el-button>
                    <el-button type="primary" plain size="mini" @click="openZBDialog(scope.row, 1)">已关联指标</el-button>
                    <el-button type="primary" plain size="mini" @click="openZBDialog(scope.row, 0)">关联指标</el-button>
                    <el-button type="warning" plain size="mini" @click="copySysDialog(scope.row)"
                        v-if="scope.row.PARENTID == 0">复制体系</el-button>
                    <el-popconfirm style="padding-left: 10px;" title="删除当前数据的同时会关联删除当前数据下的子分类和指标数据，确定要删除吗？"
                        @confirm="handleDeleteSys(scope.row)">
                        <el-button type="danger" size="mini" plain slot="reference">删除</el-button></el-popconfirm>
                    <!-- <el-button type="danger" plain size="mini" @click="handleDeleteSys(scope.row)">删除</el-button> -->
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page.sync="currentPage" :page-size="pagesize" :page-sizes="pagesizeArr"
            layout="total, sizes, prev, pager, next, jumper" :total="tableTotal" background>
        </el-pagination>

        <!-- 新增/编辑弹窗 -->
        <el-dialog :title="setTitle" :visible.sync="setVisible" width="35%" custom-class="set-dialog"
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
        </el-dialog>
        <!--已关联/未关联指标列表-->
        <el-dialog :title="ZBListDialog.setTitle" :visible.sync="ZBListDialog.setVisible" width="45%"
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
                <el-table-column prop="PID" label="ID" width="80" align="center"></el-table-column>
                <el-table-column prop="NAME" label="指标名称" align="center"></el-table-column>
                <el-table-column prop="CODE" label="指标编码" align="center"></el-table-column>
                <el-table-column prop="TYPENAME" label="所属分类" align="center" width="200"></el-table-column>
                <!-- <el-table-column label="操作" align="center" v-if="ZBListDialog.type == 1"  width="280">
                    <template v-slot="scope">
                        <el-button type="success" plain size="mini" @click="handleDeleteSys(scope.row)">元数据配置</el-button>
                        <el-button type="success" plain size="mini" @click="handleDeleteSys(scope.row)">构建指标算法</el-button>
                    </template>
                </el-table-column> -->
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
        </el-dialog>

        <!--导入excel-->
        <el-dialog title="导入Excel" :visible.sync="ImportExcel.setVisible" width="25%" custom-class="set-dialog"
            @close="closedSetZBDialog" :close-on-click-modal="false">
            <el-form label-width="auto" class="set-form">
                <el-form-item label="指标体系类型" prop="typeid">
                    <el-select v-model="ImportExcel.typeid" placeholder="请选择指标体系类型(必选)" size="small">
                        <el-option v-for="item in sysTypes" :label="item.DICTNAME" :value="String(item.DICTVALUE)"
                            :key="item.PID"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="导入Excel">
                    <el-upload class="tem-upload" ref="tempUpload" action="action" :http-request="tempUpload"
                        :on-change="onChange" :show-file-list="true" accept=".xlsx">
                        <el-button type="primary" size="small" icon="el-icon-upload2">
                            导入Excel
                        </el-button>
                    </el-upload>
                    <a style="color: green; cursor: pointer" @click="downTemplate">下载导入Excel模板</a>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveZBSYS">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
import { keyword } from 'color-convert';
import { CopySys, getSysList, getSysTypeList, saveZBSys, deleteZBSys, getZBList, saveZBList, deleteZBList, importExcel, ExportExcel } from '../api/indexmanage-api';
import { uploadFile } from '@/utils/common-api';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            tableloading: true,
            searchForm: {
                searchkey: '',
                typeid: '',
                year: ''
            },
            tableData: [],
            sysTypes: [],
            currentPage: 1,
            pagesize: 10,
            pagesizeArr: [10, 20, 50, 100],
            tableTotal: 0,
            setTitle: '新增',
            setVisible: false,
            setForm: {
                PID: 0,
                NAME: '',
                PARENTID: 0,
                TYPEID: '',
                YEAR: '',
                STATUS: 1,
            },
            addType: false,//true:新增分类，false:新增编辑体系
            setFormRules: {
                NAME: [
                    {
                        required: true,
                        message: '指标体系名称不能为空',
                        trigger: 'blur',
                    },
                ],
                TYPEID: [
                    {
                        required: true,
                        message: '请选择指标体系类型',
                        trigger: 'change',
                    },
                ],
                YEAR: [
                    {
                        required: true,
                        message: '请选择年份',
                        trigger: 'change',
                    },
                ],
            },
            ZBListDialog: {
                zbchecked: true,
                tableloading: true,
                setTitle: '已关联指标列表',
                setVisible: false,
                zblist: [],
                zblistAll: [],
                currentPage: 1,
                pagesize: 10,
                pagesizeArr: [10, 20, 50, 100],
                tableTotal: 0,
                type: 1, //type:1已关联，0：未关联
                currentSys: null,
                searchkey: '',
            },
            ImportExcel: {
                typeid: '',
                setVisible: false,
            },
            //当前选中table行
            currentRow: null,

        };
    },
    computed: {},
    watch: {},
    created() { },
    mounted() {
        this.pagesize = this.pagesizeArr[0];
        this.getData();
        this.getSysTypes();
    },
    methods: {
        //复制体系
        copySysDialog(row) {
            this.currentRow = row;
            this.addType = false;
            this.setTitle = '复制体系';
            this.setVisible = true;
            // Object.assign(this.setForm,row);
            this.setForm.PID = 0;
            this.setForm.NAME = row.NAME;
            this.setForm.TYPEID = String(row.TYPEID);
            this.setForm.YEAR = '';
            this.setForm.PARENTID =row.PID;
        },
        //搜索
        onSearch() {
            this.getData();
        },
        // 获取指标体系列表数据
        async getData() {
            let params = {
                uid: window.sessionStorage.getItem("userid"),
                typeid: !this.searchForm.typeid ? 0 : this.searchForm.typeid,
                year: !this.searchForm.year ? 0 : this.searchForm.year,
                keyword: this.searchForm.searchkey,
                currentpage: this.currentPage,
                pagesize: this.pagesize,
            };
            const { data: res } = await getSysList(params);
            if (res.code === 1) {
                this.tableloading = false;
                this.tableTotal = res.data.total;
                this.tableData = res.data.datas;
                console.log(this.tableData, 'tableData');
            }
            else {
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

        //关闭新增编辑指标体系弹窗
        closedSetDialog() {
            //this.setVisible=false;
            this.$refs.setForm.resetFields();
            this.setForm = this.$options.data().setForm;
        },
        //新增指标体系
        addZBSys() {
            this.addType = false;
            this.setTitle = '新增';
            this.setVisible = true;
            Object.assign(this.setForm, { PID: 0 });
        },
        //编辑
        editZBSys(row) {
            this.addType = row.PARENTID > 0 ? true : false;
            this.setTitle = row.PARENTID > 0 ? '编辑分类' : "编辑";
            this.setVisible = true;
            // Object.assign(this.setForm,row);
            this.setForm.PID = row.PID;
            this.setForm.NAME = row.NAME;
            this.setForm.TYPEID = String(row.TYPEID);
            this.setForm.YEAR = String(row.YEAR);
            this.setForm.PARENTID = row.PARENTID;
        },
        //新建分类
        addZBSysCategroy(row) {
            debugger;
            this.addType = true;
            this.setTitle = '新增分类';
            this.setVisible = true;
            Object.assign(this.setForm, { PID: 0, PARENTID: row.PID, TYPEID: row.TYPEID, YEAR: row.YEAR });
        },
        //保存指标体系
        saveZBSYS() {
            debugger;
            this.$refs.setForm.validate(async (valid) => {
                if (!valid) return this.$message.warning('请补充必填项');
                // PID 新增传0                
                if (this.setForm.PARENTID > 0 && !this.addType) {
                    const { data: res } = await CopySys(this.setForm);
                    if (res.code === 1) {
                        this.$message.success(this.setTitle + '成功');
                        this.setVisible = false;
                        this.currentPage = 1;
                        this.getData();
                    } else {
                        this.$message.error(res.msg);
                    }
                }
                else {
                    const { data: res } = await saveZBSys(this.setForm);
                    if (res.code === 1) {
                        this.$message.success(this.setTitle + '成功');
                        this.setVisible = false;
                        this.currentPage = 1;
                        this.getData();
                    } else {
                        this.$message.error(res.msg);
                    }
                }
            });
        },
        //删除指标体系
        async handleDeleteSys(row) {
            debugger;
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '正在删除指标体系...',
                duration: 0,
                customClass: 'prop-search',
            });
            const { data: res } = await deleteZBSys({ pid: row.PID });
            if (res.code === 1) {
                loading.close();
                this.$message.success('删除成功');
                this.getData();
            } else {
                loading.close();
                this.$message.error(res.msg);
            }
        },
        //打开指标列表窗口 type:1已关联，0：未关联
        openZBDialog(row, type) {
            this.ZBListDialog.currentSys = row;

            this.ZBListDialog.type = type;
            this.ZBListDialog.setVisible = true;
            this.ZBListDialog.setTitle = type == 0 ? "未关联指标列表" : "已关联指标列表";
            this.ZBListDialog.currentPage = 1;
            this.getZBList(row, type);

        },
        //关闭指标列表窗口
        closedSetZBDialog() {
            this.ZBListDialog.setVisible = false;
        },
        //获取指标列表
        async getZBList(row, type) {
            let params = {
                syspid: row.PID,
                type: type,
            };
            const { data: res } = await getZBList(params);
            if (res.code === 1) {
                this.ZBListDialog.tableloading = false;
                this.ZBListDialog.tableTotal = res.data.length;
                this.ZBListDialog.zblist = res.data;
                this.ZBListDialog.zblistAll = this.ZBListDialog.zblist;
                this.$refs.zbTable.clearSelection();
                //console.log(this.tableData, 'tableData');
            }
            else {
                this.ZBListDialog.tableloading = false;
                this.$message.error(res.msg);
            }
        },

        //保存选择的关联指标项
        async saveZBs() {
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '正在保存关联指标...',
                duration: 0,
                customClass: 'prop-search',
            });
            //获取所有选中行
            let selectrows = this.$refs.zbTable.selection;
            console.log(selectrows, "selectrows");
            if (selectrows.length == 0) {
                this.$message.warning("请选择要关联的指标项");
                return;
            }
            let selectZBList = [];
            selectrows.forEach(row => {
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
                this.$message.success('保存成功');
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
            selectrows.forEach(row => {
                zbpids.push(row.PID);
            });
            const { data: res } = await deleteZBList(zbpids);
            if (res.code === 1) {
                this.$message.success('删除成功');
                this.getZBList(this.ZBListDialog.currentSys, this.ZBListDialog.type);
                this.getData();
                //this.ZBListDialog.setVisible = false;
            } else {
                this.$message.error(res.msg);
            }
        },
        // 每条页数改变
        handleSizeChangeZB(val) {
            this.ZBListDialog.pagesize = val;
            // this.getZBList();
        },

        // 当前页码改变
        handleCurrentChangeZB(val) {
            this.ZBListDialog.currentPage = val;
            // this.getZBList();
        },

        // 模板下载
        downTemplate() {
            window.location.href =
                apiURL_file +
                '/FileResources/Template/指标体系导入模板.xlsx';
        },

        //打开导入import弹框
        openImportExcel() {
            this.ImportExcel.setVisible = true;
        },


        onChange(file, fileList) {
            if (fileList.length > 1 && file.status !== 'fail') {
                fileList.splice(0, 1);
            } else if (file.status === 'fail') {
                this.$message.error('上传失败，请重新上传！');
                fileList.splice(0, 1);
            }
        },


        //上传文件
        async tempUpload(params) {
            //this.uploading = true;
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '正在导入excel...',
                duration: 0,
                customClass: 'prop-search',
            });
            let namearr = params.file.name.split('.');
            let ext = namearr[namearr.length - 1];
            //console.log(params.file,"FILE");
            let form = new FormData();
            form.append('filepath', 'ZBTXExcel');
            form.append('file', params.file);
            const { data: res } = await uploadFile(form);
            if (res.code === 1) {
                const { data: resdata } = await importExcel({ filepath: res.data });
                if (resdata.code === 1) {
                    loading.close();
                    this.getData();
                }
                else {
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
                iconClass: 'el-icon-loading',
                message: '正在导出数据excel...',
                duration: 0,
                customClass: 'prop-search',
            });
            const { data: res } = await ExportExcel();
            if (res.code === 1) {
                loading.close();
                let filepath = res.data.substring(res.data.indexOf("FileResources"));
                window.location.href =
                    apiURL_file +
                    '/' + filepath;
                //console.log(res.data,"ExportExcel");
            }
            else {
                loading.close();
                this.$message.error(res.msg);
            }
        },

        //指标搜索
        onZBSearch() {
            if (this.ZBListDialog.searchkey) {
                var arr = this.ZBListDialog.zblistAll.filter((item) => {
                    return item.NAME.indexOf(this.ZBListDialog.searchkey) != -1 || item.CODE.indexOf(this.ZBListDialog.searchkey) != -1 || item.TYPENAME.indexOf(this.ZBListDialog.searchkey) != -1;
                });
                this.ZBListDialog.zblist = arr;
            }
            else {
                this.ZBListDialog.zblist = this.ZBListDialog.zblistAll;
            }
        },
        //清空搜索框
        InputClear() {
            this.ZBListDialog.zblist = this.ZBListDialog.zblistAll;
        },
    },
};

</script>

<style scoped lang="scss">
@import '../style/indexmanage.scss';
</style>
