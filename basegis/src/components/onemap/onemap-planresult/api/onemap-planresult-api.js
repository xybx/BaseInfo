/*
 * @Author: WCL
 * @Date: 2021-12-13 14:56:27
 * @LastEditors: WCL
 * @LastEditTime: 2021-12-21 16:06:29
 * @FilePath: \webgis\src\components\onemap\onemap-planresult\api\onemap-planresult-api.js
 * @Description: 规划编制成果追溯API
 */
import request from '@/utils/request';

export const getLayer = (params) => {
    return request({
        method: 'GET',
        url: '/OneMap/getGHLHLayers',
        params,
    });
};
