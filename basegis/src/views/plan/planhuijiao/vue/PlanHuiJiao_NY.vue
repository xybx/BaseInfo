<!--
 * @Author: WCL
 * @Date: 2021-12-22 11:02:29
 * @LastEditors: WCL
 * @LastEditTime: 2023-01-04 14:37:44
 * @FilePath: \webgis\src\views\plan\planhuijiao\vue\PlanHuiJiao_NY.vue
 * @Description: 规划审查-数据汇交(宁远)
-->
<template>
  <div class="admin-container">
    <div class="animate__animated animate__fadeIn">
      <el-form
        ref="searchform"
        :model="searchform"
        :inline="true"
        style="float: left"
      >
        <el-form-item label="规划类型">
          <el-select
            v-model="searchform.ghtype"
            placeholder="请选择规划类型"
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
        <el-form-item label="规划名称">
          <el-input
            v-model="searchform.keywords"
            size="small"
            placeholder="请输入规划名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" size="small"
            >开始搜索</el-button
          >
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        style="float: right"
        size="small"
        @click="addItem"
        >上传汇交</el-button
      >
    </div>
    <div class="table-contain animate__animated animate__fadeIn">
      <el-table
        :data="tableData"
        border
        stripe
        :default-sort="{
          prop: 'PID',
          order: 'descending',
        }"
        v-loading="loading"
        size="small"
      >
        <el-table-column
          prop="PID"
          label="序号"
          min-width="80"
          align="center"
        ></el-table-column>
        <el-table-column prop="PLANTYPE" label="规划类型" align="center">
          <template v-slot="scope">
            <div v-if="scope.row.PLANTYPE == '1'">总体规划</div>
            <div v-else-if="scope.row.PLANTYPE == '2'">专项规划</div>
            <div v-else>详细规划</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="NAME"
          label="规划名称"
          min-width="200"
          align="center"
        >
          <template v-slot="scope">
            <el-input
              v-model.trim="scope.row.NAME"
              size="small"
              v-if="scope.row.isread"
              ref="stage"
            >
              <el-button
                slot="append"
                size="small"
                type="primary"
                @click="changeStageName(scope.row)"
                >保存
              </el-button>
            </el-input>

            <span v-else>{{ scope.row.NAME }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="YEARSTART" label="规划起始年" align="center">
        </el-table-column>
        <el-table-column prop="YEARSTANDARD" label="近期目标年" align="center">
        </el-table-column>

        <el-table-column prop="YEARTARGET" label="远景目标年" align="center">
        </el-table-column>
        <el-table-column
          prop="STATUS"
          min-width="200"
          label="汇交状态"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="350"
          align="center"
          class-name="handle-col"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="success"
              v-if="scope.row.STATUS!=null && !scope.row.STATUS.includes('成功')"
              @click="updateStatus(scope.row)"
              >更新状态</el-button
            >
            <el-button
              size="mini"
              type="danger"
              v-if="scope.row.STATUS!=null && !scope.row.STATUS.includes('成功')"
              @click="handleReupload(scope.row)"
              >断点续传</el-button
            >
            <el-button
              size="mini"
              type="primary"
              v-if="scope.row.STATUS!=null && scope.row.STATUS.includes('成功')"
              @click="handleDownload(scope.row)"
              >下载文件
            </el-button>
            <el-upload
              class="upload-pf"
              action="#"
              :show-file-list="false"
              :http-request="handleReply"
              accept=".zip"
            >
              <el-button
                size="small"
                type="warning"
                v-if="!scope.row.REPLY || !scope.row.REPLY.includes('成功')"
                @click="setFocusReply(scope.row)"
                >批复文件上传</el-button
              >
            </el-upload>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="pagesize"
        :page-sizes="pagesizeArr"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableTotal"
        background
      >
      </el-pagination>
    </div>

    <!-- 添加/修改项目 -->
    <el-dialog
      :title="addTitle"
      :visible.sync="dialogAddItem"
      width="37%"
      class="add-dialog"
      @closed="closeAddDialog"
      v-dialogDrag
      :close-on-click-modal="false"
    >
      <el-form
        v-loading="isShowLoading"
        element-loading-text="正在上传文件,请耐心等待......"
        :model="addForm"
        :rules="addFormRule"
        ref="addFormRef"
        label-width="auto"
        :inline="true"
      >
        <el-form-item label="行政区代码" prop="areaCode">
          <el-input
            v-model.trim="addForm.areaCode"
            autocomplete="off"
            size="small"
            placeholder="请输入行政区代码"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="行政区名称" prop="areaName">
          <el-input
            v-model.trim="addForm.areaName"
            autocomplete="off"
            size="small"
            placeholder="请输入行政区名称"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="规划类型" prop="planType">
          <el-select
            v-model="addForm.planType"
            placeholder="请选择规划类型"
            size="small"
          >
            <el-option
              v-for="item in regionData"
              :label="item.TYPENAME"
              :value="String(item.ID)"
              :key="item.ID"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规划名称" prop="name">
          <el-input
            v-model.trim="addForm.name"
            autocomplete="off"
            size="small"
            placeholder="请输入规划名称"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="规划起始年" prop="yearStart">
          <el-date-picker
            v-model="addForm.yearStart"
            type="year"
            value-format="yyyy"
            placeholder="请选择规划起始年"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="近期目标年" prop="yearStandard">
          <el-date-picker
            v-model="addForm.yearStandard"
            type="year"
            value-format="yyyy"
            placeholder="请选择近期目标年"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="远景目标年" prop="yearTarget">
          <el-date-picker
            v-model="addForm.yearTarget"
            type="year"
            value-format="yyyy"
            placeholder="请选择远景目标年"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="矢量数据格式" prop="vectorType">
          <el-select
            v-model="addForm.vectorType"
            placeholder="请选择数据类型"
            size="small"
          >
            <el-option
              v-for="item in vectorData"
              :label="item.TYPENAME"
              :value="String(item.ID)"
              :key="item.ID"
            ></el-option>
          </el-select>
        </el-form-item>
        <div class="dialog-footer">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            :http-request="uploadLeader"
            accept=".zip"
          >
            <el-button size="small" type="primary">上传文件</el-button>
          </el-upload>
          <el-button type="primary" @click="closeAddDialog" size="small">
            取消
          </el-button>
        </div>
      </el-form>
      <!-- 
            <br />
            上传状态 ： <br />
            申请接入标识 >> 成果包分片 >> 分片上传 >> 检查分片上传 >>
            批复文件上传 >> 汇交完成 -->
    </el-dialog>
  </div>
</template>

<script>
export { default } from "../js/planhuijiao_ny.js";
</script>

<style scoped lang="scss">
@import "../style/planhuijiao.scss";
</style>
