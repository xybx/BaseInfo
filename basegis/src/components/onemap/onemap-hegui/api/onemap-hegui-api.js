/*
 * @Author: WCL
 * @Date: 2021-12-02 11:40:28
 * @LastEditors: LJX
 * @LastEditTime: 2022-02-18 15:29:58
 * @FilePath: \webgis\src\components\onemap\onemap-hegui\api\onemap-hegui-api.js
 * @Description: 合规审查API
 */

import request from '@/utils/request';

//合规审查图层列表
export const getLayers = (params) => {
    return request({
        method: 'GET',
        url: '/HGSC/GetHGSCLayers',
        params,
    });
};

//导出界址点excel
export const exportZJDExcel = (data) => {
    return request({
        method: 'POST',
        url: '/HGSC/ExportJZPoint',
        data,
    });
};


//生成合规审查报告并导出
export const exportReport = (data) => {
    return request({
        method: 'POST',
        url: '/HGSC/Create_HGSC_Word',
        data,
    });
};



