<template>
    <!-- 工具栏 -->
    <div class="tool-bar">
        <!-- 工具栏-底图 -->
        <el-dialog
            v-model="baseVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-basemap"
            @close="closeBasemap"
        >
            <template #header>
                <span class="tool-title"> 底图 </span>
            </template>
            <div class="tool-main">
                <div
                    class="tool-item"
                    v-for="(item, index) in basemapList"
                    @click="handleBase(item)"
                    :class="item.isFocus ? 'focus-base' : ''"
                >
                    <span class="base-img">
                        <el-image :src="returnIconUrl(item)" fit="fill" />
                    </span>
                    <span>{{ item.label }}</span>
                </div>
                <div
                    class="tool-item"
                    v-for="(item, index) in elevList"
                    @click="handleElev(item)"
                    :class="item.isFocus ? 'focus-base' : ''"
                >
                    <span class="base-img">
                        <el-image :src="returnIconUrl(item)" fit="fill" />
                    </span>
                    <span>{{ item.label }}</span>
                </div>
            </div>
        </el-dialog>

        <!-- 工具栏-属性 -->
        <el-dialog
            v-model="attrVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-attr"
            :before-close="closeAttr"
        >
            <template #header>
                <span class="tool-title"> 属性 </span>
            </template>
            <div class="tool-main">
                <div class="attr-head">
                    <el-select
                        v-model="attrLayer"
                        placeholder="请选择"
                        @change="changeAttr"
                    >
                        <el-option
                            v-for="item in attrList"
                            :key="item.id"
                            :label="item.label"
                            :value="item.id"
                        >
                        </el-option>
                    </el-select>
                    <i class="iconfont icon-dingwei" @click="locateGeo"></i>
                </div>
                <div class="attr-main">
                    <el-table
                        :data="attrTable"
                        border
                        stripe
                        size="small"
                        empty-text="暂无数据"
                        max-height="300"
                    >
                        <el-table-column
                            prop="label"
                            label="字段"
                            align="center"
                        />
                        <el-table-column
                            prop="value"
                            label="值"
                            align="center"
                        />
                    </el-table>
                </div>
            </div>
        </el-dialog>

        <!-- 工具栏-量算 -->
        <el-dialog
            v-model="measureVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-measure"
            @close="closeMeasure"
        >
            <template #header>
                <span class="tool-title"> 量算 </span>
            </template>
            <div class="tool-main">
                <div
                    class="tool-item"
                    v-for="(item, index) in measureList"
                    :key="index"
                    @click="handleMeasure(item)"
                    :class="{
                        'measure-focus': item.isFocus,
                    }"
                >
                    <span class="base-img">
                        <i class="iconfont" :class="item.icon"></i>
                    </span>
                    <span>{{ item.label }}</span>
                </div>
            </div>
        </el-dialog>

        <!-- 工具栏-比例 -->
        <el-dialog
            v-model="scaleVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-scale"
            @close="closeScale"
            :show-close="false"
        >
            <template #header>
                <el-select
                    v-model="scaleVal"
                    placeholder="请选择缩放比例"
                    @change="changeScale"
                >
                    <el-option
                        v-for="(item, index) in scaleData"
                        :key="index"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
                <i class="iconfont icon-chizi"></i>
            </template>
        </el-dialog>

        <!-- 工具栏-分屏 -->
        <el-dialog
            v-model="splitVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-split"
            @close="closeSplit"
        >
            <template #header>
                <span class="tool-title"> 分屏模式 </span>
            </template>
            <div class="tool-main">
                <div
                    class="split-item"
                    :class="viewStore.splitMode === 1 ? 'split-focus' : ''"
                    @click="splitMode(1)"
                >
                    <div class="split-1">
                        <span>1</span>
                        <span>2</span>
                    </div>
                    <span class="split-label">两分屏</span>
                </div>
                <div
                    class="split-item"
                    :class="viewStore.splitMode === 2 ? 'split-focus' : ''"
                    @click="splitMode(2)"
                >
                    <div class="split-2">
                        <div>1</div>
                        <div>
                            <span>2</span>
                            <span>3</span>
                        </div>
                    </div>
                    <span class="split-label">三分屏</span>
                </div>
                <!-- 暂时不做 -->
                <!-- <div class="split-item" @click="splitMode(3)">
                    <div class="split-3">
                        <div>1</div>
                        <div>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                        </div>
                    </div>
                    <span class="split-label">一主三辅</span>
                </div>
                <div class="split-item" @click="splitMode(4)">
                    <div class="split-4">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                    </div>
                    <span class="split-label">四分屏</span>
                </div> -->
            </div>
        </el-dialog>

        <!-- 工具栏-卷帘 -->
        <el-dialog
            v-model="swipeVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-scale"
            :show-close="false"
        >
            <template #header>
                <el-select
                    v-model="swipeVal"
                    placeholder="请选择卷帘图层"
                    @change="changeSwipe"
                    value-key="pid"
                >
                    <el-option
                        v-for="(item, index) in swipeData"
                        :key="item.pid"
                        :label="item.label"
                        :value="item"
                    ></el-option>
                </el-select>
                <i class="iconfont icon-yinqing_juli"></i>
            </template>
        </el-dialog>
    </div>

    <div class="switch-box">
        <el-button @click="toolVisible = !toolVisible" circle size="large">
            <template #icon>
                <i class="iconfont icon-icon_gongjuxiang"></i>
            </template>
        </el-button>
    </div>
    <el-collapse-transition>
        <div class="map-control" v-show="toolVisible">
            <el-button
                v-for="item in toolList"
                :key="item.code"
                @click="handleTool(item)"
                :class="{ 'tool-focus': item.isFocus }"
            >
                <span class="iconfont" :class="item.icon"></span>
                {{ item.label }}
            </el-button>
        </div>
    </el-collapse-transition>
</template>
<script lang="ts" setup>
/* Vue 相关 */
import { ref, toRaw, nextTick } from 'vue';
import useStore from '@/stores';

/* UI 相关 */
import { ElMessage } from 'element-plus';

