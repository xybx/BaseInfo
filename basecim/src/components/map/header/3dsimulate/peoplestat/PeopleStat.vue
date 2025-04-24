<template>
  <div
    class="people-bar"
    :class="menuStore.layerIsShow ? '' : 'people-transform'"
  >
    <el-dialog
      v-model="dialogVisible"
      draggable
      :modal="false"
      :close-on-click-modal="false"
      class="peopleDialog"
      @close="closeDialog"
    >
      <template #header>
        <span class="tool-title">
          <span class="title-txt">人口分析</span>
          <el-popover
            placement="bottom-start"
            trigger="hover"
            content="注意事项文本占位"
          >
            <template #reference>
              <i class="iconfont icon-shuxing"></i>
            </template>
          </el-popover>
        </span>
      </template>

      <div class="options">
        <div class="gender">
          <div class="title">
            <div class="status-point" />
            男女比例
            <div class="status-point" />
          </div>
          <div id="gender"></div>
        </div>

        <div class="age">
          <div class="title">
            <div class="status-point" />
            年龄特征
            <div class="status-point" />
          </div>
          <div class="age" id="age"></div>
        </div>
      </div>
      <div class="options">
        <div class="historyPeople">
          <div class="title">
            <div class="status-point" />
            历年人口变化特征
            <div class="status-point" />
          </div>
          <div id="historyPeople"></div>
        </div>
      </div>
      <div class="options">
        <div class="peopleLayer">
          <div class="title">图层</div>
          <div class="layer">
            <div class="item" v-for=" item in  peopleLayer">
              <el-checkbox
                v-model="item.value"
                :label="item.label"
                class="elcheck"
                @change="checkLayer(item)"
              />
              <el-slider v-model="item.opacity" class="elsilder" />
            </div>
            
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/* Vue 相关 */
import useStore from "@/stores";
import { ref, onMounted ,toRaw} from "vue";

/* UI 相关 */
import { ElMessage } from "element-plus";

// echatrs
import * as echarts from "echarts";
/* API */
import { initLayerByKind } from '@/utils/common-map';

const { menuStore, viewStore, mapStore } = useStore();
let dialogVisible = ref(false);

// let reli = ref(false);
// let relivalue = ref(50);
// 图层数据
let peopleLayer = ref([
  {label:'人口分布热力图',value:false,url:'https://a3d.dpinfo.com.cn/server/rest/services/Pop/MapServer',opacity:75 ,kind:2,pid:'reli'},
  {label:'人口分布点位置',value:false,url:'https://a3d.dpinfo.com.cn/server/rest/services/Pop/MapServer',opacity:75},
  {label:'用地规划图',value:false,url:'https://a3d.dpinfo.com.cn/server/rest/services/Pop/MapServer',opacity:75},
])
// 图层加载
async function checkLayer(item:object){
  console.log(item);
  
  /* 避免与主图层重复 */
//  let showLayer = groupLayer.findLayerById(`build-${currSel.value.pid}`);
    // if (!showLayer) {
        // let obj = Object.assign({}, currSel.value, {
        //     pid: `build-${currSel.value.pid}`,
        // });
       let showLayer = await initLayerByKind(item, true);

        // groupLayer.add(showLayer, currSel.value.order);
        toRaw(viewStore.mapInstance).goTo(showLayer.fullExtent);
}

