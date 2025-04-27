/*
 * @Author: WCL
 * @Date: 2021-12-22 11:03:19
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-10 14:15:01
 * @FilePath: \webgis\src\views\plan\planlist\js\planlist.js
 * @Description: 项目列表JS
 */

import { getType, saveProject, getList, delProject } from '../api/planlist-api';
import qs from 'qs';
export default {
    name: '',
    props: {},
    components: {},
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
                ghname: '',
                ghtype: '',
                ghintro: '',
                gharea: '',
                ounit: '',
                yearstart: '',
                yeartarget: '',
            },
            addFormRule: {
                ghname: [
                    {
                        required: true,
                        message: '规划名称不能为空',
                        trigger: 'blur',
                    },
                ],
                ghtype: [
                    {
                        required: true,
                        message: '规划类型不能为空',
                        trigger: 'change',
                    },
                ],
                yearstart: [
                    {
                        required: true,
                        message: '规划起始年不能为空',
                        trigger: 'blur',
                    },
                ],
                yeartarget: [
                    {
                        required: true,
                        message: '规划目标年不能为空',
                        trigger: 'blur',
                    },
                ],
                ounit: [
                    {
                        required: true,
                        message: '委托单位不能为空',
                        trigger: 'blur',
                    },
                ],
            },
            jdData: [], // 项目阶段
            addTitle: '',
        };
    },
    computed: {},
    watch: {},
    created() {},
    async mounted() {
        this.pagesize = this.pagesizeArr[0];
        await this.getRegionData();
        this.getTableData();
    },
    methods: {
        // 搜索项目
        onSearch() {
            this.getTableData(this.searchform);
        },

        // 规划项目列表数据组装
        getTableData(form) {
            let params = {
                uid: sessionStorage.getItem('userid'),
                ghtype: 0,
                keyword: '',
                currentpage: this.currentPage,
                pagesize: this.pagesize,
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
            this.getTableList(params);
        },

        /* 左侧类型点击 */
        selectType(index) {
            console.log(index, 'index');
            this.searchform.ghtype = Number(index);
            this.getTableData(this.searchform);
        },

        // 获取规划项目列表
        async getTableList(params) {
            const { data: res } = await getList(params);
            if (res.code === 1) {
                this.tableData = res.data.datas;
                this.tableTotal = res.data.total;
                this.loading = false;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 获取规划类型
        async getRegionData() {
            const { data: res } = await getType();
            if (res.code === 1) {
                this.regionData = res.data;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 每条页数改变
        handleSizeChange(val) {
            this.pagesize = val;
            this.getTableData(this.searchform);
        },

        // 当前页码改变
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getTableData(this.searchform);
        },

        // 添加项目
        addItem() {
            this.addTitle = '添加项目';
            this.dialogAddItem = true;
        },

        // 添加项目-关闭
        closeAddDialog() {
            this.addForm = this.$options.data().addForm;
            this.$refs.addFormRef.resetFields();
        },

        // 保存新增
        addFormInfo() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return this.$message.warning('请补充必填项');
                // PID 新增传0
                let data = {
                    PID: this.addForm.pid || 0,
                    USERID: sessionStorage.getItem('userid'),
                    PRJNAME: this.addForm.ghname,
                    PRJINTRO: this.addForm.ghintro,
                    GHAREA: this.addForm.gharea,
                    TYPEID: this.addForm.ghtype,
                    OUNIT: this.addForm.ounit,
                    YEARSTART: this.addForm.yearstart,
                    YEARTARGET: this.addForm.yeartarget,
                };
                const { data: res } = await saveProject(qs.stringify(data));
                if (res.code === 1) {
                    this.$message.success('添加成功');
                    this.dialogAddItem = false;
                    this.currentPage = 1;
                    this.getTableData();
                } else {
                    this.$message.error(res.msg);
                }
            });
        },

        // 成果阶段审查列表
        handleDetail(row) {
            console.log(row);
            this.$router.push({
                path: `/plandetail/${row.PID}`,
                query: {
                    name: row.PRJNAME,
                },
            });
        },

        // 修改信息
        handleEdit(row) {
            this.addTitle = '修改项目';
            this.dialogAddItem = true;
            Object.assign(this.addForm, {
                pid: row.PID,
                ghname: row.PRJNAME,
                userid: sessionStorage.getItem('userid'),
                ghintro: row.PROJECTINTRO,
                gharea: row.GHAREA,
                ghtype: String(row.TYPEID),
                ounit: row.OUNIT,
                yearstart: row.YEARSTART,
                yeartarget: row.YEARTARGET,
            });
        },

        // 删除信息
        async handleDelete(row) {
            console.log(row);
            let params = {
                pid: row.PID,
            };
            const { data: res } = await delProject(params);
            if (res.code === 1) {
                this.$message.success('删除成功');
                this.getTableData(this.searchform);
            } else {
                this.$message.error(res.msg);
            }
        },
    },
};
