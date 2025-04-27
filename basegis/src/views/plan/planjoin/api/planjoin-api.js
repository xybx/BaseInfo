/*
 * @Author: WCL
 * @Date: 2021-12-30 11:22:13
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-10 13:29:14
 * @FilePath: \webgis\src\views\plan\planjoin\api\planjoin-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 规划类型接口
export const getType = () => {
    return request({
        method: 'GET',
        url: '/GHSC/GetTypeList',
    });
};

// 规划项目列表接口
export const getList = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetJDRecordList',
        params,
    });
};

// 规划项目名称列表接口
export const getPJNameList = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetProjectList',
        params,
    });
};


// 创建汇交记录接口
export const createSJHJ = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/CreateSJHJRecord',
        params,
    });
};

// 导出数据汇交离线下载包
export const exportSJHJZIP = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/ExportSJHJZIP',
        params,
    });
};

// 汇交记录接口
export const getSJHJRecords = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetSJHJRecords',
        params,
    });
};
