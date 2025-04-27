/*
 * @Author: WCL
 * @Date: 2022-01-11 13:17:46
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-11 14:45:28
 * @FilePath: \webgis\src\views\evaluate\spatialpattern\api\spatialpattern-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 右上图表接口
export const getRtData = (params) => {
    return request({
        method: 'GET',
        url: '/FXPJ/GetSPJYXTJ',
        params,
    });
};
