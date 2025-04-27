/*
 * @Author: WCL
 * @Date: 2021-11-26 13:19:17
 * @LastEditors: WCL
 * @LastEditTime: 2022-12-29 16:34:19
 * @FilePath: \webgis\src\components\onemap\onemap-locate\js\onemap-locate.js
 * @Description: 查询定位JS
 */
import { getQuery, getMapGeometryService } from '../api/onemap-locate-api';
import Graphic from '@arcgis/core/Graphic';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Point from '@arcgis/core/geometry/Point';
import ProjectParameters from '@arcgis/core/rest/support/ProjectParameters';
import Extent from '@arcgis/core/geometry/Extent';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import * as find from '@arcgis/core/rest/find';
import FindParameters from '@arcgis/core/rest/support/FindParameters';
import * as geometryService from '@arcgis/core/rest/geometryService';
import { mapMutations, mapState } from 'vuex';

export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            typeOptions: [],
            selectType: '',
            liData: [],
            coordForm: {
                coordX: '',
                coordY: '',
            },
            queryValue: '',
            mapextent: {
                XMin: 368000,
                YMin: 2700000,
                XMax: 530000,
                YMax: 2900000,
            },
            querylist: [],
            selLoading: false,
            dialogVisible: false,
            comTitle: '',
        };
    },
    computed: {
        ...mapState('map2d-store', [
            'mapview',
            'symbol',
            'linesymbol',
            'pointSymbol',
            'mapconfig',
        ]),
        ...mapState('onemap-store', ['userGraphicLayer']),
    },
    watch: {
        dialogVisible(boo) {
            if (boo) {
                this.queryMethod();
            }
        },
    },
    created() { },
    mounted() {
        //console.log(this.$route, "route");
    },
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
            'handleUserGraphicLayer',
        ]),

        // 打开弹窗
        showDialog(obj) {
            this.comTitle = obj.title;
            this.dialogVisible = true;
            this.handleToggleIndex(false);
        },

        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: 'init' });
            this.handleToggleIndex(true);
            this.dialogVisible = false;
            // 清除图形
            this.mapview.graphics.removeAll();
            // 数据恢复初始
            Object.assign(this.$data, this.$options.data());
        },

        async queryMethod() {
            this.querylist = [];
            var mtype = 1;
            if (this.$route.path == '/szxcmapindex') {
                mtype = 2;
            }
            let params = {
                uid: window.sessionStorage.getItem('userid'),
                moduletype: mtype,
            };
            const { data: res } = await getQuery(params);
            if (res.code === 1) {
                this.querylist = res.data;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 获取查询数据源
        query() {
            if (this.queryValue == '')
                return this.$message.error('查询内容不能为空');
            this.typeOptions = [];
            this.selLoading = true;
            if (this.querylist == null) {
                this.$message.warning('没有配置可查询图层！');
                this.selLoading = false;
                return;
            }
            let _findIndex = 0;
            let geometryIndex = 0;
            this.find(_findIndex, geometryIndex);
        },

        async find(_findIndex, geometryIndex) {
            if (_findIndex == 0) {
                let userLayer = new GraphicsLayer();
                this.handleUserGraphicLayer(userLayer);
            }
            var layerids = Array.from(
                new Set(this.querylist[_findIndex].childlist)
            );
            let findparams = new FindParameters({
                layerIds: layerids,
                searchFields: this.querylist[_findIndex].childfield,
                searchText: this.queryValue,
                outSpatialReference: {
                    wkid: this.mapview.spatialReference.wkid,
                },
                returnGeometry: true,
            });
            debugger;
            let result = await find.find(
                this.querylist[_findIndex].url,
                findparams
            );
            console.log(result, 'result');
            if (result != null) {
                if (result.results.length > 0) {
                    // 图层名称
                    let obj = new Object();
                    obj.value = result.results[0].layerName;
                    obj.label = result.results[0].layerName;
                    obj.children = [];

                    // 数据
                    result.results.map((i) => {
                        let b = {
                            value: i.value,
                            label: i.feature.attributes[
                                this.querylist[_findIndex].showfield
                            ],
                            index: geometryIndex,
                            geometrytype: i.feature.geometry.type,
                        };
                        obj.children.push(b);

                        // 临时保存图形
                        let symbol;
                        switch (i.feature.geometry.type) {
                            case 'polygon':
                                symbol = this.symbol;
                                break;
                            case 'polyline':
                                symbol = this.linesymbol;
                                break;
                            case 'point':
                                symbol = this.pointSymbol;
                                break;
                            default:
                                break;
                        }
                        let g = new Graphic({
                            geometry: i.feature.geometry,
                            attributes: i.feature.attributes,
                            symbol,
                        });
                        this.userGraphicLayer.graphics.add(g);
                        geometryIndex++;
                    });

                    this.typeOptions.push(obj);
                    this.selectType = this.typeOptions[0].label;
                    this.liData = this.typeOptions[0].children;
                    this.selLoading = false;

                    _findIndex++;
                    if (_findIndex < this.querylist.length) {
                        this.find(_findIndex, geometryIndex);
                    }
                } else {
                    this.selLoading = false;
                }
            } else {
                _findIndex++;
                if (_findIndex < this.querylist.length) {
                    this.find(_findIndex, geometryIndex);
                }
            }
        },

        // 坐标定位
        async pointLocation() {
            var maptexnt = this.mapconfig;
            console.log(maptexnt, 'maptexnt');
            let x = this.coordForm.coordX;
            let y = this.coordForm.coordY;
            if (x == '' || y == '') return this.$message.error('坐标不能为空');
            let symbol = this.pointSymbol;
            if (
                x > longAndlat.xmin &&
                x < longAndlat.xmax &&
                y > longAndlat.ymin &&
                y < longAndlat.ymax
            ) {
                debugger;
                let sRef = new SpatialReference({
                    wkid: 4326,
                });
                let pt = new Point();
                pt.x = x;
                pt.y = y;
                pt.spatialReference = sRef;

                let user = {
                    uid: window.sessionStorage.getItem('userid'),
                };
                const { data: res } = await getMapGeometryService(user);
                if (res.code != 1) return this.$message.warning(res.msg);
                let params = new ProjectParameters({
                    geometries: [pt],
                    outSpatialReference: this.mapview.spatialReference,
                });
                debugger;

                const results = await geometryService.project(
                    res.data.MAPGEOMETRYSERVICEURL,
                    params
                );
                let _pt = new Point();
                _pt.x = results[0].x;
                _pt.y = results[0].y;
                _pt.spatialReference = this.mapview.spatialReference;
                let g = new Graphic({ geometry: _pt, symbol });
                const renderer = {
                    type: 'simple',
                    symbol,
                };
                const layer = new FeatureLayer({
                    source: [g],
                    objectIdField: 'ObjectID',
                    renderer,
                });
                this.mapview.map.add(layer);
                this.mapview.center = _pt;
            } else if (x > 40000000 && x.substr(0, 2) == '40') {
                // x = x.substr(2);
                let sRef = new SpatialReference({
                    wkid: 4528,
                });
                let point = new Point();
                point.x = x;
                point.y = y;
                point.spatialReference = sRef;

                let user = {
                    uid: window.sessionStorage.getItem('userid'),
                };
                const { data: res } = await getMapGeometryService(user);
                if (res.code != 1) return this.$message.warning(res.msg);

                let params = new ProjectParameters({
                    geometries: [point],
                    outSpatialReference: this.mapview.spatialReference,
                });

                const results = await geometryService.project(
                    res.data.MAPGEOMETRYSERVICEURL,
                    params
                );
                let pt = new Point();
                pt.x = results[0].x;
                pt.y = results[0].y;
                pt.spatialReference = this.mapview.spatialReference;
                this.mapview.center = pt;
                let extent = new Extent({
                    xmin: pt.x - 100,
                    ymin: pt.y - 100,
                    xmax: pt.x + 100,
                    ymax: pt.y + 100,
                    spatialReference: this.mapview.spatialReference,
                });
                this.mapview.extent = extent;

                let ptGraphic = new Graphic({
                    geometry: pt,
                    symbol: this.pointSymbol,
                });
                this.mapview.graphics.add(ptGraphic);
            } else if (
                x > Number(maptexnt.XMIN) &&
                x < Number(maptexnt.XMAX) &&
                y > Number(maptexnt.YMIN) &&
                y < Number(maptexnt.YMAX)
            ) {
                let pt = {
                    type: 'point',
                    x,
                    y,
                    spatialReference: this.mapview.spatialReference,
                };
                this.mapview.center = pt;
                let ptGraphic = new Graphic({
                    geometry: pt,
                    symbol: this.pointSymbol,
                });
                this.mapview.graphics.add(ptGraphic);
            } else {
                this.$message.error('坐标点超出所在行政区范围，请确认点坐标');
            }
        },

        // 下拉选择
        selectOps(val) {
            let filArr = this.typeOptions.filter((arr) => {
                return arr.value == val;
            });
            this.liData = filArr[0].children;
        },

        // 列表点击事件
        clickBtn(item) {
            this.mapview.graphics.removeAll();
            let graphic = this.userGraphicLayer.graphics.items[item.index];

            // 创建标记位置
            let g = new Graphic({
                geometry: graphic.geometry,
                symbol: graphic.symbol,
            });
            this.mapview.graphics.add(g);

            // 创建标记文字
            let text = new TextSymbol({
                text: item.label,
                font: { size: '16px' },
                color: [255, 0, 0],
                yoffset:
                    graphic.geometry.type == 'polygon' ||
                        graphic.geometry.type == 'polyline'
                        ? 0
                        : -25,
            });
            let geo =
                graphic.geometry.type == 'polygon' ||
                    graphic.geometry.type == 'polyline'
                    ? graphic.geometry.extent.center
                    : graphic.geometry;

            let g_text = new Graphic({ geometry: geo, symbol: text });
            this.mapview.graphics.add(g_text);

            if (
                graphic.geometry.type == 'polygon' ||
                graphic.geometry.type == 'polyline'
            ) {
                this.mapview.extent = graphic.geometry.extent;
                this.mapview.zoom = this.mapview.zoom - 2;
            }

            if (graphic.geometry.type == 'point') {
                // let extent = new Extent({
                //     xmin: graphic.geometry.x - 200,
                //     ymin: graphic.geometry.y - 200,
                //     xmax: graphic.geometry.x + 200,
                //     ymax: graphic.geometry.y + 200,
                //     spatialReference: {
                //         wkid: this.mapview.spatialReference.wkid,
                //     },
                // });
                // this.mapview.extent = extent;
                this.mapview.center = graphic.geometry;
            }
        },
    },
};
