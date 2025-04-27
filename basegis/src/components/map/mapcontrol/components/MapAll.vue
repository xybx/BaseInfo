<!--
 * @Author: WCL
 * @Date: 2021-11-19 11:23:47
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-21 09:43:29
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapAll.vue
 * @Description: 地图控制-全图
-->
<template>
    <div class="">
        <el-button
            @click="clickCtrlBtn"
            size="small"
            :class="[{ focusBtn: focusBtn == value }, value]"
        >
            <i class="el-icon-picture-outline"></i>
            <span>全图</span>
        </el-button>
    </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import Point from '@arcgis/core/geometry/Point';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            value: 'all',
        };
    },
    computed: {
        ...mapState('map2d-store', [
            'mapconfig',
            'mapview',
            'focusBtn',
            'toolStatus',
        ]),
    },
    watch: {},
    created() {},
    mounted() {},
    methods: {
        ...mapMutations('map2d-store', ['handleFocus']),

        clickCtrlBtn() {
            debugger
            this.handleFocus(this.value);
            this.toolStatus[this.value] = !this.toolStatus[this.value];
            if (this.toolStatus[this.value] && this.focusBtn == this.value) {
                this.$parent.clearControl();
                this.$parent.initToolStatus(this.value);
                let centPoint = new Point({
                    x: this.mapconfig.CENTERX,
                    y: this.mapconfig.CENTERY,
                    spatialReference: {
                        wkid: this.mapconfig.MAPWKID,
                    },
                });
                this.mapview.center = centPoint;
                this.mapview.scale = mapParameters.scale;
                //this.mapview.zoom = 3
				console.log(mapParameters.scale);
                console.log(this.mapview.center, 'centPoint');
                console.log(this.mapview.scale, 'scale');
            } else {
                this.handleFocus(null);
                this.$parent.clearControl();
            }
        },
    },
};
</script>

<style scoped lang="scss"></style>
