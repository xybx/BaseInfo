/*
 * @Author: sgz
 * @Date: 2021-12-07 15:23:09
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-09 16:51:18
 * @FilePath: \webgis\src\utils\mapdraw.js
 * @Description: 地图绘制工具，包括点，线，面
 */

import Graphic from "@arcgis/core/Graphic";
import AreasAndLengthsParameters from "@arcgis/core/rest/support/AreasAndLengthsParameters";
import BufferParameters from "@arcgis/core/rest/support/BufferParameters";
//import GeometryService from "@arcgis/core/tasks/GeometryService";
import {
  simplify,
  areasAndLengths,
  buffer,
} from "@arcgis/core/rest/geometryService";
import GraphicLayers from "@arcgis/core/layers/GraphicsLayer";
import store from "../store/index";
import { initToolStatus } from "../../src/components/map/mapcontrol/js/mapcontrol";
import { createGraphic } from "@/utils/topic-map";
import { getMapGeometryServiceUrl } from "@/utils/common-api";
import { getAreaAndLength } from "@/utils/common-map-method";

//绘制面
export function drawPolygon() {
  //存放微件图形图层初始化
  if (store.state["map2d-store"].graphicLengthLrc != null) {
    store.state["map2d-store"].graphicLengthLrc.graphics.removeAll();
  }

  //初始化所有工具条监听事件
  console.log(store.state["map2d-store"].lengthAreahandler);
  if (store.state["map2d-store"].lengthAreahandler != null) {
    store.state["map2d-store"].lengthAreahandler.remove();
  }
  store.state["map2d-store"].tool.sketch.cancel();

  //初始化工具条,全部状态设为false
  for (const key in store.state["map2d-store"].toolStatus) {
    store.state["map2d-store"].toolStatus[key] = false;
  }

  store.state["map2d-store"].mapview.graphics.removeAll();

  let toolsketch = store.state["map2d-store"].tool;
  toolsketch.sketch.create("polygon", { mode: "click" });
  let handler = toolsketch.sketch.on("create", (evt) => {
    handlerDraw(evt);
    if (evt.state == "complete") {
      store.state["map2d-store"].tool.sketch.cancel();
    }
  });
  //存入store
  store.commit("map2d-store/lengthhandler", handler);
}

//自定义画图叠加地图
async function handlerDraw(evt) {
  if (evt.state == "complete") {
    let geometry = evt.graphic.geometry;
    let graphic = new Graphic({
      geometry: geometry,
      symbol: store.state["map2d-store"].symbol,
    });

    store.state["map2d-store"].mapview.graphics.add(graphic);

    //计算面积和周长
    let areaandlength = await getAreaAndLength(geometry);
    //let areaGQ = parseFloat(areaandlength.area * 0.0001).toFixed(4);
    let obj = new Object();
    obj.index = store.state["map2d-store"].polygoncount;
    obj.name = "面" + store.state["map2d-store"].polygoncount;
    obj.area = parseFloat(areaandlength.area * 0.0001).toFixed(4);
    obj.distance = parseFloat(areaandlength.length / 1000).toFixed(4);
    obj.geo = areaandlength.geo;
    //填充表格数据
    store.commit("map2d-store/tableData", obj);
  }
}

//上传图形文件叠加地图
export async function handleUploadOverLayer(pointData, filename) {
  //叠加之前清空地图上的图形
  store.state["map2d-store"].mapview.graphics.removeAll();
  const _graphic = createGraphic(pointData, store.state["map2d-store"].mapview);
  let graphic = new Graphic({
    geometry: _graphic.geometry,
    symbol: store.state["map2d-store"].symbol,
  });

  store.state["map2d-store"].mapview.graphics.add(graphic);
  store.state["map2d-store"].mapview.extent = graphic.geometry.extent;
  store.state["map2d-store"].mapview.zoom -= 2;
  ///console.log(store.state["map2d-store"].mapview.graphics);
  //计算面积和周长
  let areaandlength = await getAreaAndLength(_graphic.geometry);
  let obj = new Object();
  obj.index = store.state["map2d-store"].polygoncount;
  obj.name = filename;
  obj.area = parseFloat(areaandlength.area * 0.0001).toFixed(4);;
  obj.distance = parseFloat(areaandlength.length / 1000).toFixed(4);
  // obj.area = areaandlength.area;
  // obj.distance = areaandlength.length;
  obj.geo = areaandlength.geo;
  //填充表格数据
  store.commit("map2d-store/tableData", obj);
}

//生成缓冲图形叠加地图
export async function handleBufferGeo(radius, dataIndex) {
  debugger;
  // console.log(data,"data")
  let tableData = store.state["map2d-store"].tableData;
  let currentData = tableData.filter((item) => {
    return item.index == dataIndex;
  });
  let MapGeometryServerUrl = await getMapGeometryServiceUrl();

  let mapview = store.state["map2d-store"].mapview;
  let simplifiedGeometries = await simplify(MapGeometryServerUrl, [currentData[0].geo]);
  const bufferParams = new BufferParameters({
    unit: "meters",
    distances: [radius],
    geodesic: true,
    bufferSpatialReference: mapview.spatialReference,
    outSpatialReference: mapview.spatialReference,
    geometries: simplifiedGeometries,
  });

  let result = await buffer(MapGeometryServerUrl, bufferParams);
  let bufferGeo = result[0];

  let graphic = new Graphic({
    geometry: bufferGeo,
    symbol: store.state["map2d-store"].bufferSymbol,
  });
  store.state["map2d-store"].mapview.graphics.add(graphic);
  store.state["map2d-store"].mapview.extent = graphic.geometry.extent;
  store.state["map2d-store"].mapview.zoom -= 2;

  //计算面积和周长
  let areaandlength = await getAreaAndLength(bufferGeo);
  let obj = new Object();
  obj.index = store.state["map2d-store"].polygoncount;
  obj.name = currentData[0].name + "缓冲图形";
  obj.area = parseFloat(areaandlength.area * 0.0001).toFixed(4);;
  obj.distance = parseFloat(areaandlength.length / 1000).toFixed(4);
  // obj.area = areaandlength.area;
  // obj.distance = areaandlength.length;
  obj.geo = areaandlength.geo;
  //填充表格数据
  store.commit("map2d-store/tableData", obj);
}

//合规审查清除
export function ClearHgsc() {
  store.commit("map2d-store/cleartableData");
  store.state["map2d-store"].mapview.graphics.removeAll();
  //store.state["map2d-store"].hgscgraphiclayer.graphics.removeAll();
  let layer = store.state["map2d-store"].mapview.map.findLayerById("lengthLrc");
  if (layer) {
    layer.graphics.removeAll();
  }
  //监听停止
  store.state["map2d-store"].tool.sketch.cancel();
  // store.state["map2d-store"].hgschandler.remove();
}

//重现合规审查的图形
export function ReloadHgscGraphic(geo) {
  let graphic = new Graphic({
    geometry: geo,
    symbol: store.state["map2d-store"].symbol,
  });
  store.state["map2d-store"].graphicLengthLrc.graphics.removeAll();
  store.state["map2d-store"].mapview.graphics.removeAll();
  store.state["map2d-store"].mapview.graphics.add(graphic);
  store.state["map2d-store"].mapview.extent = graphic.geometry.extent;
  store.state["map2d-store"].mapview.zoom -= 2;
}
