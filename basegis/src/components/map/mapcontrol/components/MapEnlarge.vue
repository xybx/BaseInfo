<!--
 * @Author: WCL
 * @Date: 2021-11-17 09:24:48
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-10 15:15:20
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapEnlarge.vue
 * @Description: 地图控制-放大
-->
<template>
	<div>
		<el-button
			@click="clickCtrlBtn"
			size="small"
			:class="[{ focusBtn: focusBtn == value }, value]"
		>
			<i class="el-icon-zoom-in"></i>
			<span>放大</span>
		</el-button>
	</div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
	name: '',
	props: {},
	components: {},
	data() {
		return {
			value: 'large',
		}
	},
	computed: {
		...mapState('map2d-store', [
			'tool',
			'toolStatus',
			'graphicLengthLrc',
			'focusBtn',
			'isFocus',
		]),
	},
	watch: {},
	created() {},
	mounted() {},
	methods: {
		...mapMutations('map2d-store', ['handleFocus']),
		clickCtrlBtn() {
			let form = {
				value: this.value,
				// isFocus: !this.isFocus,
			}
			// this.handleFocus(form)
			this.handleFocus(this.value)
			this.toolStatus[this.value] = !this.toolStatus[this.value]

			if (this.toolStatus[this.value] && this.focusBtn == this.value) {
				this.$parent.clearControl()
				this.$parent.initToolStatus(this.value)
				this.tool.sketch_small.create('rectangle', { mode: 'freehand' })
				this.tool.sketch_small.on('create', (event) => {
					if (event.state === 'complete') {
						this.tool.zoom.zoomIn()
						this.tool.sketch_small.complete()
						this.graphicLengthLrc.removeAll()
					}
				})
			} else {
				// let form = {
				// 	value: '',
				// 	isFocus: false,
				// }
				//debugger
				this.handleFocus(null)
				this.$parent.clearControl()
			}
		},
	},
}
</script>

<style scoped lang="scss">
</style>