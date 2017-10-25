$(document).ready(function () {
    getFullSalesData(function (data) {
        console.log(data);
        var operation_data = '';
        $.each(data.data, function (key, value) {
            operation_data += '<tr>';
            operation_data += '<td>' + value.paym + '</td>';
            operation_data += '<td>' + value.btc.toFixed(8) + '</td>';
            operation_data += '<td>' + value.course + '</td>';
            operation_data += '<td>' + value.rub + '</td>';
            operation_data += '<td>' + value.commiss + '</td>';
            operation_data += '<td>' + value.bot_commiss.toFixed(8) + '</td>';
            operation_data += '<td>' + value.cur_fin_res + '</td>';
            var parsedDate = value.date.split('T');
            operation_data += '<td>' + parsedDate[0] + " " + parsedDate[1].substring(0, parsedDate[1].indexOf(".")) +'</td>';
            operation_data += '</tr>';
        });
        $("#report_table").append(operation_data);
    });
});