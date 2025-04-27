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
				<el-button type="primary" size="mini" @click="addSL">新增指标模型</el-button>
				<!-- <el-button type="primary" size="mini" @click="addDefineSL">新增自定义指标模型</el-button> -->
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
				<el-table-column prop="FUNCLASSNAME" label="所属指标体系" align="center">
				</el-table-column>
				<el-table-column prop="FIRSTFLNAME" label="一级分类" align="center" width="120">
				</el-table-column>
				<el-table-column prop="SECONDFLNAME" label="二级分类" align="center" width="120">
				</el-table-column>
				<el-table-column prop="MODELTYPE" label="模型数据类型" align="center" width="120">
					<template v-slot="scope">
						<span v-if="scope.row.MODELTYPE === 1">矢量模型</span>
						<span v-else-if="scope.row.MODELTYPE === 2">数值模型</span>
						<span v-else>暂无</span>
					</template>
				</el-table-column>
				<el-table-column prop="MODELCODE" label="指标编号" align="center" width="100">
				</el-table-column>
				<el-table-column prop="MODELNAME" label="模型名称" align="center">
				</el-table-column>
				<el-table-column prop="MODELVALUE" label="模型值" align="center" width="200">
					<template v-slot="scope">
						<span v-if="scope.row.MODELVALUE">{{ scope.row.MODELVALUE }}</span>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column prop="MODELUNIT" label="单位" align="center" width="200">

				</el-table-column>

				<el-table-column label="操作" align="center" width="300">
					<template v-slot="scope">
						<el-button type="primary" size="mini" plain @click="handleEdit(scope.row)">编辑</el-button>
						<el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info"
							icon-color="#f56c6c" title="确定删除此条数据吗?" @confirm="confirmDel(scope.$index, scope.row)">
							<el-button slot="reference" type="danger" size="mini" plain class="del-btn">删除</el-button>
						</el-popconfirm>

						<el-button type="success" size="mini" plain @click="handleRun(scope.row)">运行</el-button>
						<el-button type="info" size="mini" plain @click="addLogDialog(scope.row)">日志</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
			:current-page.sync="currentPage" :page-size="pagesize" :page-sizes="pagesizeArr"
			layout="total, sizes, prev, pager, next, jumper" :total="tableTotal">
		</el-pagination>

		<!-- 新增/编辑矢量弹窗 -->
		<el-dialog title="指标模型" :visible.sync="SLVisible" :close-on-click-modal="false" custom-class="addSLdialog"
			@closed="closeSL" width="30%" v-dialogDrag>
			<el-form :model="SLForm" ref="SLForm" size="small" label-width="auto" :rules="SLRules">
				<el-form-item label="模型类型" prop="modeltype">
					<el-select v-model="SLForm.modeltype" placeholder="请选择模型类型" @change="changeModelType">
						<el-option v-for="item in modelList" :key="item.id" :label="item.label" :value="item.id">
						</el-option>
					</el-select>
				</el-form-item>
				<!-- <el-form-item label="行政区" prop="xzqbm">
					<el-select v-model="SLForm.xzqbm" placeholder="请选择行政区" @change="changeXZQ">
						<el-option v-for="item in xzqOptions" :key="item.XZQDM" :label="item.XZQMC" :value="item.XZQDM">
						</el-option>
					</el-select>
				</el-form-item> -->
				<el-form-item label="所属指标体系" prop="funclass">
					<el-select v-model="SLForm.funclass" placeholder="所属指标体系" @change="changeFunOptions">
						<el-option v-for="item in funOptions" :key="item.PID" :label="item.SHOWNAME" :value="item.PID">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="一级分类" prop="firstflid">
					<el-select v-model="SLForm.firstflid" placeholder="请选择一级分类" @change="changeFirstFlid">
						<el-option v-for="item in oneOptions" :key="item.PID" :label="item.SHOWNAME" :value="item.PID">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="二级分类" prop="secondflid">
					<el-select v-model="SLForm.secondflid" placeholder="请选择二级分类" no-data-text="暂无数据"
						@change="changeSecondFlid">
						<el-option v-for="item in twoOptions" :key="item.PID" :label="item.NAME" :value="item.PID">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="模型名称" class="mxname-item" prop="modelname">
					<el-select v-model="SLForm.modelname" placeholder="请选择模型名称" class="mxname" no-data-text="暂无数据"
						value-key="CODE" @change="changeModelName">
						<el-option v-for="item in mxOptions" :key="item.CODE" :label="item.NAME" :value="item">
						</el-option>
					</el-select>
					<!-- <el-form-item prop="year" class="year-item">
						<el-date-picker v-model="SLForm.year" ref="date" type="year" placeholder="年份" class="year"
							format="yyyy" value-format="yyyy" @input="changeYear">
						</el-date-picker>
					</el-form-item> -->
				</el-form-item>
				<el-form-item label="指标编号" prop="modelcode">
					<el-input v-model="SLForm.modelcode" readonly></el-input>
				</el-form-item>
				<el-form-item label="指标单位" prop="modelunit">
					<el-input v-model="SLForm.modelunit" readonly></el-input>
				</el-form-item>
				<el-form-item label="选择算法" prop="secondflid">
					<el-select v-model="SLForm.ALGPID" placeholder="请选择模型算法" no-data-text="暂无数据" @change="changeALG">
						<el-option v-for="item in alglist" :key="item.PID" :label="item.NAME" :value="item.PID">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="item.name" v-for="(item,index) in algParams" :key="index" :title="item.desc">
					<el-popover placement="right" width="500" trigger="click">
						<el-table stripe border :data="item.zblist" class="changeone-table">
							<el-table-column width="55" align="center">
								<template slot-scope="scope">
									<el-radio :label="scope.row.PID" v-model="item.radioID"
										@input="changeRadioOne(scope.row, item)"></el-radio>
								</template>
							</el-table-column>
							<el-table-column width="150" property="DSNAME" label="数据源"></el-table-column>
							<el-table-column width="150" property="ZBNAME" label="指标名称"></el-table-column>
							<el-table-column width="140" property="ZBFEATURECLASS" label="要素类"></el-table-column>
						</el-table>
						<el-pagination small background @current-change="handleZBCurrentChange"
							:current-page.sync="currentPageBot" :total="totalBot" layout="prev, pager, next">
						</el-pagination>
						<el-button slot="reference">选择指标因子</el-button>
					</el-popover>
					<br />
					<el-table stripe border size="mini" ref="selectZBData" v-show="item.selectZBData.length > 0"
						:data="item.selectZBData" highlight-current-row class="one-table">
						<el-table-column property="ZBNAME" label="指标名称"></el-table-column>
						<el-table-column property="DSNAME" label="数据源"></el-table-column>
						<el-table-column property="ZBFEATURECLASS" label="要素类"></el-table-column>
					</el-table>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input v-model="SLForm.description" type="textarea" placeholder="请输入描述"></el-input>
				</el-form-item>
				<div class="btns">
					<el-button type="warning" size="small" @click="SLVisible = false">取消</el-button>
					<el-button type="primary" size="small" @click="saveSL">保存</el-button>
				</div>
			</el-form>
		</el-dialog>

		<!--日志列表-->
		<el-dialog title="模型运行日志" :visible.sync="LogVisible" :close-on-click-modal="false" custom-class="addSLdialog"
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

		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/custmodel'
</script>

<style scoped lang="scss">
@import '../style/custmodel.scss';
</style>
