<!--
 * @Author: WCL
 * @Date: 2021-11-19 11:36:54
 * @LastEditors: WCL
 * @LastEditTime: 2022-02-28 17:06:39
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapAttr.vue
 * @Description: 地图控制-属性
-->
<template>
	<div class="">
		<el-button
			@click="clickCtrlBtn"
			size="small"
			:class="[{ focusBtn: focusBtn == value }, value]"
		>
			<i class="el-icon-warning-outline"></i>
			<span>属性</span>
		</el-button>
	</div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { MapAttr } from '../../../../utils/mapattr'

export default {
	name: '',
	props: {},
	components: {},
	data() {
		return {
			value: 'attr',
		}
	},
	computed: {
		...mapState('map2d-store', [
			'focusBtn',
			'isFocus',
			'toolStatus',
			'mapview',
		]),
	},
	watch: {},
	created() {},
	mounted() {},
	methods: {
		...mapMutations('map2d-store', ['handleFocus', 'attrdialogstatus']),
		clickCtrlBtn() {
			this.handleFocus(this.value)
			this.toolStatus[this.value] = !this.toolStatus[this.value]

			if (this.toolStatus[this.value] && this.focusBtn == this.value) {
				this.$parent.clearControl()
				this.$parent.initToolStatus(this.value) //初始化工具条事件
				MapAttr()
			} else {
				this.handleFocus(null)
				this.$parent.clearControl()
				// this.attrdialogstatus(false)
				// if (this.mapview.viewClick != null) {
				// 	this.mapview.viewClick.remove()
				// }
			}
		},
	},
}
</script>

<style scoped lang="scss">
</style>