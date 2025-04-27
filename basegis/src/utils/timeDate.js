export function getDate(e, time) {
    /**
     * time :date 类型 可以不传
     * e: 返回格式 yyyy-MM-dd hh:mm:ss (默认) ||  yyyy-MM-dd
     */
    let fmt = e || "yyyy-MM-dd hh:mm:ss";
    let data = new Date(time || new Date());
    let o = {
        "M+": data.getMonth() + 1, //月份
        "d+": data.getDate(), //日
        "h+": data.getHours(), //小时
        "m+": data.getMinutes(), //分
        "s+": data.getSeconds(), //秒
        //季度
        "q+": Math.floor((data.getMonth() + 3) / 3),
        S: data.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
            RegExp.$1,
            (data.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
            );
        }
    }
    return fmt;
}
export function PrefixInteger(num, length) {
    return (Array(length).join(num) + num).slice(-length);
}
export function PrefixZero(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}
// 本月
export function getMonthDay() {
    const daysOfMonth = [];
    const startStop = [];
    const fullYear = new Date().getFullYear();
    const m = new Date().getMonth();
    const month =
        new Date().getMonth() + 1 < 10 ?
        "0" + (new Date().getMonth() + 1) :
        new Date().getMonth() + 1;
    const lastDayOfMonth = new Date().getDate();
    for (let i = 1; i <= lastDayOfMonth; i++) {
        daysOfMonth.push(fullYear + "-" + month + "-" + i);
    }
    // for (let i = 1; i <= lastDayOfMonth; i++) {
    //   if (i < 10) {
    //     daysOfMonth.push(fullYear + '-' + month + '-' + '0' + i)
    //   } else {
    //     daysOfMonth.push(fullYear + '-' + month + '-' + i)
    //   }
    // }
    startStop.push(new Date(daysOfMonth[0]));
    startStop.push(new Date(fullYear, m, lastDayOfMonth));
    return startStop;
}

// 上月
export function getLastMonthDay() {
    let daysOfMonth = [];
    let startStop = [];
    let Nowdate = new Date()
    let fullYear = Nowdate.getFullYear();
    let vMon = Nowdate.getMonth() + 1;
    if (vMon == 1) {
        vMon = 12;
        fullYear = Nowdate.getFullYear() - 1;
    } else {
        vMon = vMon - 1
        vMon = vMon < 10 ? "0" + vMon : vMon;
    }
    let lastDayOfMonth = new Date(fullYear, vMon, 0).getDate();
    for (let i = 1; i <= lastDayOfMonth; i++) {
        daysOfMonth.push(fullYear + "-" + vMon + "-" + i);
    }
    // for (let i = 1; i <= lastDayOfMonth; i++) {
    //   if (i < 10) {
    //     daysOfMonth.push(fullYear + '-' + month + '-' + '0' + i)
    //   } else {
    //     daysOfMonth.push(fullYear + '-' + month + '-' + i)
    //   }
    // }
    startStop.push(new Date(daysOfMonth[0]));
    startStop.push(new Date(fullYear, vMon - 1, lastDayOfMonth));
    return startStop;
}

// 三个月
export function getThreeMonthDay() {
    const startStop = [];
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 91);
    startStop.push(start);
    startStop.push(end);
    return startStop;
}

//去年
export function getLastYear() {
    let startStop = [];
    let currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    currentYear--;
    let priorYearFirstDay = new Date(currentYear, 0, 1);
    let priorYearLastDay = new Date(currentYear, 11, 31);
    startStop.push(priorYearFirstDay);
    startStop.push(priorYearLastDay);
    return startStop;
}
//今年
export function getYear() {
    const startStop = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const d = currentDate.getDate();
    const currentYearFirstDate = new Date(currentYear, 0, 1);
    const currentYearLastDate = new Date(currentYear, m, d);
    startStop.push(currentYearFirstDate);
    startStop.push(currentYearLastDate);
    return startStop;
}
export function timeDate() {
  let time = new Date(); //获取系统当前时间
  let year = time.getFullYear();
  let month = time.getMonth() + 1;
  let date = time.getDate(); //系统时间月份中的日
  let day = time.getDay(); //系统时间中的星期值
  let weeks = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  let week = weeks[day]; //显示为星期几
  let hour = time.getHours();
  let minutes = time.getMinutes();
  if (month < 10) {
    month = "0" + month;
  }
  if (date < 10) {
    date = "0" + date;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  let str = year + "年" + month + "月" + date + "日    " + week;
  return str
}
export function timeSecond() {
  let time = new Date(); //获取系统当前时间
  let hour = time.getHours();
  let minutes = time.getMinutes();
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  let str = hour + ':' + minutes;
  return str
}
export function timeSec() {
  let time = new Date(); //获取系统当前时间
  let hour = time.getHours();
  let minutes = time.getMinutes();
  let sec = time.getSeconds()
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  let str = hour + ':' + minutes + ':' + sec;
  return str
}
export function elChangeExForArray (index1, index2, array) {
  let temp = array[index1]
  array[index1] = array[index2]
  array[index2] = temp
  return array
}
