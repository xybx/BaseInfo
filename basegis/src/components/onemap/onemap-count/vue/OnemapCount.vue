<!--
 * @Author: WCL
 * @Date: 2022-01-18 09:41:44
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:10:08
 * @FilePath: \webgis\src\components\onemap\onemap-count\vue\OnemapCount.vue
 * @Description: 一张图-条件查询
-->
<template>
	<div class="">
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			custom-class="count"
			:modal="false"
			:close-on-click-modal="false"
			:before-close="closeDialog"
			v-if="dialogVisible"
			v-dialogDrag
			destroy-on-close
		>
			<span slot="title">
				<el-tabs
					tab-position="left"
					v-model="tabFocus"
					@tab-click="handleTab"
				>
					<el-tab-pane
						v-for="item in tabList"
						:key="item.PID"
						:label="item.TYPENAME"
						:name="item.PID"
					></el-tab-pane>
				</el-tabs>
			</span>
			<div class="content-box">
				<div class="content-title">
					<i class="el-icon-caret-right"></i>
					{{ contentTitle }}
				</div>

				<div class="content-form">
					<el-form
						:inline="true"
						:model="countForm"
						class="demo-form-inline"
						size="mini"
					>
						<el-form-item
							v-for="item in formList"
							:key="item.PID"
							:label="item.DISPLAYNAME"
							:class="`${item.CONTROLTYPE}-type`"
						>
							<el-input
								v-if="item.CONTROLTYPE == 'text'"
								:placeholder="`请输入${item.DISPLAYNAME}`"
								v-model="countForm[item.FIELDNAME]"
							></el-input>

							<el-date-picker
								v-if="item.CONTROLTYPE == 'date'"
								type="daterange"
								range-separator="至"
								start-placeholder="开始日期"
								end-placeholder="结束日期"
								v-model="countForm[item.FIELDNAME]"
							>
							</el-date-picker>

							<el-select
								v-if="item.CONTROLTYPE == 'list'"
								v-model="countForm[item.FIELDNAME]"
								:placeholder="`请选择${item.DISPLAYNAME}`"
							>
								<el-option
									v-for="value in item.VALUELIST"
									:label="value.CONTROLNAME"
									:value="value.CONTROLVALUE"
									:key="value.PID"
								></el-option>
							</el-select>

							<div
								:class="`${item.CONTROLTYPE}-type`"
								v-if="item.CONTROLTYPE == 'range'"
							>
								<el-input
									type="number"
									v-model="countForm[item.FIELDNAME][0]"
								></el-input>
								<span class="apart">-</span>
								<el-input
									type="number"
									v-model="countForm[item.FIELDNAME][1]"
								></el-input>
							</div>
						</el-form-item>
						<div class="form-btn">
							<el-button type="primary" @click="searchForm"
								>查询</el-button
							>
							<el-button @click="closeDialog">取消</el-button>
						</div>
					</el-form>
				</div>
			</div>
		</el-dialog>

		<!-- 上拉抽屉 -->
		<el-drawer
			:visible.sync="drawer"
			direction="btt"
			:modal="false"
			:wrapperClosable="false"
			ref="drawer"
			:size="drawerSize"
			@closed="drawerClosed"
			custom-class="drawer"
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
					v-loading="loading"
					element-loading-text="拼命加载中"
					@row-click="tableRowClick"
				>
					<el-table-column
						v-for="field in resultFields"
						:prop="field.FIELDNAME"
						:label="field.FIELDDESC"
						:key="field.PID"
						min-width="180"
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

		<!-- 表格属性弹窗 -->
		<el-dialog
			:visible.sync="attrdialogstatus"
			custom-class="count-attr"
			:modal="false"
			title="属性"
			center
		>
			<!-- <div class="prop-sel">
				<el-select
					v-model="nameTit"
					@change="nameClick"
					value-key="value"
					size="small"
					popper-class="selBox"
				>
					<el-option
						v-for="item in namelist"
						:key="item.value"
						:label="item.name"
						:value="item"
					></el-option>
				</el-select>
				<span class="count-box">
					共
					<span class="count">{{ namelist.length }}</span>
					项
				</span>
			</div>
			<div class="tags">
				<el-tag
					v-for="(item, index) in tagList"
					:key="index"
					@click="changeTag(item)"
					:class="{ focusTag: focusTag == item.value }"
				>
					{{ item.displayfieldvalue }}
				</el-tag>
			</div> -->
			<el-table
				:data="attrTableData"
				border
				tooltip-effect="dark"
				stripe
				size="small"
				ref="attrTable"
			>
				<el-table-column prop="name" label="属性"></el-table-column>
				<el-table-column prop="value" label="属性值"></el-table-column>
			</el-table>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/onemap-count'
</script>

<style scoped lang="scss">
@import '../style/onemap-count.scss';
</style>
