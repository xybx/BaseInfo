/*
 * @Author: WCL
 * @Date: 2021-12-03 10:39:28
 * @LastEditors: WCL
 * @LastEditTime: 2022-12-28 14:53:05
 * @FilePath: \webgis\src\utils\topic-map.js
 * @Description: 专题图共用JS
 */

import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import PrintParameters from "@arcgis/core/rest/support/PrintParameters";
import PrintTemplate from "@arcgis/core/rest/support/PrintTemplate";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import * as print from "@arcgis/core/rest/print";
import { union } from "@arcgis/core/geometry/geometryEngine";
import request from "@/utils/request";
import store from "@/store/index";
import Basemap from "@arcgis/core/Basemap";
import Point from "@arcgis/core/geometry/Point";
import { GetBaseMapAreaLayers } from "@/utils/common-map-method";

// 专题图图层列表接口
export const zttLayersApi = (params) => {
    return request({
        method: "GET",
        url: "/OneMap/GetZttLayers",
        params,
    });
};

// 打印服务接口
export const mapPrintServiceApi = (params) => {
    return request({
        method: "GET",
        url: "/MapConfig/GetUserMapPrintService",
        params,
    });
};

// 上传通用文件接口
export const uploadDwg = (data) => {
    return request({
        method: "POST",
        url: "/Upload/uploadfile",
        data,
    });
};

// 解析DWG文件接口
export const readDWGApi = (params) => {
    return request({
        method: "GET",
        url: "/ReadFile/ReadCAD",
        params,
    });
};

// 解析TXT文件接口
export const readTXTApi = (params) => {
    return request({
        method: "GET",
        url: "/ReadFile/GetTxtPoints",
        params,
    });
};

// 解析SHP文件接口
export const readSHPApi = (params) => {
    return request({
        method: "GET",
        url: "/ReadFile/ReadSHP",
        params,
    });
};

// 导出专题图通用接口
export const createFile = (params) => {
    return request({
        method: "GET",
        url: "/Ztt/ExportZTTReport",
        params,
    });
};

// 初始化专题图
export let zttView = null;
export const initZttMap = async (container, type) => {
    debugger;
    let zttMap = new Map();
    // ! scale赋值不生效
    zttView = new MapView({
        container,
        map: zttMap,
        scale: 100000,
    });
    zttView.ui.remove(["attribution"]);

    //是否对底图做蒙版
    if (isBaseMapCut) {
        GetBaseMapAreaLayers(zttView);
        zttView.background = {
            // autocasts new ColorBackground()
            color: [255, 255, 255, 1], // autocasts as new Color()
        };
    }

    store.commit("onemap-store/handleZttScale", zttView.scale);
    await getZttLayers(type);
    mapExtentWatch(zttView);
};

// 地图范围监听
const mapExtentWatch = (view) => {
    view.watch("scale", () => {
        let status = store.state["onemap-store"].isScaleStatus;
        if (!status) {
            console.log("false");
            store.commit("onemap-store/handleZttScale", Math.round(view.scale));
        } else {
            console.log("true");
            store.commit("onemap-store/handleShowZttScale", false);
        }
    });
};

// 加载专题图层
const getZttLayers = async (type) => {
    let params = {
        uid: window.sessionStorage.getItem("userid"),
        typeid: type,
    };
    const { data: res } = await zttLayersApi(params);
    if (res.code === 1) {
        let d = res.data;
        d.map((item) => {
            if (item.MAPTYPE == "image") {
                let layer = new MapImageLayer({
                    url: item.LAYERURL,
                });
                zttView.map.add(layer);
            } else if (item.MAPTYPE == "tile") {
                let layer = new TileLayer({
                    url: item.LAYERURL,
                });
                zttView.map.add(layer);
            }
        });
    }
};

//地图快照（地图打印的一种方式）无参数
export async function mapScreenhot(view) {
    let screenshot = await view.takeScreenshot();
    return screenshot.dataUrl;
}
// 打印地图
// 接收参数为三个
export const printMap = async (dpiValue, scale, view, layout = "map-only") => {
    let printURL = null;
    let params = {
        uid: sessionStorage.getItem("userid"),
    };
    const { data: res } = await mapPrintServiceApi(params);
    if (res.code === 1) {
        debugger;
        printURL = res.data.PRINTURL;
        console.log(printURL, "printURL");

        let ptTemplate = new PrintTemplate({
            format: "jpg",
            exportOptions: {
                width: dpiValue / (96 / view.width),
                height: dpiValue / (96 / view.height),
                dpi: dpiValue,
            },
            outScale: scale,
            layout: layout,
            showLabels: true,
        });

        let ptParams = new PrintParameters({
            view,
            template: ptTemplate,
        });

        return await print.execute(printURL, ptParams);
    }
};