/* ArcGIS api */
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import * as identify from '@arcgis/core/rest/identify';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import Graphic from '@arcgis/core/Graphic';
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import Sketch from '@arcgis/core/widgets/Sketch';
import Point from '@arcgis/core/geometry/Point';
import AreaMeasurementAnalysis from '@arcgis/core/analysis/AreaMeasurementAnalysis';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import DirectLineMeasurementAnalysis from '@arcgis/core/analysis/DirectLineMeasurementAnalysis';
import Swipe from '@arcgis/core/widgets/Swipe.js';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer.js';
import SliceViewModel from '@arcgis/core/widgets/Slice/SliceViewModel.js';
import SliceAnalysis from '@arcgis/core/analysis/SliceAnalysis.js';
import Slice from '@arcgis/core/widgets/Slice.js';
import DirectLineMeasurement3DViewModel from '@arcgis/core/widgets/DirectLineMeasurement3D/DirectLineMeasurement3DViewModel.js';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js';
import * as projection from '@arcgis/core/geometry/projection.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';

/* API */
import { getScaleListApi } from './tool-api';
import { initLayerByKind } from '@/utils/common-map';

/* pinia */
const { mapStore, viewStore, menuStore } = useStore();

const emitSplit = defineEmits(['setSplitMap', 'setLengonView', 'setSwipeView']);

// 工具栏开关
const toolVisible = ref(false);

// 工具栏列表
const toolList = ref<any>([
    {
        label: '比例',
        code: 'bl',
        icon: 'icon-suofang',
        isFocus: false,
    },
    {
        label: '属性',
        code: 'sx',
        icon: 'icon-shuxing',
        isFocus: false,
    },
    {
        label: '量算',
        code: 'ls',
        icon: 'icon-chizi',
        isFocus: false,
    },
    {
        label: '清除',
        code: 'qc',
        icon: 'icon-qingchu',
        isFocus: false,
    },
    {
        label: '剖切',
        code: 'pq',
        icon: 'icon-pouqie',
        isFocus: false,
    },
    {
        label: '卷帘',
        code: 'jl',
        icon: 'icon-juanlian',
        isFocus: false,
    },
    {
        label: '分屏',
        code: 'fp',
        icon: 'icon-fenping',
        isFocus: false,
    },
    {
        label: '维度',
        code: 'wd',
        icon: 'icon-weidu',
        isFocus: false,
    },
    {
        label: '联动',
        code: 'ld',
        icon: 'icon-sand2',
        isFocus: false,
    },
    {
        label: '底图',
        code: 'dt',
        icon: 'icon-ditu',
        isFocus: false,
    },
]);

// 工具栏点击
const handleTool = (item: any) => {
    console.log(item, 'toolItem');
    let igNoreCodes = ['qc', 'wd'];
    if (!igNoreCodes.includes(item.code)) {
        item.isFocus = !item.isFocus;
    }
    switch (item.code) {
        case 'sx':
            handleAttr(item);
            // handleAttr2(item);
            break;
        case 'qc':
            clearGeo(item);
            break;
        case 'dt':
            toggleBase(item);
            break;
        case 'fp':
            // handleSplitMap(item);
            handleSplit(item);
            break;
        case 'wd':
            toggleDimension(item);
            break;
        case 'ls':
            toggleMeasure(item);
            break;
        case 'bl':
            handleScale(item);
            break;
        case 'jl':
            handleSwipe(item);
            break;
        case 'ld':
            handleLendon(item);
            break;
        case 'pq':
            handleSlice(item);
            break;
        default:
            break;
    }
};

/*
    分屏模式点击
    mode:1-双屏；2-三屏；3-一主三辅；4-四分屏
*/
const splitMode = (mode: number) => {
    console.log(mode, 'mode');
    viewStore.handleSplitMode(mode);
    let splitObj = <any>{};
    if (viewStore.viewSplit) {
        if (mode === 1) {
            splitObj = {
                showSplit: viewStore.viewSplit,
                splitMode: mode,
                container: ['splitMap'],
            };
        } else if (mode === 2) {
            splitObj = {
                showSplit: viewStore.viewSplit,
                splitMode: mode,
                container: ['splitMap1', 'splitMap2'],
            };
        }

        nextTick(() => {
            emitSplit('setSplitMap', splitObj);
        });
    }
};

/* 卷帘 */
const swipeData = ref<any>(window.demoBuildObj.options);
const swipeVisible = ref(false);
const swipeVal = ref<any>();
let groupLayer = <any>null;
const changeSwipe = async (obj: any) => {
    // ElMessage.info(obj);
    console.log(obj, 'objjj');

    if (!groupLayer) {
        groupLayer = new GroupLayer({
            id: 'buildGroupLayer',
            visibilityMode: 'exclusive',
        });
        debugger;
        toRaw(viewStore.swipeView).map.add(groupLayer);
    }

    let showLayer = groupLayer.findLayerById(obj.pid);
    if (!showLayer) {
        showLayer = await initLayerByKind(obj, true);
        groupLayer.add(showLayer, obj.order);
    } else {
        showLayer.visible = true;
    }
};
const handleSwipe = (item: any) => {
    closeMeasure();
    closeAttr();
    closeScale();
    closeBasemap();
    closeSplit();
    closeLendon();
    closeSlice();
    viewStore.handleSwipe(item.isFocus);
    swipeVisible.value = item.isFocus;

    if (item.isFocus) {
        nextTick(() => {
            emitSplit('setSwipeView');
        });
    } else {
        closeSwipe();
    }
};
const closeSwipe = () => {
    viewStore.handleSwipe(false);
    swipeVisible.value = false;
    swipeVal.value = null;
    groupLayer?.destroy();
    groupLayer = null;
    toolList.value.map((item: any) => {
        item.code === 'jl' ? (item.isFocus = false) : '';
    });
};

/* 比例 */
const scaleVisible = ref(false);
const scaleVal = ref<any>();
const scaleData = ref<any>([]);
const handleScale = async (item: any) => {
    closeAttr();
    closeBasemap();
    closeMeasure();
    closeSplit();
    closeLendon();
    closeSwipe();
    closeSlice();

    scaleVisible.value = item.isFocus;
    let params = {
        code: '比例尺',
    };
    const { data: res } = await getScaleListApi(params);
    if (res.code !== 200) return ElMessage.warning(res.msg);
    let scaleRes = res.data[0].stringnum?.split('_');
    let newArr = <any>[];
    scaleRes.map((sItem: any) => {
        newArr.push({ label: `1:${sItem}`, value: sItem });
    });
    scaleData.value = newArr;
};
const changeScale = (val: any) => {
    toRaw(viewStore.mapInstance).goTo({
        scale: Number(val),
    });
};
const closeScale = () => {
    scaleVisible.value = false;
    toolList.value.map((item: any) => {
        item.code === 'bl' ? (item.isFocus = false) : '';
    });
};

