import request from '@/utils/request';

/*
    获取要点列表
    @uid 用户ID
 */
export const getGistApi = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetTopicsLsit',
        params,
    });
};

/*
    获取审查要点
    @uid 用户ID
    @name 审查名称
 */
export const getRelationApi = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/GetAllRelation',
        params,
    });
};

/*
    更新审查要点
    @code
    @IsEnabled:0 未启用；1 启用
*/
export const updatePointApi = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/UpdateYDRelation',
        params,
    });
};

/*
    更新要点内容
    @code  code值
    @value Name字段
*/
export const updateYDContApi = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/UpdateYDContent',
        params,
    });
};
