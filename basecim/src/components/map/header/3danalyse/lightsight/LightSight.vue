<template>
    <div
        class="tool-bar"
        :class="menuStore.layerIsShow ? '' : 'tool-transform'"
    >
        <el-dialog
            v-model="locateVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-basemap"
            @close="closeLocate"
        >
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">通视分析</span>
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
                <div class="observe-div">
                    <span class="tool-label">起始点增高</span>
                    <el-input-number
                        v-model="observeHeight"
                        :precision="1"
                        :step="0.1"
                    />
                </div>
                <el-button type="primary" @click="handleSight"
                    >绘制通视域</el-button
                >
                <el-button type="warning" @click="clearSight">清除</el-button>
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
import LineOfSightViewModel from '@arcgis/core/widgets/LineOfSight/LineOfSightViewModel.js';
import Graphic from '@arcgis/core/Graphic';

const { menuStore, viewStore, mapStore } = useStore();

const locateVisible = ref(false);

const closeLocate = () => {
    losViewModel?.destroy();
    losViewModel = null;
    initObVal.value = 0;
    observeHeight.value = 0;
    toRaw(viewStore.mapInstance).graphics.removeAll();
    // 菜单恢复初始值
    if (menuStore.currFunc == 'tsfx') {
        menuStore.handleFunc('');
    }
};

/* 绘制通视域 */
let losViewModel = <any>null;
let losObserver = <any>null;
let initObVal = ref<number>(0);
const handleSight = () => {
    if (losViewModel) {
        losViewModel?.clear();
    }
    losViewModel = new LineOfSightViewModel({
        view: toRaw(viewStore.mapInstance),
    });
    losViewModel.start();

    // 观察点高度
    losViewModel.watch('observer', () => {
        toRaw(viewStore.mapInstance).graphics.removeAll();
        if (initObVal.value === 0 && losViewModel.analysis.observer) {
            losObserver = losViewModel.analysis.observer.clone();
            losViewModel.analysis.observer.position.z =
                losObserver.position.z + observeHeight.value;
            initObVal.value += 1;
        }
    });

    losViewModel.targets.on('after-add', (event: any) => {
        console.log(event, 'event');
        event.target.forEach((target: any) => {
            target.watch('intersectedLocation', (newVal: any, oldVal: any) => {
                // 点符号
                if (target.intersectedLocation) {
                    console.log(target, 'target');
                    console.log(newVal, 'newVal');
                    console.log(oldVal, 'oldVal');
                    let symbol = {
                        type: 'point-3d',
                        verticalOffset: {
                            screenLength: 30 + target.intersectedLocation.z,
                        },
                        callout: {
                            type: 'line',
                            size: 1.5,
                            color: [62, 71, 63],
                        },
                        symbolLayers: [
                            {
                                type: 'text',
                                size: 14,
                                text: `X:${target.intersectedLocation.x.toFixed(
                                    2
                                )}，Y:${target.intersectedLocation.y.toFixed(
                                    2
                                )}，Z:${target.intersectedLocation.z.toFixed(
                                    2
                                )}`,
                                material: {
                                    color: 'yellow',
                                },
                                background: {
                                    color: [62, 71, 63],
                                },
                            },
                        ],
                    };

                    let graphic = new Graphic({
                        symbol,
                        geometry: target.intersectedLocation,
                        attributes: {
                            xyz: `${target.intersectedLocation.x}+${target.intersectedLocation.y}+${target.intersectedLocation.z}`,
                        },
                    } as any);

                    const graphics = toRaw(viewStore.mapInstance).graphics;
                    if (oldVal) {
                        const findGraphic = graphics.find(
                            (g: any) =>
                                g.attributes.xyz ==
                                `${oldVal.x}+${oldVal.y}+${oldVal.z}`
                        );
                        console.log(findGraphic, 'findGraphic');

                        if (findGraphic) {
                            toRaw(viewStore.mapInstance).graphics.remove(
                                findGraphic
                            );
                        }
                    }
                    toRaw(viewStore.mapInstance).graphics.add(graphic);
                }
            });
        });
    });
};

/* 清除通视域 */
const clearSight = () => {
    losViewModel?.clear();
    initObVal.value = 0;
    toRaw(viewStore.mapInstance).graphics.removeAll();
};

/* 通视点高度 */
const observeHeight = ref<number>(0);

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    debugger;
    if (state.currFunc == 'tsfx') {
        locateVisible.value = true;
    } else {
        locateVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './lightsight.scss';
</style>
