<!--
 * @Author: WCL
 * @Date: 2021-11-30 16:47:28
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-22 09:54:15
 * @FilePath: \webgis\src\components\onemap\onemap-paper\vue\OnemapPaper.vue
 * @Description: 一张图-叠加图纸
-->
<template>
    <div class="">
        <el-dialog
            :title="comTitle"
            :visible.sync="dialogVisible"
            custom-class="tuzhi"
            :modal="false"
            :close-on-click-modal="false"
            :before-close="closeDialog"
            v-if="dialogVisible"
            v-dialogDrag
        >
            <div class="import-box">
                <div class="import-title">
                    <i class="el-icon-caret-right"></i>
                    选择文件上传
                </div>
                <el-upload
                    class="upload"
                    ref="upload"
                    action="action"
                    :show-file-list="false"
                    :http-request="handleUpload"
                    accept=".dwg,.zip,.rar,.txt"
                >
                    <el-button slot="trigger" size="mini" type="success"
                        >导入文件</el-button
                    >
                    <el-button
                        class="render-btn"
                        size="mini"
                        type="warning"
                        @click="renderRange"
                        >绘制范围</el-button
                    >
                    <el-popover
                        placement="right-start"
                        title="上传文件注意事项"
                        popper-class="popover"
                        trigger="hover"
                    >
                        <div class="tips">
                            <div>
                                支持导入Shape（需将Shape打包成压缩包 zip 或
                                rar）、CAD、TXT（<span
                                    class="link-template"
                                    @click="downTemplate"
                                    >模板下载</span
                                >）文件
                            </div>
                        </div>
                        <span slot="reference">
                            <i class="el-icon-info"></i>
                            注意事项
                        </span>
                    </el-popover>
                </el-upload>
                <el-table :data="tableData" border stripe size="mini">
                    <el-table-column prop="name" label="名称" align="center">
                    </el-table-column>
                    <el-table-column
                        prop="area"
                        label="面积(平方米)"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        label="操作"
                        align="center"
                        min-width="150"
                    >
                        <template v-slot="scope">
                            <el-link
                                @click="handleLocate(scope.row)"
                                type="primary"
                            >
                                <i class="iconfont icon-dingwei1"></i>定位
                            </el-link>
                            <el-link
                                @click="handleEdit(scope.row)"
                                type="primary"
                            >
                                <i class="el-icon-edit"></i>编辑
                            </el-link>
                            <el-link
                                @click="handleExport(scope.row)"
                                type="primary"
                            >
                                <i class="el-icon-receiving"></i>导出
                            </el-link>
                            <el-link
                                @click="handleDelete(scope.row)"
                                type="danger"
                            >
                                <i class="el-icon-delete"></i>删除
                            </el-link>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export { default } from '../js/onemap-paper';
</script>

<style scoped lang="scss">
@import '../style/onemap-paper.scss';
</style>
