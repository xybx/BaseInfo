/*
 * @Author: WCL
 * @Date: 2021-11-16 10:00:25
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 11:38:38
 * @FilePath: \webgis\src\views\onemap_szxc\js\onemap.js
 * @Description: 一张图JS
 */
import MapControl from "@/components/map/mapcontrol/vue/MapControl.vue";
import Map2D from "@/components/map/map2d/vue/Map2D.vue";
import LayerTree from "@/plugins/layer-tree/src/tree.vue";
import {
	getMenuList,
	getUserMenu,
	getServer,
	addCollection,
	cancleCollection,
} from "../api/onemap-api";
import { mapState, mapMutations } from "vuex";
import {
	loadtreelayer,
	visiblelayer,
	visibleSublayer,
	layeropacity,
	collectServer,
} from "../../../utils/treemap";
import path from "path";
// 组件批量导入
const mapComs = require.context(
	"@/components/onemap",
	true,
	/\.vue$/
);
const resComs = {};
mapComs.keys().forEach((key) => {
	const name = path.basename(key, ".vue");
	resComs[name] =
		mapComs(key).default || mapComs(key);
});
Object.assign(resComs, {
	MapControl,
	LayerTree,
	Map2D,
});

export default {
	name: "",
	props: {},
	components: resComs,
	data() {
		return {
			focusTab: "all",
			filterOftenText: "",
			filterAllText: "",
			treeOftenList: [],
			treeAllList: [],
			allLoading: true,
			oftenLoading: true,
			defaultProps: {
				children: "childlist",
				label: "label",
				isLeaf: "isLeaf",
			},
			showTree: true,
			splitMap_Left_Data: null, //分屏地图左侧地图数据
			splitMap_Right_Data: null, //分屏地图右侧地图数据
			defaultCheckArr: [],
			defaultExpendArr: [],
		};
	},
	computed: {
		...mapState("map2d-store", [
			"mapview",
			"maptype",
			"showSplit",
		]),
		...mapState("onemap-store", [
			"onemapPopup",
			"toggleIndex",
		]),
	},
	watch: {
		// 常用图层搜索监听
		filterOftenText(val) {
			this.$refs.treeOften.filter(val);
		},
		// 所有图层搜索监听
		filterAllText(val) {
			this.$refs.treeAll.filter(val);
		},
		// 打开弹窗组件
		onemapPopup(obj) {
			this.mapview.graphics.removeAll();
			let arr = Object.keys(this.$refs);
			arr.map((item) => {
				if (this.$refs[item].dialogVisible) {
					this.$refs[item].dialogVisible = false;
				}
			});
			console.log(obj, "弹窗ID");
			console.log(
				this.toggleIndex,
				"toggleIndex"
			);
			debugger;

			switch (obj.code) {
				// 查询定位
				case "onemap103":
					this.$refs.locate.showDialog(obj);
					break;
				// 知识库
				case "onemap104":
					this.$refs.wiki.showDialog(obj);
					break;
				// 关闭
				case "init": {
					this.handleToggleIndex(false);
					break;
				}
				default: {
					this.$message.warning("功能开发中");
					setTimeout(() => {
						this.handleOnemapPopup({
							code: "init",
						});
						this.handleToggleIndex(true);
					}, 3000);
					break;
				}
			}
		},
	},
	created() {},
	mounted() {
		this.getAllTree();
		this.getOftenTree();
	},
	methods: {
		...mapMutations("onemap-store", [
			"handleOnemapPopup",
			"handleToggleIndex",
		]),
		...mapMutations("map2d-store", [
			"cleartableData",
		]),

		// 获取全部图层列表
		async getAllTree() {
			let params = {
				uid: window.sessionStorage.getItem(
					"userid"
				),
				grouptype: 2,
			};
			const { data: res } = await getMenuList(
				params
			);
			if (res.code === 1) {
				console.log(res, "treeres");

				this.treeAllList = res.data.menus;
				this.defaultCheckArr =
					res.data.defaultShowLayers;
				this.defaultExpendArr = [
					...res.data.defaultParentKeyIds,
					...res.data.defaultShowLayers,
				];
				this.allLoading = false;

				//加载树形地图图层
				loadtreelayer(res.data.menus);
			} else {
				this.$message.error(res.msg);
			}
		},
		// 获取常用图层列表
		async getOftenTree() {
			let params = {
				uid: window.sessionStorage.getItem(
					"userid"
				),
			};
			const { data: res } = await getUserMenu(
				params
			);
			if (res.code === 1) {
				this.treeOftenList = res.data;
				this.oftenLoading = false;
			} else {
				this.$message.error(res.msg);
			}
		},

		// 图层树伸缩
		handleShowTree() {
			this.showTree = !this.showTree;
		},

		// 复选框点击事件
		changeSlider(obj, state, checknodes) {
			console.log(obj);
			console.log(state);
			console.log(checknodes);
			// 选中
			if (state) {
				if (obj.level == "group") {
					//暂时没有直接通过点击组加载数据，这里不做处理
				} else if (obj.level == "server") {
					var layername = obj.label;
					visiblelayer(layername, true);
				} else if (obj.level == "layer") {
					var layername = obj.parent;
					var layerid = obj.id;
					visibleSublayer(
						layername,
						layerid,
						true
					);
				}
			}
			// 未选中
			else {
				if (obj.level == "group" && !checknodes) {
				} else if (
					obj.level == "group" &&
					checknodes
				) {
				} else if (
					obj.level == "server" &&
					!checknodes
				) {
					var layername = obj.label;
					visiblelayer(layername, false);
				} else if (obj.level == "layer") {
					var layername = obj.parent;
					var layerid = obj.id;
					visibleSublayer(
						layername,
						layerid,
						false
					);
				}
			}
		},

		// 图层树过滤事件
		filterNode(value, data, node) {
			if (!value) return true;
			let level = node.level;
			let _array = [];
			this.getReturnNode(node, _array, value);
			let result = false;
			_array.forEach((item) => {
				result = result || item;
			});
			return result;
		},
		getReturnNode(node, _array, value) {
			let isPass =
				node.data &&
				node.data.label &&
				node.data.label.indexOf(value) !== -1;
			isPass ? _array.push(isPass) : "";
			this.index++;
			if (
				!isPass &&
				node.level != 1 &&
				node.parent
			) {
				this.getReturnNode(
					node.parent,
					_array,
					value
				);
			}
		},

		// 节点展开事件
		nodeClick(node, resolve) {
			let obj = node.data;
			if (obj.level == "group") {
				return resolve(obj.childlist);
			} else if (obj.level == "server") {
				if (obj.url != null) {
					this.getServerUrl(obj, resolve);
				} else {
					setTimeout(() => {
						return resolve([]);
					}, 200);
				}
			}
		},

		// 获取服务地址
		async getServerUrl(obj, resolve) {
			const { data: res } = await getServer(
				obj.url
			);
			if (res == null) {
				setTimeout(() => {
					return resolve([]);
				}, 200);
			}
			if (res.layers == null) {
				//this.$message.warning('该图层服务地址不存在！');
				setTimeout(() => {
					return resolve([]);
				}, 200);
			}
			if (res.layers.length > 0) {
				for (
					let i = 0;
					i < res.layers.length;
					i++
				) {
					const sonlayer = res.layers[i];
					var child = {
						id: sonlayer.id,
						label: sonlayer.name,
						isShow: false,
						value: 100,
						level: "layer",
						parent: obj.label,
						isLeaf: true,
						url: obj.url,
					};
					obj.childlist.push(child);
				}
				setTimeout(() => {
					return resolve(obj.childlist);
				}, 200);
			} else {
				setTimeout(() => {
					return resolve([]);
				}, 200);
			}
		},

		// slider 展示判断
		showSlider(scope) {
			if (scope.data.childlist) {
				var arr = scope.node.childNodes.find(
					(item) => {
						return item.checked == true;
					}
				);
			}
			return (
				(scope.data.level === "server" &&
					scope.data.isShow &&
					Boolean(arr)) ||
				(scope.data.level === "server" &&
					scope.data.isShow &&
					scope.node.checked == true)
			);
		},

		// 滑块拖动
		changeOpacity(obj) {
			console.log(obj);
			var layername = obj.label;
			var opacityvalue = obj.value / 100;
			layeropacity(layername, opacityvalue);
		},

		// 拖拽开始
		handleDragStart(node, event) {
			console.dir(
				document.getElementById("leftMap")
			);
		},

		// 拖拽结束
		handleDragEnd(
			node,
			endNode,
			position,
			event
		) {
			if (!this.showSplit) return;
			let bodyHeight = document.body.clientHeight;
			let mapOneTop =
				document.getElementById(
					"headerBox"
				).clientHeight;
			let mapOneLeft =
				document.getElementById(
					"layerAside"
				).clientWidth;
			let mapTwoLeft =
				document.getElementById("leftMap")
					.clientWidth +
				document.getElementById("layerAside")
					.clientWidth;
			let mapRight = document.body.clientWidth;
			// 左侧
			if (
				event.clientY > mapOneTop &&
				event.clientY < bodyHeight &&
				event.clientX > mapOneLeft &&
				event.clientX < mapTwoLeft
			) {
				console.log("左侧", node);
				if (node.data.level == "group") {
					this.$message.warning(
						"该层级拖拽无效，请拖拽地图服务"
					);
				} else {
					this.splitMap_Left_Data = node;
				}
			} else if (
				event.clientY > mapOneTop &&
				event.clientY < bodyHeight &&
				event.clientX > mapTwoLeft &&
				event.clientX < mapRight
			) {
				console.log("右侧", node);
				if (node.data.level == "group") {
					this.$message.warning(
						"该层级拖拽无效，请拖拽地图服务"
					);
				} else {
					this.splitMap_Right_Data = node;
				}
			}
		},

		// 收藏按钮点击
		async switchCollect(obj) {
			obj.data.isCollect = !obj.data.isCollect;
			console.log(obj.data.isCollect);
			if (obj.node.level > 1) {
				for (let i in obj.node) {
					if (i === "parent") {
						let ff = obj.node[i].childNodes;
						let aa = ff.filter((cc) => {
							return cc.data.isCollect === true;
						});

						if (
							((aa.length &&
								obj.data.isCollect === true) ||
								(!aa.length &&
									obj.data.isCollect ===
										false)) &&
							obj.node.parent.level !== 0
						) {
							this.findParCol(
								obj.node,
								obj.data.isCollect
							);
						}
					}
				}
			}

			if (obj.data.childlist !== null) {
				this.findSubCol(
					obj.data.childlist,
					obj.data.isCollect
				);
			}

			console.log(obj);
			var serverIds = collectServer(obj);
			if (obj.data.isCollect) {
				// 收藏
				let params = {
					ids: serverIds,
					uid: sessionStorage.getItem("userid"),
				};
				const { data: res } = await addCollection(
					params
				);
				if (res.code === 1) {
					this.$message.success("收藏成功");
					//this.getOftenTree();
				}
			} else {
				// 取消收藏
				let params = {
					ids: serverIds,
					uid: sessionStorage.getItem("userid"),
				};
				const { data: res } =
					await cancleCollection(params);
				if (res.code === 1) {
					this.$message.success("已取消收藏");
					//this.getOftenTree();
				}
			}
		},

		// 查找子级收藏
		findSubCol(arr, bol) {
			if (arr.length > 0 && arr) {
				for (let i = 0; i < arr.length; i++) {
					arr[i].isCollect = bol;
					if (
						arr[i].childlist &&
						arr[i].childlist.length > 0
					) {
						this.findSubCol(
							arr[i].childlist,
							bol
						);
					}
				}
			}
		},

		// 查找父级收藏
		findParCol(arr, bol) {
			for (let i in arr) {
				if (i === "parent") {
					arr[i].childNodes.map((item) => {
						if (bol) {
							arr[i].data.isCollect = bol;
							if (arr.level > 1) {
								this.findParCol(arr[i], bol);
							}
						} else if (
							!bol &&
							item.data.isCollect == true
						) {
							arr[i].data.isCollect = !bol;
							if (arr.level > 1) {
								this.findParCol(arr[i], bol);
							}
						} else if (
							!bol &&
							item.data.isCollect == false
						) {
							arr[i].data.isCollect = false;
							if (arr.level > 1) {
								this.findParCol(arr[i], bol);
							}
						}
					});
				}
			}
		},
	},
};
