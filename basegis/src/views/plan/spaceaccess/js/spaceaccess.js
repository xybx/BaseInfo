import Chart from "@/components/common/chart/Chart.vue";
import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer.js";
import * as query from "@arcgis/core/rest/query.js";
import Query from "@arcgis/core/rest/support/Query.js";
import Graphic from "@arcgis/core/Graphic.js";
import { getMapConfig } from "@/components/map/map2d/api/map2d-api";

import {
    getGistApi,
    getRelationApi,
} from "@/views/plan/spaceconsist/api/spaceconsist-api";
import { getCheckResApi, getMapDatas } from "../api/spaceaccess-api";
import { TRUE } from "sass";
export default {
    name: "",
    props: {},
    components: { Chart },
    data() {
        return {
            chart1Option: {},
            chart2Option: {},
            tableData: [],
            loading: true,
            treeData: [],
            defaultProps: {
                children: "Items",
                label: "Name",
            },
            menuList: [],
            currType: "",
            view: null,
            groupLayer: null,
            attrTable: [],
            showAttr: false,
            isTable: false,
            attrText: "",
            zbData: [],
            showLayerTable: false,
            ColumnsOneTitle: "规划值（平方米）",
            ColumnsTwoTitle: "现状值（平方米）",
            isMapData: false,
        };
    },
    computed: {},
    watch: {},
    created() {},
    async mounted() {
        await this.initMap();
        this.getTreeData();
    },
    methods: {
        // 初始化地图
        async initMap() {
            let params = {
                uid: window.sessionStorage.getItem("userid"),
                modulename: "监测预警",
            };
            const { data: res } = await getMapConfig(params);
            if (res.code === 1) {
                let data = res.data;

                // 创建二维底图
                let baselayer = null;
                if (data.TYPE == "Image") {
                    baselayer = new MapImageLayer({
                        url: data.URL,
                        id: "basemap_layer",
                    });
                } else if (data.TYPE == "Tile") {
                    baselayer = new TileLayer({
                        url: data.URL,
                        id: "basemap_layer",
                    });
                }
                let basemap = new Basemap({
                    baseLayers: [baselayer],
                    title: "basemap",
                    id: "basemap",
                });

                let map = new Map({
                    basemap: basemap,
                });

                this.groupLayer = new GroupLayer({
                    id: "grouplayer",
                    visibilityMode: "exclusive",
                });
                map.add(this.groupLayer);

                this.view = new MapView({
                    map: map,
                    container: "map",
                    constraints: {
                        rotationEnabled: false,
                    },
                    navigation: {
                        momentumEnabled: false,
                    },
                    scale: mapParameters.scale,
                });
                console.log(this.view, "view");

                this.view.ui.remove(["attribution", "zoom"]);
            } else {
                this.$message.error(res.msg);
            }
        },
        /*
            获取左侧数据
            !暂时传固定值
        */
        async getTreeData() {
            // let params = {
            //     uid: sessionStorage.getItem('userid'),
            //     name: '总体规划（市级）',
            // };
            // const { data: res } = await getRelationApi(params);
            // if (res.code === 1) {
            //     this.menuList = res.data;
            //     this.currType = res.data[0].Name;
            //     this.treeData = res.data[0].Items;
            // } else {
            //     this.$message.warning(res.msg);
            // }

            let params = {
                pid: this.$route.query.pid,
                uid: sessionStorage.getItem("userid"),
            };
            const { data: res } = await getCheckResApi(params);
            if (res.code === 1) {
                this.menuList = res.data;
                this.currType = res.data[0].Name;
                this.treeData = res.data[0].Items;
            } else {
                this.$message.warning(res.msg);
            }
        },

        /* 菜单点击 */
        clickMenu(item) {
            this.isMapData = false;
            console.log(item, "item");
            this.currType = item.Name;
            this.treeData = item.Items;
            if (this.currType == "图数一致性") {
                this.isMapData = true;
                this.getTableData();
            }
        },

        /*
            树结构点击
            !根节点点击有图层切换
            !图层默认为动态服务
        */
        handleClickTree(data, node) {
            this.zbData = [];
            console.log(data, "data");
            console.log(node, "node");
            if (node.level === 2) {
                this.view.graphics.removeAll();
                this.attrText = "";
                this.attrTable = [];
                this.showAttr = true;
                // if (data.DataType == 'MapImage') {
                this.isTable = true;
                let findLayer = this.groupLayer.findLayerById(
                    `${data.Name}${data.ID}`
                );
                if (findLayer) {
                    findLayer.visible = true;
                    this.queryArea(data.URL);
                } else {
                    if (data.URL) {
                        this.showLayerTable = true;
                        // 截取
                        let spliceL = data.URL.lastIndexOf("/");
                        // 地址
                        let url = data.URL.slice(0, spliceL);
                        // 图层
                        let layerID = data.URL.slice(spliceL + 1);
                        let newLayer = new MapImageLayer({
                            id: `${data.Name}${data.ID}`,
                            url,
                            visible: true,
                            sublayers: [{ id: layerID }],
                        });
                        newLayer.loadAll().then(() => {
                            this.groupLayer.add(newLayer);
                            this.queryArea(data.URL);
                        });
                    } else {
                        this.showLayerTable = false;
                    }
                }
                //this.attrText = data.Remark;
                // }
                // else if (data.DataType == 'Text') {
                //     debugger;
                //     this.showAttr = true;
                //     this.isTable = false;
                //     this.attrText = data.Remark;
                // }
                let remark = data.Remark;
                let arr = remark.split("|");
                if (arr.length > 0) {
                    this.attrText = arr[0];
                    if (arr[1]) {
                        let datas = arr[1].split(",");
                        if (datas.length > 0) {
                            this.ColumnsOneTitle = datas[0];
                            this.ColumnsTwoTitle = datas[1];
                        }
                    }
                    if (arr[2]) {
                        let datas = arr[2].split(",");
                        if (datas.length > 0) {
                            this.zbData = [
                                { GHVALUE: datas[0], XZVALUE: datas[1] },
                            ];
                        }
                    }
                } else {
                    this.attrText = "";
                }
            }
        },

        /*
            查询面积
            !固定面积字段
            !统计OBJECTID前50
        */
        async queryArea(url) {
            let queryParams = new Query({
                where: `1=1`,
                returnGeometry: true,
                outFields: ["MJ", "OBJECTID"],
                orderByFields: ["OBJECTID"],
            });
            const res = await query.executeQueryJSON(url, queryParams);
            console.log(res, "res");
            let attrArr = [];
            if (res.features && res.features.length > 0) {
                res.features.map((item) => {
                    attrArr.push({
                        id: item.attributes["OBJECTID"],
                        mj: Number(item.attributes["MJ"]).toFixed(2),
                        geo: item.geometry,
                    });
                });
                this.attrTable = attrArr;
                this.showAttr = true;
            }
        },

        /* 属性表格行点击事件 */
        handleTableRow(row) {
            console.log(row, "row");
            let geo = new Graphic({
                symbol: {
                    type: "simple-fill",
                    color: [255, 255, 0, 0.2],
                    style: "solid",
                    outline: {
                        color: "red",
                        width: 2,
                    },
                },
                geometry: row.geo,
            });
            this.view.graphics.removeAll();
            this.view.graphics.add(geo);
            this.view.scale = 50000;
            this.view.goTo(row.geo.centroid);
        },

        /*获取图数一致性数据*/
        async getTableData() {
            let params = {
                jdid: this.$route.query.pid,
                classify: this.currType,
            };
            const { data: res } = await getMapDatas(params);

            if (res.code === 1) {
                this.loading = false;
                this.tableData = res.data;
                let zbarr = [];
                let zbvaluearr = [];
                let mapvaluearr = [];
                let cyarr = [];
                this.tableData.forEach((d) => {
                    zbarr.push(d.ZBNAME);
                    zbvaluearr.push(d.ZBVALUE);
                    mapvaluearr.push(d.MAPVALUE);
                    cyarr.push(d.DIFFVALUE);
                });
                this.getChart1Data(zbarr,zbvaluearr,mapvaluearr,cyarr);
                this.getChart2Data(zbarr,zbvaluearr,mapvaluearr,);
            } else {
                this.loading = false;
                this.$message.warning(res.msg);
            }
        },
        /*差异性对比图表*/
        getChart1Data(zbarr,zbvaluearr,mapvaluearr,cyarr) {
            this.chart1Option = {
                textStyle: {
                    color: "rgba(0, 0, 255, 1)",
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        // 坐标轴指示器，坐标轴触发有效
                        type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                legend: {
                    data: ["规划数值", "差异", "图上数值"],
                    textStyle: {
                        color: "rgba(0, 0, 255, 1)",
                    },
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true,
                },
                xAxis: [
                    {
                        type: "value",
                    },
                ],
                yAxis: [
                    {
                        type: "category",
                        axisTick: { show: false },
                        data: zbarr,
                    },
                ],
                series: [
                    {
                        name: "规划数值",
                        type: "bar",
                        label: {
                            normal: {
                                show: true,
                                position: "inside",
                            },
                        },
                        data: zbvaluearr,
                        itemStyle: {
                            normal: {
                                color: "#ff0000",
                            },
                        },
                    },
                    {
                        name: "差异",
                        type: "bar",
                        stack: "总量",
                        label: {
                            normal: {
                                show: true,
                                position: "inside",
                            },
                        },
                        data: cyarr,
                        itemStyle: {
                            normal: {
                                color: "#00ff00",
                            },
                        },
                    },
                    {
                        name: "图上数值",
                        type: "bar",
                        stack: "总量",
                        label: {
                            normal: {
                                show: true,
                                position: "inside",
                            },
                        },
                        data: mapvaluearr,
                        itemStyle: {
                            normal: {
                                color: "#0000ff",
                            },
                        },
                    },
                ],
            };
        },
        /*饼状图*/
        getChart2Data(zbarr,zbvaluearr,mapvaluearr,) {
            this.chart2Option = {
                textStyle: {
                    color: "rgba(0, 0, 255, 1)",
                },
                angleAxis: {
                    type: "category",
                    data: zbarr,
                    z: 10,
                },
                radiusAxis: {},
                polar: {},
                series: [
                    {
                        type: "bar",
                        data: zbvaluearr,
                        coordinateSystem: "polar",
                        name: "规划数值",
                        itemStyle: {
                            normal: {
                                color: "#E89589",
                            },
                        },
                    },
                    {
                        type: "bar",
                        data: mapvaluearr,
                        coordinateSystem: "polar",
                        name: "图上数值",
                        itemStyle: {
                            normal: {
                                color: "#0AAF9F",
                            },
                        },
                    },
                ],
                legend: {
                    show: true,
                    data: ["规划数值", "图上数值", "C"],
                    textStyle: {
                        color: "rgba(0, 0, 255, 1)",
                    },
                },
            };
        },
    },
};
