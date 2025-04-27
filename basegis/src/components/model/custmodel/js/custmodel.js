/*
 * @Author: WCL
 * @Date: 2022-01-13 10:07:42
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-19 17:22:28
 * @FilePath: \webgis\src\components\model\custmodel\js\custmodel.js
 * @Description: 请填写描述
 */

import {
  getModelList,
  saveModel,
  getXzqList,
  getFunClassList,
  getZBListBySys,
  getAlgList,
  getZBList,
  getModuleInfo,
  deleteModel,
  runModel,
  getModelLogList,
} from "../api/custmodel-api";
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
        modeltype: 1,
        pid: 0,
        modelunit: "",
        ALGPID: '',
      },
      subSLForm: {
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
        zblist: [],
      },
      xzqOptions: [],
      oneOptions: [],
      twoOptions: [],
      mxOptions: [],
      funOptions: [],
      SLRules: {
        modeltype: [
          {
            required: true,
            message: "模型类型不能为空",
            trigger: "change",
          },
        ],
        funclass: [
          {
            required: true,
            message: "分类不能为空",
            trigger: "change",
          },
        ],
        modelname: [
          {
            required: true,
            message: "模型名称不能为空",
            trigger: "change",
          },
        ],
      },

      loading: true,
      // 模型列表分页
      currentPage: 1,
      pagesize: 10,
      pagesizeArr: [10, 20, 50, 100],
      tableTotal: 0,

      //指标因子列表分页
      currentPageBot: 1,
      pagesizeBot: 10,
      pagesizeArrBot: [10, 20, 50, 100],
      totalBot: 0,

      logloading: true,
      // 日志列表分页
      logTableData: [],
      currentPageLog: 1,
      pagesizeLog: 10,
      pagesizeArrLog: [10, 20, 50, 100],
      tableTotalLog: 0,

      // 表格单选
      radioID: "",
      // 指标项名称
      moduleZBList: [],
      // 主要指标名称
      ZBMainName: "",
      // 辅助指标名称
      ZBSubName: "",
      // 显示指标项
      showZBItem: false,
      showSubZBItem: false,
      selectZBSubData: [],
      factorList: [],
      ZBListSubData: [],
      totalSub: 0,
      radioSubID: "",
      modelList: [
        { label: "矢量模型", id: 1 },
        { label: "数值模型", id: 2 },
      ],
      alglist: [],//算法列表
      algParams: [],//当前选择的算法参数列表
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    this.getMXTable();
  },
  methods: {
    // 模型类型选择
    changeModelType(val) {
      this.getZBTable(val);
    },

    //获取指标因子列表
    async getZBTable(zbtype) {
      //debugger;
      var params = {
        uid: window.sessionStorage.getItem("userid"),
        currentpage: this.currentPageBot,
        pagesize: this.pagesizeBot,
        zbtype: zbtype ? zbtype : 1,
      };
      const { data: res } = await getZBList(params);
      if (res.code === 1) {
        //debugger;
        this.ZBLISTData = res.data.datas;

        this.ZBListSubData = res.data.datas;
        this.totalBot = res.data.total;
        this.totalSub = res.data.total;
        console.log(this.ZBLISTData, "ZBLISTData");
        //this.ZBloading = false;
      } else {
        this.$message.warning(res.msg);
      }
    },

    // 获取数据源列表
    async getMXTable() {
      let params = {
        uid: window.sessionStorage.getItem("userid"),
        typeid: 0,
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
    addLogDialog(row) {
      this.LogVisible = true;
      this.getLogList(row);
    },

    // 关闭矢量模型弹窗
    closeLogDialog() {
      this.LogVisible = false;
      console.log("关闭");
    },

    // 获取运行日志列表
    async getLogList(row) {
      debugger;
      let params = {
        pid: row.PID,
        currentpage: this.currentPage,
        pagesize: this.pagesize,
      };
      const { data: res } = await getModelLogList(params);
      if (res.code === 1) {
        this.logTableData = res.data.datas;
        this.tableTotalLog = res.data.total;
        this.logloading = false;
      } else {
        this.$message.warning(res.msg);
      }
    },

    // 新增矢量模型
    addSL() {
      this.selectZBData = [];
      this.SLVisible = true;
      //this.getXzqList();
      this.getFunOptions();
      this.getALGList();
      this.getZBTable(this.SLForm.modeltype);
      this.algParams = [];

    },

    // 关闭矢量模型弹窗
    closeSL() {
      this.SLForm = this.$options.data().SLForm;
      //this.xzqOptions = this.$options.data().xzqOptions;
      this.oneOptions = this.$options.data().oneOptions;
      this.twoOptions = this.$options.data().twoOptions;
      this.mxOptions = this.$options.data().mxOptions;
      this.factorOptions = this.$options.data().factorOptions; 
      this.$refs.SLForm.resetFields();
      console.log("关闭");
    },

    // 保存矢量弹窗
    saveSL() {
      // 指标因子组装    
      if (this.factorList.length < this.algParams.length) {
        return this.$message.error("请选择指标因子项");
      }

      // 提交表单组装
      let form = Object.assign(this.subSLForm, this.SLForm, {
        zblistjson: JSON.stringify(this.factorList),
      });
      console.log(form, "form");    
      this.$refs.SLForm.validate(async (valid) => {
        if (!valid) return this.$message.error("请补充必填项");
        const { data: res } = await saveModel(form);
        if (res.code === 1) {
          this.$message.success("成功");
          this.SLVisible = false;
          this.getMXTable();
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    // 编辑矢量/数值型
    async handleEdit(row) {
      this.algParams=[];
      console.log(row);
      this.SLVisible = true;
      let params = {
        modelpid: row.PID,
      };
      this.getALGList();
      const { data: res } = await getModuleInfo(params);
      if (res.code === 1) {
        debugger;
        let obj = res.data;
        await this.getZBTable(obj.MODELTYPE);
        this.SLForm.modeltype = obj.MODELTYPE;
        //await this.getXzqList();
        // this.SLForm.xzqbm = obj.XZQDM;
        // this.SLForm.xzqmc = obj.XZQMC;
        await this.getFunOptions();
        this.SLForm.funclass = Number(obj.FUNCLASS);
        await this.getOneOptions(obj.FUNCLASS);
        this.SLForm.firstflid = Number(obj.FIRSTFLID);
        await this.getTwoOptions(obj.FIRSTFLID);
        this.SLForm.secondflid = Number(obj.SECONDFLID)==0?'':Number(obj.SECONDFLID);
        await this.getModelName(obj.SECONDFLID);
        this.SLForm.modelname = obj.MODELNAME;
        //this.SLForm.year = String(obj.YEAR);
        this.SLForm.modelcode = obj.MODELCODE;
        this.SLForm.ALGPID=Number(obj.ALGPID);
        this.SLForm.pid = obj.PID;
        console.log(this.factorList, "factorList");
        obj.ZBLIST.forEach(p => {
          let zb=JSON.parse(p.zb);
          this.algParams.push({
            name: p.name,
            desc: p.desc,
            attrdesc: p.attrdesc,
            attr: p.attr,
            zblist: this.ZBLISTData,
            selectZBData: [zb],
            radioID: zb.PID,
          });

          this.factorList.push({
            name: p.name,
            desc: p.desc,
            attrdesc: p.attrdesc,
            attr: p.attr,
            zb: zb
          });

        });
      // this.algParams=obj.ZBLIST;
        console.log(this.factorList);

        this.SLForm.modelvalue = obj.MODELVALUE;
        this.SLForm.description = obj.DESCRIPTION;
        this.SLForm.modelunit = obj.MODELUNIT;
      } else {
        this.$message.error(res.msg);
      }
    },

    // 删除
    async confirmDel(index, row) {
      console.log(index, row);
      let params = {
        pid: row.PID,
      };
      const { data: res } = await deleteModel(params);
      if (res.code === 1) {
        this.$message.success("删除成功");
        this.getMXTable();
      } else {
        this.$message.error(res.msg);
      }
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
        uid: window.sessionStorage.getItem('userid'),
      };
      const { data: res } = await runModel(params);
      if (res.code === 1) {
        // 运行成功
        loading.close();
        this.$message.success("运行成功");
        console.log("运行成功");
        this.getMXTable();
      } else {
        loading.close();
        this.$message.error(res.msg);
      }
    },


    // 获取功能分类
    async getFunOptions() {     
      const { data: res } = await getFunClassList({ parentid: 0 });
      if (res.code === 1) {
        this.funOptions = res.data;
      } else {
        this.$message.warning(res.msg);
      }
    },
    changeFunOptions(val) {      
      //加载一级分类
      this.getOneOptions(val);
      //加载根目录下的指标列表
      this.getModelName(val);
    },

    // 获取一级分类
    async getOneOptions(val) {     
      const { data: res } = await getFunClassList({ parentid: val });
      if (res.code === 1) {
        this.oneOptions = res.data;
      } else {
        this.$message.warning(res.msg);
      }
    },

    // 一级分类选择
    changeFirstFlid(val) {
      this.getTwoOptions(val);
      this.getModelName(val);
      // 矢量
      this.SLForm.secondflid = "";
      this.SLForm.modelname = "";
      this.SLForm.modelcode = "";
      this.factorOptions = [];
      this.mxOptions = [];
    },

    // 获取二级分类
    async getTwoOptions(flid) {
      var params = {
        parentid: flid,
      };
      const { data: res } = await getFunClassList(params);
      if (res.code === 1) {
        this.twoOptions = res.data;
      } else {
        this.$message.warning(res.msg);
      }
    },

    // 二级分类选择
    changeSecondFlid(val) {
      this.getModelName(val);
      // 矢量
      this.SLForm.modelname = "";
      this.SLForm.modelcode = "";
      this.factorOptions = [];
    },

    // 获取模型名称
    async getModelName(flid) {
      var params = {
        syspid: flid,
      };
      const { data: res } = await getZBListBySys(params);
      if (res.code === 1) {
        this.mxOptions = res.data;
      } else {
        this.$message.warning(res.msg);
      }
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

    // 模型名称选择
    changeModelName(obj) {
      console.log(obj);
      this.SLForm.modelname = obj.NAME;
      this.SLForm.modelcode = obj.CODE;
      this.SLForm.modelunit = obj.UNIT;
    },
    //模型算法选择
    changeALG(obj) {
      console.log(obj);
      this.alglist.forEach(element => {
        if (element.PID == obj) {
          let params = JSON.parse(element.PARAMS);
          params.forEach(p => {
            console.log(p, "p");
            this.algParams.push({
              name: p.name,
              desc: p.desc,
              attrdesc: p.attrdesc,
              attr: p.attr,
              zblist: this.ZBLISTData,
              selectZBData: [],
              radioID: "",
            });
          });
          //this.algParams = JSON.parse(element.PARAMS);
        }
      });
    },

    // 总量指标单选
    changeRadioOne(row, item) {
      debugger;
      item.selectZBData = [];
      item.selectZBData.push(row);
      console.log(row);
      this.factorList.push({
        name: item.name,
        desc: item.desc,
        attrdesc: item.attrdesc,
        attr: item.attr,
        zb: row
      });
      console.log(this.factorList);
    },

    // 获取行政区
    async getXzqList() {
      let params = {
        uid: window.sessionStorage.getItem("userid"),
      };
      const { data: res } = await getXzqList(params);
      if (res.code === 1) {
        this.xzqOptions = res.data;
      } else {
        this.$message.warning(res.msg);
      }
    },

    // 行政区选择
    changeXZQ(val) {
      console.log(val);
      let mc = this.xzqOptions.filter((item) => {
        return item.XZQDM === val;
      });
      //debugger;
      // 矢量
      this.SLForm.xzqmc = mc[0].XZQMC;
    },

    // 年份选择
    changeYear(val) {
      // 矢量
      this.SLForm.year = val;
      this.$forceUpdate();
    },



    // 辅助指标单选
    changeRadioTwo(row) {
      this.selectZBSubData = [];
      this.selectZBSubData.push(row);
      console.log(row);
      Object.assign(this.factorList, {
        sub: { iskey: 0, zbid: row.PID },
      });
      console.log(this.factorList);
    },

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

    // 模型列表当前页选择
    handleZBCurrentChange(val) {
      console.log(val);
      this.getZBTable(this.SLForm.modeltype);
    },

    //新增自定义指标模型
    addDefineSL()
    {

    }
  },
};
