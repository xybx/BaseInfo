/*
 * @Author: WCL
 * @Date: 2022-01-13 13:28:58
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-14 14:14:03
 * @FilePath: \webgis\src\views\monitor\dynamicmonitor\js\dynamicmonitor.js
 * @Description: 请填写描述
 */
import Chart from "@/components/common/chart/Chart.vue";
import {
    getModuleList,
    getXZYD,
    getDXGKTJ,
    getCXGHTJ,
    getNDXZJSYDTJ,
    getValsTJ,
    getLayers,
    getMapConfigApi,
} from "../api/dynamicmonitor-api";
import CurrentLand from "@/components/monitor/currentland/vue/CurrentLand.vue";
import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
export default {
    name: "",
    props: {},
    components: { Chart, CurrentLand },
    data() {
        return {
            activeBYName: "5",
            activeGMName: "7",
            BYTabs: [],
            GMTabs: [],
            BYOptions: {},
            GMOptions: {},
            GMData: [],
            BYData: [],
            moduleList: [],
            leftTopTitle: "",
            leftCenterTitle: "",
            rightTopTitle: "",
            rightCenterTitle: "",
            moduleId: null,
            dialogCurrent: false,
            landUseOption: {},
            showLandUse: false,
            lineCtrlOption: {},
            showLineCtrl: false,
            townPlanOption: {},
            showTownPlan: false,
            addBuildOption: {},
            showAddBuild: false,
            dialogBaseline: false,
            baselineOption: {},
            showBaseline: false,
            layerlist: [],
            focusHead: "",
            view: null,
        };
    },
    computed: {},
    watch: {},
    created() {},
    async mounted() {
        await this.getModules();
        await this.getLayerList();
        // this.initMap('cityField');
        this.getMapConfig("统一平台");
        this.getGaugeChart();
        this.getLineCtlChart();
        this.getTownPlanChart();
        this.getAddBuildChart();
        this.getFarmlandChart(this.moduleList[4].PID);
        this.getLandScale(this.moduleList[6].PID);
    },
    methods: {
        // 现状用地查看详细
        handleCurrDetail() {
            this.moduleId = this.moduleList[0].PID;
            this.dialogCurrent = true;
        },

        // 底线管控查看详细
        handleBaselineDetail() {
            let app = this;
            this.moduleId = this.moduleList[2].PID;
            this.dialogBaseline = true;
            this.$nextTick(() => {
                app.showBaseline = true;
            });
        },

        // 耕地/林地保有量切换
        handleBYClick(tab) {
            this.loadLayer(tab.label);
            this.$nextTick(() => {
                this.getFarmlandChart(tab.name);
            });
        },

        // 城乡建设用地/建设用地总规模规模切换
        handleGMClick(tab) {
            this.loadLayer(tab.label);
            this.$nextTick(() => {
                this.getLandScale(tab.name);
            });
        },

        // 获取左侧仪表盘图表数据
        async getGaugeChart() {
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid: this.moduleList[0].PID,
            };

            const { data: res } = await getXZYD(params);
            if (res.code === 1) {
                let maxvalue = 0;
                let arrName = res.data.map((item) => {
                    return item.itemname;
                });
                let arrVal = res.data.map((item) => {
                    // maxvalue += number(item.value);
                    if (maxvalue < Number(item.value)) {
                        maxvalue = Number(item.value);
                    }
                    return item.value;
                });
                this.landUseOption = {
                    polar: {
                        radius: ["5%", "80%"],
                    },
                    angleAxis: {
                        max: maxvalue + 20 > 100 ? maxvalue : 100,
                    },
                    radiusAxis: {
                        type: "category",
                        data: arrName,
                        axisLabel: {
                            rotate: 40,
                        },
                    },
                    tooltip: {},
                    series: {
                        type: "bar",
                        data: arrVal,
                        coordinateSystem: "polar",
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    var colorList = [
                                        "#5470c6",
                                        "#91cc75",
                                        "#fac858",
                                    ];
                                    return colorList[params.dataIndex];
                                },
                            },
                        },
                    },
                };
                this.showLandUse = true;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 底线管控图表数据
        async getLineCtlChart() {
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid: this.moduleList[2].PID,
            };
            const { data: res } = await getDXGKTJ(params);
            if (res.code === 1) {
                this.lineCtrlOption = {
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "cross",
                            crossStyle: {
                                color: "#999",
                            },
                        },
                    },
                    legend: {},
                    grid: {
                        bottom: "10%",
                    },
                    dataset: {
                        source: res.data.slice(0, 5),
                    },
                    xAxis: [
                        {
                            type: "category",
                        },
                    ],
                    yAxis: [
                        {
                            type: "value",
                            name: "数值",
                            axisLabel: {
                                formatter: "{value} ",
                            },
                        },
                        {
                            type: "value",
                            name: "数值",
                            axisLabel: {
                                formatter: "{value} ",
                            },
                        },
                    ],
                    series: [
                        {
                            type: "bar",
                        },
                        {
                            type: "bar",
                        },
                        {
                            type: "bar",
                            //yAxisIndex: 1,
                        },
                    ],
                };
                this.baselineOption = {
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "cross",
                            crossStyle: {
                                color: "#999",
                            },
                        },
                    },
                    legend: {},
                    grid: {
                        bottom: "10%",
                    },
                    dataset: {
                        source: res.data,
                    },
                    xAxis: [
                        {
                            type: "category",
                        },
                    ],
                    yAxis: [
                        {
                            type: "value",
                            name: "数值",
                            axisLabel: {
                                formatter: "{value} ",
                            },
                        },
                        {
                            type: "value",
                            name: "数值",
                            axisLabel: {
                                formatter: "{value} ",
                            },
                        },
                    ],
                    series: [
                        {
                            type: "bar",
                        },
                        {
                            type: "bar",
                        },
                        {
                            type: "line",
                            yAxisIndex: 1,
                        },
                    ],
                };
                this.showLineCtrl = true;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 城乡规划图表数据
        async getTownPlanChart() {
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid: this.moduleList[1].PID,
            };
            const { data: res } = await getCXGHTJ(params);
            let seriesarr = [];
            // for (let index = 0; index < res.data.length; index++) {
            //     seriesarr.push({ type: 'bar' });
            // }
            for (let index = 0; index < res.data[0].length; index++) {
                seriesarr.push({ type: "bar" });
            }
            if (res.code === 1) {
                this.townPlanOption = {
                    tooltip: {},
                    legend: {
                        type: "scroll",
                    },
                    dataset: {
                        source: res.data,
                    },
                    xAxis: {
                        type: "category",
                    },
                    grid: {
                        bottom: "10%",
                    },
                    yAxis: {},
                    series: seriesarr,
                };
                this.showTownPlan = true;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 新增建设用地图表数据
        async getAddBuildChart() {
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid: this.moduleList[3].PID,
            };
            const { data: res } = await getNDXZJSYDTJ(params);
            if (res.code === 1) {
                this.addBuildOption = {
                    tooltip: {
                        trigger: "item",
                    },
                    dataset: {
                        source: res.data,
                    },
                    series: [
                        {
                            type: "pie",
                            radius: "70%",
                        },
                    ],
                };
                this.showAddBuild = true;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 耕地保有量图表数据
        async getFarmlandChart(moduleid) {
            var myChart = this.$echart.init(
                document.getElementById("farmland")
            );
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid,
            };
            const { data: res } = await getValsTJ(params);
            if (res.code === 1) {
                let seriesarr = [];
                let tjdata = [];
                let alarmvalue_index = 0;
                for (let index = 1; index < res.data[0].length; index++) {
                    console.log(
                        res.data[0][index],
                        res.data[0][index].indexOf("预警值"),
                        11
                    );
                    if (res.data[0][index].indexOf("预警值") !== -1) {
                        // if (alarmvalue_index==0) {
                        //     alarmvalue_index = index;
                        // }
                        console.log(res.data[0][index]);
                        seriesarr.push({ type: "line" });
                    } else {
                        seriesarr.push({ type: "bar" });
                    }
                    //index == res.data[0].length - 2 ? seriesarr.push({ type: 'line', }) : seriesarr.push({ type: 'bar' });
                }
                console.log(seriesarr);
                debugger;
                // for (let i = 0; i < res.data.length; i++) {
                //     const element = res.data[i];
                //     let datas = [];
                //     for (let j = 0; j < alarmvalue_index; j++) {
                //         const element = res.data[i][j];
                //         datas.push(element);
                //     }
                //     tjdata.push(datas);
                // }
                var option = {
                    // legend: {},

                    tooltip: {},
                    dataset: {
                        source: res.data,
                    },
                    grid: {
                        left: "3%",
                        right: "4%",
                        bottom: "3%",
                        containLabel: true,
                    },
                    xAxis: { type: "category" },
                    yAxis: {},
                    series: seriesarr,
                };
            } else {
                this.$message.error(res.msg);
            }
            myChart.setOption(option);
            window.addEventListener("resize", function () {
                myChart.resize();
            });
        },

        // 用地规模图表数据
        async getLandScale(moduleid) {
            var myChart = this.$echart.init(
                document.getElementById("landScale")
            );
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid,
            };
            const { data: res } = await getValsTJ(params);

            let seriesarr = [];
            for (let index = 1; index < res.data[0].length; index++) {
                seriesarr.push({ type: "line" });
            }

            if (res.code === 1) {
                var option = {
                    tooltip: {
                        trigger: "axis",
                    },
                    // legend: {},
                    dataset: {
                        source: res.data,
                    },
                    grid: {
                        left: "3%",
                        right: "4%",
                        bottom: "3%",
                        containLabel: true,
                    },
                    xAxis: {
                        type: "category",
                        boundaryGap: false,
                    },
                    yAxis: {
                        type: "value",
                    },
                    series: seriesarr,
                };
            } else {
                this.$message.error(res.msg);
            }
            myChart.setOption(option);
            window.addEventListener("resize", function () {
                myChart.resize();
            });
        },

        // 获取底图配置
        async getMapConfig(modulename) {
            let params = {
                uid: sessionStorage.getItem("userid"),
                modulename,
            };
            const { data: res } = await getMapConfigApi(params);

            if (res.code === 1) {
                this.initMap(res.data);
            } else {
                this.$message.error(res.msg);
            }
        },

        // 初始化地图
        initMap(data) {
            // 底图类型
            let baselayer = null;
            if (data.TYPE == "Image") {
                baselayer = new MapImageLayer({
                    url: data.URL,
                });
            } else if (data.TYPE == "Tile") {
                baselayer = new TileLayer({
                    url: data.URL,
                });
            }

            // 底图
            let basemap = new Basemap({
                baseLayers: [baselayer],
                title: "basemap",
                id: "basemap",
            });

            // 地图
            let map = new Map({
                basemap,
            });

            // 地图视图
            this.view = new MapView({
                container: "cityField",
                map,
                zoom: 3,
            });
            console.log(this.view);

            // 去掉地图logo和缩放
            this.view.ui.remove(["attribution"]);
        },

        // 获取模块列表
        async getModules() {
            let params = {
                uid: sessionStorage.getItem("userid"),
            };
            const { data: res } = await getModuleList(params);
            if (res.code === 1) {
                this.moduleList = res.data;
                this.leftTopTitle = this.moduleList[0].MODULENAME;
                this.leftCenterTitle = this.moduleList[2].MODULENAME;
                this.rightTopTitle = this.moduleList[1].MODULENAME;
                this.rightCenterTitle = this.moduleList[3].MODULENAME;
                this.BYTabs = this.moduleList.slice(4, 6);
                this.GMTabs = this.moduleList.slice(6);
            } else {
                this.$message.error(res.msg);
            }
        },

        // 关闭现状用地详细
        closeCurrent() {
            this.dialogCurrent = false;
        },

        // 关闭底线管控详细
        handleBaselineClose() {
            this.dialogBaseline = false;
            this.showBaseline = false;
        },

        // 获取地图图层列表
        async getLayerList() {
            let params = {
                uid: sessionStorage.getItem("userid"),
            };
            const { data: res } = await getLayers(params);
            if (res.code === 1) {
                this.layerlist = res.data;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 标题点击地图叠加
        loadLayer(title) {
            this.focusHead = title;
            console.log(title, "title");
            this.view.map.removeAll();
            this.layerlist.map((item) => {
                console.log(item);
                if (title == item.LAYERNAME) {
                    let layer = new FeatureLayer({
                        url: item.LAYERURL,
                        title: item.LAYERNAME,
                    });
                    this.view.map.add(layer, 1);
                }
            });
        },
    },
};
