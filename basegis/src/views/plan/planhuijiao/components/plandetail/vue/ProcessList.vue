<template>
  <el-dialog
    title="审批流程"
    :visible.sync="dialogVisible"
    width="40%"
    class="add-dialog"
    @closed="closeDialog"
    v-dialogDrag
    :close-on-click-modal="false"
  >
    <div class="container">
      <span>1.审批流程</span>
      <div class="table">
        <el-table
          :data="processList"
          border
          class="table"
          ref="processTable"
          header-cell-class-name="table-header"
          v-loading="tableloading"
          row-key="checkDate"
          stripe
        >
          <el-table-column
            prop="node"
            label="审批级别"
            align="center"
            width="100"
          ></el-table-column>
          <el-table-column
            prop="flag"
            label="审批结果"
            align="center"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="checkDate"
            label="审批时间"
            align="center"
            width="200"
          >
          </el-table-column>
          <el-table-column
            prop="content"
            label="审批意见"
            align="center"
            width="224"
          ></el-table-column>
        </el-table>
      </div>

      <div style="margin-top: 20px">
        <span>2.审批附件</span>
        <!-- <el-button size="mini" type="success" @click="downloadFile3()"
          >下载审批附件3</el-button
        > -->
        <!-- <el-button size="mini" type="success" @click="downloadFile()"
          >下载审批附件</el-button
        >
        <el-button size="mini" type="success" @click="downloadFile2()"
          >下载审批附件2</el-button
        > -->
        <br /><br />
        <el-table
          :data="fileList"
          border
          class="table"
          ref="fileTable"
          header-cell-class-name="table-header"
          v-loading="tableloading"
          row-key="PID"
          stripe
        >
          <el-table-column
            prop="id"
            label="文件id"
            align="center"
            width="200"
          ></el-table-column>
          <el-table-column
            prop="fileName"
            label="文件名称"
            align="center"
            width="280"
          ></el-table-column>
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
                @click="downloadFile3(scope.row)"
                >下载审批附件</el-button
              >
              <!-- <el-button
                size="mini"
                type="success"
                @click="downloadFile2(scope.row)"
                >下载审批附件2</el-button
              > -->
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import {
  getProcess,
  getProcessFiles,
  getProcessFiles2,
  getProcessFiles3,
} from "../api/plandetail-api.js";

export default {
  name: "",
  props: {},
  components: {},
  data() {
    return {
      processList: [],
      fileList: [],
      tableloading: false,
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
      this.ywh = data.YWH;
      this.dialogVisible = true;
      this.getProcesslist();
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    async getProcesslist() {
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在获取审批流程......",
        duration: 0,
        customClass: "prop-search",
      });
      let { data: res } = await getProcess({
        ywh: this.ywh,
      });
      if (res.code === 1) {
        loading.close();
        this.tableloading = false;
        this.processList = res.data.process;
        this.fileList = res.data.files;
      } else {
        loading.close();
        this.tableloading = false;
        this.$message.error(res.msg);
      }
    },

    async downloadFile(data) {
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在下载审批附件......",
        duration: 0,
        customClass: "prop-search",
      });
      let { data: res } = await getProcessFiles({
        fileid: data.id,
        filename: data.fileName,
      });
      debugger;
      if (res.code === 1) {
        loading.close();
        if (res.data != "") {
          window.open(res.data, "_blank");
        }
      } else {
        loading.close();
        this.$message.warning(res.msg);
      }
    },

    //async downloadFile2(data) {
    async downloadFile2() {
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在下载审批附件......",
        duration: 0,
        customClass: "prop-search",
      });
      // let { data: res } = await getProcessFiles2({
      //   fileid: data.id,
      //   filename: data.fileName,
      // });
      let { data: res } = await getProcessFiles2({
        fileid: "12",
        filename: "12.PDF",
      });
      console.log(res);
      if (res.code === 1) {
        loading.close();
        window.open(
          apiURL_file +
            "/FileResources/uploadfile/TJPG/Approvalattachment/" +
            data.id +
            "/" +
            data.fileName,
          "_blank"
        );
        // window.location.href =
        //   apiURL_file +
        //   "/FileResources/uploadfile/TJPG/Approvalattachment/" +
        //   data.id +
        //   "/" +
        //   data.fileName;
      } else {
        loading.close();
        this.$message.error(res.msg);
      }
    },

    async downloadFile3(data) {
      let loading = this.$message({
        iconClass: "el-icon-loading",
        message: "正在下载审批附件......",
        duration: 0,
        customClass: "prop-search",
      });
      // let { data: res } = await getProcessFiles3({
      //   fileid: "12",
      //   filename: "12.pdf",
      // });
      loading.close();
      //window.location.href = res;
      window.open(
        apiURL +
          "/TiJianPingGuNYApi/DownloadFile?fileid=" +
          data.id +
          "&filename=" +
          data.fileName,
        "_blank"
      );
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
