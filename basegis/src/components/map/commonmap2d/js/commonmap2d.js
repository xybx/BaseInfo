/*
 * @Author: WCL
 * @Date: 2021-11-16 16:42:53
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-10 15:08:11
 * @FilePath: \webgis\src\components\map\commonmap2d\js\commonmap2d.js
 * @Description: 公用地图2D-JS
 */

import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import { getMapConfig } from "@/components/map/map2d/api/map2d-api";
import { mapMutations, mapState } from "vuex";
let app;
export default {
	name: "",
	props: {
		modulename: String,
		layer: Object,
		funType: Number, //0:不做操作，1:叠加图层，2:定位
		Geo: Object, //定位的图形
	},
	components: {},
	data() {
		return {
			legendSrc: require("@/assets/images/map-images/legend.png"),
			view: null,
		};
	},
	computed: {
		...mapState("map2d-store", ["symbol"]),
	},
	watch: {
		layer(data) {
			console.log(data, "layer");
			if (this.funType == 1) {
				this.visbleLayer(data);
			}
		},
		Geo(data) {
			debugger;
			if (this.funType == 2) {
				this.location(data);
			}
		},
	},
	created() {},
	mounted() {
		app = this;
		this.setSymbol(); //初始化渲染图形
		this.initMap();
		//this.initSplitMap();
	},
	methods: {
		...mapMutations("map2d-store", ["setSymbol"]),
		// 初始化地图
		async initMap() {
			let params = {
				uid: window.sessionStorage.getItem(
					"userid"
				),
				modulename: this.modulename,
			};
			// 获取地图配置
			const { data: res } = await getMapConfig(
				params
			);
			if (res.code === 1) {
				let data = res.data;
				//this.mapconfig(data);

				// 创建二维底图
				let baselayer = null;
				if (data.TYPE == "Image") {
					baselayer = new MapImageLayer({
						url: data.URL,
						id: "basemap_layer",
					});
				} else if (data.TYPE == "Tile") {
					baselayer = new TileLayer({
						url: data.URL,
						id: "basemap_layer",
					});
				}
				let basemap = new Basemap({
					baseLayers: [baselayer],
					title: "basemap",
					id: "basemap",
				});

				let map = new Map({
					basemap: basemap,
				});

				let view = new MapView({
					map: map,
					container: "map",

					constraints: {
						minScale: 577791,
						rotationEnabled: false,
					},
					navigation: {
						momentumEnabled: false,
					},
					zoom: 3,
				});

				view.ui.remove(["attribution", "zoom"]);
				this.view = view;
				//this.mapview(view);
			} else {
				this.$message.error(res.msg);
			}
		},
		//叠加，移除图层
		visbleLayer(data) {
			if (this.view != null) {
				this.view.map.layers.removeAll();
				var layer = this.view.map.findLayerById(
					data.id
				);
				if (layer != null) {
					this.view.map.remove(layer);
				} else {
					var url = data.url.substr(
						0,
						data.url.lastIndexOf("MapServer") +
							"MapServer".length
					);
					var sublayerid = data.url.substr(
						data.url.lastIndexOf("MapServer") +
							"MapServer".length +
							1,
						data.url.length - url.length - 1
					);
					//console.log(url,"url");
					layer = new MapImageLayer({
						id: data.id,
						url: url,
						visible: true,
						sublayers: [
							{
								id: sublayerid,
								visible: true,
							},
						],
					});
					this.view.map.add(layer, 0);
					//console.log(this.view);
				}
			} else {
				this.$message.error("地图加载失败");
			}
		},
		//定位
		location(data) {
			//debugger;
			this.view.graphics.removeAll();
			let graphic = new Graphic({
				geometry: data,
				symbol: this.symbol,
			});
			this.view.graphics.add(graphic);
			this.view.extent = graphic.geometry.extent;
		},
	},
};
