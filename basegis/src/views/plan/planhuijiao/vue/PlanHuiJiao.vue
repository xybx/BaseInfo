<!--
 * @Author: WCL
 * @Date: 2021-12-22 11:02:29
 * @LastEditors: WCL
 * @LastEditTime: 2023-01-04 14:37:44
 * @FilePath: \webgis\src\views\plan\planhuijiao\vue\PlanHuiJiao.vue
 * @Description: 规划审查-数据汇交（张家口与河北省厅的汇交对接）
-->
<template>
    <div class="modelmanage-container">
        <div class="table-contain animate__animated">
            <div class="left-menu" v-if="showLeft">
                <el-menu :default-active="activeIndex" v-if="xzqLevel == 1" class="el-menu-vertical-demo menubox" mode="vertical" @select="handleSelect">
                    <el-menu-item :index="item.id" v-for="(item, index) in modelRadioData" :key="index" :label="item.label">
                        <i :class="item.icon"></i>
                        {{ item.label }}
                    </el-menu-item>
                </el-menu>
                <el-menu :default-active="activeIndex" v-if="xzqLevel == 2" class="el-menu-vertical-demo menubox" mode="vertical" @select="handleSelect">
                    <template v-if="areaVersion != 'qx'">
                      <el-menu-item :index="item.id" v-for="(item, index) in modelXQData" :key="index" :label="item.label" v-if="item.show">
                          <i :class="item.icon"></i>
                          {{ item.label }}
                      </el-menu-item>
                    </template>
                    <template v-else>
                      <el-menu-item :index="item.id" class="menunav" v-for="(item, index) in modelQXData" :key="index" :label="item.label">
                        <i :class="item.icon"></i>
                        {{ item.label }}
                      </el-menu-item>
                    </template>
                </el-menu>
                <div class="left-footer" v-if="xzqLevel == 2 && areaVersion== 'qx'">
                    <el-button type="primary" icon="" plain @click="userChange">切换用户</el-button>
                </div>
            </div>
            <div class="right-table">
                <div class="manage-inbox">
                    <div class="content">
                        <div v-if="activeIndex == 1 && areaVersion == 'st'">
                            <planhuijiao_-s-t></planhuijiao_-s-t>
                        </div>
                        <div v-if="activeIndex == 1 && areaVersion == 'hb'">
                            <plan-hui-jiao_-h-b></plan-hui-jiao_-h-b>
                        </div>
                        <div v-if="activeIndex == 1 && areaVersion == 'ny'">
                            <plan-hui-jiao_-n-y></plan-hui-jiao_-n-y>
                        </div>
                        <div v-else-if="activeIndex == 2 && xzqLevel == 1">
                            <plan-hui-jiao-x-q></plan-hui-jiao-x-q>
                        </div>
                        <div v-else-if="activeIndex == 2 &&xzqLevel == 2 &&areaVersion == 'ny'">
                            <PlanHuiJiaoTJPG_NY></PlanHuiJiaoTJPG_NY>
                        </div>
                      <div v-else-if="areaVersion == 'qx'">
                        <PlanDialogQX ref="logqx" :dialogVisible="dialogVisible" @showPage="showPage"  />
                        <PlanHuiJiao_QX v-if="showPlan" ref="planqx" :activeIndex="activeIndex" @showLog="showLog" @putLeft="putLeft" />
                      </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    getType,
    saveProject,
    getList,
    delProject,
    getDownFile,
    uploadLocalhost,
    updateProjectStatus,
    uploadData,
    ZipDirecortyFiles,
    SpliteFiles,
    UploadSplite,
    UnionFiles,
    SaveResult,
    SaveZip,
    BreakPointResume,
} from "../api/planhuijiao-api";

