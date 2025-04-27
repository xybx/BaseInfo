<!--
 * @Author: WCL
 * @Date: 2022-02-16 17:05:16
 * @LastEditors: WCL
 * @LastEditTime: 2022-04-02 11:24:14
 * @FilePath: \webgis\src\components\onemap\onemap-wiki\vue\OnemapWiki.vue
 * @Description: 统一平台 - 知识库
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
			custom-class="wiki"
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
								v-if="scope.data.LEVEL == 'GROUP'"
								xlink:href="#icon-wenjianjia"
							></use>
							<use
								v-else-if="scope.data.EXT == 'pdf'"
								xlink:href="#icon-pdf"
							></use>
							<use
								v-else-if="scope.data.EXT == 'txt'"
								xlink:href="#icon-txt"
							></use>
							<use
								v-else-if="scope.data.EXT == 'docx'"
								xlink:href="#icon-docx"
							></use>
							<use
								v-else-if="scope.data.EXT == 'xlsx'"
								xlink:href="#icon-xlsx"
							></use>
							<use v-else xlink:href="#icon-wenjian"></use>
						</svg>
						{{ scope.data.LABEL
						}}<span v-if="scope.data.LEVEL == 'FILE'"
							>.{{ scope.data.EXT }}</span
						>
					</span>
				</el-tree>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/onemap-wiki'
</script>

<style scoped lang="scss">
@import '../style/onemap-wiki.scss';
</style>