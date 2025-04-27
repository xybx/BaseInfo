/*
 * @Author: WCL
 * @Date: 2021-11-30 16:49:00
 * @LastEditors: WCL
 * @LastEditTime: 2022-02-18 10:11:17
 * @FilePath: \webgis\src\components\onemap\onemap-paper\api\onemap-paper-api.js
 * @Description: 叠加图纸API
 */
import request from '@/utils/request';

// 上传通用文件接口
export const uploadDwg = (data) => {
    return request({
        method: 'POST',
        url: '/Upload/uploadfile',
        data,
    });
};

// 解析DWG文件接口
export const readDWGApi = (params) => {
    return request({
        method: 'GET',
        url: '/ReadFile/ReadCAD',
        params,
    });
};

// 解析TXT文件接口
export const readTXTApi = (params) => {
    return request({
        method: 'GET',
        url: '/ReadFile/GetTxtPoints',
        params,
    });
};

// 解析SHP文件接口
export const readSHPApi = (params) => {
    return request({
        method: 'GET',
        url: '/ReadFile/ReadSHP',
        params,
    });
};

