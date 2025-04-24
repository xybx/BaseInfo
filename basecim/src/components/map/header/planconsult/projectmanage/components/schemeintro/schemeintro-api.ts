import request from '@/utils/request';

// 获得项目列表
export const getProjectsList = (params: any) => {
    return request({
        method: 'GET',
        url: '/projects/list',
        params,
    });
};
// 获得项目方案
export const getprojectsSchemes = (params: any) => {
    return request({
        method: 'GET',
        url: '/projectsSchemes/list',
        params,
    });
};
// 获得控制指标经济指标数据
export const getprojectsIndexs = (params: any) => {
    return request({
        method: 'GET',
        url: '/projectsIndexs/list',
        params,
    });
};

// 获取方案绑定图层服务列表
export const getBindLayerApi = (params: any) => {
    return request({
        method: 'GET',
        url: '/projectsLayer/list',
        params,
    });
};

// 获取方案汇演各类型绑定的图层服务列表
export const getHyLayerApi = (params: any) => {
    return request({
        method: 'GET',
        url: '/projectsDemosLayers/list',
        params,
    });
};
