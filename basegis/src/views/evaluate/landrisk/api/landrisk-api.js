/*
 * @Author: WCL
 * @Date: 2022-01-11 10:59:24
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-11 11:31:07
 * @FilePath: \webgis\src\views\evaluate\landrisk\api\landrisk-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 风险评估右侧图表接口
export const getChartData = (params) => {
    return request({
        method: 'GET',
        url: '/FXPJ/getSPGTJ',
        params,
    });
};
