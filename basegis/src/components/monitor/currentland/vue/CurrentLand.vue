<!--
 * @Author: WCL
 * @Date: 2022-01-13 15:34:42
 * @LastEditors: WCL
 * @LastEditTime: 2022-05-06 17:50:26
 * @FilePath: \webgis\src\components\monitor\currentland\vue\CurrentLand.vue
 * @Description: 现状用地-查看详细
-->
<template>
    <el-dialog
        title="详细信息"
        :visible.sync="dialogCurrent"
        width="70%"
        :close-on-click-modal="false"
        :before-close="closeCurrent"
        custom-class="modetail"
    >
        <div class="modetail-container">
            <el-row>
                <el-col :span="6">
                    <el-card class="left-card" shadow="hover">
                        <div>
                            <el-tree
                                ref="treeData"
                                node-key="value"
                                :data="treeData"
                                :props="defaultProps"
                                icon-class="el-icon-caret-bottom"
                                highlight-current
                                default-expand-all
                                :expand-on-click-node="false"
                                @node-click="treeClick"
                            ></el-tree>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="18">
                    <div class="top-box">
                        <el-card shadow="hover" class="top-chart">
                            <div slot="header" class="clearfix">
                                <span>{{ headLabel }}</span>
                            </div>
                            <div style="height: 100%" id="line-chart"></div>
                        </el-card>
                    </div>
                </el-col>
            </el-row>
            
        </div>
        <div class="modetail-container">
            <el-row>
                <el-col :span="6">
                    <el-card class="left-card" shadow="hover">
                        <div>
                            <el-tree
                            ref="treeDataYear"
                                :data="treeDataYear"
                                :props="defaultProps"
                                icon-class="el-icon-caret-bottom"
                                highlight-current
                                default-expand-all
                                node-key="value"
                                :expand-on-click-node="false"
                                @node-click="treeClickYear"
                            ></el-tree>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="18">
                    <div class="top-box">
                        <el-card shadow="hover" class="top-chart">
                            <div slot="header" class="clearfix">
                                <span>{{ headLabelYear }}</span>
                            </div>
                            <div style="height: 100%" id="year-chart"></div>
                        </el-card>
                    </div>
                </el-col>
            </el-row>
            
        </div>
    </el-dialog>
</template>

<script>
export { default } from '../js/currentland';
</script>

<style scoped lang="scss">
@import '../style/currentland.scss';
</style>
