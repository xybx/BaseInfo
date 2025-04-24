<template>
    <div
        class="tool-bar"
        :class="menuStore.layerIsShow ? '' : 'tool-transform'"
    >
        <el-dialog
            v-model="locateVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-basemap"
            @close="closeLocate(formRef)"
        >
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">场景书签</span>
                    <el-popover
                        placement="bottom-start"
                        :width="200"
                        trigger="hover"
                        content="注意事项文本占位"
                    >
                        <template #reference>
                            <i class="iconfont icon-shuxing"></i>
                        </template>
                    </el-popover>
                </span>
            </template>
            <div class="tool-main">
                <el-form
                    :model="form"
                    ref="formRef"
                    :rules="formRules"
                    hide-required-asterisk
                >
                    <el-form-item prop="name">
                        <el-input
                            v-model="form.name"
                            placeholder="请输入场景名称"
                            clearable
                        />
                    </el-form-item>

                    <el-button type="primary" @click="handleAdd(formRef)"
                        >添加</el-button
                    >
                </el-form>
                <div class="mark-box">
                    <div
                        class="mark-item"
                        v-for="item in markList"
                        :key="item.pid"
                    >
                        <el-image
                            :src="item.imgdata"
                            fit="fill"
                            @click="handleClick(item)"
                        ></el-image>
                        <div class="mark-bottom">
                            <span
                                class="mark-label"
                                @click="handleClick(item)"
                                >{{ item.name }}</span
                            >
                            <i
                                class="iconfont icon-shanchu"
                                @click="handleDel(item)"
                            ></i>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, reactive, watch, toRaw, onMounted } from 'vue';
import useStore from '@/stores';

/* UI 相关 */
import {
    ElMessage,
    type FormInstance,
    type FormRules,
    ElMessageBox,
} from 'element-plus';

/* API */
import { getMarkList, saveMark, deleteMark } from './scenemark-api';

const { menuStore, viewStore, mapStore } = useStore();

const locateVisible = ref(false);

const closeLocate = (formRef: FormInstance | undefined) => {
    // 菜单恢复初始值
    if (menuStore.currFunc == 'cjsq') {
        menuStore.handleFunc('');
    }

    if (!formRef) return;
    formRef.resetFields();
};

// onMounted(() => {
//     //获取历史书签列表
//     getMarkData();
// });

// 表单
const form = reactive({
    name: '',
});
const formRef = ref<FormInstance>();

// 表单验证规则
const formRules = reactive<FormRules>({
    name: [{ required: true, message: '场景名称不能为空', trigger: 'blur' }],
});

// 书签列表
var pid = 0;
let markList = ref<any>([]);

//获取场景书签列表
const getMarkData = async () => {
    const { data: res } = await getMarkList();
    if (res.code != 200) {
        return ElMessage.error(res.msg);
    }
    markList.value = res.data.records;
    console.log(markList, 'markList');
};

// 添加按钮点击
const handleAdd = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid) => {
        if (!valid) {
            return ElMessage.warning('请补充必填项');
        }
        //截取当前场景的图片
        if (toRaw(viewStore.mapInstance) == undefined) {
            return ElMessage.warning(
                '初始化地图不完整，请刷新页面等待地图加载完成'
            );
        }
        const screenshot = await toRaw(viewStore.mapInstance).takeScreenshot();
        const user = JSON.parse(sessionStorage.getItem('23vUser') as string);
        let markData = {
            name: form.name,
            imgdata: screenshot.dataUrl,
            mapparams: JSON.stringify(toRaw(viewStore.mapInstance).camera),
            userid: user.pid,
        };
        //调用接口存储数据
        const { data: res } = await saveMark(markData);
        //console.log("savemark", res);
        //添加完成刷新列表数据
        //markList.push(markData);
        getMarkData();
        ElMessage.success(res.msg);
    });
};

//场景书签列表的行点击事件
const handleClick = (item: any) => {
    let mapCamera = JSON.parse(item.mapparams);
    toRaw(viewStore.mapInstance).goTo(mapCamera);
};

// 场景删除
const handleDel = (item: any) => {
    ElMessageBox.confirm('确认要删除此场景书签吗？', '注意', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: '提示',
    } as any)
        .then(async () => {
            // 删除逻辑
            const { data: res } = await deleteMark(item.pid);
            if (res.code != 200) {
                ElMessage.success(res.msg);
            } else {
                //删除完成刷新列表数据
                getMarkData();
                ElMessage.success('删除成功');
            }
        })
        .catch(() => {
            ElMessage.info('已取消删除');
        });
};

// 监听功能栏子功能点击
menuStore.$subscribe((mutation, state) => {
    debugger;
    if (state.currFunc == 'cjsq') {
        locateVisible.value = true;
        // 获取历史书签列表
        getMarkData();
    } else {
        locateVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './scenemark.scss';
</style>
