/*
 * @Author: WCL
 * @Date: 2022-01-13 10:07:42
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-19 17:22:28
 * @FilePath: \webgis\src\components\model\custmodel\js\custmodel.js
 * @Description: 请填写描述
 */

import { FALSE } from "sass";
import { getModelList, saveModel } from "../api/spacemodel-api";
import { getAlgList } from "../../custmodel/api/custmodel-api";
export default {
    name: "",
    props: {},
    components: {},
    data() {
        return {
            ZBLISTData: [],
            ZBLISTVisible: false,
            selectZBData: [],
            mxTableData: [],
            SLVisible: false,
            LogVisible: false,
            oneOptions: [],
            twoOptions: [],
            mxOptions: [],
            funOptions: [],
            SLForm: {
                PID: 0,
                MODELNAME: "",
                CATEGORYNAME: "",
                ONETYPE: "",
                TWOTYPE: "",
                DESCRIPTION: "",
                ALGPID:'',
            },
            SLRules: {
                MODELNAME: [
                    {
                        required: true,
                        message: "模型名称不能为空",
                        trigger: "blur",
                    },
                ],
            },

            loading: true,
            // 模型列表分页
            currentPage: 1,
            pagesize: 10,
            pagesizeArr: [10, 20, 50, 100],
            tableTotal: 0,
            alglist: [],
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        debugger;
        this.getMXTable();
        this.getALGList();
    },
    methods: {
        // 模型类型选择
        changeModelType(val) {
            this.getZBTable(val);
        },

        // 获取数据列表
        async getMXTable() {
            let params = {
                // uid: window.sessionStorage.getItem("userid"),
                // typeid: 0,
                keyword: "",
                currentpage: this.currentPage,
                pagesize: this.pagesize,
            };
            const { data: res } = await getModelList(params);
            console.log(res, "数据源列表");
            if (res.code === 1) {
                this.mxTableData = res.data.datas;
                this.tableTotal = res.data.total;
                this.loading = false;
            } else {
                this.$message.warning(res.msg);
            }
        },

        // 新增矢量模型
        addSL() {
            // this.selectZBData = [];
            this.SLVisible = true;
            // //this.getXzqList();
            // // this.getFunOptions();
            // // this.getALGList();
            // // this.getZBTable(this.SLForm.modeltype);
            // this.algParams = [];
        },

        // 关闭矢量模型弹窗
        closeSL() {
            //this.SLVisible = false;
            this.SLForm = this.$options.data().SLForm;
            // //this.xzqOptions = this.$options.data().xzqOptions;
            // this.oneOptions = this.$options.data().oneOptions;
            // this.twoOptions = this.$options.data().twoOptions;
            // this.mxOptions = this.$options.data().mxOptions;
            // this.factorOptions = this.$options.data().factorOptions;
            this.$refs.SLForm.resetFields();
            // console.log("关闭");
        },

        // 保存矢量弹窗
        saveSL() {
            // // 提交表单组装
            // let form = Object.assign(this.subSLForm, this.SLForm, {
            //   zblistjson: JSON.stringify(this.factorList),
            // });
            // console.log(form, "form");
            this.$refs.SLForm.validate(async (valid) => {
                if (!valid) return this.$message.error("请补充必填项");
                const { data: res } = await saveModel(this.SLForm);
                if (res.code === 1) {
                    this.$message.success("成功");
                    this.SLVisible = false;
                    this.getMXTable();
                } else {
                    this.$message.error(res.msg);
                }
            });
        },

        // 获取算法列表
        async getALGList() {
            const { data: res } = await getAlgList();
            if (res.code === 1) {
                this.alglist = res.data;
            } else {
                this.$message.warning(res.msg);
            }
        },
        // 编辑矢量/数值型
        async handleEdit(row) {},

        // // 获取功能分类
        // async getFunOptions() {
        //   const { data: res } = await getFunClassList({ parentid: 0 });
        //   if (res.code === 1) {
        //     this.funOptions = res.data;
        //   } else {
        //     this.$message.warning(res.msg);
        //   }
        // },

        // // 获取一级分类
        // async getOneOptions(val) {
        //   const { data: res } = await getFunClassList({ parentid: val });
        //   if (res.code === 1) {
        //     this.oneOptions = res.data;
        //   } else {
        //     this.$message.warning(res.msg);
        //   }
        // },

        // // 一级分类选择
        // changeFirstFlid(val) {
        //   this.getTwoOptions(val);
        //   this.getModelName(val);
        //   // 矢量
        //   this.SLForm.secondflid = "";
        //   this.SLForm.modelname = "";
        //   this.SLForm.modelcode = "";
        //   this.factorOptions = [];
        //   this.mxOptions = [];
        // },

        // // 获取二级分类
        // async getTwoOptions(flid) {
        //   var params = {
        //     parentid: flid,
        //   };
        //   const { data: res } = await getFunClassList(params);
        //   if (res.code === 1) {
        //     this.twoOptions = res.data;
        //   } else {
        //     this.$message.warning(res.msg);
        //   }
        // },

        // // 二级分类选择
        // changeSecondFlid(val) {
        //   this.getModelName(val);
        //   // 矢量
        //   this.SLForm.modelname = "";
        //   this.SLForm.modelcode = "";
        //   this.factorOptions = [];
        // },
        //选中当前行
        handleCurrentChange(val) {
            this.currentRow = val;
        },

        // 模型列表显示个数选择
        handleSizeChange(val) {
            this.pagesize = val;
            this.getMXTable();
        },

        // 模型列表当前页选择
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getMXTable();
        },
        //新增自定义指标模型
        addDefineSL() {},
    },
};
