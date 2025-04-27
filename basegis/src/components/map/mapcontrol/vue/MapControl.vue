<!--
 * @Author: WCL
 * @Date: 2021-11-16 16:53:33
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 11:52:15
 * @FilePath: \webgis\src\components\map\mapcontrol\vue\MapControl.vue
 * @Description: 地图控制条组装
-->
<template>
	<div class="map-control">
		<div class="switch-box">
			<el-button
				:icon="switchIcon"
				@click="switchBtn"
				circle></el-button>
		</div>
		<el-collapse-transition>
			<div
				class="control-list"
				v-show="showList">
				<!-- 放大 -->
				<map-enlarge></map-enlarge>
				<!-- 缩小 -->
				<map-small></map-small>
				<!-- 全图 -->
				<map-all></map-all>
				<!-- 测距 -->
				<map-length></map-length>
				<!-- 面积 -->
				<map-area></map-area>
				<!-- 清除 -->
				<map-clear></map-clear>
				<!-- 属性 -->
				<map-attr
					@showAttrPopup="
						showAttrPopup
					"></map-attr>
				<!-- 点查 -->
				<map-point></map-point>
				<!-- 分屏 -->
				<map-split></map-split>
				<!-- 图例 -->
				<map-legend></map-legend>
				<!-- 底图 -->
				<map-base
					v-show="openBaseMapStatus"></map-base>
			</div>
		</el-collapse-transition>
		<attr-popup
			:isShow="showAttr"
			@showAttrPopup="showAttrPopup"></attr-popup>
	</div>
</template>

<script>
	export { default } from "../js/mapcontrol";
</script>

<style scoped lang="scss">
	@import "../style/mapcontrol.scss";
</style>
