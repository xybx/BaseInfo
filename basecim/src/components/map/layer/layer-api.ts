import request from '@/utils/request';

/* 
    获取图层树列表
*/
export const getLayersApi = (params: object) => {
    return request({
        method: 'GET',
        url: '/dimensional/queryLayer',
        params,
    });
};

//图文关联列表
export const getLayerFileApi = (params: object) => {
    return request({
        method: 'GET',
        url: '/layer/imgTextAssociation/tree',
        params,
    });
};