/* 量算 */
const measureVisible = ref(false);
const measureList = ref<any>([
    {
        pid: 1,
        label: '水平距离',
        icon: 'icon-shuipingjuli',
        code: 'spjl',
        isFocus: false,
    },
    {
        pid: 2,
        label: '垂直距离',
        icon: 'icon-chuizhijuli',
        code: 'czjl',
        isFocus: false,
    },
    {
        pid: 3,
        label: '空间距离',
        icon: 'icon-kongjian',
        code: 'kjjl',
        isFocus: false,
    },
    {
        pid: 4,
        label: '面积量算',
        icon: 'icon-area',
        code: 'mjls',
        isFocus: false,
    },
    {
        pid: 5,
        label: '三角测量',
        icon: 'icon-sanjiaoxing',
        code: 'sjcl',
        isFocus: false,
    },
]);
const toggleMeasure = (item: any) => {
    closeAttr();
    closeBasemap();
    closeScale();
    closeSplit();
    closeSwipe();
    closeSlice();

    measureVisible.value = item.isFocus;
    if (measureVisible.value) {
        let findMeasureLayer = toRaw(viewStore.mapInstance).map.findLayerById(
            'measureLayer'
        );
        // 没找到则创建图形图层
        if (!Boolean(findMeasureLayer)) {
            let measureLayer = new GraphicsLayer({
                id: 'measureLayer',
                // 6.27 测试高程模式
                elevationInfo: {
                    // mode: 'on-the-ground',
                    mode: 'absolute-height',
                },
            } as any);
            toRaw(viewStore.mapInstance).map.layers.add(measureLayer);
        }
    }
};
const closeMeasure = () => {
    toolList.value.map((item: any) => {
        item.code === 'ls' ? (item.isFocus = false) : '';
    });

    // 关闭所有量算微件
    measureList.value.filter((measureItem: any) => {
        measureItem.isFocus = false;
    });
    if (mesaureVerticalSketch.value) {
        toRaw(mesaureVerticalSketch.value).destroy();
        mesaureVerticalSketch.value = null;
    }
    if (measureSpatialSketch.value) {
        toRaw(measureSpatialSketch.value).destroy();
        measureSpatialSketch.value = null;
    }
    if (measureHorizontalSketch.value) {
        toRaw(measureHorizontalSketch.value).destroy();
        measureHorizontalSketch.value = null;
    }
    if (measureAreaSketch.value) {
        toRaw(measureAreaSketch.value).destroy();
        measureAreaSketch.value = null;
    }
    measureVisible.value = false;
};
const handleMeasure = (item: any) => {
    console.log(item, 'item');
    item.isFocus = !item.isFocus;
    measureList.value.filter((measureItem: any) => {
        console.log(measureItem, 'measureItem');

        if (measureItem.code != item.code) {
            measureItem.isFocus = false;
        }
    });
    switch (item.code) {
        case 'spjl':
            measureHorizontal(item);
            break;
        case 'czjl':
            measureVertical(item);
            break;
        case 'kjjl':
            measureSpatial(item);
            break;
        case 'mjls':
            measureArea(item);
            break;
        case 'sjcl':
            measureTriangle(item);
            break;
        default:
            break;
    }
};
// 水平量算
const measureHorizontalSketch = ref<any>(null);
const measureHorizontal = (item: any) => {
    if (mesaureVerticalSketch.value) {
        toRaw(mesaureVerticalSketch.value).destroy();
        mesaureVerticalSketch.value = null;
    }
    if (measureSpatialSketch.value) {
        toRaw(measureSpatialSketch.value).destroy();
        measureSpatialSketch.value = null;
    }
    if (measureAreaSketch.value) {
        toRaw(measureAreaSketch.value).destroy();
        measureAreaSketch.value = null;
    }

    debugger;
    if (item.isFocus) {
        let measureLayer = toRaw(viewStore.mapInstance).map.findLayerById(
            'measureLayer'
        );
        // 6.27 改变高程
        measureLayer.elevationInfo.mode = 'absolute-height';

        if (measureHorizontalSketch.value == null) {
            debugger;
            let viewModel = new SketchViewModel({
                updateOnGraphicClick: false,
                polylineSymbol: {
                    type: 'line-3d',
                    symbolLayers: [
                        {
                            type: 'line',
                            size: 6,
                            material: { color: 'yellow' },
                            cap: 'round',
                            join: 'round',
                        },
                    ],
                },
            });
            measureHorizontalSketch.value = new Sketch({
                viewModel: viewModel,
                labelOptions: {
                    enabled: false,
                },
                tooltipOptions: {
                    enabled: false,
                },
                layer: measureLayer,
                view: toRaw(viewStore.mapInstance),
                defaultCreateOptions: {
                    hasZ: true,
                },
                defaultUpdateOptions: {
                    enableZ: false,
                    tool: 'reshape',
                },
            });
            toRaw(measureHorizontalSketch.value).create('polyline');
        }

        let pointList: any = [];
        toRaw(measureHorizontalSketch.value).on('create', async (evt: any) => {
            if (
                evt.state !== 'complete' &&
                evt.toolEventInfo?.type == 'vertex-add'
            ) {
                console.log(evt, 'evt');
                let pointArr = evt.toolEventInfo.added[0] as any;
                let point = new Point({
                    x: pointArr[0],
                    y: pointArr[1],
                    z: pointArr[2],
                    spatialReference: toRaw(viewStore.mapInstance)
                        .spatialReference,
                });
                pointList.push(point);

                if (pointList.length > 1) {
                    const directLineMeasure = new DirectLineMeasurementAnalysis(
                        {
                            startPoint: pointList.at(-2),
                            endPoint: pointList.at(-1),
                            unit: 'metric',
                        }
                    );
                    toRaw(viewStore.mapInstance).analyses.add(
                        directLineMeasure
                    );
                    const analysisView = await toRaw(
                        viewStore.mapInstance
                    ).whenAnalysisView(directLineMeasure);
                    await reactiveUtils.whenOnce(() => !analysisView.updating);
                    analysisView.visible = false;

                    const result = analysisView.result;
                    console.log(result, 'result');
                    let geo3D = new Graphic({
                        geometry: pointList.at(-1),
                        symbol: {
                            type: 'point-3d',
                            verticalOffset: {
                                screenLength: 40,
                            },
                            callout: {
                                type: 'line',
                                size: 1.5,
                                color: [0, 0, 0, 0.6],
                            },
                            symbolLayers: [
                                {
                                    type: 'text',
                                    size: 14,
                                    text: `水平距离：${result.horizontalDistance.value.toFixed(
                                        2
                                    )} m`,
                                    material: {
                                        color: 'white',
                                    },
                                    background: {
                                        color: [0, 0, 0, 0.6],
                                    },
                                },
                                // {
                                //     type: 'icon',
                                //     size: 14,
                                //     resource: {
                                //         primitive: 'circle',
                                //     },
                                //     material: {
                                //         color: [0, 0, 0, 0.6],
                                //     },
                                // },
                            ],
                        },
                    } as any);
                    measureLayer.graphics.add(geo3D);
                }
            }

            if (evt.state == 'complete') {
                pointList = [];
                toRaw(measureHorizontalSketch.value).complete();
            }
        });
    } else {
        if (measureHorizontalSketch.value !== null) {
            toRaw(measureHorizontalSketch.value).destroy();
            measureHorizontalSketch.value = null;
        }
    }
};

