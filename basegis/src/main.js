/*
 * @Author: WCL
 * @Date: 2021-11-12 11:11:54
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-18 19:00:59
 * @FilePath: \webgis\src\main.js
 * @Description: 全局入口JS
 */
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// ElementUI
import Element from "element-ui";
import "./assets/styles/element-theme.scss";
Vue.use(Element, { size: "small" });

// 引入动画
import animated from "animate.css";
Vue.use(animated);

// ArcGIS
import "@arcgis/core/assets/esri/themes/light/main.css";

// 引入global
import "@/assets/styles/global.scss";

//arcgis微件语言文件
import esriConfig from "@arcgis/core/config";
esriConfig.assetsPath = "./assets";

//arcgis字体文件引用
esriConfig.fontsUrl = "./arcgis_fonts";

// 引入iconfont
import "@/assets/icons/iconfont.css";
import "@/assets/icons/iconfont";

// Echarts
import * as echarts from "echarts";
Vue.prototype.$echart = echarts;

// 弹窗拖拽
import "./plugins/drag/drag";
// base64
const Base64 = require("js-base64").Base64;
Vue.use(Base64);
Vue.config.productionTip = false;
new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app");
