/*
 * @Author: WCL
 * @Date: 2022-01-05 16:23:01
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-10 11:41:27
 * @FilePath: \webgis\src\views\plan\planqc\api\planqc-api.js
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
