/*
 * @Author: WCL
 * @Date: 2022-02-16 17:05:53
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-24 17:42:25
 * @FilePath: \webgis\src\components\onemap\onemap-wiki\js\onemap-wiki.js
 * @Description: 知识库JS
 */
import { mapMutations, mapState } from 'vuex';
import { getKnowledgeList } from '../api/onemap-wiki-api';

export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            dialogVisible: false,
            comTitle: '',
            treeData: [],
            defaultProps: {
                children: 'CHILDREN',
                label: 'LABEL',
            },
        };
    },
    computed: {},
    watch: {
        dialogVisible(boo) {
            if (boo) {
                this.getTreeData();
            }
        },
    },
    created() {},
    mounted() {},
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
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
            this.dialogVisible = false;
        },

        // 树点击
        handleNodeClick(data) {
            let Base64 = require('js-base64').Base64;
            if (!!data.PATH) {
                console.log(kkfileVersion, 'kkfileVersion');
                if (kkfileVersion === 1) {
                    // kkfileview 4.0版本
                    window.open(
                        previewURL +
                            encodeURIComponent(
                                Base64.encode(apiURL_sys_file + '/' + data.PATH)
                            )
                    );
                } else {
                    console.log(apiURL_sys_file + '/' + data.PATH);
                    // kkfileview 2.2.1 版本
                    window.open(
                        previewURL +
                            encodeURIComponent(
                                apiURL_sys_file + '/' + data.PATH
                            )
                    );
                    
                }
            }
        },

        // 获取树列表
        async getTreeData() {
            var mtype = 1;
            if (this.$route.path == '/szxcmapindex') {
                mtype = 2;
            }
            const { data: res } = await getKnowledgeList({ moduletype: mtype });
            if (res.code === 1) {
                this.treeData = res.data;
            } else {
                this.$message.error(res.msg);
            }
        },
    },
};
