<template>
  <el-dialog
    title="指标填报"
    :visible.sync="dialogVisible"
    width="80%"
    class="add-dialog"
    @closed="closeDialog"
    v-dialogDrag
    :close-on-click-modal="false"
  >
    <div class="container">
      <span>1.推送指标数据</span>
      <el-button
        type="success"
        plain
        size="small"
        icon="el-icon-download"
        @click="tempExport"
      >
        导出指标
      </el-button>
      <el-upload
        style="display: inline; padding: 5px"
        class="tem-upload"
        ref="UploadData"
        action="action"
        :http-request="tempImport"
        :show-file-list="false"
        accept=".xlsx,.xls"
      >
        <el-button type="success" plain size="small" icon="el-icon-upload2">
          导入指标
        </el-button>
      </el-upload>
      <el-button
        type="success"
        style="float: right"
        size="small"
        @click="sendZb"
        >指标数据上报</el-button
      >
      <div class="table">
        <el-table
          :data="zblist"
          border
          class="table"
          ref="zbTable"
          header-cell-class-name="table-header"
          v-loading="tableloading"
          row-key="PID"
          stripe
        >
          <!-- <el-table-column type="selection" width="55" reserve-selection>
          </el-table-column> -->
          <el-table-column
            prop="PID"
            label="ID"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="AREACODE"
            label="地区编码"
            align="center"
            width="100"
          ></el-table-column>
          <el-table-column
            prop="TASKID"
            label="任务号"
            align="center"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="INDICATORSID"
            label="指标ID"
            align="center"
            width="200"
          >
          </el-table-column>
          <el-table-column
            prop="INDICATORSCODE"
            label="指标编码"
            align="center"
            width="120"
          >
            <template v-slot="scope">
              <el-input
                v-model="scope.row.INDICATORSCODE"
                size="small"
                placeholder="请输入指标编码"
                style="width: 90px"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column
            prop="INDICATORSUNIT"
            label="指标单位"
            align="center"
            width="120"
          >
          </el-table-column>
          <el-table-column
            prop="INDICATORSNAME"
            label="指标名称"
            align="center"
            width="150"
          >
          </el-table-column>
          <el-table-column prop="REPORTVALUE" label="评估值" align="center">
            <template v-slot="scope">
              <el-input
                v-model="scope.row.REPORTVALUE"
                size="small"
                placeholder="请输入评估值"
                style="width: 100px"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="BASICVALUE" label="基期值" align="center">
            <template v-slot="scope">
              <el-input
                v-model="scope.row.BASICVALUE"
                size="small"
                placeholder="请输入基期值"
                style="width: 100px"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="TARGETVALUE" label="规划值" align="center">
            <template v-slot="scope">
              <el-input
                v-model="scope.row.TARGETVALUE"
                size="small"
                placeholder="请输入规划值"
                style="width: 100px"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column
            prop="SENDSTATUSNAME"
            label="推送状态"
            align="center"
            width="150"
          >
          </el-table-column>
          <!-- <el-table-column label="操作" align="center" width="200">
          <template v-slot="scope">
            <el-button
              v-if="scope.row.ISEDIT == 1"
              type="success"
              plain
              size="mini"
              @click="handleSaveValue(scope.row)"
              title="点完成保存当前项的修改"
              >完成</el-button
            >
            <el-button
              type="primary"
              v-if="scope.row.ISEDIT == 0"
              plain
              size="mini"
              @click="handleEditValue(scope.row)"
              >修改值</el-button
            >
          </template>
        </el-table-column> -->
        </el-table>
      </div>
      <div style="margin-top: 20px">
        <span>2.推送附件</span>
        <br /><br />
        <el-upload
          style="display: inline; padding: 5px"
          class="tem-upload"
          ref="UploadReport"
          action="action"
          :http-request="tempUpload"
          :show-file-list="false"
          accept=".pdf"
        >
          <el-button type="success" plain size="small" icon="el-icon-upload2">
            年度体检报告
          </el-button>
        </el-upload>
        <el-upload
          style="display: inline; padding: 5px"
          class="tem-upload"
          ref="UploadData"
          action="action"
          :http-request="tempUpload"
          :show-file-list="false"
          accept=".pdf"
        >
          <el-button type="success" plain size="small" icon="el-icon-upload2">
            年度基础数据库建设情况
          </el-button>
        </el-upload>
        <el-upload
          style="display: inline; padding: 5px"
          class="tem-upload"
          ref="UploadZB"
          action="action"
          :http-request="tempUpload"
          :show-file-list="false"
          accept=".xls,.xlsx"
        >
          <el-button type="success" plain size="small" icon="el-icon-upload2">
            指标表
          </el-button>
        </el-upload>
        <el-upload
          style="display: inline; padding: 5px"
          class="tem-upload"
          ref="UploadImg"
          action="action"
          :http-request="tempUpload"
          :show-file-list="false"
          accept=".jpg,.png,.jpeg"
        >
          <el-button type="success" plain size="small" icon="el-icon-upload2">
            规划实施分析图
          </el-button>
        </el-upload>
        <br />
        <div style="color: red; margin-top: 3px">
          注：请严格按照要求命名推送附件的文件名，分别是（年度体检报告.pdf，年度基础数据库建设情况.pdf，指标表.xlsx，规划实施分析图.jpg）
        </div>
      </div>
      <div style="margin-top: 15px">
        <span>3.通知市局审核</span><br />
        <div style="margin-top: 10px">
          <el-button
            type="success"
            plain
            size="small"
            @click="notifyComplate"
            :disabled="taskdata.STATUS > 1 && taskdata.STATUS < 6"
          >
            通知市局提交审批流程
          </el-button>
        </div>
      </div>

      <!-- <span>4.获取审批附件</span> -->
    </div>
  </el-dialog>
