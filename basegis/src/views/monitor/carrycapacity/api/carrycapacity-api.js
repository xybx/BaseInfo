/*
 * @Author: WCL
 * @Date: 2022-01-17 17:08:51
 * @LastEditors: WCL
 * @LastEditTime: 2022-05-07 10:58:40
 * @FilePath: \webgis\src\views\monitor\carrycapacity\api\carrycapacity-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 适宜性图表接口
export const getRtData = (params) => {
    return request({
        method: 'GET',
        url: '/FXPJ/GetSPJYXTJ',
        params,
    });
};

// 适宜性图表颜色接口
export const getRtColor = (params) => {
    return request({
        method: 'GET',
        url: '/FXPJ/GetServerColors',
        params,
    });
};

// 承载规模图表接口
export const getRcData = (params) => {
    return request({
        method: 'GET',
        url: '/FXPJ/GetSPJXZQCZGMTJ',
        params,
    });
};
