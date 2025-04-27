/*
 * @Author: WCL
 * @Date: 2022-02-17 16:19:33
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-03 13:07:05
 * @FilePath: \webgis\src\components\onemap\onemap-redline\api\onemap-redline-api.js
 * @Description: 红线下载API
 */
import request from '@/utils/request';
// 解析DWG文件接口
export const getHXDownLoadLayers = (params) => {
    return request({
        method: 'GET',
        url: '/HXDownload/getHXDownLoadLayers',
        params,
    });
};

//生成红线cad
export const getHXCAD = (params) => {
    return request({
        method: 'GET',
        url: '/HXDownload/ExportHXCAD',
        params,
    });
};