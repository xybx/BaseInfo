<template>
  <div class="tool-bar" :class="menuStore.layerIsShow ? '' : 'tool-transform'">
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
          <span class="title-txt">天际线分析</span>
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
        <div>
          <el-button type="primary" @click="handlePic">获取屏幕快照</el-button>
          <!-- <el-button type="primary" @click="handleRender"
                        >绘制范围</el-button
                    > -->
          <el-button type="warning" @click="clearRender">清除</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
  <div class="skyResult">
    <el-dialog
      v-model="skylineVisible"
      title="Tips"
      width="100%"
    >
      <!-- :before-close="handleClose" -->
      <span>This is a message</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="skylineVisible = false">Cancel</el-button>
          <el-button type="primary" @click="skylineVisible = false">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, reactive, watch, toRaw, onMounted, resolveComponent } from "vue";
import useStore from "@/stores";

/* UI 相关 */
import { ElMessage } from "element-plus";

/* ArcGIS API */
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import GroupLayer from "@arcgis/core/layers/GroupLayer.js";
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet.js";
import LinearUnit from "@arcgis/core/rest/support/LinearUnit.js";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as geoprocessor from "@arcgis/core/rest/geoprocessor.js";

/* API */
import { initLayerByKind } from "@/utils/common-map";
// import * as cv from './plugins/opencv';
import cv from "opencv-ts";

const { menuStore, viewStore, mapStore } = useStore();

const locateVisible = ref(false);

let skylineVisible = ref(true);

const closeLocate = () => {
  if (groupLayer.value) {
    toRaw(viewStore.mapInstance).map.remove(toRaw(groupLayer.value));
    groupLayer.value = null;
  }
  buildSel.value = null;
  clearRender();
  // 菜单恢复初始值
  if (menuStore.currFunc == "tjxfx") {
    menuStore.handleFunc("");
  }
};

/* 获取屏幕截图 */
const handlePic = () => {
  let camera = sceneView.camera.clone();
  sceneView.goTo(camera).then(() => {
    // console.log('123');
    executeDraw();
  });
};

let defaultRenderer = {
  type: "simple",
  symbol: {
    type: "mesh-3d",
    symbolLayers: [
      {
        type: "fill",
        material: { color: "red" },
      },
    ],
  },
};
let renders = <any>{};
let baseLayers = <any>null;
const executeDraw = async () => {
  const resShot = await sceneView.takeScreenshot({ format: "png" });
  console.log(resShot, "截图");
  sceneView.map.layers.forEach((lyr: any) => {
    debugger;
    // if (lyr.type === 'scene') {
    //     renders[lyr.id] = lyr.renderer;
    //     lyr.renderer = defaultRenderer;
    // } else if (lyr.type === 'group') {
    //     loopGroupLayers(lyr);
    // }
    if (lyr.type.includes("scene")) {
      renders[lyr.id] = lyr.renderer;
      lyr.renderer = defaultRenderer;
    } else if (lyr.type === "group") {
      loopGroupLayers(lyr);
    }
  });
  sceneView.map.ground.surfaceColor = "red";
  baseLayers = sceneView.map.basemap.baseLayers.items.concat();
  sceneView.map.basemap.baseLayers.removeAll();

  const waitTime = await waitFunc(5000);
  debugger;
  const originCvSource = (await convertScreenshot2Image(resShot)) as any;
  console.log(originCvSource, "originCvSource");
  const colorizedScreenshot = await sceneView.takeScreenshot({
    format: "png",
  });
  cv.cvtColor(
    originCvSource as any,
    originCvSource as any,
    cv.COLOR_RGBA2RGB,
    0
  );
  const colorizedCvSourceBefore = await prepareOutputCanvas(
    colorizedScreenshot
  );
  debugger;

  const colorizedCvSource = (await convertScreenshot2Image(
    colorizedCvSourceBefore
  )) as any;

  cv.cvtColor(
    colorizedCvSource as any,
    colorizedCvSource as any,
    cv.COLOR_RGBA2RGB,
    0
  );

  let src = colorizedCvSource.clone();
  let dst = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  // 灰度图
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  // 二值化
  cv.threshold(src, src, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
  // 边缘检测
  // 与原代码不同
  console.log(cv.Canny);

  // cv.Canny(src, src, 50, 100, 3, false);
  cv.Canny(src, src, 50, 100);

  // 计算轮廓
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    src,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  // 找到轮廓最长
  let periLength = 0;
  let flag = 0;
  let color = new cv.Scalar(255, 0, 0);
  let min = 100;
  for (let i = 0; i < contours.size(); i += 1) {
    let cont = contours.get(i);
    let rec = cv.boundingRect(cont);
    let len = cv.arcLength(cont, true);
    if (len > periLength) {
      flag = i;
      periLength = len;
    }
    //过滤掉较小的轮廓
    if (len > min || !(rec.width < 20 && rec.height < 20)) {
      cv.drawContours(
        originCvSource,
        contours,
        i,
        color,
        2,
        cv.LINE_8,
        hierarchy,
        0
        // TODO 暂时注释
        // new cv.Point()
      );
    }

    cv.imshow("canvasOutput", originCvSource);
    dst.delete();
    contours.delete();
    hierarchy.delete();
    src.delete();
    colorizedCvSource.delete();
    originCvSource.delete();

    // document
    //     .getElementById('canvasOutput')
    //     .addEventListener('dblclick', function () {
    //         // that.restoreViewProps();

    //         setTimeout(function () {
    //             document
    //                 .getElementsByClassName('esri-view')[0]
    //                 .removeChild(document.getElementById('canvasOutput') as any);
    //         }, 500);
    //     });
  }
};

/* 预加载输出canvas */
const prepareOutputCanvas = (screenshot: any) => {
  return new Promise((resolve) => {
    let outputCanvas = document.createElement("canvas");
    outputCanvas.id = "canvasOutput";
    outputCanvas.width = screenshot.data.width;
    outputCanvas.height = screenshot.data.height;
    document.getElementsByClassName("esri-view")[0].appendChild(outputCanvas);
    resolve(screenshot);
  });
};

/* 循环服务组 */
const loopGroupLayers = (group: any) => {
  group.layers.forEach((lyr: any) => {
    if (lyr.type === "scene") {
      renders[lyr.id] = lyr.renderer;
      lyr.renderer = defaultRenderer;
    } else if (lyr.type === "group") {
      loopGroupLayers(lyr);
    }
  });
};

/* 等待 */
const waitFunc = (time: any) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

/* 转换屏幕截图 */
const convertScreenshot2Image = (screenshot: any) => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.crossOrigin = "Anonymous";
    img.id = "screenshot";
    img.width = screenshot.data.width;
    img.height = screenshot.data.height;
    img.src = screenshot.dataUrl;
    console.log(cv, "cv");

    img.onload = () => {
      resolve(cv.imread(img));
    };
    console.log(img, "img");
  });
};

