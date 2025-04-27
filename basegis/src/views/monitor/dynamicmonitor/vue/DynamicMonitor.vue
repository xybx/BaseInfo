<!--
 * @Author: WCL
 * @Date: 2022-01-13 13:28:36
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-14 14:04:55
 * @FilePath: \webgis\src\views\monitor\dynamicmonitor\vue\DynamicMonitor.vue
 * @Description: 实施监督 - 动态监测
-->
<template>
	<div class="monitor-container">
		<el-row class="top" :gutter="10">
			<el-col :span="6" class="top-left">
				<div>
					<el-card shadow="hover" style="height: 100%">
						<div slot="header" class="clearfix">
							<span
								class="header-txt"
								:class="[
									focusHead == leftTopTitle
										? 'focus-header'
										: '',
								]"
								@click="loadLayer(leftTopTitle)"
								>{{ leftTopTitle }}</span
							>
							<el-button
								style="float: right; padding: 3px 0"
								type="text"
								@click="handleCurrDetail"
								>更多 >>
							</el-button>
						</div>
						<div style="height: 100%; width: 100%">
							<Chart
								chartId="landUse"
								:chartOption="landUseOption"
								v-if="showLandUse"
							></Chart>
						</div>
					</el-card>
				</div>
				<div>
					<el-card shadow="hover" style="height: 100%">
						<div slot="header" class="clearfix">
							<span
								class="header-txt"
								@click="loadLayer(leftCenterTitle)"
								:class="[
									focusHead == leftCenterTitle
										? 'focus-header'
										: '',
								]"
								>{{ leftCenterTitle }}</span
							>
							<el-button
								style="float: right; padding: 3px 0"
								type="text"
								@click="handleBaselineDetail"
								>更多 >></el-button
							>
						</div>
						<div style="height: 100%; width: 100%">
							<Chart
								chartId="lineCtrl"
								:chartOption="lineCtrlOption"
								v-if="showLineCtrl"
							></Chart>
						</div>
					</el-card>
				</div>
			</el-col>
			<el-col :span="12" class="top-center"
				><div>
					<el-card shadow="hover" style="height: 100%">
						<div
							id="cityField"
							style="height: 100%; width: 100%"
						></div>
					</el-card></div
			></el-col>
			<el-col :span="6" class="top-right">
				<div>
					<el-card shadow="hover" style="height: 100%">
						<div slot="header" class="clearfix">
							<span
								class="header-txt"
								@click="loadLayer(rightTopTitle)"
								:class="[
									focusHead == rightTopTitle
										? 'focus-header'
										: '',
								]"
								>{{ rightTopTitle }}</span
							>
						</div>
						<div style="height: 100%; width: 100%">
							<Chart
								chartId="townPlan"
								:chartOption="townPlanOption"
								v-if="showTownPlan"
							></Chart>
						</div>
					</el-card>
				</div>
				<div>
					<el-card shadow="hover" style="height: 100%">
						<div slot="header" class="clearfix">
							<span
								class="header-txt"
								@click="loadLayer(rightCenterTitle)"
								:class="[
									focusHead == rightCenterTitle
										? 'focus-header'
										: '',
								]"
								>{{ rightCenterTitle }}
							</span>
						</div>
						<div style="height: 100%; width: 100%">
							<Chart
								chartId="addBuild"
								:chartOption="addBuildOption"
								v-if="showAddBuild"
							></Chart>
						</div>
					</el-card>
				</div>
			</el-col>
		</el-row>
		<el-row class="bottom" :gutter="10">
			<el-col :span="12" class="bottom-left">
				<div>
					<el-card shadow="hover" style="height: 100%">
						<el-tabs
							v-model="activeBYName"
							@tab-click="handleBYClick"
						>
							<el-tab-pane
								v-for="item in BYTabs"
								:label="item.MODULENAME"
								:key="item.PID"
								:name="String(item.PID)"
							>
								<div
									v-if="item.PID == activeBYName"
									id="farmland"
									style="height: 100%; width: 100%"
								></div
							></el-tab-pane>
						</el-tabs>
					</el-card>
				</div>
			</el-col>
			<el-col :span="12" class="bottom-right">
				<div>
					<el-card shadow="hover" style="height: 100%">
						<el-tabs
							v-model="activeGMName"
							@tab-click="handleGMClick"
						>
							<el-tab-pane
								v-for="item in GMTabs"
								:label="item.MODULENAME"
								:key="item.PID"
								:name="String(item.PID)"
							>
								<div
									v-if="item.PID == activeGMName"
									id="landScale"
									style="height: 100%; width: 100%"
								></div
							></el-tab-pane>
						</el-tabs>
					</el-card>
				</div>
			</el-col>
		</el-row>

		<!-- 现状用地查看详细对话框 -->
		<current-land
			:moduleId="moduleId"
			v-if="dialogCurrent"
			:dialogCurrent="dialogCurrent"
			@closeCurrent="closeCurrent"
		></current-land>

		<!-- 底线管控查看详细 -->
		<el-dialog
			title="底线管控"
			:visible.sync="dialogBaseline"
			width="70%"
			custom-class="modetail"
			:before-close="handleBaselineClose"
		>
			<div class="baseline-container">
				<Chart
					chartId="baseline"
					:chartOption="baselineOption"
					v-if="showBaseline"
				></Chart>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/dynamicmonitor'
</script>

<style scoped lang="scss">
@import '../style/dynamicmonitor.scss';
</style>