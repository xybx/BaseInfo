/*
 * @Author: WCL
 * @Date: 2022-01-13 15:35:22
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-14 14:18:42
 * @FilePath: \webgis\src\components\monitor\currentland\api\currentland-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

//获取现状用地年份接口
export const getXZYDYears = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetXZYDYears',
        params,
    });
};

//获取现状用地tree-上
export const getXZYDTree = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetXZYDTree',
        params,
    });
};

//二级分类按年份统计
export const GetXZYDSonItemNameByYearTJ = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetXZYDSonItemNameByYearTJ',
        params,
    });
};

// 现状用地图表总数据接口
export const getXZYDTJ = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetXZYDZTJ',
        params,
    });
};

// 现状用地图表年份分类数据接口
export const getXZYDTJYear = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetXZYDYearTJ',
        params,
    });
};

// 现状用地行政区统计表格接口
export const getXZQTJ = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetXZYDXzqTJ',
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