/*
    图层选择
    TODO 暂时固定数据
*/
const buildSel = ref<any>(null);
const buildOptions = ref<any>(window.demoBuildObj.options);

/* 绘制范围 */
const sketchTool = ref<any>(null);
const highlightHandle = ref<any>(null);
const groupLayer = ref<any>(null);
const areaTotal = ref<number>(0);
const showResult = ref(false);
const handleRender = async () => {
  if (!Boolean(buildSel.value)) return ElMessage.warning("请先选择地图服务");

  let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
    "buildanalyse"
  );
  if (!findLayer) {
    findLayer = new GraphicsLayer({
      id: "buildanalyse",
      elevationInfo: {
        mode: "on-the-ground",
      },
    });
    toRaw(viewStore.mapInstance).map.layers.add(findLayer);
  }
  if (!sketchTool.value) {
    sketchTool.value = new SketchViewModel({
      layer: findLayer,
      view: toRaw(viewStore.mapInstance),
      polygonSymbol: {
        type: "polygon-3d",
        symbolLayers: [
          {
            type: "fill",
            material: { color: "yellow" },
            outline: { color: "yellow" },
            pattern: {
              type: "style",
              style: "cross",
            },
          },
        ],
      },
    } as any);
  }

  findLayer.graphics.removeAll();
  // highlightHandle.value?.remove();
  // highlightHandle.value = null;

  toRaw(sketchTool.value).create("point");
  toRaw(sketchTool.value).on("create", (evt: any) => {
    if (evt.state == "complete") {
      console.log(evt, "evt");
      let analyseLayer = <any>null;

      toRaw(sketchTool.value).destroy();
      sketchTool.value = null;

      analyseLayer = toRaw(groupLayer.value).findLayerById(
        `build-${buildSel.value.pid}`
      );

      // const featureSet = new FeatureSet();
      // featureSet.features = [evt.graphic];

      toRaw(viewStore.mapInstance)
        .whenLayerView(analyseLayer)
        .then((layerView: any) => {
          const bufferGeometry = geometryEngine.buffer(
            evt.graphic.geometry,
            50,
            "meters"
          );

          const query = layerView.createQuery();
          query.geometry = bufferGeometry;
          console.log(bufferGeometry, "bufferGeometry");

          layerView.queryFeatures(query).then((result: any) => {
            const allStats = new FeatureSet({
              hasZ: true,
              exceededTransferLimit: false,
            } as any);
            allStats.features = [evt.graphic];

            const watchFeature = new FeatureSet();
            watchFeature.features = result.features;
            console.log(result.features);

            debugger;

            const params = {
              in_observer_point_features: allStats,
              // 输入观察点要素: evt.graphic,
              // 输入要素: ['c3d'],
              in_features: allStats,
              // virtual_surface_radius: 20,
              virtual_surface_radius: {
                distance: 100,
                units: "meters",
              },
              // feature_lod: 'ENVELOPE',
              feature_lod: "FULL_DETAIL",
              // max_horizon_radius: 50,
              max_horizon_radius: {
                distance: 0,
                units: "meters",
              },
              // 创建轮廓: true,
              // 分段天际线: true,
            };

            const options = {
              // processExtent: null,
              returnM: false,
              returnZ: true,
              // processSpatialReference: null,
              // outSpatialReference: {
              //     wkid: 4549,
              // },
            };
            const gpUrl =
              "https://dp3d.dpinfo.com.cn:6443/geoscene/rest/services/Skyline2/GPServer/TJXFX";
            //'https://dp3d.dpinfo.com.cn:6443/geoscene/rest/services/TJXFX/GPServer/TJXFX';

            let geoRes = geoprocessor
              .submitJob(gpUrl, params)
              .then(drawResData);
            console.log(geoRes, "geores");
          });
        });
    }
  });
};

