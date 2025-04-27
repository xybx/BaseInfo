/*
 * @Author: WCL
 * @Date: 2022-02-18 10:30:28
 * @LastEditors: WCL
 * @LastEditTime: 2022-04-02 10:47:43
 * @FilePath: \webgis\src\components\onemap\onemap-project\js\onemap-project.js
 * @Description: 项目核查JS
 */
import { mapMutations, mapState } from 'vuex';
import { GeoToPointStr } from '@/utils/common-map-method';
import {
    uploadDwg,
    readDWGApi,
    readTXTApi,
    readSHPApi,
} from '@/utils/topic-map';
import {
    drawPolygon,
    handleUploadOverLayer,
    handleBufferGeo,
    ClearHgsc,
    ReloadHgscGraphic,
} from '@/utils/mapdraw';
import { getAllOpenLayers, getOpenSonLayers } from '@/utils/common-map-method.js';
import * as query from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import Graphic from '@arcgis/core/Graphic';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            layerOptions: [],
            selectLayer: null,
            overlayLayer: null,
            dialogVisible: false,
            comTitle: '',
            upArea: 0,
            upBtnList: [
                {
                    type: 'CAD',
                    ref: 'refCAD',
                    url: require('@/assets/images/onemap-images/up_cad.png'),
                    accept: '.dwg',
                },
                {
                    type: 'SHP',
                    ref: 'refSHP',
                    url: require('@/assets/images/onemap-images/up_shp.png'),
                    accept: '.zip',
                },
                {
                    type: 'TXT',
                    ref: 'refTXT',
                    url: require('@/assets/images/onemap-images/up_txt.png'),
                    accept: '.txt',
                },
            ],
            upTXT: '', // 上传文件名
            isBuffer: false, // 缓冲距离复选框
            bufferDistance: '', // 缓冲距离
            //tableData: [],
            landDrawer: false, // 审查抽屉
            scResultTable: [], // 审查结果数据
            radioID: '',
            switchDrawer: true,
            switchDrawerIcon: 'el-icon-arrow-down',
            drawerSize: '30%',
            currentPage: 1,
            pagesizeArr: [10, 20, 50, 100],
            pagesize: 10,
            total: 0,
            tableColsData: [],
            loading: true,
            openServerList: [],
            btnloading:false,
        };
    },
    computed: {
        ...mapState('map2d-store', [
            'tableData',
            'hgscRadioID',
            'hgscUploadDKArea',
            'mapview',
        ]),
    },
    watch: {
        dialogVisible(boo) {
            if (boo) {

                //this.getTableCols();
            } else {
                this.landDrawer = false;
            }
        },
    },
    created() { },
    mounted() {
    },
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
        ]),
        ...mapMutations('map2d-store', ['cleartableData']),

        // 打开弹窗
        showDialog(obj) {
            this.comTitle = obj.title;
            //this.cleartableData(); //清空列表
            this.dialogVisible = true;
            this.handleToggleIndex(false);
            this.layerOptions = getOpenSonLayers();
        },
        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: 'init' });
            this.handleToggleIndex(true);
            this.dialogVisible = false;
            this.landDrawer = false;
        },


        // 开始审查
        async handleBeginExam() {
            let app = this;
            app.btnloading=true;
            debugger;
            if (
                this.selectLayer == undefined ||
                this.selectLayer == null || this.selectLayer == '' || this.selectLayer == '0'
            ) {
                this.loading = false;
                this.$message.warning('请选择分析图层');
                return;
            }
            if (this.overlayLayer == null || this.overlayLayer == undefined || this.overlayLayer == '' || this.overlayLayer == '0') {
                this.loading = false;
                this.$message.warning('请选择叠加图层');
                return;
            }
            if (this.selectLayer == this.overlayLayer) {
                this.loading = false;
                this.$message.warning('请选择不同的数据进行叠加分析');
                return;
            }
            this.loading = true;
            this.landDrawer = true;
            this.scResultTable = [];
            let fxLayer = null;
            let overlayLayer = null;
            for (let i = 0; i < this.layerOptions.length; i++) {
                const element = this.layerOptions[i];
                if (element.index == this.selectLayer) {
                    fxLayer = element;
                }
                if (element.index == this.overlayLayer) {
                    overlayLayer = element;
                }
            }


            //查询所有行政区边界范围
            var queryParams = new Query();
            queryParams.where = '1=1';
            queryParams.outFields = ['*'];
            queryParams.returnGeometry = true;
            query.executeQueryJSON(fxLayer.url, queryParams).then(async function (result) {
                if (result != null && result.features.length > 0) {
                    debugger;
                    var allgeos = []; //所有相交图形集合
                    result.features.map((feature) => {
                        allgeos.push(feature.geometry);
                    });
                    //合并相交图形为一个图形，计算相交
                    allgeos = await geometryEngine.union(
                        allgeos
                    );

                    //叠加图层
                    var queryParams1 = new Query();
                    queryParams1.where = '1=1';
                    queryParams1.outFields = ['*'];
                    queryParams1.returnGeometry = true;
                    queryParams1.geometry = allgeos;
                    query.executeQueryJSON(overlayLayer.url, queryParams1).then(function (result_overlay) {
                        let ctgeos = [];
                        if (result_overlay != null && result_overlay.features.length > 0) {
                            debugger;
                            result_overlay.features.map((feature) => {
                                ctgeos.push(feature.geometry);
                            });
                            //合并相交图形为一个图形，计算相交
                            ctgeos = geometryEngine.union(
                                ctgeos
                            );

                            //计算冲突面积
                            let ctarea = geometryEngine.planarArea(
                                ctgeos,
                                'hectares'
                            );
                            console.log("ctarea", ctarea);
                            app.loading = false;
                            app.btnloading=false;
                            app.scResultTable.push({ name: "重叠面积", area: Number(ctarea).toFixed(4) + "公顷" })
                        }
                    });
                }
            });


            // let pointstr = GeoToPointStr(this.currentTableDataItem.geo);
            // var data = {
            //     wkid: this.mapview.spatialReference.wkid,
            //     points: pointstr,
            //     layerid: this.selectLayer
            // };
            // let { data: res } = await startXMHC(data);
            // if (res.code == 1) {
            //     this.loading = false;
            //     this.scResultTable = res.data;
            // } else {
            //     this.loading = false;
            //     this.$message.error(res.msg);
            // }
        },

        // 审查表格行点击
        scRowClick() { },
    },
};
