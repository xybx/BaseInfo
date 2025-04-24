<template>
    <div class="active-bar">
        <div class="state-box">
            <span>
                <i class="iconfont icon-yinqing_juli"></i>
                <span>1:{{ scale }}</span>
            </span>
            <span>
                <i class="state-label">X：</i>
                <span>{{ longitude }}</span>
            </span>
            <span>
                <i class="state-label">Y：</i>
                <span>{{ latitude }}</span>
            </span>
            <span>
                <i class="state-label">维度：</i>
                <span>{{ dimension }}</span>
            </span>
            <span>
                <i class="state-label">海拔：</i>
                <span>{{ altitude }}米</span>
            </span>
            <span>
                <i class="state-label">方位角：</i>
                <span>{{ heading }}°</span>
            </span>
            <span>
                <i class="state-label">俯仰角：</i>
                <span>{{ tilt }}°</span>
            </span>
            <span>
                <i class="state-label">视点高：</i>
                <span>{{ viewHeight }}米</span>
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup>
/* Vue 相关 */
import { ref, toRaw, onMounted, watch, computed } from 'vue';
import useStore from '@/stores';

/* ArcGIS API */
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import Point from '@arcgis/core/geometry/Point.js';
import * as projection from '@arcgis/core/geometry/projection.js';

const { viewStore } = useStore();

// 初始化地图
let sceneView = <any>null;
let mapZoom = <any>null;
let mapCamera = <any>null;
let mapFullScreen = ref<boolean>(false);
// 视点高
const viewHeight = ref<number>();
// 纬度
const latitude = ref<number>();
// 经度
const longitude = ref<number>();
// 方位角
const heading = ref<number>();
// 俯仰角
const tilt = ref<number>();
// 比例尺
const scale = ref<number>();
// 海拔
const altitude = ref<number>();
// 维度
const dimension = computed(() => {
    switch (viewStore.maxTilt) {
        case 179.5:
            return '三维';
            break;
        case 0.5:
            return '二维';
            break;

        default:
            break;
    }
});

/* 监听三维视图变化 */
const setWatchView = () => {
    toRaw(viewStore.mapInstance).watch('camera', () => {
        // let point = new Point({
        //     x: toRaw(viewStore.mapInstance).camera.position.x,
        //     y: toRaw(viewStore.mapInstance).camera.position.y,
        //     spatialReference: {
        //         wkid: toRaw(viewStore.mapInstance).camera.position
        //             .spatialReference.wkid,
        //     },
        // });
        // let outSp = new SpatialReference({
        //     wkid: 4326,
        // });
        // projection.load().then(() => {
        //     let newPt = projection.project(point, outSp);
        //     console.log(newPt, 'newPt');
        // });

        viewHeight.value = toRaw(
            viewStore.mapInstance
        ).camera.position.z?.toFixed(1);

        latitude.value = toRaw(
            viewStore.mapInstance
        ).camera.position.y?.toFixed(1);
        longitude.value = toRaw(
            viewStore.mapInstance
        ).camera.position.x?.toFixed(1);

        heading.value = toRaw(viewStore.mapInstance).camera.heading?.toFixed(1);

        tilt.value = toRaw(viewStore.mapInstance).camera.tilt?.toFixed(1);

        scale.value = toRaw(viewStore.mapInstance).scale?.toFixed(1);

        // dimension.value =
        //     toRaw(viewStore.mapInstance).constraints.tilt.max === 0.5
        //         ? '二维'
        //         : '三维';

        // 海拔高度
        let levelLayer = toRaw(
            viewStore.mapInstance
        ).map.ground.layers.items.map(async (levelItem: any) => {
            if (levelItem.visible) {
                const levelGeo = await levelItem.queryElevation(
                    toRaw(viewStore.mapInstance).center
                );
                altitude.value = levelGeo.geometry.z?.toFixed(1);
            }
        });
    });
};

onMounted(() => {
    setWatchView();
});
</script>

<style lang="scss" scoped>
@use './active.scss';
</style>
