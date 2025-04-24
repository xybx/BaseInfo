/// <reference types="vite/client" />
declare interface Window {
    apiURL: string;
    apiResource: string;
    userInfo: {
        userName: string;
        password: string;
    };
    demoBuildObj: any;
    THREE: any;
    placeData: any;
    buildProOpt: any;
    overData: any;
    highOpt: any;
    memoryLimit: number;
    kkfileVersion: number;
    previewURL: string;
    cv: any;
    viewServer: any;
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const vueComponent: DefineComponent<{}, {}, any>;
    export default vueComponent;
}

declare module 'element-plus/dist/locale/zh-cn.mjs';
