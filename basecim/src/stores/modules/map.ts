import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

/*
    底图
*/
export const basemapStore = defineStore('basemap', () => {
    const baseInfo = ref<any>();
    const handleBasemap = (base: any) => {
        baseInfo.value = base;
    };

    return { baseInfo, handleBasemap };
});

/*
    主地图实例
*/
export const viewStore = defineStore('view', () => {
    // 地图实例
    const mapInstance = ref<any>();
    const handleView = (view: any) => {
        mapInstance.value = view;
    };
   

    // 分屏地图实例
    const splitInstance = ref<any>();
    const handleSplitView = (view: any) => {
        splitInstance.value = view;
    };

    /*
        分屏地图数组
    */
    const splitViewArr = ref<any>([]);
    const handleSplitArr = (viewArr: any) => {
        splitViewArr.value = viewArr;
    };

    // 分屏状态
    const viewSplit = ref(false);
    const handleSplit = (split: boolean) => {
        viewSplit.value = split;
    };
    /*
        分屏模式类型
        0-默认不分屏；1-双屏；2-三屏；3-一主三副；4-四分屏
    */
    const splitMode = ref<number>(0);
    const handleSplitMode = (mode: number) => {
        splitMode.value = mode;
    };

    // 指南针
    const compass = ref<any>();
    const handleCompass = (compass: any) => {
        compass.value = compass;
    };

    // 最大俯仰角
    const maxTilt = ref<any>(179.5);
    const handleMaxTilt = (val: number) => {
        maxTilt.value = val;
    };

    /* 联动 */
    const splitLendon = ref(false);
    const handleLendon = (lendon: boolean) => {
        splitLendon.value = lendon;
    };

    /* 联动地图实例 */
    const lendonView = ref<any>();
    const handleLendonView = (view: any) => {
        lendonView.value = view;
    };

    /* 卷帘地图 */
    const splitSwipe = ref(false);
    const handleSwipe = (swipe: boolean) => {
        splitSwipe.value = swipe;
    };

    /* 卷帘地图实例 */
    const swipeView = ref<any>();
    const handleSwipeView = (view: any) => {
        swipeView.value = view;
    };

    /* 剖切 */
    const splitSlice = ref(false);
    const handleSlice = (slice: boolean) => {
        splitSlice.value = slice;
    };

     // 天际线分析加载状态
     const skyLoading = ref<Boolean>(false);
     const handleSkyLoading = (loading: any) => {
         skyLoading.value = loading;
     };

    return {
        mapInstance,
        handleView,
        viewSplit,
        handleSplit,
        splitInstance,
        handleSplitView,
        compass,
        handleCompass,
        maxTilt,
        handleMaxTilt,
        splitMode,
        handleSplitMode,
        splitViewArr,
        handleSplitArr,
        splitLendon,
        handleLendon,
        lendonView,
        handleLendonView,
        splitSwipe,
        handleSwipe,
        swipeView,
        handleSwipeView,
        splitSlice,
        handleSlice,
        skyLoading,
        handleSkyLoading,
    };
});

/*
    菜单
*/
export const menuStore = defineStore('menu', () => {
    // 菜单当前点击项
    const currFunc = ref<any>();
    const handleFunc = (str: any) => {
        currFunc.value = str;
    };

    // 功能列表
    const funcArr = ref<any>();
    const handleFuncArr = (arr: any) => {
        funcArr.value = arr;
    };

    // 图层树弹窗状态
    const layerIsShow = ref<boolean>(true);
    const handleLayerShow = (boo: boolean) => {
        layerIsShow.value = boo;
    };

    // 项目管理按钮点击
    const proShow = ref<any>(null);
    const handleProShow = (obj: any) => {
        proShow.value = obj;
    };

    //当前点击的图层树上的图层服务
    const currentLayer = ref<any>({});
    const handleCurrentLayer = (obj: any) => {
        currentLayer.value = obj;
    };

    // 图层树
    const treeRef = ref<any>();
    const handleTreeRef = (tree: any) => {
        treeRef.value = tree;
    };

    // 项目管理已添加的服务ID数组
    const proAddArr = ref<any>([]);
    const handleProAddArr = (arr: any) => {
        proAddArr.value = arr;
    };
    return {
        currFunc,
        handleFunc,
        layerIsShow,
        handleLayerShow,
        funcArr,
        handleFuncArr,
        proShow,
        handleProShow,
        currentLayer,
        handleCurrentLayer,
        treeRef,
        handleTreeRef,
        proAddArr,
        handleProAddArr,
    };
});

//图标绘制-项目列表
export const iconProjectStore = defineStore('iconDraw', () => {
    // 项目管理按钮点击
    const projectShow = ref<any>();
    const handleProjectShow = (obj: any) => {
        projectShow.value = obj;
    };
    return {
        projectShow,
        handleProjectShow,
    };
});
