const jsDateFormatter=(date)=> {
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    let hour=date.getHours();
    let minite=date.getMinutes();
    let second=date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (hour >= 1 && hour <= 9) {
        hour = "0" + hour;
    }
    if (minite >= 1 && minite <= 9) {
        minite = "0" + minite;
    }
    if (second >= 1 && second <= 9) {
        second = "0" + second;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + hour + seperator2 + minite+ seperator2 + second;
    return currentdate;
}

export default jsDateFormatter
