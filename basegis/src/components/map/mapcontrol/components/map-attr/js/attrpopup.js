import store from '../../../../../../store';

/*
 * @Author: WCL
 * @Date: 2021-11-22 16:40:35
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-11 14:12:57
 * @FilePath: \webgis\src\components\map\mapcontrol\components\map-attr\js\attrpopup.js
 * @Description: 请填写描述
 */
import { mapMutations, mapState } from 'vuex';
import { GraphicLocation, clearMapGraphics } from '@/utils/common-map-method';
export default {
    name: '',
    props: { isShow: Boolean },
    components: {},
    data() {
        return {
            dialogAttr: false,
            nameTit: null,
            namelist: [],
            tagList: [],
            attrTableData: [],
            focusTag: '',
        };
    },
    computed: {
        ...mapState('map2d-store', [
            'toolView',
            'toolStatus',
            'attrdata',
            'attrdialogstatus',
        ]),
    },
    watch: {
        attrdata: {
            handler(res) {
                console.log(res);
                if (res.length > 0) {
                    this.dialogAttr = true;
                    var layerGroupData = [];
                    var layerlist = this.unique(res); //调取自定义去重函数
                    console.log(layerlist, 'layerlist');
                    layerlist.forEach((element) => {
                        var datalist = [];
                        res.forEach((item) => {
                            if (element.name == item.name) {
                                datalist.push(item);
                            }
                        });
                        var groupitem = {
                            name: element.name,
                            datalist: datalist,
                        };
                        layerGroupData.push(groupitem);
                    });
                    this.namelist = layerGroupData;
                    this.nameTit = layerGroupData[0].name;
                    this.tagList = layerGroupData[0].datalist;
                    this.focusTag = this.tagList[0].value;
                    this.attrTableData =
                        layerGroupData[0].datalist[0].fieldvalues;
                    // AttrLocation(layerGroupData[0].datalist[0].value);
                }
            },
        },
    },
    created() {},
    mounted() {},
    methods: {
        ...mapMutations('map2d-store', {
            attrdialog: 'attrdialogstatus',
            handleFocus: 'handleFocus',
        }),
        //去重
        unique(arr) {
            const res = new Map();
            return arr.filter(
                (arr) => !res.has(arr.name) && res.set(arr.name, 1)
            );
        },
        // 关闭弹窗
        handleAttrClose() {
            this.attrdialog(false);
            this.handleFocus(null);
            this.$parent.clearControl();
        },

        // 属性下拉框选择
        nameClick(val) {
            clearMapGraphics(null);
            this.nameTit = val.name;
            this.attrTableData = val.datalist[0].fieldvalues;
            GraphicLocation(val.datalist[0].graphic);
        },

        // 标签点击
        changeTag(item) {
            clearMapGraphics(null);
            this.focusTag = item.value;
            this.attrTableData = item.fieldvalues;
            GraphicLocation(item.graphic);
        },
    },
};
