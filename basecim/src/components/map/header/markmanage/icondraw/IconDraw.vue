<template>
  <div class="tool-bar" :class="menuStore.layerIsShow ? '' : 'tool-transform'">
    <el-dialog v-model="locateVisible" draggable :modal="false" :close-on-click-modal="false" class="tool-basemap"
      @close="closeLocate">
      <template #header>
        <span class="tool-title">
          <span class="title-txt">图标绘制</span>
          <el-popover placement="bottom-start" :width="200" trigger="hover" content="注意事项文本占位">
            <template #reference>
              <i class="iconfont icon-shuxing"></i>
            </template>
          </el-popover>
        </span>
      </template>
      <div class="tool-main">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane label="图形选择" name="first">
            <ul>
              <li v-for="item in iconList1" :key="item.pid" @click="handleDraw(item)">
                <i class="iconfont" :class="item.icon"></i>
                <div class="icon-label">{{ item.name }}</div>
              </li>
            </ul>
            <ul>
              <li v-for="item in iconList2" :key="item.pid" @click="handleDraw(item)">
                <i class="iconfont" :class="item.icon"></i>
                <div class="icon-label">{{ item.name }}</div>
              </li>
            </ul>
            <div>
              <div class="project-head">
                <div class="add-form">
                  <el-input v-model.trim="addInputName" placeholder="请输入新建项目名称" clearable />
                  <el-button type="primary" @click="addProject">新建项目</el-button>
                </div>
                <div class="head-title" @click="cancelProjectCheck">
                  <i class="iconfont icon-liucheng"></i>
                  <span>项目列表</span>
                </div>
              </div>
              <el-scrollbar class="project-main" max-height="15vh">
                <div v-for="item in projectList" class="project-list" :key="item.pid" @click="selectProject(item)">
                  <div :class="currentProject != null && item.pid == currentProject.pid
                    ? 'list-head-select'
                    : 'list-head'
                    ">
                    <i class="iconfont icon-liucheng"></i>
                    <span>{{ item.name }}</span>
                    <i style="float: right" class="iconfont icon-shanchu" @click="delProjectIcon(item)"></i>
                  </div>
                  <div v-for="subItem in item.childlist" :key="subItem.pid" class="sub-list">
                    <span>{{ subItem.name }}</span>
                    <span>
                      <i class="iconfont icon-yincangdaan" style="padding-right: 4px" @click="hideGraphic(subItem)"
                        v-if="subItem.show"></i>
                      <i class="iconfont icon-dingwei" @click="locationGraphic(subItem)" v-if="!subItem.show"></i>
                      <i class="iconfont icon-shanchu" @click="delProjectIcon(subItem)"></i>
                    </span>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-tab-pane>
          <el-tab-pane label="符号设置" name="second">
            <el-form :model="form" label-width="140px">
              <!-- <el-form-item label="点形状" prop="shape" v-if="currentIcon.id == 4 || currentIcon.id == 1">
                <el-select v-model="form.type" class="m-2" placeholder="Select" size="small">
                  <el-option label="二维图标" value="twoDimensional" />
                  <el-option label="三维图标" value="threeDimensional" />
                </el-select>
              </el-form-item> v-if="currentIcon.id == 4 || currentIcon.id == 1"-->
              <el-form-item label="标注文字" prop="textvalue">
                <el-input v-model="form.textvalue" placeholder="请输入标注文字" @change="completeInput()" />
              </el-form-item>
              <el-form-item label="文字颜色" prop="textcolor" v-if="currentIcon.id == 4 || currentIcon.id == 1">
                <el-color-picker v-model="form.textcolor" show-alpha />
              </el-form-item>
              <el-form-item label="文字大小" prop="fontsize" v-if="currentIcon.id == 1 || currentIcon.id == 4">
                <el-input-number v-model="form.fontsize" :min="1" :max="100" />
              </el-form-item>
              <el-form-item label="文字背景色" prop="background" v-if="currentIcon.id == 4">
                <el-color-picker v-model="form.background" show-alpha />
              </el-form-item>
              <el-form-item label="图形颜色" prop="colorvalue" v-if="currentIcon.id != 4">
                <el-color-picker v-model="form.colorvalue" show-alpha />
              </el-form-item>
              <el-form-item label="图形大小" prop="geoSize" v-if="currentIcon.id == 1 ||
                currentIcon.id == 5 ||
                currentIcon.id == 6
                ">
                <el-input-number v-model="form.geoSize" :min="1" :max="10000" />
              </el-form-item>
              <el-form-item label="点形状" prop="shape" v-if="currentIcon.id == 1">
                <el-select v-model="form.shape" class="m-2" placeholder="Select" size="small">
                  <el-option label="图标" value="greenpng" />
                  <el-option label="三角形" value="triangle" />
                  <el-option label="圆形" value="circle" />
                  <el-option label="正方形" value="square" />
                  <el-option label="十字交叉" value="cross" />
                  <el-option label="x交叉" value="x" />
                  <el-option label="菱形" value="kite" />
                  <el-option label="三角形" value="triangle" />
                  <!-- <el-option label="球形" value="sphere" />
                    <el-option label="圆柱体" value="cylinder" />
                    <el-option label="立方体" value="cube" />
                    <el-option label="圆锥体" value="cone" />
                    <el-option label="到锥体" value="inverted-cone" />
                    <el-option label="菱形" value="diamond" />
                    <el-option label="四面体" value="tetrahedron" /> -->
                </el-select>
              </el-form-item>
              <el-form-item label="填充样式" prop="fillstyle" v-if="currentIcon.id == 2 ||
                currentIcon.id == 5 ||
                currentIcon.id == 6 ||
                currentIcon.id == 7
                ">
                <el-select v-model="form.fillstyle" class="m-2" placeholder="Select" size="small"
                  v-if="currentIcon.id == 2 || currentIcon.id == 7">
                  <el-option label="反向对角线" value="backward-diagonal" />
                  <el-option label="正向对角线" value="forward-diagonal" />
                  <el-option label="对角交叉" value="diagonal-cross" />
                  <el-option label="十字交叉" value="cross" />
                  <el-option label="填充色" value="solid" />
                  <el-option label="垂直线" value="vertical" />
                  <!-- <el-option label="无" value="none" /> -->
                </el-select>
                <el-select v-model="form.fillstyle" class="m-2" placeholder="Select" size="small"
                  v-if="currentIcon.id == 6 || currentIcon.id == 5">
                  <el-option label="段线" value="dash" />
                  <el-option label="段线点" value="dash-dot" />
                  <el-option label="点" value="dot" />
                  <el-option label="长段线" value="long-dash" />
                  <el-option label="长段线点" value="long-dash-dot" />
                  <el-option label="长段线点点" value="long-dash-dot-dot" />
                  <el-option label="短段线" value="short-dash" />
                  <el-option label="短段线点" value="short-dash-dot" />
                  <el-option label="短段线点点" value="short-dash-dot-dot" />
                  <el-option label="短点" value="short-dot" />
                  <el-option label="实线" value="solid" />
                  <!-- <el-option label="无" value="none" /> -->
                </el-select>
              </el-form-item>
              <!-- <el-form-item label="轮廓形状" prop="lineShape" v-if="currentIcon.id == 5">
                <el-select v-model="form.lineShape" class="m-2" placeholder="Select" size="small">
                  <el-option label="圆形" value="circle" />
                  <el-option label="四方形" value="quad" />
                </el-select>
              </el-form-item> -->
              <el-form-item label="图形轮廓颜色" prop="outlinecolor" v-if="currentIcon.id != 4 &&
                currentIcon.id != 5 &&
                currentIcon.id != 6 &&
                form.shape != 'greenpng'
                ">
                <el-color-picker v-model="form.outlinecolor" show-alpha />
              </el-form-item>
              <el-form-item label="图形轮廓宽度" prop="outlinewidth" v-if="currentIcon.id != 4 &&
                currentIcon.id != 5 &&
                currentIcon.id != 6 &&
                form.shape != 'greenpng'
                ">
                <el-input-number v-model="form.outlinewidth" :min="1" :max="100" />
              </el-form-item>
              <el-form-item label="高度" prop="height" v-if="currentIcon.id == 3 || currentIcon.id == 5">
                <el-input-number v-model="form.height" :min="0" :max="100000" />
              </el-form-item>
              <!-- <el-form-item label="离地高度" prop="depth" v-if="currentIcon.id == 1 || currentIcon.id == 3 || currentIcon.id == 5">
                <el-input-number v-model="form.depth" :min="1" :max="100000" />
            </el-form-item> -->
              <!-- <el-form-item label="透明度" prop="opacity" v-if="currentIcon.id == 3">
                <el-input-number v-model="form.opacity" :min="1" :max="100" />
            </el-form-item> -->
              <el-form-item>
                <el-button type="primary" @click="onSubmit">确定</el-button>
              </el-form-item>
            </el-form>
            <!-- <template #footer>
              <span class="dialog-footer">
                <el-button @click="handleClose(true)">取消</el-button>
                <el-button type="primary" @click="drawLabel"> 确定 </el-button>
              </span>
            </template> -->
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, reactive, watch, toRaw, onMounted } from "vue";
import useStore from "@/stores";
/* UI 相关 */
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import type { FormRules } from "element-plus";

