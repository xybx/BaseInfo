<template>
    <div
        class="tool-bar"
        :class="menuStore.layerIsShow ? '' : 'tool-transform'"
    >
        <el-dialog
            v-model="dialogVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-basemap"
            @close="closeLocate"
        >
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">控高分析</span>
                    <el-popover
                        placement="bottom-start"
                        :width="200"
                        trigger="hover"
                        content="注意事项文本占位"
                    >
                        <template #reference>
                            <i class="iconfont icon-shuxing"></i>
                        </template>
                    </el-popover>
                </span>
            </template>
            <div class="tool-main">
                <div class="build-form">
                    <div>
                        <span class="build-label">分析服务</span>
                        <el-select
                            v-model="currSel"
                            placeholder="请选择服务"
                            @change="changeServer"
                            value-key="pid"
                        >
                            <el-option
                                v-for="item in serveOptions"
                                :key="item.pid"
                                :label="item.label"
                                :value="item"
                            />
                        </el-select>
                    </div>
                    <div>
                        <span class="build-label">限制高度</span>
                        <el-input-number v-model="wideValue" :min="1" />
                    </div>
                </div>

                <div>
                    <el-button type="primary" @click="handleRender"
                        >绘制范围</el-button
                    >
                    <el-button type="warning" @click="clearRender"
                        >清除</el-button
                    >
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, reactive, watch, toRaw, onMounted } from 'vue';
import useStore from '@/stores';

/* UI 相关 */
import { ElMessage } from 'element-plus';

/* ArcGIS API */
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js';
import GroupLayer from '@arcgis/core/layers/GroupLayer.js';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic.js';
import * as promiseUtils from '@arcgis/core/core/promiseUtils.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol.js';

/* API */
import { initLayerByKind } from '@/utils/common-map';

const { menuStore, viewStore, mapStore } = useStore();

const dialogVisible = ref(false);

const closeLocate = () => {
    if (groupLayer) {
        toRaw(viewStore.mapInstance).map.remove(groupLayer);
        groupLayer = null;
    }
    currSel.value = null;
    clearRender();
    // 菜单恢复初始值
    if (menuStore.currFunc == 'kgfx') {
        menuStore.handleFunc('');
    }
};

/*
    图层选择
    TODO 暂时固定数据、功能未完成
*/
const currSel = ref<any>(null);
const serveOptions = ref<any>(window.highOpt.renderData);

const wideValue = ref(0);

/* 更新 */
const updateSceneLayer = () => {
    const query = sceneLayerView.createQuery();
    query.geometry = sketchGeometry;
    sceneLayerView.queryObjectIds(query).then((response: any) => {
        // 消除建筑
        showLayer.filter = {
            geometries: [sketchGeometry],
            spatialRelationship: 'disjoint',
        };

        renderHighBox();
        calcHigh();
    });
};

// 渲染高度盒子
let highBoxGraphic = <any>null;
const renderHighBox = () => {
    var symbol3D = {
        type: 'polygon-3d',
        symbolLayers: [
            {
                type: 'extrude',
                size: wideValue.value,
                material: {
                    color: [255, 251, 240, 0],
                },
                edges: {
                    type: 'solid',
                    //color: "#D40737",
                    color: 'blue',
                    size: 1.5,
                },
            },
        ],
    };

    let graphic = new Graphic({
        geometry: sketchGeometry,
        symbol: symbol3D,
    } as any);
    debugger;
    highBoxGraphic = graphic;
    // bufferLayer.add(graphic);
    sketchLayer.add(graphic);
};

// 控高计算
const calcHigh = () => {
    debugger;
    let feaLayer = new FeatureLayer({
        id: `fea-${currSel.value.pid}`,
        url: currSel.value.feaurl,
        outFields: ['*'],
        geometryType: 'polygon',
    });
    let query = feaLayer.createQuery();
    query.geometry = sketchGeometry;
    query.spatialRelationship = 'intersects';
    query.returnGeometry = true;
    query.outFields = ['*'];
    query.multipatchOption = 'xyFootprint';

    feaLayer.queryFeatures(query).then((response: any) => {
        console.log(response, 'featureres');
        renderBuilding(response.features);
    });
};

