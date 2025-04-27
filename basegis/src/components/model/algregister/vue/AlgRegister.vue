<!--
 * @Author: WCL
 * @Date: 2022-01-13 10:07:07
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-19 16:23:02
 * @FilePath: \webgis\src\components\model\custmodel\vue\CustModel.vue
 * @Description: 模型管理-定制模型
-->
<template>
  <div class="custmodel-container">
    <!-- <div class="title">
      算法列表
    </div> -->
    <el-form ref="searchform" :inline="true" style="padding-bottom: 10px;">
      <el-input v-model="searchkey" size="small" placeholder="算法名称" style="width: 400px;" clearable @clear="InputClear">
      </el-input><el-button type="primary" @click="onSearch" size="small">立即搜索</el-button>
      <el-button type="primary" size="mini" @click="addSL" style="right: 30px;position: absolute;">新增算法</el-button>
    </el-form>
    <div class="table-box">
      <el-table :data="mxTableData" stripe border :default-sort="{ prop: 'pid', order: 'descending' }" v-loading="loading"
        element-loading-text="数据加载中" element-loading-spinner="el-icon-loading">
        <el-table-column prop="PID" label="序号" align="center" width="100">
        </el-table-column>
        <el-table-column prop="NAME" label="算法名称" align="center" width="300">
        </el-table-column>
        <el-table-column prop="CALCTYPEDESC" label="算法类型" align="center" width="300">
          <template v-slot="scope">
            {{ scope.row.CALCTYPE }}:{{ scope.row.CALCTYPEDESC }}</template>
        </el-table-column>
        <el-table-column prop="REMARK" label="算法说明" align="center">
        </el-table-column>
        <el-table-column label="操作" align="center" width="300">
          <template v-slot="scope">
            <el-button type="primary" size="mini" plain @click="handleEdit(scope.row)">编辑</el-button>
            <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" icon="el-icon-info" icon-color="#f56c6c"
              title="确定删除此条数据吗?" @confirm="confirmDel(scope.$index, scope.row)">
              <el-button slot="reference" type="danger" size="mini" plain class="del-btn">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page.sync="currentPage" :page-size="pagesize" :page-sizes="pagesizeArr"
      layout="total, sizes, prev, pager, next, jumper" :total="tableTotal">
    </el-pagination>

    <!--指标计算参数配置弹框-->
    <el-dialog title="算法配置" :visible.sync="SLVisible" width="40%" custom-class="addSLdialog" @close="closeSL"
      :close-on-click-modal="false" v-dialogDrag>
      <el-form ref="setForm" :model="setForm" label-width="auto" class="set-form" :rules="setFormRules">
        <el-form-item label="算法名称" prop="NAME" >
          <el-input v-model.trim="setForm.NAME" placeholder="请输入算法名称"></el-input>
          <!-- <span style="color: #bbb8b8; line-height: 20px">
            <div>相交：计算参数有效配置为2条计算参数；</div>
            <div>
              占比：计算参数有效配置为2条计算参数,关键参数，辅助参数各1条数据；
            </div>
            <div>求和：计算参数有效配置为1条计算参数；</div>
          </span> -->
        </el-form-item>
        <el-form-item label="计算类型" prop="CALCTYPE">
          <el-select v-model="setForm.CALCTYPE" placeholder="请选择计算类型" size="small" clearable>
            <el-option v-for="item in calcTypes" :label="item.DICTNAME" :value="item.DICTVALUE" :key="item.PID">
            </el-option>
          </el-select>
          <!-- <el-input v-model.trim="setForm.CALCTYPE"></el-input> -->
        </el-form-item>

        <el-form-item label="算法说明" prop="REMARK">
          <el-input type="textarea" v-model.trim="setForm.REMARK" placeholder="请输入算法说明"></el-input>
        </el-form-item>
        <el-form-item label="计算参数配置" prop="PARAMS">

          <el-form ref="setParamForm" :model="ParamForm" label-width="auto" class="set-form" :rules="ParamFormRules">
            <el-input style="width:200px;" placeholder="参数名称" v-model="ParamForm.name"></el-input>
            <el-select v-if="setForm.CALCTYPE == 'intersectrate'" v-model="ParamForm.attr"
              style="width:200px;padding-left: 5px;" placeholder="选择参数属性" size="small" clearable>
              <el-option label="占比例参数" value="1">
              </el-option>
              <el-option label="被占比总数值参数" value="0">
              </el-option>
            </el-select>
            <el-input style="width:250px;padding-left: 5px;" placeholder="参数说明" v-model="ParamForm.desc"></el-input>
            <el-button size="mini" style="margin-left: 10px;" type="primary" @click="addParams">添加</el-button>
          </el-form>

          <el-table :data="ParamDatas" border stripe max-height="400">
            <el-table-column label="参数名称" prop="name" align="center"></el-table-column>
            <el-table-column label="参数属性" prop="attrdesc" align="center"></el-table-column>
            <el-table-column label="参数说明" prop="desc" align="center">
            </el-table-column>
            <el-table-column label="操作" align="center" min-width="80">
              <template v-slot="scope">
                <el-button size="mini" type="danger" plain @click="DeleteParam(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button style="margin-left: 10px;" type="primary" @click="saveSL">添加</el-button>
        <el-button type="info" @click="SLVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getList,
  saveAlg,
  getcalcTypeList,
  deleteAlg,
} from "../api/custmodel-api";
export default {
  name: "",
  props: {},
  components: {},
  data() {
    return {
      calcTypes: [],
      searchkey: '',
      ZBLISTData: [],
      ZBLISTVisible: false,
      selectZBData: [],
      mxTableData: [],
      SLVisible: false,
      LogVisible: false,
      setForm: {
        PID: 0,
        NAME: '',
        CALCTYPE: '',
        STATUS: 1,
        PARAMS: '',
        REMARK: ''
      },

      setFormRules: {
        CALCTYPE: [
          {
            required: true,
            message: "请选择算法类型",
            trigger: "change",
          },
        ],
        NAME: [
          {
            required: true,
            message: "名称不能为空",
            trigger: "blur",
          },
        ],
      },
      ParamDatas: [],
      ParamForm: {
        name: '',
        desc: '',
        attr: '',
        attrdesc: ''
      },
      ParamFormRules: {
        name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ]
      },
      loading: true,
      // 模型列表分页
      currentPage: 1,
      pagesize: 10,
      pagesizeArr: [10, 20, 50, 100],
      tableTotal: 0,
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    this.getMXTable();
  },
  methods: {

    onSearch() {
      this.getMXTable();
    },
    //清空搜索框
    InputClear() {
      this.getMXTable();
    },
    // 获取数据源列表
    async getMXTable() {
      let params = {
        keyword: this.searchkey,
        currentpage: this.currentPage,
        pagesize: this.pagesize,
      };
      const { data: res } = await getList(params);
      if (res.code === 1) {
        this.mxTableData = res.data.datas;
        this.tableTotal = res.data.total;
        this.loading = false;
      } else {
        this.$message.warning(res.msg);
      }
    },

    //获取计算类型
    async getcalcTypes() {
      const { data: res } = await getcalcTypeList();
      if (res.code == 1) {
        this.calcTypes = res.data;
      }
    },

    // 新增矢量模型
    addSL() {
      this.SLVisible = true;
      this.ParamDatas = [];
      this.getcalcTypes();
    },

    // 关闭矢量模型弹窗
    closeSL() {
      this.setForm = this.$options.data().setForm;
      this.$refs.setForm.resetFields();
      console.log("关闭");
    },

    //添加参数
    addParams() {
      debugger;
      if (!this.ParamForm.name) {
        return this.$message.error("请输入参数名称");
      }
      if (this.setForm.CALCTYPE == "intersectrate" && !this.ParamForm.attr) {
        return this.$message.error("请选择参数属性");
      }
      let attrdesc = "无";
      if (this.ParamForm.attr == '1' && this.setForm.CALCTYPE == "intersectrate") {
        attrdesc = "占比例参数";
      }
      else if (this.ParamForm.attr == '0' && this.setForm.CALCTYPE == "intersectrate") {
        attrdesc = "被占比总数值参数";
      }
      this.ParamDatas.push({ name: this.ParamForm.name, desc: this.ParamForm.desc, attr: this.ParamForm.attr, attrdesc: attrdesc });
      this.$refs.setParamForm.resetFields();
    },
    //删除参数
    DeleteParam(row) {
      this.ParamDatas.splice(this.ParamDatas.indexOf(row), 1);
    },
    // 保存算法
    saveSL() {
      this.$refs.setForm.validate(async (valid) => {
        if (!valid) return this.$message.error("请补充必填项");
        this.setForm.PARAMS = JSON.stringify(this.ParamDatas);
        const { data: res } = await saveAlg(this.setForm);
        if (res.code === 1) {
          this.$message.success("成功");
          this.SLVisible = false;
          this.getMXTable();
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    // 编辑矢量/数值型
    async handleEdit(row) {
      this.SLVisible = true;
      this.setForm = row;
      this.ParamDatas = JSON.parse(this.setForm.PARAMS);
    },

    // 删除
    async confirmDel(index, row) {
      console.log(index, row);
      let params = {
        pid: row.PID,
      };
      const { data: res } = await deleteAlg(params);
      if (res.code === 1) {
        this.$message.success("删除成功");
        this.getMXTable();
      } else {
        this.$message.error(res.msg);
      }
    },



    //选中当前行
    handleCurrentChange(val) {
      this.currentRow = val;
    },

    // 模型列表显示个数选择
    handleSizeChange(val) {
      this.pagesize = val;
      this.getMXTable();
    },

    // 模型列表当前页选择
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getMXTable();
    },

    // 模型列表当前页选择
    handleZBCurrentChange(val) {
      console.log(val);
      this.getZBTable(this.SLForm.modeltype);
    },
  },
};

</script>

<style scoped lang="scss">
@import '../style/AlgRegister.scss';
</style>
