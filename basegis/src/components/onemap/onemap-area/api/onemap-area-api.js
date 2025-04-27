/*
 * @Author: WCL
 * @Date: 2021-11-26 14:45:17
 * @LastEditors: WCL
 * @LastEditTime: 2021-11-29 16:36:30
 * @FilePath: \webgis\src\components\onemap\onemap-area\api\onemap-area-api.js
 * @Description: 行政区划API
 */

import request from '@/utils/request';

// 第一级行政区划服务地址
export const getUserCityUrl = (params) => {
    return request({
        method: 'GET',
        url: '/OneMap/GetUserCityUrl',
        params,
    });
};

// 下级行政区划服务地址
export const getNextCity = (params) => {
    return request({
        method: 'GET',
        url: '/OneMap/GetNextCity',
        params,
    });
};
