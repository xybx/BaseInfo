<template>
    <div class="layout-container">
        <layout-header v-if="showPage" />
        <div class="layout-main">
            <router-view v-if="showPage" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import LayoutHeader from '../header/Header.vue';
import { RouterView } from 'vue-router';
/* Vue 相关 */
import { ref, onMounted, toRaw, nextTick, onBeforeMount } from 'vue';
/* UI 相关 */
import { ElMessage } from 'element-plus';
/* 接口API */
import { loginApi } from '@/views/home/home-api';

const showPage = ref<boolean>(false);
/* 登录（暂时使用） */
const handleLogin = async () => {
    let data = {
        userName: window.userInfo.userName,
        password: window.userInfo.password,
    };

    const { data: res } = await loginApi(data);
    console.log(res, 'loginres');

    debugger;
    if (res.code !== 200) return ElMessage.warning(res.msg);
    sessionStorage.setItem('23vUser', JSON.stringify(res.data));
    showPage.value = true;
};

onBeforeMount(async () => {
    await handleLogin();
});
</script>

<style lang="scss" scoped>
.layout-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}
.layout-main {
    flex: 1;
}
</style>
