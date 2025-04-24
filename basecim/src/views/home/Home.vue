<template>
    <div class="index-container" v-loading="viewStore.skyLoading" element-loading-text="正在分析,请稍后..">
        <!-- 图层栏 -->
        <map-layer></map-layer>
        <!-- 图文关联 -->
        <layer-link></layer-link>

        <!-- 左上操作栏 -->
        <map-handle></map-handle>

        <!-- 工具栏 -->
        <map-tool @setSplitMap="setSplitMap" @setLengonView="setLengonView" @setSwipeView="setSwipeView"></map-tool>

        <!-- 动态栏 -->
        <map-active v-if="showActive"></map-active>

        <!-- 坐标定位 -->
        <coord-locate></coord-locate>
        <!-- 场景书签 -->
        <scene-mark></scene-mark>
        <!-- 标注坐标 -->
        <mark-coord></mark-coord>
        <!-- 图标绘制 -->
        <icon-draw></icon-draw>
        <!-- 通视分析 -->
        <light-sight></light-sight>
        <!-- 控高分析 -->
        <!-- <height-control></height-control> -->
        <high-limit></high-limit>
        <!-- 场景录制 -->
        <scene-record></scene-record>
        <!-- 日照阴影分析 -->
        <day-light-vue></day-light-vue>
        <!-- 建筑量分析 -->
        <build-analyse></build-analyse>
        <!-- 道路拓宽 -->
        <road-wide></road-wide>
        <!-- 步行 -->
        <walk-scene></walk-scene>
        <!-- 驾车 -->
        <drive-scene></drive-scene>
        <!-- 飞行 -->
        <fly-scene></fly-scene>
        <!-- 漫游导览 -->
        <wander-guide></wander-guide>
        <!-- 地名查询 -->
        <place-query></place-query>
        <!-- 建设工程项目 -->
        <build-project></build-project>
        <!-- 缓冲区分析 -->
        <buffer-analyse></buffer-analyse>
        <!-- 叠加分析 -->
        <over-analyse></over-analyse>
        <!-- 统计分析 -->
        <stat-analyse></stat-analyse>
        <!-- 视廊分析 -->
        <gallery-analyse></gallery-analyse>
        <!-- 天际线分析 -->
        <sky-line></sky-line>
        <!-- 红线分析 -->
        <red-line></red-line>
        <!-- 白模渲染 -->
        <model-render></model-render>
        <!-- 人口分布分析 -->
        <people-stat></people-stat>
        <!-- 可视域分析 -->
        <view-shed></view-shed>
        <!-- 项目管理 -->
        <project-manage></project-manage>
        <!-- 项目管理-方案简介 -->
        <scheme-intro></scheme-intro>
        <!-- 项目管理-经济指标 -->
        <eco-index></eco-index>
        <!-- 项目管理-控制指标 -->
        <control-index></control-index>
        <!-- 项目管理-方案汇演 -->
        <scheme-hy></scheme-hy>

        <!-- 地图 -->
        <div id="map"></div>
        <!-- 联动地图 -->
        <div id="map2d" v-if="viewStore.splitLendon"></div>
        <!-- 卷帘地图 -->
        <div id="map-swipe" v-if="viewStore.splitSwipe"></div>
        <div id="swipe-line" v-if="viewStore.splitSwipe">
            <el-icon class="swipe-circle">
                <DCaret />
            </el-icon>
        </div>

        <!-- 分屏地图 -->
        <!-- <div id="splitMap" v-if="viewStore.viewSplit"></div> -->

        <!-- 双屏 -->
        <div class="split-mode-1" id="splitMap" v-if="viewStore.splitMode === 1"></div>
        <!-- 三屏 -->
        <div class="split-mode-2" v-if="viewStore.splitMode === 2">
            <div id="splitMap1"></div>
            <div id="splitMap2"></div>
        </div>
    </div>
</template>
<script lang="ts" setup>
/* Vue 相关 */
import { ref, onMounted, toRaw, nextTick } from 'vue';
import useStore from '@/stores';

/* UI 相关 */
import { ElMessage } from 'element-plus';