/* 绘制结果 */
const drawResData = async (result: any) => {
  console.log(result, "result");
  result
    .waitForJobCompletion({
      interval: 1500,
      statusCallback: (j: any) => {
        console.log("Job Status: ", j.jobStatus);
      },
    })
    .then(async (add: any) => {
      const features = await result.fetchResultData("out_feature_class");
      console.log(features, "features");
      let newGeo = features.value.features[0];
      newGeo.symbol = {
        type: "simple-line",
        color: "red",
        width: 2,
      };
      // newGeo.symbol = {
      //     type: 'line-3d',
      //     symbolLayers: [
      //         {
      //             type: 'path', // autocasts as new PathSymbol3DLayer()
      //             profile: 'circle',
      //             width: 1, // width of the tube in meters
      //             material: { color: [255, 0, 0] },
      //         },
      //     ],
      // };
      let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
        "buildanalyse"
      );
      findLayer.add(newGeo);
      console.log(findLayer, "findlayer");
      console.log(toRaw(viewStore.mapInstance), "view");

      // result.fetchResultMapImageLayer(result.jobId).then((layer: any) => {
      //     console.log(layer, 'layer');
      //     toRaw(viewStore.mapInstance).map.add(layer);
      // });

      // toRaw(viewStore.mapInstance).graphics.add(newGeo);
    });
};

/* 下拉框选择事件 */
const changeBuild = async (obj: any) => {
  console.log(obj, "obj");

  if (!groupLayer.value) {
    groupLayer.value = new GroupLayer({
      id: "buildGroupLayer",
      visibilityMode: "exclusive",
    });
    toRaw(viewStore.mapInstance).map.add(toRaw(groupLayer.value));
  }

  /* 避免与主图层重复 */
  let showLayer = toRaw(groupLayer.value).findLayerById(
    `build-${buildSel.value.pid}`
  );
  if (!showLayer) {
    let obj = Object.assign({}, buildSel.value, {
      pid: `build-${buildSel.value.pid}`,
    });
    showLayer = await initLayerByKind(obj, true);
    toRaw(groupLayer.value).add(showLayer, buildSel.value.order);
  } else {
    showLayer.visible = true;
  }
};

/* 清除范围 */
const clearRender = () => {
  areaTotal.value = 0;
  showResult.value = false;

  let findLayer = toRaw(viewStore.mapInstance).map.findLayerById(
    "buildanalyse"
  );
  if (findLayer) {
    findLayer.graphics.removeAll();
    highlightHandle.value?.remove();
    highlightHandle.value = null;
  }
};

/* 赋值 pinia */
let sceneView = <any>null;
// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
  if (state.currFunc == "tjxfx") {
    locateVisible.value = true;
    sceneView = toRaw(viewStore.mapInstance);
  } else {
    locateVisible.value = false;
  }
});
</script>

<style scoped lang="scss">
@use "./skyline.scss";
</style>
