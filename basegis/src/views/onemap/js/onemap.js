/*
 * @Author: WCL
 * @Date: 2021-11-16 10:00:25
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 11:42:27
 * @FilePath: \webgis\src\views\onemap\js\onemap.js
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
    getDataRequest,
    getBasicRequest,
} from "../api/onemap-api";
import { mapState, mapMutations } from "vuex";
import {
    loadtreelayer,
    visiblelayer,
    visibleSublayer,
    layeropacity,
    collectServer,
    findLayer,
} from "../../../utils/treemap";
import {
    getAllOpenLayers,
    getOpenSonLayers,
} from "@/utils/common-map-method.js";
import path from "path";
import { legendVal } from "@/utils/legend";

// 组件批量导入
const mapComs = require.context("@/components/onemap", true, /\.vue$/);
const resComs = {};
mapComs.keys().forEach((key) => {
    const name = path.basename(key, ".vue");
    resComs[name] = mapComs(key).default || mapComs(key);
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
            focusTab: "often",
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
            "allTreeDataLayers",
        ]),
        ...mapState("onemap-store", ["onemapPopup", "toggleIndex"]),
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
            console.log(this.toggleIndex, "toggleIndex");

            switch (obj.code) {
                // 查询定位
                case "onemap02":
                    this.$refs.locate.showDialog(obj);
                    break;
                // 行政区划
                case "onemap03":
                    this.$refs.area.showDialog(obj);
                    break;
                // 叠加图纸
                case "onemap05":
                    this.$refs.paper.showDialog(obj);
                    break;
                // 合规审查
                case "onemap20":
                    this.$refs.hegui.showDialog(obj);
                    break;
                // 规划制作
                case "onemap15":
                    this.$refs.guihua.showDialog(obj);
                    break;
                // 土规制作
                case "onemap16":
                    this.$refs.tugui.showDialog(obj);
                    break;
                // 现状制作
                case "onemap17":
                    this.$refs.current.showDialog(obj);
                    break;
                // 自定义图
                case "onemap18":
                    this.$refs.define.showDialog(obj);
                    break;
                // 单元监测
                case "onemap26":
                    this.$refs.unit.showDialog(obj);
                    break;
                // 开发评估
                case "onemap27":
                    this.$refs.dev.showDialog(obj);
                    break;
                // 规划编制成果追溯
                case "onemap30":
                    this.$refs.planresult.showDialog(obj);
                    break;
                // 查询统计
                case "onemap09":
                    this.$refs.count.showDialog(obj);
                    break;
                // 知识库
                case "onemap65":
                    this.$refs.wiki.showDialog(obj);
                    break;
                // 红线下载
                case "onemap06": {
                    this.$refs.redline.showDialog(obj);
                    break;
                }
                // 项目核查
                case "onemap22": {
                    this.$refs.project.showDialog(obj);
                    break;
                }
                // 统计台账
                case "onemap64": {
                    this.$refs.ledger.showDialog(obj);
                    break;
                }
                // 智能选址
                case "onemap105": {
                    this.$refs.aisite.showDialog(obj);
                    break;
                }
                // 叠加分析
                case "onemap115": {
                    this.$refs.overlay.showDialog(obj);
                    break;
                }
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
        this.allTreeDataLayers = [];
        this.getAllTree();
        this.getOftenTree();
        //增加基础信息平台数据访问次数
        this.GetDataRequest();
        this.GetBasicRequest();
    },
    methods: {
        ...mapMutations("onemap-store", [
            "handleOnemapPopup",
            "handleToggleIndex",
        ]),
        ...mapMutations("map2d-store", ["cleartableData"]),
        //增加基础信息平台数据访问次数
        async GetDataRequest() {
            const { data: res } = await getDataRequest(basicapiURL);
        },
        async GetBasicRequest() {
            const { data: res } = await getBasicRequest(basicapiURL);
        },
        // 获取全部图层列表
        async getAllTree() {
            let params = {
                uid: window.sessionStorage.getItem("userid"),
                grouptype: 1,
            };
            const { data: res } = await getMenuList(params);
            if (res.code === 1) {
                console.log(res, "treeres");
                this.treeAllList = res.data.menus;
                this.defaultCheckArr = res.data.defaultShowLayers;
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
        //取消图层树选中的所有图层
        resetChecked() {
            debugger;
            let checkkeyids = this.$refs.treeAll.getCheckedKeys();
            checkkeyids.forEach((keyid) => {
                let node = this.$refs.treeAll.getNode(keyid);
                this.$refs.treeAll.setChecked(node, false);
            });
            // 将选中设置为空
            //this.$refs.treeAll.setCheckedKeys([]);
        },
        // 获取常用图层列表
        async getOftenTree() {
            let params = {
                uid: window.sessionStorage.getItem("userid"),
            };
            const { data: res } = await getUserMenu(params);
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
            // console.log(obj);
            // console.log(state, "state");
            // console.log(checknodes, "checknodes");
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
                    visibleSublayer(layername, layerid, true);
                }
                //更新所有打开的子图层列表
                this.$refs.overlay.layerOptions = getOpenSonLayers();
                this.$refs.mapsort.showDialog({
                    title: "调整图层顺序",
                });
            }
            // 未选中
            else {
                if (obj.level == "group" && !checknodes) {
                } else if (obj.level == "group" && checknodes) {
                } else if (obj.level == "server" && !checknodes) {
                    var layername = obj.label;
                    visiblelayer(layername, false);
                } else if (obj.level == "layer") {
                    var layername = obj.parent;
                    var layerid = obj.id;
                    visibleSublayer(layername, layerid, false);
                }
                //更新调整图层顺序弹框的数据
                this.$refs.mapsort.treeData = getAllOpenLayers();
                console.log(this.treeData, "data");
                //更新所有打开的子图层列表
                this.$refs.overlay.layerOptions = getOpenSonLayers();
                // 图例信息更新
                legendVal();
            }
            // 图例信息更新
            legendVal();
        },
        //关闭图层顺序的弹框的同时取消图层树的勾选
        colseLayer(layerid) {
            console.log(layerid, this.allTreeDataLayers, "layerid");
            this.allTreeDataLayers.forEach((t) => {
                if (t.label == layerid) {
                    let node = this.$refs.treeAll.getNode(t.keyid);
                    this.$refs.treeAll.setChecked(node, false);
                    if (node.childNodes.length > 0) {
                        node.childNodes.forEach((cNode) => {
                            cNode.checked = false;
                        });
                    }
                }
            });
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
            if (!isPass && node.level != 1 && node.parent) {
                this.getReturnNode(node.parent, _array, value);
            }
        },

        // 节点展开事件
        nodeClick(node, resolve) {
            let obj = node.data;
            if (obj.kind == 5) {
                return resolve([]);
            }
            if (obj.level == "group") {
                return resolve(obj.childlist);
            } else if (obj.level == "server" && node.data.kind != 10) {
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
            const { data: res } = await getServer(obj.url);
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
                for (let i = 0; i < res.layers.length; i++) {
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
                        keyid: Number(String(obj.keyid) + String(i + 100)),
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
                var arr = scope.node.childNodes.find((item) => {
                    return item.checked == true;
                });
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
            console.dir(document.getElementById("leftMap"));
        },

        // 拖拽结束
        handleDragEnd(node, endNode, position, event) {
            if (!this.showSplit) return;
            let bodyHeight = document.body.clientHeight;
            let mapOneTop = document.getElementById("headerBox").clientHeight;
            let mapOneLeft = document.getElementById("layerAside").clientWidth;
            let mapTwoLeft =
                document.getElementById("leftMap").clientWidth +
                document.getElementById("layerAside").clientWidth;
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
                    this.$message.warning("该层级拖拽无效，请拖拽地图服务");
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
                    this.$message.warning("该层级拖拽无效，请拖拽地图服务");
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
                            ((aa.length && obj.data.isCollect === true) ||
                                (!aa.length && obj.data.isCollect === false)) &&
                            obj.node.parent.level !== 0
                        ) {
                            this.findParCol(obj.node, obj.data.isCollect);
                        }
                    }
                }
            }

            if (obj.data.childlist !== null) {
                this.findSubCol(obj.data.childlist, obj.data.isCollect);
            }

            console.log(obj);
            var serverIds = collectServer(obj);
            if (obj.data.isCollect) {
                // 收藏
                let params = {
                    ids: serverIds,
                    uid: sessionStorage.getItem("userid"),
                };
                const { data: res } = await addCollection(params);
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
                const { data: res } = await cancleCollection(params);
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
                    if (arr[i].childlist && arr[i].childlist.length > 0) {
                        this.findSubCol(arr[i].childlist, bol);
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
                        } else if (!bol && item.data.isCollect == true) {
                            arr[i].data.isCollect = !bol;
                            if (arr.level > 1) {
                                this.findParCol(arr[i], bol);
                            }
                        } else if (!bol && item.data.isCollect == false) {
                            arr[i].data.isCollect = false;
                            if (arr.level > 1) {
                                this.findParCol(arr[i], bol);
                            }
                        }
                    });
                }
            }
        },

        //缩放至图层
        handleZoom(obj) {
            let mapview = this.mapview;
            let featureLayer = findLayer(obj.data.parent, obj.data.id);
            // console.log(
            //     "fullExtent:" + featureLayer.fullExtent,
            //     featureLayer.layer.fullExtent
            // );
            if (featureLayer.fullExtent) {
                mapview.goTo({
                    target: featureLayer.fullExtent, // 目标是featureLayer的四至范围
                    zoom: mapview.zoom, // 保持当前缩放级别
                });
            } else {
                if (!featureLayer.layer.fullExtent) {
                    return this.$message.warning("该服务图层未设置全图四至范围！");
                }
                mapview.goTo({
                    target: featureLayer.layer.fullExtent, // 目标是featureLayer的四至范围
                    zoom: mapview.zoom, // 保持当前缩放级别
                });
            } 
        },
    },
};
