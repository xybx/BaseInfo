/*
 * @Author: WCL
 * @Date: 2021-11-17 15:34:10
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-10 14:52:22
 * @FilePath: \webgis\src\store\modules\map2d-store.js
 * @Description: 请填写描述
 */

const state = {
    mapconfig: null, // 底图配置
    mapview: null, // 二维地图
    tool: null, // 工具条
    lengthHandler: null,
    hgschandler: null,
    legendLaye: null, // 图例信息
    // 工具条状态
    toolStatus: {
        large: false,
        small: false,
        all: false,
        length: false,
        area: false,
        attr: false,
        pointselect: false,
        splitscreen: false,
        clear: false,
        legend: false,
    },

    //用户自定义临时图层
    userGraphicLayer: null,

    //测量图层
    graphicLengthLrc: null,

    //测量监听
    lengthAreahandler: null,

    //属性数据源
    attrdata: null,

    //属性窗口状态
    attrdialogstatus: false,

    //二三维地图模式
    maptype: 2,
    //缓冲图形渲染
    bufferSymbol: {
        type: "simple-fill",
        color: [255, 255, 0, 0.2],
        style: "solid",
        outline: {
            color: "blue",
            width: 2,
        },
    },
    bufferLineSymbol: {
        type: "simple-line",
        color: "blue",
        width: 2,
        style: "solid",
    },
    //用户自定义渲染
    symbol: {
        type: "simple-fill",
        color: "red", //[255, 255, 0, 0.2],
        style: "solid",
        outline: {
            color: "red",
            width: 2,
        },
    },
    //用户自定义渲染
    fillLinesymbol: {
        type: "simple-fill",
        color: [255, 255, 0, 0],
        style: "solid",
        outline: {
            color: "red",
            width: 2,
        },
    },
    linesymbol: {
        type: "simple-line",
        color: "red",
        width: 2,
        style: "solid",
    },
    // 点符号
    pointSymbol: {
        type: "picture-marker",
        url: require("@/assets/images/map-images/point.gif"),
        width: "50px",
        height: "50px",
    },
    //冲突图形符号-面
    intersectsSymbol: {
        type: "simple-fill",
        color: [255, 255, 0, 0.2],
        style: "solid",
        outline: {
            color: "red",
            width: 1,
        },
    },
    intersectsFilllineSymbol: {
        type: "simple-fill",
        color: [255, 255, 0, 0],
        style: "solid",
        outline: {
            color: "yellow",
            width: 1,
        },
    },
    //冲突图形符号-线
    intersectsLineSymbol: {
        type: "simple-line",
        color: "yellow",
        width: 1,
        style: "solid",
    },
    // 图例
    legendDrawer: false,

    // 合规审查相关数据
    tableData: [], // 合规审查分析内容【图形列表】
    hgscRadioID: "", // 自定义画图或者上传图形在tableData里默认选中当前数据项的id
    hgscUploadDKArea: 0, // 合规审查上传地块的面积
    polygoncount: 1, // 绘制的范围个数
    hgscgraphiclayer: null, // 合规审查图层
    showSplit: false, // 分屏
    focusBtn: "", // 地图控制条当前选中
    isFocus: false,
    allTreeDataLayers: [], //图层树的所有服务列表
};
const getters = {};
const mutations = {
    //设置地图高亮符号
    setSymbol(state) {
        console.log(symbolStyle, "symbolStyle");
        if (symbolStyle == 2) {
            state.symbol = state.fillLinesymbol;
            state.intersectsSymbol = state.intersectsFilllineSymbol;
        } 
    },
    //配置地图基础配置参数
    mapconfig(state, mapconfig) {
        state.mapconfig = mapconfig;
    },

    //二维地图view对象
    mapview(state, mapview) {
        state.mapview = mapview;
    },
    //工具条对象操作
    toolView(state, toolView) {
        state.tool = toolView;
    },

    //属性查询表格数据源
    attrTableData(state, attrdata) {
        console.log(attrdata);
        state.attrdata = attrdata;
    },
    attrdialogstatus(state, attrdialogstatus) {
        state.attrdialogstatus = attrdialogstatus;
    },
    setmaptype(state, maptype) {
        debugger;
        state.maptype = maptype;
    },
    graphicLength(state, graphicLengthLrc) {
        state.graphicLengthLrc = graphicLengthLrc;
    },
    lengthhandler(state, handler) {
        state.lengthAreahandler = handler;
    },
    // 图例展示
    showLegend(state, legendDrawer) {
        state.legendDrawer = legendDrawer;
    },

    //合规审查表格数据
    tableData(state, data) {
        state.tableData.push(data);
        state.hgscRadioID = data.index;
        state.hgscUploadDKArea = data.area;
        state.polygoncount++;
    },

    //清除合规审查表格数据
    cleartableData(state) {
        state.tableData = [];
        state.polygoncount = 1;
    },
    //合规审查图层
    hgscgraphiclayer(state, data) {
        state.hgscgraphiclayer = data;
    },
    //合规审查临时图层
    hgsctempgraphpiclayer(state, data) {
        state.hgsctempgraphpiclayer = data;
    },
    //合规审查的绘制监听
    hgschandler(state, handler) {
        state.hgschandler = handler;
    },
    // 分屏
    handleSplit(state, showSplit) {
        state.showSplit = showSplit;
    },
    // 地图控制条
    handleFocus(state, focus) {
        // state.focusBtn = focus.value;
        // state.isFocus = focus.isFocus;
        // console.log(state.focusBtn, 'state.focusBtn');
        // console.log(state.isFocus, 'state.isFocus');
        state.focusBtn = focus;
    },
    // 图例信息
    handLegend(state, legend) {
        state.legendLaye = legend;
    },

    //存储所有图层服务列表
    //   setAllLayers(state, layer) {
    //     state.allTreeLayers.push(layer);
    //   },
};
const actions = {};

export default {
    state,
    getters,
    mutations,
    actions,
};
