/*
 * @Author: WCL
 * @Date: 2022-01-14 14:24:30
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-14 14:46:34
 * @FilePath: \webgis\src\views\monitor\regularassess\js\regularassess.js
 * @Description: 定期评估JS
 */
import EvalIndex from '../conponents/evalindex/vue/EvalIndex.vue';
import EvalResult from '../conponents/evalresult/vue/EvalResult.vue';
import PlanIndex from '../conponents/planindex/vue/PlanIndex.vue';
import YearChange from '../conponents/yearchange/vue/YearChange.vue';
export default {
    name: '',
    props: {},
    components: { EvalIndex, EvalResult, PlanIndex, YearChange },
    data() {
        return {
            activeName: '1',
            showTab: '1',
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {
        // 标签页切换
        handleTabClick(tab) {
            this.showTab = tab.name;
        },
    },
};
