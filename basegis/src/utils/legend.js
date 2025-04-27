import store from "../store/index";
import { getAllOpenLayers } from "@/utils/common-map-method.js";
import { getLegend } from "@/utils/common-api";

// 图例数据
export function legendVal() {
	const res = getAllOpenLayers();
	console.log(res, "res");
	let arr = [];
	res.map(async (item) => {
		let serverLegend = {
			servername: item.layername,
			layers: [],
		};
		const url = item.layerurl;
		const { data } = await getLegend(url);
		item.sublayer.forEach((layerid) => {
			let _layer = data.layers.filter(
				(layer) => layer.layerId == layerid
			)[0];
			serverLegend.layers.push(_layer);
		});
		arr.push(serverLegend);
		console.log(arr, "图层图例数据");
		let layers = [];
		arr.map((item) => {
			if (item.layers.length > 0) {
				item.layers.map((val) => {
					if (val.legend.length > 0) {
						val.legend.map((keys) => {
							if (
								keys.imageData.indexOf(
									"data:image/png;base64,"
								) == -1
							) {
								keys.imageData = `data:image/png;base64, ${keys.imageData}`;
							}
						});
					}
				});
			}
			layers.push(item);
			console.log(layers);
			store.commit(
				"map2d-store/handLegend",
				layers
			);
			return item;
		});
	});
}
