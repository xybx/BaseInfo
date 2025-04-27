/*
 * @Author: WCL
 * @Date: 2021-12-28 11:03:17
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-05 11:18:42
 * @FilePath: \webgis\src\views\plan\planlist\components\plandetail\api\plandetail-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 项目阶段记录列表接口
export const getList = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetJDRecordList',
        params,
    });
};

// 项目阶段记录列表接口
export const getJDList = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetJDRecords',
        params,
    });
};

// 新增/保存项目阶段接口
export const saveStage = (data) => {
    return request({
        method: 'POST',
        url: '/GHSC/SaveJDRecord',
        data,
    });
};

// 阶段类型列表
export const getJDType = () => {
    return request({
        method: 'GET',
        url: '/GHSC/GetJDList',
    });
};

// 删除阶段接口
export const delStage = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/DeleteJDRecord',
        params,
    });
};

// 上传材料压缩包
export const uploadPackage = (data) => {
    return request({
        method: 'POST',
        url: '/GHSC/uploadPackageFile',
        data,
    });
};

//成果审查接口
export const createExamReport = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/createExamReport',
        params,
    });
};

/* 审查方案-开始审查 */
export const checkSchemeApi = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/ZTGHSJCheck',
        params,
    });
};

/* 获取可用审查要点 */
export const getEnableRelationApi = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetEnableRelation',
        params,
    });
};