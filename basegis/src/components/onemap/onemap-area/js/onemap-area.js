/*
 * @Author: WCL
 * @Date: 2021-11-26 14:45:00
 * @LastEditors: LJX
 * @LastEditTime: 2022-12-12 16:28:37
 * @FilePath: \webgis\src\components\onemap\onemap-area\js\onemap-area.js
 * @Description: 行政区划JS
 */
import { mapMutations, mapState } from 'vuex';
import { getUserCityUrl, getNextCity } from '../api/onemap-area-api';
import * as query from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import Graphic from '@arcgis/core/Graphic';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            dialogVisible: false,
            comTitle: '',
            formInline: {
                keywords: '',
            },
            zhenList: [],
            cunList: [],
            ppid: '',
            activeCunzhen: '-1', // 默认不选
            tabloading: true,
            showRes: false,
            resList: [],
            zhenData: null,
            cunData: null,
            focusLink: '',
        };
    },
    computed: {
        ...mapState('map2d-store', ['mapview', 'symbol']),
    },
    watch: {
        dialogVisible(boo) {
            if (boo) {
                this.getZhenData();
            } else {
                // 数据恢复初始
                Object.assign(this.$data, this.$options.data());
            }
        },
        // 监听搜索值变化
        'formInline.keywords': {
            handler(val) {
                if (val == '') {
                    this.showRes = false;
                }
            },
        },
    },
    created() {},
    mounted() {
        this.setSymbol(); //初始化渲染图形
        console.log('行政区划');
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

        // 行政区划标签页点击
        tabClick(a, event) {
            console.log(a, 'a');
            this.focusLink = '';
            this.cunList = [];
            this.zhenList.forEach((item) => {
                if (a.name == item.id) {
                    this.getCunList(item.xzqdm, 1);
                    // 镇界定位
                    this.location(item);
                }
            });
        },

        // 定位
        location(data) {
            this.mapview.graphics.removeAll();
            let g = new Graphic({
                geometry: data.geometry,
                symbol: this.symbol,
            });
            this.mapview.graphics.add(g);
            this.mapview.extent = g.geometry.extent;
            this.mapview.zoom -= 1;
        },

        // el-link点击事件
        clickLink(item) {
            console.log(item, 'item');
            this.focusLink = item.xzqdm;
            this.location(item);
        },

        // 获取镇级服务
        async getZhenData() {
            let params = {
                uid: window.sessionStorage.getItem('userid'),
            };
            const { data: res } = await getUserCityUrl(params);
            if (res.code === 1) {
                //debugger;
                this.zhenData = res.data;
                // todo 字段改为小写
                this.getCunData(res.data.PARENTID);
                this.getZhenList();
            } else {
                this.$message.error(res.msg);
            }
        },

        // 获取村级服务
        async getCunData(pid) {
            //debugger;
            let params = {
                pid,
            };
            const { data: res } = await getNextCity(params);
            if (res.code === 1) {
                this.cunData = res.data;
            }
        },

        // 获取镇界列表
        async getZhenList() {
            let index = 0;
            // ? QueryTask 4.20版本问题
            // let querytask = new query({
            //     url: this.zhenData.CITYURL,
            // });
            
            let queryParam = new Query();
            queryParam.where = '1=1';
            queryParam.outFields = ['*'];
            queryParam.returnGeometry = true;

            const results = await query.executeQueryJSON(this.zhenData.CITYURL,queryParam);
            if (results != null && results.features.length > 0) {
                results.features.forEach((feature) => {
                    let zData = {
                        id: index,
                        label: feature.attributes[this.zhenData.CITYFIELD],
                        xzqdm: feature.attributes['XZQDM'],
                        geometry: feature.geometry,
                    };
                    this.zhenList.push(zData);
                    index++;
                });
                this.tabloading = false;
            }
            console.log(this.zhenList, 'zhenlist');
        },

        // 查询地名按钮
        search() {
            let newListData = []; //  用于存放搜索出来数据的新数组
            if (this.formInline.keywords) {
                this.showRes = true;
                this.zhenList.filter((item) => {
                    if (item.label.indexOf(this.formInline.keywords) !== -1) {
                        newListData.push(item);
                    }
                });
                //把搜索结果新的数组赋给原来的数据
                this.resList = newListData;
                this.getCunList(this.formInline.keywords, 0);
            } else {
                this.$message.warning('请输入查询地名');
                //this.getZhenData();
            }
        },

        // type: 0:search,1:xzqdm
        async getCunList(keywords, type) {
            let index = 0;
            let queryWhere = new Query();
            queryWhere.where = '1=1';
            if (type == 1) {
                queryWhere.where += " and XZQDM LIKE '" + keywords + "%'";
            } else {
                queryWhere.where += " and XZQMC LIKE '%" + keywords + "%'";
            }
            queryWhere.outFields = ['*'];
            queryWhere.returnGeometry = true;
            const results = await query.executeQueryJSON(this.cunData.CITYURL,queryWhere);
            if (results != null && results.features.length > 0) {
                results.features.forEach((feature) => {
                    let cData = {
                        id: index,
                        label: feature.attributes[this.cunData.CITYFIELD],
                        xzqdm: feature.attributes['XZQDM'],
                        geometry: feature.geometry,
                    };
                    if (type == 1) {
                        this.cunList.push(cData);
                    } else {
                        this.resList.push(cData);
                    }
                    index++;
                });
            }
        },
    },
};
