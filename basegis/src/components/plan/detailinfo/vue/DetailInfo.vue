<!--
 * @Author: WCL
 * @Date: 2022-01-04 13:47:10
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-16 11:15:56
 * @FilePath: \webgis\src\components\plan\detailinfo\vue\DetailInfo.vue
 * @Description: 项目-详细信息
-->
<template>
    <el-dialog
        title="编辑阶段信息"
        :visible.sync="dialogInfo"
        width="90%"
        :close-on-click-modal="false"
        :before-close="closePlanUser"
        custom-class="plan-user"
        v-dialogDrag
    >
        <div class="user-container">
            <el-container>
                <el-main>
                    <el-row :gutter="20" class="info-header">
                        <el-col :span="10" class="title-info">
                            <span
                                >{{ baseInfo.project.PRJNAME }}-{{
                                    baseInfo.project.TYPEID === 1
                                        ? "总体规划"
                                        : "专项规划"
                                }}-{{ baseInfo.jd.JDNAME }}</span
                            >
                        </el-col>
                        <el-col :span="14" v-show="!showBtn">
                            <span
                                style="
                                    color: #999;
                                    float: right;
                                    margin-left: 20px;
                                "
                                >创建时间：{{ baseInfo.jd.CREATETIME }}</span
                            >
                            <span style="color: #999; float: right"
                                >更新时间：{{ baseInfo.jd.UPDATETIME }}</span
                            >
                        </el-col>
                        <el-col :span="14" class="left-btns" v-show="showBtn">
                            <div class="left">
                                <el-button
                                    type="primary"
                                    round
                                    size="small"
                                    icon="el-icon-download"
                                    @click="downTemplate"
                                >
                                    上位指标模板下载
                                </el-button>
                                <el-upload
                                    class="tem-upload"
                                    ref="temUpload"
                                    action="action"
                                    :http-request="temUpload"
                                    :show-file-list="false"
                                    accept=".xlsx"
                                >
                                    <el-button
                                        type="primary"
                                        round
                                        size="small"
                                        icon="el-icon-finished"
                                    >
                                        导入上位指标
                                    </el-button>
                                </el-upload>
                            </div>
                            <div class="right">
                                <el-button
                                    type="primary"
                                    size="small"
                                    style="width: 100%"
                                    @click="updateInfo"
                                >
                                    保存
                                </el-button>
                            </div>
                        </el-col>
                    </el-row>
                    <el-divider></el-divider>
                    <div
                        class="userform-box"
                        v-loading="zbLoading"
                        element-loading-text="指标项加载中"
                    >
                        <el-form
                            :inline="true"
                            :model="userForm"
                            class="demo-form-inline"
                            size="small"
                        >
                            <el-col class="form-top">
                                <!-- <el-form-item v-for="item in userTopList" :key="item.id" :label="item.name">
																		<el-input v-model="ghbzTop[item.prop]" :disabled="!showBtn"></el-input>
																	</el-form-item> -->

                                <el-form-item label="审查轮次">
                                    <el-input
                                        v-model="ghbzTop.SC_NUMDESC"
                                        autocomplete="off"
                                        size="small"
                                        :disabled="!showBtn"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item label="组织单位">
                                    <el-input
                                        v-model="ghbzTop.BZUNIT"
                                        autocomplete="off"
                                        size="small"
                                        :disabled="!showBtn"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item label="委托单位">
                                    <el-input
                                        v-model="ghbzTop.WTUNIT"
                                        autocomplete="off"
                                        size="small"
                                        :disabled="!showBtn"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item label="委托部门">
                                    <el-input
                                        v-model="ghbzTop.WTDEPT"
                                        autocomplete="off"
                                        size="small"
                                        :disabled="!showBtn"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item label="规划面积">
                                    <el-input
                                        v-model="ghbzTop.GHAREA"
                                        autocomplete="off"
                                        size="small"
                                        :disabled="!showBtn"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item label="规划范围">
                                    <el-input
                                        v-model="ghbzTop.GHFW"
                                        autocomplete="off"
                                        size="small"
                                        type="textarea"
                                        :disabled="!showBtn"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item label="项目简介">
                                    <el-input
                                        v-model="ghbzTop.PROJECTINTRO"
                                        autocomplete="off"
                                        size="small"
                                        type="textarea"
                                        :disabled="!showBtn"
                                    ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col style="height: 15px"> </el-col>
                            <el-col class="title-info"> 上位指标列表 </el-col>
                            <el-col>
                                <el-divider></el-divider>
                            </el-col>
                            <el-col
                                class="form-bottom"
                                v-if="userBottomList.length > 0"
                            >
                                <el-form-item
                                    v-for="item in userBottomList"
                                    :key="item.PID"
                                    :label="item.ZBNAME"
                                >
                                    <el-input
                                        v-model="item.ZBVALUE"
                                        :disabled="!showBtn"
                                    ></el-input>
                                    <span> {{ item.ZBUNIT }} </span>
                                </el-form-item>
                            </el-col>
                            <el-col v-else>
                                <div>暂未上传上位指标数据</div>
                            </el-col>
                        </el-form>
                    </div>
                </el-main>
                <el-aside>
                    <div class="header">
                        <span class="title"> 成果目录 </span>

                        <el-upload
                            class="upload"
                            ref="upload"
                            action="action"
                            :http-request="handleZIPUpload"
                            accept=".zip"
                            :show-file-list="false"
                            v-show="showBtn"
                        >
                            <el-button
                                type="primary"
                                size="small"
                                title="更新成果包会替换掉原来的成果包，成果包必须是zip文件"
                                plain
                                >更新成果包</el-button
                            >
                        </el-upload>

                        <!-- <el-button size="small" type="primary" v-show="showBtn"
																		>上传</el-button -->
                    </div>
                    <el-divider></el-divider>
                    <div>
                        <el-tree
                            class="layer-tree"
                            :data="treeList"
                            node-key="ID"
                            :render-after-expand="false"
                            ref="tree"
                            :default-expanded-keys="[1]"
                            :highlight-current="true"
                            :expand-on-click-node="false"
                            empty-text=""
                            v-loading="fileTreeLoading"
                            element-loading-text="成果目录加载中"
                            @node-click="fileClick"
                            :props="defaultProps"
                        >
                            <span slot-scope="scope" class="scope-class">
                                <span>
                                    <svg class="icon" aria-hidden="true">
                                        <use
                                            :xlink:href="
                                                scope.data.FILETYPE == 1
                                                    ? '#icon-wenjianjia'
                                                    : '#icon-wenjian'
                                            "
                                        ></use>
                                    </svg>
                                    {{ scope.data.LABEL }}
                                </span>
                                <span class="handle-btns">
                                    <el-upload
                                        class="upload"
                                        ref="upload"
                                        action="action"
                                        :http-request="handleUpload"
                                        :file-list="fileList"
                                        :show-file-list="false"
                                        v-show="
                                            showBtn && scope.data.FILETYPE == 1
                                        "
                                    >
                                        <el-button
                                            type="text"
                                            size="mini"
                                            @click="handleAdd(scope)"
                                        >
                                            添加
                                        </el-button>
                                    </el-upload>

                                    <el-button
                                        type="text"
                                        size="mini"
                                        @click="() => remove(scope)"
                                        v-show="showBtn"
                                    >
                                        删除
                                    </el-button>
                                </span>
                            </span>
                        </el-tree>
                    </div>
                    <div
                        v-if="showTree"
                        style="text-align: center; color: #999"
                    >
                        暂无数据
                    </div>
                </el-aside>
            </el-container>
        </div>
    </el-dialog>
    <!-- <el-dialog>
							<iframe src="http://www.baidu.com" frameborder="0" width="100%" height="600px"></iframe>
						</el-dialog> -->
</template>

<script>
export { default } from "../js/detailinfo";
</script>

<style scoped lang="scss">
@import "../style/detailinfo.scss";
</style>
