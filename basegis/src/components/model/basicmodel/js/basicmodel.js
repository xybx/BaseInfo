/*
 * @Author: WCL
 * @Date: 2022-01-13 10:06:14
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-13 10:31:20
 * @FilePath: \webgis\src\components\model\basicmodel\js\basicmodel.js
 * @Description: 请填写描述
 */

import {getDSList,saveDS,deleteDS,getZBList,saveSL_ZB,saveNUM_ZB,deleteZB} from '../api/basicmodel-api'
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            zbTableData: [],
            sjyTableData: [],
            SJYVisible: false,
            SJYForm: {
                NAME: '',
                SERVER: '',
                USERNAME: '',
                PASSWORD: '',
                DATABASE: '',
            },
            SLVisible: false,
            SLForm: {
                pid:0,
                zbname: '',
                zbvalue: '',
                zbunit: '',
                zbfeatureclass: '',
                dsid: '',
                feature: '',
                querywhere: '',
            },
            SZXVisible: false,
            SZXForm: {
                pid:0,
                zbname: '',
                zbvalue: '',
                zbunit: '',
            },
            SJYoptions: [],
            SJYRules: {
                NAME: [
                    {
                        required: true,
                        message: '数据源名称不能为空',
                        trigger: 'blur',
                    },
                ],
                SERVER: [
                    {
                        required: true,
                        message: 'IP地址不能为空',
                        trigger: 'blur',
                    },
                ],
                USERNAME: [
                    {
                        required: true,
                        message: '用户名不能为空',
                        trigger: 'blur',
                    },
                ],
                PASSWORD: [
                    {
                        required: true,
                        message: '密码不能为空',
                        trigger: 'blur',
                    },
                ],
                DATABASE: [
                    {
                        required: true,
                        message: '数据库名称不能为空',
                        trigger: 'blur',
                    },
                ],
            },
            SLRules: {
                zbname: [
                    {
                        required: true,
                        message: '指标名称不能为空',
                        trigger: 'blur',
                    },
                ],
                zbunit: [
                    {
                        required: true,
                        message: '单位不能为空',
                        trigger: 'blur',
                    },
                ],
                zbfeatureclass: [
                    {
                        required: true,
                        message: '指标要素类不能为空',
                        trigger: 'blur',
                    },
                ],
                dsid: [
                    {
                        required: true,
                        message: '数据源不能为空',
                        trigger: 'blur',
                    },
                ],
                feature: [
                    {
                        required: true,
                        message: '要素不能为空',
                        trigger: 'blur',
                    },
                ],
                querywhere: [
                    {
                        required: true,
                        message: '筛选条件不能为空',
                        trigger: 'blur',
                    },
                ],
            },
            SZXRules: {
                zbname: [
                    {
                        required: true,
                        message: '指标名称不能为空',
                        trigger: 'blur',
                    },
                ],
                zbvalue: [
                    {
                        required: true,
                        message: '指标值不能为空',
                        trigger: 'blur',
                    },
                ],
                zbunit: [
                    {
                        required: true,
                        message: '单位不能为空',
                        trigger: 'blur',
                    },
                ],
            },
            SJYloading: true,
            ZBloading: true,
            // 数据源列表分页
            currentPageTop: 1,
            pagesizeTop: 10,
            pagesizeArrTop: [10, 20, 50, 100],
            totalTop: 0,
            // 指标列表分页
            currentPageBot: 1,
            pagesizeBot: 10,
            pagesizeArrBot: [10, 20, 50, 100],
            totalBot: 0,
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.getSJYTable(); // 获取数据源列表
        this.getZBTable();  // 获取指标列表
    },
    methods: {
        // 获取指标列表
        async getZBTable() {
            var params={
                uid:window.sessionStorage.getItem('userid'),
                currentpage:this.currentPageBot,
                pagesize:this.pagesizeBot
            }
            const { data: res } = await getZBList(params);
            if (res.code === 1) {
                this.zbTableData = res.data.datas;
                this.totalBot=res.data.total;
                this.ZBloading = false;
            } else {
                this.$message.warning(res.msg);
            }
        },

        // 获取数据源列表
        async getSJYTable() {
            debugger;
            var params={
                uid:window.sessionStorage.getItem('userid'),
                currentpage:this.currentPageTop,
                pagesize:this.pagesizeTop
            }
            const { data: res } = await getDSList(params);
            if (res.code == 1) {
                debugger;
                this.sjyTableData = res.data.datas;
                this.totalTop=res.data.total;
                this.SJYloading = false;
            } else {
                this.$message.warning(r.msg);
            }
        },

        // 新增数据源
        addSJY() {
            this.SJYVisible = true;
        },

        // 关闭数据源弹窗
        closeSJY() {
            this.SJYForm = this.$options.data().SJYForm;
            this.$refs.SJYForm.clearValidate();
        },

        // 保存数据源
        saveSJY() {
            this.$refs.SJYForm.validate(async (valid) => {
                if (!valid) return;
                let form={
                    uid:window.sessionStorage.getItem("userid")
                }
                Object.assign(form,this.SJYForm);
                const { data: res } = await saveDS(form);
                if (res.code === 1) {
                    this.$message.success(res.msg);
                    this.getSJYTable();
                    this.SJYVisible = false;
                } else {
                    this.$message.warning(res.msg);
                }
            });
        },

        // 编辑数据源
        handleSJYEdit(row) {
            this.SJYVisible = true;
            this.SJYForm = row;
            console.log(row);
        },

        // 删除数据源
        async confirmSJYDel(row) {
            var params={
                pid: row.ID,
            }
            const { data: res } = await deleteDS(params);
            if (res.code === 1) {
                this.$message.success(res.msg);
                this.getSJYTable();
            } else {
                this.$message.warning(res.msg);
            }
        },

        // 运行数据源
        handleSJYRun(row) {
            console.log(row);
        },
        // 新增矢量指标
        addSL() {
            this.SLVisible = true;
        },

        // 关闭矢量弹窗
        closeSL() {
            this.SLForm = this.$options.data().SLForm;
            this.$refs.SLForm.clearValidate();
        },

        // 保存矢量数据
        saveSLForm() {
            console.log(this.SLForm);
            this.$refs.SLForm.validate(async (valid) => {
                if (!valid) return;
                let form={
                    uid:window.sessionStorage.getItem("userid")
                }
                Object.assign(form,this.SLForm);
                const { data: res } = await saveSL_ZB(form);
                if (res.code === 1) {
                    this.$message.success(res.msg);
                    this.getZBTable();
                    this.SLVisible = false;
                } else {
                    this.$message.warning(res.msg);
                }
            });
        },

        // 编辑矢量/数值型
        handleZBEdit(row) {
            console.log(row);
            if (row.ZBTYPE == 1) {
                this.SLVisible = true;
                this.SLForm.pid = row.PID;
                this.SLForm.zbname=row.ZBNAME;
                this.SLForm.zbvalue=row.ZBVALUE;
                this.SLForm.zbunit=row.ZBUNIT;
                this.SLForm.zbfeatureclass=row.ZBFEATURECLASS;
                this.SLForm.dsid=row.DSID;
                this.SLForm.querywhere=row.QUERYWHERE;
            } else {
                this.SZXVisible = true;
                this.SZXForm.pid = row.PID;
                this.SZXForm.zbname=row.ZBNAME;
                this.SZXForm.zbvalue=row.ZBVALUE;
                this.SZXForm.zbunit=row.ZBUNIT;
            }
        },

        // 删除矢量/数值型
        async confirmZBDel(row) {
            let params={
                pid:row.PID
            }
            const { data: res } = await deleteZB(params);
            if (res.code === 1) {
                this.$message.success(res.msg);
                this.getZBTable();
            } else {
                this.$message.warning(res.msg);
            }
        },

        // 运行矢量/数值型
        handleZBRun(row) {
            console.log(row);
        },

        // 新增数值型指标
        addSZX() {
            this.SZXVisible = true;
        },

        // 关闭数值型弹窗
        closeSZX() {
            this.SZXForm = this.$options.data().SZXForm;
            this.$refs.SZXForm.clearValidate();
        },

        // 保存数值型
        saveSXZForm() {
            console.log(this.SZXForm);
            this.$refs.SZXForm.validate(async (valid) => {
                if (!valid) return;
                let form ={
                    uid:window.sessionStorage.getItem("userid"),
                }
                Object.assign(form,this.SZXForm);
                const { data: res } = await saveNUM_ZB(form);
                if (res.code === 1) {
                    this.$message.success(res.msg);
                    this.getZBTable();
                    this.SZXVisible = false;
                } else {
                    this.$message.warning(res.msg);
                }
            });
        },

        // 数据源列表显示个数选择
        handleSizeChangeTop(){},

        // 数据源列表当前页选择
        handleCurrentChangeTop(){},

        // 指标列表显示个数选择
        handleSizeChangeBot(){},

        // 指标列表当前页选择
        handleCurrentChangeBot(){}
    },
};
