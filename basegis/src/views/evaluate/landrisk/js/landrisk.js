/*
 * @Author: WCL
 * @Date: 2022-01-11 10:59:15
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-22 11:15:08
 * @FilePath: \webgis\src\views\evaluate\landrisk\js\landrisk.js
 * @Description: 保护风险评估JS
 */
import Chart from '@/components/common/chart/Chart.vue';
import LayerTree from '@/plugins/layer-tree/src/tree.vue';
import FxpjBase from '@/mixins/fxpjbase/fxpj-base.js';
import { getChartData } from '../api/landrisk-api';

export default {
    name: '',
    props: {},
    components: { Chart, LayerTree },
    mixins: [FxpjBase],
    data() {
        return {
            fxpjType: 2, // 1:适宜性评价，2:开发保护风险评估，3:环境承载力，4:空间格局韧性评估，5:基础设施韧性评估
            rtType: 1, // 右上图表类型参数
            rcType: 2, // 右中图表类型参数
        };
    },
    computed: {},
    watch: {},
    created() { },
    mounted() {
        this.getMapConfig(this.$route.name);
    },
    methods: {
        // 各区均建设用地面积和消防站个数图表
        async getRtOption(typeid) {
            let params = {
                typeid,
                type: this.rtType,
            };
            const { data: res } = await getChartData(params);
            if (res.code === 1) {
                let rtData = res.data;
                this.rtTitle = res.title;
                if (rtData.length > 0) {
                    this.topChartVisible = true;
                    let xAxisData = rtData.map((item) => {
                        return item.name;
                    });
                    // 面积
                    let seriesData1 = rtData.map((item) => {
                        return item.value1;
                    });
                    // 个数
                    let seriesData2 = rtData.map((item) => {
                        if (item.value2==0) {
                            return [];
                        }
                        return item.value2;
                    });
                    var yAxisarr = [{
                        type: 'value',
                        name: '面积：公顷',
                    }];
                    var seriesarr = [{
                        name: '面积',
                        type: 'bar',
                        data: seriesData1,
                    }];
                    if (seriesData2.length > 0) {
                        yAxisarr.push({
                            type: 'value',
                            name: '单位：个',
                        });
                        seriesarr.push({
                            name: '个数',
                            type: 'line',
                            smooth: true,
                            yAxisIndex: 1,
                            data: seriesData2,
                        })
                    }


                    this.rtOption = {
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross',
                                crossStyle: {
                                    color: '#999',
                                },
                            },
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true,
                        },
                        legend: {},
                        xAxis: [
                            {
                                type: 'category',
                                data: xAxisData,
                                axisPointer: {
                                    type: 'shadow',
                                },
                            },
                        ],
                        yAxis: yAxisarr,
                        series: seriesarr,
                    };
                    this.showRT = true;
                }
                else {
                    this.topChartVisible = false;
                    this.rtOption = {};
                }
            }

            // const { data: res } = await this.$http.get('FXPJ/getSPGTJ', {
            //     params: { parentid, type: this.rtType },
            // });
            // let rtdata = JSON.parse(res).data;
            // this.rtTitle = JSON.parse(res).title;
            // if (rtdata.length > 0) {
            //     let xAxisData = rtdata.map((item) => {
            //         return item.name;
            //     });
            //     // 面积
            //     let seriesData1 = rtdata.map((item) => {
            //         return item.value1;
            //     });
            //     // 个数
            //     let seriesData2 = rtdata.map((item) => {
            //         return item.value2;
            //     });
            //     this.rtOption = {
            //         tooltip: {
            //             trigger: 'axis',
            //             axisPointer: {
            //                 type: 'cross',
            //                 crossStyle: {
            //                     color: '#999',
            //                 },
            //             },
            //         },
            //         legend: {},
            //         xAxis: [
            //             {
            //                 type: 'category',
            //                 data: xAxisData,
            //                 axisPointer: {
            //                     type: 'shadow',
            //                 },
            //             },
            //         ],
            //         yAxis: [
            //             {
            //                 type: 'value',
            //                 name: '面积：m²',
            //             },
            //             {
            //                 type: 'value',
            //                 name: '单位：个',
            //             },
            //         ],
            //         series: [
            //             {
            //                 name: '面积',
            //                 type: 'bar',
            //                 data: seriesData1,
            //             },
            //             {
            //                 name: '个数',
            //                 type: 'line',
            //                 smooth: true,
            //                 yAxisIndex: 1,
            //                 data: seriesData2,
            //             },
            //         ],
            //     };
            //     this.showRT = true;
            // } else {
            //     this.$message.warning('建设用地面积和消防站个数图表 没有数据');
            //     this.rtOption = {};
            // }
        },

        // 各区消防站覆盖率图表
        async getRcOption(typeid) {
            let params = {
                typeid,
                type: this.rcType,
            };
            const { data: res } = await getChartData(params);

            let rcData = res.data;
            this.rcTitle = res.title;
            if (rcData.length > 0) {
                this.middleChartVisible = true;
                // 区域名称
                let seriesData1 = rcData.map((item) => {
                    return { name: item.name, max: res.maxvalue };
                });
                // 覆盖率
                let seriesData2 = rcData.map((item) => {
                    return item.ratevalue+'%';
                });

                this.rcOption = {
                    tooltip: {
                        show: true,
                    },
                    radar: {
                        indicator: seriesData1,
                        radius: 80,
                    },
                    series: [
                        {
                            type: 'radar',
                            areaStyle: {},
                            data: [
                                {
                                    name: '覆盖率',
                                    value: seriesData2,
                                },
                            ],
                        },
                    ],
                };
                this.showRC = true;
            } else {
                this.middleChartVisible = false;
                //this.$message.warning('覆盖率图表 没有数据');
                this.rcOption = {};
            }
        },

    },
};
