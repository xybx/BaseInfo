/*
 * @Author: WCL
 * @Date: 2021-12-29 14:46:58
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-10 13:23:50
 * @FilePath: \webgis\src\views\plan\planqc\js\planqc.js
 * @Description: 请填写描述
 */

import { getType, getList, getPJNameList } from '../api/planqc-api';

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
                prjid: '',
            },
            // 规划类型选项
            regionData: [],
            // 规划名称选项
            nameData: [],
            // 质检表格数据
            tableData: [],
            // 质检列表分页
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
            // 质检弹窗
            dialogFormVisible: false,
            planName: '',
            QCoptions: [
                {
                    value: '1',
                    label: '控制性详细规划',
                },
                {
                    value: '2',
                    label: '国土空间总体规划',
                },
            ],
            QCvalue: '',
            twoCheckList: [],
            allCheckList: [],
            qcList: [],
            focusItem: null,
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.pagesizeTop = this.pagesizeArrTop[0];
        this.getRegionData();
        this.getTableData();
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
            this.dialogFormVisible = true;
            this.planName = scope.prjname;
            this.getAllCheckList();
        },

        // 获取成果质检列表数据组装
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
                    typeid: form.ghtype,
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

        // 质检列表每条页数改变
        handleSizeChangeTop(val) {
            this.pagesizeTop = val;
            this.getTableData(this.searchform);
        },

        // 质检列表当前页码改变
        handleCurrentChangeTop(val) {
            this.currentPageTop = val;
            this.getTableData(this.searchform);
        },

        // 获取历史记录列表
        async getHisData() {},

        handleReport() {
            console.log('质检报告');
        },

        // 历史列表每条页数改变
        handleSizeChangeBot(val) {
            this.pagesizeBot = val;
        },

        // 历史列表当前页码改变
        handleCurrentChangeBot(val) {
            this.currentPageBot = val;
        },

        // 获取质检总规则列表
        getAllCheckList() {
            this.allCheckList = [
                {
                    label: '数据文件形式检查',
                    checked: false,
                    id: 1,
                    children: [
                        {
                            id: 11,
                            title: '目录及文件规范性',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 12,
                            title: '目录及文件规范性2',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 13,
                            title: '目录及文件规范性3',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 14,
                            title: '目录及文件规范性4',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 15,
                            title: '目录及文件规范性5',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                    ],
                },
                {
                    label: '空间数据基本检查',
                    checked: false,
                    id: 2,
                    children: [
                        {
                            id: 21,
                            title: '空间数据规范性',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 22,
                            title: '空间数据规范性2',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 23,
                            title: '空间数据规范性3',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 24,
                            title: '空间数据规范性4',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 25,
                            title: '空间数据规范性5',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                    ],
                },
                {
                    label: '空间属性数据标准符合性检查',
                    checked: false,
                    id: 3,
                    children: [
                        {
                            id: 31,
                            title: '图层间一致性规范性',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 32,
                            title: '图层间一致性规范性2',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 33,
                            title: '图层间一致性规范性3',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 34,
                            title: '图层间一致性规范性4',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                        {
                            id: 35,
                            title: '目录及文件规范性5',
                            checked: false,
                            content:
                                '数据符合汇交规范对控制性详细规划成果数据内容的要求，不存在丢漏',
                        },
                    ],
                },
            ];
            this.twoCheckList = this.allCheckList[0].children;
            this.focusItem = this.allCheckList[0].id;
        },

        // 质检规则选择
        changeQCRules(val) {
            console.log(val);
        },

        // 进度环
        progressTxt() {
            return '进度';
        },

        // 一级列表标签点击事件
        clickOnebox(obj) {
            this.twoCheckList = obj.children;
            this.focusItem = obj.id;
        },

        // 二级列表复选框事件
        changeTwoCheck(obj) {
            let arr = this.qcList.includes(obj);
            let itemIndex = this.qcList.indexOf(obj);
            if (obj.checked && !arr) {
                this.qcList.push(obj);
            } else {
                this.qcList.splice(itemIndex, 1);
            }
        },

        // 开始质检
        beginQC() {
            if (this.qcList.length == 0) {
                this.$message.warning('请勾选具体规则后再提交');
            } else {
                console.log(this.qcList, '开始质检');
            }
        },

        // 导出质检报告
        exportQCReport() {
            console.log('导出质检报告');
        },
    },
};
