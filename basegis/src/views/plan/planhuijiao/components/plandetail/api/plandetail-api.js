/*
 * @Author: WCL
 * @Date: 2021-12-28 11:03:17
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-05 11:18:42
 * @FilePath: \webgis\src\views\plan\planlist\components\plandetail\api\plandetail-api.js
 * @Description: 请填写描述
 */
import request from "@/utils/request";

// 项目阶段记录列表接口
export const getList = (params) => {
  return request({
    method: "GET",
    url: "/GHSC/GetJDRecordList",
    params,
  });
};

// 新增/保存项目阶段接口
export const saveStage = (data) => {
  return request({
    method: "POST",
    url: "/GHSC/SaveJDRecord",
    data,
  });
};

// 阶段类型列表
export const getJDType = () => {
  return request({
    method: "GET",
    url: "/GHSC/GetJDList",
  });
};

// 删除阶段接口
export const delStage = (params) => {
  return request({
    method: "GET",
    url: "/GHSC/DeleteJDRecord",
    params,
  });
};

// 上传材料压缩包
export const uploadPackage = (data) => {
  return request({
    method: "POST",
    url: "/GHSC/uploadPackageFile",
    data,
  });
};

//获取授权
export const getUserAuth = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGuNYApi/getUserAuth",
    params,
  });
};

//同步省厅下发的任务
export const getTask = () => {
  return request({
    method: "GET",
    url: "/TiJianPingGuNYApi/getTask",
  });
};

//获取任务下发的指标列表
export const getTaskZBList = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGu/getTaskZBList",
    params,
  });
};

//保存指标值
export const saveZBValue = (data) => {
  return request({
    method: "POST",
    url: "/TiJianPingGu/saveZBValue",
    data,
  });
};

//保存文件
export const savefile = (data) => {
  return request({
    method: "POST",
    url: "/TiJianPingGu/savefile",
    data,
  });
};

//推送指标数据
export const pushChecks = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGuNYApi/pushChecks",
    params,
  });
};

//推送指标数据
export const complete = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGuNYApi/complete",
    params,
  });
};

//获取审批流程列表
export const getProcess = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGuNYApi/getProcess",
    params,
  });
};

//获取审批附件
export const getProcessFiles = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGuNYApi/getProcessFiles",
    params,
  });
};

//获取审批附件
export const getProcessFiles2 = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGuNYApi/getProcessFiles2",
    params,
  });
};

//获取审批附件
export const getProcessFiles3 = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGuNYApi/DownloadFile",
    params,
  });
};

//导出
export const exportfile = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGu/ExportZBExcel",
    params,
  });
};

//导入
export const importfile = (params) => {
  return request({
    method: "GET",
    url: "/TiJianPingGu/ImportZBExcel",
    params,
  });
};
