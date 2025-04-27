/*
 * @Author: WCL
 * @Date: 2021-11-26 13:19:27
 * @LastEditors: WCL
 * @LastEditTime: 2021-11-29 14:22:30
 * @FilePath: \webgis\src\components\onemap\onemap-locate\api\onemap-locate-api.js
 * @Description: 请填写描述
 */

import request from '@/utils/request';

// 查询定位服务列表接口
export const getQuery = (params) => {
    return request({
        method: 'GET',
        url: '/OneMap/GetQueryLocation',
        params,
    });
};

// 获取计算服务配置
export const getMapGeometryService = (params) => {
    return request({
        method: 'GET',
        url: '/MapConfig/GetUserGeometryService',
        params,
    });
};