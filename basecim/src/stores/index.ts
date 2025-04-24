import { basemapStore, viewStore, menuStore,iconProjectStore } from './modules/map';

const useStore = () => {
    return {
        mapStore: basemapStore(),
        viewStore: viewStore(),
        menuStore: menuStore(),
        iconProjectStore:iconProjectStore(),
    };
};

export default useStore;
