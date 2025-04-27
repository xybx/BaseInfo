/*
 * @Author: WCL
 * @Date: 2022-01-18 09:42:04
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-27 14:46:43
 * @FilePath: \webgis\src\components\onemap\onemap-count\js\onemap-count.js
 * @Description: 条件查询JS
 */
import { mapMutations, mapState } from 'vuex';
import {
    getConditionTypeList,
    getConditionLayerList,
    getConditionFieldList,
    getConditionFieldValueList,
    getConditionTabResultFields,
} from '../api/onemap-count-api';
import { GetLayerAttrs } from '@/utils/common-map-method';
import Query from '@arcgis/core/rest/support/Query';
import { executeQueryJSON } from '@arcgis/core/rest/query';
import Graphic from '@arcgis/core/Graphic';
let app;
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            dialogVisible: false,
            comTitle: '',
            tabList: [],
            tabFocus: '',
            contentTitle: '',
            formList: [],
            countForm: {
                PRJNAME: '',
            },
            searchLayers: [], //查询图层列表
            resultFields: [], //查询结果展示的字段列表
            outFields: ['*'], //gis查询结果字段名数组
            drawer: false,
            overlayTable: [],
            switchDrawer: true,
            switchDrawerIcon: 'el-icon-arrow-down',
            drawerSize: '40%',
            currentPage: 1,
            pagesizeArr: [10, 20, 50, 100],
            pagesize: 10,
            total: 0,
            loading: true,
            attrdialogstatus: false,
            attrTableData: [],
        };
    },
    computed: {
        ...mapState('map2d-store', ['mapview', 'symbol']),
    },
    watch: {},
    created() {},
    mounted() {
        app = this;
    },
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
        ]),
        ...mapMutations('map2d-store', ['setSymbol']),

        // 打开弹窗
        async showDialog(obj) {
            this.comTitle = obj.title;
            this.dialogVisible = true;
            this.handleToggleIndex(false);
            await this.getTabs();
            await this.getTabLayers(this.tabFocus); //获取标签类型对应要查询的图层列表
            await this.getTabSearchResultFields(this.tabFocus); //获取标签类型对应的查询展示结果阶段列表
            await this.getFormList(this.tabFocus);
        },

        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: 'init' });
            this.handleToggleIndex(true);
            this.dialogVisible = false;
            Object.assign(this.$data, this.$options.data());
        },

        // 获取标签页数据
        async getTabs() {
            let params = {
                uid: sessionStorage.getItem('userid'),
            };
            const { data: res } = await getConditionTypeList(params);
            if (res.code === 1) {
                this.tabList = res.data;
                this.tabFocus = res.data[0].PID;
                this.contentTitle = res.data[0].TYPENAME;
            } else {
                this.$message.error(res.msg);
            }
        },

        //获取标签页对应的服务数据
        async getTabLayers(tabid) {
            let params = {
                uid: sessionStorage.getItem('userid'),
                tabid: tabid,
            };
            const { data: res } = await getConditionLayerList(params);
            if (res.code === 1) {
                this.searchLayers = res.data;
            } else {
                this.$message.error(res.msg);
            }
        },

        //获取标签类型对应的查询展示结果阶段列表
        async getTabSearchResultFields(tabid) {
            let params = {
                tabid: tabid,
            };
            const { data: res } = await getConditionTabResultFields(params);
            if (res.code === 1) {
                this.resultFields = res.data;
                if (this.resultFields.length > 0) {
                    let outfields = [];
                    this.resultFields.forEach((field) => {
                        outfields.push(field.FIELDNAME);
                    });
                    outfields.push('OBJECTID');
                    this.outFields = outfields;
                }
            } else {
                this.$message.error(res.msg);
            }
        },

        // 标签页选择
        handleTab(tab) {
            this.contentTitle = tab.label;
            this.getTabLayers(tab.name); //获取标签类型对应要查询的图层列表
            this.getTabSearchResultFields(tab.name); //获取标签类型对应的查询展示结果阶段列表
            this.getFormList(tab.name);
        },

        // 表单渲染
        async getFormList(tabid) {
            let params = {
                tabid,
            };
            const { data: res } = await getConditionFieldList(params);
            console.log(res, 'res');
            if (res.code === 1) {
                this.formList = res.data;
                res.data.map((item) => {
                    let type = item.CONTROLTYPE === 'range' ? [] : '';
                    this.$set(this.countForm, item.FIELDNAME, type);
                });
            } else {
                this.$message.error(res.msg);
            }
        },

        // 查询表单
        searchForm() {
            this.drawer = true;
            this.loading = true;
            this.overlayTable = [];
            console.log(this.countForm);
            let strwhere = ' 1=1 ';
            if (this.formList.length > 0) {
                this.formList.forEach((where) => {
                    console.log(this.countForm[where.FIELDNAME], 'countf');
                    //字符串
                    if (where.FIELDTYPE.toLowerCase() == 'string') {
                        if (this.countForm[where.FIELDNAME]) {
                            strwhere +=
                                ' and ' +
                                where.FIELDNAME +
                                " like '%" +
                                this.countForm[where.FIELDNAME] +
                                "%' ";
                        }
                    }
                    //数字区间
                    if (where.FIELDTYPE.toLowerCase() == 'number') {
                        if (this.countForm[where.FIELDNAME].length == 1) {
                            strwhere +=
                                'and  (' +
                                where.FIELDNAME +
                                '>=' +
                                this.countForm[where.FIELDNAME][0] +
                                ' ) ';
                        }
                        if (this.countForm[where.FIELDNAME].length == 2) {
                            if (
                                this.countForm[where.FIELDNAME][0] ||
                                this.countForm[where.FIELDNAME][1]
                            ) {
                                if (this.countForm[where.FIELDNAME][0]) {
                                    strwhere +=
                                        ' and (' +
                                        where.FIELDNAME +
                                        '>=' +
                                        this.countForm[where.FIELDNAME][0];
                                } else {
                                    strwhere += ' (';
                                }
                                if (this.countForm[where.FIELDNAME][1]) {
                                    strwhere +=
                                        ' and ' +
                                        where.FIELDNAME +
                                        '<=' +
                                        this.countForm[where.FIELDNAME][1] +
                                        ') ';
                                } else {
                                    strwhere += ') ';
                                }
                            }
                        }
                    }
                    //时间区间
                    if (where.FIELDTYPE.toLowerCase() == 'date') {
                        if (this.countForm[where.FIELDNAME]) {
                            debugger;
                            var sdate = new Date(
                                this.countForm[where.FIELDNAME][0]
                            );
                            var edate = new Date(
                                this.countForm[where.FIELDNAME][1]
                            );
                            let start_value =
                                sdate.getFullYear() +
                                '-' +
                                (sdate.getMonth() + 1) +
                                '-' +
                                ((sdate.getDate() == 1 ? 2 : sdate.getDate()) -
                                    1);
                            let end_value =
                                edate.getFullYear() +
                                '-' +
                                (edate.getMonth() + 1) +
                                '-' +
                                (edate.getDate() + 1);
                            strwhere +=
                                ' and ' +
                                where.FIELDNAME +
                                " >DATE'" +
                                start_value +
                                "' and " +
                                where.FIELDNAME +
                                "<DATE'" +
                                end_value +
                                "'";
                        }
                    }
                });
            } else {
                this.$message.warning('该查询没有配置查询条件,将查询全部信息');
            }
            debugger;
            //开始查询
            var k = 0; //find递归循环索引
            (this.pagesize = 10), (this.currentPage = 1);
            //递归查询方法
            find(k, strwhere);
            async function find(k, strwhere) {
                let query = new Query({
                    where: strwhere,
                    outFields: app.outFields,
                    returnGeometry: true,
                });

                const queryRes = await executeQueryJSON(
                    app.searchLayers[k].LAYERURL,
                    query
                );
                if (queryRes && queryRes.features.length > 0) {
                    app.loading = false;
                    queryRes.features.forEach((data) => {
                        debugger;
                        let dataitem = {
                            geo: data.geometry,
                            layerurl: app.searchLayers[k].LAYERURL,
                            layername: app.searchLayers[k].LAYERNAME,
                        };
                        app.resultFields.forEach((field) => {
                            if (field.FIELDTYPE.toLowerCase() == 'date') {
                                var value = data.attributes[field.FIELDNAME];
                                var date = new Date(value);
                                value =
                                    date.getFullYear() +
                                    '-' +
                                    (date.getMonth() + 1) +
                                    '-' +
                                    date.getDate();
                                Object.assign(dataitem, {
                                    [field.FIELDNAME]: value,
                                });
                            } else if (field.FIELDTYPE.toLowerCase() == 'int') {
                                var value =
                                    data.attributes[field.FIELDNAME].toFixed(3);
                                Object.assign(dataitem, {
                                    [field.FIELDNAME]: value,
                                });
                            } else {
                                Object.assign(dataitem, {
                                    [field.FIELDNAME]:
                                        data.attributes[field.FIELDNAME],
                                });
                            }
                        });
                        Object.assign(dataitem, {
                            OBJECTID: data.attributes['OBJECTID'],
                        });
                        app.overlayTable.push(dataitem);
                    });
                    app.total = app.overlayTable.length;
                }
                k++;
                if (k < app.searchLayers.length) {
                    find(k, strwhere);
                } else {
                    app.total = app.overlayTable.length;
                    app.loading = false;
                    //app.showExport = false
                }
            }
        },

        // 切换抽屉高度
        switchHeight() {
            this.switchDrawer = !this.switchDrawer;
            if (!this.switchDrawer) {
                this.switchDrawerIcon = 'el-icon-arrow-up';
                this.drawerSize = '5%';
            } else {
                this.switchDrawerIcon = 'el-icon-arrow-down';
                this.drawerSize = '40%';
            }
        },

        // 抽屉关闭动画结束后状态恢复
        drawerClosed() {
            this.drawerSize = '40%';
            this.switchDrawer = true;
            this.switchDrawerIcon = 'el-icon-arrow-down';
        },

        // pagesize 改变时触发
        handleSizeChange(val) {
            this.pagesize = val;
        },
        // currentpage 改变时触发
        handleCurrentChange(val) {
            this.currentPage = val;
        },

        // 表格行点击
        async tableRowClick(row, column, event) {
            console.log(row);
            //获取属性信息
            this.attrTableData = await GetLayerAttrs(
                row.layerurl,
                row.OBJECTID
            );
            this.attrdialogstatus = true;
            console.log(this.attrdialogstatus);

            let graphic = new Graphic({
                geometry: row.geo,
                symbol: this.symbol,
            });
            this.mapview.graphics.removeAll();
            this.mapview.graphics.add(graphic);
            this.mapview.extent = graphic.geometry.extent;
            this.mapview.zoom = this.mapview.zoom - 2;
        },
    },
};
