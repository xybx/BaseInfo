/*
 * @Author: WCL
 * @Date: 2021-11-12 13:38:34
 * @LastEditors: LJX
 * @LastEditTime: 2022-08-23 17:31:18
 * @FilePath: \webgis\src\views\tokenlogin\js\login.js
 * @Description: 登录页面JS
 */
import { getDepts, getPersons, login, ytlogin } from '../api/login-api';
import { getUserInfoApi } from '@/utils/common-api';
export default {
    name: '',
    props: {},
    components: {},
    data() {
        return {
            token: this.$route.query.token || null, //宁远登录对接token
            stToken: this.$route.query.stToken || null, //山东烟台栖霞市县登录对接token
        };
    },
    computed: {},
    watch: {},
    created() { },
    mounted() {
        this.onSubmit();
        console.log('tokenlogin');
    },
    methods: {
        // 获取部门列表

        // 登录按钮
        async onSubmit() {
            let params = null;
            //let res = null;

            if (this.token) {
                params = {
                    token: this.token,
                };
                const { data: res } = await login(params);
                console.log("res",res);
                await this.getLoginInfo(res);
            }
            if (this.stToken) {
                params = {
                    token: this.stToken,
                };
                const { data: res }  = await ytlogin(params);
                await this.getLoginInfo(res);
            }

        },
        async getLoginInfo(res) {
            console.log("res",res);           
            if (res == null) {
                this.$message.error("登录失败，用户名或密码错误！");
            } else {
                //res = res.data;
                if (res.code === 1) {
                    // window.sessionStorage.setItem('userid', res.data.userid);
                    // window.sessionStorage.setItem('username', res.data.username);
                    // window.sessionStorage.setItem('usercode', res.data.xzqcode);
                    // window.sessionStorage.setItem('xzqname',res.data.xzqname);
                    window.sessionStorage.setItem(
                        'usertoken',
                        this.$route.query.token
                    );
                    localStorage.setItem('token', res.data);
                    this.get_UserInfo();
                    
                    // if (showHome) {
                    //     this.$router.push('/home');
                    // } else {
                    //     window.sessionStorage.setItem('menuid', 1);
                    //     this.$router.push('/onemap');
                    // }
                    // this.$notify.success({
                    //     title: '登录成功',
                    //     message: `欢迎您！${res.data.username}`,
                    // });
                } else {
                    this.$message.error(res.msg);
                }
            }
        },
        	//获取用户信息
		async get_UserInfo() {
            const { data: res }  = await getUserInfoApi();
			if (res.code === 1) {
                window.sessionStorage.setItem('userid', res.data.userid);
                window.sessionStorage.setItem('username', res.data.username);
                window.sessionStorage.setItem('usercode', res.data.xzqcode);
                window.sessionStorage.setItem('xzqname',res.data.xzqname)
                if (showHome) {
                    this.$router.push('/home');
                } else {
                    window.sessionStorage.setItem('menuid', 1);
                    this.$router.push('/onemap');
                }
                this.$notify.success({
                    title: '登录成功',
                    message: `欢迎您！${res.data.username}`,
                });
				// localStorage.setItem('isadmin', res.data.ISADMIN);
				// this.setIsAdmin(res.data.ISADMIN);
			}
		},
    },
};
