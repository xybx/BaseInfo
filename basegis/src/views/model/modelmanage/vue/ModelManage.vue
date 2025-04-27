<!--
 * @Author: WCL
 * @Date: 2022-01-13 09:37:10
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-13 10:09:54
 * @FilePath: \webgis\src\views\model\modelmanage\vue\ModelManage.vue
 * @Description: 指标模型-模型管理
-->
<template>
	<div class="modelmanage-container">
		<div class="table-contain animate__animated ">
			<div class="left-menu">
				<el-menu :default-active="activeIndex" class="el-menu-vertical-demo" mode="vertical" @select="handleSelect">
					<el-menu-item :index="item.id" v-for="(item, index) in modelRadioData" :key="index" :label="item.label">
						<i :class="item.icon"></i>
						{{
							item.label
						}}</el-menu-item>
				</el-menu>
			</div>
			<div class="right-table">
				<div class="manage-inbox">
					<div class="content">
						<basic-model v-if="activeIndex === '1'"></basic-model>
						<meta-data v-else-if="activeIndex === '2'"></meta-data>
						<Alg-Register v-else-if="activeIndex === '4'"></Alg-Register>
						<cust-model v-else-if="activeIndex==='3'"></cust-model>
						<space-model v-else="activeIndex==='5'"></space-model>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export { default } from '../js/modelmanage'
</script>

<style scoped lang="scss">
@import '../style/modelmanage.scss';
</style>