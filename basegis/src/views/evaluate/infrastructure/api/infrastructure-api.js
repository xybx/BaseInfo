/*
 * @Author: WCL
 * @Date: 2022-01-11 13:21:59
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-12 14:46:54
 * @FilePath: \webgis\src\views\evaluate\infrastructure\api\infrastructure-api.js
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
