/*
 * @Author: WCL
 * @Date: 2021-12-13 10:00:57
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-02 15:54:46
 * @FilePath: \webgis\src\components\onemap\onemap-topic-define\js\onemap-topic-define.js
 * @Description: 自定义制图JS
 */
import { mapMutations, mapState } from "vuex";
import Vue from "vue";
import {
    initDefineMap,
    defineView,
    printMap,
    uploadDwg,
    readDWGApi,
    readTXTApi,
    readSHPApi,
    createGraphic,
    createFile,
    mapScreenhot,
} from "@/utils/topic-map";
import { saveMapPrintImage } from "@/utils/common-map-method";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Graphic from "@arcgis/core/Graphic";
import Font from "@arcgis/core/symbols/Font";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";

export default {
    name: "",
    props: {},
    components: {},
    data() {
        return {
            MapPrintMode: "screenshot",
            dialogVisible: false,
            comTitle: "",
            defineForm: {
                dpi: 96,
                title: "",
                scale1: "1",
                scale2: "",
                papertype: "A4横版",
                date: "",
                unit: "",
                labeltype: "",
                labeltable: [],
                doctype: "",
            },
            rules: {
                title: [
                    {
                        required: true,
                        message: "标题不能为空",
                        trigger: "blur",
                    },
                ],
                scale2: [
                    {
                        required: true,
                        message: "比例尺不能为空",
                        trigger: "blur",
                    },
                ],
                papertype: [
                    {
                        required: true,
                        message: "纸张类型不能为空",
                        trigger: "change",
                    },
                ],
                date: [
                    {
                        required: true,
                        message: "日期不能为空",
                        trigger: "blur",
                    },
                ],
                unit: [
                    {
                        required: true,
                        message: "单位不能为空",
                        trigger: "blur",
                    },
                ],
                seal: [
                    {
                        required: true,
                        message: "请选择是否需要印章",
                        trigger: "change",
                    },
                ],
            },
            labeltypeList: [
                { icon: "icon-danhangwenben", text: "文本", type: "text" },
                { icon: "icon-dingwei1", text: "点", type: "point" },
                {
                    icon: "icon-yuanxingweixuanzhong",
                    text: "圆",
                    type: "circle",
                },
                { icon: "icon-zhexiantu", text: "线", type: "polyline" },
                { icon: "icon-juxing", text: "矩形", type: "rectangle" },
                { icon: "icon-duobianxing-", text: "多边形", type: "polygon" },
                { icon: "icon-bottom", text: "箭头", type: "arrow" },
                { icon: "icon-daoru", text: "导入", type: "import" },
            ],
            tableData: [],
            verticalClass: "",
            viewClick: null,
            sketchViewModel: null, // 微件
            tableData: [], // 自定义专题图标注图形列表
            textIndex: 1, // 文本标注序号
            pointIndex: 1, // 点标注序号
            circleIndex: 1, // 圆标注序号
            lineIndex: 1, // 线标注序号
            rectangleIndex: 1, // 矩形标注序号
            polygonIndex: 1, // 多边形标注序号
            arrowIndex: 1, // 箭头标注序号
            fileIndex: 1, // 导入文件序号
            textTempGLayer: null, // 文本标注图层
            pointTempGLayer: null, // 点标注图层
            circleTempGLayer: null, // 圆标注图层
            polylineTempGLayer: null, // 线标注图层
            rectangleTempGLayer: null, // 矩形标注图层
            polygonTempGLayer: null, // 多边形标注图层
            arrowTempGLayer: null, // 箭头标注图层,
            upLoading: null, // 上传loading
            fileName: "", // 上传文件名
        };
    },
    computed: {
        ...mapState("onemap-store", ["zttScale"]),
        ...mapState("map2d-store", ["pointSymbol", "symbol"]),
    },
    watch: {
        dialogVisible: {
            handler(boo) {
                if (boo) {
                    this.$nextTick(() => {
                        initDefineMap("define_zttmap");
                        this.createLabelLayer();
                    });
                }
            },
        },

        // 监听地图范围变化的scale值
        zttScale: {
            handler(val) {
                this.defineForm.scale2 = val;
            },
            deep: true,
        },
    },
    created() {},
    mounted() {
        this.MapPrintMode = MapPrintMode;
    },
    methods: {
        ...mapMutations("onemap-store", [
            "handleOnemapPopup",
            "handleToggleIndex",
            "handleShowZttScale",
        ]),

        // 打开弹窗
        showDialog(obj) {
            this.comTitle = obj.title;
            this.dialogVisible = true;
            this.handleToggleIndex(false);
        },

        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: "init" });
            this.handleToggleIndex(true);
            this.handleShowZttScale(true);
            this.dialogVisible = false;
            // // 数据恢复初始
            // Object.assign(this.$data, this.$options.data());
        },

        // 选择纸张类型
        choosePaperType(str) {
            if (str === "A4横版" || str === "A3横版") {
                this.verticalClass = "";
            } else {
                this.verticalClass = "verticalClass";
            }
        },

        // 比例尺输入
        changeScale2(val) {
            debugger;
            this.handleShowZttScale(true);
            defineView.scale = val;
        },

        // 标注图层创建
        createLabelLayer() {
            debugger;
            this.textTempGLayer = new GraphicsLayer({ id: "textTempGLayer" });
            this.pointTempGLayer = new GraphicsLayer({ id: "pointTempGLayer" });
            this.circleTempGLayer = new GraphicsLayer({
                id: "circleTempGLayer",
            });
            this.polylineTempGLayer = new GraphicsLayer({
                id: "polylineTempGLayer",
            });
            this.rectangleTempGLayer = new GraphicsLayer({
                id: "rectangleTempGLayer",
            });
            this.polygonTempGLayer = new GraphicsLayer({
                id: "polygonTempGLayer",
            });
            this.arrowTempGLayer = new GraphicsLayer({ id: "arrowTempGLayer" });
        },

        // 标注表格选中
        changeLabelTable() {
            this.defineForm.labeltype = "";
            this.tableData.forEach((element) =>
                this.$refs.geoTable.toggleRowSelection(element, true)
            );
        },

        // 标注类型选择
        labelChange(obj) {
            console.log(obj, "radio");
            if (this.sketchViewModel != null) {
                this.sketchViewModel.cancel();
            }
            switch (obj) {
                // 文本
                case "text":
                    debugger;
                    this.createText("define_zttmap", obj);
                    break;
                // 点
                case "point":
                    this.createPoint();
                    break;
                // 圆
                case "circle":
                    this.createCircle();
                    break;
                // 线
                case "polyline":
                    this.createPolyline();
                    break;
                // 矩形
                case "rectangle":
                    this.createRectangle();
                    break;
                // 多边形
                case "polygon":
                    this.createPolygon();
                    break;
                // 箭头
                case "arrow":
                    this.createArrow();
                    break;

                default:
                    break;
            }
        },

        // 标注-文本
        createText(container, type) {
            debugger;
            let app = this;
            if (this.viewClick != null) {
                this.viewClick.remove();
            }
            let isTextComplete = false;

            let templayer = defineView.map.findLayerById("textTempGLayer");
            if (!Boolean(templayer)) {
                defineView.map.layers.add(this.textTempGLayer);
            }

            this.viewClick = defineView.on("click", (evt) => {
                if (type != "text" || isTextComplete) {
                    return;
                }
                let pt = evt.mapPoint;
                let screenPoint_x = evt.screenPoint.x;
                let screenPoint_y = evt.screenPoint.y;
                let Profile = Vue.extend({
                    template: `<el-input v-model='addInput' v-if="isShow" style='position:absolute;top:${screenPoint_y}px;left:${screenPoint_x}px; width:100px;'  @blur="onSubmit()"></el-input>`,
                    data() {
                        return {
                            addInput: "",
                            isShow: true,
                        };
                    },
                    methods: {
                        onSubmit() {
                            isTextComplete = true;
                            this.isShow = false;
                            let defaultFont = new Font({
                                size: "18px",
                                weight: "bold",
                            });

                            let ptExtSymbol = new TextSymbol({
                                text: this.addInput,
                                font: defaultFont,
                                color: [255, 0, 0],
                                xoffset: 20,
                                yoffset: -10,
                            });

                            let g = new Graphic({
                                geometry: pt,
                                symbol: ptExtSymbol,
                            });

                            debugger;
                            app.textTempGLayer.graphics.add(g);
                            // 记录图形
                            let graphicIndex = {
                                id: app.textIndex,
                                name: "文本" + app.textIndex,
                                geo: g,
                                type: "text",
                                layerid: "textTempGLayer",
                            };

                            app.tableData.push(graphicIndex);
                            app.textIndex++;
                            app.changeLabelTable();
                        },
                    },
                });

                let component = new Profile().$mount();
                document.getElementById(container).appendChild(component.$el);
            });
        },

        // 标注-点
        createPoint() {
            this.sketchViewModel = new SketchViewModel({
                layer: this.pointTempGLayer,
                view: defineView,
                pointSymbol: this.pointSymbol,
            });
            defineView.map.layers.add(this.pointTempGLayer);
            this.sketchViewModel.create("point");
            this.sketchViewModel.on("create", (evt) => {
                console.log(evt, "evt");
                if (evt.state == "complete") {
                    // 记录图形
                    let graphicIndex = {
                        id: this.pointIndex,
                        name: "点" + this.pointIndex,
                        geo: evt.graphic,
                        type: "point",
                        layerid: "pointTempGLayer",
                    };
                    this.tableData.push(graphicIndex);
                    this.pointIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-圆
        createCircle() {
            let symbol = {
                type: "simple-fill",
                color: [51, 51, 204, 0.2],
                style: "solid",
                outline: {
                    color: "red",
                    width: 1,
                },
            };
            this.sketchViewModel = new SketchViewModel({
                layer: this.circleTempGLayer,
                view: defineView,
                polygonSymbol: symbol,
            });

            defineView.map.layers.add(this.circleTempGLayer);
            this.sketchViewModel.create("circle");
            this.sketchViewModel.on("create", (evt) => {
                if (evt.state == "complete") {
                    // 记录图形
                    let graphicIndex = {
                        id: this.circleIndex,
                        name: "圆" + this.circleIndex,
                        geo: evt.graphic,
                        type: "circle",
                        layerid: "circleTempGLayer",
                    };

                    this.tableData.push(graphicIndex);
                    this.circleIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-线
        createPolyline() {
            let symbol = {
                type: "simple-line",
                color: [255, 0, 0],
                width: 2,
                cap: "round",
                join: "round",
            };
            this.sketchViewModel = new SketchViewModel({
                layer: this.polylineTempGLayer,
                view: defineView,
                polylineSymbol: symbol,
            });
            defineView.map.layers.add(this.polylineTempGLayer);
            this.sketchViewModel.create("polyline");
            this.sketchViewModel.on("create", (evt) => {
                if (evt.state == "complete") {
                    this.sketchViewModel.complete();
                    this.sketchViewModel.destroy();
                    // 记录图形
                    let graphicIndex = {
                        id: this.lineIndex,
                        name: "线" + this.lineIndex,
                        geo: evt.graphic,
                        type: "polyline",
                        layerid: "polylineTempGLayer",
                    };
                    this.tableData.push(graphicIndex);
                    this.lineIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-矩形
        createRectangle() {
            let symbol = {
                type: "simple-fill",
                color: [51, 51, 204, 0.2],
                style: "solid",
                outline: {
                    color: "red",
                    width: 1,
                },
            };
            this.sketchViewModel = new SketchViewModel({
                layer: this.rectangleTempGLayer,
                view: defineView,
                polygonSymbol: symbol,
            });
            defineView.map.layers.add(this.rectangleTempGLayer);
            this.sketchViewModel.create("rectangle");
            this.sketchViewModel.on("create", (evt) => {
                if (evt.state == "complete") {
                    // 记录图形
                    let graphicIndex = {
                        id: this.rectangleIndex,
                        name: "矩形" + this.rectangleIndex,
                        geo: evt.graphic,
                        type: "rectangle",
                        layerid: "rectangleTempGLayer",
                    };
                    this.tableData.push(graphicIndex);
                    this.rectangleIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-多边形
        createPolygon() {
            this.sketchViewModel = new SketchViewModel({
                layer: this.polygonTempGLayer,
                view: defineView,
                polygonSymbol: this.symbol,
            });
            defineView.map.layers.add(this.polygonTempGLayer);
            this.sketchViewModel.create("polygon");
            this.sketchViewModel.on("create", (evt) => {
                if (evt.state == "complete") {
                    //this.polygonGraphic(evt.graphic.geometry.rings);
                    let graphicIndex = {
                        id: this.polygonIndex,
                        name: "面" + this.polygonIndex,
                        geo: evt.graphic,
                        type: "polygon",
                        layerid: "polygonTempGLayer",
                    };
                    this.tableData.push(graphicIndex);
                    this.polygonIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-箭头
        createArrow() {
            let symbol = {
                type: "simple-line",
                color: [255, 0, 0],
                width: 2,
                cap: "round",
                join: "round",
                marker: {
                    style: "arrow",
                    color: "red",
                    placement: "end",
                },
            };
            this.sketchViewModel = new SketchViewModel({
                layer: this.arrowTempGLayer,
                view: defineView,
                polylineSymbol: symbol,
            });
            defineView.map.layers.add(this.arrowTempGLayer);
            this.sketchViewModel.create("polyline");
            this.sketchViewModel.on("create", (evt) => {
                if (evt.state == "complete") {
                    this.sketchViewModel.complete();
                    this.sketchViewModel.destroy();

                    // 记录图形
                    let graphicIndex = {
                        id: this.arrowIndex,
                        name: "箭头" + this.arrowIndex,
                        geo: evt.graphic,
                        type: "arrow",
                        layerid: "arrowTempGLayer",
                    };
                    this.tableData.push(graphicIndex);
                    this.arrowIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 导入文件
        async uploadFile(params) {
            console.log(params, "params");
            this.upLoading = this.$message({
                iconClass: "el-icon-loading",
                message: "上传中...",
                duration: 0,
                customClass: "prop-search",
            });
            // 文件名称
            this.fileName = params.file.name;
            // 文件扩展名
            let fileExt = params.file.name.split(".")[1];
            let form = new FormData();
            form.append("filepath", "ZTT");
            form.append("file", params.file);
            const { data: res } = await uploadDwg(form);
            if (res.code === 1) {
                if (fileExt == "dwg") {
                    let readParams = {
                        filename: params.file.name,
                        filepath: res.data,
                    };
                    this.readDWG(readParams);
                } else if (fileExt == "txt") {
                    let readParams = {
                        filepath: res.data,
                    };
                    this.readTXT(readParams);
                } else if (fileExt == "zip") {
                    let readParams = {
                        filename: params.file.name,
                        filepath: res.data,
                    };
                    this.readSHP(readParams);
                }
                this.upLoading.close();
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 读取DWG
        async readDWG(params) {
            const { data: res } = await readDWGApi(params);
            if (res.code === 1) {
                this.overLayer(res.data);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 读取TXT
        async readTXT(params) {
            const { data: res } = await readTXTApi(params);
            if (res.code === 1) {
                this.overLayer(res.data);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 读取SHP
        async readSHP(params) {
            const { data: res } = await readSHPApi(params);
            if (res.code === 1) {
                this.overLayer(res.data);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 叠加图形到地图
        overLayer(data) {
            debugger;
            defineView.graphics.removeAll();
            const graphic = createGraphic(data, defineView);
            if (graphic) {
                this.upLoading.close();
                let graphicIndex = {
                    id: this.fileIndex,
                    name: this.fileName,
                    geo: graphic,
                    type: "import",
                    layerid: "",
                };
                this.tableData.push(graphicIndex);
                this.fileIndex++;
                defineView.graphics.add(graphic);
                defineView.extent = graphic.geometry.extent;
                defineView.zoom -= 2;
            }
        },

        // 勾选表格当前行
        selectRow(selection, row) {
            console.log(selection, row);
            switch (row.type) {
                case "text":
                    this.labelVisible(this.textTempGLayer, selection, row);
                    break;
                case "point":
                    this.labelVisible(this.pointTempGLayer, selection, row);
                    break;
                case "circle":
                    this.labelVisible(this.circleTempGLayer, selection, row);
                    break;
                case "polyline":
                    this.labelVisible(this.polylineTempGLayer, selection, row);
                    break;
                case "rectangle":
                    this.labelVisible(this.rectangleTempGLayer, selection, row);
                    break;
                case "polygon":
                    this.labelVisible(this.polygonTempGLayer, selection, row);
                    break;
                case "arrow":
                    this.labelVisible(this.arrowTempGLayer, selection, row);
                    break;
                case "import":
                    this.labelVisible(defineView, selection, row);
                    break;
                default:
                    break;
            }
        },

        // 标签标注项显示
        labelVisible(layer, selection, row) {
            console.log(selection.indexOf(row));
            debugger;
            if (selection.indexOf(row) > -1) {
                if (layer != null) {
                    layer.graphics.items[row.id - 1].visible =
                        !layer.graphics.items[row.id - 1].visible;
                }
            } else {
                if (layer != null) {
                    layer.graphics.items[row.id - 1].visible =
                        !layer.graphics.items[row.id - 1].visible;
                }
            }
        },

        // 当前行删除
        delRow(obj) {
            console.log(obj);
            switch (obj.type) {
                case "text":
                    this.textTempGLayer.graphics.remove(obj.geo);
                    break;
                case "point":
                    this.pointTempGLayer.graphics.remove(obj.geo);
                    break;
                case "circle":
                    this.circleTempGLayer.graphics.remove(obj.geo);
                    break;
                case "polyline":
                    this.polylineTempGLayer.graphics.remove(obj.geo);
                    break;
                case "rectangle":
                    this.rectangleTempGLayer.graphics.remove(obj.geo);
                    break;
                case "polygon":
                    this.polygonTempGLayer.graphics.remove(obj.geo);
                    break;
                case "arrow":
                    this.arrowTempGLayer.graphics.remove(obj.geo);
                    break;
                default:
                    break;
            }
            let index = this.tableData.indexOf(obj);
            this.tableData.splice(index, 1);
        },

        // 导出专题
        onSubmit() {
            this.$refs.form.validate(async (valid) => {
                if (!valid) return this.$message.error("请补充必填项");
                this.upLoading = this.$message({
                    iconClass: "el-icon-loading",
                    message: "正在生成报告...",
                    duration: 0,
                    customClass: "prop-search",
                });
                let imagedata = null;
                let imageDataType = 0;
                if (this.MapPrintMode == "print") {
                    const resPrint = await printMap(
                        this.defineForm.dpi,
                        this.defineForm.scale2,
                        //defineView.scale,
                        defineView
                    )
                        .then((res) => {
                            return { status: true, data: res };
                        })
                        .catch((err) => {
                            return { status: false, data: err };
                        });
                    console.log(resPrint, "resPrint");
                    imagedata = resPrint.data.url;
                    imageDataType = 1;
                } else {
                    imagedata = await mapScreenhot(defineView);
                }
                let res = await saveMapPrintImage(
                    this.defineForm.title,
                    "ZTT",
                    imagedata,
                    1,
                    imageDataType
                );
                if (imagedata && res.code==1) {
                    // 传参
                    // type:4 自定义专题图
                    let params = {
                        type: 4,
                        title: this.defineForm.title,
                        scale: this.defineForm.scale2,
                        size: this.defineForm.papertype,
                        time: this.defineForm.date,
                        imagepath: res.data,
                        yz: "否",
                        ztdw: this.defineForm.unit,
                    };
                    this.exportPDF(params);
                } else {
                    this.upLoading.close();
                    this.$message.error(res.msg);
                }
            });
        },

        // 导出自定义图PDF
        // ! 生成PDF地图是蓝色的
        async exportPDF(params) {
            const { data: res } = await createFile(params);
            if (res.code === 1) {
                this.upLoading.close();
                window.open(apiURL_file + res.data);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },
    },
};
