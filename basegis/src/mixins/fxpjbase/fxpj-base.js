import {
    getTypeList,
    getMapConfigApi,
    getLayerList,
    getExplain,
} from "./fxpj-base-api";
import TileLayer from "@arcgis/core/layers/TileLayer";
import Basemap from "@arcgis/core/Basemap";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Point from "@arcgis/core/geometry/Point";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import { GetBaseMapAreaLayers } from "@/utils/common-map-method";

const fxpj_base = {
    data() {
        return {
            topChartVisible: false,
            middleChartVisible: false,
            // 左上侧类型菜单列表
            treeData: [],
            // 类型菜单字段
            topTreeProps: {
                label: "LABEL",
            },
            rtOption: {},
            rcOption: {},
            explainList: [],
            showRT: false,
            showRC: false,
            currentKey: null, // 高亮节点
            reporturl: "", //报告地址
            rtTitle: "",
            rcTitle: "",
            defaultProps: {
                children: "childlist",
                label: "label",
                isLeaf: "isLeaf",
            },
            defaultKeys: [],
            treeList: [],
            fxLayer: null,
        };
    },
    // 地图实例
    view: null,
    mounted() {},
    methods: {
        // 获取底图配置
        async getMapConfig(modulename) {
            let params = {
                uid: sessionStorage.getItem("userid"),
                modulename,
            };
            const { data: res } = await getMapConfigApi(params);
            if (res.code === 1) {
                this.initMap(res.data);
            } else {
                this.$message.error(res.msg);
            }
        },

        // 初始化地图
        initMap(data) {
            let baselayer;
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
            // let baselayer = new TileLayer({
            //     url: data.URL,
            //     id: 'basemap_layer',
            // });

            let basemap = new Basemap({
                baseLayers: [baselayer],
                title: "basemap",
                id: "basemap",
            });

            let map = new Map({
                basemap,
            });

            let center = new Point({
                x: data.CENTERX,
                y: data.CENTERY,
                spatialReference: {
                    wkid: data.MAPWKID,
                },
            });

            this.view = new MapView({
                map, // Map的实例放入视图中
                container: "single_map", // 视图的容器
                center,
                constraints: {
                    // minScale: 577791,
                    rotationEnabled: false,
                },
                navigation: {
                    momentumEnabled: false,
                },
                // zoom: 2,
                scale: mapParameters.fxScale,
            });

            //是否对底图做蒙版
            if (isBaseMapCut) {
                GetBaseMapAreaLayers(this.view);
                this.view.background = {
                    // autocasts new ColorBackground()
                    color: [255, 255, 255, 1], // autocasts as new Color()
                };
            }

            console.log(this.view, "view");
            console.log(mapParameters.fxScale, "mapParameters.fxScale");

            this.view.ui.remove(["attribution", "zoom"]);

            // 左侧树列表
            this.getTreeData();
        },

        //左侧树列表
        async getTreeData() {
            let params = {
                uid: sessionStorage.getItem("userid"),
                categorytype: this.fxpjType,
            };
            const { data: res } = await getTypeList(params);
            if (res.code === 1) {
                console.log(res);
                this.treeData = res.data;
                let pid = this.treeData[0].PID;
                this.currentKey = pid;
                this.treepid = pid;

                this.$nextTick(() => {
                    this.$refs.treeData.setCurrentKey(this.currentKey);
                });

                this.getLayers(pid);
                this.getRtOption(pid);
                this.getRcOption(pid);
                this.getSMList(pid);
                this.reporturl = this.treeData[0].REPORTURL;
                if (this.$route.path == "/landfitness") {
                    this.getRtTable( this.treeData[0].LABEL);
                }
            } else {
                this.$message.error(res.msg);
            }
        },

        //加载地图图层列表
        async getLayers(typeid) {
            debugger;
            this.defaultKeys = [];
            let params = {
                uid: sessionStorage.getItem("userid"),
                typeid,
            };
            const { data: res } = await getLayerList(params);
            this.treeList = res.data;

            // 预加载图层
            this.treeList.forEach((layer) => {
                if (layer.isfxlayer == 1) {
                    this.fxLayer = layer;
                    debugger;
                    this.defaultKeys.push(layer.keyid);
                    layer.isShow = true;
                    var maplayer = new MapImageLayer({
                        url: layer.url,
                        id: layer.label,
                        visible: true,
                        sublayers: [
                            {
                                id: layer.layerid,
                                visible: true,
                            },
                        ],
                    });
                    this.view.map.add(maplayer,0);                   
                } else {
                    var maplayer = new MapImageLayer({
                        url: layer.url,
                        id: layer.label,
                        visible: false,
                        sublayers: [
                            {
                                id: layer.layerid,
                                visible: false,
                            },
                        ],
                    });
                    this.view.map.add(maplayer,1);
                }
            });
        },

        //打开关闭图层 type:1(打开) 0(关闭)
        openCloseLayer(name, type) {
            var layer = this.view.map.findLayerById(name);
            if (layer) {
                layer.visible = type == 1 ? true : false;
                for (var i = 0; i < layer.allSublayers.items.length; i++) {
                    layer.allSublayers.items[i].visible =
                        type == 1 ? true : false;
                }
            }
        },

        // 左上类型树点击tree项
        handleNodeClick(data) {
            console.log(data, "data");
            console.log(this.$route);
            debugger;
            this.view.graphics.removeAll();
            this.tableData = [];
            this.spanArr1 = [];
            this.chartList = [];
            this.showSel = data.PID;
            // ! 5 城市宜居性分析，6 绿地分析；暂时用固定值判断
            if (data.PID === 5) {
                this.tableColList = [
                    { prop: "name", label: "出行方式及时长" },
                    { prop: "ssname", label: "设施名称" },
                    { prop: "sstype", label: "设施类型" },
                ];
            } else if (data.PID === 6) {
                this.tableColList = [
                    { prop: "xzqmc", label: "镇街名称" },
                    { prop: "ydxz", label: "用地现状" },
                    { prop: "ydmj", label: "用地面积" },
                ];
                var newGreendata = ldfxData.map((item) => {
                    return item.ldfx.map((subitem) => {
                        subitem.xzqmc = item.xzqmc;
                        return subitem;
                    });
                });
                this.tableData = newGreendata.flat();
                debugger;
                for (var i = 0; i < this.tableData.length; i++) {
                    if (i === 0) {
                        this.spanArr1.push(1);
                        this.pos1 = 0;
                    } else {
                        if (
                            this.tableData[i].xzqmc ===
                            this.tableData[i - 1].xzqmc
                        ) {
                            this.spanArr1[this.pos1] += 1;
                            this.spanArr1.push(0);
                        } else {
                            this.spanArr1.push(1);
                            this.pos1 = i;
                        }
                    }
                }
                let newChartData = this.groupBy(
                    this.tableData,
                    function (item) {
                        return [item.ydxz];
                    }
                );
                let handleData = newChartData.filter((item) => {
                    if (item[0].ydxz == ldField) {
                        return item;
                    }
                });
                let arr = handleData[0].sort((a, b) => {
                    return Number(b.ydmj) - Number(a.ydmj);
                });
                this.chartList = arr.slice(0, 10).map((item) => {
                    return {
                        value: item.ydmj,
                        name: item.xzqmc,
                    };
                });
            }

            this.view.map.removeAll();
            this.getLayers(data.PID);
            this.getRtOption(data.PID);
            this.getRcOption(data.PID);
            this.getSMList(data.PID);
            this.reporturl = data.REPORTURL;
            if (this.$route.path == "/landfitness") {
                this.getRtTable(data.LABEL);
            }
        },

        // 右下侧说明文字
        async getSMList(typeid) {
            let params = {
                typeid,
            };
            const { data: res } = await getExplain(params);
            if (res.code === 1) {
                if (res.data.length > 0) {
                    this.explainList = res.data;
                } else {
                    // this.$message.warning('没有说明');
                    this.explainList = "";
                }
            } else {
                this.$message.error(res.msg);
            }
        },

        //点击预览
        previewExport() {
            window.open(apiURL_sys_file + "/" + this.reporturl);
        },

        // 复选框点击事件
        changeSlider(obj, state, checknodes) {
            obj.isShow = state;
            if (state) {
                this.openCloseLayer(obj.label, 1);
            } else {
                this.openCloseLayer(obj.label, 0);
            }
        },

        // slider v-if判断
        showSlider(scope) {
            return scope.data.level === "server" && scope.data.isShow;
        },

        // 滑块拖动事件
        changeOpacity(obj) {
            console.log(obj);

            var layer = this.view.map.findLayerById(obj.label);
            console.log(layer, "layer");
            if (layer) {
                layer.opacity = obj.value / 100;
            }
        },

        groupBy(array, f) {
            let groups = {};
            array.forEach(function (o) {
                let group = JSON.stringify(f(o));
                groups[group] = groups[group] || [];
                groups[group].push(o);
            });
            return Object.keys(groups).map(function (group) {
                return groups[group];
            });
        },

        // 右侧表格渲染 label需和配置文件内的label一致
        getRtTable(label) {
            landTableData.forEach((item) => {
                if (item.label == label) {
                    this.colsData = item.cols;
                    this.tableData = item.tableList;
                }
            });
        },
    },
};
export default fxpj_base;
