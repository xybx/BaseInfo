<!--
 * @Author: WCL
 * @Date: 2022-03-14 14:14:59
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-16 16:20:42
 * @FilePath: \webgis\src\components\onemap\onemap-ledger\vue\OnemapLedger.vue
 * @Description: 一张图-统计台账
-->
<template>
	<div class="">
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			:modal="false"
			:close-on-click-modal="false"
			custom-class="ledger"
			:before-close="closeDialog"
			v-if="dialogVisible"
			v-dialogDrag
		>
			<div class="tree-box">
				<el-tree
					:data="treeData"
					:props="defaultProps"
					empty-text="暂无数据"
					@node-click="handleNodeClick"
				>
					<span slot-scope="scope">
						<svg class="icon" aria-hidden="true">
							<use
								:xlink:href="
									scope.data.LEVEL == 'group'
										? '#icon-wenjianjia'
										: '#icon-wenjian'
								"
							></use>
						</svg>
						{{ scope.data.LABEL }}
					</span>
				</el-tree>
			</div>
		</el-dialog>

		<!-- 侧拉框 -->
		<el-drawer
			:visible.sync="drawer"
			direction="rtl"
			:modal="false"
			:wrapperClosable="false"
			ref="drawer"
			custom-class="drawer"
			destroy-on-close
		>
			<div slot="title">
				<span class="drawer-slot-title">统计结果</span>
			</div>

			<div class="content-box">
				<div class="chart-box">
					<Chart
						chartId="rtChart"
						:chartOption="rtOption"
						v-if="showRT"
						@handleParams="handleParams"
					></Chart>
				</div>
				<div class="export-box">
					<!-- <span class="export-title" @click="exportData">导出数据</span> -->
					<el-button
						type="primary"
						@click="exportData"
						plain
						size="mini"
						>导出数据</el-button
					>
				</div>
				<div class="table-box">
					<el-table :data="resultTable" border stripe size="small" @row-click="handleRowClick">
						<el-table-column
							v-for="field in resultTableHeads"
							:prop="field.prop"
							:label="field.label"
							:key="field.prop"
							min-width="120"
							v-if="field.prop!='type'"
						></el-table-column>
						<!-- <el-table-column prop="landcode" label="地类编码">
						</el-table-column>
						<el-table-column prop="landname" label="地类名称">
						</el-table-column>
						<el-table-column prop="area" label="总面积">
						</el-table-column> -->
					</el-table>
				</div>
			</div>
		</el-drawer>

<!-- 上拉抽屉-单个数据列表 -->
<el-drawer
			:visible.sync="bottomdrawer"
			direction="btt"
			:modal="false"
			:wrapperClosable="false"
			ref="drawer"
			:size="drawerSize"
			@closed="drawerClosed"
			custom-class="drawerUp"
		>
			<i
				class="showDrawer"
				:class="switchDrawerIcon"
				:switch="switchDrawer"
				@click="switchHeight"
			></i>
			<span>
				<!-- 表格 -->
				<el-table
					:data="
						overlayTable.slice(
							(currentPage - 1) * pagesize,
							currentPage * pagesize
						)
					"
					border
					style="width: 100%"
					height="300"
					stripe
					v-loading="UPloading"
					element-loading-text="拼命加载中"
					@row-click="tableRowClick"
				>
				<!-- :key="field.PID" -->
					<el-table-column
						v-for="field in resultFields"
            :key="field.prop"
						:prop="field.prop"
						:label="field.label"						
						max-width="180"
					>
					</el-table-column>
				</el-table>
				<!-- 分页 -->
				<el-pagination
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
					:current-page="currentPage"
					:page-sizes="pagesizeArr"
					:page-size="pagesize"
					layout="total, sizes, prev, pager, next, jumper"
					:total="overlayTable.length"
					background
				>
				</el-pagination>
			</span>
		</el-drawer>



	</div>
</template>

<script>
export { default } from '../js/onemap-ledger'
</script>

<style scoped lang="scss">
@import '../style/onemap-ledger.scss';
</style>
