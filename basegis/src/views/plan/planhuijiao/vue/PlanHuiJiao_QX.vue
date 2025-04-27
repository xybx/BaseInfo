<template>
  <div class="warpbox">
    <div class="admin-container" v-show="!dialogVisible">
      <div v-if="activeIndex == 1" class="headerbox animate__animated animate__fadeIn">
          <el-button type="primary" icon="el-icon-circle-plus" plain @click="addClick">新建</el-button>
          <!--<el-button type="danger" icon="el-icon-delete-solid" plain @click="delClick">批量删除</el-button>-->
      </div>
      <div class="table-contain animate__animated animate__fadeIn">
        <el-table v-loading="tabloading" :data="tableData" border tooltip-effect="dark" element-loading-background="rgba(255, 255, 255, 1)" :element-loading-text="loadingText" @row-click="handleRow">
          <el-table-column type="index" label="序号" align="center" width="60px"></el-table-column>
          <el-table-column v-for="item in tableColumns" :key="item.prop" align="center" show-overflow-tooltip :label="item.label">
            <template #default="{row, $index}">
              <template v-if="item.prop == 'status'">
                <el-tag :type="row[item.prop] == 0 ? 'danger' : row[item.prop] == 1 ? 'primary': row[item.prop] == 2 ? 'success' : row[item.prop] == 3 ? 'warning' : 'info'">
                  {{row[item.prop] == 0 ? '被停止': row[item.prop] == 1 ? '办理中' : row[item.prop] == 2 ? '已办结': row[item.prop] == 3 ? '被删除': row[item.prop] == 4 ? '补正' : '退件' }}
                </el-tag>
              </template>
              <template v-else-if="item.prop == 'createTime'">
                {{ row[item.prop] | getTimes }}
              </template>
              <template v-else>
                {{ row[item.prop] ? row[item.prop] : '暂无数据' }}
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div class="footerbox">
          <dl class="plist">
            <dt>注：</dt>
            <dd v-for="item in remarkData" :key="item">{{item}}</dd>
          </dl>
          <el-pagination class="pagebox" background :current-page="pageNo" :page-size="pageSize" :page-sizes="pageSizes" :layout="layout" :total="total" @size-change="SizeChange" @current-change="CurrentChange"></el-pagination>
        </div>
      </div>
    </div>
    <!-- 详情页 -->
    <PlanHuijiaoQx v-if="dialogVisible" @closeDialog="closeDialog" :activeIndex="activeIndex" :dialogVisible="dialogVisible" :rowValue="rowValue" />
    <!-- 新增页 -->
    <PlanAddQX ref="addqx" @getData="getDealtList" />
  </div>
</template>

<script>
export { default } from "../js/planhuijiao_qx.js";
</script>
<style scoped lang="scss">
@import "../style/planhuijiao.scss";
</style>