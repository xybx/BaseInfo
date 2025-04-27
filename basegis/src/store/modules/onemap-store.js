/*
 * @Author: WCL
 * @Date: 2021-11-16 11:40:54
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 13:46:55
 * @FilePath: \webgis\src\store\modules\onemap-store.js
 * @Description: 请填写描述
 */

const state = {
    onemapPopup: null, // 一张图弹窗code
    toggleIndex: false, // 顶部菜单激活状态 true:取消,false:默认
    userGraphicLayer: null, // 用户临时图层
    zttScale: null, // 专题图比例
    isScaleStatus: false, // 专题图比例同步开关
    //MapGeometryServerUrl: "", //地图图形计算服务地址
};
const getters = {};
const mutations = {
    handleOnemapPopup(state, code) {
        state.onemapPopup = code;
    },

    handleToggleIndex(state, boo) {
        debugger;
        state.toggleIndex = boo;
    },
    // 用户临时图层
    handleUserGraphicLayer(state, userLayer) {
        state.userGraphicLayer = userLayer;
    },
    // 专题图比例
    handleZttScale(state, zttScale) {
        state.zttScale = zttScale;
    },
    // 是否开始专题图比例同步
    handleShowZttScale(state, boo) {
        state.isScaleStatus = boo;
    },
};
const actions = {};

export default { state, getters, mutations, actions };
