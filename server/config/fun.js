//csv转数组
function ConvertToTable(data, callBack) {
    data = data.toString();
    var table = new Array();
    var rows = new Array();
    rows = data.split("\r\n");
    for (var i = 1; i < rows.length; i++) {
        if(i>0)
            table.push(rows[i].split(","));
    }
    callBack(table);
};
const fun={
    ConvertToTable,
}
module.exports=fun;