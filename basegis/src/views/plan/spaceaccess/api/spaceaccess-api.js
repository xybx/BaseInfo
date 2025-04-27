import request from '@/utils/request';

/* 获取审查结果 */
export const getCheckResApi = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetCheckRes',
        params,
    });
};

export const getMapDatas = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/ReadGDBZBList',
        params,
    });
};

