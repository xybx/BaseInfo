/*
 * @Author: WCL
 * @Date: 2021-11-12 11:11:55
 * @LastEditors: WCL
 * @LastEditTime: 2021-11-16 13:40:55
 * @FilePath: \webgis\src\store\index.js
 * @Description: store 总文件
 */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const files = require.context('./modules', false, /\.js$/);
const modules = {};

files.keys().forEach((key) => {
    modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default;
});

Object.keys(modules).forEach((key) => {
    modules[key]['namespaced'] = true;
});

export default new Vuex.Store({
    modules,
});