/* 引用组件 */
import MapLayer from '@/components/map/layer/Layer.vue';
import MapHandle from '@/components/map/handle/Handle.vue';
import MapTool from '@/components/map/tool/Tool.vue';
import MapActive from '@/components/map/active/Active.vue';
import CoordLocate from '@/components/map/header/spatialquery/coordlocate/CoordLocate.vue';
import SceneMark from '@/components/map/header/sceneguide/scenemark/SceneMark.vue';
import MarkCoord from '@/components/map/header/markmanage/markcoord/MarkCoord.vue';
import IconDraw from '@/components/map/header/markmanage/icondraw/IconDraw.vue';
import LightSight from '@/components/map/header/3danalyse/lightsight/LightSight.vue';
import HeightControl from '@/components/map/header/3danalyse/heightcontrol/HeightControl.vue';
import SceneRecord from '@/components/map/header/sceneguide/scenerecord/SceneRecord.vue';
import DayLightVue from '@/components/map/header/3danalyse/daylight/DayLight.vue';
import BuildAnalyse from '@/components/map/header/3dsimulate/buildanalyse/BuildAnalyse.vue';
import RoadWide from '@/components/map/header/3dsimulate/roadwide/RoadWide.vue';
import WalkScene from '@/components/map/header/sceneguide/walkscene/WalkScene.vue';
import DriveScene from '@/components/map/header/sceneguide/drivescene/DriveScene.vue';
import FlyScene from '@/components/map/header/sceneguide/flyscene/FlyScene.vue';
import WanderGuide from '@/components/map/header/sceneguide/wanderguide/WanderGuide.vue';
import PlaceQuery from '@/components/map/header/spatialquery/placequery/PlaceQuery.vue';
import BuildProject from '@/components/map/header/spatialquery/buildproject/BuildProject.vue';
import BufferAnalyse from '@/components/map/header/spatialquery/bufferanalyse/BufferAnalyse.vue';
import OverAnalyse from '@/components/map/header/spatialquery/overanalyse/OverAnalyse.vue';
import StatAnalyse from '@/components/map/header/spatialquery/statanalyse/StatAnalyse.vue';
import GalleryAnalyse from '@/components/map/header/3danalyse/galleryanalyse/GalleryAnalyse.vue';
import SkyLine from '@/components/map/header/3danalyse/skyline/SkyLine.vue';
import RedLine from '@/components/map/header/3danalyse/redline/RedLine.vue';
import ModelRender from '@/components/map/header/3dsimulate/modelrender/ModelRender.vue';
import PeopleStat from '@/components/map/header/3dsimulate/peoplestat/PeopleStat.vue';
import LayerLink from '@/components/map/layer/layerlink/LayerLink.vue';
import ViewShed from '@/components/map/header/3danalyse/viewshed/ViewShed.vue';
import ProjectManage from '@/components/map/header/planconsult/projectmanage/ProjectManage.vue';
import SchemeIntro from '@/components/map/header/planconsult/projectmanage/components/schemeintro/SchemeIntro.vue';
import EcoIndex from '@/components/map/header/planconsult/projectmanage/components/ecoindex/EcoIndex.vue';
import ControlIndex from '@/components/map/header/planconsult/projectmanage/components/controlindex/ControlIndex.vue';
import SchemeHy from '@/components/map/header/planconsult/projectmanage/components/schemehy/SchemeHy.vue';
import HighLimit from '@/components/map/header/3danalyse/highlimit/HighLimit.vue';

/* ArcGIS API */
import Basemap from '@arcgis/core/Basemap';
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import Ground from '@arcgis/core/Ground';
import Compass from '@arcgis/core/widgets/Compass';
import Zoom from '@arcgis/core/widgets/Zoom';
import Point from '@arcgis/core/geometry/Point';
import NavigationToggle from '@arcgis/core/widgets/NavigationToggle';
import MapView from '@arcgis/core/views/MapView.js';
import Track from '@arcgis/core/widgets/Track';

/* 接口API */
import { initMapApi } from './home-api';
import { initLayerByKind } from '@/utils/common-map';

/* 取值 pinia */
const { viewStore, mapStore } = useStore();

