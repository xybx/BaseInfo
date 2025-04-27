<!--
 * @Author: WCL
 * @Date: 2021-12-02 11:39:31
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-02 14:12:28
 * @FilePath: \webgis\src\components\onemap\onemap-hegui\vue\OnemapHegui.vue
 * @Description: 一张图-合规审查
-->
<template>
	<div class="">
		<!-- 合规审查 -->
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			:before-close="closeDialog"
			:modal="false"
			:close-on-click-modal="false"
			custom-class="hegui"
			v-if="dialogVisible"
			v-dialogDrag
		>
			<!-- 自定义范围 -->
			<div>
				<div class="sub-title">
					<i class="el-icon-caret-right"></i>
					<span>自定义范围</span>
				</div>
				<div class="sub-content">
					<el-button
						type="warning"
						size="small"
						@click="drawPolygon()"
						>绘制范围</el-button
					>
				</div>
			</div>

			<!-- 选择文件上传 -->
			<div>
				<div class="sub-title">
					<i class="el-icon-caret-right"></i>
					<span>选择文件上传</span>
				</div>
				<div class="sub-content">
					<div class="up-btn-list">
						<span v-for="(item, index) in upBtnList" :key="index">
							<el-upload
								:ref="item.ref"
								action="action"
								:http-request="uploadFile"
								:accept="item.accept"
								:show-file-list="false"
							>
								<div class="up-btn">
									<el-image :src="item.url"></el-image>
								</div>
							</el-upload>
						</span>
					</div>
					<div class="up-txt">
						{{ upTXT }}
					</div>
					<div class="up-tips">
						上传面积为：<span
							style="font-weight: bold; color: green"
							>{{ upArea }}
						</span>
						公顷
					</div>
				</div>
			</div>

			<!-- 缓冲距离设置 -->
			<div>
				<div class="sub-title">
					<i class="el-icon-caret-right"></i>
					<span>缓冲距离设置</span>
				</div>
				<div class="sub-content buffer-content">
					<span class="sub-check">
						<el-checkbox v-model="isBuffer">
							缓冲距离：
							<el-input
								v-model="bufferDistance"
								placeholder="请输入距离"
								:disabled="!isBuffer"
								size="small"
							></el-input>
							(米)
						</el-checkbox></span
					>
					<el-button
						type="primary"
						size="small"
						:disabled="!isBuffer"
						@click="bufferOK"
						>确定</el-button
					>
				</div>
			</div>

			<!-- 分析内容 -->
			<div>
				<div class="sub-title">
					<i class="el-icon-caret-right"></i>
					<span>分析内容</span>
				</div>
				<div class="sub-content">
					<el-table
						ref="table"
						:data="tableData"
						@row-click="tableDataRowClick"
						tooltip-effect="dark"
						stripe
						border
						size="mini"
					>
						<el-table-column width="55" align="center">
							<template slot-scope="scope">
								<el-radio
									:label="scope.row.index"
									v-model="radioID"
									@input="changeRadio(scope.row)"
								></el-radio>
							</template>
						</el-table-column>
						<el-table-column
							prop="name"
							label="名称"
							align="center"
						>
						</el-table-column>
						<el-table-column
							prop="area"
							label="面积(公顷)"
							align="center"
						>
						</el-table-column>
						<el-table-column
							prop="distance"
							label="距离(公里)"
							align="center"
						>
						</el-table-column>
						<el-table-column
							label="操作"
							align="center"
							min-width="120"
						>
							<template slot-scope="scope">
								<el-button
									@click="exportZJDBtnClick(scope.row)"
									type="primary"
									size="mini"
									>导出界址点</el-button
								>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div>

			<!-- 选择审查图层 -->
			<div>
				<div class="sub-title">
					<i class="el-icon-caret-right"></i>
					<span>选择审查图层</span>
				</div>
				<div class="sub-content">
					<el-tree
						:data="treeData"
						show-checkbox
						highlight-current
						:props="layerProps"
						@check-change="handleTreeCheck"
					>
					</el-tree>
				</div>
				<div class="exam-box">
					<el-button
						type="primary"
						size="small"
						class="begin-exam"
						@click="handleBeginExam"
						>开始审查</el-button
					>
					<el-button
						type="primary"
						size="small"
						class="begin-exam"
						@click="handleExportReport"
						>导出审查报告</el-button
					>
				</div>
			</div>
		</el-dialog>

		<!-- 地块审查侧拉框 -->
		<el-drawer
			:visible.sync="landDrawer"
			direction="rtl"
			:modal="false"
			:wrapperClosable="false"
			ref="landDrawer"
			custom-class="drawer"
			destroy-on-close
		>
			<div slot="title">
				<span class="drawer-slot-title">审查结果</span>
				<el-button
					type="primary"
					size="small"
					class="begin-exam"
					@click="exportNoCTPointsClick"
					>导出不冲突红线的坐标点</el-button
				>
			</div>

			<div class="scTable-box">
				<el-table
					:data="scResultTable"
					@row-click="scRowClick"
					border
					stripe
					size="small"
				>
					<el-table-column prop="layername" label="审查图层">
					</el-table-column>
					<el-table-column prop="result" label="审查结果">
						<template v-slot="scope">
							<span
								:style="{
									color:
										scope.row.insertarea > 0
											? (scope.row.layername.indexOf('城镇开发边界')>-1)?'green':'red'
											: '',
								}"
							>
								{{ scope.row.result }}
							</span>
						</template>
					</el-table-column>
					<el-table-column prop="dknum" label="地块个数">
					</el-table-column>
					<el-table-column
						prop="insertarea"
						label="涉及面积（公顷）"
					></el-table-column>
				</el-table>
			</div>
		</el-drawer>
	</div>
</template>

<script>
export { default } from '../js/onemap-hegui'
</script>

<style scoped lang="scss">
@import '../style/onemap-hegui.scss';
</style>
