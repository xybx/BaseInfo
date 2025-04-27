<!--
 * @Author: WCL
 * @Date: 2021-12-13 14:35:44
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:11:00
 * @FilePath: \webgis\src\components\onemap\onemap-dev\vue\OnemapDev.vue
 * @Description: 开发评估
-->
<template>
	<div class="">
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			:before-close="closeDialog"
			custom-class="dev"
			:close-on-click-modal="false"
			v-if="dialogVisible"
		>
			<div class="dev-main">
				<div class="legend">
					<el-form
						ref="form"
						:model="devForm"
						class="dev-form"
						:rules="rules"
						hide-required-asterisk
						label-width="auto"
					>
						<el-form-item label="开发评估" prop="dev">
							<el-select
								v-model="devForm.dev"
								placeholder="请选择"
								@change="devChange"
							>
								<el-option
									label="居住评估"
									value="1"
								></el-option>
								<el-option
									label="商服评估"
									value="2"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="评估类型" prop="type">
							<el-select
								v-model="devForm.type"
								placeholder="请选择评估类型"
								disabled
							>
								<el-option label="居住" value="1"></el-option>
								<el-option label="商服" value="2"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="建设单位" prop="unit">
							<el-input
								v-model="devForm.unit"
								placeholder="请输入建设单位"
							></el-input>
						</el-form-item>
						<el-form-item label="项目名称" prop="name">
							<el-input
								v-model="devForm.name"
								placeholder="请输入项目名称"
							></el-input>
						</el-form-item>
						<el-form-item label="项目地块" prop="parcel">
							<el-input
								v-model="devForm.parcel"
								placeholder="请输入项目地块"
							></el-input>
						</el-form-item>
						<el-form-item label="用地性质" prop="nature">
							<el-input
								v-model="devForm.nature"
								placeholder="请输入用地性质"
							></el-input>
						</el-form-item>
						<el-form-item
							label="申报容积率上限"
							prop="upper"
							class="more-txt"
						>
							<el-input
								v-model="devForm.upper"
								placeholder="请输入申报容积率上限"
							></el-input>
						</el-form-item>
						<el-form-item
							label="申报容积率下限"
							prop="lower"
							class="more-txt"
						>
							<el-input
								v-model="devForm.lower"
								placeholder="请输入申报容积率下限"
							></el-input>
						</el-form-item>
						<el-form-item label="比例尺" prop="scale2">
							<el-col :span="5">
								<el-input
									v-model="devForm.scale1"
									readonly
								></el-input>
							</el-col>
							<el-col class="line" :span="2">:</el-col>
							<el-col :span="17">
								<el-input
									@input="devChange"
									v-model="devForm.scale2"
									placeholder="请输入比例"
								></el-input>
							</el-col>
						</el-form-item>
						<el-form-item label="制图时间" prop="date">
							<el-date-picker
								type="date"
								placeholder="请选择日期"
								v-model="devForm.date"
								style="width: 100%"
								value-format="yyyy-MM-dd"
							></el-date-picker>
						</el-form-item>

						<div class="btns">
							<el-upload
								class="upload"
								ref="upload"
								action="action"
								:on-success="handleSuccess"
								:http-request="handleUpload"
								accept=".dwg"
							>
								<el-button
									size="small"
									type="primary"
									slot="trigger"
									>上传红线</el-button
								>
								<el-button
									type="primary"
									size="small"
									class="creat-pic"
									@click="onSubmit"
									>生成报告</el-button
								>
							</el-upload>
						</div>
					</el-form>
				</div>
				<div class="map" id="kfpg_map">
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
export { default } from '../js/onemap-dev'
</script>

<style scoped lang="scss">
@import '../style/onemap-dev.scss';
</style>