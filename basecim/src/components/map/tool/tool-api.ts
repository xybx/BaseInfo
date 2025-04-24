import request from '@/utils/request';

/* 获取比例尺 */
export const getScaleListApi = (params: any) => {
    return request({
        method: 'GET',
        url: '/dimensional/dict/code',
        params,
    });
};