/* 初始化地图 */
let sceneView = <any>null;
let mapZoom = <any>null;
let mapCamera = <any>null;
let mapFullScreen = ref<boolean>(false);
/* 显示动态组件 */
const showActive = ref<boolean>(false);
const initMap = async () => {
    /*
        maptype:1-二维,2-三维
        prjtype:1-arcgis,2-cesium
    */
    let initParams = {
        maptype: 2,
        prjtype: 1,
    };
    const { data: res } = await initMapApi(initParams);
    console.log(res, 'initRes');
    if (res.code !== 200) return ElMessage.warning(res.msg);
    let basemap = new Basemap({
        baseLayers: [],
    });
    mapStore.handleBasemap(res.data);

    res.data.base.map(async (item: any) => {
        let layer = await initLayerByKind(item, item.visible);
        basemap.baseLayers.add(layer);
        // 天地图电子地图标注
        if (item.basemapType === 1 && item.isTiandi === 1) {
            let labelItem = Object.assign({}, item, {
                pid: `label-${item.pid}`,
                label: `${item.label}标注`,
                url: `${item.url.replaceAll('vec', 'cva')}`,
            });
            let labelLayer = await initLayerByKind(
                labelItem,
                labelItem.visible
            );
            basemap.baseLayers.add(labelLayer);
        }
        // 天地图影像图标注
        if (item.basemapType === 2 && item.isTiandi === 1) {
            let labelItem = Object.assign({}, item, {
                pid: `label-${item.pid}`,
                label: `${item.label}标注`,
                url: `${item.url.replaceAll('img', 'cia')}`,
            });
            let labelLayer = await initLayerByKind(
                labelItem,
                labelItem.visible
            );
            basemap.baseLayers.add(labelLayer);
        }
        console.log(layer, 'layer');
        console.log(basemap, 'basemap');
    });

    // 高程
    let ground = new Ground({
        navigationConstraint:
            res.data.mapInit.naviconstraint == 1 ? null : ('none' as any),
        opacity: res.data.mapInit.opacity / 100,
        surfaceColor: res.data.mapInit.color,
    });
    res.data.elev.map((item: any) => {
        let groundLayer = new ElevationLayer({
            id: item.pid,
            url: item.url,
            title: item.label,
            visible: true,
        });
        ground.layers.add(groundLayer);
    });

    let map = new Map({
        basemap,
        ground,
    });

    sceneView = new SceneView({
        container: 'map',
        map,
        constraints: {
            tilt: {
                max: 179.5,
            },
        },
        viewingMode: 'local',
        // viewingMode: 'global',
        qualityProfile: 'high',
    });

    sceneView.when(
        // 成功
        () => {
            console.log('地图实例化成功', sceneView);
            sceneView.qualitySettings.memoryLimit = window.memoryLimit;
            // 测试质量配置
            sceneView.qualitySettings.additionalCacheMemory = 2048;
            sceneView.qualitySettings.graphics3D.skipHighSymbolLods = true;

            sceneView.focus();
            viewStore.handleView(sceneView);
            showActive.value = true;

            sceneView.ui.components = [];          

            // 地图中心点
            let centerPt = new Point({
                x: res.data.mapInit.x,
                y: res.data.mapInit.y,
                z: res.data.mapInit.viewpointheight,
                spatialReference: {
                    wkid: Number(res.data.mapInit.wkid),
                },
            });

            sceneView
                .goTo({
                    center: centerPt,
                    scale: Number(res.data.mapInit.scale),
                    tilt: res.data.mapInit.pitchangle,
                    heading: res.data.mapInit.azimuth,
                })
                .then(() => {
                    mapCamera = sceneView.camera;
                    viewStore.handleView(sceneView);
                });

            // 初始化缩放
            mapZoom = new Zoom({
                view: sceneView,
            });

            // 禁止方向键左键、右键默认事件
            sceneView.on('key-down', (evt: any) => {
                let keyList = ['ArrowRight', 'ArrowLeft'];
                if (keyList.includes(evt.key)) {
                    evt.stopPropagation();
                }
            });

            // 导航
            let compass = new Compass({
                view: sceneView,
            });
            sceneView.ui.add(compass, 'bottom-right');
            viewStore.handleCompass(compass);

            sceneView.environment.lighting.waterReflectionEnabled = true;
            // // 屏幕是否全屏
            // screenfull.onchange(() => {
            //     mapFullScreen.value = screenfull.isFullscreen;
            // });

            /* 测试鼠标拖拽事件 */
            // sceneView.on('drag', (evtDrag: any) => {
            //     console.log(evtDrag, 'evtDrag');
            // });
        },
        // 失败
        (error: any) => {
            console.log(error, '地图实例化失败');
        }
    );
};
let skyLoading = viewStore.skyLoading;
// 视图组
let viewArr = <any>[];
let activeView = <any>null;
let watchHandles = <any>[];
const setSplitMap = (splitObj: any) => {
    nextTick(() => {
        if (splitObj.showSplit) {
            viewArr = [];
            viewArr.push(sceneView);
            splitObj.container.map((item: any) => {
                let map = new Map({
                    basemap: toRaw(viewStore.mapInstance).map.basemap,
                    ground: toRaw(viewStore.mapInstance).map.ground,
                });
                const splitView = new SceneView({
                    container: item,
                    map,
                });
                splitView.when(() => {
                    splitView.ui.components = [];
                    splitView
                        .goTo(toRaw(viewStore.mapInstance).camera)
                        .then(() => {
                            // 禁止方向键左键、右键默认事件
                            splitView.on('key-down', (evt: any) => {
                                let keyList = ['ArrowRight', 'ArrowLeft'];
                                if (keyList.includes(evt.key)) {
                                    evt.stopPropagation();
                                }
                            });

                            viewArr.push(splitView);
                            viewStore.handleSplitArr(viewArr);

                            for (const subView of viewArr) {
                                watchHandles.push(
                                    subView.watch(
                                        ['interacting', 'animation'],
                                        () => {
                                            activeView = subView;
                                            handleSyncView(activeView);
                                        }
                                    ),
                                    subView.watch('viewpoint', () =>
                                        handleSyncView(subView)
                                    )
                                );
                            }
                        });
                });
            });
        } else {
            watchHandles.forEach((item: any) => {
                item.remove();
            });
        }
    });
};

