/*
 * @Author: WCL
 * @Date: 2021-11-12 14:25:30
 * @LastEditors: WCL
 * @LastEditTime: 2023-01-04 15:04:51
 * @FilePath: \webgis\vue.config.js
 * @Description: vue配置文件
 */
//const { lxFileUploadIP } = require("./public/index.js");
module.exports = {
    publicPath: './',
    devServer: {
        open: true,
        port: 8898,
        //跨域设置
        // proxy: {
        //     '/': {
        //       target: "http://13.80.7.252:88",// 需要代理的后端接口
        //       changeOrigin: true, //开启代理：在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求
        //       pathRewrite: {//重写匹配的字段，如果不需要在请求路径上，重写为""
        //         '/': ''
        //       }
        //     }
        // }
    },
    runtimeCompiler: true,
    productionSourceMap: false,
    transpileDependencies:['/@arcgis/core/'],
    css: {
        extract: false,
        sourceMap: false,
        loaderOptions: {
            postcss: {
                plugins: [
                    require('postcss-px-to-viewport')({
                        unitToConvert: 'px',
                        viewportWidth: 1920,
                        unitPrecision: 3,
                        propList: ['*'],
                        viewportUnit: 'vw',
                        fontViewportUnit: 'vw',
                        selectorBlackList: [],
                        minPixelValue: 1,
                        mediaQuery: false,
                        replace: true,
                    }),
                ],
            },
            scss: {
                additionalData: `@import "~@/assets/styles/define-theme.scss";`,
            },
        },
    },
};
