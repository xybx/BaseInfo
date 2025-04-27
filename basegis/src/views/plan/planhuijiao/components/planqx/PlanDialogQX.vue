<template>
  <el-dialog :visible.sync="dialogVisible" :title="title" width="30%" top="15%" :show-close="false" :append-to-body="true" :close-on-click-modal="false" center>
    <el-form ref="loginData" :model="loginData" :rules="loginRules" status-icon label-width="100px">
        <el-form-item label="用户身份" prop="loginName">
          <el-select v-model="loginData.loginName" placeholder="请选择用户身份">
            <el-option value="qxscgsb" label="县局成果上报"></el-option>
            <el-option value="qxskssc" label="县局科室审查"></el-option>
            <el-option value="qxsfgldsc" label="县局分管领导审查"></el-option>
          </el-select>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="-" :loading="loading" @click="putlogin">登 录</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {getTokenApi} from "@/views/plan/planhuijiao/api/planhuijiaoqxApi";
import cookie from "@/utils/cooike";
export default {
  name: "PlanDialogQX",
  data(){
    return {
      loading: false,
      title:'用户登录',
      loginData:{},
      loginRules:{
        loginName:[{required:true,trigger:'change',message:'请选择用户身份'}]
      }
    }
  },
  props:['dialogVisible'],
  created() {

  },
  mounted() {

  },
  methods:{
    showEdit(boolean){
      this.$emit('showPage',boolean)
    },
    handleClose(){
      this.loading = false
      this.loginData = this.$options.data().loginData
      this.$emit('showPage',false)
    },
    putlogin(){
      this.$refs.loginData.validate(async (valid)=>{
        if(valid){
          let json = {loginName:this.loginData.loginName}
          let obj = {
            qxscgsb:'PHsAkQFxuA1OXa8oeD1ft6yLK5uReves6ouGxOrZDQ5I15rEVBhjNPFhQVC1xLRekiP3SxxttqieH2YOs126FA/Zin7N5Zz965orv0YxX7Q6RWv0eRaMHnSOuctp56B1N8g7rCDU2KrAAOI/W46YPrBQGx9l+MBTOUn1s+E5bGo=',
            qxskssc:'MNwoN64nle7YDVbaeEW86G/aU2YOqKzKdivMPpnG0zf2eyXGOBObdNLIeu2dMrKmcxY5jaRKHDNuaKWbLdlmvHoywpB11OI84Yciw6jJTnkdkxvvmyGvZtSRtuAWddeqyxp5yV/cxcFH6sDHDallFJ+fFshbnYcSsQa4DnSwmGs=',
            qxsfgldsc:'CwYyq4iiFPUQREYOpK+Rbbc5PKI8dJ2bU1EbN7n5ug3iB4XEq+HEvmYdKQHIOLoABuQ9PADg9Gijtx/+mj0lspFwYVEQVnRTXHZajdzF+HgNlr/MtbNG29whTzptGWEqD7KWfz8Ht9ih76DjG4HMEALwEQdoXJ2g/GDkJXpVtOk='
          }
          let krr = Object.keys(obj)
          if(krr.includes(this.loginData.loginName)){
            Object.assign(json,{loginPwd:obj[this.loginData.loginName]})
          }
          let { data } = await getTokenApi(json)
          console.log(data)
          if(data.code == 1000 && data.status == 'success'){
            this.$message.success('登录成功')
            cookie.set('ptoken',data.data.token,0.5)
            this.handleClose()
          } else {
            this.$message.success(data.message)
            cookie.delete('ptoken')
            this.showEdit(false)
          }
        }else {
          return false
        }
      })
    },
  }
}
</script>
<style scoped lang="scss">
.el-dialog__body{
  .el-form{
    .el-form-item{
      .el-input, .el-select,.el-textarea ,.el-cascader{
        width: 100%;
      }
    }
  }
}
.el-dialog__footer{
  .el-button{
    width: 50%;
    padding:12px 25px;
    font-size:15px;
  }
}
</style>