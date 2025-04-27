/*
 * @Author: WCL
 * @Date: 2022-01-12 15:25:57
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-21 13:15:11
 * @FilePath: \webgis\src\views\model\currentindex\api\currentindex-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 获取功能分类接口
export const getFun = () => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetFUNCLASSList',
    });
};

// 获取指标列表接口
export const getZBList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetModelList',
        params,
    });
};

// 获取指标模型详情信息
export const getModuleInfo = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMX/GetModelInfo',
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
