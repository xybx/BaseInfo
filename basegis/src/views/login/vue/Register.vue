<template>
    <div class="container">
        <div class="register-box">
            <div class="register-title">用户注册</div>
            <div class="register-form">
                <div>
                    <label class="layui-form-label">注册码：</label>
                    <div class="layui-input-block">
                        <el-input
                            type="textarea"
                            :rows="6"
                            placeholder="请输入注册码"
                            v-model="zcode"
                        >
                        </el-input>
                    </div>
                </div>
                <div>
                    <label class="layui-form-label">授权码：</label>
                    <div class="layui-input-block">
                        <el-input
                            type="textarea"
                            :rows="6"
                            placeholder="请输入授权码"
                            v-model="scode"
                        >
                        </el-input>
                    </div>
                </div>

                <div class="layui-form-item btn">
                    <el-button class="layui-btn" type="primary" @click="Register">
                        注册
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
	getRegistCode,Regist,isRegist
} from "../api/login-api";
export default {
    name: "Register",
    data() {
        return {
            scode: "",
            zcode: "",
        };
    },
    async mounted() {
         await this.isSysRegist();
		 await this.getResigterCode();
	},
	methods: {
          //验证系统是否授权
          async isSysRegist() {
            const { data: res } = await isRegist();
            if (res.code === 1) {
                window.sessionStorage.setItem("IsSysAuth", 1);
                console.log("授权通过");
            } else {
                window.sessionStorage.setItem("IsSysAuth", 0);
                debugger;
                this.$message.error("授权到期或未授权，请及时联系技术人员！");
                this.$router.push("/register");
                //window.location.href = "register.html";
            }
        },

		// 获取注册码
		async getResigterCode() {
			const { data: res } = await getRegistCode();
			if (res.code === 1) {
				this.zcode = res.data;
			} else {
				this.$message.error(res.msg);
			}
		},
        async Register(){
            if (this.scode==="") {
              return  this.$message.error("请输入授权码！");
            }
            const { data: res } = await Regist({code:this.scode});
            if (res.code===1) {
                window.sessionStorage.setItem("IsSysAuth",1);
                //window.sessionStorage.setItem("sysAuthCode",this.scode);
                this.$router.push("/login")
            }
            else {
				this.$message.error(res.msg);
			}
        },
	},
};
</script>

<style scoped lang="scss">
html,
body,
.container {
    height: 100%;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}
.container {
    background: url("~@/assets/images/login-images/bg.png") no-repeat;
    background-size: cover;
}
.register-box {
    position: absolute;
    width: 50%;
    height: 27.344vw;
    padding: 1.172vw;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 16px;
    box-sizing: border-box;
}
.register-title {
    font-size: 1.172vw;
    text-align: center;
    letter-spacing: 0.078vw;
    margin: 2vw;
    color: #3e83e9;
}
.register-form .layui-textarea {
    resize: none;
    background-color: #f7f7f7;
    border-radius: 10px;
    font-size: 0.781vw;
    min-height: 5.906vw;
}
.register-form .layui-form-label {
    width: 5.125vw;
    font-size: 0.938vw;
    color: #3e83e9;
}
.register-form .layui-input-block {
    margin-left: 6.297vw;
    margin-top: -20px;
}
.btn {
    text-align: center;
    margin-top: 1.172vw;
}
.btn .layui-btn {
    width: 40%;
    height: 2.344vw;
    font-size: 0.938vw;
    letter-spacing: 0.586vw;
    border-radius: 1.172vw;
    // background-color: #3e83e9;
    box-shadow: 0.078vw 0.117vw 0.313vw 0.078vw rgba(193, 193, 193, 0.6);
}
</style>
