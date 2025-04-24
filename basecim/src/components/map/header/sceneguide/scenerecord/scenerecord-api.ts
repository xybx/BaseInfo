import request from '@/utils/request';

/* 获取场景漫游数据列表 */
export const getScenerecordList = (params: any) => {
    return request({
        method: 'GET',
        url: '/sceneRoaming/list',
        params
    });
};

//删除一条场景漫游数据
export const delScenerecord = (params: any) => {
    return request({
        method: 'POST',
        url: '/sceneRoaming/del/' + params.pid,
        params
    });
};

//保存一条场景漫游数据
export const saveScenerecord = (data: any) => {
    return request({
        method: 'POST',
        url: '/sceneRoaming/saveOrEdit',
        data
    });
};