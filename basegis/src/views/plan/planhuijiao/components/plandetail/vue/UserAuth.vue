<template>
  <!-- 用户授权 -->
  <el-dialog
    title="用户授权"
    :visible.sync="dialogVisible"
    width="20%"
    class="add-dialog"
    @closed="closeDialog"
    v-dialogDrag
    :close-on-click-modal="false"
  >
    <el-form
      :model="addForm"
      :rules="addFormRule"
      ref="addFormRef"
      label-width="auto"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model.trim="addForm.username"
          autocomplete="off"
          size="small"
          placeholder="请输入用户名"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pwd">
        <el-input
          type="password"
          v-model.trim="addForm.pwd"
          autocomplete="off"
          size="small"
          placeholder="请输入用户密码"
          show-password
        >
        </el-input>
      </el-form-item>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="warning" size="small" @click="closeDialog">
          取消
        </el-button>
        <el-button type="success" @click="getUAuth" size="small">
          同步
        </el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script>
import { getUserAuth, getTask } from "../api/plandetail-api.js";
import cookie from "@/utils/cooike";
export default {
  name: "",
  props: {},
  components: {},
  data() {
    return {
      dialogVisible: false,
      addForm: {
        username: "",
        pwd: "",
      },
      addFormRule: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
          },
        ],
        pwd: [
          {
            required: true,
            message: "请输入用户密码",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    openDialog() {
      this.dialogVisible = true;
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    async getUAuth() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.warning("请补充必填项");
        localStorage.removeItem('ny_tjpg_token');
        cookie.delete('ptoken')
        let loading = this.$message({
          iconClass: "el-icon-loading",
          message: "正在获取授权......",
          duration: 0,
          customClass: "prop-search",
        });

        let userinfo = {
          userName: this.addForm.username,
          password: this.addForm.pwd,
        };
        let Base64 = require("js-base64").Base64;
        let param = {
          usertoken: Base64.encode(JSON.stringify(userinfo)),
        };
        let { data: res } = await getUserAuth(param);
        if (res.code == 1) {
          loading.close();
          //压缩文件分片
          loading = this.$message({
            iconClass: "el-icon-loading",
            message: "正在同步省厅下发的任务",
            duration: 0,
            customClass: "prop-search",
          });

          let token = res.data;
          localStorage.setItem("ny_tjpg_token", res.data);
          let params = {
            token: token,
          };
          let { data: resTask } = await getTask(params);
          if (resTask.code == 1) {
            loading.close();
            this.$message.success("任务同步完成！");
            //刷新任务列表
            this.$emit("refresh", token);
          } else {
            loading.close();
            this.$message.success("任务同步失败，" + resTask.msg);
          }
        } else {
          loading.close();
          this.$message.error(res.msg);
        }
      });
    },
  },
};
</script>
