/*
 * @Author: WCL
 * @Date: 2021-12-13 13:36:39
 * @LastEditors: WCL
 * @LastEditTime: 2021-12-17 16:58:46
 * @FilePath: \webgis\src\components\onemap\onemap-unit\api\onemap-unit-api.js
 * @Description: 单元检测API
 */
import request from '@/utils/request';

// 图层接口
export const getLayers = (params) => {
    return request({
        method: 'GET',
        url: '/CSJY/GetLayers',
        params,
    });
};

// 单元监测导出接口
export const exportFile = (data) => {
    return request({
        method: 'POST',
        url: '/CSJY/Create_DYJC_Export',
        data,
    });
};
