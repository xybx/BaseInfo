/*
 * @Author: WCL
 * @Date: 2021-12-28 11:03:04
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-10 11:51:38
 * @FilePath: \webgis\src\views\plan\planlist\components\plandetail\js\plandetail.js
 * @Description: 项目阶段JS
 */

import {
    getList,
    saveStage,
    getJDType,
    delStage,
    uploadPackage,
} from '../api/plandetail-api';
import DetailInfo from '@/components/plan/detailinfo/vue/DetailInfo.vue';
import qs from 'qs';
export default {
    name: '',
    props: {},
    components: { DetailInfo },
    data() {
        return {
            loading: true,
            searchform: {
                keywords: '',
                ghtype: '',
            },
            // 规划类型选项
            regionData: [],
            // 表格数据
            tableData: [],
            currentPage: 1,
            pagesize: 10,
            pagesizeArr: [10, 20, 50, 100],
            tableTotal: 0,
            dialogAddItem: false,
            addForm: {
                jdbh: '',
                gharea: '',
                bzunit: '',
                wtunit: '',
                wtdept: '',
                ghfw: '',
            },
            addFormRule: {
                jdbh: [
                    {
                        required: true,
                        message: '阶段编号不能为空',
                        trigger: 'change',
                    },
                ],
                gharea: [
                    {
                        required: true,
                        message: '规划面积不能为空',
                        trigger: 'blur',
                    },
                ],
                bzunit: [
                    {
                        required: true,
                        message: '编制单位不能为空',
                        trigger: 'blur',
                    },
                ],
                wtunit: [
                    {
                        required: true,
                        message: '委托单位不能为空',
                        trigger: 'blur',
                    },
                ],
                wtdept: [
                    {
                        required: true,
                        message: '委托部门不能为空',
                        trigger: 'blur',
                    },
                ],
                ghfw: [
                    {
                        required: true,
                        message: '规划范围不能为空',
                        trigger: 'blur',
                    },
                ],
            },
            jdData: [], // 项目阶段
            // 项目类型列表
            JDTypeList: [],
            // 详细信息开关
            dialogInfo: false,
            // 项目信息ID
            pid: null,
            // 项目信息/编辑开关
            showBtn: false,
            // 当前阶段信息
            currentInfo: {},
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.getTableData();
    },
    methods: {
        // 搜索项目
        onSearch() {
            console.log('搜索项目');
        },

        // 每条页数改变
        handleSizeChange(val) {
            this.pagesize = val;
        },

        // 当前页码改变
        handleCurrentChange() {
            this.currentPage = val;
        },

        // 添加项目
        addItem() {
            this.dialogAddItem = true;
            this.getJDTypeList();
        },

        // 关闭项目
        closeAddDialog() {
            this.$refs.addFormRef.resetFields();
        },

        // 保存项目
        addFormInfo() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return this.$message.error('请补充必填项');
                console.log(this.addForm, 'addForm');
                // PID: 0为新增
                let data = {
                    PID: 0,
                    PROJECTID: this.$route.params.pid,
                    JDBH: this.addForm.jdbh,
                    GHAREA: this.addForm.gharea,
                    BZUNIT: this.addForm.bzunit,
                    WTUNIT: this.addForm.wtunit,
                    WTDEPT: this.addForm.wtdept,
                    GHFW: this.addForm.ghfw,
                    USERID: sessionStorage.getItem('userid'),
                };

                const { data: res } = await saveStage(qs.stringify(data));
                debugger;
                if (res.code === 1) {
                    this.$message.success('添加成功');
                    this.dialogAddItem = false;
                    this.getTableData();
                } else {
                    this.$message.error(res.msg);
                }
            });
        },

        // 获取项目阶段列表
        async getTableData() {
            console.log(this.$route);
            let params = {
                prjid: this.$route.params.pid,
                keyword: '',
                currentPage: this.currentPage,
                pagesize: this.pagesize,
            };
            const { data: res } = await getList(params);
            console.log(res, 'res');
            if (res.code === 1) {
                this.tableData = res.data.datas;
                this.tableTotal = res.data.total;
                this.loading = false;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 获取阶段类型
        async getJDTypeList() {
            const { data: res } = await getJDType();
            console.log(res, '阶段类型');
            if (res.code === 1) {
                this.JDTypeList = res.data;
            }
        },

        // 详细信息
        handleDetail(row, boo) {
            this.pid = row.PID;
            this.showBtn = boo;
            this.dialogInfo = true;
        },

        // 关闭详细信息
        closePlanUser() {
            this.dialogInfo = false;
        },

        // 删除阶段
        async handleDelete(row) {
            console.log(row);
            let params = {
                pid: row.PID,
            };
            const { data: res } = await delStage(params);
            if (res.code === 1) {
                this.$message.success('删除成功');
                this.getTableData();
            } else {
                this.$message.error(res.msg);
            }
        },

        // 上传材料
        uploadFile(row) {
            console.log(row, 'row');
            this.currentInfo = row;
        },

        // 自定义上传事件
        async handleUpload(params) {
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '上传中...',
                duration: 0,
                customClass: 'prop-search',
            });

            let form = new FormData();
            form.append('pid', this.currentInfo.PID);
            form.append('projectname', this.$route.query.name);
            form.append('file', params.file);

            debugger
            const { data: res } = await uploadPackage(form);

            console.log(res, 'upres');
            if (res.code === 1) {
                loading.close();
                this.$message.success('上传成功');
            } else {
                loading.close();
                this.$message.error(res.msg);
            }
        },
    },
};
