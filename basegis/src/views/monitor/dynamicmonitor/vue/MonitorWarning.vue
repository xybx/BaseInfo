<!--
 * @Author: LJX
 * @Date: 2022-01-13 13:28:36
 * @LastEditors: WCL
 * @LastEditTime: 2022-01-14 14:04:55
 * @FilePath: \webgis\src\views\monitor\dynamicmonitor\vue\DynamicMonitor.vue
 * @Description: 实施监督 - 监测预警
-->
<template>
	<div class="monitor-container">
		<el-row class="top">
			<el-col :span="2">
				<el-menu :default-active="menuIndex" class="el-menu-vertical-demo" @select="handleSelect"
					style="height: 100%;">
					<el-menu-item index="1">
						<i class="el-icon-alarm-clock"></i>
						<span slot="title">约束性指标</span>
					</el-menu-item>
					<el-menu-item index="2">
						<i class="el-icon-crop"></i>
						<span slot="title">管控边界</span>
					</el-menu-item>
			</el-menu>
			</el-col>
			<el-col :span="5" class="top-left" v-if="menuIndex == '1'">
				<div>
					<el-card shadow="hover" style="height: 100%;">
						<div slot="header" class="clearfix">
							<!-- <span class="header-txt">选择指标体系</span> -->
							<!-- <el-button style="float: right; padding: 3px 0" type="text" @click="handleCurrDetail">更多 >></el-button> -->
							<el-select v-model="bindingParams.SYSPID" placeholder="选择指标体系" style="width:100%;"
								@change="yearChange">
								<el-option v-for="item in datalist.yearzblist" :key="item.year.PID" :label="item.year.YEAR + item.year.NAME"
									:value="item.year.PID"></el-option>
							</el-select>
						</div>
						<div style="height: 100%; width: 100%;overflow-y: auto;" class="div-content" v-if="analysisResult.length>0">
							<div v-for="item in analysisResult" @click="getDetail(item)">
								<div class="item-title">
									<span>{{ item.name }}</span>
									<span class="year">({{ currentSys.YEAR }})</span>
								</div>
								<div class="item-content">
									<span :class="item.classname">{{ (item.zbvalue == "" || item.zbvalue == null) ? "--" :
										item.zbvalue
									}}</span>
									<span class="unit">{{ item.unit }}</span>
									<!-- <span class="detail">详细<i class="el-icon-arrow-right"></i></span> -->

								</div>
							</div>
						</div>
						<div style="height: 100%; width: 100%;overflow-y: auto;" class="div-content" v-else>
						<div>暂无指标数据！</div>
						</div>
					</el-card>
				</div>

			</el-col>

			<el-col :span="5" class="top-left" v-if="menuIndex == '2'">
				<div>
					<el-card shadow="hover" style="height: 100%;">
						<div slot="header" class="clearfix">
							<span class="header-txt">三线管控边界</span>
						</div>
						<div style="height: 100%; width: 100%;overflow-y: auto;" class="div-content">
							<div v-for="item in sxgkProblemList" @click="getSXGKDetail(item)">
								<div class="item-title">
									<span>{{ item.layer.LAYERNAME }}</span>
								</div>
								<div class="item-content">
									<span class="red">{{ item.projectlist.length }}</span>
									<span class="unit">个疑似问题的项目</span>
								</div>
							</div>
						</div>
					</el-card>
				</div>

			</el-col>

			<el-col :span="17" class="top-center">
				<div>
					<el-card shadow="hover" style="height: 100%">
						<div id="cityField" style="height: 100%; width: 100%"></div>
					</el-card>
				</div>
			</el-col>
		</el-row>
		<el-dialog :title="dialogTitle" :visible.sync="dialog" width="25%" :modal="false" custom-class="modetail"
			:before-close="handleDialogClose" :open="open" v-dialogDrag>
			<div class="div-content-item">
			<div class="dig-content-header">
				<span class="title">监测现状值（{{ currentSys!=null?currentSys.YEAR:0 }}）</span>
				<el-tooltip class="item" effect="dark"
						:content="currentRightZB.descs == '' || currentRightZB.descs == null ? '该指标没有说明' : currentRightZB.descs"
						placement="top-start">
						<i class="el-icon-info" style="color:rgb(45, 85, 159);"></i>
					</el-tooltip>
					<!-- <el-popover placement="top-start" width="100%" trigger="hover"
																																																																																																											:content="currentRightZB.descs=='' ||currentRightZB.descs==null?'该指标没有说明':currentRightZB.descs">
																																																																																																											<i class="el-icon-info" style="color:rgb(45, 85, 159);" slot="reference"></i>
																																																																																																										</el-popover> -->
					<span class="unit">{{ currentRightZB.unit }}</span>
					<span :class="currentRightZB.classname">{{ currentRightZB.zbvalue }}</span>
				</div><br />
				<div>
					<div style="float: left;">
						<span class="title">同比</span><span></span>&nbsp;&nbsp;
						<i class="el-icon-top" v-if="currentRightZB.growthValue > 0"></i>
						<i class="el-icon-bottom" v-else></i>
						<span class="red">{{ currentRightZB.growthValue == '--' ? '--' : currentRightZB.growthValue
						}}</span>
						<span class="unit">{{ currentRightZB.unit }}</span>，
						<i class="el-icon-top" v-if="currentRightZB.growthValue > 0"></i>
						<i class="el-icon-bottom" v-else></i>
						<span class="title">增幅</span><span></span>
						<span class="red">{{ currentRightZB.growthRate == '--' ? '--' : currentRightZB.growthRate }}</span>
						<span class="unit">%</span>
					</div>
				</div><br />
				<div class="dig-content-ghzb">
					<span class="title">规划目标（2035）</span>
					<span class="unit">{{ currentRightZB.unit }}</span>
					<span class="value">{{ currentRightZB.ghzbValue }}</span>
				</div>
			</div>

			<el-divider><i class="el-icon-s-data"></i></el-divider>
			<div class="baseline-container">
				<el-radio-group v-model="tabPosition" style="margin-bottom: 30px;">
					<el-radio-button label="alarmChart">指标预警</el-radio-button>
					<el-radio-button label="statusMonitor">现状监测</el-radio-button>
					<el-radio-button label="changeTrend">历年变化趋势</el-radio-button>
					<!-- <el-radio-button label="spaceDist">空间分布</el-radio-button> -->
				</el-radio-group>
				<Chart chartId="baseline" style="height: 451px;" :chartOption="baselineOption"
					v-if="tabPosition == 'alarmChart'"></Chart>
				<Chart chartId="baseline" style="height: 451px;" :chartOption="statusValueOption"
					v-else-if="tabPosition == 'statusMonitor'"></Chart>
				<Chart chartId="baseline" style="height: 451px;" :chartOption="changeTrendOption"
					v-else-if="tabPosition == 'changeTrend'"></Chart>
				<!--<Chart chartId="baseline" style="height: 451px;" :chartOption="baselineOption" v-else-if="tabPosition == 'spaceDist'"></Chart> -->
			</div>
		</el-dialog>

		<el-dialog :title="dialogSXTitle" :visible.sync="dialogSX" width="25%" :modal="false" custom-class="modetail"
			:before-close="handleSXDialogClose" :open="open" v-dialogDrag>
			<div style="padding: 0.104vw 0.581vw 0.581vw 0.104vw;">
				<div style="display: grid;">
					<span style="font-size: 0.825vw;font-weight: bold;"><i class="el-icon-connection"
							style="color:rgb(45, 85, 159); font-weight: bold; margin-right: 5px;"></i>突破底线面积</span>
					<div style="margin-top: 8px;"><span
							style="font-size: 1.125vw;font-weight: bold;color: red;margin-left: 20px;">{{
								currentSXResult.ctarea }}</span>
						<span style="font-size: 0.725vw;color:darkgray;margin-left: 5px;">平方米</span>
					</div>
				</div><br />
				<div style="display: grid;">
					<span style="font-size: 0.825vw;font-weight: bold;color:red;"><i class="el-icon-warning-outline"
							style="color:red; font-weight: bold; margin-right: 5px;"></i>预警原因</span>
					<span style="font-size: 0.725vw;margin-left: 20px;margin-top: 8px;">存在建设行为突破{{ currentSXResult.layername
					}}</span>
				</div>
			</div>

			<el-divider><i class="el-icon-s-data"></i></el-divider>
			<div class="baseline-container">
				<el-radio-group v-model="tabSXPosition" style="margin-bottom: 30px;">
					<el-radio-button label="xzqChart">行政区预警统计</el-radio-button>
					<el-radio-button label="projectList">突破项目列表</el-radio-button>
				</el-radio-group>
				<Chart chartId="baseline" style="height: 351px;" :chartOption="xzqOptions"
					v-if="tabSXPosition == 'xzqChart'">
				</Chart>
				<div class="table-contain animate__animated animate__fadeIn" v-if="tabSXPosition == 'projectList'">
					<el-table
						:data="currentSXResult.projectlist.slice((currentPage - 1) * pagesize, currentPage * pagesize)"
						border stripe :default-sort="{ prop: 'ctmj', order: 'descending' }" size="small"
						style="overflow-y:auto; height: 400px;">
						<el-table-column prop="objectid" label="OBJECTID" min-width="80" align="center"></el-table-column>
						<el-table-column prop="prjname" label="项目名称" min-width="120" align="center">
						</el-table-column>
						<el-table-column prop="ctmj" label="突破面积" sortable min-width="150" align="center">
						</el-table-column>
						<el-table-column label="操作" min-width="80" align="center" class-name="handle-col">
							<template slot-scope="scope">
								<el-button size="mini" type="primary" plain @click="location(scope.row)">定位</el-button>
							</template>
						</el-table-column>
					</el-table>
					<el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage"
						:page-size="pagesize" layout="pager, next, jumper" :total="currentSXResult.projectlist.length"
						background>
					</el-pagination>
				</div>

				<!--<Chart chartId="baseline" style="height: 451px;" :chartOption="baselineOption" v-else-if="tabPosition == 'spaceDist'"></Chart> -->
			</div>
		</el-dialog>

	</div>
