/*
 * @Author: WCL
 * @Date: 2021-11-16 16:42:5
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-10 15:08:14
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-21 12:13:06
 * @FilePath: \webgis\src\components\map\map2d\js\map2d.js
 * @Description: 地图2D-JS
 */

import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import Handles from "@arcgis/core/core/Handles";
import MapView from "@arcgis/core/views/MapView";
import BaseLayerView2D from "@arcgis/core/views/2d/layers/BaseLayerView2D";
import Layer from "@arcgis/core/layers/Layer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileInfo from "@arcgis/core/layers/support/TileInfo";
import * as projection from "@arcgis/core/geometry/projection";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import * as query from "@arcgis/core/rest/query";
import Query from "@arcgis/core/rest/support/Query";
import { getMapConfig } from "../api/map2d-api";
import { mapMutations, mapState } from "vuex";
import { GetBaseMapAreaLayers } from "@/utils/common-map-method";
import Point from '@arcgis/core/geometry/Point';
// import { graphic } from 'echarts';
let app;
export default {
	name: "",
	props: {
		leftMap: Object,
		rightMap: Object,
	},
	components: {},
	data() {
		return {
			leftMapView: null,
			rightMapView: null,
			legend: "",
			activeName: 0,
			handleVal: null,
		};
	},
	computed: {
		...mapState("map2d-store", [
			"legendDrawer",
			"showSplit",
			"toolStatus",
			"legendLaye",
		]),
	},
	watch: {
		leftMap(data) {
			console.log(data, "leftMap");
			this.initLeftSplitMap(data);
		},
		rightMap(data) {
			this.initRightSplitMap(data);
		},
	},
	created() {},
	mounted() {
		app = this;
		this.initMap();
	},
	methods: {
		...mapMutations("map2d-store", [
			"mapconfig",
			"mapview",
			"showLegend",
			"handleSplit",
			"handleFocus",
			"handLegend",
		]),
		// 获取地图配置
		// 初始化地图
		async initMap() {
			let params = {
				uid: window.sessionStorage.getItem(
					"userid"
				),
				modulename: "统一平台",
			};
			const { data: res } = await getMapConfig(
				params
			);
			if (res.code === 1) {
				let data = res.data;
				this.mapconfig(data);
				let mapwkid = data.MAPWKID;

				let centPoint = new Point({
                    x: data.CENTERX,
                    y: data.CENTERY,
                    spatialReference: {
                        wkid: mapwkid,
                    },
                });
                

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
						// minScale: 577791,
						rotationEnabled: false,
					},
					navigation: {
						momentumEnabled: false,
					},
					//zoom: 3,
					scale: mapParameters.scale,
					center:centPoint,
				});

				//是否对底图做蒙版
				if (isBaseMapCut) {
					GetBaseMapAreaLayers(view);
					view.background = {
						// autocasts new ColorBackground()
						color: [255, 255, 255, 1], // autocasts as new Color()
					};
				}
				console.log(view, "view");

				view.ui.remove(["attribution", "zoom"]);
				this.mapview(view);
			} else {
				this.$message.error(res.msg);
			}
		},
		// 初始化地图-掩膜
		async initMap1() {
			let params = {
				uid: window.sessionStorage.getItem(
					"userid"
				),
				modulename: "统一平台",
			};
			const { data: res } = await getMapConfig(
				params
			);
			if (res.code === 1) {
				let data = res.data;
				this.mapconfig(data);
				let mapwkid = data.MAPWKID;

				const CustomLayerView2D =
					BaseLayerView2D.createSubclass({
						constructor: function () {
							debugger;
							// Maps from tile id to the image used by that tile.
							this.tileContexts =
								new window.Map();

							// The handles to the property watchers; we need to store them
							// so that we can unwatch the properties when the layer view
							// is detached.
							this.watchHandles = new Handles();

							// Set to true when the images in the tiles have become obsolete
							// and must be regenerated. This is triggered by a change of
							// layer.geometry, layer.color or layer.distance.
							this.needsImageUpdate = false;
						},

						// Called when the layer is added to the map.
						attach: function () {
							debugger;
							const projectionPromise =
								projection.load();
							const layerView = this;
							const layer = layerView.layer;

							const handler = (
								[geometry, distance, color],
								[
									oldGeometry,
									oldDistance,
									oldColor,
								]
							) => {
								if (!layer.geometry) {
									layerView.projectedGeometry =
										null;
									layerView.needsImageUpdate = true;
									layerView.requestRender();
									return;
								}
								if (geometry !== oldGeometry) {
									projectionPromise.then(() => {
										layerView.projectedGeometry =
											projection.project(
												layer.geometry,
												layer.tileInfo
													.spatialReference,
												projection.getTransformation(
													layer.geometry
														.spatialReference,
													layer.tileInfo
														.spatialReference
												)
											);
										layerView.needsImageUpdate = true;
										layerView.requestRender();
									});
								} else {
									layerView.needsImageUpdate = true;
									layerView.requestRender();
								}
							};

							// Make sure that the effect is applied automatically at load time.
							handler(
								[
									this.layer.geometry,
									this.layer.distance,
									this.layer.color,
								],
								[null, null, null]
							);

							// Update and reapply the effect every time that the `geometry`, `distance`
							// or `color` properties on the layer change.
							this.watchHandles.add([
								reactiveUtils.watch(
									() => [
										this.layer.geometry,
										this.layer.distance,
										this.layer.color,
									],
									handler
								),
							]);
						},

						// Called to regenerate a tile.
						drawGeometry: function (ctx, bounds) {
							ctx.globalCompositeOperation =
								"source-over";
							const width = ctx.canvas.width;
							const height = ctx.canvas.height;

							// No geometry; entire map is unmasked.
							if (!this.projectedGeometry) {
								ctx.clearRect(
									0,
									0,
									width,
									height
								);
								return;
							}

							// We mask the entire map; we will "carve" the unmasked area using
							// an operation that subtracts opacity iteratively.
							const c = this.layer.color;
							ctx.fillStyle =
								"rgba(" +
								c[0] +
								", " +
								c[1] +
								", " +
								c[2] +
								", 1)";
							ctx.fillRect(0, 0, width, height);

							// Every iteration reduces opacity by a constant term and each iteration acts
							// on a progressively smaller region.
							// The factor "3" is fairly arbitrary, but it works well with "destination-out".
							// Lower values would cause a visible discontinuity between the fully illuminated
							// area and the beginning of the shaded area.
							const unmaskTerm =
								3 / this.layer.distance;
							ctx.globalCompositeOperation =
								"destination-out";

							if (
								this.projectedGeometry.type ===
									"polygon" ||
								this.projectedGeometry.type ===
									"polyline" ||
								this.projectedGeometry.type ===
									"extent"
							) {
								// Polygons, polylines and extents are carved using increasingly thinner lines
								// and a single fill operation at the end.

								// All geometry types are treated as rings.
								const rings =
									this.projectedGeometry.type ===
									"extent"
										? Polygon.fromExtent(
												this.projectedGeometry
										  ).rings
										: this.projectedGeometry
												.rings ||
										  this.projectedGeometry
												.paths;

								// Rings are transformed to tile coordinates.
								const transformed = rings.map(
									(ring) => {
										return ring.map((coords) => {
											return [
												Math.round(
													(width *
														(coords[0] -
															bounds[0])) /
														(bounds[2] -
															bounds[0])
												),
												Math.round(
													height *
														(1 -
															(coords[1] -
																bounds[1]) /
																(bounds[3] -
																	bounds[1]))
												),
											];
										});
									}
								);

								// The rings are drawn as increasingly thinner lines; this produces
								// a blurred edge around the unmasked area, so that transition from
								// unmasked to masked is gradual.
								ctx.lineJoin = "round";

								for (
									let r = 1;
									r <= this.layer.distance;
									++r
								) {
									ctx.strokeStyle =
										"rgba(0, 0, 0, " +
										unmaskTerm +
										")";
									ctx.lineWidth =
										this.layer.distance + 1 - r;

									for (
										let i = 0;
										i < transformed.length;
										++i
									) {
										const ring = transformed[i];

										ctx.beginPath();
										ctx.moveTo(
											ring[0][0],
											ring[0][1]
										);

										for (
											let j = 1;
											j < ring.length;
											++j
										) {
											ctx.lineTo(
												ring[j][0],
												ring[j][1]
											);
										}

										// If it's not a polyline, meaning it's a polygon or an extent,
										// we close the path.
										this.projectedGeometry
											.type !== "polyline" &&
											ctx.closePath();
										ctx.stroke();
									}
								}

								if (
									this.projectedGeometry.type !==
									"polyline"
								) {
									// If it's not a polyline, meaning it's a polygon or an extent,
									// we carve the space occupied by the geometry using a fill
									// operation; this is what fully unmask the geometry.
									ctx.fillStyle =
										"rgba(0, 0, 0, 1)";

									for (
										let i = 0;
										i < transformed.length;
										++i
									) {
										const ring = transformed[i];

										ctx.beginPath();
										ctx.moveTo(
											ring[0][0],
											ring[0][1]
										);

										for (
											let j = 1;
											j < ring.length;
											++j
										) {
											ctx.lineTo(
												ring[j][0],
												ring[j][1]
											);
										}

										ctx.closePath();
										ctx.fill();
									}
								}
							} else if (
								this.projectedGeometry.type ===
									"point" ||
								this.projectedGeometry.type ===
									"multipoint"
							) {
								// Points an multipoints are carved using increasingly smaller circles.

								// The "point" case is equivalent to a "multipoint" with a single point.
								const points =
									this.projectedGeometry.type ===
									"multipoint"
										? this.projectedGeometry
												.points
										: [
												[
													this.projectedGeometry
														.x,
													this.projectedGeometry
														.y,
												],
										  ];

								// Points are transformed to tile coordinates.
								const transformed = points.map(
									(coords) => {
										return [
											Math.round(
												(width *
													(coords[0] -
														bounds[0])) /
													(bounds[2] - bounds[0])
											),
											Math.round(
												height *
													(1 -
														(coords[1] -
															bounds[1]) /
															(bounds[3] -
																bounds[1]))
											),
										];
									}
								);

								// The points are drawn using increasingly smaller circles.
								for (
									let r = 1;
									r <= this.layer.distance;
									++r
								) {
									const size =
										this.layer.distance + 1 - r;
									ctx.fillStyle =
										"rgba(0, 0, 0, " +
										unmaskTerm +
										")";

									for (
										let i = 0;
										i < transformed.length;
										++i
									) {
										const point = transformed[i];
										ctx.beginPath();
										ctx.arc(
											point[0],
											point[1],
											Math.round(size / 2),
											0,
											360
										);
										ctx.fill();
									}
								}
							}
						},

						// Creates the images for new tiles that don't have a texture yet, and destroys the images
						// of tiles that are not on screen anymore.
						manageTileImages: function () {
							debugger;
							const gl = this.context;

							const tileIdSet = new Set();

							// Create new images as needed.
							for (
								let i = 0;
								i < this.tiles.length;
								++i
							) {
								const tile = this.tiles[i];
								tileIdSet.add(tile.id);

								let ctx = this.tileContexts.get(
									tile.id
								);

								if (ctx) {
									if (this.needsImageUpdate) {
										this.drawGeometry(
											ctx,
											tile.bounds
										);
									}
								} else {
									const canvas =
										document.createElement(
											"canvas"
										);
									canvas.width =
										this.layer.tileInfo.size[0];
									canvas.height =
										this.layer.tileInfo.size[1];
									ctx = canvas.getContext("2d");
									this.tileContexts.set(
										tile.id,
										ctx
									);
									this.drawGeometry(
										ctx,
										tile.bounds
									);
								}
							}

							// Destroys unneeded images.
							this.tileContexts.forEach(
								(_, id) => {
									if (!tileIdSet.has(id)) {
										this.tileContexts.delete(id);
									}
								}
							);

							this.needsImageUpdate = false;
						},

						// Example of a render implementation that draws tile boundaries.
						render: function (renderParameters) {
							debugger;
							this.manageTileImages();

							const tileSize =
								this.layer.tileInfo.size[0];
							const state =
								renderParameters.state;
							const pixelRatio = state.pixelRatio;
							const width = state.size[0];
							const height = state.size[1];
							const context =
								renderParameters.context;
							const coords = [0, 0];

							context.clearRect(
								0,
								0,
								width * pixelRatio,
								height * pixelRatio
							);

							// Apply rotation for everything that will be applied to the canvas.
							if (state.rotation !== 0) {
								context.translate(
									width * pixelRatio * 0.5,
									height * pixelRatio * 0.5
								);
								context.rotate(
									(state.rotation * Math.PI) / 180
								);
								context.translate(
									-width * pixelRatio * 0.5,
									-height * pixelRatio * 0.5
								);
							}

							// Set the style for all the text.
							context.globalAlpha =
								this.layer.color[3];

							for (
								let i = 0;
								i < this.tiles.length;
								++i
							) {
								// Retrieve the current tile and its associated texture.
								const tile = this.tiles[i];
								const ctx = this.tileContexts.get(
									tile.id
								);

								const screenScale =
									(tile.resolution /
										state.resolution) *
									pixelRatio;
								state.toScreenNoRotation(
									coords,
									tile.coords
								);
								context.drawImage(
									ctx.canvas,
									coords[0],
									coords[1],
									tileSize * screenScale,
									tileSize * screenScale
								);
							}
						},

						// Destroy the shader program, the buffers and all the tile images.
						detach: () => {
							debugger;
							this.watchHandles.removeAll();
						},

						// Required when using tiling; this methods is called every time that `this.tiles`
						// changes, to give the derived class a chance to perform per-tile work as needed;
						// This is where, for instance, tile data could be fetched from a server.
						tilesChanged: function () {},
					});

				const CustomLayer = Layer.createSubclass({
					tileInfo: TileInfo.create({
						size: 512,
						spatialReference: { wkid: 4549 },
					}),
					constructor: function () {
						debugger;
						this.geometry = null;
						this.distance = 10;
						this.color = [0, 0, 0, 1];
					},
					createLayerView: function (view) {
						debugger;
						if (view.type === "2d") {
							return new CustomLayerView2D({
								view: view,
								layer: this,
							});
						}
					},
					properties: {
						geometry: {},
						distance: {},
						color: {},
					},
				});

				const layer = new CustomLayer({
					distance: 25,
					color: [255, 255, 255, 0.2],
				});

				// 创建二维底图
				let baselayer = null;
				if (data.TYPE == "Image") {
					baselayer = new MapImageLayer({
						url: data.URL,
						id: "basemap_layer",
						sublayers: [],
					});
				} else if (data.TYPE == "Tile") {
					baselayer = new TileLayer({
						url: data.URL,
						id: "basemap_layer",
						// sublayers:[{
						//     id:0,
						//     definitionExpression:"" //对区域做筛查
						// }]
					});
				}
				let basemap = new Basemap({
					baseLayers: [baselayer],
					title: "basemap",
					id: "basemap",
				});

				let map = new Map({
					basemap: basemap,
					layers: [layer],
				});

				let view = new MapView({
					map: map,
					container: "map",
					constraints: {
						// minScale: 577791,
						rotationEnabled: false,
					},
					navigation: {
						momentumEnabled: false,
					},
					//zoom: 3,
					scale: mapParameters.scale,
				});

				console.log(view, "view");

				var queryParams = new Query();
				queryParams.where = "XZQDM='350181119'";
				queryParams.returnGeometry = true;
				queryParams.outFields = ["*"];
				query
					.executeQueryJSON(
						"http://202.101.128.22:8887/arcgis/rest/services/XZQY_ZJ/MapServer/0",
						queryParams
					)
					.then(function (result) {
						if (result.features.length > 0) {
							debugger;
							const geometries = [
								// The loaded geometry.
								result.features[0].geometry,
							];
							let i = 0;
							function next() {
								layer.geometry = geometries[i];
								if (layer.geometry) {
									view
										.goTo(layer.geometry)
										.catch((error) => {
											debugger;
											if (
												error.name !==
												"AbortError"
											) {
												console.error(error);
											}
										});
								}
								// Switch to the next geometry in 3 seconds.
								// i = (i + 1) % geometries.length;
								// setTimeout(next, 3000);
							}

							next();
							// layer.geometry = geometries[i];
							// if (layer.geometry) {
							//     view.goTo(layer.geometry).catch((error) => {
							//         if (error.name !== "AbortError") {
							//             console.error(error);
							//         }
							//     });
							// }
						}
					});

				view.ui.remove(["attribution", "zoom"]);
				this.mapview(view);
			} else {
				this.$message.error(res.msg);
			}
		},
		//初始化分屏地图
		initLeftSplitMap(data) {
			//debugger;
			// 创建二维底图
			//let baselayer = null;
			let basemap = new Basemap({
				baseLayers: [],
				title: "splitleft_basemap",
				id: "splitleft_basemap",
			});

			let map = new Map({
				basemap: basemap,
			});
			//左侧分屏初始化
			this.leftMapView = new MapView({
				map: map,
				container: "leftMap_map",
				constraints: {
					minScale: 577791,
					rotationEnabled: false,
				},
				navigation: {
					momentumEnabled: false,
				},
				zoom: 3,
			});
			this.leftMapView.ui.remove([
				"attribution",
				"zoom",
			]);
			this.loadSplitLayer(data, this.leftMapView);
			//   let leftview = this.leftMapView;
			//   let rightview = this.rightMapView;
			//监听地图改变事件
			app.leftMapView.watch("scale", function () {
				//debugger;
				console.log(
					"地图范围变化1" + app.leftMapView
				);
				if (
					app.rightMapView != undefined &&
					app.rightMapView != null
				) {
					app.rightMapView.extent =
						app.leftMapView.extent;
				}
			});

			//平移
			app.leftMapView.on("drag", function () {
				if (
					app.rightMapView != undefined &&
					app.rightMapView != null
				) {
					app.rightMapView.extent =
						app.leftMapView.extent;
				}
			});
		},
		initRightSplitMap(data) {
			//debugger;
			// 创建二维底图
			//let baselayer = null;
			let basemap = new Basemap({
				baseLayers: [],
				title: "splitright_basemap",
				id: "splitright_basemap",
			});

			let map = new Map({
				basemap: basemap,
			});
			//左侧分屏初始化
			this.rightMapView = new MapView({
				map: map,
				container: "rightMap_map",
				constraints: {
					minScale: 577791,
					rotationEnabled: false,
				},
				navigation: {
					momentumEnabled: false,
				},
				zoom: 3,
			});
			this.rightMapView.ui.remove([
				"attribution",
				"zoom",
			]);
			this.loadSplitLayer(
				data,
				this.rightMapView
			);

			//   let leftview = this.leftMapView;
			//   let rightview = this.rightMapView;
			//监听地图改变事件
			app.rightMapView.watch(
				"scale",
				function () {
					//debugger;
					console.log(
						"地图范围变化1" +
							app.rightMapView.zoom
					);
					if (
						app.leftMapView != undefined &&
						app.leftMapView != null
					) {
						app.leftMapView.extent =
							app.rightMapView.extent;
					}
				}
			);

			//平移
			app.rightMapView.on("drag", function () {
				if (
					app.leftMapView != undefined &&
					app.leftMapView != null
				) {
					app.leftMapView.extent =
						app.rightMapView.extent;
				}
			});
		},
		//加载分屏图层
		loadSplitLayer(data, view) {
			view.map.layers.removeAll();
			if (data.data.level == "server") {
				var layers = data.data.childlist;
				if (layers.length > 0) {
					var sublayers = [];

					for (
						let i = 0;
						i < layers.length;
						i++
					) {
						const obj = layers[i];
						sublayers.push({
							id: obj.id,
							visible: true,
						});
					}
					switch (data.data.kind) {
						case 1:
							var layer = new MapImageLayer({
								id: data.data.label,
								url: data.data.url,
								sublayers: sublayers,
								visible: true,
							});
							view.map.add(layer, 0);
							break;
						case 5:
							var layer = new TileLayer({
								id: data.data.label,
								url: data.data.url,
								visible: true,
							});
							view.map.add(layer, 0);
							break;
					}
				} else {
					switch (data.data.kind) {
						case 1:
							var layer = new MapImageLayer({
								id: data.data.label,
								url: data.data.url,
								visible: true,
							});
							view.map.add(layer, 0);
							break;
						case 5:
							var layer = new TileLayer({
								id: data.data.label,
								url: data.data.url,
								visible: true,
							});
							view.map.add(layer, 0);
							break;
					}
				}
			}
			if (data.data.level == "layer") {
				var obj = data.data;
				var layer = new MapImageLayer({
					id: obj.label,
					url: obj.url,
					visible: true,
					sublayers: [
						{
							id: obj.id,
							visible: true,
						},
					],
				});
				view.map.add(layer, 0);
			}
		},
		// 关闭图例
		legendClose() {
			this.showLegend(false);
			this.handleFocus(null);
			for (const key in this.toolStatus) {
				this.toolStatus[key] = false;
			}
		},
		// 关闭分屏
		closeSplit() {
			this.handleSplit(false);
		},
		// 图例
		handleChange(val) {
			console.log(val.length, "val");
			this.handleVal = val.length;
		},
	},
};
