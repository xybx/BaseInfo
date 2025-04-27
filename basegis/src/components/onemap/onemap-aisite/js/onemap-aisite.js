import Graphic from '@arcgis/core/Graphic';
import { mapMutations, mapState } from 'vuex';
import Query from '@arcgis/core/rest/support/Query';
import * as query from '@arcgis/core/rest/query';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';

export default {
    name: '',
    props: {},
    components: {},
    data() {
        let changeSpace = (rule, value, callback) => {
            if (
                (this.siteForm.way === 'multiple' && value === '') ||
                (this.siteForm.way === 'multiple' && !Boolean(value))
            ) {
                callback(new Error('最大地块间距不能为空'));
            } else {
                callback();
            }
        };
        return {
            typeOptions: [],
            wayOptions: [],
            siteForm: {
                type: '',
                minarea: null,
                way: '',
                maxspace: null,
            },
            dialogVisible: false,
            comTitle: '',
            siteRules: {
                type: [
                    {
                        required: true,
                        message: '类型不能为空',
                        trigger: 'change',
                    },
                ],
                minarea: [
                    {
                        required: true,
                        message: '最低面积不能为空', 
                        trigger: 'blur',
                    },
                ],
                way: [
                    {
                        required: true,
                        message: '方法不能为空',
                        trigger: 'change',
                    },
                ],
                maxspace: [
                    {
                        validator: changeSpace,
                        trigger: 'blur',
                    },
                ],
            },
            tableData: [],
            showTable: false,
        };
    },
    computed: {
        ...mapState('map2d-store', [
            'mapview',
            'symbol',
            'linesymbol',
            'pointSymbol',
            'mapconfig',
        ]),
    },
    watch: {
        dialogVisible(boo) {
            if (!boo) {
                this.resetForm();
            }
        },
    },
    created() {},
    mounted() {
        this.typeOptions = aiTypeOpts;
        this.wayOptions = aiWayOpts;
    },
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
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
            // 清除图形
            this.mapview.graphics.removeAll();
            // 数据恢复初始
            Object.assign(this.$data, this.$options.data());
        },

        // 查询
        handleQuery() {
            this.$refs.siteForm.validate(async (valid) => {
                if (!valid) return this.$message.error('必填项不能为空');

                // todo 查询
                let params = new Query({
                    where: `${aiField} = '${this.siteForm.type}'`,
                    outFields: ['*'],
                    returnGeometry: true,
                });
                const res = await query.executeQueryJSON(aiURL, params);
                console.log(res, 'queryres');
                if (res.features.length > 0) {
                    this.tableData = [];
                    let features = res.features;
                    // 单一地块
                    if (this.siteForm.way === 'single') {
                        this.geoSingle(features);
                    }
                    // 多地块
                    else {
                        this.geoMultiple(features);
                    }
                } else {
                    this.$message.warning('没有查询到地块');
                }
            });
        },

        // 单一地块计算
        geoSingle(features) {
            features.map((item) => {
                let area = Number(
                    (
                        geometryEngine.planarArea(
                            item.geometry,
                            'square-meters'
                        ) * 0.0015
                    ).toFixed(3)
                );
                if (area >= this.siteForm.minarea) {
                    this.tableData.push({
                        area: Number(item.attributes[aiResField.area]).toFixed(
                            3
                        ),
                        position: item.attributes[aiResField.position],
                        geo: item.geometry,
                    });
                }
            });
            if (this.tableData.length <= 0)
                return this.$message.warning('没有满足条件的数据');
            this.showTable = true;
            console.log(this.tableData);
        },

        // 多地块计算
        geoMultiple(features) {
            features.map(async (item) => {
                let area = geometryEngine.buffer(
                    item.geometry,
                    this.siteForm.maxspace,
                    'meters',
                    true
                );

                let params = new Query({
                    outFields: ['*'],
                    geometry: area,
                    returnGeometry: true,
                });
                const res = await query.executeQueryJSON(aiURL, params);
                let subFeatures = res.features;
                let unionList = [];
                subFeatures.map((subItem) => {
                    unionList.push(subItem.geometry);
                });

                const unionAll = geometryEngine.union(unionList);
                let newArea = Number(
                    (
                        geometryEngine.planarArea(unionAll, 'square-meters') *
                        0.0015
                    ).toFixed(3)
                );

                if (newArea >= this.siteForm.minarea) {
                    this.tableData.push({
                        area: newArea,
                        position: item.attributes[aiResField.position],
                        geo: unionAll,
                    });
                }
            });
            this.showTable = true;
        },

        // 表格行点击
        handleRowClick(row) {
            this.mapview.graphics.removeAll();
            console.log(this.symbol, 'this.symbol');
            let graphic = new Graphic({
                geometry: row.geo,
                symbol: {
                    type: 'simple-fill',
                    color: [255, 255, 0, 0.2],
                    style: 'solid',
                    outline: {
                        color: 'red',
                        width: 2,
                    },
                },
            });

            this.mapview.extent = row.geo.extent;
            this.mapview.scale += 2500;
            this.mapview.graphics.add(graphic);
        },

        // 清除
        resetForm() {
            this.$refs.siteForm.resetFields();
            this.tableData = [];
            this.showTable = false;
            this.mapview.graphics.removeAll();
        },
    },
};
