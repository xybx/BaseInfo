/*
 * @Author: WCL
 * @Date: 2022-01-13 13:29:10
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-14 13:53:42
 * @FilePath: \webgis\src\views\monitor\dynamicmonitor\api\dynamicmonitor-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 获取模块列表接口
export const getModuleList = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetModules',
        params,
    });
};

// 现状用地图表数据接口
export const getXZYD = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetXZYD',
        params,
    });
};

// 底线管控图表数据接口
export const getDXGKTJ = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetDXGKTJ',
        params,
    });
};

// 城乡规划图表数据接口
export const getCXGHTJ = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetCXGHTJ',
        params,
    });
};

// 年度新增建设用地图表数据接口
export const getNDXZJSYDTJ = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetNDXZJSYDTJ',
        params,
    });
};

// 耕地/林地保有量图表数据接口
export const getValsTJ = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetValsTJ',
        params,
    });
};

// 动态监测图层列表接口
export const getLayers = (params) => {
    return request({
        method: 'GET',
        url: '/DTJC/GetLayers',
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

//获取年度约束性指标列表
export const getBindingYearZBList = (params) => {
    return request({
        method: 'GET',
        url: '/JCYJ/getYearsBindingZBList',
        params,
    });
}

//获取三线管控的服务地址
export const getSXGKLayers = (params) => {
    return request({
        method: 'GET',
        url: '/JCYJ/getDXGKLayers',
        params,
    });
}

export const getZBLayer = (params) => {
    return request({
        method: 'GET',
        url: '/JCYJ/getZBLayer',
        params,
    });
}

//获取全部指标体系
export const getSysList = () => {
    return request({
        method: 'GET',
        url: '/JCYJ/getZBLayer',

    });

}