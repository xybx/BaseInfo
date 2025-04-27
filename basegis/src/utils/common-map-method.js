/*
 * @Author: LJX
 * @Date: 2022-02-17 10:13:45
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 16:06:56
 * @FilePath: \webgis\src\utils\common-map-method.js
 * @Description: 地图公共操作方法文件
 */
import { writeMapServerLog } from "./log-api";
import store from "../store/index";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import {
    getMapGeometryServiceUrl,
    savePrintBitImage,
    savePrintImage,
} from "@/utils/common-api";
import {
    simplify,
    areasAndLengths,
    project,
    difference,
    union,
} from "@arcgis/core/rest/geometryService";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import AreasAndLengthsParameters from "@arcgis/core/rest/support/AreasAndLengthsParameters";
import ProjectParameters from "@arcgis/core/rest/support/ProjectParameters";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import * as query from "@arcgis/core/rest/query";
import Query from "@arcgis/core/rest/support/Query";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Polygon from "@arcgis/core/geometry/Polygon";

//对底图做筛查（底图蒙版）
export async function GetBaseMapAreaLayers(view) {
    let cutLayer = new GraphicsLayer({
        id: "cutLayer",
        blendMode: "destination-in",
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-fill",
                color: [227, 139, 79, 1],
                outline: {
                    color: [0, 122, 204, 0.8],
                    width: 2,
                },
            },
        },
        //effect: 'drop-shadow(10px 10px 20px #00a5f6)',
    });

    let extent = null;
    var queryParams = new Query();
    queryParams.where = cutAttrName + "='" + cutAttrValue + "'";
    queryParams.returnGeometry = true;
    queryParams.outFields = ["*"];
    query.executeQueryJSON(xzqlayer, queryParams).then(function (result) {
        for (let i = 0; i < result.features.length; i++) {
            let graphic = new Graphic({
                geometry: result.features[i].geometry,
            });
            cutLayer.add(graphic);
            extent = result.features[i].geometry.extent;
        }
        view.map.add(cutLayer);
        view.extent = extent;
    });
}

//根据服务地址获取该图层服务的所有属性列表
export async function GetLayerAttrs(layerurl, objectid = null) {
    var attrs = [];
    var queryParams = new Query();
    queryParams.where = "1=1";
    queryParams.outFields = ["*"];
    if (objectid) {
        queryParams.where += ` and OBJECTID=${objectid}`;
    }
    let result = await query.executeQueryJSON(layerurl, queryParams);
    if (result != null && result.features.length > 0) {
        if (result.features.length > 0) {
            for (let i = 0; i < result.fields.length; i++) {
                const field = result.fields[i];
                var name = field.name;
                if (name == "SHAPE.LEN") {
                    break;
                }
                var value = "";
                var prjId = result.features[0].attributes["PRJID"];
                if (field.type == "date") {
                    var pzsj = result.features[0].attributes[name];
                    if (pzsj != null && pzsj != "" && pzsj != "Null") {
                        var date = new Date(pzsj);
                        value =
                            date.getFullYear() +
                            "-" +
                            (date.getMonth() + 1) +
                            "-" +
                            date.getDate();
                    }
                } else if (field.type == "double") {
                    if (result.features[0].attributes[name]) {
                        value = result.features[0].attributes[name].toFixed(2);
                    } else {
                        value = "";
                    }
                } else {
                    value = result.features[0].attributes[name];
                }

                var tabdata = {
                    name: field.alias,
                    value: value,
                };
                attrs.push(tabdata);
            }
            console.log(attrs, "attrs");
        }
    }
    return attrs;
}

//图形定位
export function GraphicLocation(graphic) {
    store.state["map2d-store"].mapview.graphics.add(graphic);
    store.state["map2d-store"].mapview.extent = graphic.geometry.extent;
    store.state["map2d-store"].mapview.zoom =
        store.state["map2d-store"].mapview.zoom - 2;
}

//清空地图上的图形
export function clearMapGraphics(layerdatas) {
    store.state["map2d-store"].mapview.graphics.removeAll();

    //清空绘制图层
    store.state["map2d-store"].graphicLengthLrc.removeAll();
    //隐藏地图上得所有图层
    //store.state["map2d-store"].map.
    console.log(store.state["map2d-store"].mapview.map.allLayers, "mapview");
    var layerlist = store.state["map2d-store"].mapview.map.allLayers;

    if (layerdatas != null && layerdatas.length > 0) {
        layerdatas.forEach((element) => {
            var layer = store.state["map2d-store"].mapview.map.findLayerById(
                element.LAYERNAME
            );
            if (layer) {
                layer.visible = false;
            }
        });
    }
}

