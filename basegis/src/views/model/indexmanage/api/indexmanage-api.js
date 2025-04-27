import request from '@/utils/request';

// 获取指标类型列表
export const getList = () => {
    return request({
        method: 'GET',
        url: '/DQPGZB/GetPGZBTypeList',
    });
};

// 保存指标类型
export const saveList = (data) => {
    return request({
        method: 'POST',
        url: '/DQPGZB/SavePGZBType',
        data,
    });
};

// 删除指标类型
export const delList = (params) => {
    return request({
        method: 'GET',
        url: '/DQPGZB/DeletePGZBType',
        params,
    });
};

// 获取指标项列表
export const getIndexList = (params) => {
    return request({
        method: 'GET',
        url: '/DQPGZB/GetPGZBItemList',
        params,
    });
};

// 保存指标项
export const saveIndex = (data) => {
    return request({
        method: 'POST',
        url: '/DQPGZB/SavePGZBItem',
        data,
    });
};

// 删除指标项
export const delIndex = (params) => {
    return request({
        method: 'GET',
        url: '/DQPGZB/DeletePGZBItem',
        params,
    });
};

export const getNlmList = (params) => {
    return request({
        method: 'GET',
        url: '/DQPGZB/GetPGZBItemNlmList',
        params,
    });
};

export const saveNlm = (data) => {
    return request({
        method: 'POST',
        url: '/DQPGZB/SavePGZBNlm',
        data,
    });
};

export const deleteNlm = (params) => {
    return request({
        method: 'GET',
        url: '/DQPGZB/DeletePGZBNlm',
        params,
    });
};



export const getLayerList = (params) => {
    return request({
        method: 'GET',
        url: '/DQPGZB/GetZBLayers',
        params,
    });
};

export const saveLayer = (data) => {
    return request({
        method: 'POST',
        url: '/DQPGZB/SaveZBLayer',
        data,
    });
};

export const deleteLayer = (params) => {
    return request({
        method: 'GET',
        url: '/DQPGZB/DeleteZBLayer',
        params,
    });
};

//指标体系列表
export const getSysList=(params)=>
{
    return request({
        method: 'GET',
        url: '/PGZBSYS/GetSysList',
        params,
    });
}
//指标体系分类列表
export const getSysTypeList=()=>
{
    return request({
        method: 'GET',
        url: '/PGZBSYS/GetSysTypes',       
    });
}

//保存指标体系
export const saveZBSys = (data) => {
    return request({
        method: 'POST',
        url: '/PGZBSYS/SaveZBSys',
        data,
    });
};

//批量删除
export const deleteZBSys = (params) => {
    return request({
        method: 'GET',
        url: '/PGZBSYS/DeleteZBSys',
        params,
    });
};

//已关联指标，未关联指标
export const getZBList=(params)=>{
    return request({
        method: 'GET',
        url: '/PGZBSYS/GetZBList',   
        params    
    });
}

//保存关联的指标项
export const saveZBList = (data) => {
    return request({
        method: 'POST',
        url: '/PGZBSYS/SaveZBList',
        data,
    });
};

//批量删除
export const deleteZBList = (data) => {
    return request({
        method: 'POST',
        url: '/PGZBSYS/DeleteZBList',
        data,
    });
};

//导入excel
export const importExcel=(params)=>{
    return request({
        method: 'GET',
        url: '/PGZBSYS/ImportExcel',   
        params    
    });
}

//导出excel
export const ExportExcel=()=>{
    return request({
        method: 'GET',
        url: '/PGZBSYS/ExportExcel', 
    });
}


//带指标值的指标列表
export const GetZBValueList=(params)=>{
    return request({
        method: 'GET',
        url: '/PGZBSYSZB/GetZBList', 
        params
    });
}

//保存指标值的修改
export const SaveZBValue=(data)=>{
    return request({
        method: 'POST',
        url: '/PGZBSYSZB/SaveZBList', 
        data
    });
}

//导入指标值
export const importValueExcel=(params)=>{
    return request({
        method: 'GET',
        url: '/PGZBSYSZB/ImportExcel',   
        params    
    });
}
//导出excel
export const ExportValueExcel=()=>{
    return request({
        method: 'GET',
        url: '/PGZBSYSZB/ExportExcel', 
    });
}


//复制体系
export const CopySys=(data)=>{
    return request({
        method: 'POST',
        url: '/PGZBSYS/CopySys', 
        data
    });
}

//导入指标列表数据
export const ImportZBExcel=(params)=>
{
    return request({
        method: 'GET',
        url: '/DQPGZB/ImportZBExcel', 
        params
    });
}


//导出指标列表数据
export const ExportZBList=()=>
{
    return request({
        method: 'GET',
        url: '/DQPGZB/ExportZBList', 
    });
}


