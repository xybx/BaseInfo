<template>
    <div
        class="func-bar"
        :class="menuStore.layerIsShow ? '' : 'tool-transform'"
    >
        <el-dialog
            v-model="locateVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-basemap"
            @close="closeLocate(formRef)"
        >
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">坐标定位</span>
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
                <el-form
                    :model="form"
                    :rules="formRules"
                    ref="formRef"
                    hide-required-asterisk
                >
                    <el-form-item label="坐标系" prop="wkid">
                        <el-select
                            v-model="form.wkid"
                            placeholder="请选择坐标系"
                        >
                            <el-option
                                v-for="item in wkidList"
                                :key="item.intnum"
                                :label="item.name"
                                :value="item.intnum"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="X" prop="x">
                        <el-input v-model="form.x" placeholder="请输入X值" />
                    </el-form-item>
                    <el-form-item label="Y" prop="y">
                        <el-input v-model="form.y" placeholder="请输入Y值" />
                    </el-form-item>
                    <el-form-item label="Z" prop="z">
                        <el-input v-model="form.z" placeholder="请输入Z值" />
                    </el-form-item>
                    <div class="handle-btns">
                        <el-button
                            type="primary"
                            @click="handleLocate(formRef)"
                            size="small"
                            >定位</el-button
                        >
                    </div>
                </el-form>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, toRaw, onMounted, nextTick } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import useStore from '@/stores';
import { initMapApi, getDictData } from '@/views/home/home-api';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import * as projection from '@arcgis/core/geometry/projection';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

const { menuStore, viewStore, mapStore } = useStore();

const locateVisible = ref(false);
const closeLocate = (formRef: FormInstance | undefined) => {
    // 菜单恢复初始值
    if (menuStore.currFunc == 'zbdw') {
        menuStore.handleFunc('');
    }

    if (!formRef) return;
    formRef.resetFields();

    //查找坐标定位图层
    let findCoordLocateLayer = toRaw(viewStore.mapInstance).map.findLayerById(
        'coordLocate'
    );
    // 找到则清除图形数据
    if (Boolean(findCoordLocateLayer)) {
        findCoordLocateLayer.graphics.removeAll();
    }
};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'zbdw') {
        locateVisible.value = true;
        nextTick(() => {
            getWkidList();
        });
    } else {
        locateVisible.value = false;
    }
});

// 坐标系下拉框数组
let wkidList = ref<any>([]);

// 表单
const form = reactive({
    wkid: '',
    x: null,
    y: null,
    z: null,
});
const formRef = ref<FormInstance>();

// 表单验证规则
const formRules = reactive<FormRules>({
    wkid: [{ required: true, message: '坐标系不能为空', trigger: 'change' }],
    x: [{ required: true, message: 'x值不能为空', trigger: 'blur' }],
    y: [{ required: true, message: 'y值不能为空', trigger: 'blur' }],
});

//获取坐标系列表
const getWkidList = async () => {
    let params = {
        code: '坐标系wkid',
    };
    const { data: res } = await getDictData(params);

    if (res.code !== 200) return ElMessage.warning(res.msg);
    wkidList.value = res.data;
};

// 定位按钮点击
const handleLocate = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate((valid) => {
        if (!valid) return ElMessage.warning('请补充必填项');

        // 查找坐标定位图层
        let findCoordLocateLayer = toRaw(
            viewStore.mapInstance
        ).map.findLayerById('coordLocate');
        // 没找到则创建图形图层
        if (!Boolean(findCoordLocateLayer)) {
            let coordLocateGraphicLayer = new GraphicsLayer({
                id: 'coordLocate',
            } as any);
            toRaw(viewStore.mapInstance).map.layers.add(
                coordLocateGraphicLayer
            );
            findCoordLocateLayer = coordLocateGraphicLayer;
        }
        //清空地图上历史点
        findCoordLocateLayer.graphics.removeAll();

        //获取地图四至范围
        console.log(mapStore.baseInfo);
        var lineSymbol = <any>null; //线符号
        //点符号
        var symbol = {
            type: 'simple-marker',
            color: 'white',
            outline: {
                color: [255, 0, 0],
                width: 5,
            },
            //style:"square",
        };

        if (toRaw(viewStore.mapInstance).constraints.tilt.max != 0.5) {
            //3D高度辅助线
            // lineSymbol = {
            //     type: 'simple-line',
            //     color: [169, 169, 169],
            //     width: 1,
            //     style: 'dot',
            // };
            lineSymbol = {
                type: 'simple-line',
                color: [255, 255, 255],
                width: 1,
            };
        }
        var point = new Point({
            x: form.x,
            y: form.y,
            z: form.z,
            spatialReference: {
                wkid: form.wkid,
            },
        } as any);

        //坐标转换
        var outSpatialReference = new SpatialReference({
            wkid: mapStore.baseInfo.mapInit.wkid,
        });
        projection.load().then(async function () {
            var points = await projection.project(point, outSpatialReference);
            if (points == null) {
                return ElMessage.warning('请输入正确的坐标点信息！');
            }
            console.log(points, 'geo');

            //判断坐标点是否在当前系统四至范围内
            const xmax = mapStore.baseInfo.mapInit.fourScopeXmax;
            const xmin = mapStore.baseInfo.mapInit.fourScopeXmin;
            const ymax = mapStore.baseInfo.mapInit.fourScopeYmax;
            const ymin = mapStore.baseInfo.mapInit.fourScopeYmin;
            var _point = points as Point;
            if (
                _point.x >= xmin &&
                _point.x <= xmax &&
                _point.y >= ymin &&
                _point.y <= ymax
            ) {
                const pointGraphic = new Graphic({
                    geometry: _point,
                    symbol: symbol,
                } as any);
                findCoordLocateLayer.graphics.add(pointGraphic);
                if (toRaw(viewStore.mapInstance).constraints.tilt.max != 0.5) {
                    var pointline = points as any;
                    const polyline = {
                        type: 'polyline', // autocasts as new Polyline()
                        paths: [
                            [pointline.x, pointline.y, 0],
                            [pointline.x, pointline.y, form.z],
                        ],
                        spatialReference: {
                            wkid: mapStore.baseInfo.mapInit.wkid,
                        },
                        hasZ: true,
                    };
                    const polylineGraphic = new Graphic({
                        geometry: polyline,
                        symbol: lineSymbol,
                    } as any);

                    findCoordLocateLayer.graphics.add(polylineGraphic);
                }
                toRaw(viewStore.mapInstance).center = points;
            } else {
                return ElMessage.error('该坐标点超出当前系统底图边界！');
            }
        });
    });
};
</script>

<style lang="scss" scoped>
@use './coordlocate.scss';
</style>