//获取当前地图上全部打开的图层
export function getAllOpenLayers() {
    var layerlist = store.state["map2d-store"].mapview.map.allLayers;
    var openalllayerlist = [];
    if (layerlist.length > 0) {
        for (var i = 0; i < layerlist.items.length; i++) {
            //console.log(layerlist.items[i], "layerlist.items[i]");
            if (
                layerlist.items[i]["id"] != "basemap_layer" &&
                layerlist.items[i]["id"] != "lengthLrc" &&
                // layerlist.items[i].type != 'tile' &&
                layerlist.items[i].title != null &&
                layerlist.items[i].type != "graphics" &&
                layerlist.items[i]["id"].indexOf("影像图") < 0
            ) {
                //console.log(layerlist.items[i], "layerlist.items[i]-------");
                if (layerlist.items[i].visible) {
                    var attributelayer = new Object();
                    attributelayer.layername = layerlist.items[i].id;
                    attributelayer.layerurl = layerlist.items[i].url;
                    attributelayer.opacity = layerlist.items[i].opacity;
                    attributelayer.sublayer = [];

                    //console.log(layerlist.items[i],attributelayer, "layerlist.items[i]-------");

                    //获取layer在map中的索引
                    const layerindex = store.state[
                        "map2d-store"
                    ].mapview.map.allLayers.items.findIndex(function (val) {
                        return val.id === layerlist.items[i].id;
                    });
                    attributelayer.index = layerindex;
                    if (layerlist.items[i].sublayers) {
                        for (
                            var k = 0;
                            k < layerlist.items[i].sublayers.length;
                            k++
                        ) {
                            if (layerlist.items[i].sublayers.items[k].visible) {
                                attributelayer.sublayer.push(
                                    layerlist.items[i].sublayers.items[k].id
                                );
                            }
                        }
                    }
                    //console.log(layerlist.items[i].type, "layerlist.items[i].type");
                    if (
                        attributelayer.sublayer.length > 0 ||
                        layerlist.items[i].type == "wmts" ||
                        layerlist.items[i].type == "web-tile"
                    ) {
                        openalllayerlist.push(attributelayer);
                    }
                }
            }
        }
        console.log(openalllayerlist, "openalllayerlist");
        return openalllayerlist;
    }
}

//获取地图上已加载的子图层列表
export function getOpenSonLayers() {
    let openalllayerlist = getAllOpenLayers();
    let opensonlayers = [];
    let index = 0;
    if (openalllayerlist.length > 0) {
        for (let i = 0; i < openalllayerlist.length; i++) {
            const element = openalllayerlist[i];
            var layer = store.state["map2d-store"].mapview.map.findLayerById(
                element.layername
            );
            if (layer.sublayers) {
                for (var k = 0; k < layer.sublayers.length; k++) {
                    index++;
                    if (layer.sublayers.items[k].visible) {
                        opensonlayers.push({
                            index: index,
                            id: layer.sublayers.items[k].id,
                            layername: layer.sublayers.items[k].title,
                            servicename: element.layername,
                            url: layer.sublayers.items[k].url,
                        });
                    }
                }
            }
        }
    }
    return opensonlayers;
}
//地图图层预加载
export function preloadLayer(layerdatas) {
    layerdatas.map((layerdata) => {
        var layer = new MapImageLayer({
            id: layerdata.LAYERNAME,
            url: layerdata.LAYERURL,
            visible: false,
        });
        store.state["map2d-store"].mapview.map.add(layer, 0);

        //异常日志捕捉
        layer
            .load()
            .then(function (res) {
                //加载成功todo（不操作）
            })
            .catch(async function (error) {
                //图层加载失败
                console.log(error, "error");
                //记录图层异常日志 username,type,serverurl,servername,modulename,ex_statuscode
                //type:3:服务地址异常
                var params = {
                    username: sessionStorage.getItem("username"),
                    type: 3,
                    serverurl: layerdata.LAYERURL,
                    servername: layerdata.LAYERNAME,
                    modulename: "合规审查",
                    ex_statuscode:
                        error.details.httpStatus + "," + error.message,
                };
                await writeMapServerLog(params);
            });
    });
}

