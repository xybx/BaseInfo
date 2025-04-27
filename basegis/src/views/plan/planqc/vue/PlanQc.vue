<!--
 * @Author: WCL
 * @Date: 2021-12-29 14:45:28
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-10 13:31:16
 * @FilePath: \webgis\src\views\plan\planqc\vue\PlanQc.vue
 * @Description: 规划成果质检
-->
<template>
	<div class="planqc-container">
		<div class="planqc-top animate__animated animate__fadeIn">
			<div>
				<span class="title">搜索添加</span>
				<el-divider></el-divider>
			</div>
			<div class="data-class">
				<el-form
					ref="searchform"
					:model="searchform"
					:inline="true"
					style="float: left"
				>
					<el-form-item label="规划类型">
						<el-select
							v-model="searchform.ghtype"
							placeholder="请选择规划类型"
							size="small"
							value-key="id"
							clearable
							@change="changeType"
						>
							<el-option
								v-for="item in regionData"
								:label="item.TYPENAME"
								:value="item.ID"
								:key="item.ID"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="规划项目">
						<el-select
							v-model="searchform.prjid"
							placeholder="请选择项目名称"
							size="small"
							value-key="PID"
							clearable
							@change="changePRJ"
						>
							<el-option
								v-for="item in nameData"
								:label="item.PRJNAME"
								:value="item.PID"
								:key="item.PID"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="阶段名称">
						<el-input
							v-model="searchform.keywords"
							size="small"
							placeholder="请输入阶段名称"
							clearable
						></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onSearch" size="small"
							>开始搜索</el-button
						>
					</el-form-item>
				</el-form>
				<!-- 表格 -->
				<el-table
					:data="tableData"
					stripe
					border
					:default-sort="{ prop: 'PID' }"
					v-loading="loading"
					size="small"
				>
					<el-table-column
						prop="PID"
						label="序号"
						width="150"
						align="center"
					></el-table-column>
					<el-table-column
						prop="PRJNAME"
						label="项目名称"
						align="center"
					>
					</el-table-column>
					<el-table-column
						prop="JDNAME"
						label="阶段名称"
						align="center"
					>
					</el-table-column>
					<el-table-column
						prop="GHAREA"
						label="规划面积"
						align="center"
					>
					</el-table-column>
					<el-table-column
						prop="BZUNIT"
						label="编制单位"
						align="center"
					>
					</el-table-column>
					<el-table-column
						prop="WTUNIT"
						label="委托单位"
						align="center"
					>
					</el-table-column>
					<el-table-column
						prop="WTDEPT"
						label="委托部门"
						align="center"
					>
					</el-table-column>
					<el-table-column
						prop="GHFW"
						label="规划范围"
						align="center"
					>
					</el-table-column>
					<el-table-column label="操作" align="center">
						<template slot-scope="scope">
							<el-button
								v-if="scope.row.children == undefined"
								size="mini"
								plain
								type="primary"
								@click="handleQC(scope.row)"
								>规划成果质检</el-button
							>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<el-pagination
				@size-change="handleSizeChangeTop"
				@current-change="handleCurrentChangeTop"
				:current-page.sync="currentPageTop"
				:page-size="pagesizeTop"
				:page-sizes="pagesizeArrTop"
				layout="total, sizes, prev, pager, next, jumper"
				:total="tableTotalTop"
				background
			>
			</el-pagination>
		</div>
		<div class="planqc-bottom animate__animated animate__fadeIn">
			<div>
				<span class="title">历史记录</span>
				<el-divider></el-divider>
			</div>
			<!-- 表格 -->
			<el-table
				:data="historyData"
				stripe
				border
				class="history-table"
				size="small"
			>
				<el-table-column type="index"> </el-table-column>
				<el-table-column prop="ghname" label="规划名称">
				</el-table-column>
				<el-table-column prop="username" label="质检人员">
				</el-table-column>
				<el-table-column prop="zjdate" label="质检时间">
				</el-table-column>
				<el-table-column prop="zjdesc" label="质检说明">
				</el-table-column>
				<el-table-column prop="zjscore" label="综合评分">
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button
							size="mini"
							type="primary"
							plain
							@click="handleReport(scope.row)"
							>质检报告</el-button
						>
						<el-button size="mini" type="warning" plain
							>错误结果(gdb)</el-button
						>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				background
				@size-change="handleSizeChangeBot"
				@current-change="handleCurrentChangeBot"
				:current-page.sync="currentPageBot"
				:page-size="pagesizeBot"
				:page-sizes="pagesizeArrBot"
				layout="total, sizes, prev, pager, next, jumper"
				:total="tableTotalBot"
			>
			</el-pagination>
		</div>

		<!-- 规划成果质检弹窗 -->
		<el-dialog
			title="规划成果质检"
			:visible.sync="dialogFormVisible"
			:close-on-click-modal="false"
			custom-class="QCdialog"
		>
			<div class="head">
				<div class="head-top">
					<div class="title">
						{{ planName }}
					</div>
					<div class="qc-sel">
						质检规则：
						<el-select
							v-model="QCvalue"
							placeholder="请选择"
							@change="changeQCRules"
						>
							<el-option
								v-for="item in QCoptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							>
							</el-option>
						</el-select>
					</div>
				</div>
				<div class="head-bottom">
					<div class="left">
						<el-progress
							type="circle"
							:percentage="50"
							:stroke-width="10"
							:width="100"
							:format="progressTxt"
							color="#13ce66"
						></el-progress>
						<div class="explain">
							<div>
								总计检查项：<span class="total">89个</span>
							</div>
							<div>
								错误项个数：<span class="err-count">76个</span>
							</div>
						</div>
					</div>
					<div class="right">
						<el-button type="primary" @click="beginQC"
							>开始质检</el-button
						>
						<el-button type="primary" @click="exportQCReport"
							>导出质检报告</el-button
						>
					</div>
				</div>
			</div>
			<div class="contain">
				<div class="one-check">
					<div
						v-for="(item, index) in allCheckList"
						:key="index"
						class="onecheck-item"
						:class="{ focusItem: focusItem == item.id }"
						@click.self="clickOnebox(item)"
					>
						{{ item.label }}
					</div>
				</div>
				<div class="two-check">
					<div
						class="two-box"
						v-for="(item, index) in twoCheckList"
						:key="index"
					>
						<div class="two-head">
							<el-checkbox
								v-model="item.checked"
								@change="changeTwoCheck(item)"
							></el-checkbox>
							{{ item.title }}
						</div>
						<div class="two-main">
							{{ item.content }}
						</div>
					</div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/planqc'
</script>

<style scoped lang="scss">
@import '../style/planqc.scss';
</style>