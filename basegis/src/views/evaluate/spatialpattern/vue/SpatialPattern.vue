<!--
 * @Author: WCL
 * @Date: 2022-01-11 13:17:20
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-11 14:11:39
 * @FilePath: \webgis\src\views\evaluate\spatialpattern\vue\SpatialPattern.vue
 * @Description: 空间格局韧性评估
-->
<template>
	<div class="lifecircle-container">
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
					<div class="tree-box">
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
										>({{
											scope.data.childlist.length
										}})</span
									>
								</span>
								<el-slider
									v-if="showSlider(scope)"
									v-model="scope.data.value"
									@change="
										changeOpacity(
											scope.data,
											scope.data.value
										)
									"
									@click.stop.native
								></el-slider>
							</span>
						</layer-tree>
					</div>
					<div class="sel-box" v-show="showSel == 5">
						<el-form ref="selForm" :model="selForm" class="selForm">
							<el-form-item label="出行方式">
								<el-radio-group v-model="selForm.trip">
									<el-radio label="步行"></el-radio>
									<el-radio label="骑行"></el-radio>
									<el-radio label="开车"></el-radio>
								</el-radio-group>
							</el-form-item>
							<el-form-item label="出行时间">
								<span class="time-tips"
									>请拖动按钮选择，单位：分钟</span
								>
								<el-slider
									v-model="selForm.time"
									:step="15"
									:max="60"
									show-stops
								>
								</el-slider>
							</el-form-item>
						</el-form>
					</div>
					<div class="fx-btns" v-show="showSel == 5">
						<el-button
							type="primary"
							size="mini"
							@click="selectPoint"
							>选择分析点</el-button
						>
						<el-button type="primary" size="mini" @click="beginFX"
							>开始分析</el-button
						>
					</div>
				</div>
			</el-col>
			<el-col :span="15" class="main">
				<!-- 地图 -->
				<div class="map" id="single_map"></div>
			</el-col>
			<el-col :span="5" class="right">
				<el-card class="box-card" shadow="hover">
					<div slot="header" class="header">
						<span>{{ rtTitle }}</span>
					</div>
					<div class="main">
						<Chart
							chartId="rtChart"
							:chartOption="rtOption"
							v-if="showRT"
						></Chart>
						<span class="chartshow-tips" v-if="chartShow"
							>图表会在数据分析后展示</span
						>
					</div>
				</el-card>
				<el-card class="bottom-card" shadow="hover">
					<div slot="header" class="header">
						<span>{{ rcTitle }}</span>
					</div>
					<div class="bottom-main">
						<div class="res-tips">
							<span v-show="showSel == 12">
								根据分析点{{ selForm.trip
								}}{{ selForm.time }}分钟条件，
							</span>
							{{ rcTitle }}共搜索出<span class="res-count">{{
								tableData.length
							}}</span
							>个设施
						</div>
						<el-table
							:data="tableData"
							@row-click="rowClick"
							size="mini"
							border
							stripe
							:span-method="objectSpanMethod"
						>
							<el-table-column
								v-for="(item, index) in tableColList"
								:key="index"
								:prop="item.prop"
								:label="item.label"
								align="center"
							></el-table-column>
						</el-table>
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
export { default } from '../js/spatialpattern'
</script>

<style scoped lang="scss">
@import '../style/spatialpattern.scss';
</style>