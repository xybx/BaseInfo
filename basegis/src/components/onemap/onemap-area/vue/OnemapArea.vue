<!--
 * @Author: WCL
 * @Date: 2021-11-26 14:43:58
 * @LastEditors: WCL
 * @LastEditTime: 2022-03-15 14:08:32
 * @FilePath: \webgis\src\components\onemap\onemap-area\vue\OnemapArea.vue
 * @Description: 一张图-行政区划
-->
<template>
	<div class="">
		<!-- 行政区划 -->
		<el-dialog
			:title="comTitle"
			:visible.sync="dialogVisible"
			:modal="false"
			:close-on-click-modal="false"
			custom-class="quhua"
			:before-close="closeDialog"
			v-if="dialogVisible"
			v-dialogDrag
		>
			<span>
				<el-form
					:inline="true"
					:model="formInline"
					class="demo-form-inline"
					size="small"
				>
					<el-input
						placeholder="请输入查询地名"
						v-model.trim="formInline.keywords"
						class="input-with-select"
						clearable
					>
						<el-button
							slot="append"
							icon="el-icon-search"
							@click="search"
						></el-button>
					</el-input>
				</el-form>
				<div class="cunzhen" v-show="!showRes">
					<div class="cunzhentxt">
						<div>镇界</div>
						<div>村界</div>
					</div>
					<el-tabs
						v-model="activeCunzhen"
						@tab-click="tabClick"
						v-loading="tabloading"
						element-loading-text="列表加载中"
					>
						<el-tab-pane
							v-for="item in zhenList"
							:key="item.id"
							:name="'' + item.id"
							:label="item.label"
						>
							<el-link
								v-for="item in cunList"
								:key="item.id"
								@click="clickLink(item)"
								:class="{ focusLink: focusLink == item.xzqdm }"
								>{{ item.label }}</el-link
							>
						</el-tab-pane>
					</el-tabs>
				</div>
				<div class="search-cunzhen" v-show="showRes">
					<el-link
						v-for="(item, index) in resList"
						:key="index"
						@click="clickLink(item)"
						:class="{ focusLink: focusLink == item.xzqdm }"
					>
						{{ item.label }}
					</el-link>
				</div>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/onemap-area'
</script>

<style scoped lang="scss">
@import '../style/onemap-area.scss';
</style>