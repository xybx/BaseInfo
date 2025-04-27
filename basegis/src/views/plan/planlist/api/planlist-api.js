/*
 * @Author: WCL
 * @Date: 2021-12-22 11:03:30
 * @LastEditors: WCL
 * @LastEditTime: 2021-12-31 13:41:26
 * @FilePath: \webgis\src\views\plan\planlist\api\planlist-api.js
 * @Description: 项目列表API
 */
import request from '@/utils/request';

// 规划类型接口
export const getType = () => {
    return request({
        method: 'GET',
        url: '/GHSC/GetTypeList',
    });
};

// 保存/新增规划项目接口
export const saveProject = (data) => {
    return request({
        method: 'POST',
        url: '/GHSC/SaveProject',
        data,
    });
};

// 规划项目列表接口
export const getList = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetGHBZList',
        params,
    });
};

// 删除规划项目接口
export const delProject = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/DeleteProjects',
        params,
    });
};
