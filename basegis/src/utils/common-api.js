/*
 * @Author: LJX
 * @Date: 2022-01-18 10:13:45
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-20 18:31:15
 * @FilePath: \webgis\src\utils\common-api.js
 * @Description: 公用接口
 */
import request from "@/utils/request";
import { getMapGeometryService } from "../components/map/mapcontrol/components/api/control-api";
import axios from "axios";

//获取计算服务地址
export const getMapGeometryServiceUrl =
	async () => {
		let MapGeometryServerUrl = "";
		let user = {
			uid: window.sessionStorage.getItem(
				"userid"
			),
		};
		const { data: res } =
			await getMapGeometryService(user);
		if (res.code === 1) {
			MapGeometryServerUrl =
				res.data.MAPGEOMETRYSERVICEURL;
		}
		return MapGeometryServerUrl;
	};

//保存地图打印的图片
export const savePrintImage = (data) => {
	return request({
		method: "POST",
		url: "/Upload/SavePrintMapImage",
		data,
	});
};

//保存地图打印的图片
export const savePrintBitImage = (data) => {
	return request({
		method: "POST",
		url: "/Upload/SavePrintBitImage",
		data,
	});
};

// 上传通用文件接口
export const uploadFile = (data) => {
	return request({
		method: "POST",
		url: "/Upload/uploadfile",
		data,
	});
};

// 获取用户信息
export const getUserInfoApi = (params) => {
	return request({
		method: "GET",
		url: "/Login/GetUserInfo",
		params,
	});
};

export const getUserInfoApi2 = (params) => {
	// return request({
	// 	method: "GET",
	// 	url: "/Login/GetUserInfo",
	// 	params,
	// });
	const requestServer = axios.create({
		method: "GET",
		baseURL: apiURL + "/UserModule/GetUserInfo",
		headers: {
			'Auth': localStorage.getItem('token'),
			//'Access-Control-Allow-Origin': '*'
		}
	});
	return requestServer();
};

//获取图层图例信息
export const getLegend = (url) => {
	const requestServer = axios.create({
		method: "GET",
		baseURL: url + "/legend?f=pjson",
	});
	return requestServer();
};
