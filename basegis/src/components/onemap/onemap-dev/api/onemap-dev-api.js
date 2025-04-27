/*
 * @Author: WCL
 * @Date: 2021-12-13 14:36:10
 * @LastEditors: WCL
 * @LastEditTime: 2021-12-21 11:42:30
 * @FilePath: \webgis\src\components\onemap\onemap-dev\api\onemap-dev-api.js
 * @Description: 请填写描述
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

// 导出报告接口
export const exportKFPG = (data) => {
    return request({
        method: 'POST',
        url: '/CSJY/Create_KFPG_Export',
        data,
    });
};
