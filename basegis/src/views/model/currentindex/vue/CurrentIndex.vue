<!--
 * @Author: WCL
 * @Date: 2022-01-12 15:25:34
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-19 16:47:07
 * @FilePath: \webgis\src\views\model\currentindex\vue\CurrentIndex.vue
 * @Description: 指标模型-现状指标
-->
<template>
    <div class="model-container">
        <div class="model-inbox">
            <div class="header-title">指标模型</div>
            <el-row>
                <!-- <el-col :span="18">
                    <el-radio-group
                        v-model="ZBRadio"
                        @change="changeZBRadio"
                        fill="#2565bc"
                    >
                        <el-radio-button
                            v-for="item in ZBRadioData"
                            :key="item.value"
                            :label="item.value"
                            >{{ item.key }}</el-radio-button
                        >
                    </el-radio-group>
                </el-col> -->
                <!-- 搜索框 -->
                <el-col :span="6">
                    <el-input
                        placeholder="请输入关键词查询"
                        v-model="searchinput"
                    >
                        <el-button
                            slot="append"
                            icon="el-icon-search"
                            @click="handleClick"
                        ></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 模型列表 -->
            <div class="md-box">
                <el-card
                    class="box-card"
                    v-for="(item, index) in spaceCardList"
                    :key="index"
                    shadow="hover"
                >
                    <div slot="header" class="clearfix head-card">
                        <span class="title">{{ item.MODELNAME }}</span>
                        <span class="date">{{ item.UPDATETIME }}</span>
                        <!-- <span class="right-tag"
                            >状态：{{
                                item.STATUS == 1
                                    ? '正常未运行'
                                    : item.STATUS == 2
                                    ? '已运行'
                                    : '运行失败'
                            }}</span
                        > -->
                        <!--秦皇岛临时修改-->
                        <span class="right-tag"
                            >状态：{{
                                item.STATUS == 1
                                    ? '运行中'
                                    : item.STATUS == 2
                                    ? '正常'
                                    : '运行失败'
                            }}</span
                        >
                    </div>
                    <div class="content">
                        <!-- {{ item.DESCRIPTION }}
                        模型值 -->
                        <!-- <div>
                            <span class="content-label">模型值：</span>
                            <span>{{
                                Boolean(item.MODELVALUE)
                                    ? item.MODELVALUE
                                    : '暂无模型值'
                            }}</span>
                        </div> -->
                        <div>
                            <span class="content-label">描述：</span>
                            <span>{{
                                Boolean(item.DESCRIPTION)
                                    ? item.DESCRIPTION
                                    : '暂无描述'
                            }}</span>
                        </div>
                    </div>
                    <!-- <div class="foot-btn">
                        <el-button
                            type="primary"
                            size="medium"
                           
                            icon="el-icon-caret-right"
                            style="float:left;"  
                            @click="handleRun(item)"
                            >运行</el-button
                        >
                        <el-button
                            size="medium"
                            icon="el-icon-view"
                            
                            style="float:left;"  
                            @click="handleDetail(item)"
                            >详情</el-button
                        >
                       
                        <el-button
                            type="info"
                            size="medium"  
                            plain
                            icon="el-icon-switch-button" 
                            style="float:right;"                        
                            @click="confirmDel(item)"
                            >注销</el-button
                        >
                    </div> -->
                </el-card>
                <el-card
                    class="box-card"
                    v-for="(item, index) in cardList"
                    :key="index"
                    shadow="hover"
                >
                    <div slot="header" class="clearfix head-card">
                        <span class="title">{{ item.MODELNAME }}</span>
                        <span class="date">{{ item.LASTRUNTIME }}</span>
                        <!-- <span class="right-tag"
                            >状态：{{
                                item.STATUS == 1
                                    ? '正常未运行'
                                    : item.STATUS == 2
                                    ? '已运行'
                                    : '运行失败'
                            }}</span
                        > -->
                         <!--秦皇岛临时修改-->
                         <span class="right-tag"
                            >状态：{{
                                item.STATUS == 1
                                    ? '运行中'
                                    : item.STATUS == 2
                                    ? '正常'
                                    : '运行失败'
                            }}</span
                        >
                    </div>
                    <div class="content">
                        <!-- {{ item.DESCRIPTION }}
                        模型值 -->
                        <!-- <div>
                            <span class="content-label">模型值：</span>
                            <span>{{
                                Boolean(item.MODELVALUE)
                                    ? item.MODELVALUE
                                    : '暂无模型值'
                            }}</span>
                        </div> -->
                        <div>
                            <span class="content-label">描述：</span>
                            <span>{{
                                Boolean(item.DESCRIPTION)
                                    ? item.DESCRIPTION
                                    : '暂无描述'
                            }}</span>
                        </div>
                    </div>
                    <!-- <div class="foot-btn">
                        <el-button
                            type="primary"
                            size="medium"
                           
                            icon="el-icon-caret-right"
                            style="float:left;"  
                            @click="handleRun(item)"
                            >运行</el-button
                        >
                        <el-button
                            size="medium"
                            icon="el-icon-view"
                            
                            style="float:left;"  
                            @click="handleDetail(item)"
                            >详情</el-button
                        >
                        
                        <el-button
                            type="info"
                            size="medium"  
                            plain
                            icon="el-icon-switch-button" 
                            style="float:right;"                        
                            @click="confirmDel(item)"
                            >注销</el-button
                        >
                    </div> -->
                </el-card>
            </div>
            <el-pagination
                background
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-size="pagesize"
                layout="total, prev, pager, next, jumper"
                :total="cardTotal"
            >
            </el-pagination>
        </div>

        <!-- 详情表单 -->
        <el-dialog
            title="指标模型"
            :visible.sync="SLVisible"
            :close-on-click-modal="false"
            custom-class="addSLdialog"
            @closed="closeSL"
            width="30%"
            v-dialogDrag
        >
            <el-form
                :model="SLForm"
                ref="SLForm"
                size="small"
                label-width="auto"
            >
                <el-form-item label="模型类型" prop="modeltype">
                    <el-select
                        v-model="SLForm.modeltype"
                        placeholder="请选择模型类型"
                        disabled
                    >
                        <el-option
                            v-for="item in modelList"
                            :key="item.id"
                            :label="item.label"
                            :value="item.id"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="行政区" prop="xzqbm">
                    <el-input v-model="SLForm.xzqmc" readonly></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="funclass">
                    <el-input v-model="SLForm.funclass" readonly></el-input>
                </el-form-item>
                <el-form-item label="一级分类" prop="firstflid">
                    <el-input v-model="SLForm.firstflid" readonly></el-input>
                </el-form-item>
                <el-form-item label="二级分类" prop="secondflid">
                    <el-input v-model="SLForm.secondflid" readonly></el-input>
                </el-form-item>
                <el-form-item
                    label="模型名称"
                    class="mxname-item"
                    prop="modelname"
                >
                    <el-input v-model="SLForm.modelname" readonly></el-input>
                    <el-form-item prop="year" class="year-item">
                        <el-date-picker
                            v-model="SLForm.year"
                            ref="date"
                            type="year"
                            placeholder="年份"
                            class="year"
                            format="yyyy"
                            value-format="yyyy"
                            readonly
                        >
                        </el-date-picker>
                    </el-form-item>
                </el-form-item>
                <el-form-item label="编号" prop="modelcode">
                    <el-input v-model="SLForm.modelcode" readonly></el-input>
                </el-form-item>
                <el-form-item v-if="showZBItem" :label="ZBMainName">
                    <el-table
                        stripe
                        border
                        size="mini"
                        ref="selectZBData"
                        v-show="selectZBData.length > 0"
                        :data="selectZBData"
                        highlight-current-row
                        class="one-table"
                    >
                        <el-table-column
                            property="ZBNAME"
                            label="指标名称"
                        ></el-table-column>
                        <el-table-column
                            property="DSNAME"
                            label="数据源"
                        ></el-table-column>
                        <el-table-column
                            property="ZBFEATURECLASS"
                            label="要素类"
                        ></el-table-column>
                    </el-table>
                </el-form-item>

                <el-form-item v-if="showZBItem" :label="ZBSubName">
                    <el-table
                        stripe
                        border
                        size="mini"
                        ref="selectZBSubData"
                        v-show="selectZBSubData.length > 0"
                        :data="selectZBSubData"
                        highlight-current-row
                        class="one-table"
                    >
                        <el-table-column
                            property="ZBNAME"
                            label="指标名称"
                        ></el-table-column>
                        <el-table-column
                            property="DSNAME"
                            label="数据源"
                        ></el-table-column>
                        <el-table-column
                            property="ZBFEATURECLASS"
                            label="要素类"
                        ></el-table-column>
                    </el-table>
                </el-form-item>
                <el-form-item label="模型值" prop="modelvalue">
                    <el-input
                        v-model="SLForm.modelvalue"
                        autocomplete="off"
                        placeholder="请输入模型值"
                        readonly
                    ></el-input>
                </el-form-item>
                 <el-form-item label="模型单位" prop="modelunit">
                    <el-input
                        v-model="SLForm.modelunit"
                        autocomplete="off"
                        placeholder="模型单位"
                        readonly
                    ></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input
                        v-model="SLForm.description"
                        type="textarea"
                        placeholder="请输入描述"
                        readonly
                    ></el-input>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
export { default } from '../js/currentindex';
</script>

<style scoped lang="scss">
@import '../style/currentindex.scss';
</style>