/* ArcGIS API */
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Sketch from "@arcgis/core/widgets/Sketch";
import Graphic from "@arcgis/core/Graphic";
import * as externalRenderers from "@arcgis/core/views/3d/externalRenderers";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";

/* 其他 */
import * as THREE from "three";
/* 防抖节流 */
import _, { fromPairs, some, sortedIndex } from "lodash";
/* 烟火 */
import FireParticle from "./plugins/fireParticle";
import Mover from "./plugins/mover";
import FireInit from "./plugins/fireInit";
/* 地标图片 */
import greenpng from "@/assets/images/green.png";
/* 绘制箭头 */
import xp from "./plugins/algorithm";
import type { TabsPaneContext } from "element-plus";

/* api */
import {
  getIconProjectList,
  saveProjectIcon,
  deleteProjectIcon,
} from "./icondraw-api";
import { ITEM_RENDER_EVT } from "element-plus/es/components/virtual-list/src/defaults";

const activeName = ref("first");

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event);
};

/* API */
const { menuStore, viewStore, mapStore, iconProjectStore } = useStore();

const locateVisible = ref(false);

const closeLocate = () => {
  // 菜单恢复初始值
  if (menuStore.currFunc == "tbhz") {
    menuStore.handleFunc("");
  }
};

//取消项目选中
const cancelProjectCheck = () => {
  currentProject.value = {};
};

/*绘制图形设置弹框*/
// 表单
const form = reactive({
  textvalue: "", //文本标注文字内容
  textcolor: "rgba(255, 0, 0, 1)", //文字颜色
  colorvalue: "rgba(255, 0, 0, 1)", //颜色
  fontsize: 12, //文字大小,
  background: "rgba(0, 0, 0, 0.7)", //背景色
  geoSize: 16, //图形大小
  outlinecolor: "rgba(255, 255, 255, 1)",
  outlinewidth: 2,
  shape: "circle", //'inverted-cone',
  fillstyle: "solid",
  depth: 0, //离地高度,
  height: 10, //物体高度
  lineShape: "circle",
  type: "twoDimensional", //二维三维图标切换
});
// const dialogVisible = ref(false);
const handleClose = (boo: boolean) => {
  //   dialogVisible.value = false;
  if (boo) {
    clearGraphics();
  }
};

/* 图标列表1 */
let currentIcon = ref<any>({});
let landmarkIndex = ref(0);
let polyfillIndex = ref(0);
let lftIndex = ref(0);
let wenziIndex = ref(0);
let pathIndex = ref(0);
let allowIndex = ref(0);
let ywAllowIndex = ref(0);
let symbolIndex = ref(0);
const iconList1 = ref<any>([
  { id: 1, name: "地标", icon: "icon-landmark" },
  { id: 2, name: "多边形", icon: "icon-polygon-fill" },
  { id: 3, name: "立方体", icon: "icon-lifangtilitiduomiantifangkuai2" },
  { id: 4, name: "文字", icon: "icon-wenzi" },
  { id: 5, name: "路径", icon: "icon-lujingfenxi" },
  { id: 6, name: "箭头", icon: "icon-xiangzuo" },
  { id: 7, name: "燕尾箭头", icon: "icon-jiantou" },
  // { id: 8, name: '符号', icon: 'icon-jurassic_Frame-symbol' },
]);

/* 图标列表2 */
let waterIndex = ref(0);
let fireIndex = ref(0);
let somkeIndex = ref(0);
let penquanIndex = ref(0);
const iconList2 = ref<any>([
  { id: 9, name: "水域", icon: "icon-shuiku" },
  { id: 10, name: "烟火", icon: "icon-huo" },
  { id: 11, name: "烟雾", icon: "icon-jianzhuanquan" },
  { id: 12, name: "喷泉", icon: "icon-penquan" },
]);

//选中项目pid
let currentProject = ref<any>({});
/* 项目列表 */
let projectList = ref<any>([
  // {
  //     label: '项目1',
  //     pid: 1,
  //     childList: [
  //         {
  //             label: '地标1',
  //             pid: 11,
  //             type: '',
  //         },
  //         {
  //             label: '地标2',
  //             pid: 12,
  //             type: '',
  //         },
  //     ],
  // },
]);

/*页面初始化 */
let user = <any>null;
let myExternalRenderer: any = externalRenderers;
onMounted(() => {
  user = JSON.parse(sessionStorage.getItem("23vUser") as string);
  // if (iconProjectStore.projectShow != null) {
  //   let prjlist = iconProjectStore.projectShow.value;
  //   if (prjlist) {
  //     projectList.value = prjlist;
  //   }
  // }

  myExternalRenderer = {
    render: function (context: any) {
      // update WebGL resources and execute draw calls
      externalRenderers.requestRender(toRaw(viewStore.mapInstance));
    },
  };
});

/* 初始化绘制工具 */
let sketchLayer = <any>null;
let sketchTool = <any>null;
const initTool = () => {
  /* 绘制图层 */
  if (!sketchLayer) {
    sketchLayer = new GraphicsLayer({
      id: "drawsketch",
      elevationInfo: {
        //mode: 'relative-to-ground',
        mode: "on-the-ground",
      },
    });

    toRaw(viewStore.mapInstance).map.layers.add(sketchLayer);
  }

  /* 绘制工具 */
  if (!sketchTool) {
    let pointSymbol = <any>null;
    if (form.shape == "greenpng") {
      debugger;
      pointSymbol = {
        type: "picture-marker", // autocasts as new PictureMarkerSymbol()
        url: form.shape,
        width: form.geoSize,
        height: form.geoSize,
      } as any;
      //pointSymbol = symbol;
    } else {
      debugger;
      pointSymbol = {
        type: "point-3d", // autocasts as new PointSymbol3D()
        symbolLayers: [
          {
            type: "icon", // autocasts as new IconSymbol3DLayer()
            size: form.geoSize, // points
            resource: { primitive: form.shape },
            material: { color: form.colorvalue },
            outline: {
              color: form.outlinecolor,
              size: form.outlinewidth,
            },
          },
        ],
      } as any;
    }
    sketchTool = new SketchViewModel({
      layer: sketchLayer,
      view: toRaw(viewStore.mapInstance),
      // labelOptions: {
      //   enabled: true,
      // },
      // tooltipOptions: {
      //   enabled: true,
      // },
      // defaultCreateOptions: {
      //   hasZ: true, // default value
      // },
      // defaultUpdateOptions: {
      //   enableZ: false, // default value
      // },
      polygonSymbol: {
        type: "polygon-3d",
        symbolLayers: [
          {
            type: "fill",
            material: { color: form.colorvalue },
            outline: {
              color: form.outlinecolor,
              size: form.outlinewidth,
            },
          },
        ],
        pattern: {
          type: "style",
          style: form.fillstyle,
        },
        //castShadows: true,
      },
      polylineSymbol: {
        type: "line-3d", // autocasts as new LineSymbol3D()
        symbolLayers: [
          {
            type: "path", // autocasts as new PathSymbol3DLayer()
            profile: form.lineShape,
            width: form.geoSize, // width of the tube in meters
            material: { color: form.colorvalue },
            join: "round",
          },
        ],
      },
      pointSymbol: pointSymbol,
    } as any);
  }
};