// 同步分屏视图
const handleSyncView = (source: any) => {
    if (!activeView || !activeView.viewpoint || activeView !== source) {
        return;
    }
    for (const subView of viewArr) {
        if (subView !== activeView) {
            subView.viewpoint = activeView.viewpoint;
        }
    }
};

// 初始化联动地图
const setLengonView = () => {
    debugger;
    let map = new Map({
        basemap: toRaw(viewStore.mapInstance).map.basemap,
    });

    let lengonView = new MapView({
        container: 'map2d',
        map,
    });
    lengonView.when(() => {
        lengonView.ui.components = [];
        viewArr = [sceneView, lengonView];
        viewStore.handleLendonView(lengonView);
        for (const subView of viewArr) {
            watchHandles.push(
                subView.watch(['interacting', 'animation'], () => {
                    activeView = subView;
                    handleSyncView(activeView);
                }),
                subView.watch('viewpoint', () => handleSyncView(subView))
            );
        }
    });
};

const pointMove = (e: any) => {
    if (!viewStore.splitSwipe) return;
    e.stopPropagation();
    updateMapSwipeLocation(e.x, false);
};

const updateMapSwipeLocation = (location: any, isInit: boolean = false) => {
    if (!viewStore.splitSwipe) return;
    const swipeDom = document.getElementById('map-swipe') as any;
    const swipeLineDom = document.getElementById('swipe-line') as any;
    const swipeMap = swipeDom.getBoundingClientRect();

    const offsetX = location;
    if (isSwipeDrag.value || isInit) {
        swipeDom.style.zIndex = 1;
        swipeDom.style.clip =
            'rect(0px,' + offsetX + 'px, ' + swipeMap.height + 'px,0px)';
        swipeLineDom.style.left =
            swipeLineDom.offsetWidth / 2 + offsetX + 'px ';
    }
};

// 初始化卷帘地图
let isSwipeDrag = ref(false);
let watchSwipeHandles = <any>[];
let swipeView = <any>null;
const setSwipeView = () => {
    if (!viewStore.splitSwipe) {
        watchHandles?.forEach((item: any) => {
            item.remove();
        });
        swipeView.map = null;
        swipeView?.destroy();
    }
    const swipeDom = document.getElementById('map-swipe') as any;
    const swipeMap = swipeDom.getBoundingClientRect();
    updateMapSwipeLocation(swipeMap.width / 2, true);
    nextTick(() => {
        let map = new Map({
            basemap: toRaw(viewStore.mapInstance).map.basemap,
            ground: toRaw(viewStore.mapInstance).map.ground,
        });

        swipeView = new SceneView({
            container: 'map-swipe',
            map,
            // camera: toRaw(viewStore.mapInstance).camera,
        });
        swipeView.when(() => {
            swipeView.ui.components = [];
            swipeView.goTo(toRaw(viewStore.mapInstance).camera).then(() => {
                viewArr = [sceneView, swipeView];
                viewStore.handleSwipeView(swipeView);
                for (const subView of viewArr) {
                    watchSwipeHandles.push(
                        subView.watch(['interacting', 'animation'], () => {
                            activeView = subView;
                            handleSyncView(activeView);
                        }),
                        subView.watch('viewpoint', () =>
                            handleSyncView(subView)
                        ),

                        subView.on('pointer-move', (e: any) => {
                            pointMove(e);
                        })
                    );
                }

                (document.getElementById('swipe-line') as any).onmousedown =
                    function () {
                        isSwipeDrag.value = true;
                    };
                (document.getElementById('swipe-line') as any).onmouseup =
                    function () {
                        isSwipeDrag.value = false;
                    };
            });
        });
    });
};

onMounted(async () => {
    initMap();
});
</script>

<style lang="scss" scoped>
@import './home.scss';
</style>
