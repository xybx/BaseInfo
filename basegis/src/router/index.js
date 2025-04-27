/*
 * @Author: 王成龙
 * @Date: 2021-11-12 11:11:55
 * @LastEditors: LJX
 * @LastEditTime: 2022-05-24 17:21:34
 * @FilePath: \webgis\src\router\index.js
 * @Description: 路由文件
 */
import Vue from "vue";
import VueRouter from "vue-router";
import { isRegist } from "@/views/login/api/login-api";

Vue.use(VueRouter);
console.log(pageStyle, "页面风格");

const routes = [
    {
        path: "/login",
        name: "Login",
        alias: "/",
        component: () => import("../views/login/vue/Login.vue"),
        meta: {
            title: "一张图系统",
        },
    },
    {
        path: "/home",
        name: "Home",
        component: () => import("../views/home/vue/Home.vue"),
        meta: {
            title: "一张图系统",
        },
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("../views/login/vue/Register.vue"),
        meta: {
            title: "系统授权",
        },
    },
    {
        path: "/index",
        name: "Index",
        component: () => import("../layout/index/vue/Index.vue"),
        children: [
            // 数字乡村一张图
            {
                path: "/szxcmapindex",
                name: "数字乡村一张图",
                component: () => import("../views/onemap_szxc/vue/OneMap.vue"),
                meta: {
                    title: "数字乡村一张图",
                    //model: "数字乡村一张图",
                    type: "onemap",
                },
            },
            {
                path: "/onemap",
                name: "一张图",
                component: () => import("../views/onemap/vue/OneMap.vue"),
                meta: {
                    title: "统一底图",
                    type: "onemap",
                },
            },
            {
                path: "/planlist",
                name: "项目列表",
                component: () =>
                    import("../views/plan/planlist/vue/PlanList.vue"),
                meta: {
                    title: "规划审查",
                },
            },
            {
                path: "/plandetail/:pid",
                name: "项目阶段",
                component: () =>
                    import(
                        "../views/plan/planlist/components/plandetail/vue/PlanDetail.vue"
                    ),
                meta: {
                    title: "规划审查",
                },
            },
            {
                path: "/planqc",
                name: "规划成果质检",
                component: () =>
                    import("../views/plan/planqc2/vue/PlanQc2.vue"),
                meta: {
                    title: "规划审查",
                },
            },
            {
                path: "/planjoin",
                name: "数据汇交",
                component: () =>
                    import("../views/plan/planhuijiao/vue/PlanHuiJiao.vue"),
                meta: {
                    title: "规划审查",
                },
            },
            {
                path: "/planjoinNY",
                name: "数据汇交",
                component: () =>
                    import("../views/plan/planhuijiao/vue/PlanHuiJiao_NY.vue"),
                meta: {
                    title: "规划审查",
                },
            },
            {
                path: "/planjoinHB",
                name: "数据汇交",
                component: () =>
                    import("../views/plan/planhuijiao/vue/PlanHuiJiao_HB.vue"),
                meta: {
                    title: "规划审查",
                },
            },
            {
                path: "/landfitness",
                name: "国土空间开发适宜性评价",
                component: () =>
                    import("../views/evaluate/landfitness/vue/LandFitness.vue"),
                meta: {
                    title: "分析评价",
                },
            },
            {
                path: "/landrisk",
                name: "国土空间开发保护风险评估",
                component: () =>
                    import("../views/evaluate/landrisk/vue/LandRisk.vue"),
                meta: {
                    title: "分析评价",
                },
            },
            {
                path: "/spatialpattern",
                name: "空间格局韧性评估",
                component: () =>
                    import(
                        "../views/evaluate/spatialpattern/vue/SpatialPattern.vue"
                    ),
                meta: {
                    title: "分析评价",
                },
            },
            {
                path: "/infrastructure",
                name: "基础设施韧性评估",
                component: () =>
                    import(
                        "../views/evaluate/infrastructure/vue/Infrastructure.vue"
                    ),
                meta: {
                    title: "分析评价",
                },
            },
            {
                path: "/currentindex",
                name: "现状指标",
                component: () =>
                    import("../views/model/currentindex/vue/CurrentIndex.vue"),
                meta: {
                    title: "指标模型",
                },
            },
            {
                path: "/modelmanage",
                name: "模型管理",
                component: () =>
                    import("../views/model/modelmanage/vue/ModelManage.vue"),
                meta: {
                    title: "指标模型",
                },
            },
            {
                path: "/monitorwarning",
                name: "监测预警",
                component: () =>
                    import(
                        "../views/monitor/dynamicmonitor/vue/MonitorWarning.vue"
                    ),
                meta: {
                    title: "实施监督",
                },
            },
            {
                path: "/dynamicmonitor",
                name: "动态监测",
                component: () =>
                    import(
                        "../views/monitor/dynamicmonitor/vue/DynamicMonitor.vue"
                    ),
                meta: {
                    title: "实施监督",
                },
            },
            {
                path: "/regularassess",
                name: "定期评估",
                component: () =>
                    import(
                        "../views/monitor/regularassess/vue/RegularAssess.vue"
                    ),
                meta: {
                    title: "实施监督",
                },
            },
            {
                path: "/carrycapacity",
                name: "承载能力",
                component: () =>
                    import(
                        "../views/monitor/carrycapacity/vue/CarryCapacity.vue"
                    ),
                meta: {
                    title: "实施监督",
                },
            },
            {
                path: "/spaceconsist",
                name: "空间一致性",
                component: () =>
                    import("../views/plan/spaceconsist/vue/SpaceConsist.vue"),
                meta: {
                    title: "规划审查",
                },
            },
            {
                path: "/spaceaccess",
                name: "空间准入性",
                component: () =>
                    import("../views/plan/spaceaccess/vue/SpaceAccess.vue"),
                meta: {
                    title: "规划审查",
                },
            },
            {
                path: "/figureconsist",
                name: "图数一致性",
                component: () =>
                    import("../views/plan/figureconsist/vue/FigureConsist.vue"),
                meta: {
                    title: "规划审查",
                },
            },
            {
                path: "/indexmanage",
                name: "指标管理",
                component: () =>
                    import("../views/model/indexmanage/vue/IndexMenu.vue"),
                meta: {
                    title: "指标模型",
                },
            },
            {
                path: "/assesslist",
                name: "指标列表项",
                component: () =>
                    import(
                        "../views/model/indexmanage/components/AssessList.vue"
                    ),
                meta: {
                    title: "指标模型",
                },
            },
        ],
    },
    {
        path: "/tokenlogin",
        name: "TokenLogin",
        component: () => import("../views/tokenlogin/vue/tokenlogin.vue"),
        meta: {
            title: "一张图系统登录验证",
        },
    },
];

