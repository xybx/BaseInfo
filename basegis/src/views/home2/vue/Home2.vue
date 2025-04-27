<!--
 * @Author: WCL
 * @Date: 2022-03-11 15:18:33
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-14 11:06:15
 * @FilePath: \webgis\src\views\home2\vue\Home2.vue
 * @Description: 导航页2
-->
<template>
	<div class="home-container">
		<div class="home-user">
			<span class="user">
				欢迎您：
				<span>{{ username }}</span>
				<el-button
					type="text"
					size="mini"
					@click="logout"
					icon="el-icon-switch-button"
					>退出</el-button
				>
			</span>
		</div>

		<div class="main">
			<div class="home-title"></div>
			<div class="nav-box">
				<div
					class="nav-item"
					v-for="(item, index) in navList"
					:key="index"
					:style="{ backgroundImage: `url(${item.bgimg})` }"
					@click="clickNav(item)"
				>
					<div class="nav-icon">
						<img :src="item.iconimg" />
					</div>
					<div class="nav-title">{{ item.title }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export { default } from '../js/home2'
</script>

<style scoped lang="scss">
@import '../style/home2.scss';
</style>