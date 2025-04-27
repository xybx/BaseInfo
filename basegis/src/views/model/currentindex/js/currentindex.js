/*
 * @Author: WCL
 * @Date: 2022-01-12 15:25:48
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-19 16:48:30
 * @FilePath: \webgis\src\views\model\currentindex\js\currentindex.js
 * @Description: 请填写描述
 */
import {
    getFun,
    getZBList,
    getModuleInfo,
    getModuleZBConfig,
} from "../api/currentindex-api";
import { getModelList } from "../../../../components/model/spacemodel/api/spacemodel-api";

import {
    deleteModel,
    runModel,
} from "../../../../components/model/custmodel/api/custmodel-api";
export default {
    name: "",
    props: {},
    components: {},
    data() {
        return {
            ZBRadio: null,
            ZBRadioData: [],
            searchinput: "",
            spaceCardList:[],
            cardList: [],
            currentPage: 1,
            // 当页个数固定12个
            pagesize: 6,
            cardTotal: 0,
            // 详情弹窗
            SLVisible: false,
            SLForm: {
                xzqbm: "",
                xzqmc: "",
                funclass: "",
                firstflid: "",
                secondflid: "",
                modelname: "",
                modelcode: "",
                modelvalue: "",
                description: "",
                year: "",
                modeltype: "",
                pid: 0,
                modelunit: "",
            },
            xzqOptions: [],
            oneOptions: [],
            twoOptions: [],
            mxOptions: [],
            funOptions: [],
            // 主要指标名称
            ZBMainName: "",
            // 辅助指标名称
            ZBSubName: "",
            showZBItem: false,
            selectZBSubData: [],
            modelList: [
                { label: "矢量模型", id: 1 },
                { label: "数值模型", id: 2 },
            ],
        };
    },
    computed: {},
    watch: {},
    created() {},
    async mounted() {
        //await this.getFunList();
        await this.getSpaceCardList();
        await this.getCardList();
        
    },
    methods: {
        // 当前页码改变
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getCardList();
            this.getSpaceCardList();
        },

        // 指标模型选择项
        changeZBRadio() {
            this.currentPage = 1;
            this.getCardList();
            this.getSpaceCardList();
        },

        // 获取模型指标列表数据
        async getCardList() {
            let params = {
                uid: sessionStorage.getItem("userid"),
                keyword: this.searchinput || "",
                typeid: 0,
                currentpage: this.currentPage,
                pagesize: this.pagesize,
            };

            const { data: res } = await getZBList(params);

            if (res.code === 1) {
                this.cardList = res.data.datas;
                this.cardTotal = this.cardTotal +res.data.total;
            } else {
                this.$message.error(res.msg);
            }
        },
         // 获取模型指标列表数据
         async getSpaceCardList() {
          let params = {
              keyword: this.searchinput || "",
              currentpage: this.currentPage,
              pagesize: this.pagesize,
          };

          const { data: res } = await getModelList(params);

          if (res.code === 1) {
              this.spaceCardList = res.data.datas;
              this.cardTotal = this.cardTotal+res.data.total;
          } else {
              this.$message.error(res.msg);
          }
      },


        // 指标项 - 详情
        async handleDetail(row) {
            debugger;
            console.log(row);
            this.SLVisible = true;
            this.SLForm.xzqmc = row.XZQMC;
            this.SLForm.funclass = row.FUNCLASSNAME;
            this.SLForm.firstflid = row.FIRSTFLNAME;
            this.SLForm.secondflid = row.SECONDFLNAME;
            this.SLForm.modelname = row.MODELNAME;
            this.SLForm.year = String(row.YEAR);
            this.SLForm.modelunit = row.MODELUNIT;

            let params = {
                modelpid: row.PID,
            };
            const { data: res } = await getModuleInfo(params);
            if (res.code === 1) {
                let obj = res.data;
                this.SLForm.modeltype = row.MODELTYPE;
                this.SLForm.xzqbm = obj.XZQDM;
                this.SLForm.modelcode = obj.MODELCODE;
                this.SLForm.pid = obj.PID;
                this.getZBItem(obj.MODELCODE);
                this.showZBItem = true;
                this.selectZBData = [];
                this.selectZBSubData = [];
                obj.ZBLIST.map((item) => {
                    switch (item.ISMAIN) {
                        case 1:
                            this.selectZBData.push(item);
                            break;
                        case 0:
                            this.selectZBSubData.push(item);
                            break;

                        default:
                            break;
                    }
                });

                this.SLForm.modelvalue = obj.MODELVALUE;
                this.SLForm.description = obj.DESCRIPTION;
            } else {
                this.$message.error(res.msg);
            }
            console.log(this.SLForm);
        },

        // 指标表单关闭
        detailClose() {
            this.dialogDetail = false;
        },

        // 获取功能分类
        async getFunList() {
            const { data: res } = await getFun();
            if (res.code === 1) {
                this.ZBRadioData = res.data;
                this.ZBRadio = this.ZBRadioData[0].value;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 搜索查询
        handleClick() {
            this.currentPage = 1;
            this.getCardList();
        },

        // 获取指标项
        async getZBItem(itemcode) {
            let params = {
                itemcode,
            };
            const { data: res } = await getModuleZBConfig(params);
            if (res.code === 1) {
                this.moduleZBList = res.data;
                res.data.map((item) => {
                    if (item.ISMAIN === 1) {
                        this.ZBMainName = item.ZBSHOWNAME;
                    } else {
                        this.ZBSubName = item.ZBSHOWNAME;
                    }
                });
                this.showZBItem = true;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 关闭模型弹窗
        closeSL() {
            this.SLForm = this.$options.data().SLForm;
            this.selectZBData = this.$options.data().selectZBData;
            this.selectZBSubData = this.$options.data().selectZBSubData;
            this.ZBMainName = "";
            this.ZBSubName = "";
            this.showZBItem = false;
            this.$refs.SLForm.resetFields();
            console.log("关闭");
        },

        // 运行
        async handleRun(row) {
            let loading = this.$notify({
                iconClass: "el-icon-loading",
                message: "正在计算模型值......",
                duration: 0,
                customClass: "prop-search",
            });

            let params = {
                pid: row.PID,
                uid: window.sessionStorage.getItem("userid"),
            };
            const { data: res } = await runModel(params);
            if (res.code === 1) {
                // 运行成功
                loading.close();
                this.$message.success("运行成功");
                console.log("运行成功");
                await this.getCardList();
            } else {
                this.$message.error(res.msg);
            }
        },

        //注销
        async confirmDel(row) {
            let params = {
                pid: row.PID,
            };
            const { data: res } = await deleteModel(params);
            if (res.code === 1) {
                this.$message.success("注销成功");
                this.getCardList();
            } else {
                this.$message.error(res.msg);
            }
        },
    },
};
