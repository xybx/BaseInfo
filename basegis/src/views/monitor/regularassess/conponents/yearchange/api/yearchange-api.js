/*
 * @Author: WCL
 * @Date: 2022-01-17 15:06:58
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 15:08:07
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\yearchange\api\yearchange-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 近5年来现状指标变化列表接口
export const getZBYearChangeList = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/GetZBYearChangeList',
        params,
    });
};
