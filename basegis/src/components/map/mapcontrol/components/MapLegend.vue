<!--
 * @Author: WCL
 * @Date: 2021-11-19 11:38:14
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-10 15:33:35
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapLegend.vue
 * @Description: 地图控制-图例
-->
<template>
	<div
		class=""
		@click="visible = !visible">
		<el-button
			@click="clickCtrlBtn"
			size="small"
			:class="[
				{ focusBtn: focusBtn == value },
				value,
			]">
			<i class="el-icon-coin"></i>
			<span>图例</span>
		</el-button>
	</div>
</template>

<script>
	import { getAllOpenLayers } from "@/utils/common-map-method.js";
	import { getLegend } from "@/utils/common-api";
	import { mapMutations, mapState } from "vuex";
	export default {
		name: "",
		props: {},
		components: {},
		data() {
			return {
				visible: true,
				// legendDrawer: false,
				value: "legend",
				legendDate: "",
			};
		},
		computed: {
			...mapState("map2d-store", [
				"toolStatus",
				"focusBtn",
				"legendLaye",
			]),
		},
		watch: {},
		created() {},
		mounted() {},
		methods: {
			...mapMutations("map2d-store", [
				"showLegend",
				"handleFocus",
				"handLegend",
			]),
			async clickCtrlBtn() {
				const res = getAllOpenLayers();
				let arr = [];
				res.map(async (item) => {
					let serverLegend = {
						servername: item.layername,
						layers: [],
					};
					const url = item.layerurl;
					const { data } = await getLegend(url);
					item.sublayer.forEach((layerid) => {
						let _layer = data.layers.filter(
							(layer) => layer.layerId == layerid
						)[0];
						serverLegend.layers.push(_layer);
					});
					arr.push(serverLegend);
					console.log(arr, "图层图例数据");
					let layers = [];
					arr.map((item) => {
						if (item.layers.length > 0) {
							item.layers.map((val) => {
								if (val.legend.length > 0) {
									val.legend.map((keys) => {
										if (
											keys.imageData.indexOf(
												"data:image/png;base64,"
											) == -1
										) {
											keys.imageData = `data:image/png;base64, ${keys.imageData}`;
										}
									});
								}
							});
						}
						layers.push(item);
						console.log(layers);
						this.handLegend(layers);
						return item;
					});
				});
				this.handleFocus(this.value);
				this.toolStatus[this.value] =
					!this.toolStatus[this.value];
				//debugger
				if (
					this.toolStatus[this.value] &&
					this.focusBtn == this.value
				) {
					this.$parent.clearControl();
					this.$parent.initToolStatus(this.value);
					this.showLegend(true);
				} else {
					this.handleFocus(null);
					this.$parent.clearControl();
					this.showLegend(false);
				}
			},
		},
	};
</script>

<style scoped lang="scss"></style>