</template>

<script>
import Chart from '@/components/common/chart/Chart.vue';
import {
	getBindingYearZBList,
	getLayers,
	getMapConfigApi,
	getSXGKLayers,
	getZBLayer,
	getSysList,
} from '../api/dynamicmonitor-api';
import CurrentLand from '@/components/monitor/currentland/vue/CurrentLand.vue';
import Map from '@arcgis/core/Map';
import Basemap from '@arcgis/core/Basemap';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import * as query from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { GetBaseMapAreaLayers } from '@/utils/common-map-method';

export default {
	name: '',
	props: {},
	components: { Chart, CurrentLand },
	data() {
		return {
			currentPage: 1,
			pagesize: 7,
			pagesizeArr: [7, 14, 21, 28],
			tabSXPosition: 'xzqChart',
			xzqOptions: {},
			dialogSXTitle: '',
			dialogSX: false,
			menuIndex: '1',
			tabPosition: 'alarmChart',
			dialog: false,
			dialogTitle: "",
			bindingParams: {
				SYSPID: '',				
			},
			currentSys:null,//当前选择的指标体系
			moduleList: [],
			moduleId: null,
			layerlist: [],
			focusHead: '',
			view: null,
			datalist: [],
			zblist: [],
			ghzblist: [],
			analysisResult: [],//分析结果
			currentRightZB: {  ////当前选中的指标项			
				name: '',
				code: '',
				unit: '',
				descs: '',
				zbvalue: '',
				isAlarm: false,
				alarmValue: '-',
				alarmRate: '-',
				growthValue: '-',
				ghzbValue: '-',
				prevValue: '-',
				classname: '-',
			},
			//预警图表
			baselineOption: {},
			//现状监测图表
			statusValueOption: {},
			//变化趋势
			changeTrendOption: {},
			//三线疑似问题项目（根据行政区统计）
			sxgkProblemList: [],
			sxgkLayers: [],//三线图层，行政区图层，项目红线图层
			xzqLayer: null,
			xzqData: null,//行政区数据包含图形
			projectHXLayer: null,
			sxgkLoading: null,
			sxgkCTProjectLayer: [], //三线管控冲突项目图层
			currentSXResult: {
				layename: '',
				ctarea: 0,
				xzqlist: [],
				projectlist: []
			},//当前选中的三线图层
			//冲突图形符号-面
			intersectsSymbol: {
				type: "simple-fill",
				color: [255, 0, 0, 0.7],
				style: "backward-diagonal",
				outline: {
					color: "red",
					width: 2,
				},
			},

		};
	},
	computed: {},
	watch: {},
	created() { },
	async mounted() {
		await this.getYearZBList();
		await this.getLayerList();
		this.getMapConfig('监测预警');
	},
	methods: {
		handleSelect(key, keyPath) {
			this.dialog = false;
			this.menuIndex = key;
			this.view.map.removeAll();
			this.view.graphics.removeAll();
			if (this.menuIndex == 2) {
				this.sxgkProblemList = [];
				this.sxgkLayers = [];

				//获取三线统计
				this.getSXGKLayer();
			}
			// console.log(key, keyPath);
		},
		handleDialogClose() {
			this.dialog = false;
		},
		handleSXDialogClose() {
			this.dialogSX = false;
		},
		open() {
			debugger;
		},
		//指标项分析展示
		getDetail(item) {
			this.view.graphics.removeAll();
			this.dialog = true;
			console.log("item", item);
			this.dialogTitle = item.name;
			this.currentRightZB = item;
			this.getAlarmChart();
			this.getStatusMonitorChart();
			this.getChangeTrendChart();

			//加载图层
			this.getLoadZBLayer(item)
		},

		//获取指标绑定的图层服务地址
		async getLoadZBLayer(item) {
			debugger;
			let app = this;
			let params = {
				uid: window.sessionStorage.getItem("userid"),
				year: this.currentSys.YEAR,
				zbcode: item.code
			}
			const { data: res } = await getZBLayer(params);
			if (res.code === 1) {
				let layer = res.data;
				if (layer != null) {
					let queryParams = new Query();
					queryParams.where = layer.QUERYWHERE;
					queryParams.outFields = ['*'];
					queryParams.returnGeometry = true;
					query.executeQueryJSON(layer.LAYERURL, queryParams).then(function (result) {
						if (result != null && result.features.length > 0) {
							console.log("123", result);
							result.features.forEach(async feature => {
								let graphic = new Graphic({
									geometry: feature.geometry,
									symbol: app.intersectsSymbol,
								});
								app.view.graphics.add(graphic);
							})
						}
					});
				}
			}
			else {
				this.$message.error(res.msg);
			}
		},

		//年份指标列表
		async getYearZBList() {
			let params = {
				uid: window.sessionStorage.getItem("userid")
			}
			const { data: res } = await getBindingYearZBList(params);
			if (res.code === 1) {
				this.datalist = res.data;
				this.bindingParams.SYSPID = Number(this.datalist.yearzblist[0].year.PID);
				this.currentSys=this.datalist.yearzblist[0].year;
				//this.bindingParams.YEAR=this.datalist.yearzblist[0].year.YEAR;
				this.zblist = this.datalist.yearzblist[0].zblist;
				this.ghzblist = this.datalist.ghzblist;
				this.zbAlarmAnalysis();

			} else {
				this.$message.error(res.msg);
			}
		},

		//指标预警分析
		zbAlarmAnalysis() {
			//console.log(this.analysisResult, "this.analysisResult");
			//获取上一年指标现状值
			let prevYear = Number(this.currentSys.YEAR) - 1;
			let prevZblist = [];
			this.datalist.yearzblist.forEach(item => {
				if (item.year.YEAR == prevYear) {
					prevZblist = item.zblist;
				}
			});
			for (let i = 0; i < this.zblist.length; i++) {
				let zb = this.zblist[i];
				let isAlarm = false;
				let alarmValue = 0;
				let alarmRate = 0;
				let ghzbValue = 0;
				//判断是否超规划目标值
				for (let j = 0; j < this.ghzblist.length; j++) {
					let ghzb = this.ghzblist[j];
					if (zb.CODE == ghzb.CODE) {
						ghzbValue = ghzb.ZBVALUE;
						if (Number(zb.ZBVALUE) < Number(ghzb.ZBVALUE)) {
							isAlarm = true;
							alarmValue = Number(zb.ZBVALUE) - Number(ghzb.ZBVALUE);
							alarmRate = (alarmValue / Number(ghzb.ZBVALUE)) * 100;
						}
						else if (Number(zb.ZBVALUE) === Number(ghzb.ZBVALUE)) {
							isAlarm = false;
							alarmValue=0;
							alarmRate=0;
						}
						else
						{
							isAlarm = false;
							alarmValue = Number(zb.ZBVALUE) - Number(ghzb.ZBVALUE);
							alarmRate = (alarmValue / Number(ghzb.ZBVALUE)) * 100;
						}
					}
				}

				//与前一年数据做比较，如果前一年没有数据，则显示--
				//环比增长，增幅率计算
				let growthValue = 0;
				let growthRate = 0;
				let prevValue = 0;
				prevZblist.forEach(item => {
					if (zb.CODE == item.CODE) {
						prevValue = item.ZBVALUE;
						let zbvalue = 0;
						if (prevValue == "" || prevValue == null || zb.ZBVALUE == "" || zb.ZBVALUE == null) {
							growthValue = "--";
						}
						else {
							if (Number(zb.ZBVALUE) >= 0 && Number(prevValue) >= 0) {
								growthValue = (Number(zb.ZBVALUE) - Number(item.ZBVALUE)).toFixed(3);
								if (Number(item.ZBVALUE) == 0) {
									growthRate = '--';
								}
								else {
									growthRate = ((growthValue / Number(item.ZBVALUE)) * 100).toFixed(3);
								}
							}
						}
					}
				});
				//console.log((zb.ZBVALUE=="" || zb.ZBVALUE==null || ghzbValue=="" || ghzbValue==null));
				let classname = isAlarm ? "red" : ((zb.ZBVALUE == "" || zb.ZBVALUE == null || ghzbValue == "" || ghzbValue == null) ? "--" : "green");
				//console.log(classname, isAlarm, ghzbValue);
				//console.log(zb, "zb");
				this.analysisResult.push({
					name: zb.NAME,
					code: zb.CODE,
					unit: zb.UNIT,
					descs: zb.DESCS,
					zbvalue: (zb.ZBVALUE == "" || zb.ZBVALUE == null) ? "--" : zb.ZBVALUE,
					isAlarm: isAlarm,
					alarmValue: alarmValue,
					alarmRate: alarmRate,
					growthValue: growthValue,
					growthRate: growthRate,
					ghzbValue: (ghzbValue == "" || ghzbValue == null) ? "--" : ghzbValue,
					prevValue: prevValue,
					classname: classname,
					//year:this.bindingParams.year
				});
			}
		},
		//年份选择时间
		yearChange(obj) {
			this.analysisResult = [];
			this.bindingParams.SYSPID = obj;
			console.log("obj", obj);
			this.zblist = [];
			console.log(this.datalist, "this.datalist");
			this.datalist.yearzblist.forEach(item => {
				if (item.year.PID== obj) {
					this.currentSys=item.year;
					this.zblist = item.zblist;
				}
			});
			this.zbAlarmAnalysis();
		},
		// 获取底图配置
		async getMapConfig(modulename) {
			let params = {
				uid: sessionStorage.getItem('userid'),
				modulename,
			};
			const { data: res } = await getMapConfigApi(params);

			if (res.code === 1) {
				this.initMap(res.data);
			} else {
				this.$message.error(res.msg);
			}
		},

		// 初始化地图
		initMap(data) {
			// 底图类型
			let baselayer = null;
			if (data.TYPE == 'Image') {
				baselayer = new MapImageLayer({
					url: data.URL,
				});
			} else if (data.TYPE == 'Tile') {
				baselayer = new TileLayer({
					url: data.URL,
				});
			}

			// 底图
			let basemap = new Basemap({
				baseLayers: [baselayer],
				title: 'basemap',
				id: 'basemap',
			});

			// 地图
			let map = new Map({
				basemap,
			});
			debugger;

			// 地图视图
			this.view = new MapView({
				container: 'cityField',
				map,
				zoom: 3,
			});
			console.log(this.view);

			//是否对底图做蒙版
			if (isBaseMapCut) {
				GetBaseMapAreaLayers(view);
				view.background = { // autocasts new ColorBackground()
					color: [255, 255, 255, 1]  // autocasts as new Color()
				};
			}


			//项目定位的图层
			let locationLayer = new GraphicsLayer({
				id: 'locationLayer',
				title: '项目定位',
			});
			this.view.map.add(locationLayer);
			// 去掉地图logo和缩放
			this.view.ui.remove(['attribution', 'zoom']);
		},

		// 获取地图图层列表
		async getLayerList() {
			let params = {
				uid: sessionStorage.getItem('userid'),
			};
			const { data: res } = await getLayers(params);
			if (res.code === 1) {
				this.layerlist = res.data;
			} else {
				this.$message.error(res.msg);
			}
		},

		// 标题点击地图叠加
		loadLayer(title) {
			this.focusHead = title;
			console.log(title, 'title');
			this.view.map.removeAll();
			this.layerlist.map((item) => {
				console.log(item);
				if (title == item.LAYERNAME) {
					let layer = new FeatureLayer({
						url: item.LAYERURL,
						title: item.LAYERNAME,
					});
					this.view.map.add(layer);
				}
			});
		},

		//指标预警图表
		async getAlarmChart() {
			let resdata = [["年份", "现状值", "规划目标（2035）"]];
			let unit = "";
			//let yearlist = this.sortKey(this.datalist.yearzblist, "year");
			this.datalist.yearzblist.forEach(item => {
				var barvalue = [];
				barvalue.push(item.year.YEAR);
				item.zblist.forEach(zb => {
					if (zb.CODE == this.currentRightZB.code) {
						unit = zb.UNIT;
						barvalue.push(zb.ZBVALUE);
					}
				});
				this.ghzblist.forEach(ghzb => {
					if (ghzb.CODE == this.currentRightZB.code) {
						barvalue.push(ghzb.ZBVALUE);
					}
				});
				resdata.push(barvalue);
			});
			this.baselineOption = {
				toolbox: {
					feature: {
						dataView: { show: true, readOnly: false },
						// magicType: { show: true, type: ['line', 'bar'] },
						// restore: { show: true },
						saveAsImage: { show: true }
					}
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: '#999',
						},
					},
				},
				legend: {},
				grid: {
					bottom: '10%',
				},
				dataset: {
					source: resdata.reverse(),
				},
				xAxis: [
					{
						type: 'category',
					},
				],
				yAxis: [
					{
						type: 'value',
						name: '单位:' + unit,
						axisLabel: {
							formatter: '{value} ',
						},
					}
				],
				series: [
					{
						type: 'bar',
					},
					{
						type: 'line',
						lineStyle: {
							color: 'red',
						}
					},
				],
			};
		},
		//现状监测
		async getStatusMonitorChart() {
			let unit = '';
			let resdata = [["年份", "现状值", "增幅率"]];
			//this.datalist.yearzblist = this.sortKey(this.datalist.yearzblist, "year");
			let prevzb = null;
			let prevValue = 0;
			let growthValue = 0;
			let growthRate = 0;
			this.datalist.yearzblist.forEach(item => {
				var barvalue = [];
				barvalue.push(item.year.YEAR);
				item.zblist.forEach(zb => {
					if (zb.CODE == this.currentRightZB.code) {
						unit = zb.UNIT;
						barvalue.push(zb.ZBVALUE)

						let zbvalue = 0;
						if (prevValue == "" || prevValue == null || zb.ZBVALUE == "" || zb.ZBVALUE == null) {
							growthValue = "--";
							barvalue.push(0)
						}
						else {
							console.log(prevValue);
							console.log(zb.ZBVALUE);
							if (Number(zb.ZBVALUE) >= 0 && Number(prevValue) >= 0) {
								growthValue = (Number(zb.ZBVALUE) - Number(prevValue)).toFixed(3);
								if (Number(zb.ZBVALUE) == 0) {
									growthRate = '--';
									barvalue.push(0)
								}
								else {
									growthRate = ((Number(growthValue) / Number(zb.ZBVALUE)) * 100).toFixed(3);
									barvalue.push(growthRate)
								}
							}
						}
						prevValue = zb.ZBVALUE;
					}
				});
				// this.datalist.yearzblist.forEach(item => {
				// 	if (this.currentRightZB.code == item.code) {
				// 		prevValue = item.zbvalue;

				// 	}
				// });
				// this.analysisResult.forEach(res => {
				// 	if (res.code == this.currentRightZB.code) {
				// 		barvalue.push(res.growthRate)
				// 	}
				// });
				resdata.push(barvalue);
			});
			this.statusValueOption = {
				toolbox: {
					feature: {
						dataView: { show: true, readOnly: false },
						// magicType: { show: true, type: ['line', 'bar'] },
						// restore: { show: true },
						saveAsImage: { show: true }
					}
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: '#999',
						},
					},
				},
				legend: {},
				grid: {
					bottom: '10%',
				},
				dataset: {
					source: resdata.reverse(),
				},
				xAxis: [
					{
						type: 'category',
					},
				],
				yAxis: [
					{
						type: 'value',
						name: '单位:' + unit,
						axisLabel: {
							formatter: '{value} ',
						},
					},
					{
						type: 'value',
						name: '单位:%',
						axisLabel: {
							formatter: '{value} ',
						},
					},
				],
				series: [
					{
						type: 'bar',
					},
					{
						type: 'line',
						yAxisIndex: 1,
					},
				],
			};
		},

		//变化趋势
		async getChangeTrendChart() {
			let resdata = [["年份", "增量"]];
			let unit = '';
			//this.datalist.yearzblist = this.sortKey(this.datalist.yearzblist, "year");
			//let prevYearValue = 0;
			
			//this.currentSys;
			this.datalist.yearzblist.forEach(item => {
				var barvalue = [];
				barvalue.push(item.year.YEAR);
				
				item.zblist.forEach(zb => {
					if (zb.CODE == this.currentRightZB.code) {
						unit = zb.UNIT;						
						if (zb.ZBVALUE != "" && zb.ZBVALUE != null) {
							barvalue.push(Number(zb.ZBVALUE)-Number(this.currentRightZB.zbvalue));
							//prevYearValue = zb.ZBVALUE;
						}
						else {
							barvalue.push(0);
							//prevYearValue == 0;
						}
					}
				});
				//barvalue=barvalue.reverse();
				resdata.push(barvalue);
			});
			
			this.changeTrendOption = {
				toolbox: {
					feature: {
						dataView: { show: true, readOnly: false },
						// magicType: { show: true, type: ['line', 'bar'] },
						// restore: { show: true },
						saveAsImage: { show: true }
					}
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: '#999',
						},
					},
				},
				legend: {},
				grid: {
					bottom: '10%',
				},
				dataset: {
					source: resdata.reverse(),
				},
				xAxis: [
					{
						type: 'category',
					},
				],
				yAxis: [
					{
						type: 'value',
						name: '单位:' + unit,
						axisLabel: {
							formatter: '{value} ',
						},
					}
				],
				series: [
					{
						type: 'bar',
					}
				],
			};
		},

		//加载三线图层
		getSXGKDetail(item) {
			console.log("item", item);
			let app = this;
			this.dialogSX = true;
			app.view.map.removeAll();
			app.view.graphics.removeAll();
			app.currentSXLayer = item;

			this.dialogSXTitle = "突破" + item.layer.LAYERNAME + "情况预警清单";

			//加载三线图层
			let layer = new MapImageLayer({
				url: item.layer.LAYERURL,
				title: item.layer.LAYERNAME,
				sublayers: [{
					id: item.layer.LAYERID,
					visible: true
				}]
			});
			this.view.map.add(layer);

			//加载突破三线的红线图层
			let layerct = new MapImageLayer({
				url: item.ctProjectLayer.LAYERURL,
				title: item.ctProjectLayer.LAYERNAME,
				sublayers: [{
					id: item.ctProjectLayer.LAYERID,
					visible: true
				}]
			});
			this.view.map.add(layerct);

			//加载冲突图形到地图上
			for (let i = 0; i < item.projectlist.length; i++) {
				const project = item.projectlist[i];
				let graphic = new Graphic({
					geometry: project.projectgeo,
					symbol: app.intersectsSymbol,
				});
				app.view.graphics.add(graphic);
			}
			this.getStatisticsChart(item);
		},

		//弹框信息数据
		async getStatisticsChart(item) {
			this.currentSXResult.layername = item.layer.LAYERNAME;
			//计算突破面积
			let ctarea = item.projectlist.reduce((sum, e) => sum + Number(e.ctmj || 0), 0)
			this.currentSXResult.ctarea = ctarea.toFixed(3);
			this.currentSXResult.projectlist = item.projectlist;
			this.getXZQList(item);
		},

		//获取行政区列表
		async getXZQList(item) {
			let app = this;
			app.currentSXResult.xzqlist = [];
			//查询所有行政区边界范围
			var queryParams = new Query();
			queryParams.where = '1=1';
			queryParams.outFields = ['*'];
			queryParams.returnGeometry = true;
			query.executeQueryJSON(this.xzqLayer.LAYERURL + "/" + this.xzqLayer.LAYERID, queryParams).then(function (result) {
				if (result != null && result.features.length > 0) {

					result.features.forEach(async feature => {
						let xzqGeo = feature.geometry;
						let xzqName = feature.attributes["XZQMC"];
						let xzqDM = feature.attributes["XZQDM"];
						let xzqMJ = feature.attributes["SHAPE.AREA"];
						//let ydmj = feature.attributes["YDMJ"];						
						let xzq_obj = {
							geo: xzqGeo,
							name: xzqName,
							dm: xzqDM,
							mj: xzqMJ,
							//ydmj: ydmj,
							ct_projects: item.projectlist.filter(p => p.xzqdm == xzqDM),
						};
						app.currentSXResult.xzqlist.push(xzq_obj);
					});

					console.log(app.currentSXResult.xzqlist, "xzqlist");
					app.getXZQChart(app.currentSXResult.xzqlist);
				}
			});
		},

		////行政区统计图表
		async getXZQChart(xzqlist) {
			debugger;
			let resdata = [["行政区", "疑似问题项目个数"]];
			let unit = "";
			let xzqsort = [];
			xzqlist.forEach(item => {
				xzqsort.push({
					name: item.name,
					num: item.ct_projects.length
				});
			});
			//this.datalist.yearzblist = this.sortKey(this.datalist.yearzblist, "year");
			xzqsort = this.sortKey(xzqsort, "num");
			xzqsort.forEach(item => {
				var barvalue = [];
				barvalue.push(item.name);
				barvalue.push(item.num);
				resdata.push(barvalue);
			});
			this.xzqOptions = {
				toolbox: {
					feature: {
						dataView: { show: true, readOnly: false },
						saveAsImage: { show: true }
					}
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: '#999',
						},
					},
				},
				legend: {},
				grid: {
					bottom: '10%',
				},
				dataset: {
					source: resdata,
				},
				yAxis: [
					{
						type: 'category',
					},
				],
				xAxis: [
					{
						type: 'value',
						name: '单位:个数',
						axisLabel: {
							formatter: '{value} ',
						},
					}
				],
				series: [
					{
						type: 'bar',
					}
				],
			};
		},

		//三线管控
		async getSXGKLayer() {
			this.sxgkProblemList = [];
			this.sxgkCTProjectLayer = [];
			// this.sxgkLoading = this.$notify({
			// 	iconClass: 'el-icon-loading',
			// 	message: '正在监测三线管控突破边界项目,请耐心等待......,',
			// 	duration: 0,
			// 	customClass: 'prop-search',
			// });
			this.sxgkLoading = this.$message({
				iconClass: 'el-icon-loading',
				message: '正在监测三线管控突破边界项目,请耐心等待......',
				duration: 0,
				customClass: 'prop-search',
				offset: 50,
			});
			let params = {
				uid: window.sessionStorage.getItem("userid")
			};
			const { data: res } = await getSXGKLayers(params);
			if (res.code === 1) {
				this.sxgkLayers = res.data;
				this.sxgkLayers.forEach(layer => {
					if (layer.ISASSIST == 0) {
						this.sxgkProblemList.push({
							layer: layer,
							ctProjectLayer: null,
							projectlist: [],
						});
					}
					if (layer.ISASSIST == 1) {
						this.xzqLayer = layer;
					}
					if (layer.ISASSIST == 2) {
						this.sxgkCTProjectLayer.push(layer);
					}
				});

				for (let i = 0; i < this.sxgkCTProjectLayer.length; i++) {
					const item = this.sxgkCTProjectLayer[i];
					for (let j = 0; j < this.sxgkProblemList.length; j++) {
						const sxitem = this.sxgkProblemList[j];
						if (item.TYPEID == sxitem.layer.TYPEID) {
							let ctProjectLayer = {
								ctProjectLayer: item
							};
							Object.assign(sxitem, ctProjectLayer);
						}
					}
				}
				console.log("this.sxgkProblemList", this.sxgkProblemList);
				//意思问题图斑根据行政区统计
				//todo:
				await this.getSXCTProjectList();
			}
			else {
				this.sxgkLoading.close();
				this.$message.error(res.msg);
			}
		},

		//获取三线冲突项目列表
		async getSXCTProjectList() {
			let app = this;
			this.sxgkProblemList.forEach(async item => {
				if (item.ctProjectLayer.LAYERURL == "" || item.ctProjectLayer.LAYERURL == null) {
					return;
				}
				var queryParams = new Query();
				queryParams.where = '1=1';
				queryParams.outFields = ['*'];
				queryParams.returnGeometry = true;
				let result = await query.executeQueryJSON(item.ctProjectLayer.LAYERURL + "/" + item.ctProjectLayer.LAYERID, queryParams);
				if (result != null && result.features.length > 0) {
					app.sxgkLoading.close();
					console.log("projectList:" + item.layer.LAYERNAME, result.features.length);
					for (let j = 0; j < result.features.length; j++) {
						const project = result.features[j];
						let projectInfo = {
							prjname: project.attributes["项目名称"],
							//prjydmj: project.attributes["YDMJ"],
							prjmj: project.attributes["SHAPE.AREA"],
							xzqdm: project.attributes["XZQDM"],
							ctmj: project.attributes["SHAPE.AREA"],
							objectid: project.attributes["OBJECTID"],
							projectgeo: project.geometry,
						};

						item.projectlist.push(projectInfo);
					}
				}
				else { app.sxgkLoading.close(); }
			});
		},
		//排序
		sortKey(array, key) {
			return array.sort(function (a, b) {
				var x = a[key];
				var y = b[key];
				return x <y ? -1 : x > y ? 1 : 0;
			});
		},

		// 当前页码改变
		handleCurrentChange(val) {
			this.currentPage = val;
			//this.getTableData(this.searchform);
		},

		//定位
		location(row) {
			var locationLayer = this.view.map.findLayerById('locationLayer');
			if (locationLayer) {
				locationLayer.removeAll();
			}
			else {
				//项目定位的图层
				locationLayer = new GraphicsLayer({
					id: 'locationLayer',
					title: '项目定位',
				});
				this.view.map.add(locationLayer);
			}
			let graphic = new Graphic({
				geometry: row.projectgeo,
				symbol: {
					type: "simple-fill",
					color: [255, 0, 0, 0.7],
					style: "solid",
					outline: {
						color: "red",
						width: 2,
					},
				}
			});
			locationLayer.add(graphic);

			this.view.center = graphic.geometry.extent.center;
			this.view.extent=graphic.geometry.extent;
			

		},
	},
};

</script>

<style scoped lang="scss">
@import '../style/monitorwarning.scss';
</style>