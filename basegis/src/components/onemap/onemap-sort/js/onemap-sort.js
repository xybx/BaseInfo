/*
 * @Author: WCL
 * @Date: 2022-02-16 17:05:53
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-24 17:42:25
 * @FilePath: \webgis\src\components\onemap\onemap-wiki\js\onemap-wiki.js
 * @Description: 知识库JS
 */
import { mapMutations, mapState } from "vuex";
import { getAllOpenLayers } from "@/utils/common-map-method.js";
export default {
  name: "",
  props: {},
  components: {},
  data() {
    return {
      dialogVisible: false,
      comTitle: "",
      treeData: [],
      defaultProps: {
        children: "CHILDREN",
        label: "LABEL",
      },
    };
  },
  computed: {
    ...mapState("map2d-store", [
      "mapview",
      "maptype",
      "showSplit",
      "allTreeLayers",
    ]),
  },
  watch: {
    dialogVisible(boo) {
      if (boo) {
        // this.getTreeData();
      }
    },
  },
  created() {},
  mounted() {},
  methods: {
    ...mapMutations("onemap-store", ["handleOnemapPopup", "handleToggleIndex"]),
    // 打开弹窗
    showDialog(obj) {
      //获取已叠加图层
      this.treeData = getAllOpenLayers();
      console.log(this.mapview, "mapview");
      this.treeData = this.sortKey(this.treeData, "index");

      console.log("checkLayers", this.treeData);
      if (this.treeData.length > 0) {
        this.comTitle = obj.title;
        this.dialogVisible = true;
        this.handleToggleIndex(false);
      }
    },

    // 关闭弹窗
    closeDialog() {
      this.handleOnemapPopup({ code: "init" });
      this.handleToggleIndex(true);
      this.dialogVisible = false;
      //this.mapview.map.removeAll();

      //关闭已打开的图层
      for (let i = 0; i < this.treeData.length; i++) {
        const layeritem = this.treeData[i];
        let layer = this.mapview.map.findLayerById(layeritem.layername);
        if (!layer) {
          layer.visible = false;
        }
      }
      this.$emit("resetChecked");
    },

    closeLayer(data) {
      debugger;
      let layer = this.mapview.map.findLayerById(data.layername);
      if (layer) {
        layer.visible = false;
      }
      this.treeData = getAllOpenLayers();
      this.treeData = this.sortKey(this.treeData, "index");
      console.log(this.treeData, "data");

      // this.$parent.$refs.treeAll.setCheckedNodes(idList);
      //console.log(this.$parent.$refs.treeAll,"this.$parent.$refs.treeAll");
      this.$emit("colseLayer", layer.id);
    },

    handleDragStart(node, ev) {
      //console.log('drag start', node);
    },
    handleDragEnter(draggingNode, dropNode, ev) {
      //return false;
      //console.log('tree drag enter: ', dropNode.data.layername, draggingNode.data.layername);
    },
    handleDragLeave(draggingNode, dropNode, ev) {
      //return false;
      //console.log('tree drag leave: ', dropNode.data.layername, draggingNode.data.layername);
    },
    handleDragOver(draggingNode, dropNode, ev) {
      //console.log('tree drag over: ', dropNode.data.layername, draggingNode.data.layername);
    },
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      //调整图层顺序
      //拖拽的图层
      let dragLayer = this.mapview.map.findLayerById(
        draggingNode.data.layername
      );
      console.log(dragLayer, "dragLayer");
      const dragindex = this.mapview.map.allLayers.items.findIndex(function (
        val
      ) {
        return val.id === draggingNode.data.layername;
      });
      //目标图层
      let toLayer = this.mapview.map.findLayerById(dropNode.data.layername);
      const toindex = this.mapview.map.allLayers.items.findIndex(function (
        val
      ) {
        return val.id === dropNode.data.layername;
      });
      this.mapview.map.reorder(dragLayer, toindex);
      console.log("index", dropType, dragindex, toindex);
      console.log(toLayer, "toLayer");
      // //向前调整顺序
      // if (dropType == "before") {

      // }
      // //向后调整顺序
      // if (dropType == "after") {

      // }
      console.log(
        "tree drag end: ",
        draggingNode,
        dropNode && dropNode.data.layername,
        dropType
      );
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      //console.log('tree drop: ', dropNode.data.layername, dropType);
    },
    allowDrop(draggingNode, dropNode, type) {
      if (type === "inner") {
        return false;
      } else {
        return true;
      }
      // if (dropNode.data.layername != dropNode.data.layername) {
      //   return type !== 'inner';
      // } else {
      //   return true;
      // }
    },
    allowDrag(draggingNode) {
      //console.log(draggingNode, "draggingNode");
      //return draggingNode.data.layername.indexOf('三级 3-2-2') === -1;
      return true;
    },
    //排序
    sortKey(array, key) {
      return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return x > y ? -1 : x < y ? 1 : 0;
      });
    },
  },
};
