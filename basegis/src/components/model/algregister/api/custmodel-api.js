/*
 * @Author: WCL
 * @Date: 2022-01-13 10:07:49
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-20 16:12:34
 * @FilePath: \webgis\src\components\model\custmodel\api\custmodel-api.js
 * @Description: 请填写描述
 */

import request from '@/utils/request';

// 获取列表
export const getList = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMXALG/GetListByPage',
        params,
    });
};
///计算类型
export const getcalcTypeList = () => {
    return request({
        method: 'GET',
        url: '/ZBMXALG/GetcalcTypeList',       
    });
};


//保存模型接口
export const saveAlg = (data) => {
    return request({
        method: 'POST',
        url: '/ZBMXALG/Save',
        data,
    });
};

//删除数据源
export const deleteAlg = (params) => {
    return request({
        method: 'GET',
        url: '/ZBMXALG/Delete',
        params,
    });
};

