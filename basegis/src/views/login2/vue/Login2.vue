<!--
 * @Author: WCL
 * @Date: 2022-03-11 11:30:23
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-11 14:46:27
 * @FilePath: \webgis\src\views\login2\vue\Login2.vue
 * @Description: 登录页风格2
-->
<template>
	<div class="login-container">
		<div class="left-title"></div>
		<div class="login-box">
			<div class="right-title"></div>
			<div class="right-login">
				<div class="login-form-title">
					<div>登录账号</div>
					<div class="title-english">LOGIN ACCOUNT</div>
				</div>
				<!-- 登录表单 -->
				<el-form
					ref="form"
					:model="form"
					class="login-form"
					:rules="rules"
				>
					<el-form-item prop="office">
						<el-select
							v-model="form.office"
							placeholder="请选择科室"
							@change="changeDept"
							filterable
						>
							<template slot="prefix">
								<i class="el-icon-office-building"></i>
							</template>
							<el-option
								v-for="item in deptList"
								:label="item.name"
								:value="item.pid"
								:key="item.pid"
							></el-option>
						</el-select>
					</el-form-item>

					<el-form-item prop="person">
						<el-select
							v-model="form.person"
							placeholder="请选择人员"
							no-data-text="请先选择科室"
							filterable
						>
							<template slot="prefix">
								<i class="el-icon-user"></i>
							</template>
							<el-option
								v-for="item in personList"
								:label="item.name"
								:value="item.pid"
								:key="item.pid"
							></el-option>
						</el-select>
					</el-form-item>

					<el-form-item prop="password">
						<el-input
							v-model="form.password"
							placeholder="请输入密码"
							type="password"
							prefix-icon="el-icon-unlock"
							@keyup.enter.native="onSubmit()"
						></el-input>
					</el-form-item>
					<el-form-item class="login-form-item">
						<el-button type="primary" @click="onSubmit()">
							登录
						</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>
	</div>
</template>

<script>
export { default } from '../../login/js/login'
</script>

<style scoped lang="scss">
@import '../style/login2.scss';
</style>