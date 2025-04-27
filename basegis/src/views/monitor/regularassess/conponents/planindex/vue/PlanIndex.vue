<!--
 * @Author: WCL
 * @Date: 2022-01-14 14:41:24
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 14:17:09
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\planindex\vue\PlanIndex.vue
 * @Description: 实施监督-定期评估-2035规划指标
-->
<template>
	<div class="plan-2035">
		<div>
			选择类型
			<el-radio-group
				v-model="GHRadio"
				@change="changeGHRadio"
				fill="#2565bc"
			>
				<el-radio-button
					v-for="item in GHRadioData"
					:key="item.PID"
					:label="item"
					>{{ item.NAME }}</el-radio-button
				>
			</el-radio-group>
			<div style="position: absolute;display:inline;">
							<el-upload style="display:inline;padding: 5px;" class="tem-upload" ref="tempUpload"
								action="action" :http-request="tempUpload" :show-file-list="false" accept=".xlsx">
								<el-button type="success" size="small" icon="el-icon-upload2">
									导入数据
								</el-button>
							</el-upload>
							<el-button type="success" size="small" icon="el-icon-download" @click="downTemplate">
								导出数据
							</el-button>
						</div>
		</div>
		<div class="radio-content">
			<el-form
				:inline="true"
				:model="userForm"
				class="demo-form-inline"
				v-loading="formLoading"
				element-loading-text="加载指标项中"
			>
				<el-col
					class="form-bottom"
					v-for="(item, index) in evalBox"
					:key="index"
				>
					<div class="eval-label" v-if="item.TYPE.NAME">
						{{ item.TYPE.NAME }}
					</div>
					<el-form-item
						v-for="subItem in item.ZBITEMS"
						:key="subItem.PID"
						:label="subItem.NAME"
						prop="model"
					>
						<el-input
							v-model="subItem.ZBVALUE"
							placeholder="请输入"
						></el-input>
						<span>
							{{ subItem.UNIT }}
						</span>
					</el-form-item>
				</el-col>
				<el-col class="btn-box">
					<el-button type="primary" size="medium" @click="saveData"
						>保存数据</el-button
					>
				</el-col>
			</el-form>
			<div class="tips">
				<p>温馨提示</p>
				<p>1. 2035规划指标数据为本单位对于2035的规划数据；</p>
				<p>
					2. 数据填写完成后，请在填写完成后仔细核对，确保数据准确无错误，点击保存
				</p>
				<p>
					3.
					2035规划指标数据如有对某项内容不清楚如何填写，可查看详细了解数据类型和填报内容，或查看往年数据；
				</p>
				<p>
					4.
					数据的准确性、规范性是进行后期统计分析的重要来源，请认真仔细核对！
				</p>
			</div>
		</div>
	</div>
</template>

<script>
export { default } from '../js/planindex'
</script>

<style scoped lang="scss">
@import '../style/planindex.scss';
</style>