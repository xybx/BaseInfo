<!--
 * @Author: WCL
 * @Date: 2021-11-19 11:37:20
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-10 15:33:42
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapPoint.vue
 * @Description: 地图控制-点查
-->
<template>
	<div class="">
		<el-button
			@click="clickCtrlBtn"
			size="small"
			:class="[{ focusBtn: focusBtn == value }, value]"
		>
			<i class="el-icon-thumb"></i>
			<span>点查</span>
		</el-button>
	</div>
</template>

<script>
import Graphic from '@arcgis/core/Graphic'
import Font from '@arcgis/core/symbols/Font'
import TextSymbol from '@arcgis/core/symbols/TextSymbol'
import { mapState, mapMutations } from 'vuex'
export default {
	name: '',
	props: {},
	components: {},
	data() {
		return {
			value: 'pointselect',
			viewClick: null, // 地图点击事件
			pointSymbol2: {
				type: 'picture-marker',
				url: require('@/assets/images/map-images/point.gif'),
				width: '48px',
				height: '48px',
			},
		}
	},
	computed: {
		...mapState('map2d-store', ['toolStatus', 'mapview', 'focusBtn']),
	},
	watch: {},
	created() {},
	mounted() {},
	methods: {
		...mapMutations('map2d-store', ['handleFocus']),

		clickCtrlBtn() {
			this.handleFocus(this.value)
			this.toolStatus[this.value] = !this.toolStatus[this.value]
			if (this.toolStatus[this.value] && this.focusBtn == this.value) {
				this.$parent.clearControl()

				this.$parent.initToolStatus(this.value)
				this.viewClick = this.mapview.on('click', (evt) => {
					//debugger
					if (this.toolStatus.pointselect) {
						let point = evt.mapPoint
						let defaultFont = new Font({
							size: '18px',
						})
						let ptextSymbol = new TextSymbol({
							text: `X:${point.x.toFixed(
								3
							)} \nY:${point.y.toFixed(3)}`,
							font: defaultFont,
							color: [255, 0, 0],
							xoffset: 55,
							yoffset: 0,
						})
						let symbol = {
							type: 'picture-marker',
							url: require('@/assets/images/map-images/point.gif'),
							width: '48px',
							height: '48px',
						}
						let g = new Graphic({
							geometry: point,
							symbol,
						})
						this.mapview.graphics.add(g)
						let graphicText = new Graphic({
							geometry: point,
							symbol: ptextSymbol,
						})
						this.mapview.graphics.add(graphicText)
					} else {
						if (this.viewClick != null) {
							this.viewClick.remove()
						}
					}
				})
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