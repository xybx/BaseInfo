/*
 * @Author: WCL
 * @Date: 2022-02-17 16:19:24
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 16:36:54
 * @FilePath: \webgis\src\components\onemap\onemap-redline\js\onemap-redline.js
 * @Description: 请填写描述
 */
import { mapMutations, mapState } from 'vuex';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { identify } from '@arcgis/core/rest/identify';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';

import { getHXDownLoadLayers, getHXCAD } from '../api/onemap-redline-api';
import { getAllOpenLayers } from '@/utils/common-map-method';
let app;
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            dialogVisible: false,
            comTitle: '',
            projectname: '',
            tableData: [],
            dropRedList: [
                {
                    title: '图层列表',
                    pid: '',
                    sdeid: '',
                    childtables: '',
                    tablename: '',
                    objectid: '',
                    projectname: '',
                },
            ],
            dropItem: '',
            dropCount: '0',
            hxLayers: [], //可下载的红线图层列表
            openHxLayers: [], //打开的红线图层
            view_click: null, //地图点击事件
            isViewClick: false,
            hxLayerData: [], //保存查询的全部数据
            dropCurrentItem: null,
            caddwgurl: '',
            cad40dwgurl: '',
            isTableShow: false,
            selectType: true,
            isCadDisable: true,
            tipshow: false,
            creatLoading: null,
            showfields: [
                // '索引值',
                // '项目ID',
                // '用地位置',
                // '用地单位',
                // '项目名称',
                // '建设单位',
                // '批准面积',
                // '用地面积(亩)',
                // '土地坐落',
                // '入库时间',
            ],
            isAttr: false,
            tagList: [],
            focusTag: '',
            layernames: [],
            layerindex: 0,
            curlayer: null,
            generateDisabled: false,
        };
    },
    computed: {
        ...mapState('map2d-store', ['mapview', 'toolStatus', 'symbol']),
    },
    watch: {},
    created() {},
    mounted() {
        app = this;
        this.dropItem = this.dropRedList[0].title;
        this.setSymbol();
    },
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
        ]),
        ...mapMutations('map2d-store', ['setSymbol']),
        // 打开弹窗
        showDialog(obj) {
            this.comTitle = obj.title;
            this.dialogVisible = true;
            this.handleToggleIndex(false);
            this.getHXLayers();
            if (this.mapview.viewClick != null) {
                this.mapview.viewClick.remove();
            }
        },

        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: 'init' });
            this.handleToggleIndex(true);
            this.dialogVisible = false;
            if (this.mapview.viewClick != null) {
                this.mapview.viewClick.remove();
            }
        },

        changeTag(item) {
            console.log(item);
            this.focusTag = item.value;
            this.tableData = item.data;
            this.curlayer = item;
            //定位
            this.mapview.graphics.removeAll();
            this.mapview.graphics.add(item.graphic);
            this.mapview.extent = item.graphic.geometry.extent;
            this.mapview.zoom = userconfig.view.zoom - 2;
        },
        async generateCAD() {
            debugger;
            app.isCadDisable = true;
            if (this.dropCurrentItem == null) {
                this.$notify.warning('没有可下载图层，请查询可下载图层');
                return;
            }
            app.creatLoading = this.$notify({
                iconClass: 'el-icon-loading',
                message: '正在生成cad文件......',
                duration: 0,
                customClass: 'prop-search',
            });
            this.generateDisabled = true;

            var dropitem = this.dropCurrentItem;
            //var xmname = this.projectname;
            let params = {
                pid: dropitem.pid,
                sdeid: dropitem.sdeid,
                layername: dropitem.title,
                tablename: dropitem.tablename,
                objectid: this.curlayer.objectid,
                xmname: this.curlayer.projectname,
            };
            const { data: res } = await getHXCAD(params);
            if (res.code == 1) {
                app.creatLoading.close();
                var d = res.data;
                app.caddwgurl = d.cadpath;
                //app.cad40dwgurl = d.data.cadpath40;
                app.isCadDisable = false;
                app.$notify.success('生成cad成功');
                this.generateDisabled = false;
            } else {
                app.creatLoading.close();
                app.$notify.error(res.msg);
                this.generateDisabled = false;
            }
        },
        downlaodcad() {
            window.location.href = apiURL_file + this.caddwgurl;
        },
        downlaodshp() {
            if (this.dropCurrentItem == null) {
                this.$notify.warning('没有可下载图层，请查询可下载图层');
                return;
            }
            app.creatLoading = this.$notify({
                iconClass: 'el-icon-loading',
                message: '正在下载shp文件......',
                duration: 0,
                customClass: 'prop-search',
            });

            var dropitem = this.dropCurrentItem;
            //var xmname = this.projectname;
            this.$http
                .get('HXDownload/ExportHXSHP', {
                    params: {
                        pid: dropitem.pid,
                        sdeid: dropitem.sdeid,
                        layername: dropitem.title,
                        tablename: dropitem.tablename,
                        objectid: this.curlayer.objectid,
                        xmname: this.curlayer.projectname,
                    },
                })
                .then(function (res) {
                    debugger;
                    // loading.close();
                    app.creatLoading.close();
                    var d = JSON.parse(res.data);
                    if (d.code == 0) {
                        app.$notify.error(d.msg);
                    } else {
                        window.location.href = apiURL_file + d.data;
                    }
                });
        },

        // 下拉框选择
        handleDropCmd() {
            this.dropItem = obj.title;
            this.dropCurrentItem = obj;
            this.hxLayerData = obj.itemdata;
            this.projectname = obj.itemdata[0].projectname;
            app.focusTag = obj.itemdata[0].value;
            this.curlayer = obj.itemdata[0];
            //定位
            this.mapview.graphics.removeAll();
            this.mapview.graphics.add(obj.itemdata[0].graphic);
            this.mapview.extent = obj.itemdata[0].graphic.geometry.extent;
            this.mapview.zoom = userconfig.view.zoom - 2;
            this.tableData = obj.itemdata[0].data;
        },

        // 获取可下载的红线图层配置
        async getHXLayers() {
            let user = {
                uid: window.sessionStorage.getItem('userid'),
            };
            const { data: res } = await getHXDownLoadLayers(user);
            if (res.code === 1) {
                this.hxLayers = res.data;
            }
        },

        ///获取可下载的打开的图层
        async getOpenLayers() {
            var QuerylayerArr = [];
            //获取当前地图叠加的全部图层
            var allopenlayers = await getAllOpenLayers();
            allopenlayers.forEach((element) => {
                app.hxLayers.forEach((item) => {
                    if (element.layername == item.servername) {
                        var tablename = '';
                        if (item.childtables) {
                            tablename = item.childtables[0].tablename;
                        }
                        var layeritem = {
                            layername: element.layername,
                            layerurl: element.layerurl,
                            sublayer: element.sublayer,
                            pid: item.pid,
                            sdeid: item.sdeid,
                            childtables: item.childtables,
                            tablename: tablename,
                        };
                        QuerylayerArr.push(layeritem);
                    }
                });
            });
            debugger
            app.openHxLayers = QuerylayerArr;
        },

        // 选择项目
        async selectProject() {
            await this.getOpenLayers();
            if (this.openHxLayers.length == 0) {
                this.$notify.warning('没有打开可下载图层！');
                return;
            }
            if (app.toolStatus.attr) {
                app.$notify.warning('请关闭属性查询');
                return;
            }
            if (this.mapview.viewClick != null) {
                this.mapview.viewClick.remove();
            }
            app.selectType = !app.selectType;
            this.mapview.viewClick = this.mapview.on(
                'click',
                async function (evt) {
                    console.log(app.mapview);
                    app.isTableShow = true;
                    app.dropRedList = [];
                    app.tableData = [];
                    app.hxLayerData = [];
                    app.layernames = [];
                    app.dropItem = '';
                    app.dropCount = 0;
                    app.layerindex = 0;
                    app.mapview.graphics.removeAll();
                    for await (let item of app.openHxLayers) {
                       // var identifytask = new IdentifyTask(item.layerurl);
                        var identifyparams = new IdentifyParameters();
                        identifyparams.tolerance = 1;
                        identifyparams.layerIds = item.sublayer;
                        identifyparams.layerOption = 'top';
                        identifyparams.width = app.mapview.width;
                        identifyparams.height = app.mapview.height;
                        identifyparams.geometry = evt.mapPoint;
                        identifyparams.mapExtent = app.mapview.extent;
                        IdentifyParameters.returnFieldName = true;
                        identifyparams.returnGeometry = true;
                        let result = await identify(item.layerurl,identifyparams);
                        console.log(result, 'hxdownload');
                        if (result != null && result.results.length > 0) {
                            for (let i = 0; i < result.results.length; i++) {
                                var layerdata = {};
                                let itemdata = result.results[i];
                                var projectname = '';
                                var layerName = itemdata.layerName;
                                let feature = itemdata.feature;
                                var objectid = 0;
                                var data = [];
                                var displayname = itemdata.displayFieldName;
                                for (var featureitem in feature.attributes) {
                                    if (
                                        featureitem.toLowerCase() ==
                                        displayname.toLowerCase()
                                    ) {
                                        projectname =
                                            feature.attributes[featureitem];
                                    }
                                    if (
                                        featureitem.toLowerCase() ==
                                            'objectid' ||
                                        featureitem == '索引值'
                                    ) {
                                        objectid =
                                            feature.attributes[featureitem];
                                    }
                                    var shapestr = 'shape'.toLocaleLowerCase();
                                    if (
                                        featureitem
                                            .toLocaleLowerCase()
                                            .indexOf(shapestr) < 0
                                    ) {
                                        var object = new Object();
                                        object.field = featureitem;
                                        object.value =
                                            feature.attributes[featureitem] !=
                                            'Null'
                                                ? feature.attributes[
                                                      featureitem
                                                  ]
                                                : '';
                                        data.push(object);
                                    }
                                }
                                //图形显示
                                var graphic = new Graphic({
                                    geometry: feature.geometry,
                                    symbol: app.symbol,
                                });
                                layerdata.layername = layerName;
                                layerdata.data = data;
                                layerdata.projectname = projectname;
                                layerdata.graphic = graphic;
                                layerdata.value = app.layerindex;
                                layerdata.objectid = objectid;

                                //图层下拉列表赋值
                                //获取要素集名称
                                //   var tablename = "";
                                //   for (
                                //     let t = 0;
                                //     t < item[identifyCount].childtables.length;
                                //     t++
                                //   ) {
                                //     if (
                                //       QuerylayerArr[identifyCount].childtables[t].layername ==
                                //       layerName
                                //     ) {
                                //       tablename =
                                //         QuerylayerArr[identifyCount].childtables[t].tablename;
                                //     }
                                //   }

                                var dropitem = {
                                    title: itemdata.layerName,
                                    pid: item.pid,
                                    sdeid: item.sdeid,
                                    tablename: item.tablename,
                                    objectid: objectid,
                                    projectname: projectname,
                                    displayname: displayname,
                                    itemdata: [],
                                    //graphic: graphic,
                                };

                                debugger;
                                if (app.layernames.length > 0) {
                                    if (
                                        app.layernames.indexOf(dropitem.title) <
                                        0
                                    ) {
                                        app.dropRedList.push(dropitem);
                                        dropitem.itemdata.push(layerdata);
                                        app.layernames.push(itemdata.layerName);
                                    } else {
                                        app.dropRedList.forEach((element) => {
                                            if (
                                                element.title ==
                                                layerdata.layername
                                            ) {
                                                element.itemdata.push(
                                                    layerdata
                                                );
                                            }
                                        });
                                    }
                                } else {
                                    app.layernames.push(itemdata.layerName);
                                    dropitem.itemdata.push(layerdata);
                                    app.dropRedList.push(dropitem);
                                }
                                app.dropCount = app.dropRedList.length;
                                app.layerindex++;
                            }
                        }
                    }

                    //默认显示第一项
                    if (app.dropRedList.length > 0) {
                        //图形显示
                        // var graphic = new Graphic({
                        //     geometry: feature.geometry,
                        //     symbol: userconfig.symbol,
                        // });
                        app.mapview.graphics.add(
                            app.dropRedList[0].itemdata[0].graphic
                        );
                        app.mapview.extent =
                            app.dropRedList[0].itemdata[0].graphic.geometry.extent;
                        app.mapview.zoom = app.mapview.zoom - 2;

                        app.dropCurrentItem = app.dropRedList[0];
                        app.dropItem = app.dropRedList[0].title;
                        app.hxLayerData = app.dropRedList[0].itemdata;
                        app.tableData = app.dropRedList[0].itemdata[0].data;
                        app.projectname =
                            app.dropRedList[0].itemdata[0].projectname;
                        app.focusTag = app.dropRedList[0].itemdata[0].value;
                        app.curlayer = app.dropRedList[0].itemdata[0];
                    }
                }
            );
        },
    },
};
