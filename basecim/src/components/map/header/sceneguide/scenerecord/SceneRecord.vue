<template>
    <div class="tool-bar" :class="menuStore.layerIsShow ? '' : 'tool-transform'">
        <el-dialog v-model="locateVisible" draggable :modal="false" :close-on-click-modal="false" class="tool-basemap"
            @close="closeLocate">
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">场景漫游</span>
                    <el-popover placement="bottom-start" :width="200" trigger="hover" content="注意事项文本占位">
                        <template #reference>
                            <i class="iconfont icon-shuxing"></i>
                        </template>
                    </el-popover>
                </span>
            </template>
            <div class="tool-main">
                <ul>
                    <li v-for="item in    sceneList   " :key="item.pid">
                        <span class="scene-label">{{ item.name }}</span>
                        <span>
                            <i class="icon iconfont icon-feihangmoshi"
                                v-if="item.model == 1 && (!isStart || (isStart && item.pid != form.pid))"
                                @click="startRoam(item)"></i>
                            <i class="icon iconfont icon-qiche"
                                v-if="item.model == 2 && (!isStart || (isStart && item.pid != form.pid))"
                                @click="startRoam(item)"></i>
                            <i class="icon iconfont icon-xingren"
                                v-if="item.model == 3 && (!isStart || (isStart && item.pid != form.pid))"
                                @click="startRoam(item)"></i>
                            <i class="icon iconfont icon-zanting1" @click="endRoute(item)"
                                v-if="isStart && item.pid == form.pid"></i>
                            <i class="iconfont icon-icon_edit" @click="editSceneRecord(item)"></i>
                            <i class="iconfont icon-shanchu" @click="delSceneRecord(item.pid)"></i>
                        </span>
                    </li>
                </ul>
                <div>
                    <el-button type="primary" @click="addRoute">新增路径</el-button>
                </div>
            </div>
        </el-dialog>

        <el-dialog v-model="editVisible" draggable :modal="false" :close-on-click-modal="false" class="tool-route"
            @close="closeEdit(ruleFormRef)">
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">漫游路径</span>
                    <el-popover placement="bottom-start" :width="200" trigger="hover" content="注意事项文本占位">
                        <template #reference>
                            <i class="iconfont icon-shuxing"></i>
                        </template>
                    </el-popover>
                </span>
            </template>
            <div class="tool-main">
                <el-form :model="form" label-width="auto" ref="ruleFormRef" :rules="rules">
                    <el-form-item label="绘制漫游路径" prop="paths">
                        <el-button type="success" style="margin-top:0px;" @click="handleDraw()">绘制</el-button>
                    </el-form-item>
                    <el-form-item label="名称" prop="name">
                        <el-input v-model="form.name" />
                    </el-form-item>
                    <el-form-item label="模式" prop="mode">
                        <el-select v-model="form.mode" placeholder="请选择漫游模式">
                            <el-option label="飞机" value="1" />
                            <el-option label="汽车" value="2" />
                            <el-option label="行人" value="3" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="显示路线" prop="showRoute">
                        <el-switch v-model="form.showRoute" @change="handleShowRoute" />
                    </el-form-item>
                    <el-form-item label="高度(m)" prop="height" v-if="form.mode == '1'">
                        <!-- <el-input v-model="form.height" /> -->
                        <el-input-number v-model="form.height" :min="0" :max="1000000"></el-input-number>
                    </el-form-item>
                    <el-form-item label="速度(km/h)" prop="speed">
                        <!-- <el-input v-model="form.speed" /> -->
                        <el-input-number v-model="form.speed" :min="0" :max="1000000"></el-input-number>
                    </el-form-item>
                    <el-form-item label="视角" prop="view">
                        <el-select v-model="form.view" placeholder="请选择视角" @change="changeView">
                            <el-option label="第一视角" value="1" />
                            <el-option label="跟随视角" value="2" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <div>
                    <el-button type="primary" v-if="!endbtnVisible && !isStart"
                        @click="handleRoute(ruleFormRef)">开始漫游</el-button>
                    <el-button type="primary" v-if="endbtnVisible || isStart"
                        @click="endRoute(ruleFormRef)">结束漫游</el-button>
                    <el-button type="warning" @click="cancleRoute">关闭</el-button>
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
import { ElMessage, ElSelect } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

/* ArcGIS API */
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol.js";
import * as externalRenderers from "@arcgis/core/views/3d/externalRenderers";
import Track from '@arcgis/core/widgets/Track';
// import geolocate from 'mock-geolocation'

/* 其他 */
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';

/* API */
import { getScenerecordList, delScenerecord, saveScenerecord } from "./scenerecord-api";


const { menuStore, viewStore, mapStore } = useStore();

const locateVisible = ref(false);

const closeLocate = () => {
    // 菜单恢复初始值
    if (menuStore.currFunc == 'cjmy') {
        menuStore.handleFunc('');
    }
    editVisible.value = false;
};

/* 场景列表 */
const sceneList = ref<any>([
    // {
    //     pid: 1,
    //     name: '线路1',
    //     mode: '', //1:飞机，2：汽车马，3：行人
    //     isroute: '',
    //     height: "",
    //     speed: '500',////KM/H
    //     view: '',
    //     paths: [],
    //     length: 0,
    // },

]);

/* 新增路径 */
const addRoute = () => {
    cancleRoute();
    editVisible.value = true;
    form.height = 0;
    form.mode = '';
    form.name = "";
    form.paths = [];
    form.pid = 0;
    form.showRoute = true;
    form.speed = 0;
    form.view = '';

};

