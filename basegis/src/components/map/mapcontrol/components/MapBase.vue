<!--
 * @Author: WCL
 * @Date: 2021-11-19 11:38:38
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-22 10:35:54
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapBase.vue
 * @Description: 地图控制-底图
-->
<template>
    <div class="">
        <el-popover
            placement="right"
            trigger="click"
            popper-class="baseline-box"
        >
            <div class="baseline-map">
                <div
                    class="online-item"
                    v-for="(item, index) in onlineList"
                    :key="index"
                >
                    <div
                        class="online-bd"
                        @click="clickOnline(item)"
                        :class="item.click ? 'focusBorder' : ''"
                    >
                        <img :src="item.url" alt="" />
                        <span
                            class="text"
                            :class="item.click ? 'focusOnline' : ''"
                            >{{ item.text }}</span
                        >
                    </div>
                </div>
            </div>
            <el-button
                slot="reference"
                class="basemap"
                icon="el-icon-c-scale-to-original"
                size="small"
                >底图</el-button
            >
        </el-popover>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            onlineList: [
                {
                    url: require('@/assets/images/map-images/online_one.jpg'),
                    text: '电子底图',
                    click: true,
                    func: 'toggleBaseMap',
                },
                {
                    url: require('@/assets/images/map-images/online_two.jpg'),
                    text: '影像图',
                    click: false,
                    func: 'toggleImgLayer',
                },
            ],
        };
    },
    computed: {
        ...mapState('map2d-store', ['mapview']),
    },
    watch: {},
    created() {},
    mounted() {},
    methods: {
        clickOnline(item) {
            this.onlineList.map((el) => {
                if (el.text == item.text) {
                    el.click = true;
                    this[el.func](el.click);
                } else {
                    el.click = false;
                    this[el.func](el.click);
                }
            });
        },

        // 切换电子底图
        toggleBaseMap(boo) {
            let baseLayer = this.mapview.map.findLayerById('basemap_layer');
            if (baseLayer) {
                baseLayer.visible = boo;
            }
        },

        // 切换影像图
        toggleImgLayer(visible) {
            let baseLayer = this.mapview.map.findLayerById(yxtLayerName);
            let yxBaseLayer = this.mapview.map.findLayerById('yxbaselayer');
            if (yxBaseLayer) {
                yxBaseLayer.visible = visible;
            } else {
                let yxBaseLayer = new MapImageLayer({
                    id: 'yxbaselayer',
                    url: baseLayer.url,
                });
                debugger;
                this.mapview.map.basemap.baseLayers.add(yxBaseLayer);
                yxBaseLayer.visible = visible;
            }
        },
    },
};
</script>

<style scoped lang="scss">
.baseline-map {
    .online-item {
        display: inline-block;
        float: right;
        width: 6vw;
        height: 100%;
        box-sizing: border-box;
        padding: 8px;
        color: #fff;
        line-height: 1;
        img {
            display: block;
            width: 100%;
            height: 100%;
        }
    }
    .online-bd {
        height: 100%;
        position: relative;
        cursor: pointer;
        transition: 0.3s;
        border: 2px solid transparent;
        .text {
            position: absolute;
            right: 0;
            bottom: 0;
            padding: 3px 5px;
            transition: 0.3s;
        }
        .focusOnline {
            background-color: $el-main-color;
        }
        &:hover {
            border: 2px solid $el-main-color;
            .text {
                background-color: $el-main-color;
            }
        }
    }
    .focusBorder {
        border: 2px solid $el-main-color;
    }
}
</style>
