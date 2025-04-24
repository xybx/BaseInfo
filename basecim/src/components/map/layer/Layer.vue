<template>
    <!-- 图层栏 -->
    <transition name="el-fade-in">
        <div class="layer-bar" v-show="layerVisible">
            <div class="layer-head">
                <span
                    class="iconfont icon-xiangmuliebiao"
                    @click="toggleShowLayer"
                ></span>
                <span>数据资源目录</span>
                <!-- <span class="iconfont icon-31shoucang"></span> -->
                <el-popover
                    placement="right-start"
                    :width="200"
                    trigger="hover"
                    :offset="30"
                    popper-class="collect-popover"
                >
                    <template #reference>
                        <span class="iconfont icon-31shoucang"></span>
                    </template>
                    <el-tree
                        :props="layerProps"
                        show-checkbox
                        :data="layerData"
                        class="layer-tree"
                        :filter-node-method="filterNode"
                        empty-text="暂无数据"
                        ref="layerTree"
                        @check-change="changeLayerNode"
                        draggable
                        @node-drag-end="handleDragEnd"
                        :allow-drag="handleAllowDrag"
                        :allow-drop="handleAllowDrop"
                        :highlight-current="true"
                        :render-after-expand="false"
                        node-key="pid"
                    >
                        <template #default="{ node, data }">
                            <span
                                class="custom-tree-node"
                                :class="data.level !== 3 ? 'not-server' : ''"
                            >
                                <span>{{ node.label }}</span>
                                <span
                                    class="tree-tools"
                                    v-if="data.level === 3 && node.checked"
                                >
                                    <el-tooltip
                                        content="收藏"
                                        placement="bottom"
                                        effect="light"
                                    >
                                        <i class="iconfont icon-31shoucang"></i>
                                    </el-tooltip>
                                    <el-tooltip
                                        content="图文关联"
                                        placement="bottom"
                                        effect="light"
                                    >
                                        <i class="iconfont icon-icon-1"></i>
                                    </el-tooltip>
                                    <el-tooltip
                                        content="缩放至图层"
                                        placement="bottom"
                                        effect="light"
                                    >
                                        <i
                                            class="iconfont icon-fullscreen"
                                            @click="handleZoom(node, data)"
                                        ></i>
                                    </el-tooltip>

                                    <el-popover
                                        placement="right"
                                        trigger="hover"
                                        popper-class="opacity-popper"
                                        :offset="30"
                                    >
                                        <template #reference>
                                            <i
                                                class="iconfont icon-kaiqitaiyangguangshezhi"
                                            ></i>
                                        </template>
                                        <el-slider
                                            v-model="data.opacity"
                                            size="small"
                                            @change="handleOpacity(node, data)"
                                        />
                                    </el-popover>
                                </span>
                            </span>
                        </template>
                    </el-tree>
                </el-popover>
            </div>
            <div class="layer-search">
                <el-input
                    v-model="searchVal"
                    placeholder="请输入关键词搜索"
                    clearable
                />
            </div>
            <div class="layer-main">
                <el-tree
                    :props="layerProps"
                    show-checkbox
                    :data="layerData"
                    class="layer-tree"
                    :filter-node-method="filterNode"
                    empty-text="暂无数据"
                    ref="layerTree"
                    @check-change="changeLayerNode"
                    draggable
                    @node-drag-end="handleDragEnd"
                    :allow-drag="handleAllowDrag"
                    :allow-drop="handleAllowDrop"
                    :highlight-current="true"
                    :render-after-expand="false"
                    node-key="pid"
                >
                    <template #default="{ node, data }">
                        <span
                            class="custom-tree-node"
                            :class="data.level !== 3 ? 'not-server' : ''"
                        >
                            <span>{{ node.label }}</span>
                            <span
                                class="tree-tools"
                                v-if="data.level === 3 && node.checked"
                            >
                                <el-tooltip
                                    content="收藏"
                                    placement="bottom"
                                    effect="light"
                                >
                                    <i class="iconfont icon-31shoucang"></i>
                                </el-tooltip>
                                <el-tooltip
                                    content="图文关联"
                                    placement="bottom"
                                    effect="light"
                                >
                                    <i
                                        class="iconfont icon-icon-1"
                                        @click="handleLink(node, data)"
                                    ></i>
                                </el-tooltip>
                                <el-tooltip
                                    content="缩放至图层"
                                    placement="bottom"
                                    effect="light"
                                >
                                    <i
                                        class="iconfont icon-fullscreen"
                                        @click="handleZoom(node, data)"
                                    ></i>
                                </el-tooltip>

                                <el-popover
                                    placement="right"
                                    trigger="hover"
                                    popper-class="opacity-popper"
                                    :offset="30"
                                >
                                    <template #reference>
                                        <i
                                            class="iconfont icon-kaiqitaiyangguangshezhi"
                                        ></i>
                                    </template>
                                    <el-slider
                                        v-model="data.opacity"
                                        size="small"
                                        @change="handleOpacity(node, data)"
                                    />
                                </el-popover>
                            </span>
                        </span>
                    </template>
                </el-tree>
            </div>
        </div>
    </transition>
    <span
        class="show-tree"
        :class="layerVisible ? '' : 'hide-btn'"
        @click="toggleShowLayer"
    >
        <i
            class="iconfont"
            :class="
                layerVisible ? 'icon-xiangzuojiantou' : 'icon-xiangyoujiantou'
            "
        ></i>
    </span>
