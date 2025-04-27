<!--
 * @Author: WCL
 * @Date: 2021-11-19 11:37:51
 * @LastEditors: WCL
 * @LastEditTime: 2022-02-16 13:19:30
 * @FilePath: \webgis\src\components\map\mapcontrol\components\MapSplit.vue
 * @Description: 分屏
-->
<template>
	<div class="">
		<el-button @click="clickCtrlBtn" size="small">
			<i class="el-icon-files"></i>
			<span>分屏</span>
		</el-button>
	</div>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
	name: '',
	props: {},
	components: {},
	data() {
		return {}
	},
	computed: {},
	watch: {},
	created() {},
	mounted() {},
	methods: {
		...mapMutations('map2d-store', ['handleSplit']),
		clickCtrlBtn() {
			this.handleSplit(true)
		},
	},
}
</script>

<style scoped lang="scss">
</style>