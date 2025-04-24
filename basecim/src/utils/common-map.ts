import BuildingSceneLayer from '@arcgis/core/layers/BuildingSceneLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import IntegratedMeshLayer from '@arcgis/core/layers/IntegratedMeshLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import Point from '@arcgis/core/geometry/Point';
import TileInfo from '@arcgis/core/layers/support/TileInfo';

/*
    根据类型渲染地图服务
    data对象：
    @kind 类型：1：TileLayer / 切片图层 - arcgis；
                2：MapImageLayer / 动态图层 - arcgis；
                3：SceneLayer / 三维场景图层 - arcgis；
                4：ElevationLayer / 高程图层 - arcgis；
                5：WebTileLayer / 网页切片图层 - arcgis；
                6：IntegratedMeshLayer / 倾斜摄影图层 - arcgis；
                7：BuildingSceneLayer / 建筑场景图层 - arcgis；
                8：FeatureLayer / 要素图层 - arcgis；
                9： UrlTemplateImagery/高德，谷歌-cesium；
                10：WebMapTileServiceImagery/影像服务，天地图-cesium；
                11：BingMapsImagery/Bing地图影像-cesium；
                12：ArcGisMapServerImagery/ArcGIS服务-cesium；
                13：CesiumTerrainProvider/ceisum标准地形图-cesium；
                14：GeoJsonDataSource/geojson服务-cesium；
                15：KmlDataSource/kml矢量数据-cesium；
                16：Cesium3DTileset/倾斜摄影-cesium；
                17：webMapServiceImagery/geoServe-cesium；
                18：WMTS/geoserve-cesium；
    @pid 数据pid，唯一
    @label 数据显示名称
    @url 地图服务地址
    @opacity 透明度值为 0~100
*/
export const initLayerByKind = async (data: any, isClick: boolean) => {
    let layer = <any>null;
    switch (data.kind) {
        case 1:
            layer = new TileLayer({
                id: data.pid,
                url: data.url,
                title: data.label,
                visible: isClick,
                opacity: data.opacity / 100,
            });
            break;
        case 2:
            layer = new MapImageLayer({
                id: data.pid,
                url: data.url,
                title: data.label,
                visible: isClick,
                opacity: data.opacity / 100,
                imageFormat: 'png8',
                dpi: 64,
            });
            break;
        case 3:
            layer = new SceneLayer({
                id: data.pid,
                url: data.url,
                title: data.label,
                visible: isClick,
                opacity: data.opacity / 100,
                popupEnabled: false,
                outFields: ['*'],
                elevationInfo: {
                    mode: 'relative-to-ground',
                    // mode: 'absolute-height',
                },
            } as any);
            break;
        case 4:
            layer = new ElevationLayer({
                id: data.pid,
                url: data.url,
                title: data.label,
                visible: isClick,
                opacity: data.opacity / 100,
            });
            break;
        case 5:
            layer = new WebTileLayer({
                id: data.pid,
                urlTemplate: data.url + JSON.parse(data.tileinfo).tk,
                title: data.label,
                visible: isClick,
                opacity: data.opacity / 100,
                subDomains: JSON.parse(data.tileinfo).subDomains,
                tileInfo: new TileInfo({
                    dpi: JSON.parse(data.tileinfo).tileInfo.dpi,
                    format: JSON.parse(data.tileinfo).tileInfo.format,
                    spatialReference: JSON.parse(data.tileinfo).tileInfo
                        .spatialReference,
                    size: JSON.parse(data.tileinfo).tileInfo.size,
                    origin: new Point(
                        JSON.parse(data.tileinfo).tileInfo.origin
                    ),
                    lods: JSON.parse(data.tileinfo).tileInfo.lods,
                }),
                spatialReference: JSON.parse(data.tileinfo).tileInfo
                    .spatialReference,
                fullExtent: JSON.parse(data.tileinfo).fullExtent,
            } as any);
            break;
        case 6:
            layer = new IntegratedMeshLayer({
                id: data.pid,
                url: data.url,
                title: data.label,
                visible: isClick,
                opacity: data.opacity / 100,
                elevationInfo: {
                    //mode: 'relative-to-ground',
                    mode: 'absolute-height',
                },
            });
            break;
        case 7:
            layer = new BuildingSceneLayer({
                id: data.pid,
                url: data.url,
                title: data.label,
                visible: isClick,
                opacity: data.opacity / 100,
            });
            break;
        case 8:
            layer = new FeatureLayer({
                id: data.pid,
                url: data.url,
                title: data.label,
                visible: isClick,
                opacity: data.opacity / 100,
                screenSizePerspectiveEnabled: false,
                // elevationInfo 规划会商-方案汇演 设置为absolute-height;其余暂不设置
                elevationInfo: {
                    // mode:'relative-to-ground'
                    mode: 'absolute-height',
                },
            });
            break;

        default:
            break;
    }
    console.log(layer, 'initLayer');

    return layer.load();
};
