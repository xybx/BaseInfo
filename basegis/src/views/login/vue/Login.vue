<!--
 * @Author: WCL
 * @Date: 2021-11-12 13:15:00
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-11 13:22:52
 * @FilePath: \webgis\src\views\login\vue\Login.vue
 * @Description: 登录页面
-->
<template>
	<div class="login-container">
		<!-- 顶部标题 -->
		<div
			class="login-title animate__animated animate__pulse"></div>

		<!-- 右侧登录框 -->
		<div
			class="login-box animate__animated animate__pulse">
			<div class="title">系统登录</div>
			<!-- 登录表单 -->
			<el-form
				ref="form"
				:model="form"
				class="login-form"
				:rules="rules">
				<el-form-item prop="office">
					<el-select
						v-model="form.office"
						placeholder="请选择科室"
						@change="changeDept"
						filterable>
						<template slot="prefix">
							<i
								class="el-icon-office-building"></i>
						</template>
						<el-option
							v-for="item in deptList"
							:label="item.name"
							:value="item.pid"
							:key="item.pid"></el-option>
					</el-select>
				</el-form-item>

				<el-form-item prop="person">
					<el-select
						v-model="form.person"
						placeholder="请选择人员"
						no-data-text="请先选择科室"
						filterable>
						<template slot="prefix">
							<i class="el-icon-user"></i>
						</template>
						<el-option
							v-for="item in personList"
							:label="item.name"
							:value="item.pid"
							:key="item.pid"></el-option>
					</el-select>
				</el-form-item>

				<el-form-item prop="password">
					<el-input
						v-model="form.password"
						placeholder="请输入密码"
						type="password"
						prefix-icon="el-icon-unlock"
						@keyup.enter.native="
							onSubmit()
						"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button
						type="primary"
						@click="onSubmit()">
						登录
					</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
	export { default } from "../js/login";
</script>

<style scoped lang="scss">
	@import "../style/login.scss";
</style>
