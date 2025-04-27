/*
 * @Author: WCL
 * @Date: 2022-01-14 14:43:14
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 16:16:28
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\evalresult\api\evalresult-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 生成评估成果接口
export const exportPGZBZIP = (data) => {
    return request({
        method: 'POST',
        url: '/DQPG/ExportPGZBZIP',
        data,
    });
};

// 获取评估成果记录接口
export const getPGCGRecord = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/GetPGCGRecord',
        params,
    });
};
