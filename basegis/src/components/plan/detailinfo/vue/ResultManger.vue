<!--
 * @Author: WCL
 * @Date: 2022-01-04 13:47:10
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-16 11:15:56
 * @FilePath: \webgis\src\components\plan\detailinfo\vue\DetailInfo.vue
 * @Description: 项目-详细信息
-->
<template>
	<el-dialog title="成果目录管理" :visible.sync="resultInfo" width="90%" height="90%" :close-on-click-modal="false"
	:before-close="closePlanUser" custom-class="plan-user" v-dialogDrag :modal="false" top="15vh">
		<div class="user-container">
			<el-container>
				<el-aside>
					<div class="header">
						<span class="title"> 成果目录 </span>
						<!-- <el-button size="small" type="primary" v-show="showBtn"
																>上传</el-button
															> -->
					</div>
					<el-divider></el-divider>
					<div>
						<el-tree class="layer-tree" :data="treeList" node-key="ID" :render-after-expand="false" ref="tree"
							:default-expanded-keys="[1]" :highlight-current="true" :expand-on-click-node="false"
							empty-text="" v-loading="fileTreeLoading" element-loading-text="成果目录加载中" @node-click="fileClick"
							:props="defaultProps">
							<span slot-scope="scope" class="scope-class">
								<span>
									<svg class="icon" aria-hidden="true">
										<use :xlink:href="
											scope.data.FILETYPE == 1
												? '#icon-wenjianjia'
												: '#icon-wenjian'
										"></use>
									</svg>
									{{ scope.data.LABEL }}
								</span>
								<span class="handle-btns">
									<el-upload class="upload" ref="upload" action="action" :http-request="handleUpload"
										:file-list="fileList" :show-file-list="false" v-show="
											showBtn && scope.data.FILETYPE == 1
										">
										<el-button type="text" size="mini" @click="handleAdd(scope)">
											添加
										</el-button>
									</el-upload>

									<el-button type="text" size="mini" @click="() => remove(scope)" v-show="showBtn">
										删除
									</el-button>
								</span>
							</span>
						</el-tree>
					</div>
					<div v-if="showTree" style="text-align: center; color: #999">
						暂无数据
					</div>
				</el-aside>
				<div style="width: 100%;height: 100%;text-align: center;margin-top: 15%;font-size: large;" v-if="iframeSrc == ''">
					请点击左侧目录树的文件，进行文件在线浏览
				</div>
			<iframe :src="iframeSrc" v-else frameborder="0" width="100%" height="100%">

				</iframe>
			</el-container>
		</div>

	</el-dialog>
	<!-- <el-dialog>
					<iframe src="http://www.baidu.com" frameborder="0" width="100%" height="600px"></iframe>
				</el-dialog> -->
</template>

<script>
export { default } from '../js/resultManger'
</script>

<style scoped lang="scss">
@import '../style/resultManger';
</style>