export async function visibleLayer(layername, visible) {
    var layer = store.state["map2d-store"].mapview.map.findLayerById(layername);
    if (layer != undefined) {
        layer.visible = visible;
    } else {
        console.log("无法找到图层:" + layername);
    }
}

//叠加图层layer
export async function addlayer(layername, layerurl) {
    var layer = new MapImageLayer({
        id: layername,
        url: layerurl,
        visible: true,
    });
    store.state["map2d-store"].mapview.map.add(layer, 0);
}

//移除图层layer
export async function removelayer(layername) {
    var layer = store.state["map2d-store"].mapview.map.findLayerById(layername);
    if (layer != undefined) {
        store.state["map2d-store"].mapview.map.remove(layer, 0);
    } else {
        console.log("无法找到图层:" + layername);
    }
}

//地图快照（地图打印的一种方式）有参数
export async function mapScreenhotOptions(layers) {
    //var layer = store.state["map2d-store"].mapview.map.findLayerById(layername);
    let options = {
        layers: layers,
    };

    let screenshot = await store.state["map2d-store"].mapview.takeScreenshot(
        options
    );
    return screenshot.dataUrl;
}
//地图快照（地图打印的一种方式）无参数
export async function mapScreenhot() {
    let screenshot = await store.state["map2d-store"].mapview.takeScreenshot();
    return screenshot.dataUrl;
}

//地图快照保存
//filename:上传的地块红线的文件名称或者自定义画的地块的文件名称
//savepath:保存的文件夹名称
//imagedata:base64图片
//imagetype:1:原图，2：冲突图形
//imageDataType:0快照，1：print
export async function saveMapPrintImage(
    filename,
    savepath,
    imagedata,
    imagetype,
    imageDataType = 0
) {
    // let imageurl = "";
    // if (imagetype == 1) {
    //   imageurl = await mapScreenhot();
    // } else if (imagetype == 2) {
    //   imageurl = await mapScreenhotOptions(filename);
    // }

    let params = {
        imgname: filename,
        imagedata: imagedata,
        savepath: savepath,
        imagetype: imagetype,
    };
    let resData = null;
    if (imageDataType == 1) {
        const { data: res } = await savePrintImage(params);
        resData = res;
    } else {
        const { data: res } = await savePrintBitImage(params);
        resData = res;
    }

    if (resData.code == 1) {
        console.log("地图快照图片保存成功");
    } else {
        console.log("地图快照图片保存失败");
    }
    return resData;
}

//裁剪不冲突图形
//cutGeo:要裁剪的图形
//compareGeo:与裁剪的图形做比较的图形
//返回不冲突图形的geometry
export async function GetGeoDifference(cutGeo, compareGeo) {
    let insGeo = await geometryEngine.union(compareGeo);
    //let MapGeometryServerUrl = await getMapGeometryServiceUrl();
    let diffGeo = await geometryEngine.difference(cutGeo, insGeo);
    console.log(diffGeo, "diffGeo");
    return diffGeo;
}

//图形转坐标点
export async function GeoToPointStr(geometry) {
    let pointstr = "";
    console.log(geometry, "geometry");

    //投影坐标系
    var spatialRef = new SpatialReference({
        wkid: projectedWkid,
    });
    if (!openProjectWkid) {
        for (var i = 0; i < geometry.rings.length; i++) {
            var pointarr = geometry.rings[i];
            for (let j = 0; j < pointarr.length; j++) {
                const point = pointarr[j];
                pointstr += point[1] + "," + point[0] + ";";
            }
            pointstr += "*";
        }
    } else {
        const params = new ProjectParameters({
            geometries: [geometry],
            outSpatialReference: spatialRef,
        });
        let MapGeometryServerUrl = await getMapGeometryServiceUrl();
        console.log(MapGeometryServerUrl, "resbefore");
        let results = await project(MapGeometryServerUrl, params);

        console.log(results, "results");
        for (let r = 0; r < results[0].rings.length; r++) {
            var pointarr = results[0].rings[r];
            console.log(pointarr, "pointarr");
            for (let j = 0; j < pointarr.length; j++) {
                const point = pointarr[j];
                pointstr += point[1] + "," + point[0] + ";";
            }
            pointstr += "*";
        }
    }
    return pointstr.trimEnd("*");
}

