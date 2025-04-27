<template>
  <div class="content">
    <div class="header">
      <div class="title">
        <div class="text">
          <i class="el-icon-back" @click="backout"></i>
          <span>{{`项目名称：${rowValue.name}   当前环节：${rowValue.taskName}`}}</span>
        </div>
      </div>
      <div class="operate" v-if="activeIndex == 1">
        <el-button v-if="rowValue.status == 1 || rowValue.status==4" type="primary" @click="submitForm">保存</el-button>
        <el-button type="primary" v-for="(item, index) in operateBtn" :key="index" @click="buttonClick(item)">{{ item.name }}</el-button>
      </div>
    </div>
    <!-- 页签 -->
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="项目表单" name="first" class="xmbt">
        <el-tag type="primary" size="medium" class="eltag">成功填报</el-tag>
        <el-form :model="form" label-width="20%" label-position="left" ref="ruleForm" class="baseform">
          <div class="caption">基本信息表</div>
          <template v-for="(item, index) in form.formData">
            <el-form-item :label="item.label" v-if="item.visible&&item.type == 'input'" :prop="'formData.' + index + '.value'" :rules="item.rules">
              <el-input type="text" v-model="item.value" :readonly="item.readonly" :placeholder="`请输入${item.label.replace('：','')}`" :maxlength="item.level == 'contactinformation' ? 11 : ''"></el-input>
            </el-form-item>
            <el-form-item :label="item.label" v-if="item.visible&&item.type == 'date'" :rules="item.rules" :prop="'formData.' + index + '.value'">
              <el-date-picker type="date" v-model="item.value" :placeholder="`请选择${item.label.replace('：','')}`" :readonly="item.readonly" format="yyyy 年 MM 月 dd 日" value-format="yyyy-MM-dd"></el-date-picker>
            </el-form-item>
            <template v-if="item.level.indexOf('xfgjzsc') >-1">
              <el-form-item class="fgyj" v-if="item.visible&&item.type == 'textarea'" :label="item.label" :prop="'formData.' + index + '.value'" :rules="item.rules">
                <el-input type="textarea" v-model="item.value" :rows="5" :readonly="item.readonly" :placeholder="`请输入${item.label.replace('：','')}`"></el-input>
              </el-form-item>
              <el-form-item class="fgqm" v-if="item.visible&&item.type == 'signature'" :label="item.label" :prop="'formData.' + index + '.value'" :rules="item.rules">
                <el-input type="text" v-model="item.value" :readonly="item.readonly" :placeholder="`请输入${item.label.replace('：','')}`"></el-input>
              </el-form-item>
              <el-form-item class="fgsj" v-if="item.visible&&item.type == 'timestamp'" :label="item.label" :rules="item.rules" :prop="'formData.' + index + '.value'">
                <el-date-picker type="datetime" v-model="item.value" :placeholder="`请选择${item.label.replace('：','')}`" :readonly="item.readonly" format="yyyy 年 MM 月 dd 日 HH 时 mm 分 ss 秒" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
              </el-form-item>
            </template>
            <template v-if="item.level.indexOf('xkjghkkzsc') >-1">
              <el-form-item class="kzyj" v-if="item.visible&&item.type == 'textarea'" :label="item.label" :prop="'formData.' + index + '.value'" :rules="item.rules">
                <el-input type="textarea" v-model="item.value" :rows="5" :readonly="item.readonly" :placeholder="`请输入${item.label.replace('：','')}`"></el-input>
              </el-form-item>
              <el-form-item class="kzqm" v-if="item.visible&&item.type == 'signature'" :label="item.label" :prop="'formData.' + index + '.value'" :rules="item.rules">
                <el-input type="text" v-model="item.value" :readonly="item.readonly" :placeholder="`请输入${item.label.replace('：','')}`"></el-input>
              </el-form-item>
              <el-form-item class="kzsj" v-if="item.visible&&item.type == 'timestamp'" :label="item.label" :rules="item.rules" :prop="'formData.' + index + '.value'">
                <el-date-picker type="datetime" v-model="item.value" :placeholder="`请选择${item.label.replace('：','')}`" :readonly="item.readonly" format="yyyy 年 MM 月 dd 日 HH 时 mm 分 ss 秒" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
              </el-form-item>
            </template>
          </template>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="材料管理" name="second">
        <el-tree :data="treeData" :props="defaultProps" node-key="id" :default-expanded-keys="expandedKeys" :expand-on-click-node="true">
          <template #default="{ node, data }">
            <div class="item">
              <div class="left">
                <i :class="data.type == 4 ? 'el-icon-s-cooperation':'el-icon-s-order'"></i>
                <span> {{ node.label }}</span>
              </div>
              <div class="right">
                <i v-if="data.type == 3" class="el-icon-download" @click="downLoadFile(data.id,data.name)"></i>
                <el-upload v-if="activeIndex == 1&&data.type == 4" action="#" class="upload-demo" :http-request="customUpload" :show-file-list="false">
                  <i class="el-icon-upload" @click="parentId = data.id"></i>
                </el-upload>
                <i v-if="activeIndex == 1&&data.type == 3" class="el-icon-delete-solid" @click="deleteFile(data.id)"></i>
              </div>
            </div>
          </template>
        </el-tree>
      </el-tab-pane>
      <el-tab-pane label="流转信息" name="third">
        <el-timeline v-if="activities.length > 0">
          <el-timeline-item v-for="(activity, index) in activities" :key="index" placement="top" :timestamp="timestampToTime(activity.createTime)">
            <div class='timehead'>
              <span>流程名称: {{ activity.operator }}</span>
              <span>任务名称: {{ activity.taskName }}</span>
            </div>
            <div class='timebody'>
              <span>{{ activity.opinion ? activity.opinion: '暂无办理意见' }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
        <template v-else>
          <span class="noflow">暂无流程</span>
        </template>
      </el-tab-pane>
      <!--<el-tab-pane label="审查记录" name="fourth">Task</el-tab-pane>-->
    </el-tabs>
    <el-dialog :visible.sync="sendpage" :title="title" width="30%" top="15%" :append-to-body="true" :close-on-click-modal="false" center :before-close="resetForm">
      <el-form ref="formRef" :model="userdata" status-icon label-width="100px">
        <el-form-item label="候选人" prop="user" :rules="{required: true, message: '请选择候选人',trigger: 'blur'}">
          <el-select v-model="userdata.user" placeholder="请选择发送对象">
            <el-option v-for="item in nextAssign" :key="item.userCode" :value="item.userCode" :label="item.userName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="action&&action.actionType != 'PASS'" label="意見" prop="opinion" :rules="{required: true, message: '请输入意見',trigger: 'blur'}">
          <el-input type="textarea" v-model="userdata.opinion" :rows="5" placeholder="请输入意見"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="-" @click="puttask">{{ action.action }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  getProcessRunApi, getProcessFormsApi, getMaterialListApi, getProjectsDataApi,
  getRoleUsersApi, putProjectsDataApi, getMaterialCheckApi, getMaterialChunkexistApi,
  getMaterialMergeApi, putFlowTaskApi, delMaterialApi, getMaterialUploadApi,getOpinionApi
} from "@/views/plan/planhuijiao/api/planhuijiaoqxApi";
import axios from 'axios';
import cookie from "@/utils/cooike";
export default {
  name: "",
  props: ['rowValue','activeIndex'],
  components: {},
  data() {
    return {
      activeName: "first",
      form: {
        formData: [],
      },
      ruleForm: "",
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name",
        value: "id",
      },
      expandedKeys:[],
      kezhangData: {},
      metaData: {},
      operateBtn: [],
      title: "",
      nextUser: {},
      nextAssign: [],
      sendpage: false,
      userdata: {user:'',opinion:''},
      loading: false,
      action:{},
      parentId: "", //选择的文件夹id
      activities:[],
      Sucflag:[],
      Eroflag:[]
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.getTaskRuntime();
  },
  methods: {
    handleClick(tab, event) {
      if (tab.name == "first") {
        this.getTaskRuntime();
      }
      if (tab.name == "second") {
        this.getTreeList();
      }
      if (tab.name == "third") {
        this.getprocess();
      }
    },
    backout() {
      this.$emit("closeDialog");
    },
    errroMsg(str){
      if (str.indexOf('token') > -1){
        this.$message.error('token已过期，请重新登录')
        cookie.delete('ptoken')
        this.$emit("closeDialog");
      }else {
        this.$message.error(str)
      }
    },
    // 获取元数据
    async getTaskRuntime() {
      const loading = this.$loading({
        lock: true,
        text: '数据加载中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.5)'
      });
      this.operateBtn = [];
      let { data:kezhangData } = await getProcessRunApi(this.rowValue.taskId).catch(error=>{return error.response});
      if (kezhangData.status == 200) {
        this.kezhangData = kezhangData.data
        kezhangData.data.actions.map((item) => {
          this.operateBtn.push(item);
        });
        let {data:metaData} = await getProcessFormsApi(this.rowValue.id, kezhangData.data.taskDefinitionKey).catch(error=>{return error.response});
        if (metaData.status == 200) {
          this.metaData = metaData.data
          let { data:formData1 } = await getProjectsDataApi({
            pid: this.rowValue.id,
            proctkid: kezhangData.data.taskDefinitionKey,
            formverid: metaData.data[0].formVersionId,
          }).catch(error=>{return error.response });
          if (formData1.status == 200) {
            this.getFormData(formData1.data);
          }else {
            this.errroMsg(formData1.message)
          }
        }else {
          this.errroMsg(metaData.message)
        }
      }else {
        this.errroMsg(kezhangData.message)
      }
      setTimeout(()=>{
        loading.close();
      },300)
    },
    // 获取表单数据
    getFormData(obj) {
      this.form.formData = []
      qxFormConfig.forEach(item=> {
        for (let key in obj) {
          if (Object.hasOwnProperty.call(obj, item.bind)) {
            if (key == item.bind) {
              this.form.formData.push({
                label:item.label,
                binding:obj[key]?.binding,
                level:obj[key]?.binding.split('.')[1],
                visible:obj[key]?.visible,
                value:obj[key]?.value && obj[key]?.value.length > 0 ? obj[key].value[0] : '',
                type:obj[key]?.controlId.split('_')[0],
                readonly:obj[key]?.usable ? false : true,
                rules:obj[key].required ? {
                  required:obj[key].required,
                  message:`${obj[key]?.controlId.split('_')[0] == 'input' ? '请输入':'请选择'}${item.label.replace('：','')}`,
                  trigger:`${obj[key]?.controlId.split('_')[0] == 'input' ? 'blur':'change'}`,
                } : {},
              });
            }
          }
        }
      });
    },
    // 保存
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.$confirm("确定保存?", "保存提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(async () => {
              const loading = this.$loading({
                lock: true,
                text: "正在保存...",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)",
              });

              let json = {};
              this.form.formData.forEach(item => {
                  json[item.binding] = [item.value];
              });
              let { data:res } = await putProjectsDataApi({
                data: json,
                formVersionId: this.metaData[0].formVersionId,
                processTaskId: this.kezhangData.taskDefinitionKey,
                projectId: this.rowValue.id,
              }).catch(error=>{return error.response});
              if (res.status == 200) {
                this.$message({
                  message: "保存成功",
                  type: "success",
                });
                loading.close();
              }else {
                this.errroMsg(res.message)
                loading.close();
              }
            }).catch(() => {
              this.$message({
                type: "info",
                message: "已取消保存",
              });
            });
        } else {
          return false;
        }
      });
    },
    // 发送
    async buttonClick(item) {
      this.action = item;
      this.title = item.action + "流程";
      let {data:nextUser} = await getRoleUsersApi(item.nextAssignee.candidateRole).catch(error =>{ return error.response});
      if (nextUser.status == 200) {
        this.sendpage = true;
        this.nextAssign = nextUser.data[this.action.nextAssignee.candidateRole[0]];
      }else {
        this.errroMsg(nextUser.message)
      }
    },
    async puttask() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          const loading = this.$loading({
            lock: true,
            text: `${this.action.action}中...`,
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.5)'
          });
          let rest = `${this.action.nextAssignee.assigneeKey}`;
          let json = {op: this.action.actionType, taskId: this.kezhangData.id,variables:{[`${rest}`]:this.userdata.user}}
          let obj = {'补正':{isFix:true,opinion:this.userdata.opinion,param_bz:this.action.parameter.param_bz},'退回':{isFix:false,opinion:this.userdata.opinion,param_bz:this.action.parameter.param_bz}}
          let nrr = Object.keys(obj)
          if(nrr.includes(this.action.action)){
            this.$delete(json,'variables')
            Object.assign(json,{variables:Object.assign({},obj[this.action.action])})
          }
          let { data } = await putFlowTaskApi(json).catch(error =>{ return error.response});
          if (data.status == 200) {
            loading.close()
            this.$message({
              message: this.action.action + "成功",
              type: "success",
            });
            this.sendpage = false;
            this.userdata.user = "";
          }else {
            loading.close()
            this.resetForm()
            this.$message.error(data.message.indexOf('token') > -1 ? 'token已过期，请重新登录' : data.message)
          }
        }
      });
    },
    resetForm() {
      this.$refs.formRef.resetFields();
      this.sendpage = false;
    },
    async getTreeList() {
      const loading = this.$loading({
        lock: true,
        text: '资料文件加载中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.5)'
      });
      let {data:tree} = await getMaterialListApi(this.rowValue.id,this.kezhangData.taskDefinitionKey).catch(error =>{ return error.response})
      if (tree.status == 200) {
        this.treeData = tree.data;
        this.expandedKeys = [tree.data[0].id] 
        loading.close()
      }else{
        loading.close()
        this.$message.error(tree.message.indexOf('token') > -1 ? 'token已过期，请重新登录' : tree.message)
        cookie.delete('ptoken')
        this.$emit("closeDialog");
      }
    },
    async customUpload(params){
      let files = params.file
      const loading = this.$loading({
        lock: true,
        text: '文件上传中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.5)'
      });
      let {data:fileData} = await getMaterialCheckApi({name:files.name,size:files.size,version:new Date(files.lastModifiedDate).getTime()}).catch(error =>{ return error.response})
      if(fileData.status == 200){
        if(files.size > 12582912){
          let chunksList = this.chunkFile(files, 8388608);
          //  判断分片是否存在
          for (let i = 0; i < chunksList.length; i++) {
            let element = chunksList[i];
            let {data:ifUploaded} = await getMaterialChunkexistApi({md5:fileData.data.md5,index:i,size:8388608}).catch(error =>{ return error.response}) //5MB
            if (ifUploaded.status == 200) {
              let FileForm = new FormData();
              FileForm.append("file", element);
              FileForm.append("parentId", this.parentId);
              FileForm.append("md5", fileData.data.md5);
              FileForm.append("chunks", chunksList.length);
              FileForm.append("index", i);
              FileForm.append("size", element.size);
              FileForm.append("secondUpload", ifUploaded.data);
              FileForm.append("fileName", files.name);
              FileForm.append("key", fileData.data.key);
              let {data:uploaded} = await getMaterialUploadApi(FileForm).catch(error =>{ return error.response})
              if (uploaded.status == 200){
                if (i === chunksList.length-1){
                  let {data:mergeData} = await getMaterialMergeApi({key: fileData.data.key, parentId: this.parentId, md5: fileData.data.md5, chunks: chunksList.length, fileName: files.name,}).catch(error =>{ return error.response});
                  if (mergeData.status == 200){
                    console.log(2)
                    this.$message.success('文件上传成功');
                    this.getTreeList();
                    loading.close()
                  }else {
                    loading.close()
                    this.$message.error('文件上传失败');
                    this.errroMsg(mergeData.message)
                  }
                }
              }else {
                this.errroMsg(uploaded.message)
              }
            }else {
              loading.close()
              this.errroMsg(ifUploaded.message)
            }
          }
        }else {
          let FileForm = new FormData();
          FileForm.append("file", files);
          FileForm.append("parentId", this.parentId);
          FileForm.append("md5", fileData.data.md5);
          FileForm.append("chunks", 0);
          FileForm.append("fileName", files.name);
          FileForm.append("key", fileData.data.key);
          let {data:uploaded} = await getMaterialUploadApi(FileForm).catch(error =>{ return error.response})
          if (uploaded.status == 200){
            this.$message.success('文件上传成功')
            this.getTreeList();
            setTimeout(()=>{
              loading.close()
            },300)
          }else {
            loading.close()
            this.errroMsg(uploaded.message)
          }
        }
      }else {
        loading.close()
        this.errroMsg(fileData.message)
      }
    },
    // 文件分片
    chunkFile(file, chunksize) {
      const chunks = Math.ceil(file.size / chunksize);
      const chunksList = [];
      let currentChunk = 0;
      while (currentChunk < chunks) {
        const start = currentChunk * chunksize;
        const end = Math.min(file.size, start + chunksize);
        const chunk = file.slice(start, end);
        chunksList.push(chunk);
        currentChunk++;
      }
      return chunksList;
    },

    async deleteFile(pid) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
          let {data} = await delMaterialApi(pid).catch(error =>{ return error.response});
          console.log(this.parentId);
          if (data.status == 200) {
            this.$message.success(data.data);
            this.getTreeList();
          }else {
            this.errroMsg(data.message)
          }
        }).catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    downLoadFile(pid,fname) {
      let _this = this
      const loading = _this.$loading({
        lock: true,
        text: '文件下载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.6)'
      });
      axios({
        headers: {'x-auth-token':cookie.get('ptoken')},
        type: 'application/ json; charset = utf-8',
        method: 'GET',
        url:  `${window.cityApiOne}/projects/material/attach/download?attid=${pid}`,
        responseType: 'arraybuffer',
      }).then(function (res) {
        const fileName = fname;
        const blob = new Blob([res.data]);
        //创建一个a标签并设置href属性，之后模拟人为点击下载文件
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click(); //模拟点击
        //释放资源并删除创建的a标签
        URL.revokeObjectURL(link.href);
        setTimeout(() => {
          loading.close();
          _this.$message.success('文件下载成功！')
        }, 2000);
      });
    },
    // 流转日志
    async getprocess() {
      const loading = this.$loading({
        lock: true,
        text: '流程数据加载中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.5)'
      });
      let { data } = await getOpinionApi(this.kezhangData.processInstanceId).catch(error =>{ return error.response});
      console.log(this.kezhangData.processInstanceId);
      if (data.status == 200) {
        this.activities = data.data;
        console.log(this.activities)
        loading.close()
      }else {
        loading.close()
        this.errroMsg(data.message)
      }
    },
    timestampToTime(timestamp) {
      timestamp = timestamp ? timestamp : null;
      let date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      let Y = date.getFullYear() + "-";
      let M =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) + "-";
      let D =
        (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
      let h =
        (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
      let m =
        (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
        ":";
      let s =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      return Y + M + D;
    },
  },
};
</script>
<style scoped lang="scss">
.content {
  padding:20px;
  ::v-deep{
    .el-timeline{
      .el-timeline-item{
        .el-timeline-item__timestamp.is-top{
          display: inline-block;
          font-size: 16px;
        }
        .el-timeline-item__content{
          .timehead{
            position: absolute;
            top:2px;
            left:150px;
            display: flex;
            flex-direction: row;
            align-items: center;
            span{
              font-size: 16px;
              color: #333;
              margin-right:30px;
            }
            i{
              margin-left: 20px;
              font-size: 15px;
              border:1px solid;
              border-radius: 25px;
              padding:2px 12px;
              color:#FD7837;
              font-style: inherit;
              &.blue{
                color:#2E8CFF;
                border-color:rgba(46,140,255,.3);
              }
              &.org{
                color:#FD7837;
                border-color:rgba(253,120,55,.3);
              }
              &.red{
                color: #ea373b;
                border-color:rgba(234,5,59,.3);
              }
              &.green{
                color: #66ecb7;
                border-color:rgba(102,236,183,.3);
              }
            }
          }
          .timebody{
            background-color:#EBEEF5;
            padding: 10px 15px;
            margin-top: 15px;
            span{
              color: #666;
              font-size: 15px;
              display: block;
              margin-bottom: 12px;
            }
          }
        }
      }
    }
    .noflow{
      font-size: 16px;
      color: #999;
      display: block;
      text-align: center;
    }
  }
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    font-size: 1vw;
    font-weight: bold;
    .el-icon-back {
      cursor: pointer;
      font-size: 1.2vw;
      margin-right: 1vw;
    }
  }
  padding-bottom: 8px;
  box-shadow: 0 3px rgba(226, 226, 226, 0.747);
}
.xmbt {
  display: flex;
}
.eltag {
  margin: 0.2vw 1vw 0 0.5vw;
}
.baseform {
  .caption {
    width: 100%;
    text-align: center;
    border-bottom: 1px solid rgb(224, 224, 224);
    padding: 0.8vw 0;
    color: rgb(63, 63, 63);
  }
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid rgb(224, 224, 224);
  ::v-deep{
    .el-form-item {
      margin: unset;
      border-right: 1px solid rgb(224, 224, 224);
      border-bottom: 1px solid rgb(224, 224, 224);
      width: 33.33%;
      padding: 0.7vw 0.5vw;
      box-sizing: border-box;
      &:nth-child(4), &:nth-child(7), &:nth-child(10),&:nth-child(12){
        border-right: none;
      }
      &:nth-child(12){
        width:66.66%;
        .el-form-item__label{
          width: 10% !important;
        }
        .el-form-item__content{
          margin-left: 10% !important;
        }
      }
      .el-input {
        width: 100% !important;
      }
      &.fgyj{
        position: relative;
        width: 66.66%;
        margin-left:33.3%;
        border-right: none;
        &::before{
          content: '县分管领导审查';
          width:50%;
          height: 100%;
          display: block;
          position: absolute;
          left:-50%;
          top: 0;
          border-right:1px solid rgb(224, 224, 224);
          text-align: center;
          line-height: 200px;
          font-size: 18px;
          letter-spacing: 3px;
          font-weight: bold;
        }
      }
      &.fgqm{
        position: relative;
        margin-left: 33.3%;
        &::before{
          content: '';
          width: 100%;
          height: 100%;
          display: block;
          position: absolute;
          left: -100%;
          top:0;
          border-right:1px solid rgb(224, 224, 224);
          border-bottom:1px solid rgb(224, 224, 224);
        }
      }
      &.fgsj{
        position: relative;
        border-right: none;
        .el-form-item__label{
          width: 25% !important;
        }
        .el-form-item__content{
          margin-left: 25% !important;
        }
      }
      &.kzyj{
        position: relative;
        width: 66.66%;
        margin-left:33.3%;
        border-right: none;
        &::before{
          content: '县空间规划科长审查';
          width: 50%;
          height: 100%;
          display: block;
          position: absolute;
          left: -50%;
          top: 0;
          border-right:1px solid rgb(224, 224, 224);
          text-align: center;
          line-height:240px;
          font-size: 18px;
          letter-spacing: 3px;
          font-weight: bold;
        }
      }
      &.kzqm{
        position: relative;
        margin-left: 33.3%;
        border-bottom: none;
        .el-form-item__label{
          width: 28% !important;
        }
        .el-form-item__content{
          margin-left: 28% !important;
        }
        &::before{
          content: '';
          width:100%;
          height:100%;
          display: block;
          position: absolute;
          left:-100%;
          top:0;
          border-right:1px solid rgb(224, 224, 224);
        }
      }
      &.kzsj{
        position: relative;
        border-right: none;
        border-bottom: none;
        .el-form-item__label{
          width: 30% !important;
        }
        .el-form-item__content{
          margin-left: 30% !important;
        }
      }
    }
  }
}
.el-dialog__body {
  .el-form {
    .el-form-item {
      .el-input,
      .el-select,
      .el-textarea,
      .el-cascader {
        width: 100% ;
      }
    }
  }
}
.el-dialog__footer {
  .el-button {
    width: 50%;
    padding: 12px 25px;
    font-size: 15px;
  }
}
.item {
  width: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .left {
    i {
      color: #ebb318;
      font-size: larger;
    }
    span {
      &:hover {
        color: #6a89fa;
      }
    }
  }
  .right {
    i {
      margin: 0.5vw 0.3vw;
      font-size: large;
      &:hover {
        color: #6a89fa;
      }
    }
  }
  
}
</style>