// 表单提交
function onSubmit() {
  // 结束上一次绘制
  if (sketchTool != null) {
    sketchTool.destroy();
    sketchTool = null;
    initTool();

    // 重新绘制
    if (ifChooseIcon) {
      drawLabel(false);
    } else {
      drawLabel(true);
    }
  }
}
function completeInput() {
  //   console.log(77899);
  //   watch(
  //   () =>form.textvalue,
  //   (textvalue) => {
  //     console.log(`textvalue is: ${textvalue}`)
  //     //   // 结束上一次绘制
  //   // if (sketchTool != null) {
  //   //   // clearTimeout(timeout);
  //   //   // timeout = setTimeout(() => {
  //   //     sketchTool.destroy();
  //   //     sketchTool = null;
  //   //     initTool();
  //   //     // 重新绘制
  //   //     if (ifChooseIcon) {
  //   //       drawLabel(false);
  //   //     } else {
  //   //       drawLabel(true);
  //   //     }
  // //     }, 1000);
  //   // }
  //   }
  // )
}

/* 新建项目 */
const addInputName = ref<string>("");
//项目id
let pid = 1;
const addProject = async () => {
  if (!addInputName.value) return ElMessage.warning("项目名称不能为空");
  // TODO
  let prjdata = {
    name: addInputName.value,
    userid: user.pid,
    username: user.name,
  } as any;
  // if (currentProject.value != null && currentProject.value.pid > 0) {
  //   prjdata.parentid = currentProject.value.pid;
  // }
  const { data: res } = await saveProjectIcon(prjdata);
  if (res.code != 200) return ElMessage.error(res.msg);
  getProjectIcons();
  //projectList.value.push(prjdata);
  //localStorage.setItem("IconDraw_ProjectList", toRaw(JSON.stringify(projectList.value)));

  //iconProjectStore.handleProjectShow(projectList.value);
  //console.log(JSON.stringify(projectList.value), "IconDraw_ProjectList");
  addInputName.value = "";
  pid++;
  ElMessage.success("创建成功");
};

//删除项目图标
const delProjectIcon = async (data: any) => {
  const { data: res } = await deleteProjectIcon({ pid: data.pid });
  if (res.code == 200) {
    ElMessage.success("删除成功！");
    //删除页面上以显示的图形
    hideGraphic(data);
  } else {
    ElMessage.error(res.msg);
  }
  getProjectIcons();
};

//隐藏图标
let isshowIcon = ref(false);
let currentIconData = ref<any>({
  pid: 0,
});
const hideGraphic = (data: any) => {
  console.log("yyyyyyyyyy");

  currentIconData.value = data;
  //删除页面上以显示的图形
  if (data.iconPid == 1 || data.iconPid == 4) {
    let pointshowLayer = toRaw(viewStore.mapInstance).map.findLayerById("pointshowLayer");
    if (pointshowLayer) {
      sketchLayer.graphics.removeAll();
      isshowIcon.value = false;
      data.show = false;
      for (let i = 0; i < pointshowLayer.graphics.items.length; i++) {
        console.log(pointshowLayer.graphics.items[i], data, "--ii");

        const graphic = pointshowLayer.graphics.items[i];
        if (graphic.attributes.datapid == data.pid) {
          // debugger;
          pointshowLayer.graphics.remove(graphic);
          console.log("sssssssss");
        }

      }
    }
  }
  else {
    let showLayer = toRaw(viewStore.mapInstance).map.findLayerById("showLayer");
    if (showLayer) {
      console.log("tttttt", showLayer.graphics);

      sketchLayer.graphics.removeAll();
      isshowIcon.value = false;
      data.show = false;
      for (let i = 0; i < showLayer.graphics.items.length; i++) {
        console.log(showLayer.graphics.items[i], data, "--ii");

        const graphic = showLayer.graphics.items[i];
        if (graphic.attributes.datapid == data.pid) {
          // debugger;
          showLayer.graphics.remove(graphic);
          console.log("sssssssss");
        }
        if (data.iconPid == 10) {

          fireRenders.value.forEach((_render: any) => {
            if (_render.datapid == data.pid) {
              console.log("--ooooppp");
              console.log(_render);

              externalRenderers.remove(
                toRaw(viewStore.mapInstance),
                toRaw(_render.render)
              );
            }
          });

        }
        if (data.iconPid == 11) {
          somkeRenders.value.forEach((_render: any) => {
            if (_render.datapid == data.pid) {
              console.log("--ooooppp");
              console.log(_render);

              externalRenderers.remove(
                toRaw(viewStore.mapInstance),
                toRaw(_render.render)
              );
            }
          });
          // if (somkeRender != null) {
          //   externalRenderers.remove(toRaw(viewStore.mapInstance), somkeRender);
          //   somkeRender = null;
          // }
        }
        if (data.iconPid == 12) {
          myRenderers.value.forEach((_render: any) => {
            if (_render.datapid == data.pid) {
              console.log("--ooooppp");
              console.log(_render);

              externalRenderers.remove(
                toRaw(viewStore.mapInstance),
                toRaw(_render.render)
              );
            }
          });
          // if (myRenderer != null) {
          //   externalRenderers.remove(toRaw(viewStore.mapInstance), myRenderer);
          //   myRenderer = null;
          // }
        }
      }
    }
  }
};


