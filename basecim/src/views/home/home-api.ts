import request from '@/utils/request';

/*
    初始化地图
*/
export const initMapApi = (params: object) => {
    return request({
        method: 'GET',
        url: '/dimensional/initMap',
        params,
    });
};

/*
    根据传入code值获取对应的字典值(通用)
*/
export const getDictData = (params: object) => {
    return request({
        method: 'GET',
        url: '/dimensional/dict/code',
        params,
    });
};

/*
    登录接口
*/
export const loginApi = (data: object) => {
    return request({
        method: 'POST',
        url: '/login/loginName',
        data,
    });
};
