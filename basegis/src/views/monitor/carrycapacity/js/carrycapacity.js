/*
 * @Author: WCL
 * @Date: 2022-01-17 17:08:40
 * @LastEditors: WCL
 * @LastEditTime: 2022-05-07 10:59:39
 * @FilePath: \webgis\src\views\monitor\carrycapacity\js\carrycapacity.js
 * @Description: 请填写描述
 */
import Chart from '@/components/common/chart/Chart.vue';
import LayerTree from '@/plugins/layer-tree/src/tree.vue';
import FxpjBase from '@/mixins/fxpjbase/fxpj-base.js';
import { getRtData, getRtColor, getRcData } from '../api/carrycapacity-api';
export default {
    name: '',
    props: {},
    components: { Chart, LayerTree },
    mixins: [FxpjBase],
    data() {
        return {
            fxpjType: 3, // 1:适宜性评价，2:开发保护风险评估，3:环境承载力，4:空间格局韧性评估，5:基础设施韧性评估
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.getMapConfig(this.$route.name);
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
                uid: sessionStorage.getItem('userid'),
                typeid,
            };
            const { data: colorRes } = await getRtColor(colorParams);

            if (res.code === 1 && colorRes.code === 1) {
                let rtData = res.data;
                let colorData = colorRes.data;

                this.rtTitle = res.title;
                if (rtData.length > 0) {
                    this.rtOption = {
                        tooltip: {
                            trigger: 'item',
                        },
                        series: [
                            {
                                type: 'pie',
                                radius: '70%',
                                data: rtData,
                                emphasis: {
                                    itemStyle: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                                    },
                                },
                                itemStyle: {
                                    normal: {
                                        color: function (colors) {
                                            return `rgba(${
                                                colorData[colors.dataIndex]
                                                    .color
                                            })`;
                                        },
                                    },
                                    shadowBlur: 200,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                                },
                            },
                        ],
                    };
                    this.showRT = true;
                } else {
                    this.$message.warning('适宜性图表 没有数据');
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
                    this.rcOption = {
                        tooltip: {
                            trigger: 'item',
                        },
                        series: [
                            {
                                type: 'pie',
                                radius: ['60%', '70%'],
                                data: rcData,
                            },
                        ],
                    };
                    this.showRC = true;
                } else {
                    this.$message.warning('规模图表 没有数据');
                    this.rcOption = {};
                }
            } else {
                this.$message.error(res.msg);
            }
        },
    },
};
