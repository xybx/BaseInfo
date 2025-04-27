/*
 * @Author: WCL
 * @Date: 2021-12-10 17:02:32
 * @LastEditors: WCL
 * @LastEditTime: 2021-12-12 16:24:14
 * @FilePath: \webgis\src\components\onemap\onemap-topic-tugui\api\onemap-topic-tugui.api.js
 * @Description: 土规制作API
 */
import request from '@/utils/request';

export const createTGZZFile = (params) => {
    return request({
        method: 'GET',
        url: '/Ztt/CreateTdlyjbtMap_Word',
        params,
    });
};
