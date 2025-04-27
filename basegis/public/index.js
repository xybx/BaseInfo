/*
 * @Author: WCL
 * @Date: 2021-11-12 17:06:24
 * @LastEditors: xybx
 * @LastEditTime: 2024-06-14 11:47:40
 * @FilePath: \webgis\public\index.js
 * @Description: 公共配置API
 */

// 网站标题
const websiteTitle = "国土空间规划一张图实施监督系统";

// 后台接口API地址
// const apiURL = "http://192.168.1.177/StandardAPI/api";
const apiURL = "http://10.13.181.62/webgisapi/api";
//const apiURL = 'http://localhost:49273/api';

const loginApi= `http://10.9.21.177:18080/dgp-server-web-nr`
const cityApiOne= `http://10.9.21.177:18080/tangram/v1`
const cityApiTwo= `http://10.9.21.177:18080/tangram/v2`
//基础信息平台接口地址
const basicapiURL = "http://192.168.1.177/WebApi/api";

// 文件预览前缀地址
const apiURL_file = "http://192.168.1.177/StandardAPI";

// 知识库文件地址
const apiURL_sys_file = "http://192.168.1.177/ManageApi";

// NA服务(分析评价-路网分析)
const serviceAreaUrl =
    "http://202.101.128.22:8887/arcgis/rest/services/GP/DLFX/NAServer/ServiceArea";
//const serviceAreaUrl =
//  "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea";

// 文件预览插件配置地址
const previewURL = "http://192.168.1.177:8012/onlinePreview?url=";
// 文件预览插件版本：1-4.0版本，2-2.2.1版本
const kkfileVersion = 1;
// 图形渲染的形式 1:面 ，2：边界线
const symbolStyle = 2;

// 影像图配置-图层树中必须有的影像图
const yxtLayerName = "201902影像图（高清）";

// 投影坐标系(茌平用)
const projectedWkid = 4528;
//true:导出坐标文件需要转化投影坐标系，false:不需要
const openProjectWkid = false;

// 登录页、首页风格 1:标准版 2:福建城乡规划院
const pageStyle = 1;

// 是否显示导航页 true:显示 false:直接进入一张图
const showHome = true;

// 是否开启三维
const open3D = true;
//底图开关 false不显示。true:显示
const OpenBaseMap = true;

// 查询定位-系统经纬度范围配置
const longAndlat = {
    xmin: 117,
    xmax: 123,
    ymin: 23,
    ymax: 28,
    wkid: 4326,
};

// 查询定位-坐标系配置开关
const setQueryWkid = true;

// 初始化和全图时的地图缩放比例
const mapParameters = {
    // 主地图比例
    scale: 200000,
    // 分析评价地图比例
    fxScale: 200000,
};

// 绿地分析图表展示字段
const ldField = "公园绿地";

// 顶部是否显示运维中心
const showOPS = false;

// 运维中心跳转地址
const devURL = "http://192.168.1.186:8093/#/tokenlogin";

//底图是否做裁剪，true:对地图做裁剪，false:不做裁剪
const isBaseMapCut = false;
//裁剪字段【行政区编码】
const cutAttrName = "XZQDM";
//底图显示区域字段对应的值【行政区编码】
const cutAttrValue = "350181119";
//行政区边界图层服务地址
const xzqlayer =
    "http://202.101.128.22:8887/arcgis/rest/services/XZQY_ZJ/MapServer/0";

// //临西市县数据汇交接口地址
// const lxFileUpload='http://13.80.7.252:88/LzWeb/XTHome/FileUpload';
// //const lxFileUpload='/LzWeb/XTHome/FileUpload';
// const lxFileUploadIP="http://13.80.7.252:88";

//系统所属行政区等级(张家口市县一体化) 1:市局 2：县区
const xzqLevel = 1;
//系统区域版本（只针对数据汇交功能 ny:宁远,hb:河北，st:标准版市县一体化）
//const areaVersion = "hb";
//系统区域版本（只针对数据汇交功能 ny:宁远,hb:河北，st:标准版市县一体化,qx:栖霞县）
const areaVersion = "hb";

