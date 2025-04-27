/*
 * @Author: WCL
 * @Date: 2021-11-16 16:57:33
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-24 17:58:04
 * @FilePath: \webgis\src\components\map\mapcontrol\js\mapcontrol.js
 * @Description: 地图控制条组装JS
 */
import { mapState, mapMutations } from "vuex";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Zoom from "@arcgis/core/widgets/Zoom";
import Sketch from "@arcgis/core/widgets/Sketch";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import AttrPopup from "../components/map-attr/vue/AttrPopup.vue";
import path from "path";

// 批量导入组件
const ctrlComs = require.context(
	"../components",
	false,
	/\.vue$/
);
const resComs = {};
ctrlComs.keys().forEach((key) => {
	const name = path.basename(key, ".vue");
	resComs[name] =
		ctrlComs(key).default || ctrlComs(key);
});
Object.assign(resComs, { AttrPopup });

export default {
	name: "",
	props: {},
	components: resComs,
	data() {
		return {
			switchIcon:
				"iconfont icon-tool-cabinet_icon",
			showList: true,
			view: {},
			showAttr: false,
			open3DStatus: open3D,
			openBaseMapStatus: OpenBaseMap,
		};
	},
	computed: {
		...mapState("map2d-store", [
			"mapview",
			"toolStatus",
			"tool",
			"lengthAreahandler",
			"graphicLengthLrc",
		]),
	},
	watch: {
		mapview: {
			handler(val) {
				this.initTool();
			},
		},
	},
	created() {},
	mounted() {},
	methods: {
		...mapMutations("map2d-store", [
			"toolView",
			"graphicLength",
			"lengthhandler",
			"showLegend",
			"attrdialogstatus",
		]),
		// 控制按钮点击
		switchBtn() {
			this.showList = !this.showList;
		},

		// 初始化工具条
		initTool() {
			let graphicLengthLrc = new GraphicsLayer({
				id: "lengthLrc",
			});
			let view = this.view;
			view.zoom = new Zoom({
				view: this.mapview,
			});

			view.sketch = new Sketch({
				layer: graphicLengthLrc,
				view: this.mapview,
			});

			view.sketch_small = new Sketch({
				layer: graphicLengthLrc,
				view: this.mapview,
			});

			this.mapview.map.add(graphicLengthLrc);
			this.toolView(view);
			this.graphicLength(graphicLengthLrc);

			//微件存入全局变量
		},

		// 底图工具栏操作符状态
		initToolStatus(name) {
			//初始化所有工具条监听事件
			if (this.lengthAreahandler != null) {
				this.lengthAreahandler.remove();
			}

			this.tool["sketch"].cancel();
			// this.tool["sketch_small"].cancel();
			for (const key in this.toolStatus) {
				if (key != name) {
					if (
						key == "splitscreen" &&
						this.toolStatus.splitscreen
					) {
						this.toolStatus.splitscreen = true;
					} else {
						this.toolStatus[key] = false;
					}
				} else {
					this.toolStatus[key] = true;
				}
			}
		},

		// 工具-属性
		showAttrPopup(boo) {
			this.showAttr = boo;
		},

		// 通用清除
		clearControl() {
			for (const key in this.toolStatus) {
				this.toolStatus[key] = false;
			}
			this.tool.sketch.cancel();
			this.tool.sketch_small.cancel();
			this.mapview.graphics.removeAll();
			// 清空绘制图层
			this.graphicLengthLrc.removeAll();
			// 关闭图例
			this.showLegend(false);
			// 属性
			this.attrdialogstatus(false);
			if (this.mapview.viewClick != null) {
				this.mapview.viewClick.remove();
			}
		},
	},
};