// 垂直量算
const mesaureVerticalSketch = ref<any>(null);
const measureVertical = (item: any) => {
    if (measureHorizontalSketch.value) {
        toRaw(measureHorizontalSketch.value).destroy();
        measureHorizontalSketch.value = null;
    }
    if (measureSpatialSketch.value) {
        toRaw(measureSpatialSketch.value).destroy();
        measureSpatialSketch.value = null;
    }
    if (measureAreaSketch.value) {
        toRaw(measureAreaSketch.value).destroy();
        measureAreaSketch.value = null;
    }

    if (item.isFocus) {
        let measureLayer = toRaw(viewStore.mapInstance).map.findLayerById(
            'measureLayer'
        );
        // 6.27 改变高程
        measureLayer.elevationInfo.mode = 'absolute-height';

        if (mesaureVerticalSketch.value == null) {
            debugger;
            let viewModel = new SketchViewModel({
                updateOnGraphicClick: false,
                polylineSymbol: {
                    type: 'line-3d',
                    symbolLayers: [
                        {
                            type: 'line',
                            size: 6,
                            material: { color: 'yellow' },
                            cap: 'round',
                            join: 'round',
                        },
                    ],
                },
            });
            mesaureVerticalSketch.value = new Sketch({
                viewModel: viewModel,
                labelOptions: {
                    enabled: false,
                },
                tooltipOptions: {
                    enabled: false,
                },
                layer: measureLayer,
                view: toRaw(viewStore.mapInstance),
                defaultCreateOptions: {
                    hasZ: true,
                },
                defaultUpdateOptions: {
                    enableZ: false,
                    tool: 'reshape',
                },
            });
            toRaw(mesaureVerticalSketch.value).create('polyline');
        }

        let pointList: any = [];
        toRaw(mesaureVerticalSketch.value).on('create', async (evt: any) => {
            if (
                evt.state !== 'complete' &&
                evt.toolEventInfo?.type == 'vertex-add'
            ) {
                console.log(evt, 'evt');
                let pointArr = evt.toolEventInfo.added[0] as any;
                let point = new Point({
                    x: pointArr[0],
                    y: pointArr[1],
                    z: pointArr[2],
                    spatialReference: toRaw(viewStore.mapInstance)
                        .spatialReference,
                });
                pointList.push(point);

                if (pointList.length > 1) {
                    const directLineMeasure = new DirectLineMeasurementAnalysis(
                        {
                            startPoint: pointList.at(-2),
                            endPoint: pointList.at(-1),
                            unit: 'metric',
                        }
                    );
                    toRaw(viewStore.mapInstance).analyses.add(
                        directLineMeasure
                    );
                    const analysisView = await toRaw(
                        viewStore.mapInstance
                    ).whenAnalysisView(directLineMeasure);
                    await reactiveUtils.whenOnce(() => !analysisView.updating);
                    analysisView.visible = false;

                    const result = analysisView.result;
                    console.log(result, 'result');
                    let geo3D = new Graphic({
                        geometry: pointList.at(-1),
                        symbol: {
                            type: 'point-3d',
                            verticalOffset: {
                                screenLength: 40,
                            },
                            callout: {
                                type: 'line',
                                size: 1.5,
                                color: [0, 0, 0, 0.6],
                            },
                            symbolLayers: [
                                {
                                    type: 'text',
                                    size: 14,
                                    text: `垂直距离：${result.verticalDistance.value.toFixed(
                                        2
                                    )} m`,
                                    material: {
                                        color: 'white',
                                    },
                                    background: {
                                        color: [0, 0, 0, 0.6],
                                    },
                                },
                                // {
                                //     type: 'icon',
                                //     size: 14,
                                //     resource: {
                                //         primitive: 'circle',
                                //     },
                                //     material: {
                                //         color: [0, 0, 0, 0.6],
                                //     },
                                // },
                            ],
                        },
                    } as any);
                    measureLayer.graphics.add(geo3D);
                }
            }

            if (evt.state == 'complete') {
                pointList = [];
                toRaw(mesaureVerticalSketch.value).complete();
            }
        });
    } else {
        if (mesaureVerticalSketch.value !== null) {
            toRaw(mesaureVerticalSketch.value).destroy();
            mesaureVerticalSketch.value = null;
        }
    }
};

