/*
 * @Author: WCL
 * @Date: 2022-03-14 15:54:03
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-11 14:03:35
 * @FilePath: \webgis\src\views\plan\planqc2\js\planqc2.js
 * @Description: 请填写描述
 */
import { getType, getList, getCGDataList } from "../api/planqc2-api";
import CommonMap2D from "@/components/map/commonmap2d/vue/CommonMap2D.vue";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import Query from "@arcgis/core/rest/support/Query";
import { executeQueryJSON,executeForCount } from "@arcgis/core/rest/query";
import {
  getAreaAndLength,
} from "../../../../utils/common-map-method";
import { Row } from "element-ui";
export default {
  name: "",
  props: {},
  components: {
    CommonMap2D,
  },
  data() {
    return {
      modulename: "规划审查",
      currentLayer: null, //当前叠加图层数据
      currentGeo:null,//定位的图形
      funType: 1, //1:叠加图层，2:定位
      form: {
        type: "",
        name: "",
      },
      // 规划类型选项
      regionData: [],
      leftTable: [],
      treeVisible: false,
      treeData: [],
      treeProps: { children: "CHILDREN", label: "LABEL" },
      resArea: "123",
      resCount: "456",
      resVisible: false,
      resultTable: [
        //{ objectid: 1, reason: "XX相交",geo:null },
      ],
      Loading:false
    };
  },
  computed: {},
  watch: {
    treeVisible(boo) {
      if (!boo) {
        this.resVisible = false;
      }
    },
  },
  created() {},
  mounted() {
    this.getRegionData();
    //this.getTableData();
  },
  methods: {
    // 获取规划类型
    async getRegionData() {
      const { data: res } = await getType();
      if (res.code === 1) {
        this.regionData = res.data;
        //this.getProjectNames();
      } else {
        this.$message.error(res.msg);
      }
    },

    // 获取成果质检列表数据组装
    getTableData() {
      let params = {
        uid: sessionStorage.getItem("userid"),
        keyword: this.form.name,
        typeid: this.form.type,
      };
      this.getTableList(params);
    },
    // 获取规划项目列表
    async getTableList(params) {
      const { data: res } = await getList(params);
      if (res.code === 1) {
        this.leftTable = res.data;
        // this.loading = false;
      } else {
        this.$message.error(res.msg);
      }
    },

    // 搜索
    handleSearch() {
      console.log(this.form);
      this.getTableData();
    },

    // 审查结论
    handleSC(row) {
      console.log(row);
      window.open(apiURL_file+"/"+row.RESULTREPORTURL);
    },

    // 左侧表格行点击
    leftTableClick(row, column, event) {
      console.log(row);
      if (row.LEVEL == "jd") {
        this.treeVisible = true;
        this.GetTreeData(row);
      }
    },
    //获取图层树数据
    async GetTreeData(row) {
      const { data: res } = await getCGDataList({ pid: row.PID });
      if (res.code === 1) {
        this.treeData = res.data;
        // this.loading = false;
      } else {
        this.$message.error(res.msg);
      }
    },
    // 弹窗树节点点击
    async treeNodeClick(data) {
      debugger;
      this.resultTable=[];
      this.Loading=true;
      this.resArea = 0;
      // LEVEL group:分组 layer:图层
      //GROUPID==2:问题数据
      if (data.LEVEL == "layer" && data.GROUPID == 2) {
        this.resVisible = true;

        //叠加图层
        this.currentLayer = {
          id: data.LABEL,
          url: data.URL,
        };
        //todo:分析问题数据
        //统计总个数
        var queryCountParams = new Query();
        queryCountParams.where = "1=1";
        const queryCountRes = await executeForCount(data.URL,queryCountParams );
        this.resCount=queryCountRes;
       
        var queryParams = new Query();
        queryParams.where = "1=1";
        queryParams.outFields = ["*"];
        queryParams.returnGeometry = true;
        const queryRes = await executeQueryJSON(data.URL, queryParams);
        if (queryRes != null && queryRes.features.length > 0) {
          queryRes.features.forEach(async (feature) => {
            
            //let arearesult = await getAreaAndLength(feature.geometry);
            let area=feature.attributes["CWTBMJ"]
            //平方米转公顷
            let _area=Number(area)/10000;
             //统计总面积
            this.resArea += Number(_area);
            this.Loading=false;
            var resultTableData={
              prjid:feature.attributes["PRJID"],
              reason:feature.attributes["CWMS"],
              area:_area,
              geo:feature.geometry
            };
            this.resultTable.push(resultTableData);
          });
        }
        
      } else if(data.LEVEL == "layer" && data.GROUPID == 1) {
        this.resVisible = false;
        //todo:成果数据只做叠加图层处理
        this.funType = 1;
        this.currentLayer = {
          id: data.LABEL,
          url: data.URL,
        };
      }
    },
    //定位
    location(row)
    {
      debugger;
      this.funType=2;
      this.currentGeo=row.geo;
    }
  },
};
