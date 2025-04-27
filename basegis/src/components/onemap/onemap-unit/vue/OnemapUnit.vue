<!--
 * @Author: WCL
 * @Date: 2021-12-13 13:35:40
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:22:10
 * @FilePath: \webgis\src\components\onemap\onemap-unit\vue\OnemapUnit.vue
 * @Description: 单元监测
-->
<template>
	<div class="">
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			:before-close="closeDialog"
			custom-class="unit"
			:close-on-click-modal="false"
			v-if="dialogVisible"
		>
			<div class="unit-main">
				<div class="legend">
					<el-form
						ref="form"
						:model="unitForm"
						label-width="auto"
						class="unit-form"
						:rules="rules"
						hide-required-asterisk
					>
						<el-form-item label="标题" prop="title">
							<el-input
								v-model="unitForm.title"
								placeholder="请输入标题"
							></el-input>
						</el-form-item>
						<el-form-item label="比例尺" prop="scale2">
							<el-col :span="5">
								<el-input
									v-model="unitForm.scale1"
									readonly
								></el-input>
							</el-col>
							<el-col class="line" :span="2">:</el-col>
							<el-col :span="17">
								<el-input
									@input="changeScale2"
									v-model.number="unitForm.scale2"
									placeholder="请输入比例"
								></el-input>
							</el-col>
						</el-form-item>
						<el-form-item label="制图时间" prop="date">
							<el-date-picker
								type="date"
								placeholder="请选择日期"
								v-model="unitForm.date"
								style="width: 100%"
								value-format="yyyy-MM-dd"
							></el-date-picker>
						</el-form-item>

						<div class="btns">
							<el-button size="small" type="primary" @click="DYJC"
								>单元监测</el-button
							>
							<el-button
								type="primary"
								size="small"
								class="creat-pic"
								@click="onSubmit"
								:disabled="isExport"
								>导出监测报告</el-button
							>
						</div>
					</el-form>
				</div>
				<div class="map" id="dyjc_map">
					<div class="border_corner border_corner_left_top"></div>
					<div class="border_corner border_corner_right_top"></div>
					<div class="border_corner border_corner_left_bottom"></div>
					<div class="border_corner border_corner_right_bottom"></div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/onemap-unit'
</script>

<style scoped lang="scss">
@import '../style/onemap-unit.scss';
</style>