// 空间量算
const measureSpatialSketch = ref<any>(null);
const measureSpatial = (item: any) => {
    if (measureHorizontalSketch.value) {
        toRaw(measureHorizontalSketch.value).destroy();
        measureHorizontalSketch.value = null;
    }
    if (mesaureVerticalSketch.value) {
        toRaw(mesaureVerticalSketch.value).destroy();
        mesaureVerticalSketch.value = null;
    }
    if (measureAreaSketch.value) {
        toRaw(measureAreaSketch.value).destroy();
        measureAreaSketch.value = null;
    }

    if (item.isFocus) {
        let measureLayer = toRaw(viewStore.mapInstance).map.findLayerById(
            'measureLayer'
        );
        // 6.27 改变高程
        measureLayer.elevationInfo.mode = 'absolute-height';

        if (measureSpatialSketch.value == null) {
            debugger;
            let viewModel = new SketchViewModel({
                updateOnGraphicClick: false,
                polylineSymbol: {
                    type: 'line-3d',
                    symbolLayers: [
                        {
                            type: 'line',
                            size: 6,
                            material: { color: 'yellow' },
                            cap: 'round',
                            join: 'round',
                        },
                    ],
                },
            });
            measureSpatialSketch.value = new Sketch({
                viewModel: viewModel,
                labelOptions: {
                    enabled: false,
                },
                tooltipOptions: {
                    enabled: false,
                },
                layer: measureLayer,
                view: toRaw(viewStore.mapInstance),
                defaultCreateOptions: {
                    hasZ: true,
                },
                defaultUpdateOptions: {
                    enableZ: false,
                    tool: 'reshape',
                },
            });
            toRaw(measureSpatialSketch.value).create('polyline');
        }

        let pointList: any = [];
        toRaw(measureSpatialSketch.value).on('create', async (evt: any) => {
            if (
                evt.state !== 'complete' &&
                evt.toolEventInfo?.type == 'vertex-add'
            ) {
                console.log(evt, 'evt');
                let pointArr = evt.toolEventInfo.added[0] as any;
                let point = new Point({
                    x: pointArr[0],
                    y: pointArr[1],
                    z: pointArr[2],
                    spatialReference: toRaw(viewStore.mapInstance)
                        .spatialReference,
                });
                pointList.push(point);

                if (pointList.length > 1) {
                    const directLineMeasure = new DirectLineMeasurementAnalysis(
                        {
                            startPoint: pointList.at(-2),
                            endPoint: pointList.at(-1),
                            unit: 'metric',
                        }
                    );
                    toRaw(viewStore.mapInstance).analyses.add(
                        directLineMeasure
                    );
                    const analysisView = await toRaw(
                        viewStore.mapInstance
                    ).whenAnalysisView(directLineMeasure);
                    await reactiveUtils.whenOnce(() => !analysisView.updating);
                    analysisView.visible = false;

                    const result = analysisView.result;
                    console.log(result, 'result');
                    let geo3D = new Graphic({
                        geometry: pointList.at(-1),
                        symbol: {
                            type: 'point-3d',
                            verticalOffset: {
                                screenLength: 40,
                            },
                            callout: {
                                type: 'line',
                                size: 1.5,
                                color: [0, 0, 0, 0.6],
                            },
                            symbolLayers: [
                                {
                                    type: 'text',
                                    size: 14,
                                    text: `空间距离：${result.distance.value.toFixed(
                                        2
                                    )} m`,
                                    material: {
                                        color: 'white',
                                    },
                                    background: {
                                        color: [0, 0, 0, 0.6],
                                    },
                                },
                                // {
                                //     type: 'icon',
                                //     size: 14,
                                //     resource: {
                                //         primitive: 'circle',
                                //     },
                                //     material: {
                                //         color: [0, 0, 0, 0.6],
                                //     },
                                // },
                            ],
                        },
                    } as any);
                    measureLayer.graphics.add(geo3D);
                }
            }

            if (evt.state == 'complete') {
                pointList = [];
                toRaw(measureSpatialSketch.value).complete();
            }
        });
    } else {
        if (measureSpatialSketch.value !== null) {
            toRaw(measureSpatialSketch.value).destroy();
            measureSpatialSketch.value = null;
        }
    }
};

// 面积量算
const measureAreaSketch = ref<any>(null);
const measureArea = async (item: any) => {
    if (measureHorizontalSketch.value) {
        toRaw(measureHorizontalSketch.value).destroy();
        measureHorizontalSketch.value = null;
    }
    if (mesaureVerticalSketch.value) {
        toRaw(mesaureVerticalSketch.value).destroy();
        mesaureVerticalSketch.value = null;
    }
    if (measureSpatialSketch.value) {
        toRaw(measureSpatialSketch.value).destroy();
        measureSpatialSketch.value = null;
    }

    if (item.isFocus) {
        let measureLayer = toRaw(viewStore.mapInstance).map.findLayerById(
            'measureLayer'
        );
        // 6.27 改变高程
        measureLayer.elevationInfo.mode = 'on-the-ground';

        if (measureAreaSketch.value == null) {
            let viewModel = new SketchViewModel({
                updateOnGraphicClick: false,
                polygonSymbol: {
                    type: 'polygon-3d',
                    symbolLayers: [
                        {
                            type: 'fill',
                            material: { color: 'yellow' },
                            outline: { color: 'yellow' },
                            pattern: {
                                type: 'style',
                                style: 'cross',
                            },
                        },
                    ],
                },
            } as any);
            measureAreaSketch.value = new Sketch({
                viewModel: viewModel,
                labelOptions: {
                    enabled: false,
                },
                tooltipOptions: {
                    enabled: false,
                },
                layer: measureLayer,
                view: toRaw(viewStore.mapInstance),
                defaultCreateOptions: {
                    hasZ: true,
                },
                defaultUpdateOptions: {
                    enableZ: false,
                    tool: 'reshape',
                },
            });
            toRaw(measureAreaSketch.value).create('polygon');
        }
        toRaw(measureAreaSketch.value).on('create', async (evt: any) => {
            if (evt.state == 'complete') {
                console.log(evt, 'evt');
                // 6.27 计算转换后的面积
                let outSp = new SpatialReference({
                    wkid: 102100,
                });
                projection.load().then(() => {
                    let demo2OldGeo = projection.project(
                        evt.graphic.geometry,
                        outSp
                    ) as any;
                    let demo2NewGeo = geometryEngine.planarArea(
                        demo2OldGeo,
                        'square-meters'
                    );
                    let geo3D = new Graphic({
                        geometry: evt.graphic.geometry.centroid,
                        symbol: {
                            type: 'point-3d',
                            verticalOffset: {
                                screenLength: 40,
                            },
                            callout: {
                                type: 'line',
                                size: 1.5,
                                color: [0, 0, 0, 0.6],
                            },
                            symbolLayers: [
                                {
                                    type: 'text',
                                    size: 14,
                                    text: `面积：${demo2NewGeo.toFixed(2)} m²`,
                                    material: {
                                        color: 'white',
                                    },
                                    background: {
                                        color: [0, 0, 0, 0.6],
                                    },
                                },
                                // {
                                //     type: 'icon',
                                //     size: 14,
                                //     resource: {
                                //         primitive: 'circle',
                                //     },
                                //     material: {
                                //         color: 'red',
                                //     },
                                // },
                            ],
                        },
                    } as any);
                    measureLayer.graphics.add(geo3D);
                });

                // const areaMeasurement = new AreaMeasurementAnalysis({
                //     geometry: evt.graphic.geometry,
                // });
                // toRaw(viewStore.mapInstance).analyses.add(areaMeasurement);
                // const analysisView = await toRaw(
                //     viewStore.mapInstance
                // ).whenAnalysisView(areaMeasurement);
                // await reactiveUtils.whenOnce(() => !analysisView.updating);
                // analysisView.visible = false;

                // const result = analysisView.result;
                // console.log(result, 'result');

                // let geo3D = new Graphic({
                //     geometry: evt.graphic.geometry.centroid,
                //     symbol: {
                //         type: 'point-3d',
                //         verticalOffset: {
                //             screenLength: 40,
                //         },
                //         callout: {
                //             type: 'line',
                //             size: 1.5,
                //             color: 'red',
                //         },
                //         symbolLayers: [
                //             {
                //                 type: 'text',
                //                 size: 14,
                //                 text: `面积：${result.area.value.toFixed(
                //                     2
                //                 )} m²`,
                //                 material: {
                //                     color: 'yellow',
                //                 },
                //                 background: {
                //                     color: [0, 0, 0, 0.7],
                //                 },
                //             },
                //             {
                //                 type: 'icon',
                //                 size: 14,
                //                 resource: {
                //                     primitive: 'circle',
                //                 },
                //                 material: {
                //                     color: 'red',
                //                 },
                //             },
                //         ],
                //     },
                // } as any);
                // measureLayer.graphics.add(geo3D);
            }
        });
    } else {
        if (measureAreaSketch.value !== null) {
            toRaw(measureAreaSketch.value).destroy();
            measureAreaSketch.value = null;
        }
    }
};