//图形定位
let showIconIdList = ref<any>([]);
const locationGraphic = (data: any) => {
  //toRaw(viewStore.mapInstance).graphics.removeAll();
  //sketchLayer.graphics.removeAll();
  currentIconData.value = data;
  console.log(JSON.parse(data.graphicpoints), "graphicpoints");
  let graphics = JSON.parse(data.graphicpoints);
  let showLayer = toRaw(viewStore.mapInstance).map.findLayerById("showLayer");
  if (!showLayer) {
    showLayer = new GraphicsLayer({
      id: "showLayer",
      elevationInfo: {
        mode: "on-the-ground",
      },
    });
    toRaw(viewStore.mapInstance).map.layers.add(showLayer);
  }

  let pointshowLayer = toRaw(viewStore.mapInstance).map.findLayerById("pointshowLayer");
  if (!pointshowLayer) {
    pointshowLayer = new GraphicsLayer({
      id: "pointshowLayer",
      elevationInfo: {
        mode: "relative-to-ground",
      },
    });
    toRaw(viewStore.mapInstance).map.layers.add(pointshowLayer);
  }


  isshowIcon.value = true;
  data.show = true;
  graphics.forEach((gra: any) => {
    //图标
    let symbol = <any>null;
    let geo = <any>null;
    //地标
    if (data.iconPid == 1) {
      debugger;
      // pointshowLayer.elevationInfo.mode = "relative-to-ground";
      console.log(gra, "gra");
      geo = {
        type: "point",
        x: gra.geometry.x,
        y: gra.geometry.y,
        z: gra.geometry.z,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
      };
      if (gra.symbol.url != "" && gra.symbol.url != null) {
        symbol = {
          type: "picture-marker", // autocasts as new PictureMarkerSymbol()
          url: gra.symbol.url,
          width: gra.symbol.width,
          height: gra.symbol.height,
        };
      }
      else if (gra.symbol.symbolLayers[0].type == "Icon") {
        let symbolLayers = gra.symbol.symbolLayers[0];
        symbol = {
          type: "point-3d", // autocasts as new PointSymbol3D()
          symbolLayers: [
            {
              type: "icon", // autocasts as new IconSymbol3DLayer()
              size: symbolLayers.size, // points
              resource: { primitive: symbolLayers.resource.primitive },
              material: { color: symbolLayers.material.color },
              outline: {
                color: symbolLayers.outline.color,
                size: symbolLayers.outline.size,
              },
            },
          ],
        };
      }
      else {
        debugger;
        let symbolLayers = gra.symbol.symbolLayers[0];
        symbol = {
          type: "point-3d",
          symbolLayers: [
            {
              type: "text",
              material: { color: symbolLayers.material.color },
              size: symbolLayers.size,
              text: symbolLayers.text,
              // background: { color: [0, 0, 0, 0.2] },
              halo: {
                color: [255, 255, 255, 0.8], // autocasts as Color
                size: 1,
              },
            },
          ],
        };
      }
    }
    //多边形
    else if (data.iconPid == 2) {
      geo = {
        type: "polygon",
        hasZ: true,
        hasM: true,
        rings: gra.geometry.rings,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
      };
      let symbolLayers = gra.symbol.symbolLayers[0];
      let fillcolor = symbolLayers.material.color;
      //console.log(fillcolor, "fillcolor");
      let opacity = symbolLayers.material.transparency / 100;
      if (!isNaN(opacity)) {
        fillcolor.push(opacity);
      }

      symbol = {
        type: "polygon-3d", // autocasts as new PolygonSymbol3D()
        symbolLayers: [
          {
            type: "fill", // autocasts as new FillSymbol3DLayer()
            material: { color: fillcolor },
            outline: {
              color: symbolLayers.outline.color,
              size: symbolLayers.outline.size,
            },
            pattern: {
              type: "style",
              style: symbolLayers.pattern.style,
            },
          },
        ],
      };
    }
    //立方体
    else if (data.iconPid == 3) {
      geo = {
        type: "polygon",
        hasZ: true,
        hasM: true,
        rings: gra.geometry.rings,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
      };
      let symbolLayers = gra.symbol.symbolLayers[0];
      let fillcolor = symbolLayers.material.color;
      //console.log(fillcolor, "fillcolor");
      let opacity = symbolLayers.material.transparency / 100;
      if (!isNaN(opacity)) {
        fillcolor.push(opacity);
      }
      symbol = {
        type: "polygon-3d",
        symbolLayers: [
          {
            type: "extrude",
            size: symbolLayers.size,
            material: {
              color: fillcolor,
            },
            edges: {
              type: "solid",
              color: symbolLayers.edges.color,
              size: symbolLayers.edges.size,
            },
          },
        ],
      };
    }
    //文字
    else if (data.iconPid == 4) {
      geo = {
        type: "point",
        x: gra.geometry.x,
        y: gra.geometry.y,
        z: 20,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
      };
      let symbolLayers = gra.symbol.symbolLayers[0];
      symbol = {
        type: "point-3d",
        symbolLayers: [
          {
            type: "text",
            material: { color: symbolLayers.material.color },
            size: symbolLayers.size,
            text: symbolLayers.text,
            background: { color: symbolLayers.background.color },
          },
        ],
      };
    }
    //路径,箭头
    else if (data.iconPid == 5 || data.iconPid == 6) {
      geo = {
        type: "polyline",
        hasZ: true,
        hasM: true,
        paths: gra.geometry.paths,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
      };
      let _style = gra.symbol.style.substring(7).toLowerCase();
      let linestyle = "solid";
      switch (_style) {
        case "dash":
          linestyle = "dash";
          break;
        case "dashdot":
          linestyle = "dash-dot";
          break;
        case "dot":
          linestyle = "dot";
          break;
        case "longdash":
          linestyle = "long-dash";
          break;
        case "longdashdot":
          linestyle = "long-dash-dot";
          break;
        case "longdashdotdot":
          linestyle = "long-dash-dot-dot";
          break;
        case "shortdash":
          linestyle = "short-dash";
          break;
        case "shortdashdot":
          linestyle = "short-dash-dot";
          break;
        case "shortdashdotdot":
          linestyle = "short-dash-dot-dot";
          break;
        case "shortdot":
          linestyle = "short-dot";
          break;
        default:
          linestyle = "solid";
          break;
      }
      symbol = {
        type: "simple-line", // autocasts as new SimpleLineSymbol()
        color: gra.symbol.color,
        width: gra.symbol.width,
        style: linestyle,
        join: "round",
        cap: "square",
      };
      if (data.iconPid == 6) {
        symbol = {
          type: "simple-line",
          color: gra.symbol.color,
          width: gra.symbol.width,
          // Define a blue "x" marker at the beginning of the line
          marker: {
            // autocasts from LineSymbolMarker
            style: "arrow",
            color: gra.symbol.marker.color,
            placement: "end",
          },
          style: linestyle,
        };
      }
    }
    //燕尾箭头
    else if (data.iconPid == 7) {
      let _rings = ywAllowRender(gra.geometry.paths[0]);
      console.log(_rings, "_rings");
      geo = {
        type: "polygon",
        hasZ: true,
        hasM: true,
        rings: [_rings],
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
      };
      symbol = gra.symbol;
    }
    //水域
    else if (data.iconPid == 9) {
      geo = {
        type: "polygon",
        hasZ: true,
        hasM: true,
        rings: gra.geometry.rings,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
      };
      symbol = {
        type: "polygon-3d", // autocasts as new PolygonSymbol3D()
        symbolLayers: [
          {
            type: "water", // autocasts as new FillSymbol3DLayer()
            waveDirection: 260,
            color: "#0077BE",
            waveStrength: "slight",
            waterbodySize: "large",
          },
        ],
      };
    }
    //烟火,烟雾
    else if (data.iconPid == 10 || data.iconPid == 11 || data.iconPid == 12) {
      // showLayer.graphics.removeAll();
      geo = {
        type: "point",
        x: gra.geometry.x,
        y: gra.geometry.y,
        z: gra.geometry.z,
        spatialReference: toRaw(viewStore.mapInstance).spatialReference,
      };
      let centerpoint = [gra.geometry.x, gra.geometry.y, gra.geometry.z];
      if (data.iconPid == 10) {

        let flag = false;
        fireRenders.value.forEach((_render: any) => {
          if (_render.datapid == data.pid) {
            flag = true;
            console.log("--ooooppp");
            console.log(_render);

            externalRenderers.add(
              toRaw(viewStore.mapInstance),
              toRaw(_render.render)
            );
          }
        });
        if (!flag) {
          _fireRender(centerpoint, "#fd3109", data.pid);
          flag = false;
        }
      } else if (data.iconPid == 11) {

        let flag = false;
        somkeRenders.value.forEach((_render: any) => {
          if (_render.datapid == data.pid) {
            flag = true;
            console.log("--ooooppp");
            console.log(_render);

            externalRenderers.add(
              toRaw(viewStore.mapInstance),
              toRaw(_render.render)
            );
          }
        });
        if (!flag) {
          _somkeRender(centerpoint, "#738276", data.pid);
          flag = false;
        }
      } else {

        let flag = false;
        myRenderers.value.forEach((_render: any) => {
          if (_render.datapid == data.pid) {
            flag = true;
            console.log("--ooooppp");
            console.log(_render);

            externalRenderers.add(
              toRaw(viewStore.mapInstance),
              toRaw(_render.render)
            );
          }
        });
        if (!flag) {
          _penquanRender(centerpoint, data.pid);
          flag = false;
        }
        // if (myRenderer != null) {
        //   externalRenderers.remove(toRaw(viewStore.mapInstance), myRenderer);
        // }
        // _penquanRender(centerpoint);
      }
    }

    if (geo != null) {
      showIconIdList.value.push(data.pid);

      let graphic = new Graphic({
        geometry: geo,
        symbol: symbol,
        attributes: {
          datapid: data.pid,
        },
      });
      if (data.iconPid == 1 || data.iconPid == 4) {
        pointshowLayer.graphics.add(graphic);
      }
      else {
        showLayer.graphics.add(graphic);
      }
      toRaw(viewStore.mapInstance).center = geo;
    }
  });
};

