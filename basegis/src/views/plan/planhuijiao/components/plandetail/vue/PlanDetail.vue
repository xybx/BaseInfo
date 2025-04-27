<!--
 * @Author: WCL
 * @Date: 2021-12-28 11:02:37
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-16 10:58:30
 * @FilePath: \webgis\src\views\plan\planlist\components\plandetail\vue\PlanDetail.vue
 * @Description: 项目列表-详细阶段记录
-->
<template>
	<div class="admin-container">
		<div class="animate__animated animate__fadeIn add-box">
			<div class="prj-name">当前项目 / {{ $route.query.name }}</div>
			<el-button
				type="primary"
				size="small"
				icon="el-icon-plus"
				@click="addItem"
				>添加</el-button
			>
		</div>
		<div class="table-contain animate__animated animate__fadeIn">
			<el-table
				:data="tableData"
				border
				stripe
				:default-sort="{ prop: 'PID', order: 'descending' }"
				v-loading="loading"
				size="small"
			>
				<el-table-column
					prop="PID"
					label="序号"
					min-width="120"
					sortable
					align="center"
				></el-table-column>
				<el-table-column
					prop="JDNAME"
					label="阶段名称"
					min-width="250"
					align="center"
				>
					<template v-slot="scope">
						<el-input
							v-model.trim="scope.row.JDNAME"
							size="small"
							v-if="scope.row.isread"
							ref="stage"
						>
							<el-button
								slot="append"
								size="small"
								type="primary"
								@click="changeStageName(scope.row)"
								>保存</el-button
							>
						</el-input>

						<span v-else>{{ scope.row.JDNAME }}</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="GHAREA"
					label="规划面积"
					min-width="100"
					align="center"
				>
				</el-table-column>
				<el-table-column
					prop="BZUNIT"
					label="编制单位"
					min-width="200"
					align="center"
				>
				</el-table-column>
				<el-table-column
					prop="WTUNIT"
					label="委托单位"
					min-width="200"
					align="center"
				>
				</el-table-column>
				<el-table-column
					prop="WTDEPT"
					label="委托部门"
					min-width="200"
					align="center"
				>
				</el-table-column>
				<el-table-column
					prop="GHFW"
					label="规划范围"
					min-width="150"
					align="center"
				>
				</el-table-column>
				<el-table-column
					label="操作"
					min-width="300"
					align="center"
					class-name="handle-col"
				>
					<template slot-scope="scope">
						<el-button
							@click="handleDetail(scope.row, false)"
							type="primary"
							plain
							size="mini"
							>详细信息</el-button
						>
						<el-upload
							class="upload"
							ref="upload"
							action="action"
							:http-request="handleUpload"
							accept=".zip"
							:show-file-list="false"
						>
							<el-button
								type="success"
								size="mini"
								plain
								@click="uploadFile(scope.row)"
								>上传材料</el-button
							>
						</el-upload>
						<el-button
							size="mini"
							type="warning"
							plain
							@click="handleDetail(scope.row, true)"
							>修改</el-button
						>
						<el-popconfirm
							title="确定删除当前数据吗？"
							@confirm="handleDelete(scope.row)"
						>
							<el-button
								type="danger"
								size="mini"
								plain
								slot="reference"
								>删除</el-button
							></el-popconfirm
						>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page.sync="currentPage"
				:page-size="pagesize"
				:page-sizes="pagesizeArr"
				layout="total, sizes, prev, pager, next, jumper"
				:total="tableTotal"
				background
			>
			</el-pagination>
		</div>

		<!-- 添加项目 -->
		<el-dialog
			title="添加阶段"
			:visible.sync="dialogAddItem"
			width="30%"
			class="add-dialog"
			@closed="closeAddDialog"
			v-dialogDrag
			:close-on-click-modal="false"
		>
			<el-form
				:model="addForm"
				:rules="addFormRule"
				ref="addFormRef"
				label-width="auto"
			>
				<el-form-item label="选择阶段" prop="jdbh">
					<el-select
						v-model="addForm.jdbh"
						placeholder="请选择阶段"
						size="small"
						value-key="JDBH"
						clearable
					>
						<el-option
							v-for="item in JDTypeList"
							:label="item.JDNAME"
							:value="item.JDBH"
							:key="item.JDBH"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="规划面积" prop="gharea">
					<el-input
						v-model.trim="addForm.gharea"
						autocomplete="off"
						size="small"
						placeholder="请输入规划面积"
					></el-input>
				</el-form-item>
				<el-form-item label="编制单位" prop="bzunit">
					<el-input
						v-model.trim="addForm.bzunit"
						autocomplete="off"
						size="small"
						placeholder="请输入编制单位"
					></el-input>
				</el-form-item>
				<el-form-item label="委托单位" prop="wtunit">
					<el-input
						v-model.trim="addForm.wtunit"
						autocomplete="off"
						size="small"
						placeholder="请输入委托单位"
					></el-input>
				</el-form-item>
				<el-form-item label="委托部门" prop="wtdept">
					<el-input
						v-model.trim="addForm.wtdept"
						autocomplete="off"
						size="small"
						placeholder="请输入委托部门"
					></el-input>
				</el-form-item>
				<el-form-item label="规划范围" prop="ghfw">
					<el-input
						v-model.trim="addForm.ghfw"
						autocomplete="off"
						size="small"
						placeholder="请输入规划范围"
					></el-input>
				</el-form-item>
				<div class="dialog-footer">
					<el-button type="primary" @click="addFormInfo" size="small"
						>保 存</el-button
					>
				</div>
			</el-form>
		</el-dialog>

		<!-- 详细信息 -->
		<detail-info
			v-if="dialogInfo"
			:dialogInfo="dialogInfo"
			:pid="pid"
			:showBtn="showBtn"
			@closePlanUser="closePlanUser"
		></detail-info>
	</div>
</template>

<script>
export { default } from '../js/plandetail'
</script>

<style scoped lang="scss">
@import '../style/plandetail.scss';
</style>