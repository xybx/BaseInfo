<!--
 * @Author: WCL
 * @Date: 2021-11-19 11:36:23
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-11 14:12:59
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapClear.vue
 * @Description: 地图控制-清除
-->
<template>
	<div class="">
		<el-button
			@click="clickCtrlBtn"
			size="small"
			:class="[{ focusBtn: focusBtn == value }, value]"
		>
			<i class="el-icon-delete"></i>
			<span>清除</span>
		</el-button>
	</div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import {
  clearMapGraphics,
} from "@/utils/common-map-method";
export default {
	name: '',
	props: {},
	components: {},
	data() {
		return {
			value: 'clear',
		}
	},
	computed: {
		...mapState('map2d-store', [
			'tool',
			'toolStatus',
			'mapview',
			'graphicLengthLrc',
			'focusBtn',
		]),
	},
	watch: {},
	created() {},
	mounted() {},
	methods: {
		...mapMutations('map2d-store', ['graphicLength', 'handleFocus']),
		// 取消
		clickCtrlBtn() {
			this.handleFocus(this.value)
			this.toolStatus[this.value] = !this.toolStatus[this.value]

			if (this.toolStatus[this.value] && this.focusBtn == this.value) {
				// this.$parent.clearControl()
				for (const key in this.toolStatus) {
					this.toolStatus[key] = false
				}
				this.tool.sketch.cancel()
				this.tool.sketch_small.cancel()
				this.mapview.graphics.removeAll()

				//清空绘制图层
				this.graphicLengthLrc.removeAll();
				clearMapGraphics(null);
				this.$parent.initToolStatus(this.value)
			} else {
				this.handleFocus(null)
				this.$parent.clearControl()
			}
		},
	},
}
</script>

<style scoped lang="scss">
</style>