// 渲染建筑
const renderBuilding = (features: any) => {
    for (const key in features) {
        let attr = features[key].attributes;
        let height = Number(attr[currSel.value.highfield]) - wideValue.value;
        let type =
            Math.abs(height - wideValue.value) <= 3
                ? '0'
                : height - wideValue.value > 0
                ? '1'
                : '-1';
        let rings = features[key].geometry.rings[0];
        let graphic = null;

        if (type == '-1') {
            let color = [0, 238, 0, 0.5];
            let d3symbol = createExtrudePolygonSymbol(
                color,
                height,
                color,
                null
            );
            graphic = createPolygon(rings, d3symbol);
        } else if (type == '1') {
            let color = [205, 0, 0, 0.5];
            let d3symbol = createExtrudePolygonSymbol(
                color,
                height,
                color,
                null
            );
            graphic = createPolygon(rings, d3symbol);

            let point = { x: rings[0][0], y: rings[0][1], z: 0 };
            // let name = attr.N_SQ_AR;
            // let name = attr['乡镇名'];
            let labelText = '超出' + (height - wideValue.value).toFixed(2);
            createLabel(point, labelText, height + 10);
        } else if (type == '0') {
            let color = [255, 255, 0, 0.5];
            let d3symbol = createExtrudePolygonSymbol(
                color,
                height,
                color,
                null
            );
            graphic = createPolygon(rings, d3symbol);
        }

        console.log(graphic, 'graphic');

        graphic3DLayer.add(graphic);
    }
};

const createLabel = (position: any, labelText: any, zHeight: any) => {
    var symbol = createTextSymbol(labelText, 'white', 12, 'black', {});
    var labelGraphic = new Graphic({
        geometry: {
            type: 'point',
            x: position.x,
            y: position.y,
            z: zHeight,
            hasZ: true,
            spatialReference: {
                wkid: toRaw(viewStore.mapInstance).spatialReference.wkid,
            },
        },
        symbol: symbol,
    } as any);
    textLayer.add(labelGraphic);
};
const createTextSymbol = function (
    text: any,
    textColor: any,
    size: any,
    haloColor: any,
    options: any
) {
    options = options || {};
    options = JSONConcat(options, { haloSize: 1 });
    var haloSize = options['haloSize'];
    var textsymbol = {
        type: 'text',
        color: textColor || [49, 163, 84],
        text: text,
        haloColor: haloColor || [255, 140, 0],
        haloSize: haloSize || 10,
        // font: { size: size || 2, family: 'Josefin Slab', weight: 'bold' },
        font: { size: size || 2, weight: 'bold' },
        xoffset: 0,
        yoffset: 0,
        angle: 0,
    };
    return textsymbol;
};

function JSONConcat(A: any, B: any) {
    for (var name in B) if (A[name] == undefined) A[name] = B[name];
    return A;
}
const createExtrudePolygonSymbol = (
    color: any,
    size: any,
    edgesColor: any,
    options: any
) => {
    var defaultOption = { edgesSize: 2, elevation: false };
    options = options || {};
    JSONConcat(options, defaultOption);
    var edgesSize = options['edgesSize'];
    console.log(edgesSize);

    debugger;
    var extrudeSymbol = {
        type: 'polygon-3d',
        symbolLayers: [
            {
                type: 'extrude',
                size: size || 10,
                material: { color: color || [0, 192, 255, 0.7] },
                edges: {
                    color: edgesColor || [255, 255, 255],
                    type: 'solid',
                    size: edgesSize,
                },
                castShadow: false,
            },
        ],
    };
    // if (options.elevation)
    //     symbol3D.symbolLayers[0].elevationInfo = {
    //         mode: 'absolute-height',
    //         offset: options.elevation,
    //         unit: 'meters',
    //     };
    return extrudeSymbol;
};