//专题图地图打印模式 print和screenshot
const MapPrintMode = "screenshot";

/* 
    国土空间开发适宜性评价右侧表格
*/
const landTableData = [
    // 生态保护重要性评价
    {
        id: 1,
        label: "生态保护重要性评价",
        cols: [
            {
                prop: "type",
                label: "类型",
            },
            {
                prop: "range",
                label: "生态保护红线",
            },
        ],
        tableList: [
            {
                type: "极重要区",
                range: "123",
            },
            {
                type: "重要区",
                range: "456",
            },
            {
                type: "超出评价范围",
                range: "789",
            },
        ],
    },
    // 城镇建设适宜性评价
    {
        id: 2,
        label: "城镇建设适宜性评价",
        cols: [
            {
                prop: "type",
                label: "类型",
            },
            {
                prop: "range",
                label: "城镇开发边界",
            },
        ],
        tableList: [
            {
                type: "城镇建设适宜区",
                range: "123",
            },
            {
                type: "城镇建设不适宜区",
                range: "456",
            },
            {
                type: "海洋开发利用适宜区",
                range: "789",
            },
            {
                type: "海洋开发利用不适宜区",
                range: "987",
            },
            {
                type: "超出评价范围",
                range: "654",
            },
        ],
    },
    // 农业生产适宜性评价
    {
        id: 3,
        label: "农业生产适宜性评价",
        cols: [
            {
                prop: "type",
                label: "类型",
            },
            {
                prop: "range",
                label: "农业生产适宜性评价",
            },
        ],
        tableList: [
            {
                type: "种植业适宜区",
                range: "123",
            },
            {
                type: "种植业不适宜区",
                range: "456",
            },
            {
                type: "渔业适宜区",
                range: "789",
            },
            {
                type: "渔业不适宜区",
                range: "987",
            },
            {
                type: "超出评价范围",
                range: "654",
            },
        ],
    },
];

//系统是否开放授权,默认true(开启授权)
const isSystemAuth=false;



// 栖霞项目表单配置
const qxFormConfig = [
    {
        label: "规划名称：",
        bind:'sjzgjbxxb.projectname',
      },
      {
        label: "入库编号：",
        bind:'sjzgjbxxb.projectnumber',
      },
      {
        label: "创建时间：",
        bind:'sjzgjbxxb.createtime',
      },
      {
        label: "批准文号：", 
        bind:'sjzgjbxxb.approvalnumber',
      },
      {
        label: "批准日期：",
        bind: "sjzgjbxxb.approvaltime",
      },
      {
        label: "批准机关：",
        bind: "sjzgjbxxb.approvalunit",
      },
      {
        label: "行政区名称：",
        bind: "sjzgjbxxb.xzqmc",
      },
      {
        label: "编制单位：",
        bind: "sjzgjbxxb.compilationunit",
        type: "text",
      },
      {
        label: "联系人：",
        bind: "sjzgjbxxb.contact",
      },
      {
        label: "联系电话：",
        bind: "sjzgjbxxb.contactinformation",
      },
      {
        label: "备注：",
        bind: "sjzgjbxxb.remark",
      },
        {
            label: "县分管领导审查意见",
            bind: "sjzgscyj.xfgjzscopinon",
        },
        {
            label: "县分管领导签名",
            bind: "sjzgscyj.xfgjzscsign",
        },
        {
            label: "县分管领导审查时间",
            bind: "sjzgscyj.xfgjzsctime",
        },
      {
        label: "县空间规划科长审查意见",
        bind: "sjzgscyj.xkjghkkzscopinion",
      },
      {
        label: "县空间规划科长签名",
        bind: "sjzgscyj.xkjghkkzscsign",
      },
      {
        label: "县空间规划科长审查时间",
        bind: "sjzgscyj.xkjghkkzsctime",
      },
]