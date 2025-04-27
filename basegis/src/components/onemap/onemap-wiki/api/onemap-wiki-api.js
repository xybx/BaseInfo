/*
 * @Author: WCL
 * @Date: 2022-02-21 13:53:29
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-24 17:42:38
 * @FilePath: \webgis\src\components\onemap\onemap-wiki\api\onemap-wiki-api.js
 * @Description: 知识库API
 */
import request from '@/utils/request';

// 获取知识库列表
export const getKnowledgeList = (params) => {
    return request({
        method: 'GET',
        url: '/Knowledge/GetKnowledgeList',
        params
    });
};
