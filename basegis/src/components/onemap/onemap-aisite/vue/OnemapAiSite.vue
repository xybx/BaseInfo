<template>
    <div class="">
        <el-dialog
            :title="comTitle"
            :visible.sync="dialogVisible"
            :modal="false"
            :close-on-click-modal="false"
            custom-class="aisite"
            :before-close="closeDialog"
            v-if="dialogVisible"
            v-dialogDrag
        >
            <el-form
                :inline="true"
                :model="siteForm"
                :rules="siteRules"
                class="demo-form-inline"
                size="small"
                ref="siteForm"
                hide-required-asterisk
            >
                <el-form-item label="产业类型" prop="type">
                    <el-select v-model="siteForm.type" placeholder="请选择">
                        <el-option
                            v-for="item in typeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="最低用地面积要求（亩）" prop="minarea">
                    <el-input v-model.trim="siteForm.minarea"></el-input>
                </el-form-item>
                <el-form-item label="选址方法" prop="way">
                    <el-select v-model="siteForm.way" placeholder="请选择">
                        <el-option
                            v-for="item in wayOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item
                    v-show="siteForm.way === 'multiple'"
                    label="最大地块间距（米）"
                    prop="maxspace"
                >
                    <el-input v-model.trim="siteForm.maxspace"></el-input>
                </el-form-item>
                <div class="btns">
                    <el-button type="primary" @click="handleQuery"
                        >查询</el-button
                    >
                    <el-button type="warning" @click="resetForm"
                        >清除</el-button
                    >
                </div>
            </el-form>

            <div class="res-box" v-show="showTable">
                <el-table
                    :data="tableData"
                    stripe
                    border
                    size="mini"
                    max-height="300"
                    @row-click="handleRowClick"
                    highlight-current-row
                >
                    <el-table-column
                        type="index"
                        width="80"
                        label="序号"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="area"
                        label="地块面积"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="position"
                        label="位置"
                        align="center"
                    >
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export { default } from '../js/onemap-aisite';
</script>

<style scoped lang="scss">
@import '../style/onemap-aisite.scss';
</style>
