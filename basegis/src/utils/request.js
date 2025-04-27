/*
 * @Author: 王成龙
 * @Date: 2021-11-12 13:22:42
 * @LastEditors: WCL
 * @LastEditTime: 2021-11-16 11:11:34
 * @FilePath: \webgis\src\utils\request.js
 * @Description: axios 入口请求文件
 */
import axios from 'axios';
import { Message } from 'element-ui';
import router from '../router';

const request = axios.create({
    baseURL: window.apiURL,
});


// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // debugger;
        const token = localStorage.getItem('token');
        //const user = localStorage.getItem('user');
        if (token) {
            // debugger;
            config.headers.auth = token;
        }
        return config;
    },
    (error) => {
        // debugger;
        console.log(error);
        return Promise.reject();
    }
);

// 响应拦截
request.interceptors.response.use(
    (response) => {
        // debugger;
        if (response.status === 200) {
            if (response.data.code === 1) {
                return response;
            } else {
               // Message.error(response.data.msg);
                return response;
            }
        } else {
            return Promise.reject();
        }
    },
    (error) => {
        // debugger;
        const { response } = error;
        if (response.data.code === -1) {
            Message.error(response.data.msg);
            return router.push('/login');
            //return Message.error(response.data.msg);
        }
        return Promise.reject();
    }
);

export default request;

// // 请求拦截器
// request.interceptors.request.use(
//     (config) => {
//         // 统一设置用户身份 token
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // 响应拦截器
// request.interceptors.response.use(
//     (response) => {
//         // 统一处理响应错误
//         return response;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// export default request;
