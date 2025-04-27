<!--
 * @Author: WCL
 * @Date: 2022-01-11 13:21:43
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-12 14:42:56
 * @FilePath: \webgis\src\views\evaluate\infrastructure\vue\Infrastructure.vue
 * @Description: 请填写描述
-->
<template>
	<div class="basepg-container">
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
				</div>
			</el-col>
			<el-col :span="15" class="main">
				<!-- 地图 -->
				<div class="map" id="single_map"></div>
			</el-col>
			<el-col :span="5" class="right">
				<el-card class="box-card" shadow="hover">
					<div slot="header" class="header">
						<span>道路密度与国标对比</span>
					</div>
					<div class="main">
						<Chart
							chartId="rtChart"
							:chartOption="rtOption"
							v-if="showRT"
						></Chart>
					</div>
				</el-card>
				<el-card class="bottom-card" shadow="hover">
					<div slot="header" class="header">
						<span>路网密度分析</span>
					</div>
					<div class="bottom-main">
						<el-table :data="rbTableData" size="mini" border stripe>
							<el-table-column
								prop="type"
								label="道路类型"
								align="center"
							>
							</el-table-column>
							<el-table-column
								prop="length"
								label="总长度 km"
								align="center"
							>
							</el-table-column>
							<el-table-column
								prop="area"
								label="建成区 km²"
								align="center"
							>
							</el-table-column>
							<el-table-column
								prop="density"
								label="路网密度:km/km²"
								:render-header="renderheader"
								:key="Math.random()"
								align="center"
							>
							</el-table-column>
						</el-table>
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
export { default } from '../js/infrastructure'
</script>

<style scoped lang="scss">
@import '../style/infrastructure.scss';
</style>