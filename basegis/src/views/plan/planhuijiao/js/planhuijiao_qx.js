import {
    getDealtListApi,
    getFinishListApi,
    getOverListApi,
} from "@/views/plan/planhuijiao/api/planhuijiaoqxApi";
import PlanHuijiaoQx from '../components/planqx/PlanHuijiaoQx.vue'
import PlanAddQX from "../components/planqx/PlanAddQX.vue";
import cookie from "@/utils/cooike";
import {getDate} from "@/utils/timeDate";
export default {
    name: "PlanHuiJiao_QX",
    data() {
        return {
            searchform: {},
            cateData: [],
            tableColumns: [],
            tableData: [],
            tabloading: true,
            loadingText: "正在加载...",
            layout: "total, sizes, prev, pager, next, jumper",
            total: 0,
            pageNo: 1,
            pageSize: 0,
            pageSizes: [10, 15, 20],
            remarkData: [],
            worker: null,
            // 
            dialogVisible: false,
            rowValue:'',

        }
    },
    components: { PlanHuijiaoQx,PlanAddQX },
    filters:{
        getTimes(val){
            return getDate('',val)
        },
    },
    props: ['activeIndex'],
    created() {
        this.pageSize = this.pageSizes[0];
        this.getRemark()
        // this.startLogin()
    },
    mounted() {
        this.getTableColumns()
        this.getDealtList()
    },
    beforeDestroy() {
        this.worker && this.worker.terminate();
    },
    methods: {
        startLogin() {
            const worker = new Worker('work.js');
            this.worker = worker;
            worker.postMessage({ timer: 15000, message: 'heart' })
            worker.onmessage = (e) => {
                if (e.data == 'heart') {
                    this.getDealtList()
                }
            }
        },
        getTableColumns() {
            this.tableColumns = [
                { prop: 'status', label: '办理状态' },
                { prop: 'processName', label: '流程名称' },
                { prop: 'name', label: '项目名称' },
                { prop: 'createTime', label: '申请时间' },
                { prop: 'taskName', label: '任务名称' },
            ]
        },
        getRemark() {
            this.remarkData = ['代表办理时限已超时', '代表办理时限即将超期(24小时以内)', '代表办理时限正常']
        },
        async getDealtList() {
            const loading = this.$loading({
                lock: true,
                text: '数据加载中...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.5)'
            });
            let params = {expandValue:[]}
            let {data} = this.activeIndex == 1 ? await getDealtListApi(params,this.pageNo,this.pageSize).catch(error=>{
               return error.response
            }) : this.activeIndex == 2 ? await getOverListApi(params,this.pageNo,this.pageSize).catch(error=>{
                return error.response
            }) : await getFinishListApi(params,this.pageNo,this.pageSize).catch(error=>{
                return error.response
            })
            if(data.status == 200){
                this.tableData = data.data.data.length > 0 ? data.data.data : []
                this.total = data.data.totalCount
                this.$emit('showLog',false)
            } else {
                this.$message.error(data.message.indexOf('token') > -1 ? 'token已过期，请重新登录' : data.message)
                this.tableData = []
                cookie.delete('ptoken')
                this.$emit('showLog',true)
            }
            setTimeout(() => {
                loading.close();
                this.tabloading = false
            }, 200)
        },
        addClick() {
            this.$refs.addqx.showAdd()
        },
        handleRow(row) {
            console.log(row)
            console.log(row.id)
            console.log(row.taskId)
            this.rowValue=row;
            this.dialogVisible = true;
            this.$emit('putLeft',false)
        },
        // 关闭详情
        closeDialog() {
            let ptoken = cookie.get('ptoken')
            this.dialogVisible = false
            this.$emit('putLeft',true)
            this.getDealtList()
            if (!ptoken){
                this.$emit('showLog',true)
            }
        },
        SizeChange(val) {
            this.pageSize = val;
            this.getDealtList();
        },
        CurrentChange(val) {
            this.pageNo = val;
            this.getDealtList();
        }
    }
}