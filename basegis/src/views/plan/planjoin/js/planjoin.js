/*
 * @Author: WCL
 * @Date: 2021-12-30 11:22:04
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-10 13:32:19
 * @FilePath: \webgis\src\views\plan\planjoin\js\planjoin.js
 * @Description: 请填写描述
 */
import { getType, getList, getPJNameList,createSJHJ,getSJHJRecords,exportSJHJZIP } from '../api/planjoin-api';

export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            loading: true,
            // 搜索表单
            searchform: {
                keywords: '',
                ghtype: '',
                prjid: '',
            },
            // 规划类型选项
            regionData: [],
            // 规划名称选项
            nameData: [],
            // 质检表格数据
            tableData: [],
            // 质检表格分页
            currentPageTop: 1,
            pagesizeTop: 10,
            pagesizeArrTop: [10, 20, 50, 100],
            tableTotalTop: 0,
            // 历史记录数据
            historyData: [],
            // 历史记录分页
            currentPageBot: 1,
            pagesizeBot: 10,
            pagesizeArrBot: [10, 20, 50, 100],
            tableTotalBot: 0,
            txtCenter: {
                textAlign: 'center',
            },
            // 汇交弹窗
            dialogFormVisible: false,
            form: {
                hjdate: '',
                hjdesc: '',
            },
            formLabelWidth: '120px',
            planName: '',
            tableTotal: null,
            pid: null,
            joinRules: {
                hjdate: [
                    {
                        required: true,
                        message: '时间不能为空',
                        trigger: 'change',
                    },
                ],
                hjdesc: [
                    {
                        required: true,
                        message: '描述不能为空',
                        trigger: 'blur',
                    },
                ],
            },
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.pagesizeTop = this.pagesizeArrTop[0];
        this.getRegionData();
        this.getTableData();
        this.getHisData()
    },
    methods: {
        // 获取规划类型
        async getRegionData() {
            const { data: res } = await getType();
            if (res.code === 1) {
                this.regionData = res.data;
                this.getProjectNames();
            } else {
                this.$message.error(res.msg);
            }
        },

        // 规划类型选择事件
        changeType() {
            this.getProjectNames();
            this.searchform.prjid = '';
            this.searchform.keywords = '';
        },

        // 获取项目名称列表
        async getProjectNames() {
            let params = {
                uid: sessionStorage.getItem('userid'),
                typeid: this.searchform.ghtype || 0,
            };

            const { data: res } = await getPJNameList(params);
            if (res.code === 1) {
                this.nameData = res.data;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 规划项目选择事件
        changePRJ() {
            this.searchform.keywords = '';
        },

        // 搜索项目
        onSearch() {
            this.getTableData(this.searchform);
        },

        // 成果质检点击事件
        handleQC(scope) {
            console.log(scope);
            //this.dialogFormVisible = true;
            this.planName = scope.PRJNAME;
            this.pid = scope.PID;
            this.beginJoin();
        },

        // 获取数据汇交列表
        getTableData(form) {
            let params = {
                uid: sessionStorage.getItem('userid'),
                keyword: '',
                currentpage: this.currentPageTop,
                pagesize: this.pagesizeTop,
                prjid: 0,
            };

            if (form?.ghtype) {
                Object.assign(params, {
                    ghtype: form.ghtype,
                });
            }
            if (form?.keywords) {
                Object.assign(params, {
                    keyword: form.keywords,
                });
            }
            if (form?.prjid) {
                Object.assign(params, {
                    prjid: form.prjid,
                });
            }
            this.getTableList(params);
        },

        // 获取规划项目列表
        async getTableList(params) {
            const { data: res } = await getList(params);
            if (res.code === 1) {
                this.tableData = res.data.datas;
                this.tableTotalTop = res.data.total;
                this.loading = false;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 汇交列表每条页数改变
        handleSizeChangeTop(val) {
            this.pagesizeTop = val;
            this.getTableData(this.searchform);
        },

        // 汇交列表当前页码改变
        handleCurrentChangeTop(val) {
            this.currentPageTop = val;
            this.getTableData(this.searchform);
        },

        async getHisData() {
            let params = {
                uid: sessionStorage.getItem('userid'),
            };
            const { data: res } = await getSJHJRecords(params);
            if(res.code==1){
                this.historyData = res.data
            }
            else
            {
                this.$message.error(res.msg);
            }  
        },

        handleReport() {
            console.log('质检报告');
        },

        // 开始汇交
        async beginJoin() {
            var loading = this.$loading({ text: '正在生成汇交记录...' })
            let params = {
                pid: this.pid,
                uid: sessionStorage.getItem('userid'),
            };
            const { data: res } = await createSJHJ(params);
            if (res.code === 1) {
                loading.close();
                this.getHisData();

                var sjhj_pid=res.data;

                let params_exp = {
                    pid:sjhj_pid,
                    jdid:this.pid,
                    uid:sessionStorage.getItem('userid'),
                };
                const { data: res_exp } = await exportSJHJZIP(params_exp);
                if (res_exp.code == 1) {
					this.$message.success('汇交成功')
					this.getHisData()
				} else {
					console.log(result.msg)
				}
            } else {
                loading.close();
                this.$message.error(res.msg);
            }


        },

        // 列表文件下载
        handleDown(val) {
            window.open(apiURL_file +  val.HJFILENAME);
        },

        // 历史列表每条页数改变
        handleSizeChangeBot(val) {
            this.pagesizeBot = val;
        },

        // 历史列表当前页码改变
        handleCurrentChangeBot(val) {
            this.currentPageBot = val;
        },
    },
};
