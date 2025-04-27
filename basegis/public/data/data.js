// 绿地分析数据
const ldfxData = [
    {
        ldfx: [
            {
                ydxz: '广场用地',
                ydmj: '18376.06',
            },
            {
                ydxz: '防护绿地',
                ydmj: '189684.46',
            },
            {
                ydxz: '公园绿地',
                ydmj: '352817.6',
            },
        ],
        xzqmc: '石竹街道',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '1628272.44',
            },
            {
                ydxz: '广场用地',
                ydmj: '44775.56',
            },
            {
                ydxz: '防护绿地',
                ydmj: '445336.64',
            },
        ],
        xzqmc: '宏路街道1',
    },
    {
        ldfx: [
            {
                ydxz: '防护绿地',
                ydmj: '273775.99',
            },
            {
                ydxz: '广场用地',
                ydmj: '451.35',
            },
            {
                ydxz: '公园绿地',
                ydmj: '1070529.61',
            },
        ],
        xzqmc: '音西街道',
    },
    {
        ldfx: [
            {
                ydxz: '防护绿地',
                ydmj: '242420.78',
            },
            {
                ydxz: '公园绿地',
                ydmj: '737597.77',
            },
            {
                ydxz: '广场用地',
                ydmj: '25369.18',
            },
        ],
        xzqmc: '龙江街道',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '224382.84',
            },
            {
                ydxz: '防护绿地',
                ydmj: '84648.35',
            },
        ],
        xzqmc: '东阁华侨',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '12914.91',
            },
        ],
        xzqmc: '沙埔镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '377273.89',
            },
            {
                ydxz: '防护绿地',
                ydmj: '272553.16',
            },
        ],
        xzqmc: '高山镇',
    },
    {
        ldfx: [
            {
                ydxz: '广场用地',
                ydmj: '8844.53',
            },
            {
                ydxz: '防护绿地',
                ydmj: '57128.9',
            },
            {
                ydxz: '公园绿地',
                ydmj: '137881.28',
            },
        ],
        xzqmc: '三山镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '4503.66',
            },
            {
                ydxz: '防护绿地',
                ydmj: '9428.35',
            },
        ],
        xzqmc: '南岭镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '14104.89',
            },
            {
                ydxz: '防护绿地',
                ydmj: '2414.27',
            },
        ],
        xzqmc: '一都镇',
    },
    {
        ldfx: [
            {
                ydxz: '防护绿地',
                ydmj: '358664.71',
            },
            {
                ydxz: '广场用地',
                ydmj: '24552.39',
            },
            {
                ydxz: '公园绿地',
                ydmj: '33452.52',
            },
        ],
        xzqmc: '新厝镇',
    },
    {
        ldfx: [
            {
                ydxz: '防护绿地',
                ydmj: '713851.84',
            },
            {
                ydxz: '公园绿地',
                ydmj: '383156.26',
            },
        ],
        xzqmc: '江镜华侨',
    },
    {
        ldfx: [
            {
                ydxz: '广场用地',
                ydmj: '22214.07',
            },
            {
                ydxz: '绿地与广场用地',
                ydmj: '18945.3',
            },
            {
                ydxz: '公园绿地',
                ydmj: '919727.46',
            },
            {
                ydxz: '防护绿地',
                ydmj: '269839.97',
            },
        ],
        xzqmc: '龙田镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '133953.7',
            },
            {
                ydxz: '广场用地',
                ydmj: '4938.71',
            },
            {
                ydxz: '防护绿地',
                ydmj: '48966.65',
            },
        ],
        xzqmc: '港头镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '394867.78',
            },
            {
                ydxz: '防护绿地',
                ydmj: '26445.89',
            },
        ],
        xzqmc: '海口镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '174395.55',
            },
            {
                ydxz: '防护绿地',
                ydmj: '203813.04',
            },
        ],
        xzqmc: '上迳镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '2190031.01',
            },
            {
                ydxz: '广场用地',
                ydmj: '27789.38',
            },
            {
                ydxz: '防护绿地',
                ydmj: '1256397.42',
            },
        ],
        xzqmc: '江阴镇',
    },
    {
        ldfx: [
            {
                ydxz: '防护绿地',
                ydmj: '40429.08',
            },
            {
                ydxz: '公园绿地',
                ydmj: '73326.44',
            },
        ],
        xzqmc: '镜洋镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '545935.65',
            },
            {
                ydxz: '防护绿地',
                ydmj: '294796.86',
            },
        ],
        xzqmc: '渔溪镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '382308.16',
            },
            {
                ydxz: '广场用地',
                ydmj: '16054.55',
            },
            {
                ydxz: '防护绿地',
                ydmj: '29411.64',
            },
        ],
        xzqmc: '玉屏街道',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '1805055.14',
            },
            {
                ydxz: '防护绿地',
                ydmj: '325047.89',
            },
        ],
        xzqmc: '江镜镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '2160734.78',
            },
            {
                ydxz: '广场用地',
                ydmj: '70819.83',
            },
            {
                ydxz: '防护绿地',
                ydmj: '952936.47',
            },
        ],
        xzqmc: '阳下街道',
    },
    {
        ldfx: [
            {
                ydxz: '防护绿地',
                ydmj: '1185076.44',
            },
            {
                ydxz: '公园绿地',
                ydmj: '523886.03',
            },
        ],
        xzqmc: '城头镇',
    },
    {
        ldfx: [
            {
                ydxz: '防护绿地',
                ydmj: '50628.58',
            },
            {
                ydxz: '公园绿地',
                ydmj: '32636.91',
            },
        ],
        xzqmc: '东瀚镇',
    },
    {
        ldfx: [
            {
                ydxz: '防护绿地',
                ydmj: '33970.61',
            },
            {
                ydxz: '公园绿地',
                ydmj: '18489.94',
            },
        ],
        xzqmc: '东张镇',
    },
    {
        ldfx: [
            {
                ydxz: '公园绿地',
                ydmj: '2066570.9',
            },
            {
                ydxz: '防护绿地',
                ydmj: '211649.72',
            },
            {
                ydxz: '广场用地',
                ydmj: '165596.11',
            },
        ],
        xzqmc: '龙山街道',
    },
];

// 智能选址 - 产业类型
const aiTypeOpts = [
    {
        label: '商业用地',
        value: '商业用地',
    },
    {
        label: '节能环保产业',
        value: '节能环保产业',
    },
    {
        label: '新兴信息产业',
        value: '新兴信息产业',
    },
    {
        label: '新能源产业',
        value: '新能源产业',
    },
    {
        label: '新能源汽车产业',
        value: '新能源汽车产业',
    },
    {
        label: '高端装备制造业',
        value: '高端装备制造业',
    },
    {
        label: '新材料产业',
        value: '新材料产业',
    },
    {
        label: '海洋产业',
        value: '海洋产业',
    },
    {
        label: '一般产业',
        value: '一般产业',
    },
    {
        label: '工业仓储',
        value: '工业仓储',
    },
];

// 智能选址 - 选址方法
const aiWayOpts = [
    {
        label: '单地块选址',
        value: 'single',
    },
    {
        label: '多地块组合选址',
        value: 'multiple',
    },
];

// 智能选址 - 查询服务地址
const aiURL = 'http://fqghj.net:8887/arcgis/rest/services/ZNXZ/MapServer/0';

// 智能选址-查询字段
const aiField = 'CYLX';

// 智能选址-结果字段
const aiResField = {
    area: 'YDDM',
    position: 'CYLX',
};