// 判断登录页和首页风格
if (pageStyle == 1) {
    Object.assign(routes[0], {
        component: () => import("../views/login/vue/Login.vue"),
    });
    Object.assign(routes[1], {
        component: () => import("../views/home/vue/Home.vue"),
    });
} else {
    Object.assign(routes[0], {
        component: () => import("../views/login2/vue/Login2.vue"),
    });
    Object.assign(routes[1], {
        component: () => import("../views/home2/vue/Home2.vue"),
    });
}

const router = new VueRouter({
    routes,
});

router.beforeEach(async (to, from, next) => {
    console.log(to, "to");
    // console.log(from, 'from');
    document.title = websiteTitle;
    // 路由跳转拦截
    let username = window.sessionStorage.getItem("username");
    let userid = window.sessionStorage.getItem("userid");
    let usercode = window.sessionStorage.getItem("usercode");
    let sessionArr = [Boolean(username), Boolean(userid), Boolean(usercode)];
    //系统授权
    if (isSystemAuth) {
        const { data: res } = await isRegist();
        if (res.code === 1) {
            window.sessionStorage.setItem("IsSysAuth", 1);
            //console.log("授权通过");
        } else {
            window.sessionStorage.setItem("IsSysAuth", 0);
            // debugger;
            // this.$message.error("授权到期或未授权，请及时联系技术人员！");
            // this.$router.push("/register");
            //window.location.href = "register.html";
        }
    }
    let IsSysAuth = window.sessionStorage.getItem("IsSysAuth");
    if ((!IsSysAuth || IsSysAuth == 0) && isSystemAuth) {
        if (to.path === "/register") {
            return next();
        } else {
            return next("/register");
        }
    } else {
        if (
            to.path === "/login" ||
            (from.path === "/login" && to.path === "home") ||
            to.path === "/tokenlogin"
        ) {
            return next();
        } else {
            if (sessionArr.includes(false)) {
                return next("/login");
            } else {
                return next();
            }
        }
    }
});

const originalPush = VueRouter.prototype.push;

VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => console.log(err));
};

export default router;
