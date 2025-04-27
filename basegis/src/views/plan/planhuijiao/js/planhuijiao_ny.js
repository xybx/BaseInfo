/*
 * @Author: WCL
 * @Date: 2021-12-22 11:03:19
 * @LastEditors: WCL
 * @LastEditTime: 2023-01-04 15:28:45
 * @FilePath: \webgis\src\views\plan\planhuijiao\js\planhuijiao.js
 * @Description: 项目列表JS
 */

import {
	getType,
	saveProject,
	getList,
	delProject,
	uploadToLeader,
	getProById,
	reuploadById,
	getDownFile,
	setUploadReply,
} from "../api/planhuijiao-api";
import qs from "qs";
export default {
	name: "",
	props: {},
	components: {},
	data() {
		return {
			loading: true,
			isShowLoading: false,
			searchform: {
				keywords: "",
				ghtype: "",
			},
			// 规划类型选项
			regionData: [
				{ ID: 1, TYPENAME: "总体规划" },
				{ ID: 2, TYPENAME: "专项规划" },
				{ ID: 3, TYPENAME: "详细规划" },
			],
			// 数据类型选项
			vectorData: [
				{ ID: 1, TYPENAME: "GDB" },
				{ ID: 2, TYPENAME: "SHP" },
				{ ID: 3, TYPENAME: "MDB" },
			],
			// 表格数据
			tableData: [],
			currentPage: 1,
			pagesize: 10,
			pagesizeArr: [10, 20, 50, 100],
			tableTotal: 0,
			dialogAddItem: false,
			addForm: {
				areaCode: "",
				areaName: "",
				planType: "",
				name: "",
				yearStart: "",
				yearStandard: "",
				yearTarget: "",
				vectorType: "",
			},
			addFormRule: {
				areaCode: [
					{
						required: true,
						message: "行政区代码不能为空",
						trigger: "blur",
					},
				],
				areaName: [
					{
						required: true,
						message: "行政区名称不能为空",
						trigger: "blur",
					},
				],
				planType: [
					{
						required: true,
						message: "规划类型不能为空",
						trigger: "change",
					},
				],
				name: [
					{
						required: true,
						message: "规划名称不能为空",
						trigger: "blur",
					},
				],
				yearStart: [
					{
						required: true,
						message: "规划起始年不能为空",
						trigger: "change",
					},
				],
				yearStandard: [
					{
						required: true,
						message: "近期目标年不能为空",
						trigger: "change",
					},
				],
				yearTarget: [
					{
						required: true,
						message: "远景目标年不能为空",
						trigger: "change",
					},
				],
				vectorType: [
					{
						required: true,
						message: "数据类型不能为空",
						trigger: "change",
					},
				],
			},
			jdData: [], // 项目阶段
			addTitle: "",
			focusReply: {},
		};
	},
	computed: {},
	watch: {},
	created() {},
	mounted() {
		this.pagesize = this.pagesizeArr[0];
		// this.getRegionData();
		this.getTableData();
	},
	methods: {
		// 搜索项目
		onSearch() {
			this.getTableData(this.searchform);
		},

		// 规划项目列表数据组装
		getTableData(form) {
			let params = {
				// uid: sessionStorage.getItem('userid'),
				plantype: "",
				name: "",
				pageindex: this.currentPage,
				pagesize: this.pagesize,
			};

			if (form?.ghtype) {
				Object.assign(params, {
					plantype: form.ghtype,
				});
			}
			if (form?.keywords) {
				Object.assign(params, {
					name: form.keywords,
				});
			}
			this.getTableList(params);
		},

		// 获取规划项目列表
		async getTableList(params) {
			// 不做分页
			const { data: res } = await getList(params);
			if (res.code === 1) {
				// this.tableData = res.data.datas;
				// this.tableTotal = res.data.total;
				this.tableData = res.data;
				this.tableTotal = res.total;
				this.loading = false;
			} else {
				this.$message.error(res.msg);
			}
		},

		// 获取规划类型
		async getRegionData() {
			const { data: res } = await getType();
			if (res.code === 1) {
				this.regionData = res.data;
			} else {
				this.$message.error(res.msg);
			}
		},

		// 每条页数改变
		handleSizeChange(val) {
			this.pagesize = val;
			this.getTableData(this.searchform);
		},

		// 当前页码改变
		handleCurrentChange(val) {
			this.currentPage = val;
			this.getTableData(this.searchform);
		},

		// 添加项目
		addItem() {
			this.addTitle = "添加项目";
			this.dialogAddItem = true;
		},

		// 添加项目-关闭
		closeAddDialog() {
			this.dialogAddItem = false;
			this.addForm = this.$options.data().addForm;
			this.$refs.addFormRef.resetFields();
		},

		// 保存新增
		addFormInfo() {
			this.$refs.addFormRef.validate(
				async (valid) => {
					if (!valid)
						return this.$message.warning(
							"请补充必填项"
						);
					// PID 新增传0
					let data = {
						PID: this.addForm.pid || 0,
						USERID:
							sessionStorage.getItem("userid"),
						PRJNAME: this.addForm.ghname,
						PRJINTRO: this.addForm.ghintro,
						GHAREA: this.addForm.gharea,
						TYPEID: this.addForm.ghtype,
					};
					const { data: res } = await saveProject(
						qs.stringify(data)
					);
					if (res.code === 1) {
						this.$message.success("添加成功");
						this.dialogAddItem = false;
						this.currentPage = 1;
						this.getTableData();
					} else {
						this.$message.error(res.msg);
					}
				}
			);
		},

		// 详细信息
		handleDetail(row) {
			console.log(row);
			this.$router.push({
				path: `/plandetail/${row.PID}`,
				query: {
					name: row.PRJNAME,
				},
			});
		},

		// 修改信息
		handleEdit(row) {
			this.addTitle = "修改项目";
			this.dialogAddItem = true;
			Object.assign(this.addForm, {
				pid: row.PID,
				ghname: row.PRJNAME,
				userid: sessionStorage.getItem("userid"),
				ghintro: row.PROJECTINTRO,
				gharea: row.GHAREA,
				ghtype: String(row.TYPEID),
			});
		},

		// 删除信息
		async handleDelete(row) {
			console.log(row);
			let params = {
				pid: row.PID,
			};
			const { data: res } = await delProject(
				params
			);
			if (res.code === 1) {
				this.$message.success("删除成功");
				this.getTableData(this.searchform);
			} else {
				this.$message.error(res.msg);
			}
		},

		// 上传文件
		uploadLeader(params) {
			debugger;
			this.$refs.addFormRef.validate(
				async (valid) => {
					this.isShowLoading = true;
					if (!valid)
						return this.$message.warning(
							"请补充必填项"
						);
					let formData = new FormData();
					formData.append("file", params.file);
					formData.append(
						"areaCode",
						this.addForm.areaCode
					);
					formData.append(
						"areaName",
						this.addForm.areaName
					);
					formData.append(
						"planType",
						this.addForm.planType
					);
					formData.append(
						"name",
						this.addForm.name
					);
					formData.append(
						"yearStart",
						this.addForm.yearStart
					);
					formData.append(
						"yearStandard",
						this.addForm.yearStandard
					);
					formData.append(
						"yearTarget",
						this.addForm.yearTarget
					);
					formData.append(
						"vectorType",
						this.addForm.vectorType
					);
					const { data: res } =
						await uploadToLeader(formData);
					console.log(res, "res");
					if (res.code === 1) {
						this.isShowLoading = false; // 等待关闭
						this.getTableData(); //组装数据
						this.dialogAddItem = false; // 关闭弹窗
						this.closeAddDialog();
					} else {
						this.isShowLoading = false;
						this.$message.warning(res.msg);
						this.getTableData();
						this.dialogAddItem = false;
						this.closeAddDialog();
					}
				}
			);
		},

		// 更新状态
		async updateStatus(row) {
			let loading = this.$message({
				iconClass: "el-icon-loading",
				message: "正在更新状态,请耐心等待......",
				duration: 0,
				customClass: "prop-search",
			});
			console.log(row);
			let params = {
				pid: row.PID,
			};
			const { data: res } = await getProById(
				params
			);
			console.log(res, "res");
			if (res.code === 1) {
				loading.close();
				Object.assign(row, res.data);
				this.$message.success("状态已更新");
				this.getTableData();
			} else {
				loading.close();
				this.$message.warning(res.msg);
			}
		},

		// 断点续传
		async handleReupload(row) {
			let loading = this.$message({
				iconClass: "el-icon-loading",
				message:
					"正在进行断点续传,请耐心等待......",
				duration: 0,
				customClass: "prop-search",
			});
			let params = {
				pid: row.PID,
			};
			const { data: res } = await reuploadById(
				params
			);
			console.log(res, "res");
			if (res.code === 1) {
				loading.close();
				this.getTableData();
			} else {
				loading.close();
				this.$message.warning(res.msg);
			}
		},

		// 下载文件
		async handleDownload(row) {
			// package-成果包 reply-批复文件
			let typeList = ["package", "reply"];

			let params = {
				pid: row.PID,
			};
			for await (let item of typeList) {
				Object.assign(params, { type: item });
				const { data: res } = await getDownFile(
					params
				);
				console.log(res, "res");
				if (res.code === 1) {
					if (res.data != "") {
						window.open(res.data, "_self");
					}
				} else {
					this.$message.warning(res.msg);
				}
			}
		},

		// 批复文件上传
		async handleReply(params) {
			let formData = new FormData();
			formData.append("file", params.file);
			formData.append("id", this.focusReply.PID);
			const { data: res } = await setUploadReply(
				formData
			);
			if (res.code === 1) {
				this.$message.success("上传成功");
				this.getTableData();
			} else {
				this.$message.warning(res.msg);
			}
		},

		// 当前批复文件行数据
		setFocusReply(row) {
			Object.assign(this.focusReply, row);
			console.log(row, this.focusReply);
		},
	},
};
