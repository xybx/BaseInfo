/*
 * @Author: WCL
 * @Date: 2021-12-13 14:56:02
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:16:37
 * @FilePath: \webgis\src\components\onemap\onemap-planresult\js\onemap-planresult.js
 * @Description: 规划编制成果JS
 */
import { mapMutations, mapState } from 'vuex';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import Graphic from '@arcgis/core/Graphic';
import { getLayer } from '../api/onemap-planresult-api';
import Query from '@arcgis/core/rest/support/Query';
import { executeQueryJSON } from '@arcgis/core/rest/query';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            dialogVisible: false,
            comTitle: '',
            lhForm: {
                name: '',
                ghtype: '',
                unit: '',
                reply: '',
                date: '',
                xmtype: '',
                status: '',
                startDate: '',
                endDate: '',
            },
            lhFormRules: {
                reply: [
                    {
                        required: true,
                        message: '是否批复不能为空',
                        trigger: 'change',
                    },
                ],
            },
            drawGraphicLayer: null, // 绘制图层
            // 批复下拉框列表
            replyList: [
                { label: '未批复', value: '1' },
                { label: '已批复', value: '0' },
            ],
            // 拼接查询条件
            queryWhere: '',
            // 渲染数据
            overlayTable: [],
        };
    },
    computed: {
        ...mapState('map2d-store', ['mapview', 'symbol']),
    },
    watch: {},
    created() {},
    mounted() {},
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
            'handleShowZttScale',
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
        },

        // 绘制范围
        onDraw() {
            if (this.drawGraphicLayer != null) {
                this.drawGraphicLayer.graphics.removeAll();
            } else {
                this.drawGraphicLayer = new GraphicsLayer({
                    id: 'drawGraphicLayer',
                });
            }

            let sketchViewModel = new SketchViewModel({
                layer: this.drawGraphicLayer,
                view: this.mapview,
            });
            this.mapview.map.layers.add(this.drawGraphicLayer);
            sketchViewModel.create('polygon');

            sketchViewModel.on('create', (evt) => {
                this.drawGraphicLayer.graphics.removeAll();
                if (evt.state == 'complete') {
                    let geometry = evt.graphic.geometry;
                    this.drawGraphicLayer.add(
                        new Graphic({ geometry, symbol: this.symbol })
                    );

                    sketchViewModel.complete();
                    sketchViewModel.cancel();
                }
            });
        },

        // 查询
        onSearch() {
            let ghlhLayer = this.mapview.map.findLayerById('ghlhLayer');
            if (ghlhLayer != null) {
                this.mapview.map.remove(ghlhLayer);
            }
            this.queryWhereParams();
            this.$refs.form.validate(async (valid) => {
                if (!valid) return this.$message.error('请补充必填项');
                let params = {
                    uid: sessionStorage.getItem('userid'),
                    type: this.lhForm.reply,
                };
                const { data: res } = await getLayer(params);
                console.log(res, 'res');
                this.queryWhereParams();
                // !分隔
                let GHLHSearchGraphicsLayer = new GraphicsLayer({
                    id: 'ghlhLayer',
                });
                let layerData = res.data;

                // 递归改为遍历
                layerData.map(async (item) => {
                    let query = new Query({
                        where: this.queryWhere,
                        outFields: ['*'],
                        returnGeometry: true,
                    });

                    if (
                        this.drawGraphicLayer != null &&
                        this.drawGraphicLayer.graphics.length > 0
                    ) {
                        query.geometry =
                            this.drawGraphicLayer.graphics.items[0].geometry;
                    }

                    const queryRes = await executeQueryJSON(
                        item.LAYERURL,
                        query
                    );

                    if (queryRes != null && queryRes.features.length > 0) {
                        let feature = queryRes.features;
                        debugger;
                        feature.map((el) => {
                            // todo loading状态暂时空着
                            let xmInfo = {
                                OBJECTID: el.attributes['OBJECTID'],
                                XMMC: el.attributes['XMMC'],
                                GHLB: el.attributes['GHLB'],
                                BZDW: el.attributes['BZDW'],
                                BZRQ: el.attributes['BZRQ'],
                                XMLX: el.attributes['XMLX'],
                                URL: item.LAYERURL,
                            };
                            console.log(xmInfo, 'xmInfo');
                            this.overlayTable.push(xmInfo);

                            // 图形保存
                            let g = new Graphic({
                                geometry: el.geometry,
                                attributes: el.attributes,
                                symbol: this.symbol,
                            });

                            GHLHSearchGraphicsLayer.graphics.add(g);

                            console.log(GHLHSearchGraphicsLayer);
                        });
                    }
                });
            });
        },

        // 查询条件拼接
        queryWhereParams() {
            this.queryWhere = '1=1';
            if (Boolean(this.lhForm.name)) {
                this.queryWhere += ` and XMMC like '%${this.lhForm.name}%'`;
            }
            if (Boolean(this.lhForm.unit)) {
                this.queryWhere += ` and BZDW like '%${this.lhForm.unit}%'`;
            }
            if (Boolean(this.lhForm.date)) {
                console.log(this.lhForm.date);
                let startDate = this.lhForm.date[0].split('-');
                let endDate = this.lhForm.date[1].split('-');
                this.queryWhere += ` and BZRQ >='${startDate[0]}年${startDate[1]}月${startDate[2]}日' and BZRQ <='${endDate[0]}年${endDate[1]}月${endDate[2]}日'`;
            }
            if (Boolean(this.lhForm.status)) {
                this.queryWhere += ` and XMZT='${this.lhForm.status}'`;
            }
            if (Boolean(this.lhForm.ghtype)) {
                this.queryWhere += ` and GHLB='${this.lhForm.ghtype}'`;
            }
            if (Boolean(this.lhForm.xmtype)) {
                this.queryWhere += ` and XMLX='${this.lhForm.ghtype}'`;
            }
        },
    },
};
