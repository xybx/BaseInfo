/*
 * @Author: WCL
 * @Date: 2022-01-11 13:21:53
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-12 14:49:54
 * @FilePath: \webgis\src\views\evaluate\infrastructure\js\infrastructure.js
 * @Description: 请填写描述
 */
import Chart from '@/components/common/chart/Chart.vue';
import LayerTree from '@/plugins/layer-tree/src/tree.vue';
import FxpjBase from '@/mixins/fxpjbase/fxpj-base.js';
import { getRtData } from '../api/infrastructure-api';

export default {
    name: '',
    props: {},
    components: { Chart, LayerTree },
    mixins: [FxpjBase],
    data() {
        return {
            fxpjType: 5,
            rbTableData: [
                {
                    type: '快速路',
                    length: '58.07',
                    area: '102.96',
                    density: '0.56',
                },
                {
                    type: '主干路',
                    length: '121.95',
                    area: '102.96',
                    density: '1.18',
                },
                {
                    type: '次干道',
                    length: '177.01',
                    area: '102.96',
                    density: '1.72',
                },
                {
                    type: '支路',
                    length: '209.81',
                    area: '102.96',
                    density: '2.03',
                },
                {
                    type: '总长度',
                    length: '566.85',
                    area: '102.96',
                    density: '5.50',
                },
            ],
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.getMapConfig(this.$route.name);
    },
    methods: {
        // 表头换行
        renderheader(h, { column, $index }) {
            return h('span', {}, [
                h('span', {}, column.label.split(':')[0]),
                h('br'),
                h('span', {}, column.label.split(':')[1]),
            ]);
        },

        // 右上侧图表
        async getRtOption(typeid) {
            let params = {
                typeid,
            };
            const { data: res } = await getRtData(params);
            this.rtTitle = res.title;
            if (res.code === 1) {
                this.rtTitle = res.title;
                // ! 假数据
                // if (res.data.length > 0) {
                this.rtOption = {
                    tooltip: {
                        trigger: 'axis',
                    },
                    legend: {},
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true,
                    },
                    xAxis: {
                        type: 'category',
                        data: ['快速路', '主干路', '次干道', '支路', '总长度'],
                    },
                    yAxis: {
                        type: 'value',
                    },
                    series: [
                        {
                            name: '路网密度',
                            type: 'line',
                            data: [0.56, 1.18, 1.72, 2.03, 5.5],
                            smooth: true,
                        },
                        {
                            name: '国家标准下',
                            type: 'line',
                            data: [0.3, 1.0, 1.2, 3, 5.4],
                            smooth: true,
                        },
                        {
                            name: '国家标准上',
                            type: 'line',
                            data: [0.4, 1.2, 1.4, 4, 7.1],
                            smooth: true,
                        },
                    ],
                };
                this.showRT = true;
                // } else {
                //     this.$message.warning('图表没有数据');
                //     this.rtOption = {};
                // }
            } else {
                this.$message.error(res.msg);
            }
        },

        // 右中图表
        async getRcOption(parentid) {
            // * 此模块无右中图表，纯属占位
            console.log('右中图表占位');
        },
    },
};
