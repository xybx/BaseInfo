/*
 * @Author: WCL
 * @Date: 2022-02-18 10:30:51
 * @LastEditors: LJX
 * @LastEditTime: 2022-02-22 15:14:06
 * @FilePath: \webgis\src\components\onemap\onemap-project\api\onemap-project-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 获取项目核查结果表头
export const getCols = () => {
    return request({
        method: 'GET',
        url: '/XMHC/GetResultTableHeads',
    });
};

//项目核查
export const startXMHC = (data) => {
    return request({
        method: 'POST',
        url: '/XMHC/GetXMHCResult',
        data
    });
};

export const getLayers=(params)=>{
    return request({
        method: 'GET',
        url: '/XMHC/GetXMHCLayerList',
        params
    });
}


