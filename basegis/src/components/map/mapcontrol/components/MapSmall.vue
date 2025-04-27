<!--
 * @Author: WCL
 * @Date: 2021-11-17 09:24:55
 * @LastEditors: WCL
 * @LastEditTime: 2022-02-28 13:47:15
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapSmall.vue
 * @Description: 地图控制-缩小
-->
<template>
    <div>
        <el-button
            @click="clickCtrlBtn"
            size="small"
            :class="[{ focusBtn: focusBtn == value }, value]"
        >
            <i class="el-icon-zoom-out"></i>
            <span>缩小</span>
        </el-button>
    </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            value: 'small',
        };
    },
    computed: {
        ...mapState('map2d-store', [
            'tool',
            'toolStatus',
            'graphicLengthLrc',
            'focusBtn',
            'mapview',
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
                this.tool.sketch_small.create('rectangle', {
                    mode: 'freehand',
                });
                this.tool.sketch_small.on('create', (event) => {
                    if (event.state === 'complete') {
                        console.log(this.tool.zoom, 'this.tool.zoom');
                        // if (this.mapview.zoom > 0) {
                            this.tool.zoom.zoomOut();
                        // }
                        this.tool.sketch_small.complete();
                        this.graphicLengthLrc.removeAll();
                        console.log(this.mapview, 'mapview');
                    }
                });
            } else {
                this.handleFocus(null);
                this.$parent.clearControl();
            }
        },
    },
};
</script>

<style scoped lang="scss"></style>
