<!--
 * @Author: WCL
 * @Date: 2022-02-17 16:18:04
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 17:02:48
 * @FilePath: \webgis\src\components\onemap\onemap-redline\vue\OnemapRedline.vue
 * @Description: 红线下载
-->
<template>
	<div class="">
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			:before-close="closeDialog"
			custom-class="red-line"
			:modal="false"
			:close-on-click-modal="false"
			v-if="dialogVisible"
			v-dialogDrag
		>
			<div class="top">
				<div>
					<el-dropdown @command="handleDropCmd" size="small">
						<span class="el-dropdown-link">
							{{ dropItem }}
							<i class="el-icon-caret-bottom"></i>
						</span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item
								v-for="(item, index) in dropRedList"
								:key="index"
								:command="item"
								>{{ item.title }}</el-dropdown-item
							>
						</el-dropdown-menu>
					</el-dropdown>
					<span>
						共 <span class="count">{{ dropCount }}</span> 项
					</span>
				</div>
				<el-button
					type="primary"
					icon="el-icon-thumb"
					size="small"
					round
					:class="selectType ? 'plain-btn' : ''"
					@click="selectProject"
					>选择项目</el-button
				>
			</div>
			<div class="red-tips">
				请在勾选左侧图层树红线项目图层后，点击地图红线
			</div>
			<div class="tags">
				<el-tag
					v-for="(item, index) in hxLayerData"
					:key="index"
					@click="changeTag(item)"
					:class="{ focusTag: focusTag == item.value }"
				>
					{{ item.projectname }}
				</el-tag>
			</div>
			<div v-if="isTableShow" class="result">
				<div class="table">
					<el-table :data="tableData" border :show-header="false">
						<el-table-column prop="field" label="字段名称">
						</el-table-column>
						<el-table-column prop="value" label="字段值">
						</el-table-column>
					</el-table>
				</div>
			</div>
			<div class="btns" v-if="isTableShow">
				<el-button
					size="small"
					type="primary"
					@click="generateCAD"
					:disabled="generateDisabled"
					>生成CAD</el-button
				>
				<el-button
					size="small"
					type="warning"
					:disabled="isCadDisable"
					@click="downlaodcad"
					>下载CAD</el-button
				>
				<!-- <el-button size="small" type="warning" @click="downlaodshp"
					>下载shp</el-button
				> -->
			</div>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/onemap-redline'
</script>

<style scoped lang="scss">
@import '../style/onemap-redline.scss';
</style>