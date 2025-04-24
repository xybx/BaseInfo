import BuildingFilter from '@arcgis/core/layers/support/BuildingFilter.js';
import Graphic from '@arcgis/core/Graphic.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';

import cv from 'opencv-ts';
import useStore from '@/stores';
const { menuStore, viewStore, mapStore } = useStore();
// new Accessor.createSubclass();

var DefaultRenderer = {
    type: 'simple',
    symbol: {
        type: 'mesh-3d',
        castShadows: false,
        symbolLayers: [
            {
                type: 'fill',
                material: { color: 'red', colorMixMode: 'replace' },
                pattern: {
                    type: 'style',
                    style: 'none',
                },
            },
        ],
    },
};

class SkylineDrawer {
    // declaredClass: 'geoscene.tools.3d.SkylineDrawer',

    // properties: {
    view: any;
    environment: any;
    qxLayer: any;
    _renders: any;
    _baseLayers: any;
    _groundOpacity: any;
    cv: any;


    bimarr: any = [];

    constructor(view: any, environment: any) {
        (this.view = view), console.log(this.view, '---this.view');

        this.environment = environment;
    }

    _loopGroupLayers(group: any) {
        var that = this;

        group.layers.forEach(function (lyr: any) {
            if (lyr.type === 'scene') {
                that._renders[lyr.id] = lyr.renderer;
                lyr.renderer = DefaultRenderer;
            } else if (lyr.type === 'group') {
                that._loopGroupLayers(lyr);
            }
        });
    }

    _preserveViewProps() {
        this._renders = {};
        this._baseLayers = null;
        this._groundOpacity = this.view.map.ground.opacity;
        let findLayer = this.view.map.findLayerById('skylayer');
        console.log(this.environment, '---environment');

        var that = this;
        var scene = this.view.map;

        this.view.qualityProfile = 'low';
        this.view.environment = this.environment;
        scene.layers.forEach(function (lyr: any) {
            if (lyr.visible) {
                if (lyr.type === 'scene') {
                    that._renders[lyr.id] = lyr.renderer;
                    lyr.renderer = DefaultRenderer;


                } else if (lyr.type === 'group') {
                    that._loopGroupLayers(lyr);
                }
                // BIM模型
                else if (lyr.type === 'building-scene') {
                    // ? BIM筛选
                    // let bimFilter = new BuildingFilter({
                    //     filterBlocks: [
                    //         {
                    //             filterExpression: "BaseCategory = 'Mass'",
                    //         },
                    //     ],
                    // });
                    // lyr.filters = [bimFilter];
                    // lyr.activeFilterId = bimFilter.id;
                    console.log(lyr, '---lyr');
                    that.bimarr.push(lyr.id);

                    // TODO
                    let allLayers = lyr.allSublayers.flatten((item: any) => {
                        if (item.renderer) {
                            item.renderer = DefaultRenderer;
                        }
                        // if (item.renderer && item.modelName == 'Mass') {
                        //     item.renderer = DefaultRenderer;
                        // }
                    });
                }
                // 倾斜摄影
                else if (lyr.type === 'integrated-mesh') {
                    let polygon = new Polygon({
                        rings: [
                            [
                                [lyr.fullExtent.xmin, lyr.fullExtent.ymin],
                                [lyr.fullExtent.xmax, lyr.fullExtent.ymin],
                                [lyr.fullExtent.xmax, lyr.fullExtent.ymax],
                                [lyr.fullExtent.xmin, lyr.fullExtent.ymax],
                                [lyr.fullExtent.xmin, lyr.fullExtent.ymin],
                            ],
                        ],
                        spatialReference: {
                            wkid: 4549,
                        },
                        hasM: true,
                    });

                    let polylineSymbol = {
                        type: 'simple-fill',
                        color: 'red',
                        style: 'solid',
                    };

                    let geo = new Graphic({
                        geometry: polygon,
                        symbol: polylineSymbol,
                        //  {
                        // type: 'simple-fill',
                        // color: 'red',
                        // style: 'solid',
                        // },
                    });
                    findLayer.graphics.add(geo);
                }
            }

        });

        this.view.map.ground.surfaceColor = 'red';
        this._baseLayers = this.view.map.basemap.baseLayers.items.concat();
        this.view.map.basemap.baseLayers.removeAll();
    }

    restoreViewProps() {
        var that = this;

        if (this._renders) {
            if (Object.keys(this._renders).length) {
                Object.keys(this._renders).forEach(function (layerId) {
                    debugger;
                    var lyr = that.view.map.findLayerById(layerId);
                    if (lyr) {
                        lyr.renderer = that._renders[layerId];
                    }
                });
            }

            this._renders = undefined;
        }
        this.view.map.ground.surfaceColor = null;
        if (this._groundOpacity) {
            this.view.map.ground.opacity = this._groundOpacity;
            this._groundOpacity = undefined;
        }
        if (this._baseLayers) {
            this.view.map.basemap.baseLayers.addMany(this._baseLayers);
        }
    }
    takeRawScreenshot() {
        var that = this;
        return this.view.when().then(function () {
            return that.view.takeScreenshot({ format: 'png' });
        });
    }

    convertScreenshot2Image(screenshot: any) {
        return new Promise(function (resolve) {
            const img = document.createElement('img');
            img.crossOrigin = 'Anonymous';
            img.id = 'screenshot';
            img.width = screenshot.data.width;
            img.height = screenshot.data.height;
            img.src = screenshot.dataUrl;

            img.onload = function () {
                resolve(cv.imread(img));
            };
        });
    }

