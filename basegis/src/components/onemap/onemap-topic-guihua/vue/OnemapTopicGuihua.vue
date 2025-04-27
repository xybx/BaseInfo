<!--
 * @Author: WCL
 * @Date: 2021-12-03 09:15:31
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:20:49
 * @FilePath: \webgis\src\components\onemap\onemap-topic-guihua\vue\OnemapTopicGuihua.vue
 * @Description: 专题图-规划制作
-->
<template>
    <div class="">
        <el-dialog
            :title="comTitle"
            :visible.sync="dialogVisible"
            custom-class="guihua"
            :before-close="closeDialog"
            :close-on-click-modal="false"
            v-if="dialogVisible"
        >
            <div class="guihua-main">
                <div class="legend">
                    <el-form
                        ref="form"
                        :model="guihuaForm"
                        label-width="auto"
                        class="guihua-form"
                        :rules="rules"
                        hide-required-asterisk
                        size="small"
                    >
                        <el-form-item label="标题" prop="title">
                            <el-input
                                v-model="guihuaForm.title"
                                placeholder="请输入标题"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="比例尺" prop="scale2">
                            <el-col :span="5">
                                <el-input
                                    v-model="guihuaForm.scale1"
                                    readonly
                                ></el-input>
                            </el-col>
                            <el-col class="line" :span="2">:</el-col>
                            <el-col :span="17">
                                <el-input
                                    @input="changeScale2"
                                    v-model.number="guihuaForm.scale2"
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
                                v-model="guihuaForm.dpi"
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
                                v-model="guihuaForm.paperType"
                                placeholder="请选择纸张类型"
                            >
                                <el-option label="A3" value="A3"></el-option>
                                <el-option label="A4" value="A4"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="制图时间" prop="date">
                            <el-date-picker
                                type="date"
                                placeholder="请选择日期"
                                v-model="guihuaForm.date"
                                style="width: 100%"
                                value-format="yyyy-MM-dd"
                            ></el-date-picker>
                        </el-form-item>

                        <div class="btns">
                            <el-upload
                                class="upload"
                                ref="upload"
                                action="action"
                                :on-success="handleSuccess"
                                :http-request="handleUpload"
                                accept=".dwg"
                            >
                                <el-button
                                    size="small"
                                    type="primary"
                                    slot="trigger"
                                    >上传红线</el-button
                                >
                                <el-button
                                    type="primary"
                                    size="small"
                                    class="creat-pic"
                                    @click="onSubmit"
                                    >生成地块规划图</el-button
                                >
                            </el-upload>
                        </div>
                    </el-form>
                </div>
                <div class="map" id="zttmap_gh" :class="verticalClass">
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
export { default } from "../js/onemap-topic-guihua";
</script>

<style scoped lang="scss">
@import "../style/onemap-topic-guihua.scss";
</style>
