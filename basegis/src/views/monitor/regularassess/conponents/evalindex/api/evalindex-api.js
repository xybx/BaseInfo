/*
 * @Author: WCL
 * @Date: 2022-01-14 14:42:16
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 15:29:44
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\evalindex\api\evalindex-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 获取年份列表接口
export const getYears = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/GetYears',
        params,
    });
};

// 新增年份接口
export const addYears = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/AddYears',
        params,
    });
};

// 评估指标一级分类接口
export const getPGZBType = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/GetPGZBType',
        params,
    });
};

// 分类下现状指标列表接口
export const getPGZBList = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/GetPGZBList',
        params,
    });
};

// 评估指标年份文件树列表接口
export const getFileTree = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/GetFileTree',
        params,
    });
};

// 保存现状指标接口
export const savePGZBData = (data) => {
    return request({
        method: 'POST',
        url: '/DQPG/SavePGZBData',
        data,
    });
};

// 定期评估现状指标上传
export const uploadDQPGFile = (data) => {
    return request({
        method: 'POST',
        url: '/DQPG/uploadDQPGPackageFile',
        data,
    });
};

// 导出
export const ExportZBTemplate = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/ExportZBTemplate',
        params,
    });
};

// 导入
export const ImportZBExcel = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/ImportZBExcel',
        params,
    });
};