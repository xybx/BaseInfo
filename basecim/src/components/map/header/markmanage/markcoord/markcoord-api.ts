import request from '@/utils/request';

/* 获取坐标数据 */
export const getDataApi = (params: object) => {
    return request({
        method: 'GET',
        url: '/markCoordinate/list',
        params,
    });
};

/* 保存坐标数据 */
export const saveCoordApi = (data: object) => {
    return request({
        method: 'POST',
        url: '/markCoordinate/save',
        data,
    });
};

/* 删除坐标数据 */
export const delCoordApi = (pid: string) => {
    return request({
        method: 'POST',
        url: `/markCoordinate/del/${pid}`,
    });
};
