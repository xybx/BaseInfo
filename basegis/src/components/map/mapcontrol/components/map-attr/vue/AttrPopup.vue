<!--
 * @Author: WCL
 * @Date: 2021-11-22 16:09:54
 * @LastEditors: sgz
 * @LastEditTime: 2021-11-23 15:31:33
 * @FilePath: \fq-wclf:\国土空间规划\标准版版本\wcl-standard\webgis\src\components\map\mapcontrol\components\map-attr\vue\AttrPopup.vue
 * @Description: 属性弹窗
-->
<template>
	<div class="">
		<el-dialog
			:visible.sync="attrdialogstatus"
			custom-class="arcdialog"
			:before-close="handleAttrClose"
			:modal="false"
			title="属性"
			center
		>
			<div class="prop-sel">
				<el-select
					v-model="nameTit"
					@change="nameClick"
					value-key="value"
					size="small"
					popper-class="selBox"
				>
					<el-option
						v-for="item in namelist"
						:key="item.value"
						:label="item.name"
						:value="item"
					></el-option>
				</el-select>
				<span class="count-box">
					共
					<span class="count">{{ namelist.length }}</span>
					项
				</span>
			</div>
			<div class="tags">
				<el-tag
					v-for="(item, index) in tagList"
					:key="index"
					@click="changeTag(item)"
					:class="{ focusTag: focusTag == item.value }"
				>
					{{ item.displayfieldvalue }}
				</el-tag>
			</div>
			<el-table
				:data="attrTableData"
				border
				tooltip-effect="dark"
				stripe
				size="small"
			>
				<el-table-column prop="name" label="属性"></el-table-column>
				<el-table-column prop="value" label="属性值"></el-table-column>
			</el-table>
		</el-dialog>
	</div>
</template>

<script>
export { default } from '../js/attrpopup'
</script>

<style scoped lang="scss">
@import '../style/attrpopup.scss';
</style>