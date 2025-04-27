/*
 * @Author: WCL
 * @Date: 2022-01-14 14:41:43
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 14:33:58
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\planindex\api\planindex-api.js
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

// 评估指标一级分类接口
export const getPGZBType = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/GetPGZBTypeAll',
        params,
    });
};

// 分类下现状指标列表接口
export const getPGZBGHList = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/GetPGZBGHList',
        params,
    });
};

// 保存现状指标接口
export const savePGZBGHData = (data) => {
    return request({
        method: 'POST',
        url: '/DQPG/SavePGZBGHData',
        data,
    });
};

// 导出
export const ExportGHZBTemplate = () => {
    return request({
        method: 'GET',
        url: '/DQPG/ExportGHZBTemplate',        
    });
};

// 导入
export const ImportGHZBExcel = (params) => {
    return request({
        method: 'GET',
        url: '/DQPG/ImportGHZBExcel',
        params,
    });
};
