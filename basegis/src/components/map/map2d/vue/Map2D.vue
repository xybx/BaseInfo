<!--
 * @Author: WCL
 * @Date: 2021-11-16 16:42:15
 * @LastEditors: LJX
 * @LastEditTime: 2022-02-23 10:32:44
 * @FilePath: \webgis\src\components\map\map2d\vue\Map2D.vue
 * @Description: 一张图地图
-->
<template>
	<div class="map-container">
		<div
			class="map"
			id="map"></div>
		<!-- 分屏 -->
		<div
			class="splitmap-box"
			v-if="showSplit">
			<div
				class="split-left"
				id="leftMap">
				<!-- 请将左侧列表数据拖入左分屏 -->
				<div
					class="map"
					id="leftMap_map"></div>
			</div>
			<div
				class="split-right"
				id="rightMap">
				<!-- 请将左侧列表数据拖入右分屏 -->
				<div
					class="map"
					id="rightMap_map"></div>
			</div>
			<!-- 关闭分屏 -->
			<el-button
				type="primary"
				icon="el-icon-switch-button"
				circle
				class="close-split"
				@click="closeSplit"></el-button>
		</div>
		<!-- 图例 -->
		<!-- <div class=0{
				'': handleVal == 0,
				collapse_true: handleVal == 1,
			}"-->
		<el-collapse
			class="collapse_true"
			@change="handleChange"
			v-model="activeName"
			v-if="legendDrawer">
			<img
				class="lgd_png"
				src="@/assets/images/home2-images/legend.png" />
			<el-collapse-item
				:name="1"
				:visible.sync="legendDrawer"
				class="drawerBox"
				title="图例"
				direction="btt"
				:before-close="legendClose"
				:modal="false"
				custom-class="drawer"
				:wrapperClosable="false">
				<span
					class="drawerBox_title"
					v-for="(item, index) in legendLaye">
					<p class="drawerBox_one">
						{{ item.servername }}
					</p>
					<p
						class="drawerBox_two"
						v-for="(val, inx) in item.layers">
						<a class="drawerBox_ly">{{
							val.layerName
						}}</a>
						<span class="drawerBox_tre">
							<img
								:src="val.legend[0].imageData" />
							<a>{{
								val.legend[0].label
									? val.legend[0].label
									: "无"
							}}</a>
						</span>
					</p>
				</span>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script>
	export { default } from "../js/map2d";
</script>

<style scoped lang="scss">
	@import "../style/map2d.scss";
</style>
