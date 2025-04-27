/*
 * @Author: WCL
 * @Date: 2021-11-12 13:38:43
 * @LastEditors: WCL
 * @LastEditTime: 2021-11-16 10:49:54
 * @FilePath: \webgis\src\views\login\api\login-api.js
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

// 登录
export const login = (params) => {
    return request({
        method: 'GET',
        url: '/Login/Login',
        params,
    });
};

//验证系统是否授权
export const isRegist = (params) => {
    return request({
        method: 'GET',
        url: '/Regist/IsRegist',
    });
};

//获取系统授权码
export const getRegistCode = () => {
    return request({
        method: 'GET',
        url: '/Regist/GetRegistCode',
    });
};

//系统授权
export const Regist = (params) => {
    return request({
        method: 'GET',
        url: '/Regist/Regist',
        params
    });
};


