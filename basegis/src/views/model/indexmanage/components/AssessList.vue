<!--
 * @Author: WCL
 * @Date: 2022-02-25 15:08:35
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-24 13:36:21
 * @FilePath: \admin-service\src\views\monitor\AssessList.vue
 * @Description: 指标列表项
-->
<template>
    <div class="container">
        <!-- 顶部表单 -->
        <div class="handle-box">
            <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="addType">新增</el-button>
            <i class="el-icon-s-fold" title="返回类型列表" style="font-size: larger; cursor: pointer" @click="reback"></i>
        </div>

        <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header" stripe>
            <el-table-column prop="PID" label="ID" width="120" align="center"></el-table-column>
            <el-table-column prop="NAME" label="名称" align="center"></el-table-column>
            <el-table-column prop="CODE" label="指标编码" align="center"></el-table-column>
            <el-table-column prop="STYLE" label="指标类型" align="center">
                <template v-slot="scope">
                    <span v-if="scope.row.STYLE === 1">基本指标</span>
                    <span v-else-if="scope.row.STYLE === 2">推荐指标</span>
                </template>
            </el-table-column>
            <el-table-column prop="ISBINDING" label="指标属性" align="center">
                <template v-slot="scope">
                    <span v-if="scope.row.ISBINDING === 1">约束指标</span>
                    <span v-else-if="scope.row.ISBINDING === 2">预期指标</span>
                    <span v-else-if="scope.row.ISBINDING === 0"></span>
                </template>
            </el-table-column>
            <el-table-column prop="CALCTYPE" label="计算类型" align="center">
                <template v-slot="scope">
                    <span v-if="scope.row.CALCTYPE === 1">相交</span>
                    <span v-else-if="scope.row.CALCTYPE === 2">占比</span>
                    <span v-else-if="scope.row.CALCTYPE === 3">求和</span>
                    <span v-else-if="scope.row.CALCTYPE === 4">其它</span>
                </template>
            </el-table-column>
            <el-table-column prop="UNIT" label="单位" align="center"></el-table-column>
            <el-table-column label="操作" align="center" width="400">
                <template slot-scope="scope">
                    <el-button type="primary" plain size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="success" plain size="mini" @click="handleSDEEdit(scope.row)">元数据配置</el-button>
                    <!-- <el-button type="warning" plain size="mini" @click="handleNLMS(scope.row)">计算参数配置</el-button> -->
                    <el-button type="danger" plain size="mini" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 新增/编辑弹窗 -->
        <el-dialog :title="setTitle" :visible.sync="setVisible" width="35%" custom-class="set-dialog"
            @close="closedSetDialog" :close-on-click-modal="false">
            <el-form ref="setForm" :model="setForm" label-width="auto" class="set-form" :rules="setFormRules">
                <el-form-item label="指标项名称" prop="NAME">
                    <el-input v-model.trim="setForm.NAME" placeholder="请输入指标名称"></el-input>
                </el-form-item>
                <el-form-item label="指标编码" prop="CODE">
                    <el-input v-model.trim="setForm.CODE" placeholder="请输入指标编码"></el-input>
                </el-form-item>
                <el-form-item label="指标类型" prop="STYLE">
                    <el-radio-group v-model="setForm.STYLE">
                        <el-radio :label="1">基本指标</el-radio>
                        <el-radio :label="2">推荐指标</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="指标属性" prop="ISBINDING">
                    <el-radio-group v-model="setForm.ISBINDING">
                        <el-radio :label="0">无</el-radio>
                        <el-radio :label="1">约束指标</el-radio>
                        <el-radio :label="2">预期指标</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="单位" prop="UNIT">
                    <el-input v-model.trim="setForm.UNIT" placeholder="请输入指标单位"></el-input>
                </el-form-item>
                <el-form-item label="计算类型" prop="CALCTYPE">
                    <el-radio-group v-model="setForm.CALCTYPE">
                        <el-radio :label="1">相交</el-radio>
                        <el-radio :label="2">占比</el-radio>
                        <el-radio :label="3">求和</el-radio>
                        <el-radio :label="4">其它</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>

        <!--指标计算参数配置弹框-->
        <el-dialog title="指标计算参数配置" :visible.sync="setNLMVisible" width="35%" custom-class="set-dialog"
            @close="closedNLMSetDialog" :close-on-click-modal="false">
            <el-form ref="setNLMForm" :model="setNLMForm" label-width="auto" class="set-form" :rules="setNLMFormRules">
                <el-form-item label="当前指标项计算类型(只读)" prop="CALCTYPENAME">
                    <el-input v-model.trim="setNLMForm.CALCTYPENAME" readonly></el-input>
                    <span style="color: #bbb8b8; line-height: 20px">
                        <div>相交：计算参数有效配置为2条计算参数；</div>
                        <div>
                            占比：计算参数有效配置为2条计算参数,关键参数，辅助参数各1条数据；
                        </div>
                        <div>求和：计算参数有效配置为1条计算参数；</div>
                    </span>
                </el-form-item>
                <el-form-item label="指标项名称(只读)" prop="NAME">
                    <el-input v-model.trim="setNLMForm.NAME" readonly></el-input>
                </el-form-item>

                <el-form-item label="计算参数显示名称" prop="ZBSHOWNAME">
                    <el-input v-model.trim="setNLMForm.ZBSHOWNAME" placeholder="请输入计算参数显示名称"></el-input>
                </el-form-item>
                <el-form-item label="参数类型" prop="ISMAIN">
                    <el-radio-group v-model="setNLMForm.ISMAIN">
                        <el-radio :label="1">关键参数</el-radio>
                        <el-radio :label="0">辅助参数</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item>
                    <el-button size="mini" type="primary" @click="saveNlmDialog">添加</el-button>
                </el-form-item>
            </el-form>
            <hr />
            <el-table :data="listNLMData" border stripe max-height="400">
                <el-table-column label="参数显示名称" prop="ZBSHOWNAME" align="center"></el-table-column>
                <el-table-column label="参数类型" prop="ISMAIN" align="center">
                    <template v-slot="scope">
                        <span v-if="scope.row.ISMAIN === 0">辅助参数</span>
                        <span v-else-if="scope.row.ISMAIN === 1">关键参数</span>
                    </template>
                </el-table-column>

                <el-table-column label="操作" align="center" min-width="100">
                    <template v-slot="scope">
                        <el-button size="mini" type="danger" plain @click="listNLMDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="setNLMVisible = false">关闭</el-button>
            </span>
        </el-dialog>

        <!--指标元数据配置-->
        <el-dialog :title="setSDETitle" :visible.sync="setSDEVisible" width="35%" custom-class="set-dialog"
            @close="closedSDESetDialog" :close-on-click-modal="false">
            <el-form ref="setSDEForm" :model="setSDEForm" label-width="auto" class="set-form" :rules="setSDEFormRules">
                <el-form-item label="图层地址" prop="LAYERURL">
                    <el-input v-model.trim="setSDEForm.LAYERURL" placeholder="请输入图层地址"></el-input>
                </el-form-item>
                <el-form-item label="筛选条件" prop="QUERYWHERE">
                    <el-input v-model.trim="setSDEForm.QUERYWHERE" placeholder="请输入筛选条件"></el-input>
                </el-form-item>
                <el-form-item label="年份" prop="YEAR">
                    <el-date-picker v-model="setSDEForm.YEAR" type="year" placeholder="选择年份(必填)">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button size="mini" type="primary" @click="saveSDEDialog">保存</el-button>
                </el-form-item>
            </el-form>
            <hr />
            <el-table :data="LayersData" border stripe max-height="400">
                <el-table-column label="图层地址" prop="LAYERURL" align="center" ></el-table-column>
                <el-table-column label="筛选条件" prop="QUERYWHERE" align="center" width="120">
                </el-table-column>
                <el-table-column label="年份" prop="YEAR" align="center" width="80"> 
                </el-table-column>
                <el-table-column label="操作" align="center" min-width="60">
                    <template v-slot="scope">
                        <el-button size="mini" type="success" plain @click="getEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" plain @click="DeleteLayer(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
