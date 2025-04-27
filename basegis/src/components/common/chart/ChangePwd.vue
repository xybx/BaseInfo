<template>
    <div class="">
        <!-- 修改密码 -->
        <el-dialog
            title="修改密码"
            :visible.sync="setPWDVisible"
            width="35%"
            class="add-dialog"
            @close="closedPWDSetDialog"
            v-dialogDrag
            :close-on-click-modal="false"
        >
            <el-form
                ref="setPWDForm"
                :model="setPWDForm"
                label-width="auto"
                class="set-form"
                :rules="setPWDFormRules"
            >
                <el-form-item label="旧密码" prop="OLDPWD">
                    <el-input
                        v-model.trim="setPWDForm.OLDPWD"
                        placeholder="请输入旧密码"
                        show-password
                    ></el-input>
                    <span class="gray">默认: 888888</span>
                </el-form-item>
                <el-form-item label="新密码" prop="NEWPWD">
                    <el-input
                        v-model.trim="setPWDForm.NEWPWD"
                        placeholder="请输入新密码"
                        show-password
                    ></el-input>
                    <span class="orange"
                        >注：请输入8-20位数字+字母组成的字符串</span
                    >
                </el-form-item>
                <el-form-item label="重复密码" prop="REFNEWPWD">
                    <el-input
                        v-model.trim="setPWDForm.REFNEWPWD"
                        placeholder="请输入新密码"
                        show-password
                    ></el-input>
                    <!-- <span class="gray">默认: 888888</span> -->
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setPWDVisible = false">取 消</el-button>
                <el-button type="primary" @click="savePWD">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { changePwd } from "../../../views/home/api/home-api";
export default {
    name: "",
    props: {},
    components: {},
    data() {
        var validatePass = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("请输入新密码"));
            } else {
                var pattern = /^(?=.*[0-9])(?=.*[a-zA-Z])(.{8,20})$/;
                if (!pattern.test(value)) {
                    callback(new Error("请输入8-20位数字或英文字母组成的密码"));
                }
                if (this.setPWDForm.REFNEWPWD !== "") {
                    this.$refs.setPWDForm.validateField("REFNEWPWD");
                }
                callback();
            }
        };
        var validatePass2 = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("请再次输入新密码"));
            } else if (value !== this.setPWDForm.NEWPWD) {
                callback(new Error("两次输入密码不一致!"));
            } else {
                callback();
            }
        };
        return {
            setPWDVisible: false,
            setPWDForm: {
                OLDPWD: "",
                NEWPWD: "",
                REFNEWPWD: "",
                PID: 0,
                ORAPWD: "",
            },
            setPWDFormRules: {
                OLDPWD: [
                    {
                        required: true,
                        message: "请输入旧密码！",
                        trigger: "blur",
                    },
                ],
                NEWPWD: [{ validator: validatePass, trigger: "blur" }],
                REFNEWPWD: [{ validator: validatePass2, trigger: "blur" }],
            },
        };
    },
    mounted() {},
    methods: {
        openDialog() {
            this.setPWDVisible = true;
            this.setPWDForm.PID = window.sessionStorage.getItem("userid");
            // this.taskdata = data;
            // this.ywh = data.YWH;
            // this.dialogVisible = true;
            // this.getProcesslist();
        },
        closedPWDSetDialog() {
            this.$refs.setPWDForm.resetFields();
            this.setPWDForm = this.$options.data().setPWDForm;
        },
        savePWD() {
            this.$refs.setPWDForm.validate(async (valid) => {
                if (!valid) return;
                let Base64 = require("js-base64").Base64;
                const { data: res } = await changePwd({
                    pid: this.setPWDForm.PID,
                    oldpwd: Base64.encode(this.setPWDForm.OLDPWD),
                    newpwd: Base64.encode(this.setPWDForm.REFNEWPWD),
                });
                if (res.code === 1) {
                    this.$message.success(res.msg);
                    this.setPWDVisible = false;
                }
                else
                {
                    this.$message.error(res.msg);
                }
                
            });
        },
    },
};
</script>

<style scoped lang="scss">
::v-deep .add-dialog {
    .el-dialog__header {
        padding: 6px !important;
        padding-left: 20px !important;
        border-bottom: 1px solid #d7d7d7;
        background: $el-main-color;
        .el-dialog__title {
            color: #fff;
            letter-spacing: 2px;
        }
        .el-dialog__headerbtn {
            top: 10px !important;
            .el-dialog__close {
                color: #fff;
            }
        }
    }
    .el-dialog__body {
        padding: 20px !important;
    }
}
</style>
