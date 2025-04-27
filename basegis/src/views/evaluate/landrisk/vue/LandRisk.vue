<!--
 * @Author: WCL
 * @Date: 2022-01-11 10:59:03
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-11 11:09:46
 * @FilePath: \webgis\src\views\evaluate\landrisk\vue\LandRisk.vue
 * @Description: 国土空间开发保护风险评估
-->
<template>
	<div class="doublepg-container">
		<el-row>
			<el-col :span="4" class="left">
				<el-tree
					:data="treeData"
					@node-click="handleNodeClick"
					class="pj-tree"
					highlight-current
					node-key="PID"
					:current-node-key="currentKey"
					ref="treeData"
					:props="topTreeProps"
				></el-tree>
				<div class="bottom-title">图层列表</div>
				<div class="bottom-layer">
					<layer-tree
						class="layer-tree"
						:data="treeList"
						empty-text=""
						show-checkbox
						node-key="keyid"
						:render-after-expand="false"
						:props="defaultProps"
						ref="tree"
						@check-change="changeSlider"
						:highlight-current="true"
						:default-checked-keys="defaultKeys"
					>
						<span slot-scope="scope">
							<span class="label-style">
								{{ scope.node.label }}
								<span
									v-if="
										scope.data.childlist &&
										scope.data.childlist != 0 &&
										scope.data.level != 'server'
									"
									class="label-list-style"
									>({{ scope.data.childlist.length }})</span
								>
							</span>
							<el-slider
								v-if="showSlider(scope)"
								v-model="scope.data.value"
								@change="
									changeOpacity(scope.data, scope.data.value)
								"
								@click.stop.native
							></el-slider>
						</span>
					</layer-tree>
				</div>
			</el-col>
			<el-col :span="15" class="main">
				<!-- 地图 -->
				<div class="map" id="single_map"></div>
			</el-col>
			<el-col :span="5" class="right">
				<el-card class="box-card" shadow="hover" v-show="topChartVisible">
					<div slot="header" class="header">
						<span>{{ rtTitle }}</span>
					</div>
					<div class="main">
						<Chart
							chartId="rtChart"
							:chartOption="rtOption"
							v-if="showRT"
						></Chart>
					</div>
				</el-card>
				<el-card class="box-card rc-card" shadow="hover" v-show="middleChartVisible">
					<div slot="header" class="header">
						<span>{{ rcTitle }}</span>
					</div>
					<div class="main">
						<Chart
							chartId="rcChart"
							:chartOption="rcOption"
							v-if="showRC"
						></Chart>
					</div>
				</el-card>
				<el-card class="box-card" shadow="hover">
					<div slot="header" class="header">
						<span>评价说明</span>
					</div>
					<div class="main explain">
						<el-col
							v-for="(item, index) in explainList"
							:key="index"
							class="ex-item"
						>
							<div class="ex-title">{{ item.SMNAME }}</div>
							<div class="ex-content">
								{{ item.SMCONTENT }}
							</div>
						</el-col>
						<div class="btn">
							<el-button
								type="primary"
								size="small"
								@click="previewExport"
								>预览评估分析报告</el-button
							>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
export { default } from '../js/landrisk'
</script>

<style scoped lang="scss">
@import '../style/landrisk.scss';
</style>