/*
 * @Author: sgz
 * @Date: 2021-11-19 16:39:26
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 11:43:28
 * @FilePath: \webgis\src\utils\treemap.js
 * @Description: 地图图层树地图图层控制和操作
 */
import store from "../store/index";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";

import { writeMapServerLog } from "./log-api";

//加载三维图层树
export function loadtreelayer(data) {
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (d.childlist.length === 0) {
            loadlayer(d);
            store.state["map2d-store"].allTreeDataLayers.push(d);
        } else {
            loadtreelayer(d.childlist);
        }
    }
}

//加载图层函数
export function loadlayer(obj) {
    //console.log(store.state["map2d-store"].mapview,"map2d-mapview");
    switch (obj.kind) {
        //mapserver
        case 1:
            var layer = new MapImageLayer({
                id: obj.label,
                url: obj.url,
                //visible: false,
                opacity: Number(obj.value) / 100,
                visible: obj.visible == 1 ? true : false,
            });
            store.state["map2d-store"].mapview.map.add(layer, 1);
            //捕捉加载服务地址异常的写法1 async await
            //   try {
            //     await layer.load()
            //     console.log(res,"res");
            //   } catch (error) {
            //       console.log(error,"error");
            //   }
            //捕捉加载服务地址异常的写法2
            // layer
            //     .load()
            //     .then(function (res) {
            //         //加载成功todo（不操作）
            //     })
            //     .catch(async function (error) {
            //         // debugger;
            //         //图层加载失败
            //         console.log(error, 'error');
            //         //记录图层异常日志 username,type,serverurl,servername,modulename,ex_statuscode
            //         //type:3:服务地址异常
            //         var params = {
            //             username: sessionStorage.getItem('username'),
            //             type: 3,
            //             serverurl: obj.url,
            //             servername: obj.label,
            //             modulename: '图层树服务预加载',
            //             ex_statuscode:
            //                 error.details.httpStatus + ',' + error.message,
            //         };
            //         await writeMapServerLog(params);
            //     });
            break;
        //tilelayer
        case 5:
            // var spatialReference = null;
            // if (obj.tileinfo != null && obj.tileinfo != '') {
            //     let tileinfo = JSON.parse(obj.tileinfo);
            //     spatialReference = tileinfo.spatialReference;
            // }
            // else {
            //     spatialReference = store.state['map2d-store'].mapview.spatialReference;
            // }
            var layer = new TileLayer({
                id: obj.label,
                url: obj.url,
                //visible: false,
                opacity: Number(obj.value) / 100,
                visible: obj.visible == 1 ? true : false,
                spatialReference:
                    store.state["map2d-store"].mapview.spatialReference,
            });
            store.state["map2d-store"].mapview.map.add(layer, 0);
            //异常日志捕捉
            // layer
            //     .load()
            //     .then(function (res) {
            //         //加载成功todo（不操作）
            //     })
            //     .catch(async function (error) {
            //         //图层加载失败
            //         console.log(error, 'error');
            //         //记录图层异常日志 username,type,serverurl,servername,modulename,ex_statuscode
            //         //type:3:服务地址异常
            //         var params = {
            //             username: sessionStorage.getItem('username'),
            //             type: 3,
            //             serverurl: obj.url,
            //             servername: obj.label,
            //             modulename: '图层树服务预加载',
            //             ex_statuscode:
            //                 error.details.httpStatus + ',' + error.message,
            //         };
            //         await writeMapServerLog(params);
            //     });
            break;
        //SceneLayer三维
        case 6:
            // var scencelayer = new SceneLayer({
            //   id: obj.label,
            //   url: obj.url,
            //   visible: obj.visible == 1 ? true : false,
            //   opacity: Number(obj.value) / 100,
            //   popupEnabled: true,
            // });
            // store.state["map2d-store"].mapview.map.add(scencelayer, 0);
            break;
        //瓦片服务（wmts）
        case 8:
            // var spatialReference = null;
            // if (obj.tileinfo != null && obj.tileinfo != '') {
            //     let tileinfo = JSON.parse(obj.tileinfo);
            //     spatialReference = tileinfo.spatialReference;
            // }
            // else {
            //     spatialReference = store.state['map2d-store'].mapview.spatialReference;
            // }
            //console.log(obj.tileinfo, "obj.tileinfo");
            let sublayerName = obj.tileinfo;
            if (!sublayerName) {
                sublayerName = "raster";
            }

            var wmtsLayer = new WMTSLayer({
                url: obj.url,
                serviceMode: "KVP",
                id: obj.label,
                opacity: Number(obj.value) / 100,
                visible: obj.visible == 1 ? true : false,
                spatialReference:
                    store.state["map2d-store"].mapview.spatialReference,
                activeLayer: {
                    id: obj.tileinfo,
                },
            });
            //console.log(wmtsLayer, "wmtsLayer");
            //console.log(sublayerName, "sublayerName");
            store.state["map2d-store"].mapview.map.add(wmtsLayer, 0);
            //异常日志捕捉
            //  layer
            //  .load()
            //  .then(function (res) {
            //      //加载成功todo（不操作）
            //  })
            //  .catch(async function (error) {
            //      //图层加载失败
            //      console.log(error, 'error');
            //      //记录图层异常日志 username,type,serverurl,servername,modulename,ex_statuscode
            //      //type:3:服务地址异常
            //      var params = {
            //          username: sessionStorage.getItem('username'),
            //          type: 3,
            //          serverurl: obj.url,
            //          servername: obj.label,
            //          modulename: '图层树服务预加载',
            //          ex_statuscode:
            //              error.details.httpStatus + ',' + error.message,
            //      };
            //      await writeMapServerLog(params);
            //  });
            break;
        case 10:
            //debugger;
            //console.log(obj.tileinfo, "tileinfo");
            var tileinfo = JSON.parse(obj.tileinfo);
            var layer = new WebTileLayer({
                id: obj.label,
                urlTemplate: obj.url,
                title: obj.label,
                opacity: Number(obj.value) / 100,
                visible: obj.visible == 1 ? true : false,
                spatialReference: tileinfo.spatialReference,
                tileInfo: tileinfo,
            });
            store.state["map2d-store"].mapview.map.add(layer, 0);

            //异常日志捕捉
            // layer
            //     .load()
            //     .then(function (res) {
            //         //加载成功todo（不操作）
            //     })
            //     .catch(async function (error) {
            //         //图层加载失败
            //         console.log(error, 'error');
            //         //记录图层异常日志 username,type,serverurl,servername,modulename,ex_statuscode
            //         //type:3:服务地址异常
            //         var params = {
            //             username: sessionStorage.getItem('username'),
            //             type: 3,
            //             serverurl: obj.url,
            //             servername: obj.label,
            //             modulename: '图层树服务预加载',
            //             ex_statuscode:
            //                 error.details.httpStatus + ',' + error.message,
            //         };
            //         await writeMapServerLog(params);
            //     });
            break;
    }
}

