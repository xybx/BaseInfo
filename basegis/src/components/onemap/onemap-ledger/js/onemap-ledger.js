/*
 * @Author: WCL
 * @Date: 2022-03-14 14:23:21
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-10 15:31:24
 * @FilePath: \webgis\src\components\onemap\onemap-ledger\js\onemap-ledger.js
 * @Description: 统计台账JS
 */
import { mapMutations, mapState } from "vuex";
import { getLayerList } from "../api/onemap-ledger-api";
import Chart from "@/components/common/chart/Chart.vue";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import Query from "@arcgis/core/rest/support/Query";
import { executeQueryJSON } from "@arcgis/core/rest/query";
import Graphic from "@arcgis/core/Graphic";
import { export2Excel } from "@/plugins/excel/util";
import { TRUE } from "sass";
export default {
  name: "",
  props: {},
  components: { Chart },
  data() {
    return {
      comTitle: "",
      dialogVisible: false,
      treeData: [
        // {
        //   LABEL: "1",
        //   LEVEL: "group",
        //   CHILDREN: [
        //     {
        //       LABEL: "2",
        //       LEVEL: "layer",
        //     },
        //   ],
        // },
      ],
      currentTreeDataItem: null, //当前选中的左侧图层数据
      defaultProps: {
        children: "CHILDREN",
        label: "LABEL",
      },
      drawer: false,
      resultTable: [
        // { landcode: "1", landname: "水田", area: "123.1" },
        // { landcode: "1", landname: "水田", area: "123.1" },
        // { landcode: "1", landname: "水田", area: "123.1" },
        // { landcode: "1", landname: "水田", area: "123.1" },
      ],
      resultTableHeads: [], //表格表头
      rtOption: {},
      showRT: false,
      tjField: "", //统计依据字段
      yAxisValues: [], //统计表Y轴显示值
      seriesDatas: [], //统计结果数据
      tjItemFields: [], //统计项列表
      bottomdrawer: false, //底部弹框显示与隐藏
      drawerSize: "40%",
      switchDrawer: true,
      switchDrawerIcon: "el-icon-arrow-down",
      loading: true,
      overlayTable: [],
      resultFields: [],
      currentPage: 1,
      pagesizeArr: [10, 20, 50, 100],
      pagesize: 5,
      total: 0,
      UPloading: true,
    };
  },
  computed: {
    ...mapState("map2d-store", ["mapview", "symbol"]),
  },
  watch: {
    dialogVisible(boo) {
      if (boo) {
      } else {
        this.drawer = false;
        this.bottomdrawer=false;
      }
    },
  },
  created() {},
  mounted() {
    this.getTreeData();
  },
  methods: {
    ...mapMutations("onemap-store", [
      "handleOnemapPopup",
      "handleToggleIndex",
      "handleUserGraphicLayer",
    ]),

    // 打开弹窗
    showDialog(obj) {
      this.comTitle = obj.title;
      this.dialogVisible = true;
      this.handleToggleIndex(false);
      this.getTreeData();
    },

    // 关闭弹窗
    closeDialog() {
      this.handleOnemapPopup({ code: "init" });
      this.handleToggleIndex(true);
      this.dialogVisible = false;
      // 清除图形
      this.mapview.graphics.removeAll();
      // 数据恢复初始
      Object.assign(this.$data, this.$options.data());
    },

    //加载树结构数据
    async getTreeData() {
      const { data: res } = await getLayerList();
      if (res.code == 1) {
        this.treeData = res.data;
      } else {
        this.$message.error(res.msg);
      }
    },

    // 左侧树点击事件
    handleNodeClick(data) {
      // FILETYPE 1:文件夹 非1:文件
      console.log(data, "data");
      if (data.LEVEL == "layer") {
        this.currentTreeDataItem = data;
        this.drawer = true;
        this.resultTable = [];
        if (
          data.TJFIELD == null ||
          data.TJFIELD == "" ||
          data.TJITEMFIELDS == null ||
          data.TJITEMFIELDS == ""
        ) {
          this.$message.warning("请联系管理员配置该数据的统计项");
          return;
        }
        //
        this.getChartData(data);
        //统计表
        this.getRcOption();
      }
    },

    //获取地图服务统计项配置完成图表统计数据
    async getChartData(data) {
      //debugger;
      this.resultTableHeads = [];
      this.resultTable = [];
      this.seriesDatas = [];
      this.yAxisValues = [];
      //统计分组字段名
      var tjField = data.TJFIELD.split("|")[0];
      //组装表格默认表头
      this.resultTableHeads.push({
        prop: "tjField", //tjField,
        label: data.TJFIELD.split("|")[1],
        type: data.TJFIELD.split("|")[2],
        isQuery: true,
        fieldname: tjField,
      });
      // this.resultTableHeads.push({
      //   prop: tjField + "COUNT",
      //   label: "统计个数",
      // });
      //服务的查询统计参数
      var queryParams = new Query();
      queryParams.where = "1=1";
      //统计项
      var thItemStatisticFields = [];
      var tjItems = data.TJITEMFIELDS.split(",");
      tjItems.forEach((item) => {
        //组装表格默认表头
        var fieldtype = item.split("|")[2];
        var label =
          fieldtype.toLowerCase().indexOf("double") > 0
            ? item.split("|")[1]
            : item.split("|")[1] + "个数";
        this.resultTableHeads.push({
          prop:
            label.indexOf("个数") > -1
              ? item.split("|")[0] + "COUNT"
              : item.split("|")[0],
          label: label,
          type: fieldtype,
          isQuery: false,
          fieldname:
            label.indexOf("个数") > -1
              ? item.split("|")[0] + "COUNT"
              : item.split("|")[0],
        });
        //组装统计项
        var fieldname = item.split("|")[0];
        var fieldtype = item.split("|")[2];
        let statisticDefinition = new StatisticDefinition({
          statisticType:
            fieldtype.toLowerCase().indexOf("double") > 0 ? "sum" : "count",
          onStatisticField: fieldname,
          outStatisticFieldName:
            fieldtype.toLowerCase().indexOf("double") > 0
              ? fieldname
              : fieldname + "COUNT",
        });
        thItemStatisticFields.push(statisticDefinition);
      });

      console.log("this.resultTableHeads", this.resultTableHeads);
      // let statisticDefinitionCount = new StatisticDefinition({
      //   statisticType: "count",
      //   onStatisticField: tjField,
      //   outStatisticFieldName: tjField + "COUNT",
      // });
      // thItemStatisticFields.push(statisticDefinitionCount);
      queryParams.outStatistics = thItemStatisticFields;
      //分组统计
      queryParams.groupByFieldsForStatistics = [tjField];
      const queryRes = await executeQueryJSON(data.URL, queryParams);
      console.log(queryRes, "queryRes");
      if (queryRes != null && queryRes.features.length > 0) {       

        queryRes.features.forEach((item) => {
          var dataitem = {};
          var yvalue = item.attributes[tjField];
          // var countvalue = item.attributes[tjField + "COUNT"];
          // countseriesdata.data.push(countvalue);
          //组装表数据
          Object.assign(dataitem, {
            tjField: yvalue,
            isquery: true,
          });
          // Object.assign(dataitem, {
          //   [tjField + "COUNT"]: countvalue,
          // });

          //统计数据
          this.yAxisValues.push(yvalue);        

          this.resultTableHeads.forEach((tjitem) => {
            var fieldname = tjitem.fieldname;
            var value = item.attributes[fieldname];
            Object.assign(dataitem, {
              [fieldname]: tjitem.type.toLowerCase().indexOf("double") > 0?(value?Number(value.toFixed(2)):0):value, //Number(value.toFixed(2)),
              isquery: false,
            });
          });

          this.resultTable.push(dataitem);
          console.log("resultTable", this.resultTable);
        });
        //this.seriesDatas.push(countseriesdata);

        //根据配置获取统计数据
        this.resultTableHeads.forEach((titem) => {
          var fieldtype = titem.type;
          var fieldname = titem.fieldname;
          //   var name =
          //     fieldtype.toLowerCase().indexOf("double") > 0
          //       ? item.split("|")[1]
          //       : item.split("|")[1] + "个数";
          var seriesdata = {
            name: titem.label,
            type: "bar",
            stack: "total",
            label: {
              show: true,
            },
            emphasis: {
              focus: "series",
            },

            data: [],
          };
          queryRes.features.forEach((item) => {
            var xvalue = item.attributes[fieldname];
            var x_value =
              fieldtype.toLowerCase().indexOf("double") > 0
                ?(xvalue?Number(xvalue.toFixed(2)):0)
                : xvalue;
            seriesdata.data.push(x_value);
          });
          this.seriesDatas.push(seriesdata);
          console.log(this.seriesDatas, "seriesDatas2");
        });
      }
    },

    // 获取图表数据
    getRcOption() {
      this.rtOption = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          left: "3%",
          right: "6%",
          bottom: "3%",
          top: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
          data: this.yAxisValues,
          //   data: [
          //     "音西街道",
          //     "龙江街道",
          //     "上迳镇",
          //     "高山镇",
          //     "江阴镇",
          //     "一都镇",
          //   ],
        },
        series: this.seriesDatas,
        // series: [
        //   {
        //     name: "Direct",
        //     type: "bar",
        //     stack: "total",
        //     label: {
        //       show: true,
        //     },
        //     emphasis: {
        //       focus: "series",
        //     },
        //     data: [320, 302, 301, 334, 390, 330, 320],
        //   },
        //   {
        //     name: "Mail Ad",
        //     type: "bar",
        //     stack: "total",
        //     label: {
        //       show: true,
        //     },
        //     emphasis: {
        //       focus: "series",
        //     },
        //     data: [120, 132, 101, 134, 90, 230, 210],
        //   },
        //   {
        //     name: "Affiliate Ad",
        //     type: "bar",
        //     stack: "total",
        //     label: {
        //       show: true,
        //     },
        //     emphasis: {
        //       focus: "series",
        //     },
        //     data: [220, 182, 191, 234, 290, 330, 310],
        //   },
        // ],
      };
      this.showRT = true;
    },

    //点击图表， 获取图表点击数据，统计表格数据
    async handleParams(params) {
      console.log(params, "获取的params");
      this.resultTableHeads = [];
      this.resultTable = [];
      //当前分析图层配置数据
      var data = this.currentTreeDataItem;

      //统计分组字段名
      var tjField = data.CHILDTJITEM.split("|")[0];
      //组装表格默认表头
      this.resultTableHeads.push({
        prop: tjField,
        label: data.CHILDTJITEM.split("|")[1],
      });
      console.log(this.resultTableHeads, "resultTableHeads1");
      this.resultTableHeads.push({
        prop: tjField + "COUNT",
        label: "统计个数",
      });
      console.log(this.resultTableHeads, "resultTableHeads2");
      //统计项
      var thItemStatisticFields = [];
      let statisticDefinitionCount = new StatisticDefinition({
        statisticType: "count",
        onStatisticField: tjField,
        outStatisticFieldName: tjField + "COUNT",
      });
      thItemStatisticFields.push(statisticDefinitionCount);
      var tjItems = data.TABLEFIELDS.split(",");
      tjItems.forEach((item) => {
        //组装表格默认表头
        var fieldtype = item.split("|")[2];
        var label =
          fieldtype.toLowerCase().indexOf("double") > 0
            ? item.split("|")[1]
            : item.split("|")[1] + "个数";
        this.resultTableHeads.push({
          prop: item.split("|")[0],
          label: label,
        });
        console.log(this.resultTableHeads, "resultTableHeads3");
        //组装统计项
        var fieldname = item.split("|")[0];
        var fieldtype = item.split("|")[2];
        let statisticDefinition = new StatisticDefinition({
          statisticType:
            fieldtype.toLowerCase().indexOf("double") > 0 ? "sum" : "count",
          onStatisticField: fieldname,
          outStatisticFieldName: fieldname,
        });
        thItemStatisticFields.push(statisticDefinition);
      });
      console.log(this.resultTableHeads, "resultTableHeads");
      //服务的查询统计参数
      var queryParams = new Query();
      queryParams.where =
        "1=1 and " + data.TJFIELD.split("|")[0] + "='" + params.name + "'";
      queryParams.outStatistics = thItemStatisticFields;
      //分组统计
      queryParams.groupByFieldsForStatistics = [tjField];
      const queryRes = await executeQueryJSON(data.URL, queryParams);
      if (queryRes != null && queryRes.features.length > 0) {
        queryRes.features.forEach((item) => {
          var dataitem = {};
          var yvalue = item.attributes[tjField];
          //组装表数据
          Object.assign(dataitem, {
            [tjField]: yvalue,
          });
          var countvalue = item.attributes[tjField + "COUNT"];
          Object.assign(dataitem, {
            [tjField + "COUNT"]: countvalue,
          });
          tjItems.forEach((tjitem) => {
            var fieldname = tjitem.split("|")[0];
            var value = item.attributes[fieldname];
            Object.assign(dataitem, {
              [fieldname]: value?Number(value.toFixed(2)):0,
            });
          });
          this.resultTable.push(dataitem);
        });
      }
    },

    // 导出数据
    exportData() {
      console.log("导出数据");
      console.log(this.resultTableHeads, this.resultTable);
      let cols = [];
      this.resultTableHeads.map((item) => {
        cols.push({ title: item.label, key: item.prop });
      });
      export2Excel(cols, this.resultTable, "统计台账导出数据表");
    },

    //统计结果表格行点击事件
    async handleRowClick(row) {
      console.log(row, "row");
      this.resultFields = [];
      this.overlayTable = [];
      this.bottomdrawer = true;
      this.UPloading = true;
      let layerurl = this.currentTreeDataItem.URL;

      var queryParams = new Query();
      queryParams.where = "1=1";
      queryParams.returnGeometry = true;
      //获取查询字段
      this.resultTableHeads.forEach((item) => {
        if (item.isQuery) {
          queryParams.where +=
            " and " + item.fieldname + "='" + row.tjField + "'";
        }
      });
      queryParams.outFields = ["*"];

      const queryRes = await executeQueryJSON(layerurl, queryParams);
      console.log(queryRes, "queryRes");
      this.UPloading = false;
      queryRes.fields.forEach((field) => {
        this.resultFields.push({
          prop: field.name,
          label: field.alias,
        });
      });
      queryRes.features.forEach((feature) => {
        let dataitem = { geo: feature.geometry };
        var fields = Object.keys(feature.attributes);
        for (var k = 0; k < fields.length; k++) {
          console.log(fields[k], "fields[k]");
          if (fields[k] != "SHAPE.AREA" && fields[k] != "SHAPE.LEN") {
            Object.assign(dataitem, feature.attributes);
          }
        }
        this.overlayTable.push(dataitem);
      });
    },

    // 抽屉关闭动画结束后状态恢复
    drawerClosed() {
      this.drawerSize = "40%";
      this.switchDrawer = true;
      this.switchDrawerIcon = "el-icon-arrow-down";
    },
    // 切换抽屉高度
    switchHeight() {
      this.switchDrawer = !this.switchDrawer;
      if (!this.switchDrawer) {
        this.switchDrawerIcon = "el-icon-arrow-up";
        this.drawerSize = "7%";
      } else {
        this.switchDrawerIcon = "el-icon-arrow-down";
        this.drawerSize = "50%";
      }
    },
    // pagesize 改变时触发
    handleSizeChange(val) {
      this.pagesize = val;
    },
    // currentpage 改变时触发
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    //单项数据点击定位
    async tableRowClick(row) {
      console.log(row, "row");
      let geo = row.geo;

      let graphic = new Graphic({
        geometry: geo,
        symbol: this.symbol,
      });
      this.mapview.graphics.removeAll();
      this.mapview.graphics.add(graphic);

      if (
        graphic.geometry.type == "polygon" ||
        graphic.geometry.type == "polyline"
      ) {
        this.mapview.center = graphic.geometry.extent.center;
        //this.mapview.zoom = this.mapview.zoom - 2;
      }

      if (graphic.geometry.type == "point") {
        this.mapview.center = graphic.geometry;
      }
    },
  },
};