//点击项目选中当前项目
let z_value = ref(0); //海拔高度
const selectProject = (item: any) => {
  currentProject.value = item;
  let iconlist = <any>[];
  let polygonList = <any>[];
  let lftList = <any>[];
  let textList = <any>[];
  let pathList = <any>[];
  let allowList = <any>[];
  let ywList = <any>[];
  let fireList = <any>[];
  let waterList = <any>[];
  let smokeList = <any>[];
  let penquanList = <any>[];

  for (let i = 0; i < currentProject.value.childlist.length; i++) {
    debugger;
    const icon = currentProject.value.childlist[i];
    let index = icon.name.split("_")[1];
    if (isNaN(parseFloat(index))) {
      index = 0;
    }
    Object.assign(icon, { index: index });
    // console.log(icon, "icon");
    if (icon.iconPid == 1) {
      iconlist.push(icon);
    } else if (icon.iconPid == 2) {
      polygonList.push(icon);
    } else if (icon.iconPid == 3) {
      lftList.push(icon);
    } else if (icon.iconPid == 4) {
      textList.push(icon);
    } else if (icon.iconPid == 5) {
      pathList.push(icon);
    } else if (icon.iconPid == 6) {
      allowList.push(icon);
    } else if (icon.iconPid == 7) {
      ywList.push(icon);
    } else if (icon.iconPid == 9) {
      waterList.push(icon);
    } else if (icon.iconPid == 10) {
      fireList.push(icon);
    } else if (icon.iconPid == 11) {
      smokeList.push(icon);
    } else if (icon.iconPid == 12) {
      penquanList.push(icon);
    }
  }
  //根据index排序
  if (iconlist.length > 0) {
    iconlist.sort((a: any, b: any) => b.index - a.index);
    landmarkIndex.value = Number(iconlist[0].index);
  }
  else {
    landmarkIndex.value = 0;
  }
  if (polygonList.length > 0) {
    polygonList.sort((a: any, b: any) => b.index - a.index);
    polyfillIndex.value = Number(polygonList[0].index);
  }
  else {
    polyfillIndex.value = 0;
  }
  if (lftList.length > 0) {
    lftList.sort((a: any, b: any) => b.index - a.index);
    lftIndex.value = Number(lftList[0].index);
  }
  else lftIndex.value = 0;

  if (textList.length > 0) {
    textList.sort((a: any, b: any) => b.index - a.index);
    wenziIndex.value = Number(textList[0].index);
  }
  else wenziIndex.value = 0;
  if (pathList.length > 0) {
    pathList.sort((a: any, b: any) => b.index - a.index);
    pathIndex.value = Number(pathList[0].index);
  } else pathIndex.value = 0;
  if (allowList.length > 0) {
    allowList.sort((a: any, b: any) => b.index - a.index);
    allowIndex.value = Number(allowList[0].index);
  } else allowIndex.value = 0;
  if (ywList.length > 0) {
    ywList.sort((a: any, b: any) => b.index - a.index);
    ywAllowIndex.value = Number(ywList[0].index);
  } else ywAllowIndex.value = 0;
  if (waterList.length > 0) {
    waterList.sort((a: any, b: any) => b.index - a.index);
    waterIndex.value = Number(waterList[0].index);
  } else waterIndex.value = 0;
  if (fireList.length > 0) {
    fireList.sort((a: any, b: any) => b.index - a.index);
    fireIndex.value = Number(fireList[0].index);
  } else fireIndex.value = 0;
  if (smokeList.length > 0) {
    smokeList.sort((a: any, b: any) => b.index - a.index);
    somkeIndex.value = Number(smokeList[0].index);
  } else somkeIndex.value = 0;
  if (penquanList.length > 0) {
    penquanList.sort((a: any, b: any) => b.index - a.index);
    penquanIndex.value = Number(penquanList[0].index);
  } else penquanIndex.value = 0;
};

//渲染烟火/烟雾的方法
let fireRenders = ref<any>([]);
let fireRender = <any>null;
const _fireRender = (centerPoint: any, color: string, datapid = -1) => {
  let view = toRaw(viewStore.mapInstance);

  fireRenders.value.push({
    datapid: datapid != -1 ? datapid : null,
    render: new FireParticle({
      view,
      externalRenderers,
      Mover,
      FireInit,
      position: centerPoint, //[13493621.2254855, 3647407.029471413, 300]
      color: color,
      scale: view.scale,
    }),
  });
  // console.log(fireRenders.value[fireRenders.value.length - 1], "--op");

  externalRenderers.add(
    toRaw(viewStore.mapInstance),
    toRaw(fireRenders.value[fireRenders.value.length - 1].render)
  );

  toRaw(viewStore.mapInstance).watch("scale", () => {
    fireRenders.value.forEach((_render: any) => {
      externalRenderers.remove(view, toRaw(_render.render));
      _render.render = new FireParticle({
        view,
        externalRenderers,
        Mover,
        FireInit,
        position: centerPoint, //[13493621.2254855, 3647407.029471413, 300]
        color: color,
        scale: view.scale,
      });

      externalRenderers.add(view, toRaw(_render.render));
    });
  });
};

let somkeRender = <any>null;
let somkeRenders = ref<any>([]);
const _somkeRender = (centerPoint: any, color: string, datapid = -1) => {
  let view = toRaw(viewStore.mapInstance);
  // console.log(color, "color");
  // somkeRender = 
  somkeRenders.value.push({
    datapid: datapid != -1 ? datapid : null,
    render: new FireParticle({
      view,
      externalRenderers,
      Mover,
      FireInit,
      position: centerPoint, //[13493621.2254855, 3647407.029471413, 300]
      color: color,
      scale: view.scale,
    }),
  });

  externalRenderers.add(
    toRaw(viewStore.mapInstance),
    toRaw(somkeRenders.value[somkeRenders.value.length - 1].render)
  );


  toRaw(viewStore.mapInstance).watch("scale", () => {

    somkeRenders.value.forEach((_render: any) => {
      externalRenderers.remove(view, toRaw(_render.render));
      _render.render = new FireParticle({
        view,
        externalRenderers,
        Mover,
        FireInit,
        position: centerPoint, //[13493621.2254855, 3647407.029471413, 300]
        color: color,
        scale: view.scale,
      });

      externalRenderers.add(view, toRaw(_render.render));
    });
    // if (fireRender != null) {
    //   externalRenderers.remove(toRaw(viewStore.mapInstance), fireRender);
    // }
    // fireRender = new FireParticle({
    //   view,
    //   externalRenderers,
    //   Mover,
    //   FireInit,
    //   position: centerPoint, //[13493621.2254855, 3647407.029471413, 300]
    //   color: color,
    //   scale: view.scale,
    // });
    // externalRenderers.add(toRaw(viewStore.mapInstance), fireRender);
  });
};

