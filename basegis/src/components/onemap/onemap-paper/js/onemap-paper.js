/*
 * @Author: WCL
 * @Date: 2021-11-30 16:48:18
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-22 09:57:25
 * @FilePath: \webgis\src\components\onemap\onemap-paper\js\onemap-paper.js
 * @Description: 叠加图纸JS
 */
import {
    uploadDwg,
    readDWGApi,
    readTXTApi,
    readSHPApi,
    createGraphic,
} from '@/utils/topic-map';
import {
    getAreaAndLength,
    clearMapGraphics,
    exportPointTxt,
} from '@/utils/common-map-method';
import { mapMutations, mapState } from 'vuex';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            dialogVisible: false,
            comTitle: '',
            tableData: [],
            radioID: '',
            upLoading: null, // 上传,
            overGraphicLayer: null,
            sketch: null,
        };
    },
    computed: {
        ...mapState('map2d-store', ['mapview', 'symbol']),
    },
    watch: {},
    created() { },
    mounted() { },
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
        ]),

        // 初始化画图图层
        initSketchLayer() {
            this.overGraphicLayer = new GraphicsLayer({
                id: 'overLayer',
            });
            this.mapview.map.layers.add(this.overGraphicLayer);
            this.sketch = new Sketch({
                layer: this.overGraphicLayer,
                view: this.mapview,
            });
        },

        // 打开弹窗
        showDialog(obj) {
            this.comTitle = obj.title;
            this.dialogVisible = true;
            this.handleToggleIndex(false);
            this.initSketchLayer();
        },

        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: 'init' });
            this.handleToggleIndex(true);
            this.dialogVisible = false;
            clearMapGraphics(null);
        },

        // 自定义上传事件
        async handleUpload(params) {
            console.log(params);
            this.upLoading = this.$message({
                iconClass: 'el-icon-loading',
                message: '上传中...',
                duration: 0,
                customClass: 'prop-search',
            });
            //文件扩展名
            var file_ext = params.file.name
                .split('.')
            [params.file.name.split('.').length - 1].toLowerCase();
            var savefilepath = 'OTHER';
            if (file_ext == 'dwg') {
                savefilepath = 'DWG';
            }
            if (file_ext == 'txt') {
                savefilepath = 'TXT';
            }
            if (file_ext == 'zip' || file_ext == 'rar') {
                savefilepath = 'SHP';
            }
            debugger;
            let form = new FormData();
            form.append('file', params.file);
            form.append('filepath', savefilepath);
            const { data: res } = await uploadDwg(form);
            if (res.code === 1) {
                let readParams = {
                    filename: params.file.name,
                    filepath: res.data,
                };
                if (file_ext == 'dwg') {
                    this.readDWG(readParams);
                }
                if (file_ext == 'txt') {
                    this.readTXT(readParams);
                }
                if (file_ext == 'zip' || file_ext == 'rar') {
                    this.readSHP(readParams);
                }
            } else {
                this.$message.error(res.msg);
            }
        },

        // 读取DWG
        async readDWG(params) {
            const { data: res } = await readDWGApi(params);
            if (res.code === 1) {
                this.overLayer(res.data, params.filename);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        //读取TXT
        async readTXT(params, filename) {
            const { data: res } = await readTXTApi(params);
            if (res.code === 1) {
                this.overLayer(res.data, params.filename);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        //读取shp
        async readSHP(params, filename) {
            const { data: res } = await readSHPApi(params);
            if (res.code === 1) {
                this.overLayer(res.data, params.filename);
            } else {
                this.upLoading.close();
                this.$message.error(res.msg);
            }
        },

        // 叠加图形到地图
        async overLayer(pointData, filename) {
            this.mapview.graphics.removeAll();
            console.log(pointData, "pointData");
            const graphic = createGraphic(pointData, this.mapview);
            if (graphic) {
                debugger;
                //添加表格数据
                let result = await getAreaAndLength(graphic.geometry);
                let obj = {
                    name: filename,
                    area: result.area,
                    graphic: graphic,
                };
                this.tableData.push(obj);

                this.upLoading.close();
                this.mapview.graphics.add(graphic);
                this.mapview.extent = graphic.geometry.extent;
                this.mapview.zoom -= 2;
            }
        },

        // 定位
        handleLocate(row) {
            console.log(row, 'row');
            row.graphic.symbol = this.symbol;
            this.mapview.graphics.removeAll();
            this.overGraphicLayer.graphics.removeAll();
            this.mapview.graphics.add(row.graphic);
            this.mapview.extent = row.graphic.geometry.extent;
            this.mapview.zoom -= 2;
        },

        // 模板下载
        downTemplate() {
            window.open(
                `${apiURL_file}/FileResources/Template/导入图形的坐标txt模板.txt`
            );
        },

        // 绘制范围
        renderRange() {
            if (this.sketch == null) {
                this.sketch = new Sketch({
                    layer: this.overGraphicLayer,
                    view: this.mapview,
                });
            }
            this.mapview.graphics.removeAll();
            this.overGraphicLayer.graphics.removeAll();
            this.sketch.when(() => {
                this.sketch.create('polygon');
                this.sketch.on('create', async (evt) => {
                    if (evt.state == 'complete') {
                        let result = await getAreaAndLength(
                            evt.graphic.geometry
                        );
                        let obj = {
                            name:
                                '图形_' +
                                new Date()
                                    .toLocaleString('chinese', {
                                        hour12: false,
                                    })
                                    .replaceAll('/', '_')
                                    .replaceAll(':', '_'),
                            area: result.area,
                            graphic: evt.graphic,
                        };
                        this.tableData.push(obj);
                        this.sketch.destroy();
                        this.sketch = null;
                    }
                });
            });
        },

        // 编辑列表图形
        handleEdit(row) {
            // this.sketch.when(() => {
            this.mapview.graphics.removeAll();
            this.overGraphicLayer.graphics.removeAll();
            this.overGraphicLayer.graphics.add(row.graphic);
            console.log(this.sketch);
            if (this.sketch == null) {
                this.sketch = new Sketch({
                    layer: this.overGraphicLayer,
                    view: this.mapview,
                });
            }
            this.sketch.when(() => {
                this.sketch.update([row.graphic]);
            });
            // this.sketch.on('update', async (evt) => {
            //     console.log(evt, 'evt++');
            //     if (evt.status == 'complete') {
            //         let result = await getAreaAndLength(
            //             evt.graphic.geometry
            //         );
            //         let obj = {
            //             name: filename,
            //             area: result.area,
            //             graphic: graphic,
            //         };
            //         this.tableData.push(obj);
            //     }
            // });
            // });
        },

        // 导出图形
        async handleExport(row) {
            await exportPointTxt(row.graphic.geometry, row.name);
        },
        //删除图形
        async handleDelete(row) {
            const _index =this.tableData.findIndex(function (val) {
                return val.name === row.name
            })
            this.tableData.splice(_index,1);
            this.overGraphicLayer.graphics.remove(row.graphic);
        },

    },
};
