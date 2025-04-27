<template>
    <div class="container">
        <div class="tree">
            <div class="tree-left">
                <el-menu default-active="1" class="el-menu1">
                    <el-menu-item
                        v-for="item in menuList"
                        :key="item.ID"
                        :index="String(item.ID)"
                        @click="clickMenu(item)"
                    >
                        <i class="el-icon-menu"></i>
                        <span slot="title">{{ item.Name }}</span>
                    </el-menu-item>
                </el-menu>
            </div>
        </div>
        <div
            class="tree-right"
            v-show="!isMapData"
            style="border-right: 1px solid #e6e6e6"
        >
            <div class="cont-head">{{ currType }}</div>
            <el-tree
                :data="treeData"
                :props="defaultProps"
                @node-click="handleClickTree"
                :expand-on-click-node="false"
                default-expand-all
            >
                <span slot-scope="scope" class="tree-scope">
                    <span v-if="scope.node.level == 2">
                        <i
                            v-if="scope.data.Pass == 1"
                            class="el-icon-warning"
                        ></i>
                        <i v-else class="el-icon-remove"></i>
                    </span>
                    {{ scope.data.Name }}
                </span>
            </el-tree>
        </div>
        <div class="map-box" v-show="!isMapData">
            <div class="map" id="map"></div>
            <div class="attr-box" v-show="showAttr">
                <!-- <div class="attr-table-box" v-show="isTable">
                    <div class="text-head">审查结论</div>
                    <el-table
                        :data="attrTable"
                        border
                        stripe
                        height="250"
                        @row-click="handleTableRow"
                    >
                        <el-table-column prop="id" label="序号" align="center">
                        </el-table-column>
                        <el-table-column
                            prop="mj"
                            label="突破图斑（平方米）"
                            align="center"
                        >
                        </el-table-column>
                    </el-table>
                </div>

                <div v-show="!isTable" class="attr-text">
                    <div class="text-head">审查结论</div>
                    {{ attrText }}
                </div> -->

                <div class="text-head">审查结论</div>
                <div class="attr-text">{{ attrText }}</div>
                <el-table
                    :data="zbData"
                    border
                    stripe
                    max-height="250"
                    @row-click="handleTableRow"
                >
                    <el-table-column
                        prop="GHVALUE"
                        :label="ColumnsOneTitle"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="XZVALUE"
                        :label="ColumnsTwoTitle"
                        align="center"
                    >
                        <template slot-scope="scope">
                            {{ scope.row.XZVALUE }}
                            <i
                                class="icon"
                                :class="
                                    Number(scope.row.XZVALUE) >
                                    Number(scope.row.GHVALUE)
                                        ? 'up-arrows'
                                        : 'down-arrows'
                                "
                                v-if="scope.row.GHVALUE && scope.row.XZVALUE"
                            ></i>
                        </template>
                    </el-table-column>
                </el-table>
                <br />
                <el-table
                    v-if="showLayerTable"
                    :data="attrTable"
                    border
                    stripe
                    max-height="250"
                    @row-click="handleTableRow"
                >
                    <el-table-column prop="id" label="序号" align="center">
                    </el-table-column>
                    <el-table-column
                        prop="mj"
                        label="图斑面积（平方米）"
                        align="center"
                    >
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div class="map-box" v-show="isMapData" style="margin: 10px">
            <div style="height: 40%; width: 100%;position:absolute;">
                <el-table
                    :data="tableData"
                    border
                    stripe
                    v-loading="loading"
                    size="small"
                    max-height="400"
                >
                    <el-table-column
                        prop="ZBNAME"
                        label="指标名称"
                        min-width="200"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="ZBVALUE"
                        label="规划数值"
                        min-width="200"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="MAPVALUE"
                        label="图上数值"
                        min-width="300"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="ZBUNIT"
                        label="单位"
                        min-width="200"
                        align="center"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="RESULT"
                        label="一致性"
                        min-width="200"
                        align="center"
                    >
                    </el-table-column>
                </el-table>
            </div>
            <div style="height: 50%; width: 100%;position:absolute;top:50%;">
                <div style="height: 100%; width: 50%;float:left;">
                    <Chart chartId="chart1" :chartOption="chart1Option"></Chart>
                </div>
                <div style="height: 100%; width: 40%;float:left;">
                    <Chart chartId="chart2" :chartOption="chart2Option"></Chart>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export { default } from "../js/spaceaccess";
</script>

<style scoped lang="scss">
@import "../style/spaceaccess.scss";
</style>