//渲染喷泉的方法
let myRenderer = <any>null;
let myRenderers = ref<any>([]);
const _penquanRender = (centerPoint: any, datapid = -1) => {
  myRenderers.value.push({
    datapid: datapid != -1 ? datapid : null,
    render: {
      view: toRaw(viewStore.mapInstance),
      renderer: <any>null, // three js 渲染器
      camera: <any>null, //three js 相机
      scene: <any>null, //three js 场景
      pointCloud: <any>null,
      particleCount: 10000,
      width: <any>null,
      height: <any>null,
      renderPos: [0, 0, 0],
      center: centerPoint, //[439635.2, 2836328.0, 10],
      initY: <any>null,
      map: <any>null,
      setup: function (context: any) {
        let that = this;

        let THREE = window.THREE;
        // let s = THREE.LightningStorm;
        // console.log(s);
        that.renderer = new THREE.WebGLRenderer({
          context: context.gl, // 可用于将渲染器附加到已有的渲染环境(RenderingContext)中
          premultipliedAlpha: false, // renderer是否假设颜色有 premultiplied alpha. 默认为true
        });
        that.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
        that.renderer.setViewport(0, 0, that.view.width, that.view.height); // 视口大小设置

        that.renderer.autoClear = false;
        that.renderer.autoClearDepth = false;
        that.renderer.autoClearColor = false;
        // this.renderer.autoClearStencil = false;

        let originalSetRenderTarget = that.renderer.setRenderTarget.bind(
          that.renderer
        );
        that.renderer.setRenderTarget = function (target: any) {
          originalSetRenderTarget(target);
          if (target == null) {
            context.bindRenderTarget();
          }
        };
        //that.renderer = renderer;
        externalRenderers.toRenderCoordinates(
          this.view,
          [this.center[0], this.center[1], 0],
          0,
          toRaw(viewStore.mapInstance).spatialReference,
          this.renderPos,
          0,
          1
        );
        // this.initY =

        that.scene = new THREE.Scene();
        // setup the camera
        let cam = context.camera;
        that.camera = new THREE.PerspectiveCamera(
          cam.fovY,
          cam.aspect,
          cam.near,
          cam.far
        );
        //that.camera = camera;
        // 添加坐标轴辅助工具
        const axesHelper = new THREE.AxesHelper(1);
        axesHelper.position.copy(1000000, 100000, 100000);
        that.scene.add(axesHelper);

        function spawnBehavior(_index: any) {
          // let center = [115.88153549018487, 30.97619308639916, 10];
          // var renderPos = [0, 0, 0];

          var v = new THREE.Vector3(
            that.renderPos[0],
            that.renderPos[1],
            that.renderPos[2]
          );
          console.log(that.renderPos, "that.renderPos");
          // var v = that.renderPos;
          // debugger
          var dX, dY, dZ;

          dZ = Math.random() * 5 + 10;
          dX = Math.random() * 2 - 2;
          dY = Math.random() * 2 - 2;
          // dZ = Math.random() - 10;
          // dX = Math.random() - 2;
          // dY = Math.random() - 2;
          v.velocity = new THREE.Vector3(dX, dY, dZ);

          return v;
        }

        var points = new THREE.Geometry();
        _.times(this.particleCount, function (index) {
          points.vertices.push(spawnBehavior(index));
        });

        let material = new THREE.PointCloudMaterial({
          size: 3,
          color: 0xccccff,
        });

        this.pointCloud = new THREE.PointCloud(points, material);
        that.scene.add(this.pointCloud);

        var ambient = new THREE.AmbientLight(0xffffff, 1);
        ambient.position.set(0, 100, 0);
        that.scene.add(ambient);

        context.resetWebGLState();
      },
      render: function (context: any) {
        let that = this;
        // 更新相机参数
        const cam = context.camera;
        that.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
        that.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
        that.camera.lookAt(
          new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2])
        );
        // 投影矩阵可以直接复制
        that.camera.projectionMatrix.fromArray(cam.projectionMatrix);
        // // 更新几何体
        // this.map.offset.x += 0.01;
        // this.map.needsUpdate = true;

        /*-------------------------*/

        function frameBehavior(particle: any) {
          //console.log(particle, "particle");
          // let center = [115.88153549018487, 30.97619308639916, 10];
          // var renderPos = [0, 0, 0];
          // externalRenderers.toRenderCoordinates(that.view, [center[0], center[1], 500], 0, SpatialReference.WGS84, renderPos, 0, 1);
          //console.log(particle,"particle");
          particle.x += particle.velocity.x;
          particle.y += particle.velocity.y;
          particle.z += particle.velocity.z;
          particle.velocity.z -= 0.5;

          if (particle.z < that.renderPos[2]) {
            //console.log(particle.z, that.renderPos[2], "particle");
            // particle.x = particle.y = particle.z = 0;
            particle.x = that.renderPos[0];
            particle.y = that.renderPos[1];
            particle.z = that.renderPos[2];
            var dX, dY, dZ;

            dZ = Math.random() * 4 + 10;
            dX = Math.random() * 4 - 2;
            dY = Math.random() * 4 - 2;
            //console.log(dZ, dX, dY, "particle1212");
            particle.velocity = new THREE.Vector3(dX, dY, dZ);
          }
        }

        _.forEach(that.pointCloud.geometry.vertices, frameBehavior);
        that.pointCloud.geometry.verticesNeedUpdate = true;
        that.pointCloud.geometry.colorsNeedUpdate = true;

        // 绘制场景
        that.renderer.state.reset();
        that.renderer.render(that.scene, that.camera);
        // 请求重绘视图。
        externalRenderers.requestRender(toRaw(viewStore.mapInstance));
        // cleanup
        context.resetWebGLState();
      },
      dispose: function (context: any) {
        debugger;
        //context.resetWebGLState();
      },
    }
  })
  //add :向视图添加外部渲染器
  externalRenderers.add(toRaw(viewStore.mapInstance), toRaw(myRenderers.value[myRenderers.value.length - 1].render));
};

//计算燕尾箭头的方法
const ywAllowRender = (points: any) => {
  let start = points[0];
  //终点
  //let end = evt.graphic.geometry.paths[0][1];
  // var res = xp.algorithm.tailedAttackArrow(evt.graphic.geometry.paths[0]);
  var res = (xp.algorithm as any).tailedAttackArrow(points);
  //var res = xp.algorithm.fineArrow([start[0], start[1]], [end[0], end[1]]);

  console.log(res, "res");

  let _rings = <any>[];
  let _i = 0;
  let _x = <any>[];
  let _y = <any>[];
  res.polygonalPoint.forEach((_ring: any) => {
    if (_i % 2 == 0) {
      _x.push(_ring);
    } else {
      _y.push(_ring);
    }
    _i++;
  });
  let _x_i = 0;
  _x.forEach((xpoint: any) => {
    _rings.push([xpoint, _y[_x_i], start[2]]);
    _x_i++;
  });
  return _rings;
};
//渲染燕尾箭头
const ywAllOWRenderToView = (geo: any) => {
  let _rings = ywAllowRender(geo.paths[0]);
  console.log(_rings, "_rings");
  const polygon = {
    type: "polygon",
    hasZ: true,
    hasM: true,
    rings: [_rings],
    spatialReference: toRaw(viewStore.mapInstance).spatialReference,
  };

  const symbol = {
    type: "polygon-3d", // autocasts as new PolygonSymbol3D()
    symbolLayers: [
      {
        type: "fill", // autocasts as new FillSymbol3DLayer()
        material: { color: form.colorvalue },
        outline: { color: form.outlinecolor, size: form.outlinewidth },
        pattern: {
          type: "style",
          style: form.fillstyle,
        },
      },
    ],
  } as any;
  let graphic = new Graphic({
    geometry: polygon,
    symbol: symbol,
  });
  return graphic;
}

