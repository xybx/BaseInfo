<!--
 * @Author: WCL
 * @Date: 2021-11-16 09:23:01
 * @LastEditors: WCL
 * @LastEditTime: 2022-02-16 11:50:32
 * @FilePath: \webgis\src\layout\index\vue\Index.vue
 * @Description: Layout 布局
-->
<template>
	<div class="layout-container">
		<el-container>
			<el-header class="header-box" id="headerBox">
				<!-- header组件 -->
				<Header></Header>
			</el-header>
			<el-main>
				<router-view></router-view>
			</el-main>
		</el-container>
	</div>
</template>

<script>
export { default } from '../js/index'
</script>

<style scoped lang="scss">
@import '../style/index.scss';
</style>