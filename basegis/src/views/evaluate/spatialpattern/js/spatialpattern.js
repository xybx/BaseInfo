/*
 * @Author: WCL
 * @Date: 2022-01-11 13:17:38
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-12 14:55:52
 * @FilePath: \webgis\src\views\evaluate\spatialpattern\js\spatialpattern.js
 * @Description: 空间格局韧性评估JS
 */
import { mapState } from "vuex";
import Chart from "@/components/common/chart/Chart.vue";
import LayerTree from "@/plugins/layer-tree/src/tree.vue";
import FxpjBase from "@/mixins/fxpjbase/fxpj-base.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Draw from "@arcgis/core/views/draw/Draw";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import ServiceAreaParameters from "@arcgis/core/rest/support/ServiceAreaParameters";
import * as serviceArea from "@arcgis/core/rest/serviceArea";
import Query from "@arcgis/core/rest/support/Query";
import { executeQueryJSON } from "@arcgis/core/rest/query";
import Extent from "@arcgis/core/geometry/Extent";
import * as networkService from "@arcgis/core/rest/networkService";
import { getRtData } from "../api/spatialpattern-api";

let NAlayer = new GraphicsLayer({ id: "nalayer", opacity: 0.8 });
let resultLayer = new GraphicsLayer({ id: "resultLayer" });
let shqLocation = new FeatureSet();
let selPt = null;

