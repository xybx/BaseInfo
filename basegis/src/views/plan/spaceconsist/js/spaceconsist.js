import {
    getGistApi,
    getRelationApi,
    updatePointApi,
    updateYDContApi,
} from '../api/spaceconsist-api';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            filterText: '',
            treeData: [],
            defaultProps: {
                children: 'Items',
                label: 'Thematic',
            },
            tableData: [],
            value: true,
            currNode: '',
            dialogPoint: false,
            editForm: {
                Name: '',
            },
            editFormRule: {
                Name: [
                    {
                        required: true,
                        message: '要点名称不能为空',
                        trigger: 'blur',
                    },
                ],
            },
        };
    },
    computed: {},
    watch: {
        filterText(val) {
            this.$refs.gistTree.filter(val);
        },
    },
    created() {},
    mounted() {
        this.getTreeData();
    },
    methods: {
        // 图层树过滤事件
        filterNode(value, data, node) {
            if (!value) return true;
            let level = node.level;
            let _array = [];
            this.getReturnNode(node, _array, value);
            let result = false;
            _array.forEach((item) => {
                result = result || item;
            });
            return result;
        },
        getReturnNode(node, _array, value) {
            let isPass =
                node.data &&
                node.data.Thematic &&
                node.data.Thematic.indexOf(value) !== -1;
            isPass ? _array.push(isPass) : '';
            this.index++;
            if (!isPass && node.level != 1 && node.parent) {
                this.getReturnNode(node.parent, _array, value);
            }
        },

        /* 获取左侧树级列表 */
        async getTreeData() {
            let params = {
                uid: sessionStorage.getItem('userid'),
            };
            const { data: res } = await getGistApi(params);
            console.log(res, 'res');
            if (res.code === 1) {
                this.treeData = res.data;
            } else {
                this.$message.warning(res.msg);
            }
        },

        /* 树级列表点击 */
        handleTree(data, node) {
            /* 暂定只有两个层级，根级节点点击刷新 */
            if (node.level === 2) {
                this.currNode = data.Thematic;

                this.getTableData();
            }
        },

        async getTableData() {
            let params = {
                uid: sessionStorage.getItem('userid'),
                name: this.currNode,
            };
            const { data: res } = await getRelationApi(params);
            console.log(res, 'res');
            if (res.code === 1) {
                this.tableData = res.data;
            } else {
                this.$message.warning(res.msg);
            }
        },

        /*
            要点使用开关
            @code 当前节点code值
            @value 当前节点IsEnabled 是否开启要点：0 未开启；1 已开启
        */
        async changePoint(val, row) {
            console.log(val);
            console.log(row, 'row');
            let params = {
                code: row.Code,
                value: row.IsEnabled,
            };
            const { data: res } = await updatePointApi(params);
            console.log(res, 'res');
            if (res.code !== 1) return this.$message.warning(res.msg);
            this.$message.success(res.msg);
            this.getTableData();
        },

        /* 修改按钮点击 */
        handleEdit(row) {
            this.dialogPoint = true;
            console.log(row, 'row');
            Object.assign(this.editForm, row);
        },

        /* 关闭要点修改弹窗 */
        closeDialog() {
            this.$refs.editFormRef.resetFields();
            this.editForm = this.$options.data().editForm;
        },

        /* 修改弹窗保存 */
        handleEditForm() {
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) return this.$message.warning('请补充必填项');

                let params = {
                    code: this.editForm.Code,
                    value: this.editForm.Name,
                };
                const { data: res } = await updateYDContApi(params);
                console.log(res, 'res');
                if (res.code !== 1) return this.$message.warning(res.msg);
                this.$message.success(res.msg);
                this.dialogPoint = false;
                this.getTableData();
            });
        },
    },
};
