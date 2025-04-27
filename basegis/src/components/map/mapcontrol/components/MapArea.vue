<!--
 * @Author: WCL
 * @Date: 2021-11-19 11:25:14
 * @LastEditors: WCL
 * @LastEditTime: 2022-12-29 16:49:38
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapArea.vue
 * @Description: 地图控制-面积
-->
<template>
    <div class="">
        <el-button
            @click="clickCtrlBtn"
            size="small"
            :class="[{ focusBtn: focusBtn == value }, value]"
        >
            <i class="el-icon-c-scale-to-original"></i>
            <span>面积</span>
        </el-button>
    </div>
</template>

<script>
import Graphic from '@arcgis/core/Graphic';
import AreasAndLengthsParameters from '@arcgis/core/rest/support/AreasAndLengthsParameters';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Font from '@arcgis/core/symbols/Font';
import Point from '@arcgis/core/geometry/Point';
import { mapState, mapMutations } from 'vuex';
import { getMapGeometryService } from './api/control-api';
import * as geometryService from '@arcgis/core/rest/geometryService';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            value: 'area',
            defaultFont: null,
            defaultMarkSymbol: null,
        };
    },
    computed: {
        ...mapState('map2d-store', [
            'toolStatus',
            'tool',
            'mapview',
            'graphicLengthLrc',
            'symbol',
            'focusBtn',
        ]),
    },
    watch: {},
    created() {},
    mounted() {},
    methods: {
        ...mapMutations('map2d-store', ['handleFocus']),

        clickCtrlBtn() {
            this.handleFocus(this.value);
            this.toolStatus[this.value] = !this.toolStatus[this.value];
            if (this.toolStatus[this.value] && this.focusBtn == this.value) {
                this.$parent.clearControl();

                this.$parent.initToolStatus(this.value);
                this.defaultFont = new Font({
                    size: '18px',
                    weight: 'bolder',
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
                this.totalDis = 0;
                if (this.toolStatus.area) {
                    this.tool.sketch.create('polygon', { mode: 'click' });
                }
                this.tool.sketch.on('create', (evt) => {
                    this.handleAreaMeasure(evt);
                });
            } else {
                this.handleFocus(null);
                this.$parent.clearControl();
            }
        },
        // 测量面积
        async handleAreaMeasure(evt) {
            if (evt.state == 'complete') {
                let geometry = evt.graphic.geometry;
                let params = new AreasAndLengthsParameters();
                let geoservice;
                let user = {
                    uid: window.sessionStorage.getItem('userid'),
                };
                const { data: res } = await getMapGeometryService(user);
                if (res.code != 1) return this.$message.warning(res.msg);
                params.lengthUnit = 'meters';
                params.areaUnit = 'square-meters';
                params.calculationType = 'geodesic';
                const simplifiedGeo = await geometryService.simplify(
                    res.data.MAPGEOMETRYSERVICEURL,
                    [geometry]
                );
                params.polygons = simplifiedGeo;
                const result = await geometryService.areasAndLengths(
                    res.data.MAPGEOMETRYSERVICEURL,
                    params
                );
                this.graphicLengthLrc.add(
                    new Graphic({ geometry, symbol: this.symbol })
                );
                let font = new Font({
                    size: '18px',
                });
                let totalarea = parseFloat(result.areas[0].toFixed(0));
                let areaMu = parseFloat(result.areas[0] * 0.0015).toFixed(2);
                let areaGQ = parseFloat(result.areas[0] * 0.0001).toFixed(2);
                let areaRes = new TextSymbol({
                    text: `${totalarea}平方米\n${areaMu}亩\n${areaGQ}公顷`,
                    font,
                    color: [255, 0, 0],
                });
                let pt = new Point({
                    x: geometry.centroid.x,
                    y: geometry.centroid.y,
                    spatialReference: this.mapview.spatialReference,
                });
                this.graphicLengthLrc.add(
                    new Graphic({ geometry: pt, symbol: areaRes })
                );
                this.tool.sketch.complete();
            }
        },
    },
};
</script>

<style scoped lang="scss"></style>
