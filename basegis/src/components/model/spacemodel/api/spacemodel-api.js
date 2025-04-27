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
        url: '/ZBMX/GetModelSpaceList',
        params,
    });
};

//保存模型接口
export const saveModel = (data) => {
    return request({
        method: 'POST',
        url: '/ZBMX/ModelSPace_Save',
        data,
    });
};

