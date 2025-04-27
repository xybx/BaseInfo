/*
 * @Author: WCL
 * @Date: 2021-11-12 15:59:51
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-21 17:12:56
 * @FilePath: \webgis\src\views\home\js\home.js
 * @Description: home首页代码
 */
import { getModule, changePwdRemind } from "../api/home-api";
import { writelogoutlog } from "../../../utils/log-api";
import { logout } from "../../../layout/components/header/api/header-api";
import changePwd from "../../../components/common/chart/ChangePwd.vue";
import cookie from "@/utils/cooike";
export default {
    name: "",
    props: {},
    components: { changePwd },
    data() {
        return {
            navList: [],
            navColList: [],
            username: "",
            perMenu: [{ text: "退出登录", command: "exit" }],
            imgurl: "",
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.username = window.sessionStorage.getItem("username");
        this.getModuleList();
        this.remindChangePwd();
    },
    methods: {
        //提醒用户修改密码
        async remindChangePwd() {
            const { data: res } = await changePwdRemind();
            if (res.code == 1) {
                if (res.data) {
                    this.$alert(res.msg, "提醒", {
                        confirmButtonText: "确定",
                        // callback: (action) => {
                        //     this.$message({
                        //         type: "info",
                        //         message: `action: ${action}`,
                        //     });
                        // },
                    });
                }
            } else {
                console.log("提醒用户修改密码接口：" + res.msg);
                // this.$message.error(res.msg);
            }
        },
        // 点击菜单项
        clickNav(item) {
            debugger;
            if (item.top_isauth == 0) {
                this.$message.error("当前用户没有该模块的权限");
                return;
            }
            // 公众服务
            if (item.id === 5) {                
                if (!item.path) {
                    return this.$message.warning("公众服务的地址未配置！");
                }
                let fromIndex = item.path.indexOf("from");
                if (fromIndex > -1) {
                    let token=  localStorage.getItem('token');
                    //let from= item.path.substr(fromIndex,4);
                    window.open(item.path+"&onemapToken="+token);
                } else {
                    window.open(item.path);
                }
            } else {
                // this.$router.push(item.path);
                window.sessionStorage.setItem("menuid", item.id);
                let routeData = this.$router.resolve({ path: item.path });
                window.open(routeData.href, "_blank");
            }
        },
        // 退出登录
        async logout() {
            let { data: res } = await logout();
            await writelogoutlog({
                username: window.sessionStorage.getItem("username"),
            });
            window.sessionStorage.removeItem("userid");
            window.sessionStorage.removeItem("username");
            window.sessionStorage.removeItem("usercode");
            cookie.delete('ptoken')
            this.$router.push("/login");
        },
        //修改密码
        async changePwd() {
            this.$refs.changePwd.openDialog();
        },
        // 获取菜单列表
        async getModuleList() {
            let params = {
                uid: window.sessionStorage.getItem("userid"),
            };
            const { data: res } = await getModule(params);
            console.log(res, "res");
            if (res.code === 1) {
                this.navList = res.data.slice(0, 4).map((item) => {
                    return {
                        title: item.title,
                        remark: item.remark,
                        iconimg: require(`@/assets/images/home-images/${item.icon}`),
                        bgimg: require(`@/assets/images/home-images/${item.bgimg}`),
                        path: item.path,
                        bgcolor: item.bgcolor,
                        id: item.id,
                        top_isauth: item.top_isauth,
                    };
                });
                this.navColList = res.data.slice(4);
            } else {
                this.$message.error(res.msg);
            }
        },
    },
};
