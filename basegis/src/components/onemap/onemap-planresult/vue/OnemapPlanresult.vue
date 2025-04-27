<!--
 * @Author: WCL
 * @Date: 2021-12-13 14:55:31
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:17:08
 * @FilePath: \webgis\src\components\onemap\onemap-planresult\vue\OnemapPlanresult.vue
 * @Description: 规划编制成果追溯 暂时搁置12.22
-->
<template>
	<div class="">
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			custom-class="liuhen"
			:modal="false"
			:close-on-click-modal="false"
			:before-close="closeDialog"
			v-if="dialogVisible"
			v-dialogDrag
		>
			<el-form
				:inline="true"
				:model="lhForm"
				class="liuhen-form"
				:rules="lhFormRules"
				ref="form"
			>
				<div class="item-row">
					<el-form-item label="项目名称">
						<el-input
							v-model.trim="lhForm.name"
							placeholder="项目名称关键字"
						></el-input>
					</el-form-item>
					<el-form-item label="规划类别">
						<el-select
							v-model="lhForm.ghtype"
							placeholder="请选择"
							clearable
						>
							<el-option
								label="总体规划"
								value="总体规划"
							></el-option>
							<el-option
								label="专项规划"
								value="专项规划"
							></el-option>
							<el-option
								label="详细规划"
								value="详细规划"
							></el-option>
							<el-option
								label="其他类型"
								value="其他类型"
							></el-option>
							<el-option
								label="已编规划修改"
								value="已编规划修改"
							></el-option>
							<el-option
								label="规划动态维护"
								value="规划动态维护"
							></el-option>
							<el-option
								label="独立选址论证"
								value="独立选址论证"
							></el-option>
						</el-select>
					</el-form-item>
				</div>
				<div class="item-row">
					<el-form-item label="编制单位">
						<el-input
							v-model.trim="lhForm.unit"
							placeholder="编制单位关键字"
						></el-input>
					</el-form-item>
					<el-form-item label="是否批复" prop="reply">
						<el-select
							v-model.trim="lhForm.reply"
							placeholder="请选择"
							clearable
						>
							<el-option
								v-for="(item, index) in replyList"
								:key="index"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
				</div>

				<el-form-item label="编制时间" class="date">
					<el-date-picker
						v-model.trim="lhForm.date"
						type="daterange"
						range-separator="至"
						start-placeholder="开始时间"
						end-placeholder="结束时间"
						value-format="yyyy-MM-dd"
					>
					</el-date-picker>
				</el-form-item>
				<div class="item-row">
					<el-form-item label="项目类型">
						<el-input
							v-model.trim="lhForm.xmtype"
							placeholder="规划编制成果"
							:disabled="true"
						>
						</el-input>
					</el-form-item>
					<el-form-item label="项目状态">
						<el-select
							v-model="lhForm.status"
							placeholder="请选择"
							clearable
						>
							<el-option label="在办" value="在办"></el-option>
							<el-option label="办结" value="办结"></el-option>
						</el-select>
					</el-form-item>
				</div>
				<el-form-item class="btns">
					<el-button type="primary" @click="onDraw"
						>绘制范围</el-button
					>
					<el-button type="primary" @click="onSearch">查询</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/onemap-planresult'
</script>

<style scoped lang="scss">
@import '../style/onemap-planresult.scss';
</style>