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
            @close="closeDialog"
        >
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">日照阴影分析</span>
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
                <div class="tool-item">
                    <el-date-picker
                        v-model="dateValue"
                        type="date"
                        placeholder="请选择日期"
                        size="small"
                        @change="changeShadow"
                    />
                    <el-button
                        type="primary"
                        circle
                        size="small"
                        @click="setShadowByDate"
                    >
                        <i
                            class="iconfont"
                            :class="autoDate ? 'icon-zanting' : 'icon-ziyuan'"
                        ></i>
                    </el-button>
                </div>
                <div class="tool-item">
                    <el-slider
                        v-model="sliderValue"
                        :marks="marks"
                        size="small"
                        :max="1440"
                        :step="30"
                        :format-tooltip="formatSlider as any"
                        @input="changeShadow"
                    />
                    <el-button
                        type="primary"
                        circle
                        size="small"
                        @click="setShadowByTime"
                    >
                        <i
                            class="iconfont"
                            :class="autoTime ? 'icon-zanting' : 'icon-ziyuan'"
                        ></i>
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, toRaw, nextTick, reactive } from 'vue';
import type { CSSProperties } from 'vue';
import useStore from '@/stores';

/* ArcGIS API */
import Daylight from '@arcgis/core/widgets/Daylight';
import DaylightViewModel from '@arcgis/core/widgets/Daylight/DaylightViewModel.js';

const { menuStore, viewStore, mapStore } = useStore();

/* 弹窗 */
const dialogVisible = ref<boolean>(false);

const closeDialog = () => {
    if (timeInterval.value) {
        clearInterval(timeInterval.value);
        autoTime.value = false;
    }
    if (dateInterval.value) {
        clearInterval(dateInterval.value);
        autoDate.value = false;
    }
    toRaw(viewStore.mapInstance).environment.lighting = {};

    // 菜单恢复初始值
    if (menuStore.currFunc == 'rzyyfx') {
        menuStore.handleFunc('');
    }
};
const dateValue = ref<any>('');
const sliderValue = ref();

interface Mark {
    style: CSSProperties;
    label: string;
}

type Marks = Record<number, Mark | string>;

const marks = reactive<Marks>({
    0: '00:00',
    360: '06:00',
    720: '12:00',
    1080: '18:00',
    1440: '24:00',
});

/* 时间格式化 */
const formatSlider = (minutes: any) => {
    if (minutes <= 0 || minutes > 1440) {
        return '00:00';
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const formattedHours =
        hours < 10 ? '0' + hours.toString() : hours.toString();
    const formattedMins = mins < 10 ? '0' + mins.toString() : mins.toString();
    return formattedHours + ':' + formattedMins;
};

/* 获取当前日期时间 */
const getCurrTime = () => {
    dateValue.value = new Date();
    sliderValue.value = new Date().getHours() * 60 + new Date().getMinutes();
    toRaw(viewStore.mapInstance).environment.lighting = {
        type: 'sun',
        date: new Date(),
        directShadowsEnabled: true,
    };
};

/* 按日期显示阴影 */
const autoDate = ref<boolean>(false);
const dateInterval = ref<any>(null);
const setShadowByDate = () => {
    autoDate.value = !autoDate.value;
    autoTime.value = false;
    if (timeInterval.value) {
        clearInterval(timeInterval.value);
    }
    let currDate = new Date(
        `${dateValue.value.getFullYear()}-${
            dateValue.value.getMonth() + 1
        }-${dateValue.value.getDate()} ${formatSlider(sliderValue.value)}:00`
    );
    let oneDayMins = 24 * 60 * 60 * 1000;
    if (autoDate.value) {
        dateInterval.value = setInterval(() => {
            currDate = new Date(currDate.getTime() + oneDayMins);
            toRaw(viewStore.mapInstance).environment.lighting = {
                type: 'sun',
                date: currDate,
                directShadowsEnabled: true,
            };
            dateValue.value = currDate;
            console.log(dateValue.value, 'dateValue.value');
        }, 1000);
    } else {
        if (dateInterval.value) {
            clearInterval(dateInterval.value);
        }
    }
};

/* 按时间显示阴影 */
const autoTime = ref<boolean>(false);
const timeInterval = ref<any>(null);
const setShadowByTime = () => {
    autoTime.value = !autoTime.value;
    autoDate.value = false;
    if (dateInterval.value) {
        clearInterval(dateInterval.value);
    }
    let halfHours = 30;
    let currTime = sliderValue.value;
    if (autoTime.value) {
        timeInterval.value = setInterval(() => {
            currTime = currTime + 30;
            if (currTime > 1440) {
                currTime = 0;
            }
            sliderValue.value = currTime;
            let curVal = formatSlider(currTime);
            let newDate = new Date(
                `${dateValue.value.getFullYear()}-${
                    dateValue.value.getMonth() + 1
                }-${dateValue.value.getDate()} ${curVal}:00`
            );
            toRaw(viewStore.mapInstance).environment.lighting = {
                type: 'sun',
                date: newDate,
                directShadowsEnabled: true,
            };
        }, 1000);
    } else {
        if (timeInterval.value) {
            clearInterval(timeInterval.value);
        }
    }
};

/*
    设置阴影
    手动选择时定时关闭
*/
const changeShadow = () => {
    if (timeInterval.value) {
        clearInterval(timeInterval.value);
        autoTime.value = false;
    }
    if (dateInterval.value) {
        clearInterval(dateInterval.value);
        autoDate.value = false;
    }
    let curVal = formatSlider(sliderValue.value);
    let newDate = new Date(
        `${dateValue.value.getFullYear()}-${
            dateValue.value.getMonth() + 1
        }-${dateValue.value.getDate()} ${curVal}:00`
    );
    toRaw(viewStore.mapInstance).environment.lighting = {
        type: 'sun',
        date: newDate,
        directShadowsEnabled: true,
    };
};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'rzyyfx') {
        dialogVisible.value = true;
        getCurrTime();
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './daylight.scss';
</style>
