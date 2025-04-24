<template>
    <!-- 左上操作栏 -->
    <ul
        class="handle-bar"
        :class="menuStore.layerIsShow ? '' : 'tool-transform'"
    >
        <li
            v-for="item in handleList"
            :key="item.code"
            :class="item.isFocus ? 'navi-isfocus' : ''"
            @click="handleNav(item)"
        >
            <div class="navi-box" v-if="item.code !== 'st'">
                <i class="iconfont" :class="item.icon"></i>
                <span class="handle-label">{{ item.label }}</span>
            </div>
            <div v-else>
                <el-popover
                    placement="bottom"
                    trigger="hover"
                    popper-class="viewport-popper"
                >
                    <template #reference>
                        <div class="navi-box">
                            <i class="iconfont" :class="item.icon"></i>
                            <span class="handle-label">{{ item.label }}</span>
                        </div>
                    </template>
                    <el-button-group>
                        <el-button
                            v-for="item in viewPortList"
                            :key="item.code"
                            @click="handlePortBtn(item)"
                            >{{ item.label }}</el-button
                        >
                    </el-button-group>
                </el-popover>
            </div>
        </li>
    </ul>
</template>

<script lang="ts" setup>
/* Vue 相关 */
import { ref, toRaw } from 'vue';
import useStore from '@/stores';

/* ArcGIS API */
import Compass from '@arcgis/core/widgets/Compass';
import Extent from '@arcgis/core/geometry/Extent.js';
import Point from '@arcgis/core/geometry/Point';

const { viewStore, menuStore, mapStore } = useStore();
// 操作栏列表
const handleList = ref<any>([
    {
        label: '全图',
        icon: 'icon-diqiu',
        code: 'qt',
        isFocus: false,
    },
    // {
    //     label: '平移',
    //     icon: 'icon-igw-l-gesture',
    //     code: '2',
    //     isFocus: false,
    // },
    {
        label: '环绕',
        icon: 'icon-xingqiu',
        code: 'hr',
        isFocus: false,
    },
    {
        label: '正北',
        icon: 'icon-zhinanzhen',
        code: 'fw',
        isFocus: false,
    },
    {
        label: '视图',
        icon: 'icon-luxiang',
        code: 'st',
        isFocus: false,
    },
]);

const handleNav = (item: any) => {
    console.log(item, 'item');
    // sceneView.focus();
    toRaw(viewStore.mapInstance).focus();
    switch (item.code) {
        // 环绕
        case 'hr':
            item.isFocus = !item.isFocus;
            if (item.isFocus) {
                aroundMap();
            } else {
                clockwise = true;
                cancelAnimationFrame(aroundAnimate);
            }
            break;
        case 'fw':
            handleReset();
            break;
        case 'qt':
            handleAll();
            break;
        case 'st':
            handleViewport();
            break;

        default:
            break;
    }
};

/* 全图 */
const handleAll = () => {
    let initInfo = mapStore.baseInfo.mapInit;

    toRaw(viewStore.mapInstance).goTo({
        center: new Point({
            x: initInfo.x,
            y: initInfo.y,
            z: initInfo.viewpointheight,
            spatialReference: {
                wkid: initInfo.wkid,
            },
        }),
        scale: Number(initInfo.scale),
        tilt: initInfo.pitchangle,
        heading: initInfo.azimuth,
    });
};

/* 正南正北 */
const handleReset = () => {
    let compass = new Compass({
        view: toRaw(viewStore.mapInstance),
    });
    compass.reset();
};

// 定点环绕地图
let aroundAnimate = <any>null;
// 环绕顺时针
let clockwise = <any>true;
const aroundMap = () => {
    let initAngle = toRaw(viewStore.mapInstance).camera.heading;
    if (clockwise) {
        initAngle = initAngle - 1;
    } else {
        initAngle = initAngle + 1;
    }
    if (initAngle > 360) {
        initAngle = 360 - toRaw(viewStore.mapInstance).camera.heading;
    }
    if (toRaw(viewStore.mapInstance).interacting == false) {
        toRaw(viewStore.mapInstance).goTo({
            heading: initAngle,
        });
    }
    aroundAnimate = requestAnimationFrame(aroundMap);

    // 按键抬起
    toRaw(viewStore.mapInstance).on('key-up', (evt: any) => {
        console.log(evt, 'evt');
        switch (evt.key) {
            case 'ArrowRight':
                clockwise = true;
                break;
            case 'ArrowLeft':
                clockwise = false;
                break;
            default:
                break;
        }
    });
};

/*
    视图切换
*/
const viewPortList = ref<any>([
    { label: '前视图', code: 1 },
    { label: '后视图', code: 2 },
    { label: '左视图', code: 3 },
    { label: '右视图', code: 4 },
    { label: '顶视图', code: 5 },
    { label: '仰视图', code: 6 },
]);
const handleViewport = () => {};
const handlePortBtn = (item: any) => {
    console.log(item, 'item');
    switch (item.code) {
        case 1:
            toRaw(viewStore.mapInstance).goTo({
                heading: 0,
            });
            break;
        case 2:
            toRaw(viewStore.mapInstance).goTo({
                heading: 180,
            });
            break;
        case 3:
            toRaw(viewStore.mapInstance).goTo({
                heading: 90,
            });
            break;
        case 4:
            toRaw(viewStore.mapInstance).goTo({
                heading: 270,
            });
            break;
        case 5:
            toRaw(viewStore.mapInstance).goTo({
                tilt: 0.5,
            });
            break;
        case 6:
            toRaw(viewStore.mapInstance).map.ground.navigationConstraint =
                'none';
            toRaw(viewStore.mapInstance).goTo({
                tilt: 179.5,
            });

            break;

        default:
            break;
    }
    console.log(
        toRaw(viewStore.mapInstance).camera,
        'toRaw(viewStore.mapInstance).camera'
    );
};
</script>

<style lang="scss" scoped>
@use './handle.scss';
</style>
