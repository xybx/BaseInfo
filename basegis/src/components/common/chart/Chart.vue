<!--
 * @Author: WCL
 * @Date: 2022-01-10 13:43:32
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-16 14:34:56
 * @FilePath: \webgis\src\components\common\chart\Chart.vue
 * @Description: 公共组件-图表
-->
<template>
	<div class="chart-container">
		<div class="chart-box" :id="chartId"></div>
	</div>
</template>

<script>
let myChart = null
export default {
	name: '',
	props: {
		chartId: String,
		chartOption: {
			type: Object,
		},
	},
	components: {},
	data() {
		return {
			myChart: null,
		}
	},
	computed: {},
	watch: {
		// 监听数据变化
		chartOption: {
			handler() {
				this.getChat(this.chartId)
			},
			deep: true,
		},
	},
	methods: {
		// 渲染图表
		getChat(chartId) {
			if (
				this.myChart != null &&
				this.myChart != '' &&
				this.myChart != undefined
			) {
				this.myChart.dispose()
			}
			this.myChart = this.initChart(chartId)
			let option = this.chartOption
			this.myChart.clear()
			this.myChart.setOption(option)
			window.addEventListener('resize', this.resizeMyChart)

			this.myChart.on('click', (params) => {
				this.$emit('handleParams', params)
			})
		},
		// resize 监听
		resizeMyChart() {
			this.initChart(this.chartId).resize()
		},
		// 获取渲染DOM
		initChart(chartId) {
			return this.$echart.init(document.getElementById(this.chartId))
		},
	},
	created() { },
	mounted() {
		this.myChart = myChart
		this.getChat(this.chartId)
	},
	beforeDestroy() {
		if (this.myChart) {
			this.myChart.dispose();
		}
		window.removeEventListener('resize', this.resizeMyChart)
	},
}
</script>

<style scoped lang="scss">
.chart-container {
	height: 100%;

	.chart-box {
		height: 100%;
	}
}
</style>