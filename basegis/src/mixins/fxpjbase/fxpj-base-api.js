/*
 * @Author: WCL
 * @Date: 2022-01-10 14:22:44
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-11 11:28:57
 * @FilePath: \webgis\src\mixins\fxpjbase\fxpj-base-api.js
 * @Description: 分析评价API
 */
import request from '@/utils/request';

// 左侧类型菜单列表接口
export const getTypeList = (params) => {
    return request({
        method: 'GET',
        url: '/FXPJ/GetFXPJTypeList',
        params,
    });
};

// 底图配置接口
export const getMapConfigApi = (params) => {
    return request({
        method: 'GET',
        url: '/MapConfig/GetBaseMap',
        params,
    });
};

// 图层树图层列表接口
export const getLayerList = (params) => {
    return request({
        method: 'GET',
        url: '/FXPJ/GetFXPJLayers',
        params,
    });
};

// 说明文字接口
export const getExplain = (params) => {
    return request({
        method: 'GET',
        url: '/FXPJ/GetSPJSPGPJSM',
        params,
    });
};
