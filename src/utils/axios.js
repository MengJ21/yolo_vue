import axios from "axios";
import {getToken} from "@/utils/cache/cookies.ts";
// import { ElMessage } from 'element-plus';
// import storage  from './localStorageTool.js'

axios.defaults.baseURL = "http://localhost:8089/yoloTest"; //yoloTest

const request = axios.create({
    // timeout: 10000, TODO 后面视频渲染的时间长 所以不设置超时了
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
});

request.interceptors.request.use(config => {
    if (getToken()) {
        config.headers['token'] = getToken() //storage.get('token') //localStorage.getItem('token')
        return config;
    }
    return config;
})
//
// request.interceptors.response.use(response => {
//     if (response.data.code === 200){
//         console.log(response)
//         let msg = response.data.msg
//         if (msg === '登录成功' || msg === '创建成功' || msg === '删除成功' || msg === '更新成功' || msg === '注册成功'){
//             ElMessage.success(response.data.msg)
//         }
//         if(response.data.code===501){
//             ElMessage.success(response.data.msg)
//         }
//         return response;
//     } else {
//         if(response.config.url==='/goods/test'){
//             return Promise.reject(response)
//         }
//         ElMessage.error(response.data.msg)
//         console.log(response)
//         return Promise.reject(response)
//     }
// },error => {
//     console.log(error)
//     return Promise.reject(error)
// })

export default request;
