/*
 * @Author: WCL
 * @Date: 2021-11-12 13:38:43
 * @LastEditors: LJX
 * @LastEditTime: 2022-08-23 17:34:25
 * @FilePath: \webgis\src\views\tokenlogin\api\login-api.js
 * @Description: 登录API
 */
import request from '@/utils/request';

// 获取部门列表
export const getDepts = () => {
    return request({
        method: 'GET',
        url: '/Login/GetAllDepts',
    });
};

// 获取人员列表
export const getPersons = (params) => {
    return request({
        method: 'GET',
        url: '/Login/GetAllPersons',
        params,
    });
};

// 宁远登录认证
export const login = (params) => {
    return request({
        method: 'GET',
        url: '/Login/TokenLogin',
        params,
    });
};

//烟台栖霞市县对接登录认证
export const ytlogin = (params) => {
    return request({
        method: 'GET',
        url: '/Login/YTTokenLogin',
        params,
    });
};