// 创建几何图形，返回 graphic
export const createGraphic = (pointData, view) => {
    debugger;
    store.commit("map2d-store/setSymbol");
    console.log(pointData, "pointData");
    // 多地块(*)
    if (pointData.indexOf("*") > 0) {
        let geo = null;
        let pointArr = pointData.split("*");
        console.log(pointArr, "pointArr");

        pointArr.map((item) => {
            let pointItems = item.split(";");
            let pt = new Array();
            pointItems.map((subItem) => {
                if (subItem) {
                    let point = new Array();
                    point.push(Number(subItem.split(",")[0]));
                    point.push(Number(subItem.split(",")[1]));
                    pt.push(point); // 点数组
                }
            });

            let polygonJSON = {
                rings: pt,
                spatialReference: {
                    wkid: view.spatialReference.wkid,
                },
            };

            let polygon = new Polygon(polygonJSON);

            if (geo == null) {
                geo = polygon;
            } else {
                geo = union([geo, polygon]);
            }
        });
        let graphic = new Graphic({
            geometry: geo,
            symbol: store.state["map2d-store"].symbol,
        });
        return graphic;
    }
    // 单地块
    else {
        let pt = new Array();
        let pointItems = pointData.split(";");
        pointItems.map((item) => {
            let point = new Array();
            point.push(Number(item.split(",")[0]));
            point.push(Number(item.split(",")[1]));
            pt.push(point); // 点数组
        });

        let polygonJSON = {
            rings: pt,
            spatialReference: {
                wkid: view.spatialReference.wkid,
            },
        };

        let polygon = new Polygon(polygonJSON);

        console.log(store.state["map2d-store"].symbol, "symbol");
        let graphic = new Graphic({
            geometry: polygon,
            symbol: store.state["map2d-store"].symbol,
        });
        debugger;
        return graphic;
    }
};

// 初始化自定义专题图
export let defineView = null;
export const initDefineMap = (container) => {
    let baseLayer = null;
    let deBaseMap = store.state["map2d-store"].mapconfig;
    let mapWkid = deBaseMap.MAPWKID;
    if (deBaseMap.TYPE == "Image") {
        baseLayer = new MapImageLayer({
            url: deBaseMap.URL,
            id: "basemap_layer",
        });
    } else if (deBaseMap.TYPE == "Tile") {
        baseLayer = new TileLayer({
            url: deBaseMap.URL,
            id: "basemap_layer",
        });
    }

    let baseMap = new Basemap({
        baseLayers: [baseLayer],
        title: "basemap",
        id: "basemap",
    });

    let defineMap = new Map({
        basemap: baseMap,
    });

    let centPoint = new Point({
        x: deBaseMap.CENTERX,
        y: deBaseMap.CENTERY,
        spatialReference: {
            wkid: deBaseMap.MAPWKID,
        },
    });

    // ! zoom,scale不起作用
    defineView = new MapView({
        container,
        map: defineMap,
        center: centPoint, // 初始显示的地图中心点，经纬度
        //zoom: 4, // 当前地图缩放等级
        //scale: 10000,
        constraints: {
            rotationEnabled: false,
        },
        navigation: {
            momentumEnabled: false,
        },
        scale: mapParameters.scale,
    });
    defineView.ui.remove(["attribution", "zoom"]);

    store.commit("onemap-store/handleZttScale", defineView.scale);

    // 地图scale监听
    mapExtentWatch(defineView);
    // 获取主图打开的全部图层
    getAllOpenLayers();
    // 叠加主地图打开的图层
    overAllLayers();
    console.log("0");
};

// 获取当前地图中显示叠加的全部图层
let openAllLayer = [];
export const getAllOpenLayers = () => {
    openAllLayer = [];
    let mainView = store.state["map2d-store"].mapview;
    let layerList = mainView.map.allLayers;
    if (layerList.length > 0) {
        layerList.map((item) => {
            if (
                item.id != "lengthLrc" &&
                // && item.type != 'tile'
                item.title != null &&
                item.type != "graphics" &&
                item.id != "basemap_layer"
                // && item.id.indexOf('影像图') < 0
            ) {
                if (item.visible) {
                    debugger;
                    let attrLayer = new Object();
                    attrLayer.layerName = item.id;
                    attrLayer.layerURL = item.url;
                    attrLayer.opacity = item.opacity;
                    attrLayer.subLayer = [];
                    item.allSublayers.items.map((subItem) => {
                        if (subItem.visible) {
                            attrLayer.subLayer.push(subItem.id);
                        }
                    });
                    if (attrLayer.subLayer.length > 0) {
                        openAllLayer.push(attrLayer);
                    }
                }
            }
        });
    }
};

// 叠加主图上显示的图层到专题图
export const overAllLayers = () => {
    debugger;
    if (openAllLayer) {
        openAllLayer.forEach((item) => {
            let subLayers = [];
            item.subLayer.forEach((subItem) => {
                let sonLayer = {
                    id: subItem,
                    visible: true,
                };
                subLayers.push(sonLayer);
            });
            let layer = new MapImageLayer({
                url: item.layerURL,
                id: item.layerName,
                sublayers: subLayers,
                opacity: item.opacity,
            });
            if (item.layerName.indexOf("影像图") > -1) {
                defineView.map.add(layer, 0);
            } else {
                defineView.map.add(layer, 1);
            }
        });
    }
};
