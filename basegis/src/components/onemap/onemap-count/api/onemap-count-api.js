/*
 * @Author: WCL
 * @Date: 2022-01-18 09:42:43
 * @LastEditors: LJX
 * @LastEditTime: 2022-01-19 15:30:50
 * @FilePath: \webgis\src\components\onemap\onemap-count\api\onemap-count-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 获取标签页接口
export const getConditionTypeList = (params) => {
    return request({
        method: 'GET',
        url: '/Condition/GetConditionTypeList',
        params,
    });
};

// 获取条件查询图层列表接口
export const getConditionLayerList = (params) => {
    return request({
        method: 'GET',
        url: '/Condition/GetConditionLayerList',
        params,
    });
};

// 获取条件查询表单字段列表接口
export const getConditionFieldList = (params) => {
    return request({
        method: 'GET',
        url: '/Condition/GetConditionFieldList',
        params,
    });
};

// 获取条件查询表单下拉列表接口
export const getConditionFieldValueList = (params) => {
    return request({
        method: 'GET',
        url: '/Condition/GetConditionFieldValueList',
        params,
    });
};


// 获取条件查询每个类型对应的查询结果展示字段列表
export const getConditionTabResultFields = (params) => {
    return request({
        method: 'GET',
        url: '/Condition/GetConditionTabResultFields',
        params,
    });
};
