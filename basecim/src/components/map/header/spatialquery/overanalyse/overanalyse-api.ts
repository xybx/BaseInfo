import request from '@/utils/request';

/* 上传文件接口 */
export const uploadApi = (params: object) => {
    return request({
        method: 'POST',
        url: '/File/handleFile',
        params,
    });
};
