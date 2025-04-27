<!--
 * @Author: WCL
 * @Date: 2022-02-18 10:29:33
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-28 16:56:45
 * @FilePath: \webgis\src\components\onemap\onemap-project\vue\OnemapProject.vue
 * @Description: 项目核查
-->
<template>
	<div class="">
		<el-dialog :title="comTitle" :visible.sync="dialogVisible" :before-close="closeDialog" :modal="false"
			:close-on-click-modal="false" custom-class="project" v-if="dialogVisible" v-dialogDrag>
			<!-- 选择图层 -->
			<div>
				<div class="sub-title">
					<i class="el-icon-caret-right"></i>
					<span>选择分析图层</span>
				</div>
				<div class="sub-content">
					<el-select v-model="selectLayer" placeholder="请选择分析图层" size="small" style="width:100%;">
						<el-option v-for="item in layerOptions" :key="item.index" :label="item.layername"
							:value="item.index">
						</el-option>
					</el-select>
				</div>
				<div class="sub-title">
					<i class="el-icon-caret-right"></i>
					<span>选择叠加图层</span>
				</div>
				<div class="sub-content">
					<el-select v-model="overlayLayer" placeholder="请选择叠加图层" size="small" style="width:100%;">
						<el-option v-for="item in layerOptions" :key="item.index" :label="item.layername"
							:value="item.index">
						</el-option>
					</el-select>
				</div>
				<br />
				<div class="exam-box">
					<el-button type="primary" size="small" class="begin-exam" @click="handleBeginExam" :loading="btnloading">开始分析</el-button>
				</div>
			</div>

			<el-table :data="scResultTable" @row-click="scRowClick" height="100" border stripe size="small"
				v-if="scResultTable.length > 0" v-loading="loading" element-loading-text="拼命加载中" id="scResultTable">
				<el-table-column prop="name" label="名称" align="center">
				</el-table-column>
				<el-table-column prop="area" label="面积(公顷)" align="center">
				</el-table-column>
			</el-table>
		</el-dialog>


	</div>
</template>

<script>
export { default } from '../js/onemap-overlay'
</script>

<style scoped lang="scss">
@import '../style/onemap-overlay.scss';
</style>