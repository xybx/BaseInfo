<!--
 * @Author: WCL
 * @Date: 2022-01-13 10:05:27
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-28 17:04:36
 * @FilePath: \webgis\src\components\model\basicmodel\vue\BasicModel.vue
 * @Description: 模型管理-基础配置
-->
<template>
	<div class="basicmodel-container">		

		
			<div class="title">
				指标列表
				<span class="add-btns">
					<el-button type="primary" size="mini" @click="addSL"
						>新增矢量指标</el-button
					>
					<el-button type="primary" size="mini" @click="addSZX"
						>新增数值型指标</el-button
					>
				</span>
			</div>
			<div class="table-box">
				<el-table
					:data="zbTableData"
					stripe
					border
					size="small"
					:default-sort="{ prop: 'pid', order: 'descending' }"
					v-loading="ZBloading"
					element-loading-text="拼命加载中"
					element-loading-spinner="el-icon-loading"
				>
					<el-table-column
						prop="PID"
						label="序号"
						align="center"
						min-width="80"
						sortable
					>
					</el-table-column>
					<el-table-column
						prop="DSNAME"
						label="所属数据源"
						align="center"
						min-width="150"
					></el-table-column>
					<el-table-column
						prop="ZBTYPENAME"
						label="指标类型"
						align="center"
						min-width="100"
					>
					</el-table-column>
					<el-table-column
						prop="ZBNAME"
						label="指标名称"
						align="center"
						min-width="150"
					>
					</el-table-column>
					<!-- <el-table-column
						prop="ZBVALUE"
						label="指标值"
						align="center"
						min-width="100"
					>
					</el-table-column> -->
					<!-- <el-table-column
						prop="ZBUNIT"
						label="指标单位"
						align="center"
						min-width="100"
					> 
					</el-table-column>-->
					<el-table-column
						prop="ZBFEATURECLASS"
						label="指标要素类"
						align="center"
						min-width="150"
					>
					</el-table-column>
					<el-table-column
						label="操作"
						align="center"
						min-width="150"
					>
						<template v-slot="scope">
							<el-button
								type="primary"
								size="mini"
								plain
								@click="handleZBEdit(scope.row)"
								>编辑</el-button
							>
							<el-popconfirm
								confirm-button-text="确定"
								cancel-button-text="取消"
								icon="el-icon-info"
								icon-color="#f56c6c"
								title="确定删除此条数据吗?"
								@confirm="confirmZBDel(scope.row)"
							>
								<el-button
									slot="reference"
									type="danger"
									size="mini"
									plain
									class="del-btn"
									>删除</el-button
								>
							</el-popconfirm>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<el-pagination
				background
				@size-change="handleSizeChangeBot"
				@current-change="handleCurrentChangeBot"
				:current-page.sync="currentPageBot"
				:page-size="pagesizeBot"
				:page-sizes="pagesizeArrBot"
				layout="total, sizes, prev, pager, next, jumper"
				:total="totalBot"
			>
			</el-pagination>
		
		<!-- 新增/编辑矢量指标弹窗 -->
		<el-dialog
			title="矢量指标"
			:visible.sync="SLVisible"
			:close-on-click-modal="false"
			custom-class="addSLdialog"
			@closed="closeSL"
			width="30%"
			v-dialogDrag
		>
			<el-form
				:model="SLForm"
				ref="SLForm"
				size="small"
				label-width="auto"
				:rules="SLRules"
			>
				<el-form-item label="指标名称" prop="zbname">
					<el-input
						v-model="SLForm.zbname"
						placeholder="请输入指标名称"
					></el-input>
				</el-form-item>
				<!-- <el-form-item label="单位" prop="zbunit">
					<el-input
						v-model="SLForm.zbunit"
						placeholder="请输入指标计算单位"
					></el-input>
				</el-form-item> -->
				<el-form-item label="数据源" prop="dsid">
					<el-select v-model="SLForm.dsid" placeholder="请选择">
						<el-option
							v-for="item in sjyTableData"
							:key="item.ID"
							:label="item.NAME"
							:value="item.ID"
						>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="指标要素类" prop="zbfeatureclass">
					<el-input
						v-model="SLForm.zbfeatureclass"
						placeholder="请输入指标要素类"
					></el-input>
				</el-form-item>
				<el-form-item label="筛选条件" prop="querywhere">
					<el-input
						v-model="SLForm.querywhere"
						placeholder="请输入数据源名称"
					></el-input>
				</el-form-item>
				<div class="btns">
					<el-button
						type="warning"
						size="small"
						@click="SLVisible = false"
						>取消</el-button
					>
					<el-button type="primary" size="small" @click="saveSLForm"
						>保存</el-button
					>
				</div>
			</el-form>
		</el-dialog>

		<!-- 新增/编辑数值型指标 -->
		<el-dialog
			title="数值型指标"
			:visible.sync="SZXVisible"
			:close-on-click-modal="false"
			custom-class="addSLdialog"
			@closed="closeSZX"
			width="30%"
			v-dialogDrag
		>
			<el-form
				:model="SZXForm"
				ref="SZXForm"
				size="small"
				label-width="auto"
				:rules="SZXRules"
			>
				<el-form-item label="指标名称" prop="zbname">
					<el-input
						v-model="SZXForm.zbname"
						placeholder="请输入指标名称"
					></el-input>
				</el-form-item>
				<el-form-item label="指标值" prop="zbvalue">
					<el-input
						v-model="SZXForm.zbvalue"
						placeholder="请输入指标值"
					></el-input>
				</el-form-item>
				<!-- <el-form-item label="单位" prop="zbunit">
					<el-input
						v-model="SZXForm.zbunit"
						placeholder="请输入单位"
					></el-input>
				</el-form-item> -->
				<div class="btns">
					<el-button
						type="warning"
						size="small"
						@click="SZXVisible = false"
						>取消</el-button
					>
					<el-button type="primary" size="small" @click="saveSXZForm"
						>保存</el-button
					>
				</div>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/MetaData'
</script>

<style scoped lang="scss">
@import '../style/MetaData.scss';
</style>