export default {
    name: "",
    props: {},
    components: { Chart, LayerTree },
    mixins: [FxpjBase],
    data() {
        return {
            fxpjType: 4, // 1:双评价 2：双评估,3:承载力，4：空间格局韧性评估
            tableData: [],
            typeSwitch: false,
            selForm: {
                trip: "步行",
                time: 15,
            },
            // !暂时写固定，5为城市宜居性分析
            showSel: 5,
            treepid: 0,
            chartList: [],
            tableColList: [
                { prop: "name", label: "出行方式及时长" },
                { prop: "ssname", label: "设施名称" },
                { prop: "sstype", label: "设施类型" },
            ],
            spanArr1: [],
            pos1: null,
            chartShow: true,
        };
    },
    computed: {
        ...mapState("map2d-store", ["pointSymbol"]),
    },
    watch: {
        chartList: {
            handler(arr) {
                if (arr.length > 0) {
                    this.chartShow = false;
                } else {
                    this.chartShow = true;
                }
            },
        },
    },
    created() {},
    mounted() {
        this.getMapConfig(this.$route.name);
    },
    methods: {
        // 右上图表
        async getRtOption(typeid) {
            let params = {
                typeid,
            };
            const { data: res } = await getRtData(params);
            if (res.code === 1) {
                this.rtTitle = res.title;
                // ! chartList 数据为假数据
                if (this.chartList.length > 0) {
                    this.rtOption = {
                        tooltip: {
                            trigger: "item",
                        },
                        series: [
                            {
                                type: "pie",
                                radius: "70%",
                                data: this.chartList,
                                emphasis: {
                                    itemStyle: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: "rgba(0, 0, 0, 0.5)",
                                    },
                                },
                                itemStyle: {
                                    shadowColor: "rgba(0, 0, 0, 0.5)",
                                },
                            },
                        ],
                    };
                    this.showRT = true;
                } else {
                    this.rtOption = {};
                }
            }
        },

        // 右中图表
        async getRcOption(parentid) {
            // * 此模块无右中图表，纯属占位
            console.log("右中图表占位");
        },

        // 合并行的方法
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0 && row.xzqmc) {
                const _row = this.spanArr1[rowIndex];
                const _col = _row > 0 ? 1 : 0;
                return {
                    rowspan: _row,
                    colspan: _col,
                };
            }
        },

        // 选择分析点
        selectPoint() {
            this.view.graphics.removeAll();
            NAlayer.removeAll();
            let draw = new Draw({
                view: this.view,
            });

            let action = draw.create("point", { mode: "click" });

            // 获取焦点
            this.view.focus();
            // 指针移动事件
            action.on("cursor-update", (evt) => {
                this.createPoint(evt);
            });
            // 绘制完成事件
            action.on("draw-complete", (evt) => {
                this.createPoint(evt);
            });
        },

        // 创建点
        createPoint(evt) {
            this.view.graphics.removeAll();
            if (evt != null) {
                selPt = evt;
                let point = {
                    type: "point",
                    x: evt.coordinates[0],
                    y: evt.coordinates[1],
                    spatialReference: this.view.spatialReference,
                };

                let graphic = new Graphic({
                    geometry: point,
                    symbol: this.pointSymbol,
                });

                this.view.graphics.add(graphic);
                selPt = graphic;
                shqLocation.features.push(evt);
                if (evt.type == "draw-complete") {
                    this.view.map.add(NAlayer);
                }
            }
        },

        // 开始分析
        async beginFX() {
            let loading = null;
            if (loading != null) {
                loading.close();
            }
            this.tableData = [];
            this.view.map.add(resultLayer);

            // 路网分析
            let distance = 0;
            let wayValue = this.selForm.trip;
            let m = this.selForm.time;

            if (!Boolean(wayValue)) {
                return this.$message.warning("请选择出行方式");
            }
            if (m == 0) {
                return this.$message.warning("请设定出行时长");
            }
            if (selPt == null) {
                return this.$message.warning("请在地图上点击选择分析点");
            }
            loading = this.$message({
                iconClass: "el-icon-loading",
                message: "正在分析...",
                duration: 0,
                customClass: "prop-search",
            });

            let lineSymbol = null;
            let fillSymbol = null;
            switch (wayValue) {
                case "步行":
                    distance = m * 80;
                    lineSymbol = {
                        type: "simple-line",
                        color: [255, 0, 0],
                        width: "1px",
                        style: "solid",
                    };
                    fillSymbol = {
                        type: "simple-fill",
                        color: [255, 106, 106, 0.2],
                        width: "2px",
                        style: "solid",
                        outline: lineSymbol,
                    };
                    break;
                case "骑行":
                    distance = m * 200;
                    lineSymbol = {
                        type: "simple-line",
                        color: [0, 255, 0],
                        width: "1px",
                        style: "solid",
                    };

                    fillSymbol = {
                        type: "simple-fill",
                        color: [0, 255, 0, 0.2],
                        width: "2px",
                        style: "solid",
                        outline: lineSymbol,
                    };
                    break;
                case "开车":
                    distance = m * 500;
                    lineSymbol = {
                        type: "simple-line",
                        color: [0, 0, 255],
                        width: "1px",
                        style: "solid",
                    };

                    fillSymbol = {
                        type: "simple-fill",
                        color: [0, 0, 255, 0.2],
                        width: "2px",
                        style: "solid",
                        outline: lineSymbol,
                    };
                    break;

                default:
                    break;
            }

            // const networkDescription = await networkService.fetchServiceDescription(serviceAreaUrl, apiKey);
            // const travelMode = networkDescription.supportedTravelModes.find(
            //   (travelMode) => travelMode.name === "Walking Distance"
            // );

            let params = new ServiceAreaParameters({
                defaultBreaks: [distance],
                outSpatialReference: this.view.spatialReference,
                returnFacilities: true,
                // travelMode,
                travelDirection: "to-facility",
                trimOuterPolygon: true,
                trimPolygonDistance: distance,
                trimPolygonDistanceUnits: "meters",
            });
            params.facilities = new FeatureSet();
            params.facilities.features.push(selPt);

            // if (
            //     result.serviceAreaPolygons != null &&
            //     result.serviceAreaPolygons.features.length > 0
            //   ) {
            //     result.serviceAreaPolygons.features.map(async (item) => {
            //       item.symbol = fillSymbol;
            //       CSNAlayer.add(item);
            //       geos.push(item.geometry);
            //     });
            //   }
            const result = await serviceArea.solve(serviceAreaUrl, params);
            console.log(result, "result");
            debugger;
            let graphics = [];
            if (result.serviceAreaPolygons.length > 0) {
                result.serviceAreaPolygons.map(async (item) => {
                    item.symbol = fillSymbol;
                    graphics.push(item);
                });
            }
            console.log(result.serviceAreaPolygons, "serviceAreaPolygons");
            if (
                result.serviceAreaPolygons.features &&
                result.serviceAreaPolygons.features.length
            ) {
                result.serviceAreaPolygons.features.map(async (item) => {
                    item.symbol = fillSymbol;
                    graphics.push(item);
                });
            }

            if (graphics.length > 0) {
                graphics.map(async (item) => {
                    // console.log(fillSymbol);
                    // item.symbol = fillSymbol;
                    //console.log(item, '111item');
                    NAlayer.add(item);
                    let query = new Query({
                        where: "type is not null",
                        outFields: ["*"],
                        geometry: item.geometry,
                        returnGeometry: true,
                    });

                    console.log(this.fxLayer, "fxLayer");
                    const queryRes = await executeQueryJSON(
                        `${this.fxLayer.url}/${this.fxLayer.layerid}`,
                        query
                    );
                    console.log(queryRes, "queryRes");
                    if (queryRes && queryRes.features.length > 0) {
                        // 渲染
                        queryRes.features.map((item) => {
                            console.log(item, "item");
                            let graphic = new Graphic({
                                geometry: item.geometry,
                                symbol: {
                                    type: "simple-marker",
                                    color: "red",
                                    size: 8,
                                    outline: {
                                        width: 0.5,
                                        color: "white",
                                    },
                                },
                            });
                            NAlayer.add(graphic);

                            let trData = {
                                name: `${this.selForm.trip}${this.selForm.time}分钟`,
                                ssname: item.attributes["NAME"],
                                sstype: item.attributes["TYPE"],
                                graphic,
                            };
                            this.tableData.push(trData);
                        });

                        let newChartData = this.groupBy(
                            this.tableData,
                            (item) => {
                                return [item.sstype];
                            }
                        );

                        this.chartList = newChartData.map((item) => {
                            return {
                                value: item.length,
                                name: item[0].sstype,
                            };
                        });
                        this.getRtOption(this.treepid);
                        loading.close();
                    } else {
                        this.$message.warning("未查询到数据");
                        loading.close();
                    }
                });
            } else {
                this.$message.warning("未查询到数据");
                loading.close();
            }
        },

        // 表格点击事件
        rowClick(row, column, event) {
            resultLayer.removeAll();
            var g = new Graphic({
                geometry: row.graphic.geometry,
                symbol: {
                    type: "simple-marker",
                    color: "yellow",
                    size: 8,
                    outline: {
                        width: 0.5,
                        color: "white",
                    },
                },
            });
            resultLayer.graphics.add(g);

            var extent = new Extent({
                xmin: g.geometry.x - 200,
                ymin: g.geometry.y - 200,
                xmax: g.geometry.x + 200,
                ymax: g.geometry.y + 200,
                spatialReference: {
                    wkid: this.view.spatialReference.wkid,
                },
            });
            this.view.extent = extent;
        },
    },
};
