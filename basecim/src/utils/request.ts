import axios from 'axios';
import router from '@/router';
const request = axios.create({ baseURL: window.apiURL });

// 请求拦截
request.interceptors.request.use(
    (config: any) => {
        const token = JSON.parse(
            sessionStorage.getItem('23vUser') as string
        )?.token;
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);
// 响应拦截
request.interceptors.response.use(
    (res) => {
        //   if (res.data.code == 403) {
        //     sessionStorage.removeItem('23vUser');
        //     router.push('/login');
        //   }
        return res;
    },
    (error) => {
        Promise.reject(error);
    }
);

export default request;
