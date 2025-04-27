<!--
 * @Author: WCL
 * @Date: 2022-01-14 14:39:55
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-09 13:38:26
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\evalindex\vue\EvalIndex.vue
 * @Description: 实施监督-定期评估-评估指标
-->
<template>
	<div class="">
		<el-row :gutter="10" class="eval-row">
			<el-col :span="18" class="left-form">
				<el-col class="pg-year">
					<div>
						评估年份(体系)
						<el-radio-group v-model="PGRadio" @change="changePGRadio" fill="#2565bc">
							<el-radio-button v-for="(item, index) in PGRadioData" :key="index" :label="item">{{ item
							}}</el-radio-button>
						</el-radio-group>
						<!-- <el-popover trigger="click" ref="yearPopover">
							<el-date-picker
								v-model="dateYear"
								type="year"
								placeholder="选择年"
								value-format="yyyy"
								@change="changeYear"
							>
							</el-date-picker>
							<el-button
								icon="el-icon-plus"
								type="primary"
								plain
								slot="reference"
								>添加年份</el-button
							>
						</el-popover> -->
					</div>
				</el-col>
				<el-col class="form-col">
					<div class="pg-radiobox">
						指标类型
						<el-radio-group v-model="GHRadio" @change="changeTYPERadio" fill="#2565bc">
							<el-radio-button v-for="item in GHRadioData" :key="item.PID" :label="item">{{ item.NAME
							}}</el-radio-button>
						</el-radio-group>
						<div style="position: absolute;right: 30%;display:inline;">
							<el-upload style="display:inline;padding: 5px;" class="tem-upload" ref="tempUpload"
								action="action" :http-request="tempUpload" :show-file-list="false" accept=".xlsx">
								<el-button type="success" size="small" icon="el-icon-upload2">
									导入数据
								</el-button>
							</el-upload>
							<el-button type="success" size="small" icon="el-icon-download" @click="downTemplate">
								导出数据
							</el-button>
						</div>
						<!-- <el-button type="success" style="position: absolute;right: 35%;">导入指标值</el-button> -->
						<!-- <a style="position: absolute;right: 30%;color: green;cursor: pointer;padding-top: 10px;"
							@click="downTemplate">下载导入模板</a> -->
					</div>
					<el-form v-if="evalBox.length > 0" :inline="true" :model="userForm" class="demo-form-inline"
						v-loading="formLoading" element-loading-text="加载指标项中">
						<el-col class="form-bottom" v-for="(item, index) in evalBox" :key="index">
							<div class="eval-label" v-if="item.TYPE.NAME">
								{{ item.TYPE.NAME }}
							</div>
							<el-form-item v-for="subItem in item.ZBITEMS" :key="subItem.PID" :label="subItem.NAME"
								prop="model">
								<el-input v-model="subItem.ZBVALUE" placeholder="请输入"></el-input>
								<span>
									{{ subItem.UNIT }}
								</span>
							</el-form-item>
						</el-col>
						<el-col class="btn-box">
							<el-button type="primary" size="medium" @click="saveData(PGRadio)">保存数据</el-button>
						</el-col>
					</el-form>
					<div v-else style="text-align: center;font-size: 20px;">暂无指标数据!</div>
				</el-col>
			</el-col>
			<el-col :span="6">
				<el-card class="right-card" shadow="never">
					<div slot="header" class="header-box">
						<span class="title">文件列表</span>

						<el-upload class="fileUpload" ref="fileUpload" action="action" :http-request="handleFileUpload"
							:show-file-list="false" accept=".zip">
							<el-button type="primary" size="small">
								上传
							</el-button>
						</el-upload>
					</div>
					<div>
						<el-tree :data="treeList" :props="defaultProps" highlight-current v-loading="treeLoading"
							class="layer-tree" @node-click="fileClick">
							<span slot-scope="scope" class="scope-class">
								<span>
									<svg class="icon" aria-hidden="true">
										<use :xlink:href="scope.data.FILETYPE == 1
												? '#icon-wenjianjia'
												: '#icon-wenjian'
											"></use>
									</svg>
									{{ scope.data.LABEL }}
								</span>
							</span>
						</el-tree>
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
export { default } from '../js/evalindex'
</script>

<style scoped lang="scss">
@import '../style/evalindex.scss';
</style>