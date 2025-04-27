<!--
 * @Author: LJX
 * @Date: 2023-04-14 11:24:14
 * @LastEditors: LJX
 * @LastEditTime: 2023-04-14 11:24:14
 * @FilePath: \webgis\src\components\onemap\onemap-sort\vue\OnemapSort.vue
 * @Description: 统一平台 - 图层顺序
-->
<template>
	<div class="">
		<!-- 图层顺序 -->
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			:before-close="closeDialog"
			:modal="false"
			:close-on-click-modal="false"
			custom-class="wiki"
			v-if="dialogVisible"
			v-dialogDrag>
			<div class="tree-box">
				<el-tree
					:data="treeData"
					:props="defaultProps"
					empty-text="暂无数据"
					ref="tree"
					node-key="layername"
					@node-drag-start="handleDragStart"
					@node-drag-enter="handleDragEnter"
					@node-drag-leave="handleDragLeave"
					@node-drag-over="handleDragOver"
					@node-drag-end="handleDragEnd"
					@node-drop="handleDrop"
					draggable
					:allow-drop="allowDrop"
					:allow-drag="allowDrag">
					<span slot-scope="scope">
						<i
							class="el-icon-coin"
							style="
								font-weight: bold;
								padding-right: 3px;
								width: 20px;
							"></i>
						{{ scope.data.layername }}
						<el-button
							type="warning"
							class="mini"
							style="
								right: 10px;
								position: absolute;
								padding: 0.189vw 0.481vw;
							"
							@click="closeLayer(scope.data)"
							>关闭</el-button
						>
					</span>
				</el-tree>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	export { default } from "../js/onemap-sort";
</script>

<style scoped lang="scss">
	@import "../style/onemap-sort.scss";
</style>
