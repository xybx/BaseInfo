/*
 * @Author: WCL
 * @Date: 2021-11-23 16:20:22
 * @LastEditors: sgz
 * @LastEditTime: 2021-12-07 17:19:06
 * @FilePath: \fq-wclf:\国土空间规划\标准版版本\wcl-standard\webgis\src\components\map\mapcontrol\components\api\control-api.js
 * @Description: 地图按钮API
 */
import request from '@/utils/request';

// 获取计算服务配置
export const getMapGeometryService = (params) => {
    return request({
        method: 'GET',
        url: '/MapConfig/GetUserGeometryService',
        params,
    });
};
