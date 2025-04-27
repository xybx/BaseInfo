<!--
 * @Author: WCL
 * @Date: 2021-11-16 10:00:02
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 16:34:03
 * @FilePath: \webgis\src\views\onemap_szxc\vue\OneMap.vue
 * @Description: 一张图主页
-->
<template>
	<el-container>
		<div
			class="treeBtn"
			:class="showTree == false ? 'closeStatus' : ''"
			@click="handleShowTree"
		>
			<i
				:class="
					showTree == true
						? 'el-icon-arrow-left'
						: 'el-icon-arrow-right'
				"
			></i>
		</div>
		<el-aside class="layer-aside" v-show="showTree" id="layerAside">
			<div class="search-box">
				<el-tabs v-model="focusTab">
					<el-tab-pane label="所有图层" name="all">
						<el-input
							placeholder="输入关键字进行搜索"
							v-model="filterAllText"
							size="small"
						>
						</el-input>
						<!-- 列表 -->
						<layer-tree
							class="layer-tree"
							:data="treeAllList"
							empty-text="暂无数据"
							v-loading="allLoading"
							element-loading-text="列表加载中"
							element-loading-spinner="el-icon-loading"
							show-checkbox
							:render-after-expand="false"
							:props="defaultProps"
							ref="treeAll"
							@check-change="changeSlider"
							:highlight-current="true"
							:filter-node-method="filterNode"
							lazy
							:load="nodeClick"
							:default-checked-keys="defaultCheckArr"
							:default-expanded-keys="defaultExpendArr"
							draggable
							@node-drag-start="handleDragStart"
							@node-drag-end="handleDragEnd"
							node-key="keyid"
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

								<!-- 收藏按钮 -->
								<i
									v-if="scope.data.level !== 'layer'"
									class="icon-collect"
									:class="
										scope.data.isCollect
											? 'el-icon-star-on icon-color'
											: 'el-icon-star-off'
									"
									@click.stop="switchCollect(scope)"
								></i>
								<el-switch
									v-show="
										(scope.data.level === 'server' &&
											scope.node.checked) ||
										(scope.data.level === 'server' &&
											scope.node.indeterminate)
									"
									v-model="scope.data.isShow"
									@click.stop.native
									ref="switchRef"
								>
								</el-switch>
								<el-slider
									v-show="showSlider(scope)"
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
					</el-tab-pane>
				</el-tabs>
			</div>
		</el-aside>
		<el-main>
			<!-- 地图 -->
			<Map2D
				v-show="maptype === 2"
				:leftMap="splitMap_Left_Data"
				:rightMap="splitMap_Right_Data"
			></Map2D>
			
			<!-- 控制条 -->
			<map-control></map-control>
			<!-- 查询定位 -->
			<onemap-locate ref="locate"></onemap-locate>
			<!-- 知识库 -->
			<onemap-wiki ref="wiki"></onemap-wiki>
		</el-main>
	</el-container>
</template>

<script>
export { default } from '../js/onemap'
</script>

<style scoped lang="scss">
@import '../style/onemap.scss';
</style>