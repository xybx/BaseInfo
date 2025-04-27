/*
 * @Author: WCL
 * @Date: 2022-03-14 15:54:12
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-21 13:57:48
 * @FilePath: \webgis\src\views\plan\planqc2\api\planqc2-api.js
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
        url: '/GHSC/GetProjectRecordList',
        params,
    });
};

//成果数据列表
export const getCGDataList = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetJDCGDatas',
        params,
    });
};
