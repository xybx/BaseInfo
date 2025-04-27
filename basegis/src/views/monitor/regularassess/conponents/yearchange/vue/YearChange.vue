<!--
 * @Author: WCL
 * @Date: 2022-01-14 14:44:37
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-17 15:03:58
 * @FilePath: \webgis\src\views\monitor\regularassess\conponents\yearchange\vue\YearChange.vue
 * @Description: 实施监督-定期评估-年度变化
-->
<template>
	<div class="yearchange-container" ref="yearBox" v-loading="tableLoading" element-loading-text="表格数据加载中"
		element-loading-background="#fff">
		<el-table :data="tableData" :span-method="objectSpanMethod" border stripe style="width: 100%; margin-top: 20px"
			:cell-style="txtCenter" :header-cell-style="txtCenter" ref="yearTable" class="yearTable" size="small">
			<el-table-column prop="ONETYPENAME" label="一级分类" width="180" align="center">
			</el-table-column>
			<el-table-column prop="TWOTYPENAME" label="二级分类" align="ceter">
			</el-table-column>
			<el-table-column prop="ZBCODE" label="编号" align="center">
			</el-table-column>
			<el-table-column prop="ZBNAME" label="指标项(单位)" align="center">
			</el-table-column>
			<el-table-column prop="GHVALUE" label="规划值" align="center">
			</el-table-column>
			<el-table-column align="center" v-for="(item, index) in yearsArr" :key="index">
				<template slot="header" slot-scope="scope">
					{{ item }}年现状
					<el-tooltip class="item" effect="dark" :content="`${item}年现状`" placement="top">
						<i class="el-icon-warning-outline"></i>
					</el-tooltip>
				</template>
				<template slot-scope="scope">
					<span v-if="index === 0" class="zb-year">
						{{ scope.row.ONEYEARVALUE }}
						<i class="icon" :class="Number(scope.row.ONEYEARVALUE) >
								Number(scope.row.GHVALUE)
								? 'up-arrows'
								: 'down-arrows'
							" v-if="scope.row.GHVALUE && scope.row.ONEYEARVALUE"></i>
					</span>
					<span v-if="index === 1" class="zb-year">
						{{ scope.row.TWOYEARVALUE }}
						<i class="icon" :class="Number(scope.row.TWOYEARVALUE) >
								Number(scope.row.GHVALUE)
								? 'up-arrows'
								: 'down-arrows'
							" v-if="scope.row.GHVALUE && scope.row.TWOYEARVALUE"></i>
					</span>
					<span v-if="index === 2" class="zb-year">
						{{ scope.row.THREEYEARVALUE }}
						<i class="icon" :class="Number(scope.row.THREEYEARVALUE) >
								Number(scope.row.GHVALUE)
								? 'up-arrows'
								: 'down-arrows'
							" v-if="scope.row.GHVALUE && scope.row.THREEYEARVALUE"></i>
					</span>
					<span v-if="index === 3" class="zb-year">
						{{ scope.row.FOURYEARVALUE }}
						<i class="icon" :class="Number(scope.row.FOURYEARVALUE) >
								Number(scope.row.GHVALUE)
								? 'up-arrows'
								: 'down-arrows'
							" v-if="scope.row.GHVALUE && scope.row.FOURYEARVALUE"></i>
					</span>
					<span v-if="index === 4" class="zb-year">
						{{ scope.row.FIVEYEARVALUE }}
						<i class="icon" :class="Number(scope.row.FIVEYEARVALUE) >
								Number(scope.row.GHVALUE)
								? 'up-arrows'
								: 'down-arrows'
							" v-if="scope.row.GHVALUE && scope.row.FIVEYEARVALUE"></i>
					</span>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
export { default } from '../js/yearchange'
</script>

<style scoped lang="scss">
@import '../style/yearchange.scss';
</style>