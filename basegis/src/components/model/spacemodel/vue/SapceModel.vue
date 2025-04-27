<!--
 * @Author: WCL
 * @Date: 2022-01-13 10:07:07
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-19 16:23:02
 * @FilePath: \webgis\src\components\model\custmodel\vue\CustModel.vue
 * @Description: 模型管理-定制模型
-->
<template>
	<div class="custmodel-container">
		<div class="title">
			模型列表
			<span class="add-btns">
				<el-button type="primary" size="mini" @click="addSL">新增空间模型</el-button>				
			</span>
		</div>
		<div class="table-box">
			<el-table :data="mxTableData" stripe border :default-sort="{ prop: 'pid', order: 'descending' }"
				v-loading="loading" element-loading-text="数据加载中" element-loading-spinner="el-icon-loading">
				<el-table-column prop="PID" label="序号" align="center" width="100">
				</el-table-column>
				<!-- <el-table-column prop="XZQMC" label="行政区" align="center" width="100">
				</el-table-column> -->
				<!-- <el-table-column prop="YEAR" label="年份" align="center"  width="60">
				</el-table-column> -->
				<el-table-column prop="CATEGORYNAME" label="所属类别" align="center">
				</el-table-column>
				<el-table-column prop="ONETYPE" label="一级分类" align="center">
				</el-table-column>
				<el-table-column prop="TWOTYPE" label="二级分类" align="center">
				</el-table-column>
				<el-table-column prop="MODELNAME" label="模型名称" align="center">
				</el-table-column>
				<el-table-column prop="ALGNAME" label="算法名称" align="center">
				</el-table-column>
				<el-table-column prop="DESCRIPTION" label="描述" align="left">
				</el-table-column>
				<!-- <el-table-column label="操作" align="center" width="300">
					<template v-slot="scope">
						<el-button type="primary" size="mini" plain @click="handleEdit(scope.row)">编辑</el-button>
						

						</template>
				</el-table-column> -->
			</el-table>
		</div>
		<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
			:current-page.sync="currentPage" :page-size="pagesize" :page-sizes="pagesizeArr"
			layout="total, sizes, prev, pager, next, jumper" :total="tableTotal">
		</el-pagination>

		<!-- 新增/编辑矢量弹窗 -->
		<el-dialog title="空间模型" :visible.sync="SLVisible" :close-on-click-modal="false" custom-class="addSLdialog"
			@closed="closeSL" width="30%" v-dialogDrag>
			<el-form :model="SLForm" ref="SLForm" size="small" label-width="auto" :rules="SLRules">
				<el-form-item label="所属大类" prop="CATEGORYNAME">
					<!-- <el-select v-model="SLForm.modeltype" placeholder="请选择模型类型" @change="changeModelType">
						<el-option v-for="item in modelList" :key="item.id" :label="item.label" :value="item.id">
						</el-option>
					</el-select> -->
					<el-input v-model="SLForm.CATEGORYNAME"  placeholder="请输入模型名称"></el-input>
				</el-form-item>				
				<!-- <el-form-item label="所属指标体系" prop="funclass">
					<el-select v-model="SLForm.funclass" placeholder="所属指标体系" @change="changeFunOptions">
						<el-option v-for="item in funOptions" :key="item.PID" :label="item.SHOWNAME" :value="item.PID">
						</el-option>
					</el-select>
				</el-form-item> -->
				<el-form-item label="一级分类" prop="ONETYPE">
					<!-- <el-select v-model="SLForm.firstflid" placeholder="请选择一级分类" @change="changeFirstFlid">
						<el-option v-for="item in oneOptions" :key="item.PID" :label="item.SHOWNAME" :value="item.PID">
						</el-option>
					</el-select> -->
					<el-input v-model="SLForm.ONETYPE"  placeholder="请输入模型名称"></el-input>
				</el-form-item>
				<el-form-item label="二级分类" prop="TWOTYPE">
					<!-- <el-select v-model="SLForm.secondflid" placeholder="请选择二级分类" no-data-text="暂无数据"
						@change="changeSecondFlid">
						<el-option v-for="item in twoOptions" :key="item.PID" :label="item.NAME" :value="item.PID">
						</el-option>
					</el-select> -->
					<el-input v-model="SLForm.TWOTYPE"  placeholder="请输入模型名称"></el-input>
				</el-form-item>
				<el-form-item label="模型名称" prop="MODELNAME">					
					<el-input v-model="SLForm.MODELNAME"  placeholder="请输入模型名称"></el-input>				
				</el-form-item>
				<el-form-item label="选择算法" prop="ALGPID">
					<el-select v-model="SLForm.ALGPID" placeholder="请选择算法" no-data-text="暂无数据" @change="changeALG">
						<el-option v-for="item in alglist" :key="item.PID" :label="item.NAME" :value="item.PID">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="描述" prop="DESCRIPTION">
					<el-input v-model="SLForm.DESCRIPTION" type="textarea" placeholder="请输入描述"></el-input>
				</el-form-item>
				<div class="btns">
					<el-button type="warning" size="small" @click="SLVisible = false">取消</el-button>
					<el-button type="primary" size="small" @click="saveSL">保存</el-button>
				</div>
			</el-form>
		</el-dialog>

		<!--日志列表-->
		<!-- <el-dialog title="模型运行日志" :visible.sync="LogVisible" :close-on-click-modal="false" custom-class="addSLdialog"
			@closed="closeLogDialog" width="50%" v-dialogDrag>

			<div class="table-box">
				<el-table :data="logTableData" stripe border :default-sort="{ prop: 'pid', order: 'descending' }"
					v-loading="logloading" element-loading-text="数据加载中" element-loading-spinner="el-icon-loading">
					<el-table-column prop="PID" label="序号" align="center" width="100">
					</el-table-column>
					<el-table-column prop="STRATTIME" label="开始时间" align="center">
					</el-table-column>
					<el-table-column prop="ENDTIME" label="结束时间" align="center">
					</el-table-column>
					<el-table-column prop="USERNAME" label="操作用户" align="center">
					</el-table-column>
					<el-table-column prop="RUNVALUE" label="运行结果值" align="center">
					</el-table-column>
					<el-table-column prop="STATUS" label="状态" align="center">
					</el-table-column>
					<el-table-column prop="FAILDMSG" label="失败原因" align="center">
					</el-table-column>
				</el-table>
			</div>
			<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
				:current-page.sync="currentPageLog" :page-size="pagesizeLog" :page-sizes="pagesizeArrLog"
				layout="total, sizes, prev, pager, next, jumper" :total="tableTotalLog">
			</el-pagination>

		</el-dialog> -->
	</div>
</template>

<script>
export { default } from '../js/spacemodel.js'
</script>

<style scoped lang="scss">
@import '../style/spacemodel.scss';
</style>
