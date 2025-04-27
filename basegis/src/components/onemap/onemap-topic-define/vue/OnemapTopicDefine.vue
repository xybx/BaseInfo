<!--
 * @Author: WCL
 * @Date: 2021-12-13 10:00:17
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:20:14
 * @FilePath: \webgis\src\components\onemap\onemap-topic-define\vue\OnemapTopicDefine.vue
 * @Description: 专题图 - 自定义制图
-->
<template>
    <div class="">
        <el-dialog
            :title="comTitle"
            :visible.sync="dialogVisible"
            custom-class="define"
            :before-close="closeDialog"
            :close-on-click-modal="false"
            v-if="dialogVisible"
        >
            <div class="define-main">
                <div class="legend">
                    <el-form
                        ref="form"
                        :model="defineForm"
                        label-width="auto"
                        class="define-form"
                        :rules="rules"
                        hide-required-asterisk
                        size="mini"
                    >
                        <el-form-item label="标题" prop="title">
                            <el-input
                                v-model="defineForm.title"
                                placeholder="请输入标题"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="比例尺" prop="scale2">
                            <el-col :span="5">
                                <el-input
                                    v-model="defineForm.scale1"
                                    readonly
                                ></el-input>
                            </el-col>
                            <el-col class="line" :span="2">:</el-col>
                            <el-col :span="17">
                                <el-input
                                    @input="changeScale2"
                                    v-model.number="defineForm.scale2"
                                    placeholder="请输入比例"
                                ></el-input>
                            </el-col>
                        </el-form-item>
                        <el-form-item
                            label="DPI"
                            prop="dpi"
                            v-show="MapPrintMode == 'print'"
                        >
                            <el-select
                                v-model="defineForm.dpi"
                                placeholder="请选择dpi"
                            >
                                <el-option label="96" value="96"></el-option>
                                <el-option label="200" value="200"></el-option>
                                <el-option label="300" value="300"></el-option>
                                <el-option label="400" value="400"></el-option>
                                <el-option label="600" value="600"></el-option>
                                <el-option label="800" value="800"></el-option>
                                <el-option label="900" value="900"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="打印纸张" prop="paperType">
                            <el-select
                                v-model="defineForm.papertype"
                                placeholder="请选择纸张类型"
                                @change="choosePaperType"
                            >
                                <el-option
                                    label="A4横版"
                                    value="A4横版"
                                ></el-option>
                                <el-option
                                    label="A4竖版"
                                    value="A4竖版"
                                ></el-option>
                                <el-option
                                    label="A3横版"
                                    value="A3横版"
                                ></el-option>
                                <el-option
                                    label="A3竖版"
                                    value="A3竖版"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="制图时间" prop="date">
                            <el-date-picker
                                type="date"
                                placeholder="请选择日期"
                                v-model="defineForm.date"
                                style="width: 100%"
                                value-format="yyyy-MM-dd"
                            ></el-date-picker>
                        </el-form-item>
                        <el-form-item label="制图单位" prop="unit">
                            <el-input
                                v-model="defineForm.unit"
                                placeholder="请输入制图单位"
                            ></el-input>
                        </el-form-item>
                        <div class="label-module">
                            <el-form-item
                                label="标注类型"
                                prop="labeltype"
                                class="labeltype"
                            >
                                <el-radio-group
                                    v-model="defineForm.labeltype"
                                    @change="labelChange"
                                >
                                    <el-radio
                                        v-for="(item, index) in labeltypeList"
                                        :key="index"
                                        :label="item.type"
                                    >
                                        <el-upload
                                            v-if="item.type == 'import'"
                                            class="uploadFile"
                                            ref="uploadFile"
                                            action="action"
                                            :http-request="uploadFile"
                                            :show-file-list="false"
                                            accept=".dwg,.txt,.zip"
                                        >
                                            <div class="label-item">
                                                <span
                                                    class="iconfont"
                                                    :class="item.icon"
                                                ></span>
                                                <span>{{ item.text }}</span>
                                            </div>
                                        </el-upload>
                                        <div class="label-item" v-else>
                                            <span
                                                class="iconfont"
                                                :class="item.icon"
                                            ></span>
                                            <span>{{ item.text }}</span>
                                        </div>
                                    </el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-table
                                :data="tableData"
                                border
                                size="mini"
                                stripe
                                @select="selectRow"
                                ref="geoTable"
                            >
                                <el-table-column type="selection" width="55">
                                </el-table-column>
                                <el-table-column
                                    prop="name"
                                    label="名称"
                                    align="center"
                                >
                                </el-table-column>
                                <el-table-column label="操作" align="center">
                                    <template v-slot="scope">
                                        <el-button
                                            type="primary"
                                            size="mini"
                                            plain
                                            @click="delRow(scope.row)"
                                            >删除</el-button
                                        >
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <div class="btns">
                            <el-button
                                type="primary"
                                size="small"
                                class="creat-pic"
                                @click="onSubmit"
                                >导出专题</el-button
                            >
                        </div>
                    </el-form>
                </div>
                <div class="map" id="define_zttmap" :class="verticalClass">
                    <div class="border_corner border_corner_left_top"></div>
                    <div class="border_corner border_corner_right_top"></div>
                    <div class="border_corner border_corner_left_bottom"></div>
                    <div class="border_corner border_corner_right_bottom"></div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export { default } from "../js/onemap-topic-define";
</script>

<style scoped lang="scss">
@import "../style/onemap-topic-define.scss";
</style>
