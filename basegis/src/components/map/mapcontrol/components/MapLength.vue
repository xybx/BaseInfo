<!--
 * @Author: WCL
 * @Date: 2021-11-19 11:24:51
 * @LastEditors: WCL
 * @LastEditTime: 2022-12-29 16:40:04
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapLength.vue
 * @Description: 地图控制-测距
-->
<template>
    <div class="">
        <el-button
            @click="clickCtrlBtn"
            size="small"
            :class="[{ focusBtn: focusBtn == value }, value]"
        >
            <i class="el-icon-scissors"></i>
            <span>测距</span>
        </el-button>
    </div>
</template>

<script>
import Graphic from '@arcgis/core/Graphic';
import Font from '@arcgis/core/symbols/Font';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import LengthsParameters from '@arcgis/core/rest/support/LengthsParameters';
import Polyline from '@arcgis/core/geometry/Polyline';
import * as geometryService from '@arcgis/core/rest/geometryService';
import { mapMutations, mapState } from 'vuex';
import { getMapGeometryService } from './api/control-api';
let app;
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            value: 'length',
            inputPt: null,
            totalDis: 0,
            defaultFont: null,
            defaultMarkSymbol: null,
            totalLenGraphic: null,
            geometryserviceURL: null,
            handler: null,
        };
    },
    computed: {
        ...mapState('map2d-store', [
            'toolStatus',
            'tool',
            'mapview',
            'graphicLengthLrc',
            'lengthAreahandler',
            'focusBtn',
        ]),
    },
    watch: {},
    created() {},
    mounted() {
        app = this;
        this.getgeometryservice();
    },
    methods: {
        ...mapMutations('map2d-store', ['lengthhandler', 'handleFocus']),

        //获取计算服务地址
        async getgeometryservice() {
            let user = {
                uid: window.sessionStorage.getItem('userid'),
            };
            const { data: res } = await getMapGeometryService(user);
            if (res.code === 1) {
                let geometryservice = res.data;
                this.geometryserviceURL = geometryservice.MAPGEOMETRYSERVICEURL;
            }
        },

        clickCtrlBtn() {
            this.handleFocus(this.value);
            this.toolStatus[this.value] = !this.toolStatus[this.value];
            if (this.toolStatus[this.value] && this.focusBtn == this.value) {
                this.$parent.clearControl();

                if (this.handler != null) {
                    this.handler.remove();
                }
                this.$parent.initToolStatus(this.value);
                this.defaultFont = new Font({
                    size: '18px',
                    weight: 'bold',
                    //family:'"Gill Sans", sans-serif'
                });
                this.defaultMarkSymbol = new SimpleMarkerSymbol({
                    style: 'circle',
                    color: 'red',
                    size: '7px',
                    outline: {
                        color: [255, 0, 0],
                        width: 1,
                    },
                });

                //初始化变量
                app.totalLenGraphic = null;
                this.tool.sketch.cancel();
                //清空临时图层
                app.graphicLengthLrc.graphics.removeAll();
                if (app.totalLenGraphic) {
                    app.graphicLengthLrc.graphics.remove(app.totalLenGraphic);
                }
                //重新初始化临时变量
                this.inputPt = new Array();
                this.totalDis = 0;

                if (this.toolStatus.length) {
                    this.tool.sketch.create('polyline', { mode: 'click' });
                }

                this.handler = this.tool.sketch.on('create', (evt) => {
                    this.handleLengthMeasure(evt);
                });

                //存入store
                this.lengthhandler(this.handler);
            } else {
                this.handleFocus(null);
                this.$parent.clearControl();
            }
        },

        handleLengthMeasure(evt) {
            if (evt.toolEventInfo && evt.toolEventInfo.type == 'vertex-add') {
                let pt = {
                    type: 'point',
                    x: evt.toolEventInfo.added[0][0],
                    y: evt.toolEventInfo.added[0][1],
                    spatialReference: this.mapview.spatialReference,
                };
                this.handleLengthPt(pt);
            }

            // 双击完成
            if (evt.state == 'complete') {
                this.inputPt = [];
                this.tool.sketch.complete();
                this.totalDis = 0;
            }
        },

        handleLengthPt(pt) {
            if (!this.toolStatus.length) {
                this.tool.sketch.cancel();
            }

            this.inputPt.push(pt);
            if (this.toolStatus.length) {
                let textSymbol;
                if (this.inputPt.length == 1) {
                    textSymbol = new TextSymbol({
                        text: '起点',
                        color: [255, 0, 0],
                        xoffset: 0,
                        yoffset: -20,
                    });
                    this.graphicLengthLrc.add(
                        new Graphic({ geometry: pt, symbol: textSymbol })
                    );
                }
                this.graphicLengthLrc.add(
                    new Graphic({
                        geometry: pt,
                        symbol: this.defaultMarkSymbol,
                    })
                );
                if (this.inputPt.length >= 2) {
                    let params = new LengthsParameters();
                    params.distanceUnit = 'meters';
                    params.calculationType = 'geodesic';
                    let p1 = this.inputPt[this.inputPt.length - 2];
                    let p2 = this.inputPt[this.inputPt.length - 1];
                    let polyline = new Polyline({
                        spatialReference: this.mapview.spatialReference,
                    });
                    // 添加坐标
                    polyline.addPath([
                        [p1.x, p1.y],
                        [p2.x, p2.y],
                    ]);
                    params.polylines = [polyline];

                    //线样式
                    let polylineSymbol = {
                        type: 'simple-line',
                        color: [255, 0, 0],
                        width: 2,
                    };

                    // 计算距离
                    geometryService
                        .lengths(this.geometryserviceURL, params)
                        .then(function (result) {
                            //debugger
                            app.graphicLengthLrc.add(
                                new Graphic({
                                    geometry: polyline,
                                    symbol: polylineSymbol,
                                })
                            );
                            //debugger
                            let dis = parseFloat(result.lengths[0]);
                            app.totalDis += dis;
                            let betweendis = dis.toFixed(2) + '米';
                            let distext = new TextSymbol({
                                text: betweendis,
                                font: app.defaultFont,
                                color: [255, 0, 0],
                                xoffset: 40,
                                yoffset: -3,
                            });
                            app.graphicLengthLrc.add(
                                new Graphic({ geometry: p2, symbol: distext })
                            );
                            if (app.totalLenGraphic) {
                                app.graphicLengthLrc.remove(
                                    app.totalLenGraphic
                                );
                            }
                            let total = parseFloat(app.totalDis).toFixed(2);
                            let totalSymbol = new TextSymbol({
                                text: `总长度${total}米`,
                                font: app.defaultFont,
                                color: [255, 0, 0],
                                xoffset: 40,
                                yoffset: -20,
                            });

                            var totalgraphic = new Graphic({
                                geometry: p2,
                                symbol: totalSymbol,
                            });
                            app.graphicLengthLrc.add(totalgraphic);
                        });
                }
            }
        },
    },
};
</script>

<style scoped lang="scss"></style>
