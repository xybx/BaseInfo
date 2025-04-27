/*
 * @Author: WCL
 * @Date: 2021-12-02 11:40:06
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-12 17:45:55
 * @FilePath: \webgis\src\components\onemap\onemap-hegui\js\onemap-hegui.js
 * @Description: 合规审查JS
 */
// import QueryTask from '@arcgis/core/tasks/QueryTask';
import * as query from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import {
    getLayers,
    exportZJDExcel,
    exportReport,
} from '../api/onemap-hegui-api';
import {
    preloadLayer,
    visibleLayer,
    addlayer,
    removelayer,
    exportPointTxt,
    GetGeoDifference,
    GeoToPointStr,
    saveMapPrintImage,
    mapScreenhotOptions,
    mapScreenhot,
    clearMapGraphics,
    getAreaAndLength
} from '@/utils/common-map-method';
import { mapMutations, mapState } from 'vuex';

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
} from '../../../../utils/mapdraw';

let app;
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
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
            // 分析内容表格
            // tableData: [
            //     { name: 'xx1', area: 'xx', distance: 'xx' },
            //     { name: 'xx2', area: 'xx', distance: 'xx' },
            //     { name: 'xx3', area: 'xx', distance: 'xx' },
            // ],
            // 审查图层树
            treeData: [
                // { ID:0,LAYERNAME: "林地图层", LAYERURL: "666" ,CHILDID:0,REGULATION:"禁止占用"},
            ],
            //选中的当前要审查的图层列表
            selectTreeData: [],
            layerProps: {
                label: 'LAYERNAME',
                children: 'CHILDREN',
            },
            landDrawer: false, // 审查抽屉
            scResultTable: [
                // {
                //   layername: "图层1",
                //   result: "有交叉",
                //   insertarea: 10,
                //   children: [{ subname: "交叉1", subtype: "类型1" }],
                // },
                // { layername: "图层2", result: "无交叉", insertarea: 0 },
                // { layername: "图层3", result: "有交叉", insertarea: 20 },
            ], // 审查结果数据
            radioID: '',
            currentTableDataItem: null, //分析内容列表的当前选中的图形数据项
            hgscIntersectLayer: null, //保存合规审查相交图形的layer
            upLoading: null, // 上传,
            loading: null,
        };
    },
    computed: {
        ...mapState('map2d-store', [
            'tableData',
            'hgscRadioID',
            'hgscUploadDKArea',
            'mapview',
            'intersectsSymbol',
        ]),
    },
    watch: {
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
        dialogVisible(boo) {
            if (!boo) {
                this.landDrawer = false;
                ClearHgsc();
                this.upArea = 0;
                this.upTXT = '';
                this.currentTableDataItem = null;
                this.scResultTable = [];
                this.selectTreeData = [];
                var hgscIntersectlayer =
                this.mapview.map.findLayerById('hgscIntersectLayer');
                if (hgscIntersectlayer) {
                    hgscIntersectlayer.graphics.removeAll();
                }
            }
        },
    },
    created() { },
    mounted() {
        app = this;

        this.setSymbol(); //初始化渲染图形
    },
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
        ]),

        ...mapMutations('map2d-store', ['cleartableData', 'setSymbol']),
        // 打开弹窗
        showDialog(obj) {
            this.comTitle = obj.title;
            this.currentTableDataItem = null;
            this.scResultTable = [];
            this.selectTreeData = [];
            this.cleartableData(); //清空列表
            this.dialogVisible = true;
            this.handleToggleIndex(false);
            this.getLayers();
        },

        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: 'init' });
            this.handleToggleIndex(true);
            this.dialogVisible = false;
            this.landDrawer = false;
            this.upArea = 0;
            this.upTXT = '';
            this.currentTableDataItem = null;
            this.scResultTable = [];
            this.selectTreeData = [];
            this.cleartableData(); //清空列表
            ClearHgsc(); //清空图形
            clearMapGraphics(this.treeData);
            var hgscIntersectlayer =
                this.mapview.map.findLayerById('hgscIntersectLayer');
                if (hgscIntersectlayer) {
                    hgscIntersectlayer.graphics.removeAll();
                }
        },
        //加载审查的图层列表
        async getLayers() {
            let user = {
                uid: window.sessionStorage.getItem('userid'),
            };
            const { data: res } = await getLayers(user);
            if (res.code === 1) {
                this.treeData = res.data;
                //预加载图层到地图上
                preloadLayer(this.treeData);
            }
        },
        //绘制范围
        drawPolygon() {
            drawPolygon();
        },
        // 分析内容表格单选
        changeRadio(row) {
            console.log(row, 'row');
            this.currentTableDataItem = row;
            //let index = row.index;
            ReloadHgscGraphic(row.geo);
        },
        // 分析内容表格行点击事件
        tableDataRowClick(data) {
            this.radioID = data.index;
            this.changeRadio(data);
        },
        // 上传事件
        async uploadFile(params) {
            console.log(params);
            this.upTXT = params.file.name;
            this.upLoading = this.$message({
                iconClass: 'el-icon-loading',
                message: '上传中...',
                duration: 0,
                customClass: 'prop-search',
            });
            var file_ext = params.file.name
                .split('.')
            [params.file.name.split('.').length - 1].toLowerCase();
            var savefilepath = 'HGSC';
            if (file_ext == 'dwg') {
                savefilepath = 'DWG';
            }
            if (file_ext == 'txt') {
                savefilepath = 'TXT';
            }
            if (file_ext == 'zip' || file_ext == 'shp') {
                savefilepath = 'SHP';
            }
            let form = new FormData();
            form.append('file', params.file);
            form.append('filepath', savefilepath);
            const { data: res } = await uploadDwg(form);
            if (res.code === 1) {
                let readParams = {
                    filename: params.file.name,
                    filepath: res.data,
                };
                if (file_ext == 'dwg') {
                    this.readDWG(readParams);
                }
                if (file_ext == 'txt') {
                    this.readTXT(readParams);
                }
                if (file_ext == 'zip' || file_ext == 'shp') {
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
        //导出界址点
        async exportZJDBtnClick(item) {
            console.log(item); // 当前行数据
            var pointstr =await GeoToPointStr(item.geo);
            let params = {
                dkname: item.name.split('.')[0],
                pointStr: pointstr,
            };
            const { data: res } = await exportZJDExcel(params);
            if (res.code === 1) {
                window.open(apiURL_file + res.data);
            }
        },

        // 审查图层树节点选择事件
        handleTreeCheck(data, isCheck, isHasChild) {
            console.log(data); // 节点数据
            console.log(isCheck); // 是否选中
            console.log(isHasChild); // 是否有子节点
            if (isCheck) {
                //叠加图层
                //addlayer(data.LAYERNAME, data.LAYERURL);
                this.selectTreeData.push(data);
            } else {
                var index = this.selectTreeData.indexOf(data);
                this.selectTreeData.splice(index, 1);
                //移除图层
                //removelayer(data.LAYERNAME, data.LAYERURL);
            }
        },

        // 开始审查
        async handleBeginExam() {
            //把合规审查相交图形的layer添加到地图上
            var hgscIntersectlayer =
                this.mapview.map.findLayerById('hgscIntersectLayer');
            if (hgscIntersectlayer != undefined) {
                this.hgscIntersectLayer.removeAll();
            } else {
                this.hgscIntersectLayer = new GraphicsLayer({
                    id: 'hgscIntersectLayer',
                    title: '合规审查相交图形',
                });
                this.mapview.map.add(
                    this.hgscIntersectLayer,
                    this.mapview.map.layers.length
                );
                //console.log(this.mapview.map);
            }

            if (this.selectTreeData.length > 0) {
                if (!this.currentTableDataItem) {
                    return this.$message.error('请选择要分析的图形');
                }

                app.loading = this.$notify({
                    iconClass: 'el-icon-loading',
                    message: '正在审查中......',
                    duration: 0,
                    customClass: 'prop-search',
                });

                //获取当前选中的审查图形
                let geo = this.currentTableDataItem.geo;
                this.landDrawer = true;
                this.scResultTable = [];
                for await (let item of this.selectTreeData) {
                    //显示图层
                    await visibleLayer(item.LAYERNAME, true);
                    //await addlayer(item.LAYERNAME, item.LAYERURL);

                    var queryParams = new Query();
                    queryParams.where = '1=1';
                    queryParams.outFields = ['*'];
                    queryParams.geometry = geo;
                    queryParams.returnGeometry = true;
                    if (item.REGULATION.indexOf('禁止') >= 0) {
                        queryParams.spatialRelationship = 'intersects';
                    }
                    let results = await query.executeQueryJSON(
                        item.LAYERURL + '/' + item.CHILDID,
                        queryParams
                    );
                    if (results != null && results.features.length > 0) {
                        //有交叉
                        var intersectGeos = []; //所有相交图形集合
                        var intersectArea = 0; //相交面积
                        var intersectUnionGeo = null; //所有相互图形合并成一个图形
                        results.features.map((feature) => {
                            intersectGeos.push(feature.geometry);
                        });
                        //清空相交layer的所有图形
                        this.hgscIntersectLayer.removeAll();
                        //合并相交图形为一个图形，计算相交
                        intersectGeos = await geometryEngine.union(
                            intersectGeos
                        );
                        intersectUnionGeo = await geometryEngine.intersect(
                            intersectGeos,
                            geo
                        );
                        if (intersectUnionGeo != null) {
                            let graphic = new Graphic({
                                geometry: intersectUnionGeo,
                                symbol: this.intersectsSymbol,
                            });
                            this.hgscIntersectLayer.add(graphic);
                            let areaandlength = await getAreaAndLength(intersectUnionGeo);
                            // intersectArea = await geometryEngine.planarArea(
                            //     intersectUnionGeo,
                            //     'hectares'
                            // );
                            intersectArea = parseFloat(areaandlength.area * 0.0001).toFixed(4);
                        }
                        this.scResultTable.push({
                            layername: item.LAYERNAME,
                            result: '占用',
                            dknum: results.features.length,
                            insertarea: intersectArea,
                            intersectGeo: intersectUnionGeo,
                        });
                        //保存冲突图形
                        //console.log(this.hgscIntersectLayer.loaded,"loaded");
                        await setTimeout(async function () {
                            let imagedata = await mapScreenhot();
                            if (imagedata) {
                                //隐藏图层
                                await visibleLayer(item.LAYERNAME, false);
                            }
                            //filename, savepath, imagedata,imagetype
                            let res = await saveMapPrintImage(
                                item.LAYERNAME,
                                'HGSC',
                                imagedata,
                                2
                            );
                        }, 100);

                        //await removelayer(item.LAYERNAME, item.LAYERURL);
                    } else {
                        //隐藏图层
                        await visibleLayer(item.LAYERNAME, false);
                        //无交叉
                        this.scResultTable.push({
                            layername: item.LAYERNAME,
                            result: '无占用',
                            dknum: 0,
                            insertarea: 0,
                            insertGeo: null,
                        });
                    }
                    console.log(results, 'results');
                }

                // this.selectTreeData.map(async (item) => {

                // });
                //清空所有图形
                this.hgscIntersectLayer.removeAll();
                //移除所有图层
                //this.mapview.map.layers.v();
                app.loading.close();
            } else {
                this.$message.warning('请选择要审查的图层');
            }
        },
        //截图
        async printIamge(filename) { },

        //遍历审查每一个图层
        async handleExamLayer(geo) { },

        //审查结果表格行点击事件
        scRowClick(row) {
            var hgscIntersectlayer =
                this.mapview.map.findLayerById('hgscIntersectLayer');
            hgscIntersectlayer.removeAll();

            this.selectTreeData.forEach(async (element) => {
                if (element.LAYERNAME == row.layername) {
                   // await visibleLayer(row.layername, true);
                    var layer = this.mapview.map.findLayerById(row.layername);
                    if (layer != undefined) {
                      layer.visible = !layer.visible;
                    } else {
                      console.log("无法找到图层:" + layername);
                    }

                } else {
                   // await visibleLayer(element.LAYERNAME, false);
                }
            });

            if (row.intersectGeo == null) {
                //this.hgscIntersectLayer.removeAll();
                return;
            }
            let graphic = new Graphic({
                geometry: row.intersectGeo,
                symbol: this.intersectsSymbol,
            });
            hgscIntersectlayer.add(graphic);
        },
        //导出没有冲突的红线图形坐标点
        async exportNoCTPointsClick() {
            app.loading = this.$notify({
                iconClass: 'el-icon-loading',
                message: '正在导出坐标点txt文件......',
                duration: 0,
                customClass: 'prop-search',
            });

            console.log(this.scResultTable, 'scResultTable');
            //当前选中的红线图形
            var currentgeo = this.currentTableDataItem.geo;
            var intersectGeos = [];
            //遍历审查结果与相交的图形做裁剪
            this.scResultTable.map((item) => {
                if (item.intersectGeo != null) {
                    intersectGeos.push(item.intersectGeo);
                }
            });
            if (intersectGeos.length == 0) {
                app.loading.close();
                this.$message.warning('当前审查得地块与审查的红线没有冲突');
                return;
            }

            var diffGeo = await GetGeoDifference(currentgeo, intersectGeos);
            if (diffGeo != null && diffGeo != undefined) {
                await exportPointTxt(
                    diffGeo,
                    '【' +
                    this.currentTableDataItem.name.split('.')[0] +
                    '】不冲红线图形的坐标点',
                );
            }
            else
            {
               // this.$message.warning('当前分析的图形与分析图层完全重叠！');
            }
            app.loading.close();
        },

        //导出报告
        async handleExportReport() {
            app.loading = this.$notify({
                iconClass: 'el-icon-loading',
                message: '正在导出报告......',
                duration: 0,
                customClass: 'prop-search',
            });

            //关闭叠加图层
            this.selectTreeData.forEach(async (element) => {
                await visibleLayer(element.LAYERNAME, false);
            });

            await setTimeout(async function () {
                //截图上传的红线地块示意图
                let imagedata = await mapScreenhot();
                let res = await saveMapPrintImage(
                    app.currentTableDataItem.name.split('.')[0],
                    'HGSC',
                    imagedata,
                    1
                );
                if (res.code == 1) {
                    //导出报告
                    let params = {
                        dkname: app.currentTableDataItem.name.split('.')[0],
                        dkarea: app.currentTableDataItem.area,
                        clinetwidth: app.mapview.width,
                        clinetheight: app.mapview.height,
                        layerDatas: app.scResultTable,
                    };
                    debugger;
                    res = await exportReport(params);
                    if (res.data.code == 1) {
                        app.loading.close();
                        window.open(apiURL_file + '/' + res.data.data);
                    } else {
                        app.loading.close();
                        this.$message.error(res.data.msg);
                    }
                } else {
                    app.loading.close();
                }
            }, 300);
        },
    },
};
