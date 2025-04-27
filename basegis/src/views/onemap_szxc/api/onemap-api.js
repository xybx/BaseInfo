/*
 * @Author: WCL
 * @Date: 2021-11-16 10:00:37
 * @LastEditors: WCL
 * @LastEditTime: 2022-02-27 17:51:25
 * @FilePath: \webgis\src\views\onemap\api\onemap-api.js
 * @Description: 一张图API
 */
import axios from 'axios';
import request from '@/utils/request';

// 全部图层列表接口
export const getMenuList = (params) => {
    return request({
        method: 'GET',
        url: '/OneMap/GetMenuList',
        params,
    });
};

// 常用图层列表接口
export const getUserMenu = (params) => {
    return request({
        method: 'GET',
        url: '/OneMap/Get_User_Menu_Group',
        params,
    });
};

// 图层服务地址接口
export const getServer = (url) => {
    const requestServer = axios.create({
        baseURL: url,
    });
    return requestServer({
        method: 'GET',
        url: '?f=pjson',
    });
};

// 添加收藏图层
export const addCollection = (params) => {
    return request({
        method: 'GET',
        url: '/OneMap/AddCollection',
        params,
    });
};

// 取消收藏图层
export const cancleCollection = (params) => {
    return request({
        method: 'GET',
        url: '/OneMap/DeleteCollection',
        params,
    });
};
