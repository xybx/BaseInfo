/*
 * @Author: WCL
 * @Date: 2021-12-13 13:36:19
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:21:44
 * @FilePath: \webgis\src\components\onemap\onemap-unit\js\onemap-unit.js
 * @Description: 单元监测JS
 */
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import * as identify from '@arcgis/core/rest/identify';
import Graphic from '@arcgis/core/Graphic';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import { executeQueryJSON } from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import { mapState, mapMutations } from 'vuex';
import { getLayers, exportFile } from '../api/onemap-unit-api';
import { printMap } from '@/utils/topic-map';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            dialogVisible: false,
            comTitle: '',
            isExport: true,
            unitForm: {
                title: '',
                scale1: '1',
                scale2: '',
                date: '',
                zttype: 1, //单元检测
                dpi: 96,
            },
            rules: {
                title: [
                    {
                        required: true,
                        message: '标题不能为空',
                        trigger: 'blur',
                    },
                ],
                scale2: [
                    {
                        required: true,
                        message: '比例尺不能为空',
                        trigger: 'blur',
                    },
                ],
                date: [
                    {
                        required: true,
                        message: '日期不能为空',
                        trigger: 'blur',
                    },
                ],
            },
            // 地图实例
            cityView: null,
            // 辅助分析图层列表
            fzfxLayers: null,
            // 分析图层对象
            fxLayerObj: null,
            // 单元监测点击地图选中地块高亮显示的图形重组layer
            dyjcGraphicLayers: null,
            // 单元监测分析数据
            dyjc_model: {},
            // 监测loading
            jcLoading: null,
        };
    },
    computed: {
        ...mapState('onemap-store', ['zttScale', 'isScaleStatus']),
    },
    watch: {
        dialogVisible: {
            handler(boo) {
                if (boo) {
                    this.$nextTick(() => {
                        this.initMap('dyjc_map');
                    });
                }
            },
        },

        // 监听地图范围变化的scale值
        zttScale: {
            handler(val) {
                console.log(val, 'val');
                this.unitForm.scale2 = val;
            },
            deep: true,
        },
    },
    created() {},
    mounted() {},
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
            'handleShowZttScale',
            'handleZttScale',
        ]),

        // 打开弹窗
        showDialog(obj) {
            this.comTitle = obj.title;
            this.dialogVisible = true;
            this.handleToggleIndex(false);
        },

        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: 'init' });
            this.handleToggleIndex(true);
            this.dialogVisible = false;
            // 数据恢复初始
            Object.assign(this.$data, this.$options.data());
            this.handleZttScale('');
        },

        // 比例尺输入
        changeScale2(val) {
            this.handleShowZttScale(true);
            this.cityView.scale = val;
        },

        // 初始化地图
        async initMap(container) {
            let map = new Map();
            this.cityView = new MapView({
                container,
                map,
                scale: 100000,
            });
            this.cityView.ui.remove(['attribution']);

            this.handleZttScale(this.cityView.scale);
            // 获取辅助分析的图层（现状幼儿园、现状公共厕所、现状居委会）
            await this.getLayerList(0);
            // 获取单元监测相关图层列表
            await this.getLayerList(1);
            // 地图点击查询单元监测图层
            this.cityViewClick();
            this.mapZoomWatch();
        },

        // 获取图层列表
        async getLayerList(type) {
            let params = { uid: sessionStorage.getItem('userid'), type };
            debugger;
            const { data: res } = await getLayers(params);
            if (res.code === 1) {
                let data = res.data;
                debugger;
                if (type === 0) {
                    this.fzfxLayers = data;
                }

                data.map((item) => {
                    if (item.ISFX == 1) {
                        this.fxLayerObj = item;
                    }
                    if (item.MAPTYPE == 'image') {
                        let layer = new MapImageLayer({
                            url: item.LAYERURL,
                        });
                        this.cityView.map.add(layer);
                    } else if (item.MAPTYPE == 'tile') {
                        let layer = new TileLayer({ url: item.LAYERURL });
                        this.cityView.map.add(layer);
                    }
                });
            }
        },

        // 地图点击查询单元监测图层
        // * IdentifyParameters 里 layerIds 失效，使用 sublayers
        cityViewClick() {
            debugger;
            this.cityView.on('click', async (evt) => {
                if (this.dyjcGraphicLayers != null) {
                    this.dyjcGraphicLayers.graphics.removeAll();
                    this.cityView.graphics.removeAll();
                } else {
                    this.dyjcGraphicLayers = new GraphicsLayer();
                }
                console.log(this.fxLayerObj);
                console.log(evt, 'evt');
                let identifyParams = new IdentifyParameters({
                    tolerance: 3,
                    // layerIds: [this.fxLayerObj.FXLAYERID],
                    layerOption: 'top',
                    width: this.cityView.width,
                    height: this.cityView.height,
                    geometry: evt.mapPoint,
                    returnGeometry: true,
                    mapExtent: this.cityView.extent,
                    sublayers: [{ id: this.fxLayerObj.FXLAYERID }],
                });
                const res = await identify.identify(
                    this.fxLayerObj.LAYERURL,
                    identifyParams
                );
                console.log(res, 'res');
                if (res.results && res.results.length > 0) {
                    // 定义相交部分显示符号
                    let symbol = {
                        type: 'simple-fill',
                        color: [255, 255, 255, 0.1],
                        style: 'solid',
                        outline: {
                            color: 'blue',
                            width: 2,
                        },
                    };

                    let g = new Graphic({
                        geometry: res.results[0].feature.geometry,
                        symbol,
                    });

                    this.dyjcGraphicLayers.graphics.add(g);
                    this.cityView.map.layers.add(this.dyjcGraphicLayers);
                    this.cityView.center = g.geometry.extent.center;

                    // 获取单元基本码
                    let JBDYM = res.results[0].feature.attributes['基本单元码'];

                    let query = new Query({
                        where: `JBDYM='${JBDYM}'`,
                        outFields: ['*'],
                        returnGeometry: true,
                    });

                    const queryRes = await executeQueryJSON(
                        `${this.fxLayerObj.LAYERURL}/${this.fxLayerObj.FXLAYERID}`,
                        query
                    );
                    if (queryRes && queryRes.features.length > 0) {
                        let feature = queryRes.features[0];
                        console.log(feature, 'feature');
                        // 分析数据
                        this.dyjc_model = {
                            dycode: feature.attributes['JBDYM'], //基本单元代码
                            dymj: feature.attributes['ZYDMJ'], //单元总面积
                            dymc: feature.attributes['SSFQDYMC'], //所属分区单元名称
                            dyzdgn: feature.attributes['SSFQZDGN'], //所属分区单元主导功能
                            ghyey: feature.attributes['YEY'], //幼儿园
                            ghggcs: feature.attributes['GGSC'], //公共厕所
                            xzyey: '',
                            xzggcs: '',
                            xzjwh: '',
                            // 居住信息
                            jzzmj: feature.attributes['JZYDZMJ'],
                            jzykfmj: feature.attributes['YKFJZYDMJ'],
                            jzkfmj: feature.attributes['WYKFJZYDMJ'],
                            jzczcmj: feature.attributes['JZYDSJCZCMJ'],
                            jzmaxkfl: feature.attributes['JZYDZDKFL'],
                            jzminkfl: feature.attributes['JZYDZXKFL'],
                            jzxzkfl: feature.attributes['JZYDXZKFL'], //现状开发量（㎡）
                            jzsykfl: feature.attributes['JZYDSYKFL'], //剩余开发量（㎡）
                            jzrjlsx: feature.attributes['JZYDRJLSX'], //容积率上限
                            jzrjlxx: feature.attributes['JZYDRJLXX'], //容积率下限,
                            // 商服信息
                            sfzmj: feature.attributes['SFYDZMJ'],
                            sfykfmj: feature.attributes['YKFSFYDMJ'],
                            sfwkfmj: feature.attributes['WYKFSFYDMJ'],
                            sfczcmj: feature.attributes['SFYDSJCZCMJ'],
                            sfmaxkfl: feature.attributes['SFYDZDKFL'],
                            sfminkfl: feature.attributes['SFYDZXKFL'],
                            sfxzkfl: feature.attributes['SFYDXZKFL'], //现状开发量（㎡）
                            sfsykfl: feature.attributes['SFYDSYKFL'], //剩余开发量（㎡）
                            sfrjlsx: feature.attributes['SFYDRJLSS'], //容积率上限
                            sfrjlxx: feature.attributes['SFYDRJLXX'], //容积率下限,
                        };
                    }
                }
            });
        },

        // 监听地图缩放
        mapZoomWatch() {
            console.log(this.cityView);
            this.cityView.watch('scale', () => {
                let status = this.isScaleStatus;
                if (!status) {
                    this.handleZttScale(Math.round(this.cityView.scale));
                } else {
                    this.handleShowZttScale(false);
                }
            });
        },

        // 单元监测按钮点击
        DYJC() {
            this.jcLoading = this.$message({
                iconClass: 'el-icon-loading',
                message: '正在监测...',
                duration: 0,
                customClass: 'prop-search',
            });
            console.log(this.dyjcGraphicLayers);
            if (
                !Boolean(this.dyjcGraphicLayers) ||
                this.dyjcGraphicLayers.graphics.length == 0
            ) {
                this.jcLoading.close();
                this.$message.error('请点击地图，选择监测单元！');
                return;
            }

            // 计算单元指标-现状幼儿园
            let resChild, resToilet, resJWH;
            this.fzfxLayers.forEach(async (item) => {
                if (item.LAYERNAME.indexOf('幼儿园') >= 0) {
                    let queryChild = new Query({
                        geometry:
                            this.dyjcGraphicLayers.graphics.items[0].geometry,
                        outFields: ['*'],
                        returnGeometry: true,
                        spatialRelationship: 'contains',
                    });

                    resChild = await executeQueryJSON(
                        `${item.LAYERURL}/${item.FXLAYERID}`,
                        queryChild
                    );

                    if (resChild) {
                        this.dyjc_model.xzyey = resChild.features.length;
                    }
                }
                if (item.LAYERNAME.indexOf('公共厕所') >= 0) {
                    let queryToilet = new Query({
                        geometry:
                            this.dyjcGraphicLayers.graphics.items[0].geometry,
                        outFields: ['*'],
                        returnGeometry: true,
                        spatialRelationship: 'contains',
                    });

                    resToilet = await executeQueryJSON(
                        `${item.LAYERURL}/${item.FXLAYERID}`,
                        queryToilet
                    );
                    if (resToilet) {
                        this.dyjc_model.xzggcs = resToilet.features.length;
                    }
                }
                if (item.LAYERNAME.indexOf('居委会') >= 0) {
                    let queryJWH = new Query({
                        geometry:
                            this.dyjcGraphicLayers.graphics.items[0].geometry,
                        outFields: ['*'],
                        returnGeometry: true,
                        spatialRelationship: 'contains',
                    });

                    resJWH = await executeQueryJSON(
                        `${item.LAYERURL}/${item.FXLAYERID}`,
                        queryJWH
                    );

                    if (resJWH) {
                        this.dyjc_model.xzjwh = resJWH.features.length;
                    }
                }
                if (resChild && resToilet && resJWH) {
                    this.jcLoading.close();
                    this.isExport = false;
                }
            });
        },

        // 导出监测报告
        onSubmit() {
            this.$refs.form.validate(async (valid) => {
                if (!valid) return this.$message.error('请补充必填项');
                this.jcLoading = this.$message({
                    iconClass: 'el-icon-loading',
                    message: '正在导出报告...',
                    duration: 0,
                    customClass: 'prop-search',
                });
                const res = await printMap(
                    this.unitForm.dpi,
                    this.unitForm.scale2,
                    this.cityView
                )
                    .then((res) => {
                        return { status: true, data: res };
                    })
                    .catch((err) => {
                        return { status: false, data: err };
                    });
                if (res.status) {
                    console.log(res);
                    // 传参
                    // * ghjwh,jzwkfmj 字段没有
                    let exData = {
                        imagepath: res.data.url,
                        title: this.unitForm.title,
                        scale: this.unitForm.scale2,
                        time: this.unitForm.date,
                        mapwidth: this.cityView.width,
                        mapheight: this.cityView.height,
                    };
                    Object.assign(exData, this.dyjc_model);
                    const { data: newRes } = await exportFile(exData);
                    console.log(newRes, 'resss');
                    if (newRes.code === 1) {
                        this.jcLoading.close();
                        window.open(apiURL_file + newRes.data);
                    } else {
                        this.jcLoading.close();
                        this.$message.error(newRes.msg);
                    }
                }
            });
        },
    },
};
