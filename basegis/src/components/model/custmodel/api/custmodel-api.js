/*
 * @Author: WCL
 * @Date: 2022-01-13 10:07:49
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-20 16:12:34
 * @FilePath: \webgis\src\components\model\custmodel\api\custmodel-api.js
 * @Description: 请填写描述
 */

import request from '@/utils/request';

// 获取模型列表
export const getModelList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetModelList',
        params,
    });
};

//保存模型接口
export const saveModel = (data) => {
    return request({
        method: 'POST',
        url: '/ZBMX/Model_Save',
        data,
    });
};

//删除数据源
export const deleteModel = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/ModelDelete',
        params,
    });
};

//获取行政区
export const getXzqList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetXZQList',
        params,
    });
};

//获取分类列表
export const getFunClassList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetFUNCLASSList',
        params
    });
};

//获取一级分类
export const getONEList = () => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetFirstFLList',
    });
};

//获取二级分类
export const getTWOList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetSencondFLList',
        params,
    });
};
//获取模型名称列表
export const getModelNameList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetModelNameList',
        params,
    });
};

//获取模型名称列表
export const getZBListBySys = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GeZBList',
        params,
    });
};



//获取算法列表
export const getAlgList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GeALGList',
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

// 指标项显示配置列表
export const getModuleZBConfig = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetModelZBConfig',
        params,
    });
};

// 编辑指标模型详细信息
export const getModuleInfo = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetModelInfo',
        params,
    });
};

// 运行数据项
export const runModel = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX_RUN/RunModel',
        params,
    });
};

//获取指标模型运行日志
export const getModelLogList=(params)=>{
    return request({
        method: 'GET',
        url: '/ZBMX_RUN/GetModelLogList',
        params,
    });
}