//渲染直线箭头（暂时无用）
const allowRender = (points: any) => {
  sketchLayer.graphics.removeAll();
  if (points.length > 2) {
    return null;
  }
  //起点
  let start = points[0];
  //终点
  let pointlength = points[0].length;
  let end = points[pointlength - 1];

  var res = (xp.algorithm as any).fineArrow(
    [start[0], start[1]],
    [end[0], end[1]]
  );
  console.log(res, "res");
  let _rings = <any>[];
  let _i = 0;
  let _x = <any>[];
  let _y = <any>[];
  res.forEach((_ring: any) => {
    if (_i % 2 == 0) {
      _x.push(_ring);
    } else {
      _y.push(_ring);
    }
    _i++;
  });
  let _x_i = 0;
  _x.forEach((xpoint: any) => {
    _rings.push([xpoint, _y[_x_i], start[2]]);
    _x_i++;
  });
  return _rings;
};
/* 绘制图标 */
const handleDraw = (item: any) => {
  debugger;
  console.log(item, "item");
  if (!currentProject.value.pid) {
    return ElMessage.warning("请先选择项目");
  }
  currentIcon.value = item;
  console.log(currentIcon.value, "currentIcon.value ");
  if (sketchTool) {
    sketchTool?.destroy();
    sketchTool = null;
  }
  initTool();
  if (item.id == 9) {
    //水域
    //waterIndex.value++;
    let iconindex = waterIndex.value;
    sketchTool.polygonSymbol = {
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [
        {
          type: "water", // autocasts as new FillSymbol3DLayer()
          waveDirection: 260,
          color: "#0077BE",
          waveStrength: "slight",
          waterbodySize: "large",
        },
      ],
    };
    sketchTool.create("polygon");
    sketchToolCreate(iconindex);
  } else if (item.id == 10) {
    sketchLayer.elevationInfo.mode = "on-the-ground";
    //烟火
    sketchLayer.graphics.removeAll();
    //sketchLayer.removeAll();
    // if (fireRender != null) {
    //   externalRenderers.remove(toRaw(viewStore.mapInstance), fireRender);
    //   fireRender = null;
    // }
    //fireIndex.value++;
    let iconindex = fireIndex.value;
    sketchTool.pointSymbol = null;
    sketchTool.create("point");
    sketchToolCreate(iconindex);
  } else if (item.id == 11) {
    sketchLayer.elevationInfo.mode = "on-the-ground";
    //烟雾
    //sketchLayer.removeAll();
    sketchLayer.graphics.removeAll();
    if (somkeRender != null) {
      externalRenderers.remove(toRaw(viewStore.mapInstance), somkeRender);
      somkeRender = null;
    }
    //somkeIndex.value++;
    let iconindex = somkeIndex.value;
    sketchTool.pointSymbol = null;
    sketchTool.create("point");
    sketchToolCreate(iconindex);
  } else if (item.id == 12) {
    sketchLayer.elevationInfo.mode = "on-the-ground";
    //喷泉
    //remove :向视图移除外部渲染器
    //sketchLayer.removeAll();
    sketchLayer.graphics.removeAll();
    if (myRenderer != null) {
      externalRenderers.remove(toRaw(viewStore.mapInstance), myRenderer);
      myRenderer = null;
    }
    //penquanIndex.value++;
    let iconindex = penquanIndex.value;
    sketchTool.pointSymbol = null;
    sketchTool.create("point");
    sketchToolCreate(iconindex);
  } else {
    // dialogVisible.value = true;
    drawLabel(true);
    ifChooseIcon = true;
  }
};
let ifChooseIcon = false;
//弹框确定绘制图形
const drawLabel = async (complete: Boolean) => {
  sketchLayer.elevationInfo.mode = "on-the-ground";
  let iconindex = 0;
  console.log(currentIcon, "currentIcon");

  switch (currentIcon.value.id) {
    case 1:
      // 地标
      // if (complete) {
      //   landmarkIndex.value++;
      // }
      iconindex = landmarkIndex.value;
      console.log(iconindex, "-iconindexiconindex");

      if (form.shape == "greenpng") {
        let symbol = {
          type: "picture-marker", // autocasts as new PictureMarkerSymbol()
          url: greenpng,
          width: form.geoSize,
          height: form.geoSize,
        };

        //  let symbol = {
        //     type: "point-3d",  // autocasts as new PointSymbol3D()
        //     symbolLayers: [{
        //       type: "object",
        //       resource: {
        //         href: "model/Soldier.glb"
        //         //href: "model/people/glbxz.com6031.glb",
        //       },
        //       height: 10,
        //       heading: 180,
        //     }],
        //   } as any;

        sketchTool.pointSymbol = symbol;
      } else {
        sketchTool.pointSymbol = {
          type: "point-3d", // autocasts as new PointSymbol3D()
          symbolLayers: [
            {
              type: "icon", // autocasts as new IconSymbol3DLayer()
              size: form.geoSize, // points
              resource: { primitive: form.shape },
              material: { color: form.colorvalue },
              outline: {
                color: form.outlinecolor,
                size: form.outlinewidth,
              },
            },
          ],
        };
      }
      sketchLayer.elevationInfo.mode = "relative-to-ground";
      sketchTool.create("point");
      // if (form.type == "twoDimensional") {
      //   // "on-the-ground":'relative-to-ground',
      //   sketchLayer.elevationInfo.mode = "on-the-ground";
      // } else {

      // }
      break;
    case 2:
      //多边形
      // if (complete) {
      //   polyfillIndex.value++;
      // }
      sketchLayer.elevationInfo.mode = "on-the-ground";
      iconindex = polyfillIndex.value;
      console.log(form, "form.fillstyle");
      sketchTool.polygonSymbol = {
        type: "polygon-3d", // autocasts as new PolygonSymbol3D()
        symbolLayers: [
          {
            type: "fill", // autocasts as new FillSymbol3DLayer()
            material: { color: form.colorvalue },
            outline: { color: form.outlinecolor, size: form.outlinewidth },
            pattern: {
              type: "style",
              style: form.fillstyle,
            },
          },
        ],
      };
      sketchTool.create("polygon");
      break;
    case 3:
      //立方体
      // if (complete) {
      //   lftIndex.value++;
      // }
      sketchLayer.elevationInfo.mode = "on-the-ground";
      iconindex = lftIndex.value;
      sketchTool.polygonSymbol = {
        type: "polygon-3d",
        symbolLayers: [
          {
            type: "extrude",
            size: form.height,
            material: {
              color: form.colorvalue,
            },
            edges: {
              type: "solid",
              color: form.outlinecolor,
              size: form.outlinewidth,
            },
          },
        ],
      };
      sketchTool.create("polygon");
      break;
    case 4:
      //文字
      if (form.textvalue == "") {
        return ElMessage.warning("请输入标注文字");
      }
      // if (complete) {
      //   wenziIndex.value++;
      // }
      iconindex = wenziIndex.value;
      sketchTool.pointSymbol = {
        type: "point-3d",
        symbolLayers: [
          {
            type: "text",
            material: { color: form.textcolor },
            size: form.fontsize,
            text: form.textvalue,
            background: { color: form.background },
            //文字边框颜色设置
            // halo: {
            //     color: [255, 255, 255, 0.8], // autocasts as Color
            //     size: 1
            // }
          },
        ],
      };
      if (form.type == "twoDimensional") {
        // "on-the-ground":'relative-to-ground',
        sketchLayer.elevationInfo.mode = "on-the-ground";
      } else {
        sketchLayer.elevationInfo.mode = "relative-to-ground";
      }
      sketchTool.create("point");
      break;
    case 5:
      //路径
      // if (complete) {
      //   pathIndex.value++;
      // }
      form.geoSize = 5;
      iconindex = pathIndex.value;
      let symbol = {
        type: "simple-line", // autocasts as new SimpleLineSymbol()
        color: form.colorvalue,
        width: form.geoSize,
        style: form.fillstyle,
        join: "round",
        cap: "square",
      };
      sketchTool.polylineSymbol = symbol;
      sketchTool.create("polyline");
      break;
    case 6:
      //箭头
      // if (complete) {
      //   allowIndex.value++;
      // }
      form.geoSize = 5;
      iconindex = allowIndex.value;
      const lineSymbol = {
        type: "simple-line",
        color: form.colorvalue,
        width: form.geoSize,
        // Define a blue "x" marker at the beginning of the line
        marker: {
          // autocasts from LineSymbolMarker
          style: "arrow",
          color: form.colorvalue,
          placement: "end",
        },
        style: form.fillstyle,
      };
      sketchTool.polylineSymbol = lineSymbol;
      sketchTool.create("polyline");
      break;
    case 7:
      //燕尾箭头
      // if (complete) {
      //   ywAllowIndex.value++;
      // }
      sketchTool.polylineSymbol = null;
      iconindex = ywAllowIndex.value;
      //console.log(form, "form.fillstyle");
      sketchTool.create("polyline");
      break;
    default:
      break;
  }
  handleClose(false);
  //sketchLayer.removeAll();

  // if (form.textvalue == "") {
  //   iconindex++;
  // }
  sketchToolCreate(iconindex);
};

