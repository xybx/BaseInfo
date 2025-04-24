import request from '@/utils/request';

// 场景书签--获取场景书签列表
export const getMarkList = () => {
    return request({
        method: 'GET',
        url: '/sceneBookMark/historyList',
    });
};

// 场景书签--新增场景书签
export const saveMark = (data: object) => {
    return request({
        method: 'POST',
        url: '/sceneBookMark/save',
        data,
    });
};

// 场景书签--删除场景书签
export const deleteMark = (pid: number) => {
    return request({
        method: 'POST',
        url: '/sceneBookMark/del/' + pid,
    });
};
