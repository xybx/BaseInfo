import axios from 'axios';
import cookie from "@/utils/cooike";

//获取token
export const getTokenApi = (data)=>{
    return axios({
        url:`${window.loginApi}/rest/oms/public/client-account/v1/login`,
        method:'post',
        data
    })
}

//注销用户
export const getLogoutApi = ()=>{
    return axios({
        url:`${window.loginApi}/rest/oms/public/client-account/v1/logout`,
        method:'get',

    })
}

//待办项目
export const getDealtListApi = (data,pageNo,pageSize)=>{
    return axios({
        url:`${window.cityApiOne}/projects/query/doing?parentIndexType=1&childIndexType=2&pageindex=${pageNo}&pagesize=${pageSize}`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken')},
        data
    })
}

//获取流程业务信息
export const getProcessApi = ()=>{
    return axios({
        url:`${window.cityApiOne}/businesses/process?parentIndexType=1&childIndexType=2`,
        method:'get',
        headers:{'x-auth-token':cookie.get('ptoken')},
    })
}

//创建项目
export const getProjectsApi = (data)=>{
    return axios({
        url:`${window.cityApiOne}/projects`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken')},
        data
    })
}

//获取任务运行时元数据（用于推进流程）
export const getProcessRunApi = (taskId)=>{
    return axios({
        url:`${window.cityApiOne}/process/task/${taskId}/meta/runtime`,
        method:'get',
        headers:{'x-auth-token':cookie.get('ptoken')},
    })
}

//获取项目表单列表
export const getProcessFormsApi = (projectId,processTaskId)=>{
    return axios({
        url:`${window.cityApiOne}/projects/forms/${projectId}/${processTaskId}?tangramType=1`,
        method:'get',
        headers:{'x-auth-token':cookie.get('ptoken')},
    })
}

//调整环节实例已读
export const getProcessTaskApi = (taskId)=>{
    return axios({
        url:`${window.cityApiOne}/process/task/${taskId}/read`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken')},
    })
}

//获取项目表单数据
export const getProjectsDataApi = (params)=>{
    return axios({
        url:`${window.cityApiOne}/projects/form/data`,
        method:'get',
        headers:{'x-auth-token':cookie.get('ptoken')},
        params
    })
}
//保存项目表单信息
export const putProjectsDataApi = (data)=>{
    return axios({
        url:`${window.cityApiOne}/projects/form/data`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken')},
        data
    })
}

//获取项目流程环节的材料目录树
export const getMaterialListApi = (projectId,processTaskId)=>{
    return axios({
        url:`${window.cityApiOne}/projects/material/${projectId}/${processTaskId}?type=1`,
        method:'get',
        headers:{'x-auth-token':cookie.get('ptoken')},
    })
}

//获取文件元数据信息，返回文件 md5 值
export const getMaterialCheckApi = (data)=>{
    return axios({
        url:`${window.cityApiTwo}/projects/material/attach/check`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken')},
        data
    })
}

//校验文件当前分片是否存在
export const getMaterialChunkexistApi = (params)=>{
    return axios({
        url:`${window.cityApiTwo}/projects/material/attach/chunkexist`,
        method:'get',
        headers:{'x-auth-token':cookie.get('ptoken')},
        params
    })
}

//分片上传文件 (可不用，可能要写到页面组件上绑定)
export const getMaterialUploadApi = (data)=>{
    return axios({
        url:`${window.cityApiTwo}/projects/material/attach/upload`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken'),'Content-Type':'multipart/form-data'},
        data
    })
}

//合并文件上传 (可不用，可能要写到页面组件上绑定)
export const getMaterialMergeApi = (data)=>{
    return axios({
        url:`${window.cityApiTwo}/projects/material/attach/merge`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken'),},
        data
    })
}

//删除文件
export const delMaterialApi = (attachmentId)=>{
    return axios({
        url:`${window.cityApiOne}/projects/material/attach/${attachmentId}`,
        method:'delete',
        headers:{'x-auth-token':cookie.get('ptoken')},
    })
}

//查询流转日志
export const getOpinionApi = (processInsId)=>{
    return axios({
        url:`${window.cityApiOne}/opinion/process?processInsId=${processInsId}`,
        method:'get',
        headers:{'x-auth-token':cookie.get('ptoken')},
    })
}

//获取流程下一个环节的用户
export const getRoleUsersApi = (data)=>{
    return axios({
        url:`${window.cityApiOne}/permissions/role/users`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken')},
        data
    })
}

//推进流程的环节
export const putFlowTaskApi = (data)=>{
    return axios({
        url:`${window.cityApiOne}/process/task`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken')},
        data
    })
}

//已办项目
export const getOverListApi = (data,pageNo,pageSize)=>{
    return axios({
        url:`${window.cityApiOne}/projects/query/done?parentIndexType=1&childIndexType=2&pageindex=${pageNo}&pagesize=${pageSize}`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken')},
        data
    })
}

//办结项目
export const getFinishListApi = (data,pageNo,pageSize)=>{
    return axios({
        url:`${window.cityApiOne}/projects/query/finish?parentIndexType=1&childIndexType=2&pageindex=${pageNo}&pagesize=${pageSize}`,
        method:'post',
        headers:{'x-auth-token':cookie.get('ptoken')},
        data
    })
}

























