<!--
 * @Author: WCL
 * @Date: 2021-11-12 13:26:04
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-21 17:26:38
 * @FilePath: \webgis\src\views\home\vue\Home.vue
 * @Description: 首页
-->
<template>
    <div class="home-container">
        <div class="header animate__animated animate__fadeInDown">
            <img src="@/assets/images/home-images/title.png" />           
        </div>
        <div class="headerRight">
        <div class="header-right">
                <span class="user">
                    欢迎您：
                    <span>{{ username }}</span>
                    <el-button
                        type="primary"
                        plain
                        size="mini"
                        @click="changePwd"
                        icon="el-icon-lock"
                        >修改密码</el-button
                    >
                    <el-button
                        type="primary"
                        plain
                        size="mini"
                        @click="logout"
                        icon="el-icon-switch-button"
                        >退出</el-button
                    >
                    
                </span>
            </div>
        </div>
        <div class="main">
            <el-row :gutter="20">
                <el-col
                    :span="4"
                    v-for="(item, index) in navList"
                    :key="index"
                    class="animate__animated animate__fadeInLeft"
                >
                <!-- :class="item.top_isauth == 1 ? '' : 'left-navs-notauth'" -->
                    <div
                        :style="{ backgroundColor: item.bgcolor }"
                        class="left-navs"
                       
                        @click="clickNav(item)"
                    >
                        <div class="icon">
                            <img :src="item.iconimg" />
                        </div>
                        <div class="content">
                            <div class="title">{{ item.title }}</div>
                            <div class="explain">{{ item.remark }}</div>
                        </div>
                        <div class="bg">
                            <img :src="item.bgimg" />
                        </div>
                    </div>
                </el-col>
                <el-col
                    :span="8"
                    class="right-navs animate__animated animate__fadeInRight"
                >
                    <div
                        v-for="(item, index) in navColList"
                        :key="index"
                        :class="item.bgcolor"
                        @click="clickNav(item)"
                    >
                        <span>{{ item.title }}</span>
                        <span>{{ item.remark }}</span>
                    </div>
                    <!-- <div
                        v-for="(item, index) in navColList"
                        :key="index"
                        :class="[
                            item.bgcolor,
                            item.top_isauth == 1 ? '' : 'left-navs-notauth',
                        ]"
                        @click="clickNav(item)"
                    >
                        <span>{{ item.title }}</span>
                        <span>{{ item.remark }}</span>
                    </div> -->
                </el-col>
            </el-row>
        </div>
        <changePwd ref="changePwd"></changePwd>
    </div>
</template>

<script>
export { default } from '../js/home';
</script>

<style scoped lang="scss">
@import '../style/home.scss';
</style>
