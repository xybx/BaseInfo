/*
 * @Author: WCL
 * @Date: 2021-12-12 17:01:18
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:19:03
 * @FilePath: \webgis\src\components\onemap\onemap-topic-current\js\onemap-topic-current.js
 * @Description: 现状制作JS
 */
import { mapMutations, mapState } from 'vuex';
import {
    initZttMap,
    printMap,
    uploadDwg,
    readDWGApi,
    zttView,
    createGraphic,
    createFile,
    mapScreenhot,
} from '@/utils/topic-map';
import { createXZZZFile } from '../api/onemap-topic-current-api';
import { saveMapPrintImage } from '@/utils/common-map-method';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            MapPrintMode: "screenshot",
            currentGraphic: null,
            dialogVisible: false,
            comTitle: '',
            currentForm: {
                title: '',
                scale1: '1',
                scale2: '',
                paperType: 'A4横版',
                date: '',
                unit: '',
                seal: '否',
                zttype: 3,
                dpi: 96,
            },
            verticalClass: '',
            rules: {
                title: [
                    {
                        required: true,
                        message: '标题不能为空',
                        trigger: 'blur',
                    },
                ],
                scale2: [
                    {
                        required: true,
                        message: '比例尺不能为空',
                        trigger: 'blur',
                    },
                ],
                paperType: [
                    {
                        required: true,
                        message: '纸张类型不能为空',
                        trigger: 'change',
                    },
                ],
                date: [
                    {
                        required: true,
                        message: '日期不能为空',
                        trigger: 'blur',
                    },
                ],
                unit: [
                    {
                        required: true,
                        message: '单位不能为空',
                        trigger: 'blur',
                    },
                ],
                seal: [
                    {
                        required: true,
                        message: '请选择是否需要印章',
                        trigger: 'change',
                    },
                ],
            },
        };
    },
    computed: {
        ...mapState('onemap-store', ['zttScale']),
    },
    watch: {
        dialogVisible: {
            handler(boo) {
                if (boo) {
                    this.$nextTick(() => {
                        initZttMap('zttmap_xz', this.currentForm.zttype);
                    });
                }
            },
        },

        // 监听地图范围变化的scale值
        zttScale: {
            handler(val) {
                this.currentForm.scale2 = val;
                console.log('监听被改变的');
            },
            deep: true,
        },
    },
    created() {},
    mounted() {
        this.MapPrintMode = MapPrintMode;
    },
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
            'handleShowZttScale',
            'handleZttScale',
        ]),

        // 打开弹窗
        showDialog(obj) {
            this.comTitle = obj.title;
            this.dialogVisible = true;
            this.handleToggleIndex(false);
        },

        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: 'init' });
            this.handleToggleIndex(true);
            this.handleShowZttScale(true);
            this.dialogVisible = false;
            // 数据恢复初始
            Object.assign(this.$data, this.$options.data());
            this.handleZttScale('');
        },

        // 选择纸张类型
        choosePaperType(str) {
            if (str === 'A4横版' || str === 'A3横版') {
                this.verticalClass = '';
            } else {
                this.verticalClass = 'verticalClass';
            }
        },

        // 比例尺输入
        changeScale2(val) {
            this.handleShowZttScale(true);
            zttView.scale = val;
        },

        // 生成现状
        onSubmit() {
            this.$refs.form.validate(async (valid) => {
                if (!valid) return this.$message.error('请补充必填项');
                if (this.currentGraphic == null) {
                    this.$message.error('请上传红线地块');
                    return;
                }
                this.zttLoading = this.$message({
                    iconClass: 'el-icon-loading',
                    message: '正在生成地块规划图报告...',
                    duration: 0,
                    customClass: 'prop-search',
                });

                let imagedata = null;
                let imageDataType = 0;
                let layout = "map-only";
                // if (this.guihuaForm.paperType == "A3") {
                //     layout = "a3-landscape";
                // } else {
                //     layout = "a4-landscape";
                // }
                if (this.MapPrintMode == "print") {
                    const resPrint = await printMap(
                        this.currentForm.dpi,
                        this.currentForm.scale2,
                        zttView,
                        layout
                    )
                        .then((res) => {
                            return { status: true, data: res };
                        })
                        .catch((err) => {
                            return { status: false, data: err };
                        });
                    console.log(resPrint, "resPrint");
                    imagedata = resPrint.data.url;
                    imageDataType = 1;
                } else {
                    imagedata = await mapScreenhot(zttView);
                }
                let res = await saveMapPrintImage(
                    this.currentForm.title,
                    "ZTT",
                    imagedata,
                    1,
                    imageDataType
                );
                if (imagedata && res.code==1) {
                    // 传参
                    // type:3 现状制图
                    let params = {
                        type: this.currentForm.zttype,
                        title: this.currentForm.title,
                        scale: this.currentForm.scale2,
                        time: this.currentForm.date,
                        imagepath: res.data,
                        ztdw: this.currentForm.unit,
                        yz: this.currentForm.seal,
                        size: this.currentForm.paperType,
                    };
                    this.exportPDF(params);
                } else {
                    this.zttLoading.close();
                    this.$message.error(res.data.message);
                }
            });
        },

        // 导出现状制作PDF
        async exportPDF(params) {
            const { data: res } = await createFile(params);
            if (res.code === 1) {
                this.zttLoading.close();
                window.open(apiURL_file + res.data);
            } else {
                this.zttLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 上传成功
        handleSuccess(response, file, fileList) {
            if (fileList.length > 1) {
                fileList.splice(0, 1);
            }
        },

        // 上传事件
        async handleUpload(params) {
            this.upLoading = this.$message({
                iconClass: 'el-icon-loading',
                message: '上传中...',
                duration: 0,
                customClass: 'prop-search',
            });

            let form = new FormData();
            form.append('filepath', 'ZTT');
            form.append('file', params.file);
            const { data: res } = await uploadDwg(form);
            if (res.code === 1) {
                let readParams = {
                    filename: params.file.name,
                    filepath: res.data,
                };
                this.readDWG(readParams);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 读取DWG
        async readDWG(params) {
            const { data: res } = await readDWGApi(params);
            if (res.code === 1) {
                this.overLayer(res.data);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 叠加图形到地图
        overLayer(pointData) {
            zttView.graphics.removeAll();
            const graphic = createGraphic(pointData, zttView);
            if (graphic) {
                this.currentGraphic = graphic;
                this.upLoading.close();
                zttView.graphics.add(graphic);
                zttView.extent = graphic.geometry.extent;
                zttView.zoom -= 2;
            }
        },
    },
};