let _isAbsElevation = void 0;
let _shiftPos = { x: 0, y: 0, z: 0 };
const createPolygon = (a: any, d: any) => {
    d =
        d ||
        new SimpleFillSymbol({
            color: [227, 139, 79, 0.8],
            outline: { color: [255, 255, 255], width: 1 },
        });
    var b = [];
    if (a && void 0 != a[0].x)
        for (var e = 0; e < a.length; e++) {
            var f = [a[e].x, a[e].y];
            void 0 != a[e].z && 0 != a[e].z && f.push(a[e].z);
            _isAbsElevation && 2 == f.length && f.push(0);
            _shiftPos &&
                ((f[0] += _shiftPos.x),
                (f[1] += _shiftPos.y),
                2 < f.length && _shiftPos.z && (f[2] += _shiftPos.z));
            b.push(f);
        }
    else b = a;
    a = new Polygon({
        hasZ: !1,
        hasM: !1,
        rings: [b],
        spatialReference: {
            wkid: toRaw(viewStore.mapInstance).spatialReference.wkid,
        },
    });

    return new Graphic({ geometry: a, symbol: d });
};

/* 绘制范围 */
let groupLayer = <any>null;
let sketchLayer = <any>null;
let sceneLayerView = <any>null;
let sketchTool = <any>null;
let sketchGeometry = <any>null;
let graphic3DLayer = <any>null;
let textLayer = <any>null;
const handleRender = async () => {
    if (!Boolean(currSel.value)) return ElMessage.warning('请先选择分析服务');

    /* 绘制图层 */
    if (!sketchLayer) {
        sketchLayer = new GraphicsLayer({
            id: 'roadsketch',
            elevationInfo: {
                mode: 'on-the-ground',
            },
        });
        toRaw(viewStore.mapInstance).map.layers.add(sketchLayer);
    }

    if (!graphic3DLayer) {
        graphic3DLayer = new GraphicsLayer({
            elevationInfo: {
                mode: 'on-the-ground',
                offset: 0,
            },
        });
        toRaw(viewStore.mapInstance).map.layers.add(graphic3DLayer);
    }

    if (!textLayer) {
        textLayer = new GraphicsLayer({
            elevationInfo: {
                mode: 'relative-to-ground',
                offset: 0,
            },
        });
        toRaw(viewStore.mapInstance).map.layers.add(textLayer);
    }

    /* 绘制工具 */
    if (!sketchTool) {
        sketchTool = new SketchViewModel({
            layer: sketchLayer,
            view: toRaw(viewStore.mapInstance),
            polygonSymbol: {
                type: 'polygon-3d',
            },
            polylineSymbol: {
                type: 'simple-line',
                color: [255, 0, 0],
                width: 2,
            },
        } as any);
    }

    sketchLayer.graphics.removeAll();

    toRaw(sketchTool).create('polygon');
    toRaw(sketchTool).on('create', (evt: any) => {
        if (evt.state == 'complete') {
            sketchGeometry = evt.graphic.geometry;
            console.log(evt, 'evt');

            let analyseLayer = <any>null;
            sketchTool.destroy();
            sketchTool = null;

            analyseLayer = groupLayer.findLayerById(
                `build-${currSel.value.pid}`
            );

            console.log(analyseLayer, 'analyseLayer');

            toRaw(viewStore.mapInstance)
                .whenLayerView(analyseLayer)
                .then((layerView: any) => {
                    sceneLayerView = layerView;
                    updateSceneLayer();
                });
        }
    });
};

/* 下拉框选择事件 */
let showLayer = <any>null;
const changeServer = async (obj: any) => {
    console.log(obj, 'obj');
    if (!groupLayer) {
        groupLayer = new GroupLayer({
            id: 'fxGroupLayer',
            visibilityMode: 'exclusive',
        });
        toRaw(viewStore.mapInstance).map.add(groupLayer);
    }

    /* 避免与主图层重复 */
    showLayer = groupLayer.findLayerById(`build-${currSel.value.pid}`);
    if (!showLayer) {
        let obj = Object.assign({}, currSel.value, {
            pid: `build-${currSel.value.pid}`,
        });
        showLayer = await initLayerByKind(obj, true);
        groupLayer.add(showLayer, currSel.value.order);
        toRaw(viewStore.mapInstance).goTo(showLayer.fullExtent);
    } else {
        showLayer.visible = true;
    }
};

/* 清除范围 */
const clearRender = () => {
    wideValue.value = 1;
    if (showLayer?.filter) {
        showLayer.filter = {};
    }
    graphic3DLayer?.removeAll();
    textLayer?.removeAll();
    sketchLayer?.removeAll();
    sketchGeometry = null;
};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'kgfx') {
        dialogVisible.value = true;
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './highlimit.scss';
</style>
