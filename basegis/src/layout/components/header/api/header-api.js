/*
 * @Author: WCL
 * @Date: 2021-11-16 09:32:59
 * @LastEditors: WCL
 * @LastEditTime: 2021-11-16 10:15:24
 * @FilePath: \webgis\src\layout\components\header\api\header-api.js
 * @Description: 请填写描述
 */
import request from '@/utils/request';

// 用户顶部菜单
export const GetRuleModule = (params) => {
    return request({
        method: 'GET',
        url: '/UserModule/GetRuleModule',
        params,
    });
};

//系统退出登录
export const logout=()=>{
    return request({
        method: 'GET',
        url: '/Login/Logout',
    });
};