</template>

<script lang="ts" setup>
/* Vue 相关 */
import {
    ref,
    onMounted,
    watch,
    reactive,
    nextTick,
    onUnmounted,
    toRaw,
} from 'vue';
import useStore from '@/stores';

/* UI 相关 */
import { ElMessage, ElTree } from 'element-plus';
import type Node from 'element-plus/es/components/tree/src/model/node';

/* ArcGIS API */
import * as projection from '@arcgis/core/geometry/projection';

/* 接口 API */
import { getLayersApi } from './layer-api';
import { initLayerByKind } from '@/utils/common-map';

/* pinia数据 */
const { viewStore, mapStore, menuStore } = useStore();

/* 图层栏搜索框 */
const searchVal = ref('');
const layerTree = ref<InstanceType<typeof ElTree>>();

/* 监听搜索框值 */
watch(searchVal, (val) => {
    layerTree.value!.filter(val);
});

/* 图层默认字段 */
const layerProps = {
    children: 'children',
    label: 'label',
    disabled: 'uncheck',
};

/* 图层数据 */
const layerData = ref([]);

/* 切换图层显隐 */
const layerVisible = ref(true);
const toggleShowLayer = () => {
    layerVisible.value = !layerVisible.value;
    menuStore.handleLayerShow(layerVisible.value);
};

/* 获取图层树列表 */
const getLayerData = async () => {
    let params = {
        prjtype: 1,
    };
    const { data: res } = await getLayersApi(params);
    console.log(res, 'layerres');
    if (res.code !== 200) return ElMessage.warning(res.msg);
    layerData.value = res.data;
    menuStore.handleTreeRef(layerTree);
};

/* 图层过滤方法 */
const filterNode = (value: any, data: any, node: any) => {
    if (!value) return true;
    let _array: any = [];
    getReturnNode(node, _array, value);
    let result = false;
    _array.forEach((item: any) => {
        result = result || item;
    });
    return result;
};

/* 返回图层过滤后数据 */
const getReturnNode = (node: any, _array: any, value: any) => {
    let isPass =
        node.data && node.data.label && node.data.label.indexOf(value) !== -1;
    isPass ? _array.push(isPass) : '';
    if (!isPass && node.level != 1 && node.parent) {
        getReturnNode(node.parent, _array, value);
    }
};

