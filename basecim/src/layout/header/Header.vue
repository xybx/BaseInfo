<template>
    <div class="header-container">
        <div class="head-l">
            <div class="logo"></div>
            <div class="user">欢迎您：测试员</div>
        </div>
        <el-menu
            :default-active="menuStore.currFunc"
            class="head-r"
            mode="horizontal"
            @select="handleSelect"
        >
            <template v-for="item in menuList" :key="item.code">
                <template v-if="item.childList && item.childList.length > 0">
                    <el-sub-menu :index="item.code">
                        <template #title>
                            <div class="menu-box">
                                <span class="iconImg">
                                    <el-image
                                        :src="returnIconUrl(item) as any"
                                        fit="fill"
                                    ></el-image>
                                </span>
                                <div>{{ item.name }}</div>
                            </div>
                        </template>
                        <el-menu-item
                            v-for="subItem in item.childList"
                            :key="subItem.code"
                            :index="subItem.code"
                        >
                            {{ subItem.name }}
                        </el-menu-item>
                    </el-sub-menu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.code">
                        <div class="menu-box">
                            <span class="iconfont" :class="item.icon"></span>
                            <div>{{ item.name }}</div>
                        </div>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>
<script lang="ts" setup>
/* Vue 相关 */
import { ref, onMounted } from 'vue';
import useStore from '@/stores';

/* UI 相关 */
import { ElMessage } from 'element-plus';

/* API */
import { getFuncApi } from './header-api';

const { viewStore, menuStore } = useStore();

/*
    菜单点击选择
    key 为code值
*/
const handleSelect = (key: string, keyPath: string[]) => {
    menuStore.handleFunc(key);
};

/*
    菜单
    code 必须有值
*/
const menuList = ref<any>([]);

/* 获取菜单项 */
const getMenuData = async () => {
    const { data: res } = await getFuncApi();
    console.log(res, 'res');
    if (res.code !== 200) return ElMessage.warning(res.msg);
    res.data.map((obj: any) => {
        Object.assign(obj, { isShow: false });
        obj.childList?.map((subObj: any) => {
            Object.assign(subObj, { isShow: false });
        });
    });
    menuList.value = res.data;
    // 存入pinia
    menuStore.handleFuncArr(res.data);
};

// 组装图片路径
const returnIconUrl = (item: any) => {
    return window.apiResource + item.iconUrl;
};

onMounted(() => {
    getMenuData();
});
</script>
<style lang="scss" scoped>
$main-color: #2d559f;
.header-container {
    width: 100%;
    height: 80px;
    background-color: $main-color;
    display: flex;
}
.head-l {
    color: #fff;
    display: flex;
    align-items: center;
    padding-left: 22px;
    cursor: default;
    .logo {
        height: 100%;
        width: 560px;
        background: url('../../assets/images/logo.png') no-repeat center;
        background-size: contain;
    }
    .user {
        font-size: 16px;
        margin-left: 36px;
    }
}
:deep(.head-r) {
    flex: 1;
    justify-content: flex-end;
    padding-right: 10px;
    background-color: $main-color;
    border: 0;
    .el-menu-item {
        color: #fff;
        padding: 0 30px;
    }
    .iconfont {
        font-size: 30px;
    }
    .iconImg {
        width: 35px;
        margin-bottom: 10px;
        line-height: 1;
    }
    .menu-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 25px 0;
        color: #fff;
        > div {
            line-height: 1;
        }
    }
    .el-sub-menu__icon-arrow {
        display: none;
    }
    .el-sub-menu__title {
        padding: 0 30px;
    }
    .el-menu-item:not(.is-disabled):hover,
    .el-menu-item:not(.is-disabled):focus,
    .el-sub-menu .el-sub-menu__title:hover {
        background-color: #5075b9;
    }
}
</style>