//编辑路径
const editSceneRecord = (item: any) => {
    editVisible.value = true;
    form.height = item.height.toString();
    form.mode = item.model.toString();
    form.name = item.name;
    form.paths = JSON.parse(item.routepoints);
    form.pid = item.pid;
    form.showRoute = item.isroute == 1 ? true : false;
    form.speed = item.speed.toString();
    form.view = item.angle.toString();
    handleShowRoute(form.showRoute);

};

//列表页的开始漫游按钮
let isStart = ref(false);
const startRoam = async (item: any) => {

    form.height = item.height.toString();
    form.mode = item.model.toString();
    form.name = item.name;
    form.paths = JSON.parse(item.routepoints);
    form.pid = item.pid;
    form.showRoute = item.isroute == 1 ? true : false;
    form.speed = item.speed.toString();
    form.view = item.angle.toString();
    cancleRoute();
    isStart.value = true;
    await handleShowRoute(form.showRoute);
    //执行漫游
    executeRoam();
};

/* 绘制路径 */
//绘图工具
let sketchLayer = <any>null;
let sketchTool = <any>null;
// let polylineSymbol = {
//     type: "line-3d",  // autocasts as new PolygonSymbol3D()
//     symbolLayers: [{
//         type: "path",  // autocasts as new PathSymbol3DLayer()
//         profile: "quad",
//         width: 5,    // width of the tube in meters\
//         height: 2,
//         material: { color: "yellow" }
//     }]
// };
const polylineSymbol = {
    type: "simple-line",
    color: "yellow",
    width: 5,
    style: 'solid',
    join: "round",
};
let pid = 0;
const handleDraw = () => {
    debugger;
    /* 绘制图层 */
    if (!sketchLayer) {
        sketchLayer = new GraphicsLayer({
            id: 'roamingSketch',
            elevationInfo: {
                //mode: 'relative-to-ground',
                mode: 'on-the-ground'
            },
        });
        toRaw(viewStore.mapInstance).map.layers.add(sketchLayer, toRaw(viewStore.mapInstance).map.layers.items.length + 1);
    }
    else {
        sketchLayer.graphics.removeAll();
    }

    /* 绘制工具 */
    if (!sketchTool) {
        sketchTool = new SketchViewModel({
            layer: sketchLayer,
            view: toRaw(viewStore.mapInstance),
            defaultCreateOptions: {
                hasZ: true, // default value
            },
            defaultUpdateOptions: {
                enableZ: true, // default value
            },
            polylineSymbol: polylineSymbol,
        } as any);
    }
    sketchTool.create('polyline');
    sketchTool.on('create', async (evt: any) => {
        if (evt.state === 'complete') {
            console.log(evt, 'evt');
            // let gras = [evt.graphic];
            form.paths = evt.graphic.geometry.paths[0];
            pid++;
            //计算距离
            const length = await geometryEngine.planarLength(evt.graphic.geometry, "meters");
            form.length = length;
            console.log(form.length, "form.length");
            sketchTool.destroy();
            sketchTool = null;
        }
    });
};

/* 新增路径弹窗 */
const editVisible = ref(false);

/* 漫游路径表单 */
const ruleFormRef = ref<FormInstance>();
const form = reactive({
    pid: 0,
    name: '',
    mode: '',
    showRoute: true,
    height: 0,
    speed: 0,
    view: '',
    paths: [],
    length: 0,//路线总距离
});
const rules = reactive<FormRules>({
    name: [
        {
            required: true,
            message: '名称不能为空',
            trigger: 'blur',
        },
    ],
    mode: [
        {
            required: true,
            message: '模式不能为空',
            trigger: 'change',
        },
    ],
    height: [
        {
            required: true,
            message: '高度不能为空',
            trigger: 'blur',
        },
        {
            pattern: /^(0|[1-9][0-9]*)$/,
            message: "请输入数字",
            trigger: "blur"
        }
    ],
    speed: [{ required: true, message: '速度不能为空', trigger: 'blur' },
    {
        pattern: /^(0|[1-9][0-9]*)$/,
        message: "请输入数字",
        trigger: "blur"
    }
    ],
    view: [
        {
            required: true,
            message: '视角不能为空',
            trigger: 'change',
        },
    ],
});

/*页面初始化 */
onMounted(() => {
    // let _sceneList = localStorage.getItem("SceneRecord_sceneList");
    // console.log(_sceneList, "_sceneList");
    // if (_sceneList != null && _sceneList != undefined) {
    //     sceneList.value = JSON.parse(_sceneList);
    // }
});

//路线显隐
const handleShowRoute = async (obj: any) => {
    console.log(obj, "obj");
    sketchLayer = toRaw(viewStore.mapInstance).map.findLayerById('roamingSketch');
    if (form.paths.length > 0) {
        if (!sketchLayer) {
            debugger;
            sketchLayer = new GraphicsLayer({
                id: 'roamingSketch',
                elevationInfo: {
                    mode: 'on-the-ground'
                },
            });
            toRaw(viewStore.mapInstance).map.layers.add(sketchLayer);
        }
        else {
            sketchLayer.graphics.removeAll();
        }
        let line = {
            type: 'polyline',
            hasZ: true,
            paths: [form.paths],
            spatialReference: toRaw(viewStore.mapInstance).spatialReference
        };

        let lingraphic = new Graphic({
            geometry: line,
            symbol: polylineSymbol,
        });

        let centerpt = {
            type: "point",
            x: form.paths[0][0],
            y: form.paths[0][1],
            z: form.paths[0][2],
            spatialReference: toRaw(viewStore.mapInstance).spatialReference
        } as any;
        sketchLayer.graphics.add(lingraphic);
        //toRaw(viewStore.mapInstance).goTo(lingraphic.geometry.extent.center);
        toRaw(viewStore.mapInstance).extent = lingraphic.geometry.extent;
        // let ptBuff = geometryEngine.buffer(centerpt, 5, "meters") as any;
        //console.log(ptBuff, "ptBuff");
        //toRaw(viewStore.mapInstance).extent = ptBuff.extent;
        //计算距离
        const length = await geometryEngine.planarLength(lingraphic.geometry, "meters");
        form.length = length;

    }
    if (obj) {
        if (Boolean(sketchLayer)) {
            sketchLayer.visible = true;
            toRaw(viewStore.mapInstance).extent.center == sketchLayer.graphics.items[0].geometry.extent.center;
        }
    }
    else {
        if (Boolean(sketchLayer)) {
            sketchLayer.visible = false;
        }
    }
};

