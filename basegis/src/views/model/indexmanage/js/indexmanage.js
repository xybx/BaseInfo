import { getList, saveList, delList, ImportZBExcel, ExportZBList } from '../api/indexmanage-api';
import { uploadFile } from '@/utils/common-api';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            tableloading: true,
            isAdmin: false,
            tableData: [],
            setForm: {
                NAME: '',
                PARENTID: null,
                STYLE: '',
                ORDERNUM: null,
                LEVEL: '',
            },
            setFormRules: {
                NAME: [
                    {
                        required: true,
                        message: '指标名称不能为空',
                        trigger: 'blur',
                    },
                ],
                PARENTID: [
                    {
                        required: true,
                        message: '层级不能为空',
                        trigger: 'change',
                    },
                ],
                STYLE: [
                    {
                        required: true,
                        message: '指标类型不能为空',
                        trigger: 'change',
                    },
                ],
                LEVEL: [
                    {
                        required: true,
                        message: '层级不能为空',
                        trigger: 'change',
                    },
                ],
                ORDERNUM: [
                    {
                        required: true,
                        message: '排序不能为空',
                        trigger: 'blur',
                    },
                ],
            },
            setTitle: '',
            setVisible: false,
            indexLevel: '',
        };
    },
    computed: {},
    watch: {
        'setForm.LEVEL': {
            handler(val) {
                if (val == 1 && this.setTitle == '新增') {
                    this.setForm.PARENTID = 0;
                } else if (val != 1 && this.setTitle == '新增') {
                    this.setForm.PARENTID = '';
                }
            },
        },
    },
    created() { },
    mounted() {
        this.getData();
    },
    methods: {
        // 新增
        addType() {
            this.setTitle = '新增';
            this.setVisible = true;
            Object.assign(this.setForm, { PID: 0 });
        },

        // 获取列表数据
        async getData() {
            const { data: res } = await getList();
            if (res.code === 1) {
                this.tableloading = false;
                this.tableData = res.data;
                console.log(this.tableData, 'tableData');
                console.log(this.tableData[0], '0');
            }
            else {
                this.tableloading = false;
            }
        },

        // 弹窗确认
        saveAdd() {
            this.$refs.setForm.validate(async (valid) => {
                if (!valid) return this.$message.error('请补充必填项');
                let { LEVEL, ...form } = this.setForm;

                const { data: res } = await saveList(form);
                if (res.code === 1) {
                    this.$message.success(`${this.setTitle}成功`);
                    this.setVisible = false;
                    this.getData();
                }
            });
        },

        // 弹窗关闭
        closedSetDialog() {
            this.$refs.setForm.resetFields();
            this.setForm = this.$options.data().setForm;
        },

        // 编辑
        handleEdit(row) {
            console.log(row);
            this.setTitle = '编辑';
            this.setVisible = true;
            Object.assign(this.setForm, row);
            if (this.setForm.PARENTID == 0) {
                Object.assign(this.setForm, { LEVEL: 1 });
            } else {
                Object.assign(this.setForm, { LEVEL: 2 });
            }
        },

        // 删除
        async handleDelete(row) {
            let params = {
                pid: row.PID,
            };
            const { data: res } = await delList(params);
            if (res.code === 1) {
                this.$message.success('删除成功');
                this.getData();
            }
        },

        // 编辑列表项
        handleList(row) {
            console.log(row);
            this.$router.push({
                path: '/assesslist',
                query: {
                    typeid: row.PID,
                },
            });
        },

        //导出指标
        async ExportExcel() {
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '正在导出指标......',
                duration: 0,
                customClass: 'prop-search',
            });
            const { data: res } = await ExportZBList();
            if (res.code === 1) {
                loading.close();
                let filepath = res.data.substring(res.data.indexOf("FileResources"));
                window.location.href =
                    apiURL_file +
                    '/' + filepath;
            }
            else {
                loading.close();
                this.$message.error(res.msg);
            }
        },

        //导入指标
        async tempUpload(params) {
            //this.uploading = true;
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '正在导入excel...',
                duration: 0,
                customClass: 'prop-search',
            });
            let namearr = params.file.name.split('.');
            let ext = namearr[namearr.length - 1];
            //console.log(params.file,"FILE");
            let form = new FormData();
            form.append('filepath', 'ZBTXExcel');
            form.append('file', params.file);
            const { data: res } = await uploadFile(form);
            if (res.code === 1) {
                const { data: resdata } = await ImportZBExcel({ filepath: res.data });
                if (resdata.code === 1) {
                    this.$message.success("导入成功");
                    loading.close();
                    this.getData();
                }
                else {
                    loading.close();
                    this.$message.error(resdata.msg);
                }
            } else {
                this.uploading = false;
                loading.close();
                this.$message.error(res.msg);
            }
        },
    },
};