import {
    getIndexList,
    saveIndex,
    delIndex,
    getNlmList,
    saveNlm,
    deleteNlm,
    getLayerList,
    saveLayer,
    deleteLayer,
} from '../api/indexmanage-api';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            tableData: [],
            setForm: {
                NAME: '',
                STYLE: '',
                CODE: '',
                UNIT: '',
                CALCTYPE: 0,
                ISBINDING: '0',
            },
            setFormRules: {
                NAME: [
                    {
                        required: true,
                        message: '指标名称不能为空',
                        trigger: 'blur',
                    },
                ],
                STYLE: [
                    {
                        required: true,
                        message: '请选择指标类型',
                        trigger: 'change',
                    },
                ],
                CODE: [
                    {
                        required: true,
                        message: '指标编码不能为空',
                        trigger: 'blur',
                    },
                ],
                UNIT: [
                    {
                        required: true,
                        message: '单位不能为空',
                        trigger: 'blur',
                    },
                ],
                CALCTYPE: [
                    {
                        required: true,
                        message: '请选择计算类型',
                        trigger: 'change',
                    },
                ],
            },
            setTitle: '',
            setVisible: false,
            listNLMData: [],
            setNLMVisible: false,
            setNLMForm: {
                PGZBITEMCODE: '',
                NAME: '',
                CALCTYPE: null,
                CALCTYPENAME: '',
                ISMAIN: 1,
                ZBSHOWNAME: '',
            },
            setNLMFormRules: {
                ZBSHOWNAME: [
                    {
                        required: true,
                        message: '请输入计算参数显示名称',
                        trigger: 'blur',
                    },
                ],
            },
            setSDETitle: '',
            setSDEVisible: false,
            setSDEForm: {
                LAYERURL: '',
                QUERYWHERE: '1=1',
                YEAR: '',
                ZBCODE: '',
                PID: 0,
                STATUS: 1,
            },
            setSDEFormRules: {
                LAYERURL: [{ required: true, message: '请输入图层地址', trigger: 'blur', }],
                QUERYWHERE: [{ required: true, message: '请输入筛选条件', trigger: 'blur', }],
                YEAR: [{ required: true, message: '请选择年份', trigger: 'change' }],
            },
            LayersData: [],

        };
    },
    computed: {},
    watch: {},
    created() { },
    mounted() {
        //this.isAdmin = localStorage.getItem('isadmin');
        this.getData();
        this.setSDEForm.YEAR=new Date().getFullYear().toString();
    },
    methods: {
        //返回列表页
        reback() {
            this.$router.push('/indexmanage');
        },
        // 新增
        addType() {
            this.setTitle = '新增';
            this.setVisible = true;
            Object.assign(this.setForm, {
                PID: 0,
                TYPEID: this.$route.query.typeid,
            });
        },

        // 获取列表数据
        async getData() {
            let params = {
                typeid: this.$route.query.typeid,
            };
            const { data: res } = await getIndexList(params);
            if (res.code === 1) {
                this.tableData = res.data;
            }
        },

        // 弹窗确认
        saveAdd() {
            this.$refs.setForm.validate(async (valid) => {
                if (!valid) return this.$message.error('请补充必填项');
                let { LEVEL, ...form } = this.setForm;

                const { data: res } = await saveIndex(form);
                if (res.code === 1) {
                    this.$message.success(`${this.setTitle}成功`);
                    this.setVisible = false;
                    this.getData();
                }
            });
        },

        // 弹窗关闭
        closedSetDialog() {
            this.$refs.setForm.resetFields();
            this.setForm = this.$options.data().setForm;
        },

        closedNLMSetDialog() {
            this.$refs.setNLMForm.resetFields();
            this.setForm = this.$options.data().setNLMForm;
        },
        closedSDESetDialog() {
            this.setSDEVisible = false;
        },


        // 编辑
        handleEdit(row) {
            console.log(row);
            this.setTitle = '编辑';
            this.setVisible = true;
            Object.assign(this.setForm, row);
        },

        //计算参数弹框
        handleNLMS(row) {
            this.setNLMVisible = true;
            this.setNLMForm.PGZBITEMCODE = row.CODE;
            this.setNLMForm.NAME = row.NAME;
            this.setNLMForm.CALCTYPE = row.CALCTYPE;
            if (row.CALCTYPE == 1) {
                this.setNLMForm.CALCTYPENAME = '相交';
            } else if (row.CALCTYPE == 2) {
                this.setNLMForm.CALCTYPENAME = '占比';
            } else if (row.CALCTYPE == 3) {
                this.setNLMForm.CALCTYPENAME = '求和';
            } else if (row.CALCTYPE == 4) {
                this.setNLMForm.CALCTYPENAME = '其它';
            }

            this.getNLMDATA();
        },
        async getNLMDATA() {
            const { data: res } = await getNlmList({
                zbcode: this.setNLMForm.PGZBITEMCODE,
            });
            if (res.code == 1) {
                this.listNLMData = res.data;
            }
        },
        async saveNlmDialog() {
            const { data: res } = await saveNlm({
                PID: 0,
                PGZBITEMCODE: this.setNLMForm.PGZBITEMCODE,
                ZBSHOWNAME: this.setNLMForm.ZBSHOWNAME,
                ISMAIN: this.setNLMForm.ISMAIN,
            });
            if (res.code == 1) {
                this.getNLMDATA();
                this.setNLMForm.ZBSHOWNAME = '';
                this.$message.success('添加成功');
            }
        },
        async listNLMDelete(row) {
            const { data: res } = await deleteNlm({ pid: row.PID });
            if (res.code == 1) {
                this.getNLMDATA();
                this.$message.success('删除成功');
            }
        },
        // 删除
        async handleDelete(row) {
            let params = {
                pid: row.PID,
            };
            const { data: res } = await delIndex(params);
            if (res.code === 1) {
                this.$message.success('删除成功');
                this.getData();
            }
        },

        // 编辑
        handleSDEEdit(row) {
            console.log(row);
           
            debugger;
            this.setSDEVisible = true;
            this.setSDETitle = row.NAME + "-元数据配置";
            this.setSDEForm.ZBCODE=row.CODE;
            this.getLayersDATA();
        },
        //获取指标绑定的元数据列表
        async getLayersDATA() {
            const { data: res } = await getLayerList({
                zbcode: this.setSDEForm.ZBCODE,
            });
            if (res.code == 1) {
                this.LayersData = res.data;
            }
        },
        getEdit(row)
        {
            this.setSDEForm.ZBCODE=row.ZBCODE;
            this.setSDEForm.PID=row.PID;
            this.setSDEForm.YEAR=row.YEAR;
            this.setSDEForm.STATUS=row.STATUS;
            this.setSDEForm.LAYERURL=row.LAYERURL;
            this.setSDEForm.QUERYWHERE=row.QUERYWHERE;
        },
        //保存指标元数据
        async saveSDEDialog() {
            const { data: res } = await saveLayer(this.setSDEForm);
            if (res.code == 1) {
                this.getLayersDATA();
                this.$refs.setSDEForm.resetFields();
                this.$message.success('保存成功');
            }
        },
        //删除指标元数据
        async DeleteLayer(row) {
            let params = {
                pid: row.PID,
            };
            const { data: res } = await deleteLayer(params);
            if (res.code === 1) {
                this.$message.success('删除成功');
                this.getLayersDATA();
            }
        },

    },
};
</script>

<style scoped lang="scss">
@import '../style/indexmanage.scss';
</style>
