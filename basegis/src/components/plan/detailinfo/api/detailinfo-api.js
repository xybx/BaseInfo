/*
 * @Author: WCL
 * @Date: 2022-01-04 16:01:44
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-05 15:36:47
 * @FilePath: \webgis\src\components\plan\detailinfo\api\detailinfo-api.js
 * @Description: 详细信息API
 */

import request from '@/utils/request';

// 详细信息底部表单接口
export const getBottomInfo = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetJDRecordDetailInfo',
        params,
    });
};

// 项目管理文件树接口
export const getFileTree = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetFileTree',
        params,
    });
};

// 数据汇交成果目录树接口
export const getSJHJFileTree = (params) => {
    return request({
        method: 'GET',
        url: '/SJHJ/GetFileTree',
        params,
    });
};


// 导入EXCEL接口
export const uploadExcel = (data) => {
    return request({
        method: 'POST',
        url: '/GHSC/UploadGHZBExcel',
        data,
    });
};

// 文件数-添加文件接口
export const addFile = (data) => {
    return request({
        method: 'POST',
        url: '/File/UploadGHBZFile',
        data,
    });
};

// 文件树删除
export const delFile = (params) => {
    return request({
        method: 'GET',
        url: '/File/DelFile',
        params,
    });
};

// 阶段表单保存接口
export const saveInfo = (data) => {
    return request({
        method: 'POST',
        url: '/GHSC/SaveDetailInfo',
        data,
    });
};

// 县区数据汇交成果目录树接口
export const getLowerFileTree = (params) => {
    return request({
        method: 'GET',
        url: '/SJHJ/GetLowerFileTree',
        params,
    });
};