//开始漫游：保存漫游数据的同时，开始漫游
let endbtnVisible = ref(false); //结束漫游，开始漫游按钮的显隐
var timeInter: any = null;
var currentCoordIndex = 0;
let prevLocation: any = null;
// let speed = 500;//KM/H
let alltime = 0;
let timetick = 1000;//毫秒
let tickDistance = 1;//定时器走的距离
let draw: any = null;
const handleRoute = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid) => {
        if (!valid) return ElMessage.warning('请补充必填项');
        //后续操作逻辑
        if (form.paths.length == 0) {
            return ElMessage.warning('请绘制线路');
        }
        console.log(endbtnVisible, "endbtnVisible");
        endbtnVisible.value = true;
        isStart.value = true;
        //sceneList.value.push(form);
        //localStorage.setItem("SceneRecord_sceneList", toRaw(JSON.stringify(sceneList.value)));
        //保存漫游数据
        let userinfo = JSON.parse(sessionStorage.getItem("23vUser") as string);
        let data = {
            angle: Number(form.view),
            height: Number(form.height),
            isroute: form.showRoute ? 1 : 0,
            model: Number(form.mode),
            name: form.name,
            pid: form.pid,
            routepoints: JSON.stringify(form.paths),
            speed: Number(form.speed),
            status: 1,
            userid: userinfo.pid

        };
        let res = await saveScenerecord(data);
        if (res.data.code !== 200) return ElMessage.warning(res.data.msg);
        getSceneRecordList();
        //console.log(res, res.data.data.pid, "res");
        form.pid = res.data.data.pid;
        //执行漫游
        executeRoam();
    });
};

//执行漫游
const executeRoam = () => {
    //如果模型已存在清空
    let findCoordLocateLayer = toRaw(viewStore.mapInstance).map.findLayerById('entity');
    // 没找到则创建图形图层
    if (Boolean(findCoordLocateLayer)) {
        findCoordLocateLayer.graphics.removeAll();
    }
    //根据总距离，速度，计算总时长(秒)
    alltime = form.length / (Number(form.speed) * 1000) * 60 * 60;
    //根据时速计算每毫秒多少米
    let millisecond_speed = (Number(form.speed) * 1000) / (60 * 60 * 60 * 1000);
    //根据毫秒计算1000毫秒的距离
    tickDistance = 500 * millisecond_speed;
    //tickDistance = millisecond_speed;
    console.log(form.length, alltime, millisecond_speed, tickDistance, "计算的参数");

    //第一视角
    if (form.view == "1") {
        handleFirstAngle();
    }
    // //跟随视角
    // if (form.view == "3") {
    //     handleFollowAngle();
    // }
    //固定视角
    if (form.view == "2") {
        threeHandleDraw();
    }
};

//视角选择
const changeView = (obj: any) => {
    console.log(obj, 'obj');
    let locateLayer = toRaw(viewStore.mapInstance).map.findLayerById('entity');
    // 没找到则创建图形图层
    if (Boolean(locateLayer)) {
        locateLayer.graphics.removeAll();
    }
    // if (obj == 1) {
    //     handleFollowAngle();
    // }
    // if (obj == 2) {
    //     threeHandleDraw();
    // }

};
//计算视角
function getHeading(point: any, oldPoint: any) {
    // get angle between two points
    // console.log(oldPoint, 'oldPoint');
    // console.log(point, 'point');
    const angleInDegrees =
        (Math.atan2(point.y - oldPoint.y, point.x - oldPoint.x) * 180) /
        Math.PI;
    // 180 / Math.PI * radian
    // move heading north
    return -90 + angleInDegrees;
}
function getHeading2(point: any, oldPoint: any) {
    var radian = Math.atan2(point.y - oldPoint.y, point.x - oldPoint.x);
    var angle = 180 / Math.PI * radian;
    console.log(angle, "getHeading2");
    return angle;
}

