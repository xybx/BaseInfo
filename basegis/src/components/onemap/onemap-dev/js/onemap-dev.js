/*
 * @Author: WCL
 * @Date: 2021-12-13 14:36:02
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-03 14:37:38
 * @FilePath: \webgis\src\components\onemap\onemap-dev\js\onemap-dev.js
 * @Description: 请填写描述
 */
import { mapState, mapMutations } from 'vuex';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import { getLayers, exportKFPG } from '../api/onemap-dev-api';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import Query from '@arcgis/core/rest/support/Query';
import { executeQueryJSON } from '@arcgis/core/rest/query';
import { identify } from '@arcgis/core/rest/identify';
import { planarArea } from '@arcgis/core/geometry/geometryEngine';
import {
    printMap,
    uploadDwg,
    readDWGApi,
    createGraphic,
} from '@/utils/topic-map';

export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            dialogVisible: false,
            comTitle: '',
            devForm: {
                dev: '',
                type: '',
                unit: '',
                name: '',
                parcel: '',
                nature: '',
                upper: '',
                lower: '',
                scale1: '1',
                scale2: '', // 与右侧地图联动更改此值，具体修改参考刘静霞
                date: '',
                dpi: 96,
            },
            rules: {
                dev: [
                    {
                        required: true,
                        message: '开发评估不能为空',
                        trigger: 'change',
                    },
                ],
                unit: [
                    {
                        required: true,
                        message: '建设单位不能为空',
                        trigger: 'blur',
                    },
                ],
                name: [
                    {
                        required: true,
                        message: '项目名称不能为空',
                        trigger: 'blur',
                    },
                ],
                parcel: [
                    {
                        required: true,
                        message: '项目地块不能为空',
                        trigger: 'blur',
                    },
                ],
                nature: [
                    {
                        required: true,
                        message: '用地性质不能为空',
                        trigger: 'blur',
                    },
                ],
                upper: [
                    {
                        required: true,
                        message: '申报容积率上限不能为空',
                        trigger: 'blur',
                    },
                ],
                lower: [
                    {
                        required: true,
                        message: '申报容积率下限不能为空',
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
            // 上传文件列表
            fileList: [],
            // 导出loading
            jcLoading: null,
            loadLayers: null,
            // 上传红线临时图形
            kfpg_geo: null,
            // 上传红线loading
            upLoading: null,
            imagepath: '',
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
                        this.initMap('kfpg_map');
                    });
                }
            },
        },

        // 监听地图范围变化的scale值
        zttScale: {
            handler(val) {
                console.log(val, 'val');
                this.devForm.scale2 = val;
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

            // 获取单元监测相关图层列表
            await this.getLayerList(2);
            // 地图缩放监听
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
                this.loadLayers = data;

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

        // 开发评估选择
        devChange(val) {
            this.handleShowZttScale(true);
            this.cityView.scale = val;
        },

        // 上传成功
        handleSuccess(response, file, fileList) {
            if (fileList.length > 1) {
                fileList.splice(0, 1);
            }
        },

        // 自定义上传事件
        async handleUpload(params) {
            this.upLoading = this.$message({
                iconClass: 'el-icon-loading',
                message: '上传中...',
                duration: 0,
                customClass: 'prop-search',
            });

            let form = new FormData();
            form.append('filepath', 'KFPG');
            form.append('file', params.file);
            const { data: res } = await uploadDwg(form);
            if (res.code === 1) {
                let readParams = {
                    filename: params.file.name,
                    filepath: res.data,
                };
                this.readDWG(readParams);
            } else {
                this.$message.error(res.msg);
            }
        },

        // 解析读取DWG
        async readDWG(params) {
            const { data: res } = await readDWGApi(params);
            if (res.code === 1) {
                this.overLayer(res.data);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 叠加图形到地图
        overLayer(pointData) {
            this.cityView.graphics.removeAll();
            const graphic = createGraphic(pointData, this.cityView);
            if (graphic) {
                this.upLoading.close();
                this.kfpg_geo = graphic;
                this.cityView.graphics.add(graphic);
                this.cityView.extent = graphic.geometry.extent;
                this.cityView.zoom -= 2;
            }
        },

        // 生成报告
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
                    this.devForm.dpi,
                    this.devForm.scale2,
                    this.cityView
                )
                    .then((res) => {
                        return { status: true, data: res };
                    })
                    .catch((err) => {
                        return { status: false, data: err };
                    });

                if (res.status) {
                    this.imagepath = res.data.url;
                    this.loadLayers.forEach((item) => {
                        if (item.LAYERNAME.indexOf('基本单元') >= 0) {
                            this.exportFile(item);
                        }
                    });
                } else {
                    this.jcLoading.close();
                    this.$message.error(res.data);
                }
            });
        },

        // 导出文件
        async exportFile(item) {
            if (this.kfpg_geo == null) {
                this.jcLoading.close();
                this.$message.error('请上传文件后再生成报告');
                return;
            }

            let identifyTask = new IdentifyParameters({
                tolerance: 3,
                returnGeometry: true,
                mapExtent: this.cityView.extent,
                sublayers: [{ id: item.FXLAYERID }],
                geometry: this.kfpg_geo.geometry,
            });

            console.log(identifyTask);
            debugger;
            let area = Math.abs(
                planarArea(this.kfpg_geo.geometry, 'square-meters').toFixed(3)
            );
            const res = await identify(item.LAYERURL, identifyTask);

            if (res.results.length > 1) {
                this.jcLoading.close();
                this.$message.error('红线超出范围边界');
                return;
            } else {
                // 获取基本单元码
                let unit = res.results[0].feature.attributes['基本单元码'];
                let query = new Query({
                    where: `JBDYM='${unit}'`,
                    outFields: ['*'],
                    returnGeometry: true,
                });

                const queryRes = await executeQueryJSON(
                    `${item.LAYERURL}/${item.FXLAYERID}`,
                    query
                );
                if (this.devForm.type == '1') {
                    this.identifyQuery(queryRes, area);
                } else if (this.devForm.type == '2') {
                    this.businessQuery(queryRes, area);
                }
            }
        },

        // 居住用地查询
        identifyQuery(queryRes, area) {
            if (queryRes && queryRes.features.length > 0) {
                // 最多只有一项，故取第一项
                let item = queryRes.features[0];

                // 最大开发量
                let maxDev = item.attributes['JZYDZDKFL'];
                // 最小开发量
                let minDev = item.attributes['JZYDZXKFL'];
                // 现状开发量
                let nowDev = item.attributes['JZYDXZKFL'];
                // 剩余开发量
                let remainDev = item.attributes['JZYDSYKFL'];
                // 容积率上限
                let maxFar = item.attributes['JZYDRJLSX'];
                // 容积率下限
                let minFar = item.attributes['JZYDRJLXX'];
                // 开发后容积率上限
                let maxDevFar = (maxDev - nowDev - area) / (remainDev - area);
                // 开发后容积率下限
                let minDevFar = (minDev - nowDev - area) / (remainDev - area);
                // 申报容积率上限
                let upper = this.devForm.upper;
                // 申报容积率下限
                let lower = this.devForm.lower;
                // 建议
                let suggest = '';

                // 判断生成报告
                let condition = {
                    one: [
                        upper <= maxFar &&
                            maxDevFar >= minFar &&
                            minDevFar <= maxFar &&
                            lower >= minFar,
                    ],
                    two: [
                        upper >= maxFar && maxDevFar >= minFar,
                        minDevFar <= maxFar && lower >= minFar,
                    ],
                    three: [
                        upper >= maxFar && maxDevFar <= minFar,
                        minDevFar >= maxFar && lower <= minFar,
                    ],
                    four: [
                        upper <= maxFar &&
                            upper >= minFar &&
                            lower <= maxFar &&
                            lower >= minFar,
                    ],
                    five: [
                        upper >= maxFar && maxDevFar >= minFar,
                        lower <= minFar && minDevFar <= maxFar,
                    ],
                    six: [
                        upper <= maxFar && maxDevFar <= minFar,
                        lower <= minFar && minDevFar >= maxFar,
                    ],
                    seven: [
                        upper <= maxFar &&
                            maxDevFar >= minFar &&
                            lower <= maxFar &&
                            lower >= minFar,
                    ],
                    eight: [
                        upper >= maxFar && maxDevFar >= minFar,
                        lower <= minFar && minDevFar <= maxFar,
                    ],
                    nine: [
                        upper >= maxFar && maxDevFar <= minFar,
                        lower <= minFar && minDevFar >= maxFar,
                    ],
                };

                if (condition.one.includes(true)) {
                    suggest =
                        '居住用地申报容积率上、下限符合单元控规总量要求。';
                } else if (condition.two.includes(true)) {
                    suggest =
                        '居住用地申报容积率上限高于单元同类用地容积率上限，但考虑到本地块开发后剩余同类用地开发量还可在本单元内平衡，保持总量不变。为此，建议启动地块控规单元控规动态维护工作，并报局务会议批准后实施。';
                } else if (condition.three.includes(true)) {
                    suggest =
                        '鉴于本地块居住用地开发后剩余同类用地开发量无法在本单元内进行平衡，为此建议启动地块控规单元修编工作，并报原审批机关批准后实施。';
                } else if (condition.four.includes(true)) {
                    suggest =
                        '居住用地申报容积率上限高于单元同类用地容积率上限，但考虑到本地块开发后剩余同类用地开发量还可在本单元内平衡，保持总量不变。为此，建议启动地块控规单元控规动态维护工作，并报局务会议批准后实施。';
                } else if (condition.five.includes(true)) {
                    suggest =
                        '其它可兼容用地申报容积率上限高于单元同类用地容积率上限，但考虑到本地块开发后剩余同类用地开发量还可在本单元内平衡，保持总量不变。为此，建议启动地块控规单元控规动态维护工作，并报局务会议批准后实施。';
                } else if (condition.six.includes(true)) {
                    suggest =
                        '其它不兼容用地申报容积率上限高于单元同类用地容积率上限，但考虑到本地块开发后剩余同类用地开发量还可在本单元内平衡，保持总量不变。为此，建议启动地块控规单元控规动态维护工作，并报局务会议批准后实施。';
                } else if (condition.seven.includes(true)) {
                    suggest =
                        '鉴于本地块居住用地开发后剩余同类用地开发量无法在本单元内进行平衡，为此建议启动地块控规单元修编工作，并报原审批机关批准后实施。';
                } else if (condition.eight.includes(true)) {
                    suggest =
                        '鉴于本地块其它可兼容用地开发后剩余同类用地开发量无法在本单元内进行平衡，为此建议启动地块控规单元修编工作，并报原审批机关批准后实施。';
                } else if (condition.nine.includes(true)) {
                    suggest =
                        '鉴于本地块、其它不兼容用地开发后剩余同类用地开发量无法在本单元内进行平衡，为此建议启动地块控规单元修编工作，并报原审批机关批准后实施。';
                }

                let obj = {
                    zongyongdi: item.attributes['JZYDZMJ'],
                    yikaifa: item.attributes['YKFJZYDMJ'],
                    weikaifa: item.attributes['WYKFJZYDMJ'],
                    chengzhongcun: item.attributes['JZYDSJCZCMJ'],
                    maxDev,
                    minDev,
                    nowDev,
                    remainDev,
                    maxFar,
                    minFar,
                    maxDevFar,
                    minDevFar,
                    suggest,
                    dkarea: area,
                };
                console.log(obj, 'obj');
                if (obj == null) {
                    this.jcLoading.close();
                    this.$message.error('红线超出单元范围边界');
                } else {
                    this.exportReport(obj);
                }
            }
        },

        // 商服用地查询
        businessQuery(queryRes, area) {
            if (queryRes && queryRes.features.length > 0) {
                // 数组数据最多只有一项，故取第一项
                let item = queryRes.features[0];

                //已开发商服用地面积（公顷）
                let ykfydmj = item.attributes['YKFSFYDMJ'];
                //未开商服用地面积（公顷）
                let wkfydmj = item.attributes['WYKFSFYDMJ'];
                //商服用地涉及城中村面积（公顷） )
                let czcmj = item.attributes['SFYDSJCZCMJ'];
                //商服用地现状开发量（平方米）
                let xzkfl = item.attributes['SFYDXZKFL'];
                //商服用地剩余开发量（平方米）
                let sykfl = item.attributes['SFYDSYKFL'];
                //商服用地最大开发量（平方米）
                let zdkfl = item.attributes['SFYDZDKFL '];
                //商服用地最小开发量（平方米）
                let zxkfl = item.attributes['SFYDZXKFL'];
                //商服用地容积率上限
                let maxZiduan = item.attributes['SFYDRJLSS'];
                //商服用地容积率下限
                let minZiduan = item.attributes['SFYDRJLXX'];
                //已开发量=现状开发量（平方米）
                let ykfl = item.attributes['SFYDXZKFL'];
                //剩余用地面积=剩余开发量（平方米）
                let syydmj = item.attributes['SFYDSYKFL'];
                //地块开发后剩余居住用地规划容积率上限：（最大开发量-已开发量）/剩余用地面积
                let rongjiMax = (zdkfl - (ykfl + area)) / (syydmj - area);
                //地块开发后剩余居住用地规划容积率下限：（最小开发量-已开发量）/剩余用地面积
                let rongjiMin = (zxkfl - (ykfl + area)) / (syydmj - area);
                // 申报容积率上限
                let upper = this.devForm.upper;
                // 申报容积率下限
                let lower = this.devForm.lower;
                // 建议
                let suggest = '';

                // 判断生成报告
                let condition = {
                    one: [
                        upper <= maxZiduan &&
                            rongjiMax >= minZiduan &&
                            rongjiMin <= maxZiduan &&
                            lower >= minZiduan,
                    ],
                    two: [
                        upper >= maxZiduan && rongjiMax >= minZiduan,
                        lower <= minZiduan && rongjiMin <= maxZiduan,
                    ],
                    three: [
                        upper >= maxZiduan && rongjiMax <= minZiduan,
                        lower <= minZiduan && rongjiMin >= maxZiduan,
                    ],
                    four: [
                        upper <= maxZiduan &&
                            upper >= minZiduan &&
                            lower <= maxZiduan &&
                            lower >= minZiduan,
                    ],
                    five: [
                        upper >= maxZiduan && rongjiMax >= minZiduan,
                        lower <= minZiduan && rongjiMin <= maxZiduan,
                    ],
                    six: [
                        upper >= maxZiduan && rongjiMax <= minZiduan,
                        lower <= minZiduan && rongjiMin >= maxZiduan,
                    ],
                    seven: [
                        upper <= maxZiduan &&
                            rongjiMax >= minZiduan &&
                            lower <= maxZiduan &&
                            lower >= minZiduan,
                    ],
                    eight: [
                        upper >= maxZiduan && rongjiMax >= minZiduan,
                        lower <= minZiduan && rongjiMin <= maxZiduan,
                    ],
                    nine: [
                        upper >= maxZiduan && rongjiMax <= minZiduan,
                        lower <= minZiduan && rongjiMin >= manZiduan,
                    ],
                };

                if (condition.one.includes(true)) {
                    suggest =
                        '商服用地申报容积率上、下限符合单元控规总量要求。';
                } else if (condition.two.includes(true)) {
                    suggest =
                        '其它可兼容用地申报容积率上、下限符合单元控规总量要求。';
                } else if (condition.three.includes(true)) {
                    suggest =
                        '其它不兼容用地申报容积率上、下限符合单元控规总量要求。';
                } else if (condition.four.includes(true)) {
                    suggest =
                        '商服用地申报容积率上限高于单元同类用地容积率上限，但考虑到本地块开发后剩余同类用地开发量还可在本单元内平衡，保持总量不变。为此，建议启动地块控规单元控规动态维护工作，并报局务会议批准后实施。';
                } else if (condition.five.includes(true)) {
                    suggest =
                        '其它可兼容用地申报容积率上限高于单元同类用地容积率上限，但考虑到本地块开发后剩余同类用地开发量还可在本单元内平衡，保持总量不变。为此，建议启动地块控规单元控规动态维护工作，并报局务会议批准后实施。';
                } else if (condition.six.includes(true)) {
                    suggest =
                        '其它不兼容用地申报容积率上限高于单元同类用地容积率上限，但考虑到本地块开发后剩余同类用地开发量还可在本单元内平衡，保持总量不变。为此，建议启动地块控规单元控规动态维护工作，并报局务会议批准后实施。';
                } else if (condition.seven.includes(true)) {
                    suggest =
                        '鉴于本地块商服用地开发后剩余同类用地开发量无法在本单元内进行平衡，为此建议启动地块控规单元修编工作，并报原审批机关批准后实施。';
                } else if (condition.eight.includes(true)) {
                    suggest =
                        '鉴于本地块其它可兼容用地开发后剩余同类用地开发量无法在本单元内进行平衡，为此建议启动地块控规单元修编工作，并报原审批机关批准后实施。';
                } else if (condition.nine.includes(true)) {
                    suggest =
                        '鉴于本地块其它可兼容用地开发后剩余同类用地开发量无法在本单元内进行平衡，为此建议启动地块控规单元修编工作，并报原审批机关批准后实施。';
                }

                let obj = {
                    zongyongdi: item.attributes['SFYDZMJ'],
                    yikaifa: item.attributes['YKFSFYDMJ'],
                    weikaifa: item.attributes['WYKFSFYDMJ'],
                    chengzhongcun: item.attributes['SFYDSJCZCMJ'],
                    maxDev: zdkfl, //最大开发量
                    minDev: zxkfl, //最小
                    nowDev: xzkfl, //现状开发量
                    remainDev: sykfl, //剩余开发量
                    maxFar: maxZiduan, //容积率上限
                    minFar: minZiduan, //下限
                    maxDevFar: rongjiMax, //开发后容积率上限
                    minDevFar: rongjiMin, //下限
                    suggest,
                    dkarea: area,
                };
                if (obj == null) {
                    this.jcLoading.close();
                    this.$message.error('红线超出单元范围边界');
                } else {
                    this.exportReport(obj);
                }
            }
        },

        // 导出单元监测报告
        async exportReport(obj) {
            let data = {
                userid: sessionStorage.getItem('userid'),
                imagepath: this.imagepath,
                mapwidth: this.cityView.width,
                mapheight: this.cityView.height,
                scale: this.devForm.scale2,
                time: this.devForm.date,
                layerid: this.devForm.type,
                jsdw: this.devForm.unit,
                xmmc: this.devForm.name,
                xmdk: this.devForm.parcel,
                maxZiduan: obj.maxFar,
                minZiduan: obj.minFar,
                weikaifa: obj.weikaifa,
                left: obj.remainDev,
                dkarea: obj.dkarea,
                sbrjlmax: this.devForm.upper,
                sbrjlmin: this.devForm.lower,
                ydxz: this.devForm.nature,
                rongjiMax: obj.maxDevFar,
                rongjiMin: obj.minDevFar,
                advise: obj.suggest,
            };

            const { data: res } = await exportKFPG(data);
            console.log(res, 'res');
            if (res.code === 1) {
                this.jcLoading.close();
                window.open(apiURL_file + res.data);
            } else {
                this.$message.error(res.msg);
            }
        },
    },
};
