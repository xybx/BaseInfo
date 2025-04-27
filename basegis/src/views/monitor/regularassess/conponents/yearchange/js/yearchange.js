/*
 * @Author: WCL
 * @Date: 2022-01-17 14:44:02
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 15:11:09
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\yearchange\js\yearchange.js
 * @Description: 请填写描述
 */
import { getZBYearChangeList } from '../api/yearchange-api';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            tableData: [],
            tableTotal: null,
            yearsArr: [],
            txtCenter: {
                textAlign: 'center',
            },
            spanArr1: [],
            spanArr2: [],
            pos1: null,
            pos2: null,
            tableHeight: null,
            tableLoading: true,
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.getTableData();
    },
    methods: {
        // 合并行的方法
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0) {
                const _row = this.spanArr1[rowIndex];
                const _col = _row > 0 ? 1 : 0;
                return {
                    rowspan: _row,
                    colspan: _col,
                };
            }
            if (columnIndex === 1) {
                const _row = this.spanArr2[rowIndex];
                const _col = _row > 0 ? 1 : 0;
                return {
                    rowspan: _row,
                    colspan: _col,
                };
            }
        },

        async getTableData() {
            let params = {
                userid: sessionStorage.getItem('userid'),
            };
            const { data: res } = await getZBYearChangeList(params);

            if (res.code === 1) {
                this.yearsArr = res.data.years;
                this.tableData = res.data.zblist;
                this.tableTotal = this.tableData.length;

                // 第一列合并方法
                for (var i = 0; i < this.tableData.length; i++) {
                    if (i === 0) {
                        this.spanArr1.push(1);
                        this.pos1 = 0;
                    } else {
                        if (
                            this.tableData[i].ONETYPENAME ===
                            this.tableData[i - 1].ONETYPENAME
                        ) {
                            this.spanArr1[this.pos1] += 1;
                            this.spanArr1.push(0);
                        } else {
                            this.spanArr1.push(1);
                            this.pos1 = i;
                        }
                    }
                }

                // 第二列合并方法
                for (var i = 0; i < this.tableData.length; i++) {
                    if (i === 0) {
                        this.spanArr2.push(1);
                        this.pos2 = 0;
                    } else {
                        if (
                            this.tableData[i].TWOTYPENAME ===
                            this.tableData[i - 1].TWOTYPENAME
                        ) {
                            this.spanArr2[this.pos2] += 1;
                            this.spanArr2.push(0);
                        } else {
                            this.spanArr2.push(1);
                            this.pos2 = i;
                        }
                    }
                }
                setTimeout(() => {
                    this.tableLoading = false;
                }, 1000);
            } else {
                this.$message.error(res.msg);
            }
        },
    },
};
