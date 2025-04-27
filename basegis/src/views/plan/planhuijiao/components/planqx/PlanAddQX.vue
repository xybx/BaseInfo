<template>
    <el-dialog :visible.sync="AdialogVisible" :title="title" width="30%" top="15%" :before-close="handleClose" :append-to-body="true" :close-on-click-modal="false" center>
      <el-form ref="addData" :model="addData" :rules="addRules" status-icon label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input type="text" v-model="addData.name" placeholder="请输入项目名称" autocomplete="off" />
        </el-form-item>
        <el-form-item label="业务类型" prop="processId">
          <el-cascader class="person" v-model="addData.processId" :options="options" :props="props" filterable placeholder="请选择业务类型" @change="proChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="-" :loading="loading" @click="saveData">保 存</el-button>
        <el-button size="-" @click="handleClose">取 消</el-button>
    </span>
    </el-dialog>
</template>

<script>
import {getProcessApi, getProjectsApi} from "@/views/plan/planhuijiao/api/planhuijiaoqxApi";
export default {
  name: "PlanAddQX",
  data(){
    return {
      AdialogVisible:false,
      title:'',
      loading: false,
      addData:{},
      addRules:{
        name:[{required:true,trigger:'blur',message:'请输入项目名称'}],
        processId:[{required:true,trigger:'change',message:'请选择业务类型'}]
      },
      options: [],
      props: {
        emitPath:false,
        multiple:false,
        expandTrigger: 'hover',
        value: "id",
        label: "name",
        children: "children",
      },
    }
  },
  created() {
  },
  mounted() {
    
  },
  methods:{
    showAdd(){
      this.title = '新增项目'
      this.getProcessData()
      this.AdialogVisible = true
    },
    async getProcessData(){
      let { data } = await getProcessApi()
      if(data.status == 200){
        this.options = data.data.length > 0 ? data.data.map(item=>{
          return {
            id:item.id,
            name:item.name,
            children:item.children.length > 0 ? item.children.map(val=>{
              return {
                id:val.id,
                name:val.name
              }
            }):[],
          }
        }) : []
      }
    },
    proChange(val){
      console.log(val)
    },
    saveData(){
      this.$refs.addData.validate(async (valid) => {
        if (valid){
          const loading = this.$loading({
            lock: true,
            text: '保存中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.5)'
          });
          let json = Object.assign({}, this.addData)
          let {data} =await getProjectsApi(json)
          if (data.status == 200){
            loading.close()
            this.$message.success('添加成功！')
            this.handleClose()
            this.$emit('getData')

          }else {
            loading.close()
            this.$message.error(data.message)
            return false
          }
        }else {
          return false
        }
      })
    },
    handleClose(){
      this.title = ''
      this.addData = this.$options.data().addData
      this.$refs.addData.resetFields()
      this.AdialogVisible = false
    },
    
  },
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
</style>