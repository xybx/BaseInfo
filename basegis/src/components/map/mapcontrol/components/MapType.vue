<!--
 * @Author: sgz
 * @Date: 2021-11-24 10:47:13
 * @LastEditors: sgz
 * @LastEditTime: 2021-12-01 10:39:40
 * @FilePath: \fq-wclf:\国土空间规划\标准版版本\wcl-standard\webgis\src\components\map\mapcontrol\components\MapType.vue
 * @Description: 二三维模型切换
-->

<template>
  <div class="">
    <el-button @click="clickCtrlBtn" size="small">
      <i class="el-icon-picture-outline"></i>
      <span v-if="maptype === 2">三维</span>
      <span v-if="maptype === 3">二维</span>
    </el-button>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import Point from "@arcgis/core/geometry/Point";
export default {
  name: "",
  props: {},
  components: {},
  data() {
    return {
      //maptype:2
    };
  },
  computed: {
    ...mapState("map2d-store", ["tool", "toolStatus", "maptype"]),
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    ...mapMutations("map2d-store", ["setmaptype"]),
    clickCtrlBtn() {
      this.$parent.initToolStatus(this.value);
      // todo 未完
      if (this.maptype === 2) {
        this.setmaptype(3);
      } else {
        this.setmaptype(2);
      }
    },
  },
};
</script>

<style scoped lang="scss">
</style>