//三维图层
// export function loadmap3dlayer(obj) {
//     console.log(store.state['map3d-store'].sceneview, 'sceneview');
//     switch (obj.kind) {
//         case 1:
//             var layer = new MapImageLayer({
//                 id: obj.label,
//                 url: obj.url,
//                 //visible: false,
//                 opacity: Number(obj.value) / 100,
//                 visible: obj.visible == 1 ? true : false,
//             });
//             store.state['map3d-store'].sceneview.map.add(layer, 0);
//             break;
//         //5:TileLayer
//         case 5:
//             var scencelayer = new TileLayer({
//                 id: obj.label,
//                 url: obj.url,
//                 visible: obj.visible == 1 ? true : false,
//                 opacity: Number(obj.value) / 100,
//             });
//             store.state['map3d-store'].sceneview.map.add(scencelayer, 0);
//             break;

//         //6：sceneserver
//         case 6:
//             // console.log(obj, "三维图层");
//             // console.log(store.state["map3d-store"].sceneview, "sceneview");
//             var scencelayer = new SceneLayer({
//                 id: obj.label,
//                 url: obj.url,
//                 visible: obj.visible == 1 ? true : false,
//                 opacity: Number(obj.value) / 100,
//                 popupEnabled: true,
//             });
//             store.state['map3d-store'].sceneview.map.add(scencelayer, 0);
//             break;
//         //9:
//         case 9:
//             // console.log(obj, "三维图层");
//             // console.log(store.state["map3d-store"].sceneview, "sceneview");
//             var scencelayer = new IntegratedMeshLayer({
//                 id: obj.label,
//                 url: obj.url,
//                 visible: obj.visible == 1 ? true : false,
//                 opacity: Number(obj.value) / 100,
//                 popupEnabled: true,
//             });
//             store.state['map3d-store'].sceneview.map.add(scencelayer, 0);
//             break;
//     }
// }

//服务隐藏和显示
export function visiblelayer(layername, visible) {
   
    console.log(store.state["map2d-store"].mapview);
    var layer = store.state["map2d-store"].mapview.map.findLayerById(layername);
    console.log(layer, "visiblelayer");

    if (layer != undefined) {
        layer.visible = visible;
    } else {
        console.log("无法找到图层:" + layername);
    }
}

//图层隐藏和显示
export function visibleSublayer(layername, layerid, visible) {
   
    var layer = store.state["map2d-store"].mapview.map.findLayerById(layername);
    layer.sublayers.items.forEach((sonlayer) => {
        if (!layer.visible) {
            sonlayer.visible = layer.visible;
        }
    });
    layer.visible = true;

    // 切片服务显隐
    if (layer.type == "tile") {
        layer.visible = visible;
    }
    // 非切片服务 子图层显隐
    else {
        var sublayer = layer.findSublayerById(parseInt(layerid));
        if (sublayer != undefined) {
            sublayer.visible = visible;
        }
    }
}

//图层透明度控制,透明度范围在0-1之间
export function layeropacity(layername, opacity) {
    var layer = store.state["map2d-store"].mapview.map.findLayerById(layername);
    layer.opacity = opacity;
}

// 图层收藏
export function collectServer(obj) {
    console.log(obj);
    var serverIds = "";
    getchild(obj.data);

    function getchild(data) {
        if (data.level == "group" && data.childlist != null) {
            for (var i = 0; i < data.childlist.length; i++) {
                getchild(data.childlist[i]);
            }
        } else {
            var serverId = data.id;
            serverIds += serverId + ";";
        }
    }

    if (serverIds.length > 0) {
        serverIds = serverIds.substring(0, serverIds.length - 1);
    }
    console.log(serverIds);
    return serverIds;
}

//查找子图层
export function findLayer(layername,sublayerid)
{
    var layer = store.state["map2d-store"].mapview.map.findLayerById(layername);
    if (layer) {
        var sublayer = layer.findSublayerById(parseInt(sublayerid));
        if (sublayer) {
            return  sublayer;
        }
    }
    return null;
}