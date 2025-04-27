/*
 * @Author: WCL
 * @Date: 2022-01-07 16:16:41
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-22 11:15:13
 * @FilePath: \webgis\src\views\evaluate\landfitness\js\landfitness.js
 * @Description: 国土空间开发适宜性评价JS
 */
import Chart from "@/components/common/chart/Chart.vue";
import LayerTree from "@/plugins/layer-tree/src/tree.vue";
import FxpjBase from "@/mixins/fxpjbase/fxpj-base.js";
import { getRtData, getRtColor, getRcData } from "../api/landfitness-api";

export default {
    name: "",
    props: {},
    components: { Chart, LayerTree },
    mixins: [FxpjBase],
    data() {
        return {
            fxpjType: 1, // 1:适宜性评价，2:开发保护风险评估，3:环境承载力，4:空间格局韧性评估，5:基础设施韧性评估
            tableData: [],
            colsData: [],
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.getMapConfig(this.$route.name);
        console.log(landTableData, "landTableData");
    },
    methods: {
        // 农业生产适宜性图表
        async getRtOption(typeid) {
            // 图表数据
            let params = {
                typeid,
            };
            const { data: res } = await getRtData(params);

            // 颜色数据
            let colorParams = {
                uid: sessionStorage.getItem("userid"),
                typeid,
            };
            const { data: colorRes } = await getRtColor(colorParams);

            if (res.code === 1 && colorRes.code === 1) {
                let rtData = res.data;
                let colorData = colorRes.data;
                console.log(rtData, "rtData");
                console.log(colorData, "colorData");

                this.rtTitle = res.title;
                if (rtData.length > 0) {
                    this.topChartVisible = true;
                    this.rtOption = {
                        tooltip: {
                            trigger: "item",
                        },
                        series: [
                            {
                                type: "pie",
                                radius: "70%",
                                data: rtData,
                                emphasis: {
                                    itemStyle: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: "rgba(0, 0, 0, 0.5)",
                                    },
                                },
                                itemStyle: {
                                    normal: {
                                        color: function (colors) {
                                            // 数据不对应则随机颜色
                                            let currColor = null;
                                            var r = Math.floor(
                                                Math.random() * 256
                                            );
                                            var g = Math.floor(
                                                Math.random() * 256
                                            );
                                            var b = Math.floor(
                                                Math.random() * 256
                                            );
                                            currColor = `${r},${g},${b}`;
                                            if (
                                                colorData != null &&
                                                colorData.length > 0
                                            ) {
                                                colorData.forEach((item) => {
                                                    if (
                                                        item.name == colors.name
                                                    ) {
                                                        currColor = item.color;
                                                    }
                                                });
                                            }
                                            return `rgba(${currColor})`;
                                        },
                                    },
                                    shadowBlur: 200,
                                    shadowColor: "rgba(0, 0, 0, 0.5)",
                                },
                            },
                        ],
                    };
                    this.showRT = true;
                } else {
                    this.topChartVisible = false;
                    // this.$message.warning('适宜性图表 没有数据');
                    this.rtOption = {};
                }
            } else {
                this.$message.error(res.msg);
                this.$message.error(colorRes.msg);
            }
        },

        // 各区农业生产承载规模图表
        async getRcOption(typeid) {
            let params = {
                typeid,
            };
            const { data: res } = await getRcData(params);
            if (res.code === 1) {
                let rcData = res.data;
                this.rcTitle = res.title;
                if (rcData.length > 0) {
                    this.middleChartVisible = true;
                    this.rcOption = {
                        tooltip: {
                            trigger: "item",
                        },
                        series: [
                            {
                                type: "pie",
                                radius: ["60%", "70%"],
                                data: rcData,
                            },
                        ],
                    };
                    this.showRC = true;
                } else {
                    this.middleChartVisible = false;
                    //this.$message.warning('规模图表 没有数据');
                    this.rcOption = {};
                }
            } else {
                this.$message.error(res.msg);
            }
        },
    },
};