/* 缩放至图层 */
const handleZoom = (node: any, data: any) => {
    let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
        String(data.pid)
    );
    console.log(findLayer, 'findLayer');
    debugger;
    // 坐标系不同
    const { mapStore } = useStore();
    let geometry = findLayer.fullExtent;
    console.log(geometry, 'geometry');
    // 必需等投影引擎加载完毕再转换
    projection.load().then(() => {
        let newGeometry = projection.project(geometry, {
            wkid: Number(mapStore.baseInfo.mapInit.wkid),
        });
        toRaw(viewStore.mapInstance).goTo({
            target: newGeometry,
        });
    });
};

/* 图文关联 */
const handleLink = (node: any, data: any) => {
    console.log(node, 'node');
    console.log(data, 'data');
    menuStore.handleFunc('twgl');
};

/* 图层点击事件 */
const changeLayerNode = async (data: any, isClick: boolean) => {
    if (data.level !== 3) return false;
    let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
        String(data.pid)
    );
    if (findLayer) return (findLayer.visible = isClick);
    // 未找到则新建图层
    if (isClick) {
        //存入当前点击的图层服务信息
        menuStore.handleCurrentLayer(data);
        const showLayer = await initLayerByKind(data, isClick);
        console.log(isClick, 'isclick');
        console.log(showLayer, 'showLayer');
        // BIM模型图层弹窗关闭、所有子图层展示
        if (data.kind === 7) {
            // 暂时屏蔽
            showLayer.allSublayers.find((sub: any) => {
                sub.popupEnabled = false;
                // console.log(sub, 'sub');
                console.log(sub.modelName == 'Mass');
                sub.visible = true
                // sub.visible = false;
                // if (sub.modelName != 'Mass' && sub.modelName != 'Topography') {
                //     sub.visible = true;
                // }
            });
        }
        toRaw(viewStore.mapInstance).map.add(showLayer, data.order);
    }
};

