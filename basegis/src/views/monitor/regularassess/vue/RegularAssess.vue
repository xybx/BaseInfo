<!--
 * @Author: WCL
 * @Date: 2022-01-14 14:23:58
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-14 14:46:58
 * @FilePath: \webgis\src\views\monitor\regularassess\vue\RegularAssess.vue
 * @Description: 实施监督-定期评估
-->
<template>
	<div class="regular-container">
		<el-card class="box-card" shadow="never" ref="leftCard">
			<el-tabs v-model="activeName" @tab-click="handleTabClick">
				<el-tab-pane label="评估指标" name="1">
					<!-- 评估指标 -->
					<eval-index v-if="showTab === '1'"></eval-index>
				</el-tab-pane>
				<el-tab-pane label="2035规划指标" name="2">
					<!-- 2035规划指标 -->
					<plan-index v-if="showTab === '2'"></plan-index>
				</el-tab-pane>
				<el-tab-pane label="年度变化" name="3">
					<!-- 年度变化 -->
					<year-change v-if="showTab === '3'"></year-change>
				</el-tab-pane>
				<el-tab-pane label="生成评估成果" name="4">
					<!-- 生成评估成果 -->
					<eval-result v-if="showTab === '4'"></eval-result>
				</el-tab-pane>
			</el-tabs>
		</el-card>
	</div>
</template>

<script>
export { default } from '../js/regularassess'
</script>

<style scoped lang="scss">
@import '../style/regularassess.scss';
</style>