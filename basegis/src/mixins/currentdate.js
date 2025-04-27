const currentDate = {
    data() {
        return {
            nowDate: '',
        };
    },
    methods: {
        // 时间格式
        formatDate() {
            let date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() + 1; // 月
            let day = date.getDate();
            let week = date.getDay();
            let weekArr = [
                '星期日',
                '星期一',
                '星期二',
                '星期三',
                '星期四',
                '星期五',
                '星期六',
            ];
            let hour = date.getHours();
            hour = hour < 10 ? '0' + hour : hour;
            let minute = date.getMinutes();
            minute = minute < 10 ? '0' + minute : minute;
            let second = date.getSeconds();
            second = second < 10 ? '0' + second : second;
            this.nowDate = `${year}/${month}/${day} ${hour}:${minute}:${second} ${weekArr[week]}`;
        },
        // 定时刷新时间
        currentTime() {
            setInterval(this.formatDate, 1000);
        },
    },
    mounted() {
        this.formatDate();
        this.currentTime();
    },
    beforeDestroy() {
        // 清除时间
        if (this.formatDate) {
            clearInterval(this.formatDate);
        }
    },
};
export default currentDate;
