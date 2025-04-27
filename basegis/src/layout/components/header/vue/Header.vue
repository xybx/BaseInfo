<!--
 * @Author: WCL
 * @Date: 2021-11-16 09:14:22
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-24 17:24:46
 * @FilePath: \webgis\src\layout\components\header\vue\Header.vue
 * @Description: Layout布局顶部菜单
-->
<template>
    <div class="header">
        <div class="header-left animate__animated animate__fadeInDown">
            <div class="logo">
                <img
                    src="@/assets/images/layout-images/logo.png"
                    alt=""
                    @click="clicktitle()"
                />
            </div>
            <div class="tips">
                <span class="tips-head">{{ this.$route.meta.title }}</span>
                <span class="time">{{ nowDate }}</span>
                <span class="user-name">
                    欢迎您：
                    <el-dropdown
                        @command="clickDrop"
                        size="small"
                        placement="bottom"
                    >
                        <span class="el-dropdown-link">
                            {{ username }}
                            <i class="el-icon-arrow-down"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item
                                v-for="(item, index) in perMenu"
                                :key="index"
                                :command="item.command"
                            >
                                {{ item.text }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>

                    <el-button
                        class="dev-center"
                        @click="handleDev"
                        round
                        v-if="showOPSBtn"
                        >运维中心</el-button
                    >
                </span>
            </div>
        </div>
        <div class="header-right animate__animated animate__fadeInDown">
            <el-menu
                :default-active="activeIndex"
                mode="horizontal"
                background-color="#2d559f"
                text-color="#fff"
                active-text-color="#409eff"
                ref="elMenu"
            >
                <template v-for="(item, index) in menuData">
                    <template v-if="item.children">
                        <el-submenu
                            :index="
                                item.path == 'onemap' ||
                                item.path == 'szxcmapindex'
                                    ? '/' + item.id
                                    : '/' + item.path
                            "
                            :key="index"
                            class="subItem"
                        >
                            <template #title>
                                <i class="iconfont" :class="item.icon"></i>
                                {{ item.title }}
                            </template>
                            <el-menu-item
                                v-for="(subItem, subIndex) in item.children"
                                :key="subIndex"
                                :index="
                                    subItem.path == 'onemap' ||
                                    subItem.path == 'szxcmapindex'
                                        ? '/' + subItem.id
                                        : '/' + subItem.path
                                "
                                @click="clickMenuItem(subItem)"
                            >
                                {{ subItem.title }}
                            </el-menu-item>
                        </el-submenu>
                    </template>
                    <el-menu-item
                        :key="item.id"
                        v-else
                        :index="
                            item.path == 'onemap' || item.path == 'szxcmapindex'
                                ? '/' + item.id
                                : '/' + item.path
                        "
                        @click="clickMenuItem(item)"
                    >
                        <template #title>
                            <i class="iconfont" :class="item.icon"></i>
                            <span slot="title">{{ item.title }}</span>
                        </template>
                    </el-menu-item>
                </template>
            </el-menu>
        </div>
    </div>
</template>

<script>
export { default } from '../js/header';
</script>

<style scoped lang="scss">
@import '../style/header.scss';
</style>