// 三角测量
let triangleViewModel = <any>null;
const measureTriangle = (item: any) => {
    if (measureHorizontalSketch.value) {
        toRaw(measureHorizontalSketch.value).destroy();
        measureHorizontalSketch.value = null;
    }
    if (mesaureVerticalSketch.value) {
        toRaw(mesaureVerticalSketch.value).destroy();
        mesaureVerticalSketch.value = null;
    }
    if (measureSpatialSketch.value) {
        toRaw(measureSpatialSketch.value).destroy();
        measureSpatialSketch.value = null;
    }
    if (measureAreaSketch.value) {
        toRaw(measureAreaSketch.value).destroy();
        measureAreaSketch.value = null;
    }

    if (item.isFocus) {
        if (!triangleViewModel) {
            triangleViewModel = new DirectLineMeasurement3DViewModel({
                view: toRaw(viewStore.mapInstance),
            });
        }
        triangleViewModel.start();
        triangleViewModel.watch('state', (evt: any) => {
            if (evt === 'measured') {
                console.log(evt, 'evt');
                // 测量一次就关闭
                closeTriangle();
            }
        });
    } else {
        if (triangleViewModel) {
            triangleViewModel.clear();
        }
    }
};

// 关闭三角测量
const closeTriangle = () => {
    // 关闭所有量算微件
    measureList.value.filter((measureItem: any) => {
        if (measureItem.code === 'sjcl') {
            measureItem.isFocus = false;
        }
    });
};

/* 维度 */
const toggleDimension = (item: any) => {
    switch (toRaw(viewStore.mapInstance).constraints.tilt.max) {
        case 0.5:
            toRaw(viewStore.mapInstance).constraints.tilt.max = 179.5;
            toRaw(viewStore.mapInstance).goTo({
                tilt: 45,
            });
            ElMessage.success('当前视图：三维');
            break;
        case 179.5:
            toRaw(viewStore.mapInstance).constraints.tilt.max = 0.5;
            ElMessage.success('当前视图：二维');
            break;
        default:
            break;
    }
    viewStore.handleMaxTilt(toRaw(viewStore.mapInstance).constraints.tilt.max);
};

/* 分屏 */
const showSplit = ref<boolean>(false);
const handleSplitMap = (item: any) => {
    if (toRaw(viewStore.mapInstance).constraints.tilt.max === 0.5)
        return ElMessage.warning('请切换至三维模式后进入分屏');
    showSplit.value = !showSplit.value;
    viewStore.handleSplit(showSplit.value);
    let splitObj = {
        showSplit: showSplit.value,
        splitMode: viewStore.splitMode,
    };
    if (showSplit.value) {
        nextTick(() => {
            emitSplit('setSplitMap', splitObj);
        });
    }
};

/* 属性 */
const attrVisible = ref(false);
const attrLayer = ref<any>();
const attrList = ref<any>([]);
const attrTable = ref(<any>[]);
const clickAttrEvent = ref();
const watchAttrEvent = ref();
const currAttrGeo = ref<any>();
const handleAttr = (item: any) => {
    closeMeasure();
    closeBasemap();
    closeScale();
    closeSplit();
    closeLendon();
    closeSwipe();
    closeSlice();

    if (item.isFocus) {
        clickAttrEvent.value = toRaw(viewStore.mapInstance).on(
            'click',
            async (evt: any) => {
                console.log(evt, 'evt');
                let visibleLayers = toRaw(
                    viewStore.mapInstance
                ).map.layers.filter((layer: any) => {
                    return layer.visible;
                });
                console.log(visibleLayers, 'visibleLayers');
                // 二维图层数组
                let mapLayers: any = [];
                visibleLayers.filter((vLayer: any) => {
                    console.log(vLayer, 'vLayer');

                    // 建筑服务
                    if (vLayer.type == 'building-scene') {
                        vLayer.allSublayers.find((sub: any) => {
                            sub.popupEnabled = true;
                        });
                    }
                    // scene场景服务
                    else if (vLayer.type == 'scene') {
                        vLayer.popupEnabled = true;
                    }
                    // 动态服务
                    else {
                        mapLayers.push(vLayer);
                    }
                });
                console.log(mapLayers, 'mapLayers');
                if (mapLayers.length > 0) {
                    fitMapAttr(mapLayers, evt);
                }
            }
        );
        watchAttrEvent.value = toRaw(viewStore.mapInstance).watch(
            'popup.viewModel.active',
            () => {
                console.log(
                    toRaw(viewStore.mapInstance).popup.selectedFeatureWidget
                );
                let geo = toRaw(viewStore.mapInstance).popup
                    ?.selectedFeatureWidget?.graphic;
                if (geo) {
                    geo.symbol = {
                        type: 'simple-fill',
                        color: [0, 255, 255, 0.25],
                        outline: {
                            width: 0,
                        },
                    };
                    toRaw(viewStore.mapInstance).graphics.removeAll();
                    toRaw(viewStore.mapInstance).graphics.add(geo);
                }
            }
        );
    } else {
        let visibleLayers = toRaw(viewStore.mapInstance).map.layers.filter(
            (layer: any) => {
                return layer.visible;
            }
        );
        console.log(visibleLayers, 'visibleLayers');
        visibleLayers.filter((vLayer: any) => {
            if (vLayer.type == 'building-scene' || vLayer.type == 'map-image') {
                vLayer.allSublayers.find((sub: any) => {
                    sub.popupEnabled = false;
                });
            } else {
                vLayer.popupEnabled = false;
            }
        });
        clickAttrEvent.value?.remove();
        watchAttrEvent.value?.remove();
        toRaw(viewStore.mapInstance).graphics.removeAll();
    }
};