    _wait(time: any) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    }

    _prepareOutputCanvas(screenshot: any) {
        return new Promise((resolve) => {
            var outputCanvas = document.createElement('canvas');
            outputCanvas.id = 'canvasOutput';
            outputCanvas.width = screenshot.data.width;
            outputCanvas.height = screenshot.data.height;
            document
                .getElementsByClassName('esri-view')[0]
                .appendChild(outputCanvas);
            resolve(screenshot);
        });
    }
    execute() {
        var that = this;
        console.log(this, 'this');
        debugger;
        this.takeRawScreenshot()
            .then(function (originScreenshot: any) {
                that._preserveViewProps();

                return that._wait(5000).then(function () {
                    return that.convertScreenshot2Image(originScreenshot);
                });
            })
            .then(function (originCvSource: any) {
                debugger;
                return that
                    .takeRawScreenshot()
                    .then(function (colorizedScreenshot: any) {
                        cv.cvtColor(
                            originCvSource,
                            originCvSource,
                            cv.COLOR_RGBA2RGB,
                            0
                        );

                        return that._prepareOutputCanvas(colorizedScreenshot);
                    })
                    .then(that.convertScreenshot2Image)
                    .then(function (colorizedCvSource: any) {
                        cv.cvtColor(
                            colorizedCvSource,
                            colorizedCvSource,
                            cv.COLOR_RGBA2RGB,
                            0
                        );

                        var src = colorizedCvSource.clone();
                        var dst = new cv.Mat.zeros(
                            src.rows,
                            src.cols,
                            cv.CV_8UC3
                        );
                        // 灰度图
                        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
                        // 二值化
                        cv.threshold(
                            src,
                            src,
                            0,
                            255,
                            cv.THRESH_BINARY | cv.THRESH_OTSU
                        );
                        // 边缘检测
                        cv.Canny(src, src, 50, 100);
                        // cv.Canny(src, src, 50, 100, 3, false);

                        // 计算轮廓
                        var contours = new cv.MatVector();
                        var hierarchy = new cv.Mat();
                        cv.findContours(
                            src,
                            contours,
                            hierarchy,
                            cv.RETR_EXTERNAL,
                            cv.CHAIN_APPROX_SIMPLE
                        );

                        // 找到轮廓最长
                        var periLength = 0;
                        var flag = 0;
                        var color = new cv.Scalar(255, 0, 0);
                        var min = 100;
                        for (var i = 0; i < contours.size(); i += 1) {
                            var cont = contours.get(i);
                            var rec = cv.boundingRect(cont);
                            var len = cv.arcLength(cont, true);
                            if (len > periLength) {
                                flag = i;
                                periLength = len;
                            }
                            //过滤掉较小的轮廓
                            if (
                                len > min ||
                                !(rec.width < 20 && rec.height < 20)
                            ) {
                                cv.drawContours(
                                    originCvSource,
                                    contours,
                                    i,
                                    color,
                                    2,
                                    cv.LINE_8,
                                    hierarchy,
                                    0,
                                    new cv.Point(1, 2)
                                );
                            }
                        }

                        // 绘制到原始截图上-所有轮廓均绘制
                        // cv.drawContours(
                        //   originCvSource,
                        //   contours,
                        //   flag,
                        //   color,
                        //   2,
                        //   cv.LINE_8,
                        //   hierarchy,
                        //   0,
                        //   new cv.Point()
                        // );

                        cv.imshow('canvasOutput', originCvSource);
                        dst.delete();
                        contours.delete();
                        hierarchy.delete();
                        src.delete();
                        colorizedCvSource.delete();
                        originCvSource.delete();
                        viewStore.handleSkyLoading(false);

                        (
                            document.getElementById('canvasOutput') as any
                        ).addEventListener('dblclick', function () {
                            that.clearRender();
                            // that.restoreViewProps();

                            // let findLayer =
                            //     that.view.map.findLayerById('skylayer');
                            // findLayer.removeAll();
                            // that.view.qualityProfile = 'high';
                            // that.view.environment = null;

                            // // ? render恢复

                            // that.bimarr.forEach((item: any) => {
                            //     console.log(item);

                            //     let findLayerbim = that.view.map.findLayerById(item);
                            //     menuStore.treeRef.value.setChecked(item, false, true)
                            //     that.view.map.layers.remove(findLayerbim);
                            //     setTimeout(function(){
                            //          menuStore.treeRef.value.setCurrentKey(item, true)
                            //     menuStore.treeRef.value.setChecked(item, true, true)
                            //     },500)

                            // }
                            // ) 
                            // setTimeout(function () {
                            //     document
                            //         .getElementsByClassName('esri-view')[0]
                            //         .removeChild(
                            //             document.getElementById(
                            //                 'canvasOutput'
                            //             ) as any
                            //         );
                            // }, 500); 
                        });
                    });
            });
    }
    clearRender() {
        let that = this;
        that.restoreViewProps();

        let findLayer =
            that.view.map.findLayerById('skylayer');
        findLayer.removeAll();
        that.view.qualityProfile = 'high';
        that.view.environment = null;

        // ? render恢复
        console.log(that.bimarr);

        that.bimarr.forEach((item: any) => {
            console.log(item);

            let findLayerbim = that.view.map.findLayerById(item);
            menuStore.treeRef.value.setChecked(item, false, true)
            that.view.map.layers.remove(findLayerbim);
            setTimeout(function () {
                menuStore.treeRef.value.setCurrentKey(item, true)
                menuStore.treeRef.value.setChecked(item, true, true)
            }, 500)

        }
        )
        setTimeout(function () {
            document
                .getElementsByClassName('esri-view')[0]
                .removeChild(
                    document.getElementById(
                        'canvasOutput'
                    ) as any
                );
        }, 500);

        that.bimarr = [];
    }
}

export default SkylineDrawer;
