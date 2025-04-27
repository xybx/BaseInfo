/*
 * @Author: WCL
 * @Date: 2022-01-13 15:35:11
 * @LastEditors: WCL
 * @LastEditTime: 2022-05-06 18:00:59
 * @FilePath: \webgis\src\components\monitor\currentland\js\currentland.js
 * @Description: 现状用地-查看详细JS
 */
import {
    getXZYDYears,
    getXZYDTree,
    GetXZYDSonItemNameByYearTJ,
    getXZYDTJ,
    getXZYDTJYear,
    getXZQTJ,
    getMapConfigApi,
} from "../api/currentland-api";
import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
export default {
    name: "",
    props: {
        moduleId: Number,
        dialogCurrent: Boolean,
    },
    components: {},
    data() {
        return {			
            treeDataYear: [],
            treeData: [],
            defaultProps: {
                children: "children",
                label: "label",
            },
            tableData: [],
            headLabel: "",
            headLabelYear: "",
            spanArr1: [],
            pos1: null,
        };
    },
    computed: {},
    watch: {},
    created() {},
    async mounted() {
        //this.getMapConfig("统一平台");
        await this.getTreeList();
		this.$refs.treeData.setCurrentKey(this.treeData[0].value);        
        this.$nextTick(async () => {
            this.getOneLineChart();
			await this.getTreeYearList();
			this.$refs.treeDataYear.setCurrentKey(this.treeDataYear[0].children[0].value);
			await this.getYearChart(this.treeDataYear[0].children[0].value);
        });
    },
    methods: {
        // 合并行的方法
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0) {
                const _row = this.spanArr1[rowIndex];
                const _col = _row > 0 ? 1 : 0;
                return {
                    rowspan: _row,
                    colspan: _col,
                };
            }
            console.log("合并行");
        },

        // 获取二级菜单柱状图数据
        async getTwoLineChart(sonitemname) {
            var chartDom = document.getElementById("line-chart");
            var myChart = this.$echart.init(chartDom);
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid: this.moduleId,
                sonitemname,
            };
            const { data: res } = await GetXZYDSonItemNameByYearTJ(params);

            if (res.code === 1) {
                var xAxisData = [];
                var seriesData = [];
                res.data.forEach((y) => {
                    xAxisData.push(y.itemname);
                    seriesData.push(y.value);
                });
                var option = {
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow",
                        },
                    },
                    xAxis: {
                        type: "category",
                        data: xAxisData,
                    },
                    yAxis: {
                        type: "value",
                    },
                    series: [
                        {
                            name: sonitemname,
                            data: seriesData,
                            type: "bar",
                        },
                    ],
                };
                // var option = {
                // 	tooltip: {
                // 		trigger: "axis",
                // 	},
                // 	grid: {
                // 		left: "3%",
                // 		right: "4%",
                // 		bottom: "3%",
                // 		containLabel: true,
                // 	},
                // 	dataset: {
                // 		source: res.data,
                // 	},

                // 	xAxis: [
                // 		{
                // 			type: "category",
                // 		},
                // 	],
                // 	yAxis: [
                // 		{
                // 			type: "value",
                // 		},
                // 	],
                // 	series: [
                // 		{
                // 			type: "bar",
                // 			itemStyle: {
                // 				normal: {
                // 					color: function (params) {
                // 						var colorList = [
                // 							"#5470c6",
                // 							"#91cc75",
                // 							"#fac858",
                // 							"#ee6666",
                // 							"#73c0de",
                // 							"#3ba272",
                // 							"#fc8452",
                // 							"#9a60b4",
                // 							"#ea7ccc",
                // 						];
                // 						return colorList[
                // 							params.dataIndex
                // 						];
                // 					},
                // 				},
                // 			},
                // 		},
                // 	],
                // };
            } else {
                this.$message.error(res.msg);
            }
            myChart.clear();
            option && myChart.setOption(option);
            window.addEventListener("resize", function () {
                myChart.resize();
            });
        },

        // 获取一级菜单柱状图数据
        async getOneLineChart() {
            var chartDom = document.getElementById("line-chart");
            var myChart = this.$echart.init(chartDom);
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid: this.moduleId,
            };
            const { data: res } = await getXZYDTJ(params);
            if (res.code === 1) {
                var option = {
                    tooltip: {
                        trigger: "axis",
                    },
                    legend: {},
                    grid: {
                        left: "3%",
                        right: "4%",
                        bottom: "3%",
                        containLabel: true,
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
                        },
                    ],
                };
            } else {
                this.$message.error(res.msg);
            }
            myChart.clear();
            option && myChart.setOption(option);
            window.addEventListener("resize", function () {
                myChart.resize();
            });
        },

        // 获取左侧树列表
        async getTreeList() {
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid: this.moduleId,
            };
            const { data: res } = await getXZYDTree(params);
            if (res.code === 1) {
                this.treeData = res.data;
                this.headLabel = res.data[0].label;
            } else {
                this.$message.error(res.msg);
            }
        },
        // 获取左侧树列表
        async getTreeYearList() {
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid: this.moduleId,
            };
            const { data: res } = await getXZYDYears(params);
            if (res.code === 1) {
                this.treeDataYear = res.data;
                this.headLabelYear = res.data[0].label;
                //this.getYearChart(res.data[0].value);
            } else {
                this.$message.error(res.msg);
            }
        },

        // 关闭弹窗
        closeCurrent() {
            this.$emit("closeCurrent");
        },

        // 树节点点击事件
        treeClick(item) {
            console.log(item);
            this.headLabel = item.label;
            if (item.children) {
                this.getOneLineChart();
                //this.getTableData(0);
            } else {
                this.getTwoLineChart(item.value);
                //this.getTableData(item.value);
            }
        },
        treeClickYear(item) {
            console.log(item);
            this.headLabelYear = item.label;
            this.getYearChart(item.value);
        },
        async getYearChart(year) {
            var chartDom = document.getElementById("year-chart");
            var myChart = this.$echart.init(chartDom);
            let params = {
                uid: sessionStorage.getItem("userid"),
                moduleid: this.moduleId,
                year,
            };
            const { data: res } = await getXZYDTJYear(params);

            if (res.code === 1) {
                var option = {
                    tooltip: {
                        trigger: "axis",
                    },
                    grid: {
                        left: "3%",
                        right: "4%",
                        bottom: "3%",
                        containLabel: true,
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
                        },
                    ],
                    series: [
                        {
                            type: "bar",
                            itemStyle: {
                                normal: {
                                    color: function (params) {
                                        var colorList = [
                                            "#5470c6",
                                            "#91cc75",
                                            "#fac858",
                                            "#ee6666",
                                            "#73c0de",
                                            "#3ba272",
                                            "#fc8452",
                                            "#9a60b4",
                                            "#ea7ccc",
                                        ];
                                        return colorList[params.dataIndex];
                                    },
                                },
                            },
                        },
                    ],
                };
            } else {
                this.$message.error(res.msg);
            }
            myChart.clear();
            option && myChart.setOption(option);
            window.addEventListener("resize", function () {
                myChart.resize();
            });
        },

        // 获取表格数据
        async getTableData(year) {
            let params = {
                moduleid: this.moduleId,
                uid: sessionStorage.getItem("userid"),
                year,
            };

            const { data: res } = await getXZQTJ(params);

            if (res.code === 1) {
                this.spanArr1 = [];
                // 第一列合并方法
                for (var i = 0; i < res.data.length; i++) {
                    if (i === 0) {
                        this.spanArr1.push(1);
                        this.pos1 = 0;
                    } else {
                        if (res.data[i].XZQMC === res.data[i - 1].XZQMC) {
                            this.spanArr1[this.pos1] += 1;
                            this.spanArr1.push(0);
                        } else {
                            this.spanArr1.push(1);
                            this.pos1 = i;
                        }
                    }
                }
                this.tableData = res.data;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 获取底图配置
        async getMapConfig(modulename) {
            let params = {
                uid: sessionStorage.getItem("userid"),
                modulename,
            };
            const { data: res } = await getMapConfigApi(params);
            debugger;
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
            let view = new MapView({
                container: "detailmap",
                map,
                zoom: 3,
            });

            // 去掉地图logo和缩放
            view.ui.remove(["attribution"]);
        },
    },
};