/* 测试新版属性 */
const handleAttr2 = (item: any) => {
    if (item.isFocus) {
        clickAttrEvent.value = toRaw(viewStore.mapInstance).on(
            'click',
            (evt: any) => {
                console.log(evt, 'evt');
                let mapPoint = toRaw(viewStore.mapInstance).toMap({
                    x: evt.x,
                    y: evt.y,
                });
                toRaw(viewStore.mapInstance)
                    .hitTest(evt)
                    .then((res: any) => {
                        console.log(res, 'res');
                        const highGeo = res.results[0].graphic;
                        highGeo.symbol = {
                            type: 'simple-fill',
                            color: [0, 255, 255, 0.25],
                            outline: {
                                width: 0,
                            },
                        };
                        toRaw(viewStore.mapInstance).graphics.add(highGeo);
                    });
            }
        );
    }
};
// 属性数组
let attrSelData: any = [];
let attrTableData: any = [];
let attrIndex: number = 0;
const fitMapAttr = async (mapLayers: any, evt: any) => {
    attrSelData = [];
    attrTableData = [];
    attrIndex = 0;
    for await (const layer of mapLayers) {
        let subVlayerIds: any = [];
        if (layer.allSublayers) {
            layer.allSublayers.filter((subVlayer: any) => {
                subVlayerIds.push(subVlayer.id);
            });

            let identifyPms = new IdentifyParameters({
                geometry: evt.mapPoint,
                mapExtent: toRaw(viewStore.mapInstance).extent,
                tolerance: 1,
                returnGeometry: true,
                layerIds: subVlayerIds,
            });
            const res = await identify.identify(layer.url, identifyPms);
            console.log(res, 'res');
            console.log(layer, 'layer');

            if (res.results.length > 0) {
                res.results.map((feature: any) => {
                    attrSelData.push({
                        label: feature.layerName,
                        url: `${layer.url}/${feature.layerId}`,
                        id: attrIndex,
                    });
                    attrTableData.push({
                        id: attrIndex,
                        geo: feature.feature.geometry,
                        attr: feature.feature.attributes,
                    });
                    attrIndex++;
                });
            }
        }
    }
    if (attrSelData.length > 0) {
        attrList.value = attrSelData;
        attrLayer.value = attrSelData[0].id;
        let newAttrList = [];
        for (const item in attrTableData[0].attr) {
            if (!item.toUpperCase().includes('SHAPE')) {
                console.log(item, 'item');
                newAttrList.push({
                    label: item,
                    value: attrTableData[0].attr[item],
                });
            }
        }
        attrTable.value = newAttrList;
        currAttrGeo.value = attrTableData[0].geo;
        attrVisible.value = true;
        toRaw(viewStore.mapInstance).graphics.removeAll();
        toRaw(viewStore.mapInstance).graphics.add(
            new Graphic({
                geometry: toRaw(attrTableData[0].geo),
                symbol: {
                    type: 'simple-fill',
                    color: [0, 255, 255, 0.5],
                    outline: {
                        width: 0,
                    },
                } as any,
            })
        );
        console.log(
            toRaw(viewStore.mapInstance),
            ' toRaw(viewStore.mapInstance)'
        );
    } else {
        toRaw(viewStore.mapInstance).graphics.removeAll();
        attrVisible.value = false;
    }
};
const closeAttr = () => {
    toolList.value.map((item: any) => {
        item.code === 'sx' ? (item.isFocus = false) : '';
    });
    toRaw(viewStore.mapInstance).graphics.removeAll();
    let visibleLayers = toRaw(viewStore.mapInstance).map.layers.filter(
        (layer: any) => {
            return layer.visible;
        }
    );
    console.log(visibleLayers, 'visibleLayers');
    visibleLayers.filter((vLayer: any) => {
        if (vLayer.type == 'building-scene' || vLayer.type == 'map-image') {
            vLayer.allSublayers.find((sub: any) => {
                sub.popupEnabled = false;
            });
        } else {
            vLayer.popupEnabled = false;
        }
    });
    clickAttrEvent.value?.remove();
    watchAttrEvent.value?.remove();
    attrVisible.value = false;
};
const changeAttr = (id: number) => {
    console.log(id, 'id');
    attrTableData.filter((attrItem: any) => {
        if (attrItem.id == id) {
            let newAttrList = [];
            for (const item in attrItem.attr) {
                if (!item.toUpperCase().includes('SHAPE')) {
                    console.log(item, 'item');
                    newAttrList.push({
                        label: item,
                        value: attrItem.attr[item],
                    });
                }
            }
            console.log(newAttrList, 'newAttrList');

            attrTable.value = newAttrList;
            currAttrGeo.value = attrItem.geo;
            let geo = new Graphic({
                geometry: toRaw(currAttrGeo.value),
                symbol: {
                    type: 'simple-fill',
                    color: [0, 255, 255, 0.5],
                    outline: {
                        width: 0,
                    },
                } as any,
            });
            toRaw(viewStore.mapInstance).graphics.removeAll();
            toRaw(viewStore.mapInstance).graphics.add(geo);
        }
    });
};
const locateGeo = () => {
    console.log(currAttrGeo.value, 'currAttrGeo.value');
    toRaw(viewStore.mapInstance).goTo(toRaw(currAttrGeo.value).extent);
};

/* 清除 */
const clearGeo = (item: any) => {
    let findMeasureLayer = toRaw(viewStore.mapInstance).map.findLayerById(
        'measureLayer'
    );
    if (findMeasureLayer) {
        findMeasureLayer.graphics.removeAll();
    }
    // 清除三角量算微件
    if (triangleViewModel) {
        triangleViewModel.clear();
    }
};

/* 底图 */
const toggleBase = (item: any) => {
    closeMeasure();
    closeAttr();
    closeScale();
    closeSplit();
    closeLendon();
    closeSwipe();
    closeSlice();

    if (item.isFocus) {
        basemapList.value = [...mapStore.baseInfo.base];
        elevList.value = [...mapStore.baseInfo.elev];
        const { viewStore } = useStore();

        // 底图
        basemapList.value.map((baseItem: any) => {
            Object.assign(baseItem, { isFocus: false });
            toRaw(viewStore.mapInstance).map.basemap.baseLayers.items.map(
                (viewBaseItem: any) => {
                    debugger;
                    if (
                        viewBaseItem.visible &&
                        String(viewBaseItem.id) == String(baseItem.pid)
                    ) {
                        baseItem.isFocus = true;
                    }
                }
            );
        });
        // 高程
        elevList.value.map((baseItem: any) => {
            Object.assign(baseItem, { isFocus: false });
            toRaw(viewStore.mapInstance).map.ground.layers.items.map(
                (viewBaseItem: any) => {
                    debugger;
                    if (
                        viewBaseItem.visible &&
                        String(viewBaseItem.id) == String(baseItem.pid)
                    ) {
                        baseItem.isFocus = true;
                    }
                }
            );
        });
    }
    baseVisible.value = item.isFocus;
};

