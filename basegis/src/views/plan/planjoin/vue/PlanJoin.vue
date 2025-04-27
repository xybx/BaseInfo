<!--
 * @Author: WCL
 * @Date: 2021-12-30 11:21:48
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-10 13:31:25
 * @FilePath: \webgis\src\views\plan\planjoin\vue\PlanJoin.vue
 * @Description: 数据汇交
-->
<template>
	<div class="planjoin-container">
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
								>生成离线汇交材料包</el-button
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
				:cell-style="txtCenter"
				:header-cell-style="txtCenter"
				class="history-table"
				size="small"
			>
				<el-table-column type="index"> </el-table-column>
				<el-table-column prop="PRJNAME" label="规划名称">
				</el-table-column>
				<el-table-column prop="JDNAME" label="阶段名称">
				</el-table-column>
				<el-table-column prop="USERNAME" label="申请人">
				</el-table-column>
				<el-table-column prop="HJDATE" label="汇交时间">
				</el-table-column>
				<el-table-column prop="STATUS" label="状态">
					<template v-slot="scope">
						{{
							scope.row.STATUS == 0
								? '正在压缩材料中...'
								: (scope.row.STATUS == -1
								? '压缩失败'
								: '压缩成功')
						}}
					</template>
				</el-table-column>
				<el-table-column label="离线包下载">
					<template v-slot="scope">
						<el-link type="primary" @click="handleDown(scope.row)">
							{{ scope.row.FILENAME }}
						</el-link>
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
	</div>
</template>

<script>
export { default } from '../js/planjoin'
</script>

<style scoped lang="scss">
@import '../style/planjoin.scss';
</style>