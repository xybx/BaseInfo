/*
 * @Author: WCL
 * @Date: 2022-01-13 10:06:22
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-13 10:06:22
 * @FilePath: \webgis\src\components\model\basicmodel\api\basicmodel-api.js
 * @Description: 请填写描述
 */

import request from '@/utils/request';

// 获取数据源列表
export const getDSList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetSDEDatabaseList',
        params,
    });
};

//保存数据源接口
export const saveDS = (data) => {
    return request({
        method: 'POST',
        url: '/ZBMX/SaveSDEDatabase',
        data,
    });
};

//删除数据源
export const deleteDS = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/DSDelete',
        params,
    });
};

// 获取指标列表
export const getZBList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetModelZBList',
        params,
    });
};

//保存矢量指标
export const saveSL_ZB = (data) => {
    return request({
        method: 'POST',
        url: '/ZBMX/ModelZB_SL_Save',
        data,
    });
};

//保存数值指标
export const saveNUM_ZB = (data) => {
    return request({
        method: 'POST',
        url: '/ZBMX/ModelZB_NUM_Save',
        data,
    });
};

//删除指标
export const deleteZB = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/ModelZBDelete',
        params,
    });
};
