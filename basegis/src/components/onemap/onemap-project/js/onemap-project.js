/*
 * @Author: WCL
 * @Date: 2022-02-18 10:30:28
 * @LastEditors: WCL
 * @LastEditTime: 2022-04-02 10:47:43
 * @FilePath: \webgis\src\components\onemap\onemap-project\js\onemap-project.js
 * @Description: 项目核查JS
 */
import { mapMutations, mapState } from "vuex";
import { GeoToPointStr } from "@/utils/common-map-method";
import {
    uploadDwg,
    readDWGApi,
    readTXTApi,
    readSHPApi,
} from "@/utils/topic-map";
import {
    drawPolygon,
    handleUploadOverLayer,
    handleBufferGeo,
    ClearHgsc,
    ReloadHgscGraphic,
} from "@/utils/mapdraw";
import {
    getCols,
    startXMHC,
    getLayers,
    exportXMHCPdf,
} from "../api/onemap-project-api";
import { exportZJDExcel } from "../../onemap-hegui/api/onemap-hegui-api";

import * as XLSX from "xlsx";
import FileSaver from "file-saver";
export default {
    name: "",
    props: {},
    components: {},
    data() {
        return {
            layerOptions: [],
            selectLayer: null,
            dialogVisible: false,
            comTitle: "",
            upArea: 0,
            upBtnList: [
                {
                    type: "CAD",
                    ref: "refCAD",
                    url: require("@/assets/images/onemap-images/up_cad.png"),
                    accept: ".dwg",
                },
                {
                    type: "SHP",
                    ref: "refSHP",
                    url: require("@/assets/images/onemap-images/up_shp.png"),
                    accept: ".zip",
                },
                {
                    type: "TXT",
                    ref: "refTXT",
                    url: require("@/assets/images/onemap-images/up_txt.png"),
                    accept: ".txt",
                },
            ],
            upTXT: "", // 上传文件名
            isBuffer: false, // 缓冲距离复选框
            bufferDistance: "", // 缓冲距离
            //tableData: [],
            landDrawer: false, // 审查抽屉
            scResultTable: [], // 审查结果数据
            radioID: "",
            switchDrawer: true,
            switchDrawerIcon: "el-icon-arrow-down",
            drawerSize: "47%",
            currentPage: 1,
            pagesizeArr: [10, 20, 50, 100],
            pagesize: 10,
            total: 0,
            tableColsData: [],
            loading: true,
            GeoNames: [],
        };
    },
    computed: {
        ...mapState("map2d-store", [
            "tableData",
            "hgscRadioID",
            "hgscUploadDKArea",
            "mapview",
        ]),
    },
    watch: {
        dialogVisible(boo) {
            if (boo) {
                this.getTableCols();
            } else {
                this.landDrawer = false;
                this.GeoNames = [];
                ClearHgsc(); //清空图形
            }
           
        },
        hgscRadioID(radioID) {
            console.log(radioID);
            this.radioID = radioID;
            this.currentTableDataItem = this.tableData.filter((item) => {
                return item.index == this.radioID;
            })[0];
        },
        hgscUploadDKArea(area) {
            this.upArea = area;
        },
    },
    created() {},
    mounted() {
        this.getXMHCLayers();
    },
    methods: {
        ...mapMutations("onemap-store", [
            "handleOnemapPopup",
            "handleToggleIndex",
        ]),
        ...mapMutations("map2d-store", ["cleartableData"]),
        // 获取表头
        async getTableCols() {
            const { data: res } = await getCols();
            if (res.code === 1) {
                this.tableColsData = res.data;
            }
        },

        //获取审查图层
        async getXMHCLayers() {
            const { data: res } = await getLayers();
            if (res.code === 1) {
                this.layerOptions = res.data;
            }
        },

        // 打开弹窗
        showDialog(obj) {
            debugger;
            this.comTitle = obj.title;
            this.cleartableData(); //清空列表
            this.dialogVisible = true;
            this.handleToggleIndex(false);
        },
        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: "init" });
            this.handleToggleIndex(true);
            this.dialogVisible = false;
            this.landDrawer = false;
            this.GeoNames = [];
            ClearHgsc(); //清空图形
        },

        // 绘制范围
        drawPolygon() {
            drawPolygon();
        },

        // 上传事件
        async uploadFile(params) {
            console.log(params);
            this.upTXT = params.file.name;
            this.upLoading = this.$message({
                iconClass: "el-icon-loading",
                message: "上传中...",
                duration: 0,
                customClass: "prop-search",
            });
            var file_ext = params.file.name
                .split(".")
                [params.file.name.split(".").length - 1].toLowerCase();
            var savefilepath = "HGSC";
            if (file_ext == "dwg") {
                savefilepath = "DWG";
            }
            if (file_ext == "txt") {
                savefilepath = "TXT";
            }
            if (file_ext == "zip" || file_ext == "shp") {
                savefilepath = "SHP";
            }
            let form = new FormData();
            form.append("file", params.file);
            form.append("filepath", savefilepath);
            const { data: res } = await uploadDwg(form);
            if (res.code === 1) {
                let readParams = {
                    filename: params.file.name,
                    filepath: res.data,
                };
                if (file_ext == "dwg") {
                    this.readDWG(readParams);
                }
                if (file_ext == "txt") {
                    this.readTXT(readParams);
                }
                if (file_ext == "zip" || file_ext == "shp") {
                    this.readSHP(readParams);
                }
            } else {
                this.$message.error(res.msg);
            }
        },
        // 读取DWG
        async readDWG(params) {
            const { data: res } = await readDWGApi(params);
            if (res.code === 1) {
                this.overLayer(res.data, params.filename);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },
        //读取TXT
        async readTXT(params, filename) {
            const { data: res } = await readTXTApi(params);
            if (res.code === 1) {
                this.overLayer(res.data, params.filename);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },
        //读取shp
        async readSHP(params, filename) {
            const { data: res } = await readSHPApi(params);
            if (res.code === 1) {
                this.overLayer(res.data, params.filename);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },
        // 叠加图形到地图
        async overLayer(pointData, filename) {
            //this.mapview.graphics.removeAll();
            handleUploadOverLayer(pointData, filename);
            this.upLoading.close();
        },
        //缓冲确定
        bufferOK() {
            handleBufferGeo(this.bufferDistance, this.radioID);
        },

        // 表格行点击
        tableDataRowClick() {},

        // 表格行单选按钮
        changeRadio(row) {
            console.log(row, "row");
            this.currentTableDataItem = row;
            //let index = row.index;
            ReloadHgscGraphic(row.geo);
        },
        //导出界址点
        async exportZJDBtnClick(item) {
            console.log(item); // 当前行数据
            var pointstr = await GeoToPointStr(item.geo);
            let params = {
                dkname: item.name.split(".")[0],
                pointStr: pointstr,
            };
            const { data: res } = await exportZJDExcel(params);
            if (res.code === 1) {
                window.open(apiURL_file + res.data);
            }
        },
        // 开始审查
        // 2024.02.21 - 结果不清空，叠加
        async handleBeginExam() {
            console.log(this.currentTableDataItem);
            if (
                this.currentTableDataItem == undefined ||
                this.currentTableDataItem == null
            ) {
                this.loading = false;
                this.$message.warning("请选择审查图形");
                return;
            }
            if (
                this.selectLayer == null ||
                this.selectLayer == undefined ||
                this.selectLayer == "" ||
                this.selectLayer == "0"
            ) {
                this.loading = false;
                this.$message.warning("请选择审查图层");
                return;
            }
            this.GeoNames.push(this.currentTableDataItem.name);
            this.loading = true;
            this.landDrawer = true;
            // this.scResultTable = [];
            let pointstr = await GeoToPointStr(this.currentTableDataItem.geo);
            var data = {
                wkid: this.mapview.spatialReference.wkid,
                points: pointstr,
                layerid: this.selectLayer,
                geoname: this.currentTableDataItem.name,
            };
            let { data: res } = await startXMHC(data);
            if (res.code == 1) {
                this.loading = false;
                // this.scResultTable = res.data;
                this.scResultTable.push(...res.data);
            } else {
                this.loading = false;
                this.$message.error(res.msg);
            }
        },

        // 审查表格行点击
        scRowClick() {},

        // 导出数据
        exportData() {
            let wb = XLSX.utils.table_to_book(
                document.querySelector("#scResultTable"),
                { raw: true }
            );
            let wbout = XLSX.write(wb, {
                bookType: "xlsx",
                bookSST: true,
                type: "array",
            });
            try {
                FileSaver.saveAs(
                    new Blob([wbout], { type: "application/octet-stream" }),
                    "项目核查导出数据表" + ".xlsx"
                );
            } catch (e) {
                this.$message({
                    message: "导出失败",
                    type: "error",
                });
            }
        },

        // 切换抽屉高度
        switchHeight() {
            this.switchDrawer = !this.switchDrawer;
            if (!this.switchDrawer) {
                this.switchDrawerIcon = "el-icon-arrow-up";
                this.drawerSize = "5%";
            } else {
                this.switchDrawerIcon = "el-icon-arrow-down";
                this.drawerSize = "47%";
            }
        },

        // 抽屉关闭动画结束后状态恢复
        drawerClosed() {
            this.drawerSize = "47%";
            this.switchDrawer = true;
            this.switchDrawerIcon = "el-icon-arrow-down";
        },

        // pagesize 改变时触发
        handleSizeChange(val) {
            this.pagesize = val;
        },
        // currentpage 改变时触发
        handleCurrentChange(val) {
            this.currentPage = val;
        },
        //导出pdf
        async exportPdf() {
            if (this.GeoNames.length == 0) {
                this.$message.warning("没有审查结果");
                return;
            }

            let padloading = this.$notify({
                iconClass: "el-icon-loading",
                message: "正在导出报告......",
                duration: 0,
                customClass: "prop-search",
            });
            let names = "";
            this.GeoNames.forEach((name) => {
                names += name + ",";
            });
            let { data: res } = await exportXMHCPdf({
                geonames: names.substring(0, names.length - 1),
            });
            if (res.code == 1) {
                padloading.close();
                // this.scResultTable = res.data;
                window.open(apiURL_file + res.data);
            } else {
                padloading.close();
                this.$message.error(res.msg);
            }
        },
    },
};
