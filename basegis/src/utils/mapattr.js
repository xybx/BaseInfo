/*
 * @Author: sgz
 * @Date: 2021-11-23 09:13:25
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 16:37:31
 * @FilePath: \webgis\src\utils\mapattr.js
 * @Description: 查询地图图层树形
 */

import store from '../store/index';
import { Notification, Loading, Message } from 'element-ui';

import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {identify} from '@arcgis/core/rest/identify';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';

var allLayers = []; //地图上的全部图层
var openallLayers = []; //已打开的图层
//递归循环索引，代表查询图层的索引
var identifyCount = 0;
var mapIndex = 0;
var IdentifyResultArr = []; //保存属性查询的结果数据

//获取已打开的图层
function getOpenAllLayers() {
    openallLayers = [];
    //获取地图上的全部图层
    allLayers = store.state['map2d-store'].mapview.map.allLayers;
    //获取已打开的图层
    if (allLayers.length > 0) {
        for (let i = 0; i < allLayers.items.length; i++) {
            if (
                allLayers.items[i]['id'] != 'lengthLrc' &&
                allLayers.items[i]['id'] != 'basemap_layer' &&
                allLayers.items[i]['id'].indexOf('影像图') < 0 &&
                allLayers.items[i].type != 'tile' &&
                allLayers.items[i].title != null &&
                allLayers.items[i].type != 'graphics'
            ) {
                var layeritem = allLayers.items[i];
                if (layeritem.visible) {
                    debugger;
                    var isadd = false;
                    if (layeritem.type!="wmts") {
                        for (
                            var j = 0;
                            j < layeritem['allSublayers'].items.length;
                            j++
                        ) {
                            if (layeritem['allSublayers'].items[j].visible) {
                                isadd = true;
                                break;
                            }
                        }
                    }
                   
                    if (isadd) {
                        openallLayers.push(layeritem);
                    }
                }
            }
        }
    }
}

//图层属性查询
let attr_loading = null;
export function MapAttr(callback) {
    debugger
    //store.state["map2d-store"].mapview.map.
    store.commit('map2d-store/setSymbol');
    store.state['map2d-store'].mapview.viewClick = store.state[
        'map2d-store'
    ].mapview.on('click', function (evt) {
        // let attr_loading = null;
        if (attr_loading != null) {
            attr_loading.close();
        }
        console.log(store.state['map2d-store']);
        if (!store.state['map2d-store'].toolStatus.attr) {
            return;
        }
        debugger;

        mapIndex = 0;
        identifyCount = 0;
        IdentifyResultArr = [];
        attr_loading = Message({
            iconClass: 'el-icon-loading',
            message: '属性查询中......',
            duration: 0,
            customClass: 'prop-search',
        });

        store.state['map2d-store'].mapview.graphics.removeAll();
        if (store.state.userGraphicLayer != null) {
            store.state.userGraphicLayer.graphics.removeAll();
        }

        getOpenAllLayers();

        store.state['map2d-store'].mapview.when(async function () {
            //循环查询打开图层的属性
            for (var i = 0; i < openallLayers.length; i++) {
                mapIndex++;
                var layername = openallLayers[i]['id'];
                var childIdArr = new Array();
                for (
                    var j = 0;
                    j < openallLayers[i]['allSublayers'].items.length;
                    j++
                ) {
                    if (openallLayers[i]['allSublayers'].items[j].visible) {
                        childIdArr.push(
                            openallLayers[i]['allSublayers'].items[j]['id']
                        );
                    }
                }
                if (childIdArr.length > 0) {
                    if (store.state.userGraphicLayer == null) {
                        store.state.userGraphicLayer = new GraphicsLayer(
                            'attrGraphics'
                        );
                    }
                    // var identifytask = new IdentifyTask(
                    //     openallLayers[i]['url']
                    // );
                    var identifyparams = new IdentifyParameters();
                    identifyparams.tolerance = 1;
                    identifyparams.layerIds = childIdArr;
                    identifyparams.layerOption = 'top';
                    identifyparams.width =
                        store.state['map2d-store'].mapview.width;
                    identifyparams.height =
                        store.state['map2d-store'].mapview.height;
                    identifyparams.geometry = evt.mapPoint;
                    identifyparams.mapExtent =
                        store.state['map2d-store'].mapview.extent;
                    IdentifyParameters.returnFieldName = true;
                    identifyparams.returnGeometry = true;
                    await identify(openallLayers[i]['url'],identifyparams)
                        .then(async function (result) {
                            debugger;
                            if (result != null) {
                                if (result.results.length > 0) {
                                    for (
                                        var i = 0;
                                        i < result.results.length;
                                        i++
                                    ) {
                                        var displayname =
                                            result.results[i].displayFieldName;
                                        var feature = result.results[i].feature;
                                        var fields = Object.keys(
                                            feature.attributes
                                        );
                                        var attrArr = new Array();
                                        var displayfiledvalue = '';
                                        for (
                                            var k = 0;
                                            k < fields.length;
                                            k++
                                        ) {
                                            if (
                                                fields[k].indexOf('SHAPE') < 0
                                            ) {
                                                var object = new Object();
                                                object.name = fields[k];

                                                object.value =
                                                    feature.attributes[
                                                        fields[k]
                                                    ];
                                                attrArr.push(object);

                                                if (
                                                    object.name == displayname
                                                ) {
                                                    displayfiledvalue =
                                                        object.value;
                                                }
                                            }
                                            if (fields[k] == 'SHAPE.AREA') {
                                                var object = new Object();
                                                object.name = fields[k];

                                                object.value =
                                                    feature.attributes[
                                                        fields[k]
                                                    ];
                                                attrArr.push(object);
                                            }
                                        }
                                        //添加图形到临时图层
                                        var graphic = new Graphic({
                                            geometry: feature.geometry,
                                            symbol: store.state['map2d-store']
                                                .symbol,
                                        });
                                        //添加到属性数组
                                        var obj = new Object();
                                        obj.value = identifyCount;
                                        obj.name = layername;
                                        obj.displayfieldvalue =
                                            displayfiledvalue
                                                ? displayfiledvalue
                                                : attrArr[0].value;
                                        obj.fieldvalues = attrArr;
                                        obj.graphic = graphic;
                                        IdentifyResultArr.push(obj);

                                        identifyCount++;
                                        debugger;
                                        store.state[
                                            'map2d-store'
                                        ].mapview.graphics.add(graphic);
                                        // store.state[
                                        //     'map2d-store'
                                        // ].mapview.center =
                                        //     graphic.geometry.extent.center;
                                        // store.state[
                                        //     'map2d-store'
                                        // ].mapview.zoom =
                                        //     store.state['map2d-store'].mapview
                                        //         .zoom - 2;
                                        store.state.userGraphicLayer.graphics.add(
                                            graphic
                                        );
                                    }
                                }
                            }
                        });
                }
            }
            console.log(mapIndex, 'mapIndex');
            debugger;
            if (mapIndex == openallLayers.length) {
                setTimeout(() => {
                    attr_loading.close();
                }, 1000);
                //callback(IdentifyResultArr);
                store.commit('map2d-store/attrTableData', IdentifyResultArr);
                if (IdentifyResultArr.length > 0) {
                    setTimeout(() => {
                        attr_loading.close();
                    }, 1000);
                    store.commit('map2d-store/attrdialogstatus', true);
                } else {
                    setTimeout(() => {
                        attr_loading.close();
                    }, 1000);
                }
            } else {
                setTimeout(() => {
                    attr_loading.close();
                }, 1000);
            }
        });
    });
}