/* 监听功能栏子功能点击 */
menuStore.$subscribe((mutation, state) => {
  if (state.currFunc == "rkfbfx") {
    // ElMessage.warning("此模块正在开发中，即将上线");
    // 基于准备好的dom，初始化echarts实例
    dialogVisible.value = true;
    setTimeout(function () {
      genderEchart();
      ageEchart();
      historyPeopleEchart();
    }, 500);

    // menuStore.handleFunc("");
  } else {
    // 后续补充
    dialogVisible.value = false;
  }
});
type EChartsOption = echarts.EChartsOption;
// 男女比例图表
function genderEchart() {
  var myChart = echarts.init(document.getElementById("gender") as any);
  var option: EChartsOption;

  option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      itemWidth: 12,
      itemHeight: 12,
      icon: "circle",
      textStyle: {
        fontSize: "12px",
      },
      data: [
        {
          name: "男",
          itemStyle: {
            color: "#6BD6CA",
          },
        },
        {
          name: "女",
          itemStyle: {
            color: "#FD7271",
          },
        },
      ],
      bottom: "5%",
    },
    color: ["#6BD6CA", "#FD7271"],
    series: [
      {
        name: "男女比例",
        type: "pie",
        radius: ["26%", "40%"],
        center: ["48%", "47%"],
        startAngle: 235,

        label: {
          fontSize: 12,

          formatter: `{b}\n{cf|{c}}\n个`,
        },
        labelLine: {
          length2: 4,
          length: 5,
        },
        data: [
          {
            value: 713892,
            name: "男",
            label: {
              rich: {
                cf: {
                  color: "#6BD6CA",
                },
              },
            },
          },
          {
            value: 676595,
            name: "女",
            label: {
              rich: {
                cf: {
                  color: "#FD7271",
                },
              },
            },
          },
        ],
      },
    ],
  };
  option && myChart.setOption(option);
  window.addEventListener("resize", function () {
    myChart.resize();
  });
}
// 年龄特征图表
function ageEchart() {
  var myChart = echarts.init(document.getElementById("age") as any);
  var option: EChartsOption;

  let data: any = [
    { value: 269180, name: "0-14岁", label: { color: "red" } },
    { value: 891777, name: "15-59岁", label: { color: "red" } },
    { value: 68625, name: "60-65岁", label: { color: "red" } },
    { value: 160905, name: "65岁以上", label: { color: "red" } },
  ];
  let color = ["#2092E9", "#FA86A0", "#1DC0DE", "#FE901E", "#2871B5"];
  data.forEach((item: any, index: number) => {
    item.label.color = color[index];
  });

  option = {
    tooltip: {
      trigger: "item",
    },
    color: color,
    series: [
      {
        name: "年龄特征",
        type: "pie",
        radius: [5, 48],
        center: ["50%", "45%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 8,
        },
        label: {
          fontSize: 12,
        },
        minAngle: 10,
        labelLine: {
          length2: 3,
          length: 2,
        },

        data: data,
      },
    ],
  };
  option && myChart.setOption(option);
  window.addEventListener("resize", function () {
    myChart.resize();
  });
}
// 历年人口变化特征
function historyPeopleEchart() {
  var myChart = echarts.init(document.getElementById("historyPeople") as any);
  var option: EChartsOption;

  option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999",
        },
      },
    },

    legend: {
      bottom: "5%",
      // data: ['Evaporation', 'Precipitation', 'Temperature']
    },
    grid: {
      right: 50,
      left: 70,
    },
    xAxis: [
      {
        type: "category",
        data: ["2006", "2010", "2015", "2020", "2021"],
        axisPointer: {
          type: "shadow",
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        // name: 'Temperature',
        min: 0,
        max: 150,
        // interval: 5,
        axisLabel: {
          formatter: "{value} 万人",
        },
      },
      {
        type: "value",
        // name: 'Precipitation',
        min: 0,
        max: 100,
        interval: 50,
        axisLabel: {
          formatter: "{value} %",
        },
      },
    ],

    series: [
      {
        name: "总人口(万人)",
        type: "bar",
        color: "#2093E9",
        data: [119, 123.5, 133, 139.4, 141],
      },

      {
        name: "城镇化率(%)",
        type: "line",
        color: "#FD7271",
        yAxisIndex: 1,
        symbolSize: 8,

        data: [31.2, 38.1, 47.4, 53.6, 53.8],
      },
    ],
  };

  option && myChart.setOption(option);
  window.addEventListener("resize", function () {
    myChart.resize();
  });
}

const closeDialog = () => {
  menuStore.handleProShow("");
  // 菜单恢复初始值
  if (menuStore.currFunc == "rkfbfx") {
    menuStore.handleFunc("");
  }
};

onMounted(() => {});
</script>

<style scoped lang="scss">
@use "./peopleStat.scss";
</style>
