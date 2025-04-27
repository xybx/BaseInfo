<!--
 * @Author: LJX
 * @Date: 2021-12-22 11:02:29
 * @LastEditors: LJX
 * @LastEditTime: 2023-01-04 14:37:44
 * @FilePath: \webgis\src\views\plan\planhuijiao\vue\PlanHuiJiaoTJPG_NY.vue
 * @Description: 规划审查-数据汇交（宁远体检评估上报）
-->
<template>
  <div>
    <div class="content">
      <!-- <el-form
        ref="searchform"
        :model="searchform"
        :inline="true"
        style="float: left"
      >
        <el-form-item label="任务类型">
          <el-select
            v-model="searchform.ghtype"
            placeholder="请选择任务类型"
            size="small"
            value-key="id"
            clearable
          >
            <el-option
              v-for="item in regionData"
              :label="item.TYPENAME"
              :value="item.ID"
              :key="item.ID"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审批方式">
          <el-select
            v-model="searchform.ghtype"
            placeholder="请选择审批方式"
            size="small"
            value-key="id"
            clearable
          >
            <el-option
              v-for="item in regionData"
              :label="item.TYPENAME"
              :value="item.ID"
              :key="item.ID"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-select
            v-model="searchform.ghtype"
            placeholder="请选择状态"
            size="small"
            value-key="id"
            clearable
          >
            <el-option
              v-for="item in regionData"
              :label="item.TYPENAME"
              :value="item.ID"
              :key="item.ID"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input
            v-model="searchform.keywords"
            size="small"
            placeholder="请输入任务号或业务号"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small"
            >开始搜索</el-button
          >
        </el-form-item>
      </el-form> -->
      <el-button
        type="primary"
        style="float: right"
        size="small"
        @click="getUAuth"
        >同步省厅下发的体检评估任务</el-button
      >
      <el-table
        :data="tableData"
        border
        stripe
        :default-sort="{ prop: 'PID', order: 'descending' }"
        v-loading="loading"
        size="small"
      >
        <el-table-column
          prop="PID"
          label="序号"
          min-width="80"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="AREACODE"
          label="行政区"
          min-width="80"
          width="180"
          align="center"
        >
        </el-table-column>
        <el-table-column prop="TASKID" label="任务号" align="center">
        </el-table-column>
        <el-table-column
          prop="REPORTYEAR"
          label="报表年份"
          align="center"
          min-width="100"
        >
        </el-table-column>
        <el-table-column
          prop="APPROVALTYPE"
          label="审批方式"
          min-width="100"
          align="center"
        >
          <template v-slot="scope">
            <div v-if="scope.row.APPROVALTYPE == '1'">逐层审批</div>
            <div v-else-if="scope.row.APPROVALTYPE == '2'">直报省厅</div>
            <div v-else>{{ scope.row.APPROVALTYPE }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="TASKTYPE"
          label="任务类型"
          width="180"
          align="center"
        >
          <template v-slot="scope">
            <div v-if="scope.row.TASKTYPE == '1'">省级任务，需上报国家</div>
            <div v-else-if="scope.row.TASKTYPE == '2'">
              省级任务，无需上报国家
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="YWH"
          label="对应业务号"
          width="180"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="STATUSNAME"
          label="当前状态"
          width="180"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="200"
          align="left"
          class-name="handle-col"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="success"
              @click="openTaskReporting(scope.row)"
              >数据填报</el-button
            >
            <!-- v-if="scope.row.STATUS >= 2" -->
            <el-button
              size="mini"
              type="success"
              @click="openProcessList(scope.row)"
              title="获取最新审批状态"
              >获取审批流程</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--用户授权同步任务-->
    <!-- <UserAuth ref="userAuthDialog" @refresh="getTableData"></UserAuth> -->

    <!--指标数据填报-->
    <TaskReporting ref="TaskReporting"></TaskReporting>

    <!--获取审批流程-->
    <ProcessList ref="ProcessList"></ProcessList>
  </div>
</template>

<script>
import { getTaskList } from "../api/planhuijiao-api";
import { getTask } from "../components/plandetail/api/plandetail-api.js";

import { getJDType } from "../../planlist/components/plandetail/api/plandetail-api";
// import UserAuth from "../components/plandetail/vue/UserAuth.vue";
import TaskReporting from "../components/plandetail/vue/TaskReporting";
import ProcessList from "../components/plandetail/vue/ProcessList";
export default {
  name: "",
  props: {},
  components: { TaskReporting, ProcessList },
  data() {
    return {
      // 成功阶段控制
      resultInfo: false,
      isReportedSuccess: true,
      active: 0,
      loading: true,
      searchform: {
        keywords: "",
        ghtype: "",
      },
      // 规划类型选项
      regionData: [
        { ID: 1, TYPENAME: "总体规划" },
        { ID: 2, TYPENAME: "专项规划" },
        { ID: 3, TYPENAME: "详细规划" },
      ],
      // 数据类型选项
      vectorData: [
        { ID: 1, TYPENAME: "GDB" },
        { ID: 2, TYPENAME: "SHP" },
        { ID: 3, TYPENAME: "MDB" },
      ],
      // 表格数据
      tableData: [
        // {
        //   PID: 1,
        //   AREACODE: "410325",
        //   TASKID: "112121212",
        //   REPORTYEAR: "2012",
        //   APPROVALTYPE: "1",
        //   ENDDATE: "12121",
        //   TASKTYPE: "1",
        //   YWH: "",
        //   STATUS: "1",
        // },
      ],
      tableHeader: [],
      currentPage: 1,
      pagesize: 10,
      pagesizeArr: [10, 20, 50, 100],
      tableTotal: 0,
      dialogAddItem: false,
      addForm: {
        areaCode: "",
        areaName: "",
        planType: "",
        name: "",
        yearStart: "",
        yearStandard: "",
        yearTarget: "",
        vectorType: "",
        jdName: "",
      },
      addFormRule: {
        areaCode: [
          {
            required: true,
            message: "行政区代码不能为空",
            trigger: "blur",
          },
        ],
        areaName: [
          {
            required: true,
            message: "行政区名称不能为空",
            trigger: "blur",
          },
        ],
        planType: [
          {
            required: true,
            message: "规划类型不能为空",
            trigger: "change",
          },
        ],
        name: [
          {
            required: true,
            message: "规划名称不能为空",
            trigger: "blur",
          },
        ],
      },
      jdData: [], // 项目阶段
      addTitle: "",
      focusReply: {},
      JDTypeList: [],
      projectInfo: {}, //文件上传成功返回的数据汇交记录
      zipFilePath: "", //加密压缩文件完成返回压缩包的地址
      uploading: null,
      pid: 0,
      userAuthToken: "",
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.pagesize = this.pagesizeArr[0];
    this.getTableData();
    //this.getJUserToken();
  },
  methods: {
    //打开用户授权弹框（去掉）
    openUserAuth() {
      this.$refs.userAuthDialog.openDialog();
    },
    //同步任务
    async getUAuth() {
      //同步省厅下发的任务
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在同步省厅下发的任务",
        duration: 0,
        customClass: "prop-search",
      });
      let { data: resTask } = await getTask();
      if (resTask.code == 1) {
        loading.close();
        this.$message.success("任务同步完成！");
        //刷新任务列表
        //this.$emit("refresh", token);
        this.getTableData();
      } else {
        loading.close();
        this.$message.success("任务同步失败，" + resTask.msg);
      }
    },

    //打开数据填报弹窗
    openTaskReporting(data) {
      this.$refs.TaskReporting.openDialog(data);
    },
    //打开流程列表
    openProcessList(data) {
      this.$refs.ProcessList.openDialog(data);
    },

    //下载成果文件
    async downLoadZip(row) {
      if (row.ZIPPATH == "" || row.ZIPPATH == null) {
        this.$message.error("成果文件缺少，请联系相关工作人员重新上传！");
      } else {
        let filepath = row.ZIPPATH.substring(
          row.ZIPPATH.indexOf("FileResources")
        );
        window.location.href = apiURL_file + "/" + filepath;
      }
    },
    handleSelect(key, keyPath) {
      this.activeIndex = key;
    },
    // 搜索项目
    onSearch() {
      //this.getTableData(this.searchform);
    },
    async getJDTypeList() {
      const { data: res } = await getJDType();
      console.log(res, "阶段类型");
      if (res.code === 1) {
        this.JDTypeList = res.data;
      }
    },

    // 规划项目列表数据组装
    getTableData() {
      this.getTableList();
    },

    //同步任务完成刷新列表
    refreshData(token) {
      //this.userAuthToken = token;
      this.getTableList();
    },

    // 获取规划项目列表
    async getTableList() {
      const { data: res } = await getTaskList();
      if (res.code === 1) {
        this.tableData = res.data;
        this.loading = false;
      } else {
        this.loading = false;
        this.$message.error(res.msg);
      }
    },

    // 获取规划类型
    async getRegionData() {
      const { data: res } = await getType();
      if (res.code === 1) {
        this.regionData = res.data;
      } else {
        this.$message.error(res.msg);
      }
    },

    // 每条页数改变
    handleSizeChange(val) {
      this.pagesize = val;
      this.getTableData(this.searchform);
    },

    // 当前页码改变
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData(this.searchform);
    },

    // 下载文件
    // async handleDownload(row) {
    //     // 模板下载
    //     window.open(
    //         `${apiURL_file}/${row.FILEPATH}/${row.FILENAME}`
    //     );
    // },
    lookZip(row) {
      this.pid = row.PID;
      this.resultInfo = true;
      console.log(this.pid, this.resultInfo);
    },
    // 关闭查看成果弹框
    closeResult() {
      this.resultInfo = false;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../style/planhuijiao.scss";
</style>
<style lang="scss">
.demo-table-expand {
  font-size: 0;
  margin-left: 10px;
}

.demo-table-expand label {
  width: 150px !important;
  color: #99a9bf !important;
  font-weight: bold !important;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
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
    width: 130px;
    height: 100%;
    margin-right: 10px;

    .el-menu {
      width: 100%;

      .el-menu-item {
        padding: 0 !important;
        // text-align: center;
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
      height: 81.796vh;
    }
  }
}
</style>
