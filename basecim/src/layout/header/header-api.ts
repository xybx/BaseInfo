import request from '@/utils/request';

/* 获取功能列表 */
export const getFuncApi = () => {
    return request({
        method: 'GET',
        url: '/dimensional/functionMenu',
    });
};