</template>

<script>
import {
  getTaskZBList,
  saveZBValue,
  savefile,
  pushChecks,
  complete,
  exportfile,
  importfile,
} from "../api/plandetail-api.js";
import { uploadFile } from "@/utils/common-api";
export default {
  name: "",
  props: {},
  components: {},
  data() {
    return {
      zblist: [],
      tableloading: true,
      dialogVisible: false,
      taskdata: null,
      userAuthToken: "",
      ywh: "",
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    openDialog(data) {
      this.taskdata = data;
      this.dialogVisible = true;
      this.getzblist();
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    async getzblist() {
      let { data: res } = await getTaskZBList({ taskid: this.taskdata.TASKID });
      if (res.code === 1) {
        this.tableloading = false;
        this.zblist = res.data;
      } else {
        this.tableloading = false;
        this.$message.error(res.msg);
      }
    },
    async sendZb() {
      //console.log(this.zblist, "zblist");
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在保存指标数据......",
        duration: 0,
        customClass: "prop-search",
      });
      let { data: res } = await saveZBValue(this.zblist);
      if (res.code == 1) {
        loading.close();
        loading = this.$message({
          iconClass: "el-icon-loading",
          message: "正在推送指标数据......",
          duration: 0,
          customClass: "prop-search",
        });

        let { data: resCheck } = await pushChecks({
          taskid: this.taskdata.TASKID,
        });
        if (resCheck.cod == 1) {
          this.ywh = resCheck.data;
          loading.close();
          this.$message.success("指标数据推送完成");
        } else {
          loading.close();
          this.$message.success(resCheck.msg);
        }
      } else {
        loading.close();
        this.$message.error(res.msg);
      }
    },
    //导入
    async tempImport(params) {
      //this.uploading = true;
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在导入excel...",
        duration: 0,
        customClass: "prop-search",
      });
      let namearr = params.file.name.split(".");
      let ext = namearr[namearr.length - 1];
      //console.log(params.file,"FILE");
      let form = new FormData();
      form.append("filepath", "TJPG");
      form.append("file", params.file);
      const { data: res } = await uploadFile(form);
      if (res.code === 1) {
        const { data: resdata } = await importfile({ filepath: res.data });
        if (resdata.code === 1) {
          this.$message.success("导入成功");
          loading.close();
          this.getzblist();
        } else {
          loading.close();
          this.$message.error(resdata.msg);
        }
      } else {
        // this.uploading = false;
        loading.close();
        this.$message.error(res.msg);
      }
    },

    ///导出
    async tempExport() {
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在导出指标......",
        duration: 0,
        customClass: "prop-search",
      });
      const { data: res } = await exportfile({ taskid: this.taskdata.TASKID });
      if (res.code === 1) {
        loading.close();
        let filepath = res.data.substring(res.data.indexOf("FileResources"));
        window.location.href = apiURL_file + "/" + filepath;
      } else {
        loading.close();
        this.$message.error(res.msg);
      }
    },
    async tempUpload(params) {
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在上传文件......",
        duration: 0,
        customClass: "prop-search",
      });
      let form = new FormData();
      form.append("filepath", "TJPG");
      form.append("file", params.file);
      const { data: res } = await uploadFile(form);
      if (res.code === 1) {
        loading.close();
        loading = this.$message({
          iconClass: "el-icon-loading",
          message: "文件上传完成，正在推送附件......",
          duration: 0,
          customClass: "prop-search",
        });
        let { data: resSave } = await savefile({
          filepath: res.data,
          taskid: this.taskdata.TASKID,
        });
        if (resSave.code == 1) {
          loading.close();
          this.$message.success("附件推送成功！");
        } else {
          loading.close();
          this.$message.error(resSave.msg);
        }
      } else {
        loading.close();
        this.$message.error(res.msg);
      }
    },
    //通知市局审批
    async notifyComplate() {
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在通知市级提交流程审批......",
        duration: 0,
        customClass: "prop-search",
      });
      let { data: res } = await complete({
        taskid: this.taskdata.TASKID,
      });
      if (res.code == 1) {
        this.taskdata.STATUS = 2;
        loading.close();
        this.$message.success(res.msg);
      } else {
        loading.close();
        this.$message.error(res.msg);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  height: 100%;
  //   display: flex;
  padding: 10px;
  box-sizing: border-box;

  span {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 10px;
  }
}

.tree {
  position: relative;
  width: 400px;
  border: 1px solid #ccc;
  margin-right: 10px;

  .cont-head {
    height: 40px;
    background-color: $el-main-color;
    line-height: 40px;
    text-align: center;
    font-size: 16px;
    color: #fff;
  }

  .input-box {
    padding: 10px;
    box-sizing: border-box;
  }

  :deep(.el-tree-node__label) {
    font-size: 15px;
  }
}

.table {
  flex: 1;
  // border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  width: 100%;

  .add-top-btn {
    width: 200px;
  }
  :deep(.el-table__body-wrapper) {
    height: 400px;
    overflow-y: auto;
  }

  :deep(.el-table) {
    flex: 1;
    overflow-y: auto;

    th {
      text-align: center;

      .cell {
        text-align: center;
      }
    }

    .cell {
      font-size: 15px;
    }

    .el-button {
      font-size: 15px;
    }
  }

  .add-top-btn {
    margin: 5px;
  }
}
</style>