//计算图形面积和周长
export async function getAreaAndLength(geometry) {
    let MapGeometryServerUrl = await getMapGeometryServiceUrl();

    let simplifiedGeometries = await simplify(MapGeometryServerUrl, [geometry]);
    const areasAndLengthParams = new AreasAndLengthsParameters({
        areaUnit: "square-meters", //平方米
        lengthUnit: "meters", //米
        calculationType: "geodesic",
        polygons: simplifiedGeometries,
    });
    let result = await areasAndLengths(
        MapGeometryServerUrl,
        areasAndLengthParams
    );
    let totalarea = Number(result.areas[0]).toFixed(4);
    let totallength = Number(result.lengths[0]).toFixed(4);
    return {
        area: totalarea,
        length: totallength,
        geo: geometry,
    };
}

//导出坐标点的txt文件
//geometry:导出的图形
//filename:导出文件名
//pointtype:坐标系类型:1:经纬度坐标系，2：投影坐标系
export async function exportPointTxt(
    geometry,
    filename
    //pointtype
) {
    var exportText = "";
    if (openProjectWkid) {
        exportText += "[属性描述]\r\n";
        exportText += "坐标系=2000国家大地坐标系\r\n";
        exportText += "几度分带=3\r\n";
        exportText += "投影类型=高斯克吕格\r\n";
        exportText += "计量单位=米\r\n";
        exportText += "带号=39\r\n";
        exportText += "精度=0.001\r\n";
        exportText += "转换参数=,,,,,,\r\n";
    }
    exportText += "[地块坐标]\r\n";

    //exportText += "8,0.7655公顷,,地块1,面,,,,@\r";
    //支持导出多地块txt
    if (geometry.rings.length > 0) {
        debugger;
        if (!openProjectWkid) {
            //经纬度
            for (let r = 0; r < geometry.rings.length; r++) {
                //创建geometry
                let polygon = new Polygon({
                    rings: geometry.rings[r],
                    spatialReference: {
                        wkid: store.state["map2d-store"].mapview
                            .spatialReference.wkid,
                    },
                });
                var pointstrarr = "";
                let areaandlength = await getAreaAndLength(polygon);
                exportText +=
                    parseFloat(areaandlength.area * 0.0001) +
                    "公顷,,地块" +
                    (r + 1) +
                    ",面,,,,@\r\n";
                const ring = geometry.rings[r];
                for (var i = 0; i < ring.length; i++) {
                    var pointarr = ring[i];
                    if (i + 1 == ring.length) {
                        pointstrarr +=
                            "J1,1," + pointarr[1] + "," + pointarr[0] + "\r\n";
                    } else {
                        pointstrarr +=
                            "J" +
                            (i + 1) +
                            ",1," +
                            pointarr[1] +
                            "," +
                            pointarr[0] +
                            "\r\n";
                    }
                }
                exportText += pointstrarr;
            }

            exportRaw(filename + ".txt", exportText);
        } else {
            //投影坐标系
            var spatialRef = new SpatialReference({
                wkid: projectedWkid,
            });

            //const geomSer = new GeometryService( ... );
            const params = new ProjectParameters({
                geometries: [geometry],
                outSpatialReference: spatialRef,
            });
            let MapGeometryServerUrl = await getMapGeometryServiceUrl();
            console.log("resbefore");
            let results = await project(MapGeometryServerUrl, params);
            for (let r = 0; r < results[0].rings.length; r++) {
                //创建geometry
                let polygon = new Polygon({
                    rings: results[0].rings[r],
                    spatialReference: spatialRef,
                });
                var pointstrarr = "";
                let areaandlength = await getAreaAndLength(polygon);
                exportText +=
                    parseFloat(areaandlength.area * 0.0001) +
                    "公顷,,地块" +
                    (r + 1) +
                    ",面,,,,@\r\n";
                const ring = results[0].rings[r];

                for (var i = 0; i < ring.length; i++) {
                    var pointarr = ring[i];
                    if (i + 1 == ring.length) {
                        pointstrarr +=
                            "J1,1," + pointarr[1] + "," + pointarr[0] + "\r\n";
                    } else {
                        pointstrarr +=
                            "J" +
                            (i + 1) +
                            ",1," +
                            pointarr[1] +
                            "," +
                            pointarr[0] +
                            "\r\n";
                    }
                }
                exportText += pointstrarr;
            }
            exportRaw(filename + ".txt", exportText);
        }
    }
}

//导出txt文件的方法
function exportRaw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "a"
    );
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    fakeClick(save_link);
}

function fakeClick(obj) {
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
    );
    obj.dispatchEvent(ev);
}
