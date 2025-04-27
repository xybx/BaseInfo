/*
 * @Author: WCL
 * @Date: 2021-12-12 17:01:34
 * @LastEditors: WCL
 * @LastEditTime: 2021-12-12 17:21:48
 * @FilePath: \webgis\src\components\onemap\onemap-topic-current\api\onemap-topic-current-api.js
 * @Description: 现状制作API
 */
import request from '@/utils/request';

// 导出现状制作报告接口
export const createXZZZFile = (params) => {
    return request({
        method: 'GET',
        url: '/Ztt/CreateTdlyxztMap_Word',
        params,
    });
};
