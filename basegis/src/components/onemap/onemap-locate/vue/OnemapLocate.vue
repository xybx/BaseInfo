<!--
 * @Author: WCL
 * @Date: 2021-11-26 13:18:34
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-22 09:25:06
 * @FilePath: \webgis\src\components\onemap\onemap-locate\vue\OnemapLocate.vue
 * @Description: 一张图-查询定位
-->
<template>
	<div class="">
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			:modal="false"
			:close-on-click-modal="false"
			custom-class="chaxun"
			:before-close="closeDialog"
			v-if="dialogVisible"
			v-dialogDrag
		>
			<el-form
				:inline="true"
				:model="coordForm"
				class="demo-form-inline"
				size="small"
			>
				<div class="coord-box">
					<el-form-item
						label="坐标定位"
						class="label-item"
					></el-form-item>
					<div class="coord-input">
						<el-form-item label="X">
							<el-input
								placeholder="纬度或X投影坐标"
								v-model.trim="coordForm.coordX"
								clearable
							>
							</el-input>
						</el-form-item>
						<el-form-item label="Y">
							<el-input
								placeholder="经度或Y投影坐标"
								v-model.trim="coordForm.coordY"
								clearable
							>
							</el-input>
						</el-form-item>
					</div>
					<el-form-item class="coord-btn">
						<el-button
							type="primary"
							icon="el-icon-search"
							@click="pointLocation"
						></el-button>
					</el-form-item>
				</div>
				<div class="query-box">
					<el-form-item label="查询定位" class="query-input">
						<el-input
							placeholder="请输入地名、道路名、图幅号等"
							v-model.trim="queryValue"
							clearable
						>
						</el-input>
					</el-form-item>
					<el-form-item class="query-btn">
						<el-button
							type="primary"
							icon="el-icon-search"
							@click="query"
						></el-button>
					</el-form-item>
				</div>
				<div
					class="select-box"
					v-loading="selLoading"
					element-loading-text="结果加载中"
					element-loading-spinner="el-icon-loading"
				>
					<el-select
						v-model="selectType"
						placeholder="请选择查询类型"
						size="small"
						@change="selectOps"
					>
						<el-option
							v-for="item in typeOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						>
						</el-option>
					</el-select>
					<div class="result-box">
						<el-button
							plain
							v-for="item in liData"
							:key="item.id"
							size="small"
							@click="clickBtn(item)"
						>
							{{ item.label }}
						</el-button>
					</div>
				</div>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/onemap-locate'
</script>

<style scoped lang="scss">
@import '../style/onemap-locate.scss';
</style>