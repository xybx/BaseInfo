<template>
    <div
        class="tool-bar"
        :class="menuStore.layerIsShow ? '' : 'tool-transform'"
    >
        <el-dialog
            v-model="dialogVisible"
            draggable
            :modal="false"
            :close-on-click-modal="false"
            class="tool-dialog"
            @close="closeDialog"
        >
            <template #header>
                <span class="tool-title">
                    <span class="title-txt">{{ menuName }}</span>
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
                <el-form :model="form">
                    <el-form-item
                        v-for="item in formItems"
                        :key="item.pid"
                        :label="item.displayName"
                    >
                        <el-input
                            v-if="item.controlType == 'text'"
                            :placeholder="`请输入${item.displayName}`"
                            v-model="form[item.fieldName]"
                        ></el-input>

                        <el-date-picker
                            v-if="item.controlType == 'date'"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            v-model="form[item.fieldName]"
                        ></el-date-picker>

                        <el-select
                            v-if="item.controlType == 'list'"
                            v-model="form[item.fieldName]"
                            :placeholder="`请选择${item.displayName}`"
                        >
                            <el-option
                                v-for="value in item.valueList"
                                :label="value.controlName"
                                :value="value.controlValue"
                                :key="value.pid"
                            ></el-option>
                        </el-select>

                        <div
                            :class="`${item.controlType}-type`"
                            v-if="item.controlType == 'range'"
                        >
                            <el-input
                                type="number"
                                v-model="form[item.fieldName][0]"
                            ></el-input>
                            <span class="apart">-</span>
                            <el-input
                                type="number"
                                v-model="form[item.fieldName][1]"
                            ></el-input>
                        </div>
                    </el-form-item>
                    <div class="form-btn">
                        <el-button type="primary" @click="handleStat"
                            >开始统计</el-button
                        >
                    </div>
                </el-form>
            </div>
        </el-dialog>
    </div>
    <el-drawer
        v-model="drawerVisible"
        title="查询结果"
        direction="btt"
        class="stat-drawer"
    >
        <div v-loading="resLoading">
            <el-table
                :data="tableData.slice((currentPage - 1) * 5, currentPage * 5)"
                border
                size="small"
                stripe
                @row-click="tableRowClick"
            >
                <el-table-column
                    v-for="item in resultFields"
                    :prop="item.fieldName"
                    :label="item.fieldDesc"
                    :key="item.pid"
                    align="center"
                ></el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-size="5"
                layout="total,prev,pager,next,jumper"
                :total="tableData.length"
                background
                small
            ></el-pagination>
        </div>
    </el-drawer>
</template>

<script setup lang="ts">
/* Vue 相关 */
import { ref, reactive, watch, toRaw, onMounted, nextTick } from 'vue';
import useStore from '@/stores';

/* UI 相关 */
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

/* ArcGIS API */
import Query from '@arcgis/core/rest/support/Query.js';
import * as query from '@arcgis/core/rest/query.js';
import Graphic from '@arcgis/core/Graphic';

const { menuStore, viewStore, mapStore } = useStore();

/* 表单 */
const form = ref<any>({});

// 表单动态渲染项
const formItems = ref<any>(window.buildProOpt.searchOpts);

/* 表格数据 */
const tableData = ref<any>([]);

/* 菜单名称 */
const menuName = ref<string>(window.buildProOpt.layerName);

