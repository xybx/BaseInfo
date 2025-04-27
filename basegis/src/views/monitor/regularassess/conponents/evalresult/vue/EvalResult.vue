<!--
 * @Author: WCL
 * @Date: 2022-01-14 14:42:51
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 16:44:29
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\evalresult\vue\EvalResult.vue
 * @Description: 实施监督-定期评估-生成评估成果
-->
<template>
	<div class="result-container">
		<!-- 生成评估成果 -->
		<div class="result-tab">
			<div class="planqc-top">
				<el-form
					ref="form"
					:model="form"
					:inline="true"
					:rules="formRules"
					hide-required-asterisk
					:show-message="false"
				>
					<el-form-item label="名称" prop="name">
						<el-input v-model="form.name"></el-input>
					</el-form-item>
					<el-form-item
						label="时间范围"
						class="time-range"
						prop="years"
					>
						<el-date-picker
							v-model="form.years"
							type="year"
							placeholder="开始年份"
							value-format="yyyy"
						>
						</el-date-picker>
						<span class="divide">-</span>
					</el-form-item>
					<el-form-item prop="yeare">
						<el-date-picker
							v-model="form.yeare"
							type="year"
							placeholder="结束年份"
							value-format="yyyy"
						>
						</el-date-picker>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="createReport"
							>生成评估成果</el-button
						>
					</el-form-item>
				</el-form>
			</div>
			<div class="planqc-bottom">
				<div>
					<span class="title">历史记录</span>
					<el-divider></el-divider>
				</div>
				<!-- 表格 -->
				<el-table
					:data="hisResultData"
					stripe
					border
					class="history-table"
				>
					<el-table-column
						prop="NAME"
						label="成果名称"
						align="center"
						width="400"
					>
					</el-table-column>
					<el-table-column
						prop="YEARS"
						label="起始年"
						align="center"
						width="200"
					>
					</el-table-column>
					<el-table-column
						prop="YEARE"
						label="结束年"
						align="center"
						width="200"
					>
					</el-table-column>
					<el-table-column
						prop="CREATETIME"
						label="生成时间"
						align="center"
					>
					</el-table-column>
					<el-table-column label="操作" align="center" width="200">
						<template v-slot="scope">
							<el-link
								type="primary"
								@click="handleDown(scope.row.FILENAME)"
								>下载评估成果</el-link
							>
						</template>
					</el-table-column>
				</el-table>
				<el-pagination
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
					:current-page="currentPage"
					:page-sizes="pagesizeArr"
					:page-size="pagesize"
					layout="total, sizes, prev, pager, next, jumper"
					:total="tableTotal"
					background
				>
				</el-pagination>
			</div>
		</div>
	</div>
</template>

<script>
export { default } from '../js/evalresult'
</script>

<style scoped lang="scss">
@import '../style/evalresult.scss';
</style>