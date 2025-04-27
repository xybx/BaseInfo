/*
 * @Author: WCL
 * @Date: 2022-01-14 14:42:09
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-09 13:28:04
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\evalindex\js\evalindex.js
 * @Description: 请填写描述
 */
import {
    getYears,
    addYears,
    getPGZBType,
    getPGZBList,
    getFileTree,
    savePGZBData,
    uploadDQPGFile,
    ExportZBTemplate,
    ImportZBExcel,
} from '../api/evalindex-api';
import { uploadFile } from '@/utils/common-api';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            PGRadio: '',
            GHRadio: '',
            PGRadioData: [],
            GHRadioData: [],
            evalBox: [],
            dateYear: '',
            treeLoading: false,
            treeList: [],
            userForm: {},
            defaultProps: {
                children: 'CHILDREN',
                label: 'LABEL',
            },
            formLoading: false,
            zbdatalist: [],
            evalLoading: null,
        };
    },
    computed: {},
    watch: {},
    created() {},
    async mounted() {
        await this.getEvalYear();
        await this.getEvalType();
        await this.getEvalList(this.GHRadio.PID, this.PGRadio);
        await this.getFileList();
    },
    methods: {
        // 获取评估指标-评估年份
        async getEvalYear() {
            this.evalLoading = this.$loading({
                text: '获取评估年份(体系)中...',
            });
            let params = {
                uid: sessionStorage.getItem('userid'),
            };

            const { data: res } = await getYears(params);
            if (res.code === 1) {
                this.PGRadioData = res.data;
                this.PGRadio = res.data[0];
                this.evalLoading.close();
            } else {
                this.evalLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 类型-评估指标选择项
        changePGRadio() {
            this.getEvalType();
           
            this.getFileList();
        },

        changeTYPERadio(obj)
        {
             this.getEvalList(obj.PID, this.PGRadio);
        },

        // 评估指标-选择添加年份
        async changeYear(year) {
            if (Boolean(year)) {
                let params = {
                    uid: sessionStorage.getItem('userid'),
                    year,
                };
                const { data: res } = await addYears(params);
                debugger;
                if (res.code === 1) {
                    this.$message.success('添加成功');
                    this.getEvalYear();
                    this.$refs.yearPopover.doClose();
                } else {
                    this.$message.error(res.msg);
                }
            }
        },

        // 获取评估指标-指标列表
        async getEvalList(typeid, year) {
            this.formLoading = true;
            let params = {
                typeid,
                year:!year?0:year,
            };
            const { data: res } = await getPGZBList(params);
            if (res.code === 1) {
                this.evalBox = res.data;
                this.formLoading = false;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 获取评估指标-数据类型
        async getEvalType() {
            this.evalLoading = this.$loading({
                text: '获取数据类型中...',
            });
            const { data: res } = await getPGZBType({year:this.PGRadio});
            if (res.code === 1) {
                this.GHRadioData = res.data;
                this.GHRadio = this.GHRadioData[0];
                this.evalLoading.close();

                this.getEvalList(this.GHRadio.PID, this.PGRadio);

            } else {
                this.evalLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 评估指标-获取文件列表
        async getFileList() {
            this.treeLoading = true;
            let params = {
                uid: sessionStorage.getItem('userid'),
                year: !this.PGRadio?0:this.PGRadio,
            };
            const { data: res } = await getFileTree(params);
            if (res.code === 1) {
                this.treeList = res.data;
                this.treeLoading = false;
            } else {
                //this.$message.error(res.msg);
                this.treeList = [];
                this.treeLoading = false;
            }
        },

        // 自定义上传
        async handleFileUpload(params) {
            debugger;
            this.treeLoading = true;
            let form = new FormData();
            if (!this.PGRadio) {
                this.treeLoading = false;
                this.$message.error("请选择年份");
                return;
            }
            console.log(sessionStorage.getItem('userid'), 'userid');
            form.append('userid', sessionStorage.getItem('userid'));
            form.append('year', this.PGRadio);
            form.append('file', params.file);

            const { data: res } = await uploadDQPGFile(form);
            if (res.code === 1) {
                this.$message.success('上传成功');
                this.treeLoading = false;
                this.getFileList();
            } else {
                this.treeLoading = false;
                this.$message.error(res.msg);
            }
        },

        // 列表项点击
        fileClick(obj) {
            let Base64 = require('js-base64').Base64;
            if (obj.FILETYPE === 0) {
                if (kkfileVersion === 1) {
                    // kkfileview 4.0版本
                    window.open(
                        previewURL +
                            encodeURIComponent(
                                Base64.encode(apiURL_file + obj.PRIVIEWPATH)
                            )
                    );
                } else {
                    // kkfileview 2.2.1 版本
                    window.open(
                        previewURL + encodeURIComponent(apiURL_file + data.PATH)
                    );
                }
            }
        },

        // 保存数据
        async saveData(year) {
            let arr = this.evalBox.map((item) => {
                return item.ZBITEMS;
            });
            let params = {
                YEAR: year,
                USERID: sessionStorage.getItem('userid'),
                VALUES: arr.flat(Infinity),
            };
            console.log(params);
            const { data: res } = await savePGZBData(params);
            if (res.code === 1) {
                this.$message.success('当前页数据已保存');
            } else {
                this.$message.error(res.msg);
            }
        },

        downTemplate(){
           this.ExportExcel();
        },

        //导出数据表
        async ExportExcel() {
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '正在生成导入模板......',
                duration: 0,
                customClass: 'prop-search',
            });
            const { data: res } = await ExportZBTemplate({year:this.PGRadio});
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

         //上传文件
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
                const { data: resdata } = await ImportZBExcel({ filepath: res.data,year:this.PGRadio });
                if (resdata.code === 1) {
                    this.$message.success("导入成功");
                    loading.close();
                    this.getEvalType();
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
