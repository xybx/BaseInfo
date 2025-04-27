/*
 * @Author: WCL
 * @Date: 2021-11-12 16:03:57
 * @LastEditors: WCL
 * @LastEditTime: 2021-11-12 17:37:03
 * @FilePath: \webgis\src\views\home\api\home-api.js
 * @Description: 首页API
 */
import request from '@/utils/request';

// 获取列表
export const getModule = (params) => {
    return request({
        method: 'GET',
        url: '/UserModule/GetRuleModule',
        params,
    });
};

//修改密码
export const changePwd = (data) => {
    return request({
        method: 'POST',
        url: '/Login/ChangePwd',
        data
    });
};

//修改密码提醒
export const changePwdRemind = () => {
    return request({
        method: 'GET',
        url: '/Login/changePwdRemind',
    });
};