// 工具栏-底图
const baseVisible = ref(false);
const basemapList = ref<any>([]);
const elevList = ref<any>([]);

// 组装底图图片路径
const returnIconUrl = (item: any) => {
    return window.apiResource + item.iconUrl;
};
// 关闭底图弹窗
const closeBasemap = () => {
    toolList.value.map((item: any) => {
        item.code === 'dt' ? (item.isFocus = false) : '';
    });
    baseVisible.value = false;
};
// 底图切换
const handleBase = (item: any) => {
    // 控制底图工具栏状态显隐
    basemapList.value.map((subItem: any) => {
        subItem == item
            ? (item.isFocus = !item.isFocus)
            : (subItem.isFocus = false);
    });

    // 控制底图显隐
    toRaw(viewStore.mapInstance).map.basemap.baseLayers.items.map(
        (baseItem: any) => {
            baseItem.visible = false;
            if (
                String(baseItem.id) == String(item.pid) ||
                String(baseItem.id).replaceAll('label-', '') == String(item.pid)
            ) {
                baseItem.visible = item.isFocus;
            }
        }
    );

    // 控制分屏底图显隐
    if (viewStore.viewSplit) {
        toRaw(viewStore.splitInstance).map.basemap.baseLayers.items.map(
            (baseItem: any) => {
                baseItem.visible = false;
                if (
                    String(baseItem.id) == String(item.pid) ||
                    String(baseItem.id).replaceAll('label-', '') ==
                        String(item.pid)
                ) {
                    baseItem.visible = item.isFocus;
                }
            }
        );
    }
};
// 高程切换
const handleElev = (item: any) => {
    console.log(item, 'elevitem');
    // 控制底图-高程图层工具栏状态显隐
    elevList.value.map((subItem: any) => {
        subItem == item
            ? (item.isFocus = !item.isFocus)
            : (subItem.isFocus = false);
    });

    // 控制高程显隐
    console.log(toRaw(viewStore.mapInstance).map);
    toRaw(viewStore.mapInstance).map.ground.layers.items.map(
        (elevItem: any) => {
            if (String(elevItem.id) == String(item.pid)) {
                elevItem.visible = item.isFocus;
            } else {
                elevItem.visible = false;
            }
        }
    );

    // 控制分屏高程显隐
    if (viewStore.viewSplit) {
        toRaw(viewStore.splitInstance).map.ground.layers.items.map(
            (elevItem: any) => {
                if (String(elevItem.id) == String(item.pid)) {
                    elevItem.visible = item.isFocus;
                } else {
                    elevItem.visible = false;
                }
            }
        );
    }
};

/* 工具栏-分屏 */
const splitVisible = ref(false);
/* 关闭分屏弹窗 */
const closeSplit = () => {
    toolList.value.map((item: any) => {
        item.code === 'fp' ? (item.isFocus = false) : '';
    });
    splitVisible.value = false;
    viewStore.handleSplit(splitVisible.value);
    console.log(viewStore.viewSplit, 'viewStore.viewSplit');
    let splitObj = {
        showSplit: viewStore.viewSplit,
        container: [],
    };
    nextTick(() => {
        viewStore.handleSplitMode(0);
        emitSplit('setSplitMap', splitObj);
    });
};
/*
    分屏模式
*/
const handleSplit = (item: any) => {
    if (toRaw(viewStore.mapInstance).constraints.tilt.max === 0.5)
        return ElMessage.warning('请切换至三维模式后进入分屏');

    closeMeasure();
    closeAttr();
    closeScale();
    closeBasemap();
    closeLendon();
    closeSwipe();
    closeSlice();

    splitVisible.value = item.isFocus;
    viewStore.handleSplit(splitVisible.value);
};

/*
    联动
*/
const handleLendon = (lendonItem: any) => {
    closeMeasure();
    closeAttr();
    closeScale();
    closeBasemap();
    closeSplit();
    closeSwipe();
    closeSlice();
    viewStore.handleLendon(lendonItem.isFocus);
    if (!lendonItem.isFocus) {
        closeLendon();
    }
    nextTick(() => {
        emitSplit('setLengonView');
    });
};
const closeLendon = () => {
    viewStore.handleLendon(false);
    toolList.value.map((item: any) => {
        item.code === 'ld' ? (item.isFocus = false) : '';
    });
};

/* 剖切 */
let viewModel = <any>null;
const handleSlice = (item: any) => {
    debugger;
    if (toRaw(viewStore.mapInstance).constraints.tilt.max === 0.5)
        return ElMessage.warning('请切换至三维模式后进入分屏');

    closeMeasure();
    closeAttr();
    closeScale();
    closeBasemap();
    closeLendon();
    closeSwipe();
    closeLendon();
    viewStore.handleSlice(item.isFocus);
    if (!item.isFocus) {
        closeSlice();
    } else {
        const analysis = new SliceAnalysis({
            shape: {
                type: 'plane', // autocasts as new SlicePlane()
                position: {
                    type: 'point',
                    x: 436111.8,
                    y: 2825300.7,
                    z: 10,
                },
                width: 20,
                height: 20,
                tilt: 0,
                heading: 0.46,
            },
            type: 'slice',
        } as any);

        toRaw(viewStore.mapInstance).analyses.add(analysis);
        //toRaw(viewStore.mapInstance).goTo(analysis.extent);
        viewModel = new SliceViewModel({
            analysis: analysis,
            view: toRaw(viewStore.mapInstance),
            excludeGroundSurface: true,
            tiltEnabled: false,
        });
        viewModel.start();
    }
};

const closeSlice = () => {
    viewStore.handleSlice(false);
    viewModel?.clear();
    viewModel?.destroy();
    viewModel = null;
    toolList.value.map((item: any) => {
        item.code === 'pq' ? (item.isFocus = false) : '';
    });
};
</script>
<style lang="scss" scoped>
@use './tool.scss';
</style>
