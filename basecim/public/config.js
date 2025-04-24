// 接口地址
// const apiURL = 'http://192.168.1.191:8088/23dapi';
const apiURL = 'http://192.168.1.250:8082/fqapi';

// 服务器-底图图片路径
// const apiResource = 'http://192.168.1.191:8088/FileResources';
const apiResource = 'http://192.168.1.250:8082/FileResources';

// 用户登录信息
const userInfo = {
    userName: '13333333333',
    password: 'fq888888',
};

/* view内存限制 */
const memoryLimit = 1024 * 2;

/* 地名查询服务 */
const placeData = [
    {
        id: 3,
        url: 'http://202.101.128.22:8022/arcgis/rest/services/DG/DM/MapServer',
        childlist: [0],
        childfield: ['OBJECTID', 'NAME'],
        showfield: '名称',
    },
    {
        id: 4,
        url: 'http://202.101.128.22:8022/arcgis/rest/services/CXGHBZ/DYKGHF/MapServer',
        childlist: [1, 0],
        childfield: ['OBJECTID', 'FQDYMC'],
        showfield: '分区单元名称',
    },
];

/* 分析白模服务 */
const demoBuildObj = {
    options: [
        {
            isdig: true,
            kind: 3,
            label: '全域建筑白模',
            level: 3,
            maptype: 2,
            opacity: 100,
            order: 0,
            pid: 147,
            range: 'null',
            uncheck: false,
            url: 'https://a3d.dpinfo.com.cn/server/rest/services/Hosted/fqjz/SceneServer',
            visible: true,
        },
    ],
    areafield: 'YDMJ', // 数值
    floorfield: '实际层', //数值
};

/* 统计分析、建设工程项目配置项 */
const buildProOpt = {
    layerName: '划拨项目统计',
    layerUrl:
        'http://202.101.128.22:8887/arcgis/rest/services/YSHBXMHX/MapServer/0',
    // 查询项
    searchOpts: [
        {
            pid: 1,
            tabId: 1,
            status: 1,
            controlType: 'text',
            displayName: '建设单位',
            fieldName: 'FCOMPANY',
            fieldType: 'string',
            valueList: [],
        },
        {
            pid: 2,
            tabId: 1,
            status: 1,
            controlType: 'text',
            displayName: '项目名称',
            fieldName: 'PRJNAME',
            fieldType: 'string',
            valueList: [],
        },
        {
            pid: 3,
            tabId: 1,
            status: 1,
            controlType: 'date',
            displayName: '入库时间',
            fieldName: 'BEGINTIME',
            fieldType: 'date',
            valueList: [],
        },
        {
            pid: 4,
            tabId: 1,
            status: 1,
            controlType: 'list',
            displayName: '建设用地大类',
            fieldName: 'YSYDDL',
            fieldType: 'string',
            valueList: [
                {
                    pid: 1,
                    fieldId: 4,
                    controlValue: '临时用地',
                    controlName: '临时用地',
                    status: 1,
                },
                {
                    pid: 2,
                    fieldId: 4,
                    controlValue: '教育用地',
                    controlName: '教育用地',
                    status: 1,
                },
                {
                    pid: 3,
                    fieldId: 4,
                    controlValue: 'U31消防设施用地',
                    controlName: 'U31消防设施用地',
                    status: 1,
                },
                {
                    pid: 4,
                    fieldId: 4,
                    controlValue: '医疗卫生用地',
                    controlName: '医疗卫生用地',
                    status: 1,
                },
                {
                    pid: 5,
                    fieldId: 4,
                    controlValue: '居住',
                    controlName: '居住',
                    status: 1,
                },
                {
                    pid: 6,
                    fieldId: 4,
                    controlValue: '绿地',
                    controlName: '绿地',
                    status: 1,
                },
            ],
        },
        {
            pid: 5,
            tabId: 1,
            status: 1,
            controlType: 'range',
            displayName: '用地面积',
            fieldName: 'YDMJ',
            fieldType: 'number',
            valueList: [],
        },
        {
            pid: 21,
            tabId: 1,
            status: 1,
            controlType: 'text',
            displayName: '用地位置',
            fieldName: 'FADDRESS',
            fieldType: 'string',
            valueList: [],
        },
    ],
    // 表格项
    resOpts: [
        {
            pid: 1,
            tabid: 1,
            fieldDesc: '项目ID',
            fieldName: 'PRJID',
            fieldType: 'number',
        },
        {
            pid: 2,
            tabid: 1,
            fieldDesc: '项目名称',
            fieldName: 'PRJNAME',
            fieldType: 'string',
        },
        {
            pid: 3,
            tabid: 1,
            fieldDesc: '建设单位',
            fieldName: 'FCOMPANY',
            fieldType: 'string',
        },
        {
            pid: 4,
            tabid: 1,
            fieldDesc: '用地面积(亩)',
            fieldName: 'YDMJ',
            fieldType: 'number',
        },
        {
            pid: 5,
            tabid: 1,
            fieldDesc: '建设用地分类',
            fieldName: 'JSYDFL',
            fieldType: 'string',
        },
        {
            pid: 6,
            tabid: 1,
            fieldDesc: '容积率',
            fieldName: 'RJL',
            fieldType: 'string',
        },
        {
            pid: 7,
            tabid: 1,
            fieldDesc: '建筑密度',
            fieldName: 'JZMD',
            fieldType: 'string',
        },
        {
            pid: 8,
            tabid: 1,
            fieldDesc: '绿地率',
            fieldName: 'LDL',
            fieldType: 'string',
        },
        {
            pid: 9,
            tabid: 1,
            fieldDesc: '入库时间',
            fieldName: 'BEGINTIME',
            fieldType: 'date',
        },
        {
            pid: 27,
            tabid: 1,
            fieldDesc: '用地位置',
            fieldName: 'FADDRESS',
            fieldType: 'string',
        },
    ],
};

/* 叠加分析配置项 */
const overData = [
    {
        isdig: true,
        kind: 3,
        label: '全域建筑白模',
        level: 3,
        maptype: 2,
        opacity: 100,
        order: 0,
        pid: 149,
        range: 'null',
        uncheck: false,
        url: 'https://a3d.dpinfo.com.cn/server/rest/services/Hosted/fqjz/SceneServer',
        visible: true,
    },
];

/*
    控高分析服务
    @feaurl 要素服务地址
*/
const highOpt = {
    renderData: [
        {
            isdig: true,
            kind: 3,
            label: '全域建筑白模',
            level: 3,
            maptype: 2,
            opacity: 100,
            order: 0,
            pid: 147,
            range: 'null',
            uncheck: false,
            url: 'https://a3d.dpinfo.com.cn/server/rest/services/Hosted/jzbm05153D/SceneServer',
            feaurl: 'https://a3d.dpinfo.com.cn/server/rest/services/jzbm05153D/FeatureServer',
            visible: true,
            highfield: 'JZGD',
        },
    ],
};

// 视域分析服务
const viewServer = {
    url: 'https://a3d.dpinfo.com.cn/server/rest/services/Hosted/qx1000/SceneServer',
    nodePagesArray: [0, 1, 2, 3, 4, 5, 6, 7],
};

// 文件预览插件版本：1-4.0版本，2-2.2.1版本
const kkfileVersion = 1;
// 文件预览插件配置地址
const previewURL = 'http://192.168.1.132:8012/onlinePreview?url=';
