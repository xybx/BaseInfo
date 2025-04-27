/*
 * @Author: WCL
 * @Date: 2021-12-03 09:17:11
 * @LastEditors: WCL
 * @LastEditTime: 2021-12-10 11:49:58
 * @FilePath: \webgis\src\components\onemap\onemap-topic-guihua\api\onemap-topic-guihua-api.js
 * @Description: 专题图API
 */
import request from '@/utils/request';

// 导出规划制图文件接口
export const createGHZZFile = (params) => {
    return request({
        method: 'GET',
        url: '/Ztt/Create_GHZZ_Word',
        params,
    });
};