import { getJDType } from "../../planlist/components/plandetail/api/plandetail-api";
import ResultManger from "@/components/plan/detailinfo/vue/ResultManger.vue";
import PlanHuiJiaoXQ from "./PlanHuiJiaoXQ.vue";
import Planhuijiao_ST from "./Planhuijiao_ST.vue";
import PlanHuiJiao_HB from "./PlanHuiJiao_HB.vue";
import PlanHuiJiao_NY from "./PlanHuiJiao_NY.vue";
import PlanHuiJiaoTJPG_NY from "./PlanHuiJiaoTJPG_NY.vue";
import PlanHuiJiao_QX from "./PlanHuiJiao_QX.vue";
import PlanDialogQX from "../components/planqx/PlanDialogQX.vue";
import cookie from "@/utils/cooike";
export default {
    name: "",
    props: {},
    components: {
        ResultManger,
        PlanHuiJiaoXQ,
        Planhuijiao_ST,
        PlanHuiJiao_HB,
        PlanHuiJiao_NY,
        PlanHuiJiaoTJPG_NY,
        PlanHuiJiao_QX,
        PlanDialogQX
    },
    data() {
        return {
            showLeft:true,
            xzqLevel: xzqLevel,
            activeIndex: '1',
            areaVersion: areaVersion,
            // modelRadio:'1',
            showPlan:true,
            dialogVisible:false,
            modelRadioData: [
                {
                    label: "总规上报",
                    id: '1',
                    icon: "el-icon-upload2",
                    xzqLevel: 1,
                },
                {
                    label: "县区汇交记录",
                    id: '2',
                    icon: "el-icon-box",
                    xzqLevel: 2,
                },
            ],
            modelXQData: [
                {
                    label: "总规上报",
                    id: '1',
                    icon: "el-icon-upload2",
                    xzqLevel: 1,
                    show: true,
                },
                {
                    label: "体检评估上报",
                    id: '2',
                    icon: "el-icon-upload2",
                    xzqLevel: 2,
                    show: areaVersion == "ny",
                },
            ],
          modelQXData:[
            {
              label: "待办箱",
              id: '1',
              icon: "el-icon-s-order",
            },
            {
              label: "已办箱",
              id: '2',
              icon: "el-icon-s-claim",
            },
            {
              label: "办结箱",
              id: '3',
              icon: "el-icon-s-cooperation",
            },
          ]
        };
    },
    computed: {
    
    },
    watch: {},
    created() {},
    mounted() {
      this.getShow()
    },
    methods: {
        getShow(){
          let ptoken = cookie.get('ptoken');
          this.dialogVisible = ptoken ? false : true
          this.showPlan = ptoken ? true : false
        },
        handleSelect(key, keyPath) {
            this.activeIndex = key;
            if(this.xzqLevel == 2 && this.areaVersion == 'qx'){
              setTimeout(()=>{
                this.$refs.planqx.getDealtList()
              },360)
            }
        },
        showPage(boolean){
          this.dialogVisible = boolean
          this.showPlan = !boolean 
        },
        showLog(boolean){
          this.dialogVisible = boolean
          this.showPlan = !boolean
        },
        userChange(){
          this.dialogVisible = true
          this.showPlan = false
          this.activeIndex = '1'
        },
        putLeft(boolean){
          this.showLeft = boolean
        },
    },
};
</script>

<style scoped lang="scss">
@import "../style/planhuijiao.scss";
</style>
<style scoped lang="scss">
div {
    box-sizing: border-box;
}
.modelmanage-container {
    height: 100%;
    background-color: #f2f5fa;
    padding: 10px;
    box-sizing: border-box;
}

.table-contain {
    flex: 1;
    display: flex;

    .left-menu {
        width:130px;
        height:calc(100vh - 20px - 107px);
        margin-right:10px;
        display: flex;
        flex-direction: column;
        justify-content:space-between;
        .el-menu {
            width: 100%;
            .el-menu-item {
              &.menubox{
                padding: 0 !important;
              }
              &.menunav{
                display: flex;
                flex-direction: row;
                align-items: center;
                i{
                  font-size:22px;
                }
              }
            }
        }
      .left-footer{
         width: 100%;
        .el-button{
          width: 100%;
          height:40px;
          font-size:16px;
          margin-bottom:5px;
        }
      }
    }

    .right-table {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    :deep(.el-table) {
        .cell {
            font-size: 15px;
        }

        .el-button {
            font-size: 15px;
        }
    }

    .manage-inbox {
        height: 100%;
        background-color: #fff;
        padding: 10px;
        display: flex;
        flex-direction: column;

        .el-radio-group {
            margin-bottom: 10px;
        }

        .content {
            height:81.796vh;
            overflow-y:auto;
            &::-webkit-scrollbar{
              display: none;
            }
        }
    }
}
</style>