/* 开始统计 */
const handleStat = () => {
    drawerVisible.value = true;
    tableData.value = [];
    let strwhere = '1=1';
    if (formItems.value.length > 0) {
        debugger;
        formItems.value.forEach((where: any) => {
            //字符串
            if (where.fieldType.toLowerCase() == 'string') {
                debugger;
                if (form.value[where.fieldName]) {
                    strwhere +=
                        ' and ' +
                        where.fieldName +
                        " like '%" +
                        form.value[where.fieldName] +
                        "%' ";
                }
            }
            //数字区间
            if (where.fieldType.toLowerCase() == 'number') {
                if (form.value[where.fieldName]?.length == 1) {
                    strwhere +=
                        'and  (' +
                        where.fieldName +
                        '>=' +
                        form.value[where.fieldName][0] +
                        ' ) ';
                }
                if (form.value[where.fieldName]?.length == 2) {
                    if (
                        form.value[where.fieldName][0] ||
                        form.value[where.fieldName][1]
                    ) {
                        if (form.value[where.fieldName][0]) {
                            strwhere +=
                                ' and (' +
                                where.fieldName +
                                '>=' +
                                form.value[where.fieldName][0];
                        } else {
                            strwhere += ' (';
                        }
                        if (form.value[where.fieldName][1]) {
                            strwhere +=
                                ' and ' +
                                where.fieldName +
                                '<=' +
                                form.value[where.fieldName][1] +
                                ') ';
                        } else {
                            strwhere += ') ';
                        }
                    }
                }
            }
            //时间区间
            if (where.fieldType.toLowerCase() == 'date') {
                if (form.value[where.fieldName]) {
                    debugger;
                    var sdate = new Date(form.value[where.fieldName][0]);
                    var edate = new Date(form.value[where.fieldName][1]);
                    let start_value =
                        sdate.getFullYear() +
                        '-' +
                        (sdate.getMonth() + 1) +
                        '-' +
                        ((sdate.getDate() == 1 ? 2 : sdate.getDate()) - 1);
                    let end_value =
                        edate.getFullYear() +
                        '-' +
                        (edate.getMonth() + 1) +
                        '-' +
                        (edate.getDate() + 1);
                    strwhere +=
                        ' and ' +
                        where.fieldName +
                        " >DATE'" +
                        start_value +
                        "' and " +
                        where.fieldName +
                        "<DATE'" +
                        end_value +
                        "'";
                }
            }
        });
    } else {
        ElMessage.warning('该查询没有配置查询条件,将查询全部信息');
    }

    // 组装查询输出字段
    statFields.value = [];
    window.buildProOpt.resOpts.map((item: any) => {
        statFields.value.push(item.fieldName);
    });
    statFields.value.push('OBJECTID');

    findResult(strwhere);
};
const statFields = ref<any>([]);
const resArr = ref<any>([]);
const resLoading = ref<boolean>(false);
/* 开始查询 */
const findResult = async (where: string) => {
    resLoading.value = true;
    let queryParams = new Query({
        where,
        outFields: statFields.value,
        returnGeometry: false,
    });

    const queryRes = await query.executeQueryJSON(
        window.buildProOpt.layerUrl,
        queryParams
    );

    resArr.value = [];
    if (queryRes && queryRes.features.length > 0) {
        queryRes.features.map((item: any) => {
            let dataItem = new Object();
            Object.assign(dataItem, item.attributes);
            resArr.value.push(dataItem);
        });
        tableData.value = resArr.value;
        resLoading.value = false;
    } else {
        resLoading.value = false;
        ElMessage.warning('没有查询到数据');
    }
};

/* 结果表格点击 */
const tableRowClick = async (row: any) => {
    let queryParams = new Query({
        where: `OBJECTID = ${row.OBJECTID}`,
        outFields: ['OBJECTID'],
        returnGeometry: true,
    });
    const queryRes = await query.executeQueryJSON(
        window.buildProOpt.layerUrl,
        queryParams
    );
    console.log(queryRes);
    if (queryRes && queryRes.features.length > 0) {
        queryRes.features[0].geometry;
        let geo = new Graphic({
            geometry: queryRes.features[0].geometry,
            symbol: {
                type: 'simple-fill',
                color: [255, 255, 0, 0.2],
                style: 'solid',
                outline: {
                    color: 'red',
                    width: 2,
                },
            },
        } as any);
        toRaw(viewStore.mapInstance).graphics.removeAll();
        toRaw(viewStore.mapInstance).graphics.add(geo);
        toRaw(viewStore.mapInstance).zoom =
            toRaw(viewStore.mapInstance).zoom - 4;
        toRaw(viewStore.mapInstance).extent = geo.geometry.extent;
    } else {
        ElMessage.warning('没有对应图形信息');
    }
};

/* 弹窗 */
const dialogVisible = ref(false);
const closeDialog = () => {
    drawerVisible.value = false;
    toRaw(viewStore.mapInstance).graphics.removeAll();
    // 菜单恢复初始值
    if (menuStore.currFunc == 'tjfx') {
        menuStore.handleFunc('');
    }
};

/* 结果抽屉 */
const drawerVisible = ref(false);
const resultFields = ref<any>(window.buildProOpt.resOpts);
const handleSizeChange = () => {};
const handleCurrentChange = (val: any) => {
    currentPage.value = val;
};
const currentPage = ref<number>(1);

/* 监听功能栏子功能点击 */
menuStore.$subscribe((mutation, state) => {
    if (state.currFunc == 'tjfx') {
        window.buildProOpt.searchOpts.map((item: any) => {
            let type = item.controlType === 'range' ? [] : '';
            Object.assign(form.value, { [item.fieldName]: type });
        });
        dialogVisible.value = true;
    } else {
        dialogVisible.value = false;
    }
});
</script>

<style scoped lang="scss">
@use './statanalyse.scss';
</style>
