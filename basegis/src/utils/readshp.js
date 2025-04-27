/*
 * @Author: sgz
 * @Date: 2021-12-02 13:33:08
 * @LastEditors: sgz
 * @LastEditTime: 2021-12-02 14:13:28
 * @FilePath: \fq-wclf:\国土空间规划\标准版版本\wcl-standard\webgis\src\utils\readshp.js
 * @Description: 请填写描述
 */

import {open} from 'shapefile'

export function readshp(){
    debugger;
        open('http://localhost/WebAPI/filedata/%E7%8E%AF%E5%B2%9B/环岛.shp').then(source=>source.read().then(function log(result){
        if(result.done) return;
        console.log(result.value)
        return source.read().then(log)
    }))
}