//计算角度
const getAngle = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
    const x =
        Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
        Math.sin((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.cos(dLon);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    const angle = (brng + 360) % 360;
    return angle;
}

//第一视角
const handleFirstAngle = async () => {
    currentCoordIndex = 0;
    debugger;
    clearInterval(timeInter);
    timeInter = null;
    timetick = getTimeTick(Number(form.speed), tickDistance);

    tickDistance = timetick * tickDistance;
    console.log(tickDistance, "tickDistance");
    let points = getNewPoints(form.paths, tickDistance);
    prevLocation = new Point({
        x: points[0].x,
        y: points[0].y,
        z: form.mode == "1" ? Number(form.height) + 30 : 0,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
    });
    // _peopleRender(prevLocation);
    // _peopleRender([prevLocation.x, prevLocation.y, prevLocation.z]);

    let scale = 2500;
    if (form.mode == "3") {
        scale = 300;
        //timetick = 200;
    }
    toRaw(viewStore.mapInstance).goTo({
        center: prevLocation,
        tilt: 82,
        scale: scale,
        // extent: ptBuff.extent,
        //heading: heading, // only applies to SceneView
    });
    var _heading = 360 - getHeading(new Point({
        x: points[0].x,
        y: points[0].y,
        z: form.mode == "1" ? Number(form.height) + 30 : 0,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
    }), prevLocation);
    //showEntity(prevLocation, _heading);
    timeInter = setInterval(async () => {
        console.log(timetick, "timetick");
        //currentCoordIndex = (currentCoordIndex + 1) % points.length;
        var location = points[currentCoordIndex];
        let endLength = points.length - 50;
        if (form.mode == "1") {
            endLength = points.length - 1200;
        }
        if (currentCoordIndex == endLength) {
            currentCoordIndex = 0;
            clearInterval(timeInter);
            timeInter = null;
            isStart.value = false;
            endbtnVisible.value = false;

        }
        let z_value = 0;
        let groundheight = 0;
        if (form.mode == "1") {
            z_value = Number(form.height);
            //查找高程图层(飞行)  
            let groundlayer = <any>null;
            toRaw(viewStore.mapInstance).map.ground.layers.items.forEach((ground: any) => {
                if (ground.visible) {
                    groundlayer = ground;
                }
            });

            if (groundlayer && groundlayer != null) {
                let gro_locationpt = new Point({
                    x: location.x,
                    y: location.y,
                    z: 0,
                    spatialReference: toRaw(viewStore.mapInstance).spatialReference,
                });
                let result = await groundlayer.queryElevation(gro_locationpt);
                groundheight = Math.round(result.geometry.z);
                console.log(groundheight, "groundheight");
            }
        }

        let locationpt = new Point({
            x: location.x,
            y: location.y,
            z: form.mode == "1" ? z_value - groundheight : groundheight,
            spatialReference: toRaw(viewStore.mapInstance).spatialReference,
        });
        // console.log(z_value - 30, "z_value - 30");
        //默认缓冲范围300米
        let _distance = 300;
        //俯仰角
        console.log(currentCoordIndex, "currentCoordIndex");
        if (locationpt.x == prevLocation.x && locationpt.y == prevLocation.y) {
            currentCoordIndex++;
            return;
        }
        var heading = 360 - getHeading(locationpt, prevLocation); // only applies to SceneView
        if (form.mode == "3") {
            var entityHeading = 180 - getHeading(location, prevLocation);
            heading = entityHeading;
            _distance = 200;
        }
        else if (form.mode == "2") {
            _distance = 200;
        }
        else if (form.mode == "1") {
            //heading = heading + 360;
            //heading = bearing(location, prevLocation);
            console.log(heading, "heading--------");
        }

        //根据当前点生成一个固定的缓冲范围，设置视图的四至范围为当前缓冲范围
        let ptBuff = geometryEngine.buffer(locationpt, _distance, "meters") as any;
        toRaw(viewStore.mapInstance).extent = ptBuff.extent;
        if (form.mode == "3") {
            heading = heading - 180;
        }
        toRaw(viewStore.mapInstance).camera = {
            target: ptBuff,
            heading: heading, // face due east
            tilt: 85, // looking from a bird's eye view
            position: {
                x: location.x,
                y: location.y,
                z: form.mode == "1" ? z_value + groundheight : 0,
                spatialReference: toRaw(viewStore.mapInstance).spatialReference,
            }
        }
        console.log(heading, "heading121212");
        // toRaw(viewStore.mapInstance).camera.heading = heading;
        console.log(toRaw(viewStore.mapInstance).camera.heading, "heading");
        // console.log(toRaw(viewStore.mapInstance).camera.position.z, locationpt.z, heading, 'heading');
        prevLocation = locationpt;

        currentCoordIndex++;
        console.log(currentCoordIndex, "currentCoordIndex++");
        // showEntity(locationpt, heading);
    }, timetick);


};

//固定视角,跟随视角
const threeHandleDraw = async () => {
    clearInterval(timeInter);
    timeInter = null;
    timetick = getTimeTick(Number(form.speed), tickDistance);
    console.log(timetick, 'timetick');
    currentCoordIndex = 0;
    tickDistance = timetick * tickDistance;
    let points = getNewPoints(form.paths, tickDistance);
    console.log(points, "points");

    //prevLocation = points[0];
    prevLocation = new Point({
        x: points[0].x,
        y: points[0].y,
        z: form.mode != "3" ? Number(form.height) : 0,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
    });
    //console.log(prevLocation, "prevLocation");
    var _heading = 250 - getHeading(location, prevLocation);
    toRaw(viewStore.mapInstance).goTo({
        center: prevLocation,
        //tilt: 82,
        //scale: scale,
        // extent: ptBuff.extent,
        heading: _heading, // only applies to SceneView
    });
    if (form.mode == "3") {
        _peopleRender(prevLocation, points);
    }
    else {
        timeInter = setInterval(async () => {
            // geolocate.change(coords[currentCoordIndex]);
            //currentCoordIndex = (currentCoordIndex + 1) % points.length;
            var location = points[currentCoordIndex];
            let endLength = points.length;
            // if (form.mode == "1") {
            //     endLength = points.length - 1200;
            // }
            if (currentCoordIndex == endLength) {
                currentCoordIndex = 0;
                clearInterval(timeInter);
                timeInter = null;
                isStart.value = false;
                endbtnVisible.value = false;
                return;
            }
            // console.log(location, "location");
            //查找高程图层(飞行)  
            let groundheight = 0;
            let groundlayer = <any>null;
            toRaw(viewStore.mapInstance).map.ground.layers.items.forEach((ground: any) => {
                if (ground.visible) {
                    groundlayer = ground;
                }
            });

            if (groundlayer && groundlayer != null) {
                let gro_locationpt = new Point({
                    x: location.x,
                    y: location.y,
                    z: 0,
                    spatialReference: toRaw(viewStore.mapInstance).spatialReference,
                });
                let result = await groundlayer.queryElevation(gro_locationpt);
                groundheight = Math.round(result.geometry.z);
                //console.log(groundheight, "groundheight");
            }
            //var location = getlocation(prevLocation,coords[1],tickDistance);
            let locationpt = new Point({
                x: location.x,
                y: location.y,
                z: form.mode == "1" ? Number(form.height) - 50 : groundheight,
                spatialReference: toRaw(viewStore.mapInstance).spatialReference,
            });
            if (locationpt.x == prevLocation.x && locationpt.y == prevLocation.y) {
                currentCoordIndex++;
                return;
            }
            var heading = 360 - getHeading(location, prevLocation); // only applies to SceneView
            //var rotation = 360 - getHeading(location, prevLocation) // only applies to MapView
            if (form.mode == "3") {
                var entityHeading = 180 - getHeading(location, prevLocation);
                heading = entityHeading;
            }
            //console.log(heading, rotation, entityHeading, 'heading');
            prevLocation = locationpt;
            currentCoordIndex++;

            //根据当前点生成一个固定的缓冲范围，设置视图的四至范围为当前缓冲范围
            //默认缓冲范围300米
            let _distance = 1000;
            if (form.mode != "1") {
                _distance = 30;
            }
            let ptBuff = geometryEngine.buffer(locationpt, _distance, "meters") as any;
            // toRaw(viewStore.mapInstance).extent = ptBuff.extent;

            //if (currentCoordIndex % 300 == 0) {
            //debugger;
            toRaw(viewStore.mapInstance).goTo({
                target: ptBuff,
                // position: {
                //     x: location.x,
                //     y: location.y,
                //     z: form.mode == "1" ? Number(form.height) + groundheight : 0,
                //     spatialReference: toRaw(viewStore.mapInstance).spatialReference,
                // },
                heading: heading,
                // tilt: 90,
                // scale: 15878,
            });
            //}
            showEntity(locationpt, heading);
        }, timetick / 5000);
    }
};

//根据速度计算指定长度距离的定时器
function getTimeTick(speed: any, distance: any) {
    //时速（km/h）
    let hourdistance = speed * 1000;
    //每秒得速度
    let secondSpeed = hourdistance / 3600;

    let timeTick = distance / secondSpeed * 1000;
    console.log(timeTick, "timeTick");
    return timeTick;
}
function getNewPoints(oldPoints: any, distance: any) {
    let points = [];
    if (oldPoints.length > 0) {
        let point = new Point({
            x: oldPoints[0][0],
            y: oldPoints[0][1],
            spatialReference: toRaw(viewStore.mapInstance).spatialReference,
        });
        points.push(point);
    }
    for (var i = 0; i < oldPoints.length - 1; i++) {
        let coord = oldPoints[i];
        let nextCoord = oldPoints[i + 1];
        let point = new Point({
            x: coord[0],
            y: coord[1],
            //z: coord[2],
            spatialReference: toRaw(viewStore.mapInstance).spatialReference,
        });
        let nextPoint = new Point({
            x: nextCoord[0],
            y: nextCoord[1],
            //z: nextCoord[2],
            spatialReference: toRaw(viewStore.mapInstance).spatialReference,
        });
        let curPoint = getDistancePoint(point, nextPoint, distance, points);
    }
    return points;
}
function getDistancePoint(point: any, nextPoint: any, distance: any, points: any) {
    //console.log(point);
    let pointDistance = point.distance(nextPoint);
    //console.log(pointDistance, "pointDistance");
    let nVertIndex = 1;
    //根据总距离和500毫秒的飞行的距离，计算循环次数
    let nums = form.length / tickDistance;
    for (let index = 0; index < nums + 1; index++) {
        //const element = array[index];
        nVertIndex = index + 1;
        let locationPointX = (distance * nVertIndex / pointDistance * (nextPoint.x - point.x)) + point.x;
        let locationPointY = (distance * nVertIndex / pointDistance * (nextPoint.y - point.y)) + point.y;
        let locationpt = new Point({
            x: locationPointX,
            y: locationPointY,
            z: Number(form.height),
            spatialReference: toRaw(viewStore.mapInstance).spatialReference,
        });
        let curDistance = point.distance(locationpt);
        //console.log(curDistance, "curDistance");
        if (curDistance >= pointDistance) {
            points.push(nextPoint);
            break;
        }
        // nVertIndex++;
        points.push(locationpt);
    }
    return points;
}


/*
 * 计算两点对于正北方向的朝向角度 [0,360]
 * @param {*} start format:{'latitude': 30, 'longitude': 120 }
 * @param {*} end
 */
function bearing(start: any, end: any) {
    let rad = Math.PI / 180,
        lat1 = start.x * rad,
        lat2 = end.x * rad,
        lon1 = start.y * rad,
        lon2 = end.y * rad;
    const a = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const b = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    return radiansToDegrees(Math.atan2(a, b));
}

/*
 * 弧度转换为角度
 */
function radiansToDegrees(radians: any) {
    const degrees = radians % (2 * Math.PI);
    return degrees * 180 / Math.PI;
}

//加载模型
var pointGraphic: any = null;
const showEntity = (centerPt: any, heading: any) => {
    // console.log(heading, "heading");
    let locateLayer = toRaw(viewStore.mapInstance).map.findLayerById('entity');
    // 没找到则创建图形图层
    if (!Boolean(locateLayer)) {
        let sketchLayer = new GraphicsLayer({
            id: 'entity',
            elevationInfo: {
                //mode: 'relative-to-ground',
                mode: 'absolute-height',
            }
        } as any);
        toRaw(viewStore.mapInstance).map.layers.add(
            sketchLayer, toRaw(viewStore.mapInstance).map.layers.items.length + 1
        );
        locateLayer = sketchLayer;
    }
    else {
        //locateLayer.graphics.removeAll();
    }
    let gltfSymbol = ref(null);
    //飞机模型
    if (form.mode == "1") {
        gltfSymbol = {
            type: "point-3d",  // autocasts as new PointSymbol3D()
            symbolLayers: [{
                type: "object",
                resource: {
                    href: "model/Airplane_Large_Passenger.glb"
                },
                height: 50,
                heading: heading,
                // material: {
                //     color: "red"
                // },
                width: 200,
                //   //roll: 30,
                //  tilt: 30
            }],
        } as any;
    }
    //汽车模型
    else if (form.mode == "2") {
        gltfSymbol = {
            type: "point-3d",  // autocasts as new PointSymbol3D()
            symbolLayers: [{
                type: "object",
                resource: {
                    href: "model/car.glb"
                },
                height: 4.5,
                heading: heading,
            }],
        } as any;
    }
    //行人模型
    else if (form.mode == "3") {
        console.log(heading, "行人模型");
        gltfSymbol = {
            type: "point-3d",  // autocasts as new PointSymbol3D()
            symbolLayers: [{
                type: "object",
                resource: {
                    href: "model/gltf/Soldier.glb"
                    //href: "model/people/glbxz.com6031.glb",
                },
                height: 3,
                heading: heading,
                // tilt: 80,
            }],
        } as any;

    }
    if (pointGraphic == null) {

        pointGraphic = new Graphic({
            geometry: centerPt,
            symbol: gltfSymbol,
        } as any);
        //console.log(pointGraphic.geometry.z, "showEntity-z");
        locateLayer.graphics.add(pointGraphic);
    }
    else {
        pointGraphic.geometry = centerPt;
        pointGraphic.symbol = gltfSymbol;
        //console.log(pointGraphic.geometry.z, "showEntity-z");
    }

}
//计算点高程
async function getGroundHeight(point: any) {
    let groundlayer = <any>null;
    let groundheight = 0;
    toRaw(viewStore.mapInstance).map.ground.layers.items.forEach((ground: any) => {
        if (ground.visible) {
            groundlayer = ground;
        }
    });

    if (groundlayer && groundlayer != null) {
        let gro_locationpt = new Point({
            x: point.x,
            y: point.y,
            z: 0,
            spatialReference: toRaw(viewStore.mapInstance).spatialReference,
        });
        let result = await groundlayer.queryElevation(gro_locationpt);
        groundheight = result.geometry.z;//Math.round(result.geometry.z);
        console.log(groundheight, "groundheight");
    }
};

function getAngle_new(lng_a: any, lat_a: any, lng_b: any, lat_b: any) {
    let y = Math.sin(lng_b - lng_a) * Math.cos(lat_b);
    let x =
        Math.cos(lat_a) * Math.sin(lat_b) -
        Math.sin(lat_a) * Math.cos(lat_b) * Math.cos(lng_b - lng_a);
    let angle = Math.atan2(y, x);
    angle = (180 * angle) / Math.PI;
    //下面是根据自己的图片初始方向进行校准----不同的图片这里校准是不一样的，需要自行处理
    if (angle < 0) {
        angle = -angle;
    } else {
        angle = 360 - angle;
    }
    return angle - 30;
}


//构建threejs人物走动效果
let peopleRender = <any>null;
const _peopleRender = (centerPoint: any, points: any) => {
    peopleRender = {
        view: toRaw(viewStore.mapInstance),
        renderer: null, // three.js 渲染器
        camera: null, // three.js 相机
        scene: null, // three.js 中的场景
        ambient: null, // three.js中的环境光
        sun: null, // three.js中的平行光源，模拟太阳光
        model2: null, // ufo
        clock: null,
        mixer: null,
        tick: 0,
        modelPoints: [],
        gltf: null,
        runStatus: true,
        setup(context: any) {
            let that = this;
            let THREE = window.THREE;
            that.clock = new THREE.Clock();
            that.mixer = THREE.AnimationMixer;

            let prePoint = points[0];
            for (let i = 0; i < points.length; i++) {
                const _p = points[i];
                let x = _p.x - prePoint.x;
                let y = _p.y - prePoint.y;
                that.modelPoints.push([x, y]);
                prePoint = _p;
            }

            // console.log(that.modelPoints, "that.modelPoints");

            that.renderer = new THREE.WebGLRenderer({
                context: context.gl, // 可用于将渲染器附加到已有的渲染环境(RenderingContext)中
                premultipliedAlpha: false, // renderer是否假设颜色有 premultiplied alpha. 默认为true
                antialias: true, // 抗锯齿
                alpha: true
            });
            that.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
            that.renderer.setViewport(0, 0, that.view.width, that.view.height); // 视口大小设置

            that.renderer.autoClear = false;
            that.renderer.autoClearDepth = false;
            that.renderer.autoClearColor = false;
            // this.renderer.autoClearStencil = false;

            let originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
            that.renderer.setRenderTarget = function (target: any) {
                originalSetRenderTarget(target);
                if (target == null) {
                    context.bindRenderTarget();
                }
            };

            that.scene = new THREE.Scene();
            // setup the camera
            let cam = context.camera;
            //that.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            that.camera = new THREE.PerspectiveCamera(cam.fovY, that.view.width / that.view.height, cam.near, cam.far);
            // that.camera.position.set(0, 40, 30);
            // that.camera.lookAt(0, 0, 0);
            // 添加坐标轴辅助工具
            const axesHelper = new THREE.AxesHelper(1);
            axesHelper.position.copy(1000000, 100000, 100000);
            that.scene.add(axesHelper);

            let grid = new THREE.GridHelper(30, 10, 0xf0f0f0, 0xffffff);
            that.scene.add(grid);

            // setup scene lighting
            that.ambient = new THREE.AmbientLight(0xffffff, 0.5);
            that.scene.add(this.ambient);

            // 平行光
            var directionalLight = new THREE.DirectionalLight(0xBCD2EE);
            directionalLight.position.set(1, 0.75, 0.5).normalize();
            that.scene.add(directionalLight);

            // const loader = new GLTFLoader().setPath('./');
            const loader = new GLTFLoader();
            loader.load("model/gltf/Soldier.glb", async function (gltf: any) {
                //     gltf.scene.traverse(function (objec, function (gltf) {
                console.log('gltf', gltf);
                that.gltf = gltf;
                that.model2 = gltf.scene;
                that.model2.scale.set(5, 5, 5)
                that.scene.add(that.model2);

                let groundlayer = <any>null;
                let groundheight = 0;
                toRaw(viewStore.mapInstance).map.ground.layers.items.forEach((ground: any) => {
                    if (ground.visible) {
                        groundlayer = ground;
                    }
                });

                if (groundlayer && groundlayer != null) {
                    let gro_locationpt = new Point({
                        x: centerPoint.x,
                        y: centerPoint.y,
                        z: 0,
                        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
                    });
                    let result = await groundlayer.queryElevation(gro_locationpt);
                    groundheight = result.geometry.z;//Math.round(result.geometry.z);
                    console.log(groundheight, "groundheight");
                }

                //let groundheight = await getGroundHeight(centerPoint);
                that.model2.position.set(centerPoint.x, centerPoint.y, groundheight);
                //that.model2.lookAt(centerPoint.x, centerPoint.y, 0);
                that.model2.rotateX(Math.PI / 2);
                const angleInDegrees = bearing(points[0], points[1]);
                //const angleInDegrees2 = getHeading(points[1], points[0]);
                //const angleInDegrees1 =
                // (Math.atan2(points[0].x - points[1].x, points[0].y - points[1].y) * 180) /
                //     Math.PI;

                //const angleInDegrees3 = getAngle_new(points[0].x, points[1].x, points[0].y, points[1].y);
                //that.model2.rotateY(-90);
                console.log(angleInDegrees, "_heading_render");

                that.mixer = new THREE.AnimationMixer(that.model2);
                // obj.animations[0]：获得剪辑对象clip
                var AnimationAction = that.mixer.clipAction(gltf.animations[3]);
                //AnimationAction.clampWhenFinished = true;
                //AnimationAction.timeScale = 1; //默认1，可以调节播放速度
                // AnimationAction.loop = THREE.LoopOnce; //不循环播放
                AnimationAction.clampWhenFinished = true;//暂停在最后一帧播放的状态
                AnimationAction.play();//播放动画

            });
            // this.getCoords(context);
            context.resetWebGLState();
        },
        /**
         * 渲染器更新渲染
         * @memberof BuildingEffect
         * @method render
         * @param {Object} context 已有渲染器信息，无需传值
         */
        render(context: any) {
            let that = this;
            let THREE = window.THREE;
            let cam = context.camera;
            //需要调整相机的视角
            that.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            that.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            that.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
            that.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            if (that.runStatus) {
                if (that.model2) {

                    let groundlayer = <any>null;
                    let groundheight = 0;
                    toRaw(viewStore.mapInstance).map.ground.layers.items.forEach((ground: any) => {
                        if (ground.visible) {
                            groundlayer = ground;
                        }
                    });
                    if (that.tick == that.modelPoints.length) {
                        //that.tick = 0;
                        that.runStatus = false;
                        //that.model2.position.set(centerPoint.x, centerPoint.y, centerPoint.z);
                        isStart.value = false;
                        that.mixer = null;
                        that.mixer.clipAction(that.gltf.animations[0]).stop();
                        endbtnVisible.value = false;
                        //externalRenderers.remove(toRaw(viewStore.mapInstance), peopleRender);
                        // context.gl.disable();
                        // that.renderer.state.reset();
                        // that.renderer.render(that.scene, that.camera);
                        // // as we want to smoothly animate the ISS movement, immediately request a re-render
                        // externalRenderers.requestRender(that.view);
                        // // cleanup
                        // context.resetWebGLState();
                        return;

                    }
                    else {
                        if (that.mixer) {
                            that.mixer.update(that.clock.getDelta());
                        }
                        if (that.modelPoints.length > 0) {
                            if (groundlayer && groundlayer != null) {
                                let gro_locationpt = new Point({
                                    x: points[that.tick].x,
                                    y: points[that.tick].y,
                                    z: 0,
                                    spatialReference: toRaw(viewStore.mapInstance).spatialReference,
                                });
                                groundlayer.queryElevation(gro_locationpt).then(function (result: any) {
                                    that.model2.position.z = result.geometry.z;
                                    //console.log(result.geometry.z, "groundheight");
                                });
                            }
                            that.model2.position.x += that.modelPoints[this.tick][0];
                            that.model2.position.y += that.modelPoints[this.tick][1];

                            //let screenPoint = that.view.toScreen(points[that.tick + 50]);
                            //设置模型眼睛看向的位置，保证模型的朝向
                            //that.model2.lookAt(that.modelPoints[this.tick][0], that.modelPoints[this.tick][1], 5000);
                        }
                    }
                }
                let point0 = new Point({
                    x: points[0].x,
                    y: points[0].y,
                    //z: 0,
                    spatialReference: that.view.spatialReference
                });
                const angleInDegrees = bearing(point0, points[1]);
                let ptBuff = geometryEngine.buffer(points[that.tick], 200, "meters") as any;
                //改变地图相机视角
                //toRaw(viewStore.mapInstance).extent = ptBuff.extent;
                if (that.tick == 0) {
                    toRaw(viewStore.mapInstance).goTo({
                        target: ptBuff.extent,
                        //center: point0,
                        fov: 155,
                        heading: angleInDegrees + 90,
                        tilt: 75,
                        scale: 550,
                    });
                    //that.model2.rotateY(angleInDegrees + 90);
                    // that.view.camera = {
                    //     heading: angleInDegrees + 90, // face due east
                    //     tilt: 75, // looking from a bird's eye view
                    //     position: point0,
                    //     fov: 155,
                    // }

                } else {
                    //that.model2.rotateY(250 - angleInDegrees);
                    if (that.tick % 200 == 0) {
                        toRaw(viewStore.mapInstance).goTo({
                            target: ptBuff.extent,
                            // center: new Point({
                            //     x: points[that.tick - 30].x,
                            //     y: points[that.tick - 30].y,
                            //     //z: 30,
                            //     spatialReference: that.view.spatialReference
                            // }),
                            fov: 155,
                            heading: angleInDegrees + 90,
                            tilt: 75,
                            scale: 550,
                        });
                        // that.view.camera = {
                        //     heading: angleInDegrees + 90, // face due east
                        //     tilt: 75, // looking from a bird's eye view
                        //     position: new Point({
                        //         x: points[that.tick - 30].x,
                        //         y: points[that.tick - 30].y,
                        //         //z: 30,
                        //         spatialReference: that.view.spatialReference
                        //     }),
                        //     fov: 155,
                        // }
                    }
                }
                that.tick++;
            }


            // this.renderer.resetGLState();
            that.renderer.state.reset();
            that.renderer.render(that.scene, that.camera);
            // as we want to smoothly animate the ISS movement, immediately request a re-render
            externalRenderers.requestRender(that.view);
            // cleanup
            context.resetWebGLState();
        }
    };
    //add :向视图添加外部渲染器
    externalRenderers.add(toRaw(viewStore.mapInstance), peopleRender);
};


//结束漫游
const endRoute = (obj: any) => {
    clearInterval(timeInter);
    timeInter = null;
    pointGraphic = null;
    endbtnVisible.value = false;
    isStart.value = false;
    if (peopleRender) {
        externalRenderers.remove(toRaw(viewStore.mapInstance), peopleRender);
    }
    // let findCoordLocateLayer = toRaw(viewStore.mapInstance).map.findLayerById('entity');
    // // 没找到则创建图形图层
    // if (Boolean(findCoordLocateLayer)) {
    //     findCoordLocateLayer.graphics.removeAll();
    // }
    // let locateLayer = toRaw(viewStore.mapInstance).map.findLayerById('roamingSketch');
    // // 没找到则创建图形图层
    // if (Boolean(locateLayer)) {

    //     locateLayer.graphics.removeAll();
    // }
};

//取消漫游：结束漫游的同时关闭弹框
const cancleRoute = () => {
    editVisible.value = false;
    isStart.value = false;
    clearInterval(timeInter);
    timeInter = null;
    pointGraphic = null;
    endbtnVisible.value = false;
    if (toRaw(viewStore.mapInstance)) {
        let findCoordLocateLayer = toRaw(viewStore.mapInstance).map.findLayerById('entity');
        // 没找到则创建图形图层
        if (Boolean(findCoordLocateLayer)) {
            findCoordLocateLayer.graphics.removeAll();
        }
        let locateLayer = toRaw(viewStore.mapInstance).map.findLayerById('roamingSketch');
        // 没找到则创建图形图层
        if (Boolean(locateLayer)) {
            locateLayer.graphics.removeAll();
        }
        //清除行人跟随视角模型（threejs）
        if (peopleRender) {
            externalRenderers.remove(toRaw(viewStore.mapInstance), peopleRender);
        }
    }

};

/* 关闭新增路径 */
const closeEdit = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
    cancleRoute();
};

//加载漫游列表数据
const getSceneRecordList = async () => {
    let res = await getScenerecordList({});
    //console.log(res, "res");
    sceneList.value = res.data.data.records;
};

//删除漫游数据
const delSceneRecord = async (pid: any) => {
    let res = await delScenerecord({ pid: pid });
    if (res.data.code == 200) {
        getSceneRecordList();
        ElMessage.success(res.data.msg);
    }
    else {
        ElMessage.warning(res.data.msg);
    }

};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    debugger;
    if (state.currFunc == 'cjmy') {
        locateVisible.value = true;
        getSceneRecordList();

    } else {
        locateVisible.value = false;
        cancleRoute();
    }
});
</script>

<style scoped lang="scss">
@use './scenerecord.scss';
</style>
