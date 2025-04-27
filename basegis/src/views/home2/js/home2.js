/*
 * @Author: WCL
 * @Date: 2022-03-14 09:28:03
 * @LastEditors: LJX
 * @LastEditTime: 2022-04-21 13:03:23
 * @FilePath: \webgis\src\views\home2\js\home2.js
 * @Description: 请填写描述
 */
import { getModule } from "../../home/api/home-api";
import { writelogoutlog } from "../../../utils/log-api";
import { logout } from "../../../layout/components/header/api/header-api";
import cookie from "@/utils/cooike";
export default {
    name: "",
    props: {},
    components: {},
    data() {
        return {
            username: "",
            navList: [
                // {
                //     title: '统一平台',
                //     iconimg: require('@/assets/images/home2-images/icon_1.png'),
                //     bgimg: require('@/assets/images/home2-images/nav_1.png'),
                //     path: 'onemap',
                // },
                // {
                //     title: '分析评价',
                //     iconimg: require('@/assets/images/home2-images/icon_2.png'),
                //     bgimg: require('@/assets/images/home2-images/nav_2.png'),
                //     path: 'landfitness',
                // },
                // {
                //     title: '规划审查',
                //     iconimg: require('@/assets/images/home2-images/icon_3.png'),
                //     bgimg: require('@/assets/images/home2-images/nav_3.png'),
                //     path: 'planlist',
                // },
                // {
                //     title: '实施监督',
                //     iconimg: require('@/assets/images/home2-images/icon_4.png'),
                //     bgimg: require('@/assets/images/home2-images/nav_4.png'),
                //     path: 'dynamicmonitor',
                // },
                // {
                //     title: '城市体检',
                //     iconimg: require('@/assets/images/home2-images/icon_5.png'),
                //     bgimg: require('@/assets/images/home2-images/nav_5.png'),
                //     path: '',
                // },
                // {
                //     title: '城市模型',
                //     iconimg: require('@/assets/images/home2-images/icon_6.png'),
                //     bgimg: require('@/assets/images/home2-images/nav_6.png'),
                //     path: 'currentindex',
                // },
            ],
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.username = window.sessionStorage.getItem("username");
        this.getModuleList();
    },
    methods: {
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
        // 点击菜单项
        clickNav(item) {
            debugger;

            // 公众服务
            if (item.id === 5) {
                window.open(item.path);
            } else {
                // this.$router.push(item.path);
                window.sessionStorage.setItem("menuid", item.id);
                let routeData = this.$router.resolve({ path: item.path });
                window.open(routeData.href, "_blank");
            }
        },
        // 获取菜单列表
        async getModuleList() {
            let params = {
                uid: window.sessionStorage.getItem("userid"),
            };
            const { data: res } = await getModule(params);
            console.log(res, "res");
            if (res.code === 1) {
                this.navList = res.data.map((item, index) => {
                    return {
                        title: item.title,
                        iconimg: require(`@/assets/images/home2-images/icon_${item.id}.png`),
                        bgimg: require(`@/assets/images/home2-images/nav_${item.id}.png`),
                        path: item.path,
                        id: item.id,
                    };
                });
            } else {
                this.$message.error(res.msg);
            }
        },
    },
};
