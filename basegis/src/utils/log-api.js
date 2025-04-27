/*
 * @Author: LJX
 * @Date: 2022-04-20 18:31:46
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-20 19:04:30
 * @FilePath: \webgis\src\utils\log-api.js
 * @Description: 日志接口
 */

import request from '@/utils/request';
//退出登录日志
export const writelogoutlog = (params) => {
    return request({
        method: 'GET',
        url: '/Log/writeLogoutLog',
        params,
    });
  };

  //记录图层异常日志
export const writeMapServerLog = (params) => {
    return request({
        method: 'GET',
        url: '/Log/writeMapServerLog',
        params,
    });
  };
