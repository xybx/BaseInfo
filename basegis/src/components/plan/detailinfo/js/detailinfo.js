/*
 * @Author: WCL
 * @Date: 2022-01-04 13:47:39
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-04 16:54:27
 * @FilePath: \webgis\src\components\plan\detailinfo\js\detailinfo.js
 * @Description: 详细信息JS
 */
import {
    getBottomInfo,
    getFileTree,
    uploadExcel,
    addFile,
    delFile,
    saveInfo,
} from '../api/detailinfo-api';

import {
    uploadPackage,
    
} from '../../../../views/plan/planlist/components/plandetail/api/plandetail-api';
export default {
    name: '',
    props: {
        dialogInfo: Boolean,
        pid: Number,
        showBtn: Boolean,
    },
    components: {},
    data() {
        return {
            userForm: {
                user: '',
                region: '',
            },
            userTopList: [
                { id: 3, name: '组织单位', prop: 'BZUNIT' },
                { id: 4, name: '委托单位', prop: 'WTUNIT' },
                { id: 5, name: '委托部门', prop: 'WTDEPT' },
                { id: 2, name: '规划面积', prop: 'GHAREA' },
                { id: 6, name: '规划范围', prop: 'GHFW' },
                { id: 1, name: '项目简介', prop: 'PROJECTINTRO' },
            ],
            userBottomList: [],
            treeList: [],
            fileTreeLoading: true,
            showTree: false,
            fileList: [],
            addUploadPath: '',
            ghbzTop: {
                PROJECTINTRO: '',
                GHAREA: '',
                BZUNIT: '',
                WTUNIT: '',
                WTDEPT: '',
                GHFW: '',
                SC_NUMDESC:'',
            },
            zbLoading: true,
            // 当前阶段信息
            baseInfo: {
                project: {
                    PRJNAME: '',
                    TYPEID: null,
                },
                jd: {
                    JDNAME: '',
                },
            },
            // 文件数结构
            defaultProps: {
                children: 'CHILDREN',
                label: 'LABEL',
            },
            // 文件数添加按钮点击时路径
            addUploadPath: '',
        };
    },
    computed: {},
    watch: {},
    created() { },
    mounted() {
        this.getDetailInfo();
        this.getPlanProjectFolder();
    },
    methods: {
        // 获取规划管理项目文件夹
        async getPlanProjectFolder() {
            let params = {
                pid: this.pid,
            };
            const { data: res } = await getFileTree(params);
            console.log(res, 'treeres');
            if (res.code === 1) {
                this.treeList = res.data;
                this.showTree = false;
            } else {
                //this.$message.error(res.msg);
                this.showTree = true;
            }
            this.fileTreeLoading = false;
        },

        // 获取规划管理项目指标项
        async getPlanProjectTemplete() { },

        // 保存信息
        async updateInfo() {
            console.log(this.ghbzTop);
            console.log(this.userBottomList);
            console.log(this.baseInfo);
            let topForm = Object.assign(
                {
                    PID: this.baseInfo.jd.PID,
                    PROJECTID: this.baseInfo.jd.PROJECTID,
                    USERID: sessionStorage.getItem('userid'),
                },
                this.ghbzTop
            );

            let addForm = {
                jdinfo: topForm,
                zblist: this.userBottomList,
            };
            const { data: res } = await saveInfo(addForm);
            if (res.code === 1) {
                this.$message.success('更新成功');
                this.$emit('closePlanUser');
            } else {
                this.$message.error(res.msg);
            }
        },

        // 关闭窗口
        closePlanUser() {
            this.$emit('closePlanUser');
        },

        // 文件列表添加
        handleAdd(scope) {
            console.log(scope);
            this.addUploadPath = scope.data.FILEPATH;
        },

        // 文件列表删除
        async remove(scope) {
            console.log(scope);
            let params = {
                path: scope.data.FILEPATH,
            };
            const { data: res } = await delFile(params);
            if (res.code === 1) {
                this.$message.success('删除成功');
                this.getPlanProjectFolder();
            } else {
                this.$message.error(res.msg);
            }
        },

        // 文件树-自定义添加上传事件
        async handleUpload(params) {
            console.log(params);
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '上传中...',
                duration: 0,
                customClass: 'prop-search',
            });

            let form = new FormData();
            form.append('path', this.addUploadPath);
            form.append('file', params.file);
            const { data: res } = await addFile(form);
            console.log(res);
            if (res.code === 1) {
                loading.close();
                this.$message.success('添加成功');
                this.getPlanProjectFolder();
            } else {
                loading.close();
                this.$message.error(res.msg);
            }
        },

        // 模板下载
        downTemplate() {
            window.location.href =
                apiURL_file +
                '/FileResources/GHSCTemplate/规划编制项目信息和项目指标导入模板.xlsx';
        },

        // 模板导入
        async temUpload(params) {
            console.log(params);
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '正在导入数据...',
                duration: 0,
                customClass: 'prop-search',
            });

            let form = new FormData();
            form.append('pid', this.baseInfo.jd.PID);
            form.append('projectname', this.baseInfo.project.PRJNAME);
            form.append('file', params.file);
            const { data: res } = await uploadExcel(form);
            console.log(res, 'excelres');
            if (res.code === 1) {
                loading.close();
                this.$message.success('导入成功');
                this.getDetailInfo();
            } else {
                loading.close();
                this.$message.error(res.msg);
            }
        },

        // 获取详细信息
        async getDetailInfo() {
            let params = {
                pid: this.pid,
            };
            const { data: res } = await getBottomInfo(params);
            if (res.code === 1) {
                this.zbLoading = false;
                this.baseInfo = res.data;
                console.log(this.baseInfo, 'baseInfo');
                Object.assign(this.ghbzTop, {
                    PROJECTINTRO: res.data.project.PROJECTINTRO,
                    GHAREA: res.data.jd.GHAREA,
                    BZUNIT: res.data.jd.BZUNIT,
                    WTUNIT: res.data.jd.WTUNIT,
                    WTDEPT: res.data.jd.WTDEPT,
                    GHFW: res.data.jd.GHFW,
                    SC_NUMDESC:res.data.jd.SC_NUMDESC
                });
                this.userBottomList = res.data.zblist;
            } else {
                this.$message.error(res.msg);
            }
        },

        // 文件列表点击
        fileClick(obj) {
            // let filepath = obj.FILEPATH.substring(obj.FILEPATH.indexOf("FileResources"));
            // //    console.log(filepath,"treenode");
            // //    window.open(apiURL_file+"/"+filepath);
            // let Base64 = require('js-base64').Base64;
            // console.log(kkfileVersion, 'kkfileVersion');
            // if (kkfileVersion === 1) {
            //     // kkfileview 4.0版本
            //     window.open(
            //         previewURL +
            //         encodeURIComponent(
            //             Base64.encode(apiURL_file + '/' + filepath)
            //         )
            //     );
            // } else {
            //     console.log(apiURL_file + '/' + filepath);
            //     // kkfileview 2.2.1 版本
            //     window.open(
            //         previewURL +
            //         encodeURIComponent(
            //             apiURL_file + '/' + filepath
            //         )
            //     );

            // }


        },
        // 自定义上传事件，上传材料
        async handleZIPUpload(params) {
            debugger;
            let loading = this.$message({
                iconClass: 'el-icon-loading',
                message: '上传中...',
                duration: 0,
                customClass: 'prop-search',
            });

            let form = new FormData();
            form.append('pid', this.baseInfo.jd.PID);
            form.append('projectname', this.baseInfo.project.PRJNAME);
            form.append('file', params.file);
            const { data: res } = await uploadPackage(form);
            console.log(res, 'upres');
            if (res.code === 1) {
                loading.close();
                this.$message.success('上传成功');
                this.getPlanProjectFolder();
                
            } else {
                loading.close();
                this.$message.error(res.msg);
            }
        },

        test() {

        }
    },
};
