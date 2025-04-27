/*
 * @Author: WCL
 * @Date: 2021-11-16 11:40:54
 * @LastEditors: WCL
 * @LastEditTime: 2021-12-06 11:10:01
 * @FilePath: \webgis\src\store\modules\map3d-store.js
 * @Description: 请填写描述
 */

const state = {
    mapconfig: null, // 底图配置
    sceneview: null, // 三维地图

    //geoscene获取授权参数配置
    username:'siteadmin', //用户名
    password:'admin888',//门户登录密码
    tokenURL:'https://zh.dpinfo.com.cn/geoscene/sharing/rest/generateToken',//获取token地址
    tokenserver:'https://zh.dpinfo.com.cn/geosceneserver/rest/services/',//授权服务器地址
};
const getters = {};
const mutations = {
    sceneview(state,view){
        state.sceneview=view
    }
};
const actions = {};

export default { state, getters, mutations, actions };
