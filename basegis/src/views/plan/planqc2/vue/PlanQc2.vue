<!--
 * @Author: WCL
 * @Date: 2022-03-14 15:53:27
 * @LastEditors: LJX
 * @LastEditTime: 2022-03-24 09:44:19
 * @FilePath: \webgis\src\views\plan\planqc2\vue\PlanQc2.vue
 * @Description: 规划成果质检2
-->
<template>
  <el-container>
    <el-aside>
      <div class="form-box">
        <el-form ref="form" :model="form" label-width="auto">
          <el-form-item label="规划类型">
            <el-select v-model="form.type" placeholder="请选择规划类型">
              <el-option
                v-for="item in regionData"
                :label="item.TYPENAME"
                :value="item.ID"
                :key="item.ID"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="规划名称">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
        </el-form>
        <div class="search-box">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>
      <div class="left-table-box">
        <el-table
          :data="leftTable"
          border
          size="small"
          row-key="SEQID"
          ref="multipleTable"
          highlight-current-row
          default-expand-all
          :tree-props="{ children: 'CHILDREN' }"
          @row-click="leftTableClick"
          stripe
        >
          <el-table-column
            prop="NAME"
            label="项目名称"
            align="center"
            min-width="150"
          >
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template v-slot="scope">
              <el-button
                plain
                type="primary"
                v-if="scope.row.LEVEL == 'jd'"
                @click="handleSC(scope.row)"
                >审查结论</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-aside>
    <el-main>
      <!-- 地图 -->
      <CommonMap2D
        :modulename="modulename"
        :layer="currentLayer"
        :funType="funType"
        :Geo="currentGeo"
      ></CommonMap2D>
      <el-dialog
        title="成果数据列表"
        :visible.sync="treeVisible"
        :modal="false"
        :close-on-click-modal="false"
        custom-class="ledger"
        v-if="treeVisible"
        v-dialogDrag
      >
        <div class="tree-box">
          <el-tree
            :data="treeData"
            :props="treeProps"
            empty-text="暂无数据"
            @node-click="treeNodeClick"
          >
            <span slot-scope="scope">
              <svg class="icon" aria-hidden="true">
                <use
                  :xlink:href="
                    scope.data.FILETYPE == 1
                      ? '#icon-wenjianjia'
                      : '#icon-wenjian'
                  "
                ></use>
              </svg>
              {{ scope.data.LABEL }}
            </span>
          </el-tree>
        </div>
      </el-dialog>

      <el-dialog
        title="问题图斑"
        :visible.sync="resVisible"
        :modal="false"
        :close-on-click-modal="false"
        custom-class="res-dialog"
        v-if="resVisible"
        v-dialogDrag
      >
        <div class="tips">
          <div>
            <span class="tips-head">总面积</span>
            <span>{{ resArea.toFixed(3) }}公顷</span>
          </div>
          <div>
            <span class="tips-head">个数</span>
            <span>{{ resCount }}</span>
          </div>
        </div>

        <el-table
          :data="resultTable"
          border
          stripe
          size="small"
          v-loading="Loading"
          element-loading-text="结果加载中"
          element-loading-spinner="el-icon-loading"
        >
          <el-table-column prop="prjid" label="项目ID" align="center">
          </el-table-column>
          <el-table-column prop="reason" label="错误原因" align="center">
          </el-table-column>
           <el-table-column prop="area" label="错误面积" align="center">
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template v-slot="scope">
              <el-button
                type="text"
                icon="el-icon-location-information"
                @click="location(scope.row)"
                >定位</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>
export { default } from "../js/planqc2.js";
</script>

<style scoped lang="scss">
@import "../style/planqc2.scss";
</style>