/* 图层拖拽事件 */
const handleDragEnd = async (
    node: any, // 当前节点
    internode: any, // 进入节点
    position: any, // 放置位置
    event: any
) => {
    console.log(node, 'node');
    console.log(internode, 'internode');
    console.log(position, 'positon');
    console.log(event, 'event');

    let bodyWidth = document.body.clientWidth;
    let bodyHeight = document.body.clientHeight;
    let topHeight = (
        document.querySelector('.header-container') as HTMLDivElement
    ).offsetHeight;

    // 两分屏右屏
    if (
        event.clientY > topHeight &&
        event.clientY < bodyHeight &&
        event.clientX > bodyWidth / 2 &&
        event.clientX < bodyWidth &&
        viewStore.viewSplit &&
        viewStore.splitMode === 1
    ) {
        let findLayer = toRaw(viewStore.splitViewArr[1]).map.findLayerById(
            String(node.data.pid)
        );

        if (findLayer) return false;
        toRaw(viewStore.splitViewArr[1]).map.removeAll();
        const addLayer = await initLayerByKind(node.data, true);

        // BIM模型图层弹窗关闭、所有子图层展示
        if (node.data.kind === 7) {
            addLayer.allSublayers.find((sub: any) => {
                sub.popupEnabled = false;
                sub.visible = true;
            });
        }
        toRaw(viewStore.splitViewArr[1]).map.add(addLayer, node.data.order);

        // 不同坐标系
        let geometry = addLayer.fullExtent;
        projection.load().then(() => {
            let newGeometry = projection.project(geometry, {
                wkid: Number(mapStore.baseInfo.mapInit.wkid),
            });
            toRaw(viewStore.splitViewArr[1]).extent = newGeometry;
        });
    }
    // 三分屏上屏
    else if (
        event.clientY > topHeight &&
        event.clientY < (bodyHeight - topHeight) / 2 + topHeight &&
        event.clientX > bodyWidth / 2 &&
        event.clientX < bodyWidth &&
        viewStore.viewSplit &&
        viewStore.splitMode === 2
    ) {
        let findLayer = toRaw(viewStore.splitViewArr[1]).map.findLayerById(
            String(node.data.pid)
        );

        if (findLayer) return false;
        toRaw(viewStore.splitViewArr[1]).map.removeAll();
        const addLayer = await initLayerByKind(node.data, true);

        // BIM模型图层弹窗关闭、所有子图层展示
        if (node.data.kind === 7) {
            addLayer.allSublayers.find((sub: any) => {
                sub.popupEnabled = false;
                sub.visible = true;
            });
        }
        toRaw(viewStore.splitViewArr[1]).map.add(addLayer, node.data.order);

        // 不同坐标系
        let geometry = addLayer.fullExtent;
        projection.load().then(() => {
            let newGeometry = projection.project(geometry, {
                wkid: Number(mapStore.baseInfo.mapInit.wkid),
            });
            toRaw(viewStore.splitViewArr[1]).extent = newGeometry;
        });
    }
    // 三分屏下屏
    else if (
        event.clientY > bodyHeight / 2 + topHeight &&
        event.clientY < bodyHeight &&
        event.clientX > bodyWidth / 2 &&
        event.clientX < bodyWidth &&
        viewStore.viewSplit &&
        viewStore.splitMode === 2
    ) {
        console.log(viewStore.splitViewArr, 'viewStore.splitViewArr');

        let findLayer = toRaw(viewStore.splitViewArr[2]).map.findLayerById(
            String(node.data.pid)
        );

        if (findLayer) return false;
        toRaw(viewStore.splitViewArr[2]).map.removeAll();
        const addLayer = await initLayerByKind(node.data, true);

        // BIM模型图层弹窗关闭、所有子图层展示
        if (node.data.kind === 7) {
            addLayer.allSublayers.find((sub: any) => {
                sub.popupEnabled = false;
                sub.visible = true;
            });
        }
        toRaw(viewStore.splitViewArr[2]).map.add(addLayer, node.data.order);

        // 不同坐标系
        let geometry = addLayer.fullExtent;
        projection.load().then(() => {
            let newGeometry = projection.project(geometry, {
                wkid: Number(mapStore.baseInfo.mapInit.wkid),
            });
            toRaw(viewStore.splitViewArr[2]).extent = newGeometry;
        });
    }
    // 二三维联动
    else if (
        event.clientY > topHeight &&
        event.clientY < bodyHeight &&
        event.clientX > bodyWidth / 2 &&
        event.clientX < bodyWidth &&
        viewStore.splitLendon
    ) {
        let findLayer = toRaw(viewStore.lendonView).map.findLayerById(
            String(node.data.pid)
        );
        if (findLayer) return false;
        if (node.data.maptype === 2)
            return ElMessage.warning('此地图不支持三维服务');
        toRaw(viewStore.lendonView).map.removeAll();
        const addLayer = await initLayerByKind(node.data, true);
        console.log(addLayer, 'addlayer');
        toRaw(viewStore.lendonView).map.add(addLayer, node.data.order);

        // 不同坐标系
        let geometry = addLayer.fullExtent;
        projection.load().then(() => {
            let newGeometry = projection.project(geometry, {
                wkid: Number(mapStore.baseInfo.mapInit.wkid),
            });
            toRaw(viewStore.lendonView).extent = newGeometry;
        });
    }
};

/* 控制树节点能够成为目标拖拽点 */
const handleAllowDrop = () => {
    return false;
};

/* 控制当前节点是否能拖拽 */
const handleAllowDrag = (node: Node) => {
    return node.level === 3 ? true : false;
};

/* 图层滚动条拖动 */
const handleOpacity = (node: any, data: any) => {
    if (data.kind === 6) return ElMessage.warning('倾斜摄影图层暂无透明度');
    let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
        String(data.pid)
    );
    findLayer.opacity = data.opacity / 100;
};

onMounted(() => {
    getLayerData();
});
</script>

<style lang="scss" scoped>
@use './layer.scss';
</style>