//绘图工具激活绘制方法
const sketchToolCreate = (iconindex: number) => {
  sketchTool.on("create", async (evt: any) => {
    if (evt.state === "complete") {
      console.log(evt, "evt");
      if (!form.textvalue) {
        iconindex++;
      }
      let name = currentIcon.value.name + "_" + iconindex;
      let gras = [evt.graphic];
      //let gras = [{ geometry: evt.graphic.geometry, symbol: evt.graphic.symbol }];
      if (currentIcon.value.id == 1) {
        landmarkIndex.value = iconindex;
        var textSymbol = {
          type: "point-3d",
          symbolLayers: [
            {
              type: "text",
              material: { color: form.textcolor },
              size: form.fontsize,
              text: form.textvalue,
              // background: { color: [0, 0, 0, 0.2] },
              halo: {
                color: [255, 255, 255, 0.8], // autocasts as Color
                size: 1,
              },
            },
          ],
        };
        console.log(evt.graphic.geometry, "evt.graphic.geometry");
        const point = {
          type: "point", // autocasts as new Point()
          x: evt.graphic.geometry.x,
          y: evt.graphic.geometry.y,
          z: evt.graphic.geometry.z,
          spatialReference: toRaw(viewStore.mapInstance).spatialReference,
        } as any;
        let graphic = new Graphic({
          geometry: point,
          symbol: textSymbol as any,
        });
        sketchLayer.graphics.add(graphic);
        gras.push(graphic);
      } else if (currentIcon.value.id == 2) {
        polyfillIndex.value = iconindex;
      } else if (currentIcon.value.pid == 3) {
        lftIndex.value = iconindex;
      } else if (currentIcon.value.pid == 4) {
        wenziIndex.value = iconindex;
      } else if (currentIcon.value.pid == 5) {
        pathIndex.value = iconindex;
      } else if (currentIcon.value.id == 6) {
        allowIndex.value = iconindex;
      } else if (currentIcon.value.id == 7) {
        ywAllowIndex.value = iconindex;
        sketchLayer.graphics.removeAll();
        // let _rings = ywAllowRender(evt.graphic.geometry.paths[0]);
        // console.log(_rings, "_rings");
        // const polygon = {
        //   type: "polygon",
        //   hasZ: true,
        //   hasM: true,
        //   rings: [_rings],
        //   spatialReference: toRaw(viewStore.mapInstance).spatialReference,
        // };

        const symbol = {
          type: "polygon-3d", // autocasts as new PolygonSymbol3D()
          symbolLayers: [
            {
              type: "fill", // autocasts as new FillSymbol3DLayer()
              material: { color: form.colorvalue },
              outline: { color: form.outlinecolor, size: form.outlinewidth },
              pattern: {
                type: "style",
                style: form.fillstyle,
              },
            },
          ],
        } as any;
        // let graphic = new Graphic({
        //   geometry: polygon,
        //   symbol: symbol,
        // });
        let graphic = ywAllOWRenderToView(evt.graphic.geometry);
        gras = [{ geometry: evt.graphic.geometry, symbol: symbol }];
        //gras.push(graphic);
        sketchLayer.graphics.add(graphic);
      } else if (currentIcon.value.id == 9) {
        waterIndex.value = iconindex;
      } else if (currentIcon.value.id == 12) {
        penquanIndex.value = iconindex;
        sketchLayer.graphics.removeAll();
        //渲染喷泉
        let centerpoint = [
          evt.graphic.geometry.x,
          evt.graphic.geometry.y,
          evt.graphic.geometry.z,
        ];
        //myRenderer.center = [evt.graphic.geometry.x, evt.graphic.geometry.y, evt.graphic.geometry.z];
        _penquanRender(centerpoint);
      } else if (currentIcon.value.id == 10) {
        fireIndex.value = iconindex;
        sketchLayer.graphics.removeAll();
        //烟火
        let centerpoint = [
          evt.graphic.geometry.x,
          evt.graphic.geometry.y,
          evt.graphic.geometry.z,
        ];
        //myRenderer.center = [evt.graphic.geometry.x, evt.graphic.geometry.y, evt.graphic.geometry.z];
        _fireRender(centerpoint, "#fd3109");
      } else if (currentIcon.value.id == 11) {
        somkeIndex.value = iconindex;
        sketchLayer.graphics.removeAll();
        //烟雾
        let centerpoint = [
          evt.graphic.geometry.x,
          evt.graphic.geometry.y,
          evt.graphic.geometry.z,
        ];
        //myRenderer.center = [evt.graphic.geometry.x, evt.graphic.geometry.y, evt.graphic.geometry.z];
        _somkeRender(centerpoint, "#738276");
      }
      if (form.textvalue != "") {
        name = currentIcon.value.name + "_" + form.textvalue;
      }

      //保存绘制的图形数据
      let prjdata = {
        userid: user.pid,
        username: user.name,
        parentid: currentProject.value.pid,
        iconPid: currentIcon.value.id,
        name: name,
        iconname: currentIcon.value.name,
        graphicpoints: JSON.stringify(gras),
      } as any;

      const { data: result } = await saveProjectIcon(prjdata);
      console.log(result, "result");
      if (result.code != 200) return ElMessage.error(result.msg);
      getProjectIcons(true, result.data);
      showIconIdList.value.push(result.data);
      let graphic = new Graphic({
        geometry: evt.graphic.geometry,
        symbol: evt.graphic.symbol,
        attributes: {
          datapid: result.data,
        },
      });
      sketchLayer.graphics.removeAll();



      //pointshowLayer
      if (currentIcon.value.id == 1 || currentIcon.value.id == 4) {
        let pointshowLayer = toRaw(viewStore.mapInstance).map.findLayerById("pointshowLayer");
        if (!pointshowLayer) {
          pointshowLayer = new GraphicsLayer({
            id: "pointshowLayer",
            elevationInfo: {
              mode: "relative-to-ground",
            },
          });
          toRaw(viewStore.mapInstance).map.layers.add(pointshowLayer);
        }
        pointshowLayer.graphics.add(graphic);
      }
      else {
        let showLayer = toRaw(viewStore.mapInstance).map.findLayerById("showLayer");
        if (!showLayer) {
          showLayer = new GraphicsLayer({
            id: "showLayer",
            elevationInfo: {
              mode: "on-the-ground",
            },
          });
          toRaw(viewStore.mapInstance).map.layers.add(showLayer);
        }
        if (currentIcon.value.id == 7) {
          graphic = ywAllOWRenderToView(evt.graphic.geometry);
        }
        showLayer.graphics.add(graphic);
      }


      //烟火，烟雾，喷泉
      if (
        currentIcon.value.id == 10 &&
        fireRenders.value[fireRenders.value.length - 1].datapid == null
      ) {
        (fireRenders.value[fireRenders.value.length - 1].datapid = result.data),
          console.log(fireRenders, "---ouhou99");

      }
      if (
        currentIcon.value.id == 11 &&
        somkeRenders.value[somkeRenders.value.length - 1].datapid == null
      ) {
        (somkeRenders.value[somkeRenders.value.length - 1].datapid = result.data),
          console.log(somkeRenders, "---ouhou11");

      }
      if (
        currentIcon.value.id == 12 &&
        myRenderers.value[myRenderers.value.length - 1].datapid == null
      ) {
        (myRenderers.value[myRenderers.value.length - 1].datapid = result.data),
          console.log(myRenderers, "---ouhou12");

      }
      currentIconData.value.pid = result.data;
      isshowIcon.value = true;
      pid++;
      sketchTool.destroy();
      sketchTool = null;
      ifChooseIcon = false;
      console.log(sketchTool);
      form.textvalue == "";
    }
  });
};


let ProjectIcons = ref([])


//加载项目列表
const getProjectIcons = async (show = false, id = -1) => {
  console.log(showIconIdList.value, "showIconIdList.vlaue");
  const { data: res } = await getIconProjectList();
  console.log(res, show, "getProjectIcons");
  projectList.value = res.data;
  if (show && id > 0) {
    projectList.value.forEach((item: any) => {
      item.childlist.forEach((_child: any) => {
        if (showIconIdList.value.length > 0) {
          if (showIconIdList.value.indexOf(_child.pid) > -1) {
            _child.show = true;
          }
        }
        // if (_child.pid == id) {
        //   console.log("---====xingdeng ");
        //   _child.show = true;
        // }
      });
      // console.log(item, "---item");
    });
  }
};

//清空图形
const clearGraphics = () => {
  sketchTool?.destroy();
  sketchTool = null;
  if (toRaw(viewStore.mapInstance)) {
    toRaw(viewStore.mapInstance).graphics.removeAll();
    let sketchLayer = toRaw(viewStore.mapInstance).map.findLayerById(
      "drawsketch"
    );
    if (sketchLayer && sketchLayer != null) {
      sketchLayer.graphics.removeAll();
    }
    let showLayer = toRaw(viewStore.mapInstance).map.findLayerById("showLayer");
    if (showLayer && showLayer != null) {
      showLayer.graphics.removeAll();
    }
    let pointshowLayer = toRaw(viewStore.mapInstance).map.findLayerById("pointshowLayer");
    if (pointshowLayer && pointshowLayer != null) {
      pointshowLayer.graphics.removeAll();
    }
    if (fireRender != null) {
      externalRenderers.remove(toRaw(viewStore.mapInstance), fireRender);
    }
    if (somkeRender != null) {
      externalRenderers.remove(toRaw(viewStore.mapInstance), somkeRender);
    }
    if (myRenderer != null) {
      externalRenderers.remove(toRaw(viewStore.mapInstance), myRenderer);
    }
  }
};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
  if (state.currFunc == "tbhz") {
    locateVisible.value = true;
    getProjectIcons();
    ProjectIcons

    initTool();
  } else {
    locateVisible.value = false;
    clearGraphics();
  }
});
</script>

<style scoped lang="scss">
@use "./icondraw.scss";
</style>
