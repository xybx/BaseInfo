/*
 * @Author: WCL
 * @Date: 2022-01-14 14:43:06
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 17:04:01
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\evalresult\js\evalresult.js
 * @Description: 请填写描述
 */
import { exportPGZBZIP, getPGCGRecord } from '../api/evalresult-api';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            hisResultData: [],
            dialogFormVisible: false,
            reportForm: {
                name: '',
                time: '',
                explain: '',
            },
            formLabelWidth: '120px',
            planName: '',
            form: {
                name: '',
                years: '',
                yeare: '',
                // descs: '',
            },
            formRules: {
                name: [
                    {
                        required: true,
                        message: '名称不能为空',
                        trigger: 'blur',
                    },
                ],
                years: [
                    {
                        required: true,
                        message: '年份不能为空',
                        trigger: 'blur',
                    },
                ],
                yeare: [
                    {
                        required: true,
                        message: '年份不能为空',
                        trigger: 'blur',
                    },
                ],
            },
            currentPage: 1,
            pagesize: 10,
            pagesizeArr: [10, 20, 50, 100],
            tableTotal: 0,
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.getHisData();
    },
    methods: {
        // 获取列表信息
        async getHisData() {
            let params = {
                userid: sessionStorage.getItem('userid'),
                currentpage: this.currentPage,
                pagesize: this.pagesize,
            };
            const { data: res } = await getPGCGRecord(params);
            if (res.code === 1) {
                this.hisResultData = res.data.datas;
                this.tableTotal = res.data.total;
            } else {
                this.$message.error(res.msg);
            }
            console.log(res);
        },

        // 生成评估报告
        createReport() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    let createLoad = this.$loading({
                        text: '正在生成评估成果中...',
                    });
                    Object.assign(this.form, {
                        userid: sessionStorage.getItem('userid'),
                    });
                    const { data: res } = await exportPGZBZIP(this.form);

                    if (res.code === 1) {
                        createLoad.close();
                        this.$message.success('生成报告成功');
                        this.$refs.form.resetFields();
                        this.getHisData();
                    } else {
                        createLoad.close();
                        this.$message.error(res.msg);
                    }
                } else {
                    this.$message.warning('请补充必填项');
                }
            });
        },

        // 列表文件下载
        handleDown(val) {
            window.open(apiURL_file + '/' + val);
        },

        // 当前页显示数量改变
        handleSizeChange(val) {
            this.pagesize = val;
            this.getHisData();
        },

        // 当前页改变
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getHisData();
        },
    },
};
