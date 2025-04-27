/*
 * @Author: WCL
 * @Date: 2022-01-13 09:37:26
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-13 10:09:33
 * @FilePath: \webgis\src\views\model\modelmanage\js\modelmanage.js
 * @Description: 模型管理JS
 */
import MetaData from '@/components/model/metadata/vue/MetaData.vue';
import BasicModel from '@/components/model/basicmodel/vue/BasicModel.vue';
import CustModel from '@/components/model/custmodel/vue/CustModel.vue';
import AlgRegister from '@/components/model/algregister/vue/AlgRegister.vue';
import SpaceModel from '@/components/model/spacemodel/vue/SapceModel.vue';
export default {
    name: '',
    props: {},
    components: { BasicModel, CustModel, AlgRegister,MetaData,SpaceModel},
    data() {
        return {
            activeIndex: '1',
            // modelRadio:'1',
            modelRadioData: [
                { label: '数据源', id: "1", icon: 'el-icon-coin' },
                { label: '元数据管理', id: "2", icon: 'el-icon-box' },
                { label: '模型算法', id: "4", icon: 'el-icon-cpu' },
                { label: '指标模型', id: "3", icon: 'el-icon-cpu' },
                { label: '空间模型', id: "5", icon: 'el-icon-cpu' },
            ],
        };
    },
    computed: {},
    watch: {},
    created() { },
    mounted() {
        this.activeIndex = this.modelRadioData[0].id;
    },
    methods: {
        handleSelect(key, keyPath) {
            this.activeIndex = key;
            // console.log(key, keyPath);
        }
    },
};
