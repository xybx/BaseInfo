/*
 * @Author: WCL
 * @Date: 2021-11-16 16:43:02
 * @LastEditors: WCL
 * @LastEditTime: 2021-11-19 14:48:51
 * @FilePath: \webgis\src\components\map\map2d\api\map2d-api.js
 * @Description: 地图2D-API
 */
import request from '@/utils/request';

// 底图配置接口
export const getMapConfig = (params) => {
    return request({
        method: 'GET',
        url: '/MapConfig/GetBaseMap',
        params,
    });
};
