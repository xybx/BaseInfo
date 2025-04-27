/*
 * @Author: WCL
 * @Date: 2022-01-14 14:41:37
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 14:35:44
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\planindex\js\planindex.js
 * @Description: 请填写描述
 */
import {
    getYears,
    getPGZBType,
    getPGZBGHList,
    savePGZBGHData,
    ExportGHZBTemplate,
    ImportGHZBExcel,
} from '../api/planindex-api';
import { uploadFile } from '@/utils/common-api';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            PGRadio: '',
            PGRadioData: [],
            GHRadio: '',
            GHRadioData: [],
            userForm: {},
            userTopForm: [],
            evalBox: [],
            formLoading: false,
        };
    },
    computed: {},
    watch: {},
    created() { },
    async mounted() {
        //await this.getEvalYear();
        await this.getEvalType();
        await this.getEvalList(this.GHRadio.PID);
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

        // 年份-评估指标选择项
        changePGRadio() {
            this.getEvalList(this.GHRadio.PID);
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

        // 获取评估指标-数据类型
        async getEvalType() {
            let loading = this.$loading({
                text: '获取数据类型中...',
            });
            const { data: res } = await getPGZBType();
            if (res.code === 1) {
                this.GHRadioData = res.data;
                this.GHRadio = this.GHRadioData[0];
                loading.close();
            } else {
                loading.close();
                this.$message.error(res.msg);
            }
        },

        // 规划指标选择项
        changeGHRadio(val) {
            this.getEvalList(this.GHRadio.PID);
        },

        // 规划指标-指标列表
        async getEvalList(typeid, year) {
            this.formLoading = true;
            let params = {
                typeid,
            };
            const { data: res } = await getPGZBGHList(params);
            if (res.code === 1) {
                this.evalBox = res.data;
                this.formLoading = false;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 保存数据
        async saveData() {
            let arr = this.evalBox.map((item) => {
                return item.ZBITEMS;
            });
            let params = {
                YEAR: this.PGRadio,
                USERID: sessionStorage.getItem('userid'),
                VALUES: arr.flat(Infinity),

            };
            const { data: res } = await savePGZBGHData(params);
            if (res.code === 1) {
                this.$message.success('当前页数据已保存');
            } else {
                this.$message.error(res.msg);
            }
        },

        downTemplate() {
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
            const { data: res } = await ExportGHZBTemplate();
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
                const { data: resdata } = await ImportGHZBExcel({ filepath: res.data });
                if (resdata.code === 1) {
                    this.$message.success("导入成功");
                    loading.close();
                    this.getEvalType();
                    this.getEvalList(this.GHRadio.PID);
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
