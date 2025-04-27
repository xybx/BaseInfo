<!--
 * @Author: WCL
 * @Date: 2021-11-16 10:00:02
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 16:34:05
 * @FilePath: \webgis\src\views\onemap\vue\OneMap.vue
 * @Description: 一张图主页
-->
<template>
    <el-container>
        <div
            class="treeBtn"
            :class="showTree == false ? 'closeStatus' : ''"
            @click="handleShowTree"
        >
            <i
                :class="
                    showTree == true
                        ? 'el-icon-arrow-left'
                        : 'el-icon-arrow-right'
                "
            ></i>
        </div>
        <el-aside class="layer-aside" v-show="showTree" id="layerAside">
            <div class="search-box">
                <el-tabs v-model="focusTab">
                    <!--@tab-click="tabclick"-->
                    <el-tab-pane label="常用图层" name="often">
                        <el-input
                            placeholder="输入关键字进行搜索"
                            v-model="filterOftenText"
                            size="small"
                        >
                        </el-input>
                        <!-- <button @click="resetChecked">清空</button> -->
                        <!-- 列表 -->
                        <layer-tree
                            class="layer-tree"
                            :data="treeOftenList"
                            empty-text="暂无数据"
                            v-loading="oftenLoading"
                            element-loading-text="列表加载中"
                            element-loading-spinner="el-icon-loading"
                            show-checkbox
                            :render-after-expand="false"
                            :props="defaultProps"
                            ref="treeOften"
                            @check-change="changeSlider"
                            :highlight-current="true"
                            :filter-node-method="filterNode"
                            lazy
                            :load="nodeClick"
                            draggable
                            @node-drag-start="handleDragStart"
                            @node-drag-end="handleDragEnd"
                        >
                            <span slot-scope="scope">
                                <span class="label-style">
                                    {{ scope.node.label }}
                                    <span
                                        v-if="
                                            scope.data.childlist &&
                                            scope.data.childlist != 0 &&
                                            scope.data.level != 'server'
                                        "
                                        class="label-list-style"
                                        >({{
                                            scope.data.childlist.length
                                        }})</span
                                    >
                                </span>
                                <!-- 收藏按钮 -->
                                <i
                                    v-if="scope.data.level !== 'layer'"
                                    class="icon-collect"
                                    :class="
                                        scope.data.isCollect
                                            ? 'el-icon-star-on icon-color'
                                            : 'el-icon-star-off'
                                    "
                                    @click.stop="switchCollect(scope)"
                                ></i>
                                <el-switch
                                    v-show="
                                        (scope.data.level === 'server' &&
                                            scope.node.checked) ||
                                        (scope.data.level === 'server' &&
                                            scope.node.indeterminate)
                                    "
                                    v-model="scope.data.isShow"
                                    @click.stop.native
                                    ref="switchRef"
                                >
                                </el-switch>
                                <el-slider
                                    v-show="showSlider(scope)"
                                    v-model="scope.data.value"
                                    @change="
                                        changeOpacity(
                                            scope.data,
                                            scope.data.value
                                        )
                                    "
                                    @click.stop.native
                                ></el-slider>
                            </span>
                        </layer-tree>
                    </el-tab-pane>
                    <el-tab-pane label="所有图层" name="all">
                        <el-input
                            placeholder="输入关键字进行搜索"
                            v-model="filterAllText"
                            size="small"
                        >
                        </el-input>
                        <!-- 列表 -->
                        <layer-tree
                            class="layer-tree"
                            :data="treeAllList"
                            empty-text="暂无数据"
                            v-loading="allLoading"
                            element-loading-text="列表加载中"
                            element-loading-spinner="el-icon-loading"
                            show-checkbox
                            :render-after-expand="false"
                            :props="defaultProps"
                            ref="treeAll"
                            @check-change="changeSlider"
                            :highlight-current="true"
                            :filter-node-method="filterNode"
                            lazy
                            :load="nodeClick"
                            :default-checked-keys="defaultCheckArr"
                            :default-expanded-keys="defaultExpendArr"
                            draggable
                            @node-drag-start="handleDragStart"
                            @node-drag-end="handleDragEnd"
                            node-key="keyid"
                        >
                            <span slot-scope="scope">
                                <span class="label-style">
                                    {{ scope.node.label }}
                                    <span
                                        v-if="
                                            scope.data.childlist &&
                                            scope.data.childlist != 0 &&
                                            scope.data.level != 'server'
                                        "
                                        class="label-list-style"
                                        >({{
                                            scope.data.childlist.length
                                        }})</span
                                    >
                                </span>

                                <!-- 收藏按钮 -->
                                <i
                                    v-if="scope.data.level !== 'layer'"
                                    class="icon-collect"
                                    :class="
                                        scope.data.isCollect
                                            ? 'el-icon-star-on icon-color'
                                            : 'el-icon-star-off'
                                    "
                                    @click.stop="switchCollect(scope)"
                                ></i>
                                <!-- 缩放至图层 -->
                                <i title="缩放至图层" style="margin-left:5px;"
                                    v-if="scope.data.level == 'layer' && scope.node.checked "
                                    class="el-icon-full-screen"
                                    @click.stop="handleZoom(scope)"
                                ></i>
                                <!-- <el-tooltip
                                    content="缩放至图层"
                                    placement="bottom"
                                    effect="light"
                                >
                                    <i
                                        class="iconfont icon-fullscreen"
                                        @click="handleZoom(scope)"
                                    ></i>
                                </el-tooltip> -->
                                <el-switch
                                    v-show="
                                        (scope.data.level === 'server' &&
                                            scope.node.checked) ||
                                        (scope.data.level === 'server' &&
                                            scope.node.indeterminate)
                                    "
                                    v-model="scope.data.isShow"
                                    @click.stop.native
                                    ref="switchRef"
                                >
                                </el-switch>
                                <el-slider
                                    v-show="showSlider(scope)"
                                    v-model="scope.data.value"
                                    @change="
                                        changeOpacity(
                                            scope.data,
                                            scope.data.value
                                        )
                                    "
                                    @click.stop.native
                                ></el-slider>
                            </span>
                        </layer-tree>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-aside>
        <el-main>
            <!-- 地图 -->
            <Map2D
                v-show="maptype === 2"
                :leftMap="splitMap_Left_Data"
                :rightMap="splitMap_Right_Data"
            ></Map2D>
            <!-- 控制条 -->
            <map-control></map-control>
            <!-- 查询定位 -->
            <onemap-locate ref="locate"></onemap-locate>
            <!-- 行政区划 -->
            <onemap-area ref="area"></onemap-area>
            <!-- 叠加图纸 -->
            <onemap-paper ref="paper"></onemap-paper>
            <!-- 合规审查 -->
            <onemap-hegui ref="hegui"></onemap-hegui>
            <!-- 专题图 - 规划制作 -->
            <onemap-topic-guihua ref="guihua"></onemap-topic-guihua>
            <!-- 专题图 - 土规制作 -->
            <onemap-topic-tugui ref="tugui"></onemap-topic-tugui>
            <!-- 专题图 - 现状制作 -->
            <onemap-topic-current ref="current"></onemap-topic-current>
            <!-- 专题图 - 自定义制图 -->
            <onemap-topic-define ref="define"></onemap-topic-define>
            <!-- 城市经营 - 单元监测 -->
            <onemap-unit ref="unit"></onemap-unit>
            <!-- 城市经营 - 开发评估 -->
            <onemap-dev ref="dev"></onemap-dev>
            <!-- 规划留痕 - 规划编制成果追溯 -->
            <onemap-planresult ref="planresult"></onemap-planresult>
            <!-- 查询统计 -->
            <onemap-count ref="count"></onemap-count>
            <!-- 知识库 -->
            <onemap-wiki ref="wiki"></onemap-wiki>
            <!-- 红线下载 -->
            <onemap-redline ref="redline"></onemap-redline>
            <!-- 项目核查 -->
            <onemap-project ref="project"></onemap-project>
            <!-- 统计台账 -->
            <onemap-ledger ref="ledger"></onemap-ledger>
            <!-- 智能选址 -->
            <onemap-ai-site ref="aisite"></onemap-ai-site>
            <!--调整图层顺序-->
            <onemap-sort
                ref="mapsort"
                @resetChecked="resetChecked"
                @colseLayer="colseLayer"
            ></onemap-sort>
            <!--叠加分析-->
            <onemap-overlay ref="overlay"></onemap-overlay>
        </el-main>
    </el-container>
</template>

<script>
export { default } from "../js/onemap";
</script>

<style scoped lang="scss">
@import "../style/onemap.scss";
</style>
