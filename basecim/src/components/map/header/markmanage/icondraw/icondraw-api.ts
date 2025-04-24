import request from '@/utils/request';

/* 
    获取当前用户创建的项目及绘制记录列表
*/
export const getIconProjectList = () => {
    return request({
        method: 'GET',
        url: '/icon/list/records',
    });
};

//保存项目或者图标
export const saveProjectIcon = (data: object) => {
    return request({
        method: 'POST',
        url: '/icon/save',
        data,
    });
};

//删除项目或者图标
export const deleteProjectIcon = (data: any) => {
    return request({
        method: 'POST',
        url: '/icon/del/'+data.pid,
        data,
    });
};


