import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// ArcGIS
import '@arcgis/core/assets/esri/themes/light/main.css';
import esriConfig from '@arcgis/core/config';
// ArcGIS 微件资源引用
esriConfig.assetsPath = './arcgis_assets';
// ArcGIS 字体文件引用
esriConfig.fontsUrl = './arcgis_fonts';

// ElementPlus
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import '@/assets/styles/global.scss';

// iconfont
import '@/assets/iconfonts/iconfont.css';
import '@/assets/iconfonts/iconfont';

// Element Icon
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

/* Element 相关 */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.use(ElementPlus, {
    locale: zhCn,
});

app.use(createPinia());
app.use(router);

app.mount('#app');
