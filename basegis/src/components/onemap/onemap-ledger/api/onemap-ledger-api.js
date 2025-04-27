/*
 * @Author: LJX
 * @Date: 2022-03-15 09:22:45
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-15 09:32:51
 * @FilePath: \webgis\src\components\onemap\onemap-ledger\api\onemap-ledger-api.js
 * @Description: 统计台账api js
 */
import request from '@/utils/request';
// 统计台账分组服务
export const getLayerList = () => {
    return request({
        method: 'GET',
        url: '/OneMap/GetTJTZLayerList',
    });
};
