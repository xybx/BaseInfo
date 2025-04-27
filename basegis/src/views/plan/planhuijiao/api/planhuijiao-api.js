/*
 * @Author: WCL
 * @Date: 2021-12-22 11:03:30
 * @LastEditors: WCL
 * @LastEditTime: 2023-01-04 11:33:01
 * @FilePath: \webgis\src\views\plan\planhuijiao\api\planhuijiao-api.js
 * @Description: 项目列表API
 */
import request from '@/utils/request';
import axios from 'axios';

// 规划类型接口
export const getType = () => {
    return request({
        method: 'GET',
        url: '/GHSC/GetTypeList',
    });
};

// 保存/新增规划项目接口
export const saveProject = (data) => {
    return request({
        method: 'POST',
        url: '/GHSC/SaveProject',
        data,
    });
};

// 规划项目列表接口
export const getList = (params) => {
    return request({
        method: 'GET',
        url: '/Docking/GetProjectPageList',
        params,
    });
};

// 删除规划项目接口
export const delProject = (params) => {
    return request({
        method: 'GET',
        url: '/GHSC/DeleteProjects',
        params,
    });
};

// 宁远-上传文件
export const uploadToLeader = (data) => {
    return request({
        method: 'POST',
        url: '/Docking/UploadToLeader',
        data,
    });
};

// 宁远-根据项目ID获取信息
export const getProById = (params) => {
    return request({
        method: 'GET',
        url: '/Docking/GetUploadInfo',
        params,
    });
};

// 宁远-重新上传项目
export const reuploadById = (params) => {
    return request({
        method: 'GET',
        url: '/Docking/ReUploadToLeader',
        params,
    });
};

// 宁远-获取文件下载路径
export const getDownFile = (params) => {
    return request({
        method: 'GET',
        url: '/Docking/GetDownLoadFile',
        params,
    });
};

// 宁远-批复文件上传
export const setUploadReply = (data) => {
    return request({
        method: 'POST',
        url: '/Docking/UploadReply',
        data,
    });
};

//上传文件到本地服务器，并创建汇交记录
export const uploadLocalhost= (data) => {
    return request({
        method: 'POST',
        url: '/SJHJ/CreateSJHJRecord',
        data,
    });
};

//更改汇交状态
export const updateProjectStatus = (params) => {
    return request({
        method: 'GET',
        url: '/SJHJ/UpdateProjectStatus',
        params,
    });
};

//张家口数据汇交与省厅对接------------------------------
//上传文件到本地服务器，并创建汇交记录,并解压
export const uploadData= (data) => {
    return request({
        method: 'POST',
        url: '/HeBeiDataReport/uploadData',
        data,
    });
};

//加密压缩zip文件
export const ZipDirecortyFiles = (params) => {
    return request({
        method: 'GET',
        url: '/HeBeiDataReport/ZipDirecortyFiles',
        params,
    });
};

//压缩文件分片
export const SpliteFiles = (params) => {
    return request({
        method: 'GET',
        url: '/HeBeiDataReport/SpliteFiles',
        params,
    });
};

//开始分片上传（调用省厅分片上传接口）
export const UploadSplite = (params) => {
    return request({
        method: 'GET',
        url: '/HeBeiDataReport/UploadSplite',
        params,
    });
};

//合并文件（调用省厅接口）
export const UnionFiles = (params) => {
    return request({
        method: 'GET',
        url: '/HeBeiDataReport/UnionFiles',
        params,
    });
};


//对压缩密码加密（调用省厅接口）
export const SaveResult = (params) => {
    return request({
        method: 'GET',
        url: '/HeBeiDataReport/SaveResult',
        params,
    });
};

//保存成果包文件（调用省厅接口：上报完成）
export const SaveZip = (params) => {
    return request({
        method: 'GET',
        url: '/HeBeiDataReport/SaveZip',
        params,
    });
};
//断点续传
export const BreakPointResume=(params)=>{
    return request({
        method: 'GET',
        url: '/HeBeiDataReport/BreakPointResume',
        params,
    });
};

//获取县区汇交记录
export const getLowerList = (params) => {
    return request({
        method: 'GET',
        url: '/SJHJ/GetLowerPageList',
        params,
    });
};

//成果审查接口
export const createExamReport = (params) => {
    return request({
        method: 'GET',
        url: '/SJHJ/createExamReport',
        params,
    });
};

//标准版上报接口,获取用户token
export const getUserToken=()=>{
    return request({
        method: 'GET',
        url: '/DataReported/GetUserToken',
    });
}

//标准版上报接口,成果包上传，本地分片接口
export const uploaSTdData= (data) => {
    return request({
        method: 'POST',
        url: '/DataReported/UploadDataToFragment',
        data,
    });
};

//标准版上报接口,上报成果包文件基本信息
export const reportFileInfo= (params) => {
    return request({
        method: 'GET',
        url: '/DataReported/ReportFileInfo',
        params,
    });
};


//标准版上报接口,分片上传接口
export const uploadDataToLeader= (params) => {
    return request({
        method: 'GET',
        url: '/DataReported/UploadDataToLeader',
        params,
    });
};

//标准版上报接口,数据合并
export const uploadDataMerge= (params) => {
    return request({
        method: 'GET',
        url: '/DataReported/UploadDataMerge',
        params,
    });
};

//标准版上报接口,保存项目信息
export const saveSTProject= (params) => {
    return request({
        method: 'GET',
        url: '/DataReported/SaveProject',
        params,
    });
};

//删除上报成果接口
export const deleteProject=(params)=>{
    return request({
        method: 'GET',
        url: '/SJHJ/DeleteProject',
        params,
    });
}


//县区下载成果文件接口
export const ByteToZip=(params)=>{
    return request({
        method: 'GET',
        url: '/SJHJ/ByteToZip',
        params,
    });
}

//获取任务列表
export const getTaskList=()=>{
    return request({
        method: 'GET',
        url: '/TiJianPingGu/getTaskList',
    });
}

//获取审查结果
export const getSCReport=(params)=>{
    return request({
        method: 'GET',
        url: '/DataReported/getSCReport',
        params
    });
}


