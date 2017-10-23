var currDateJournal = new Date(), day = currDateJournal.getDate(), month = currDateJournal.getMonth() + 1,
    year = currDateJournal.getFullYear();

$.ajax({
    url: apiServer + "/journal",
    type:'get',
    headers: {'authorization': token},
    data: "&dateEnd=" + month + "/" + day + "/" + year + "&dateBegin=",
    success: function (data) {
        console.log(data);
        var operation_data = '';
        $.each(data, function (key, value) {
            operation_data += '<tr>';
            operation_data += '<td>' + value.date + '</td>';
            operation_data += '<td>' + value.operation + '</td>';
            var source = (value.operation === "translate") ? value.source : value.paym;
            operation_data += '<td>' + source + '</td>';
            var rub = 0;
            if (value.operation === "pay") {
                rub = - value.rub;
            } else if (value.operation === "sell") {
                rub = value.rub;
            } else rub = value.transaction;
            operation_data += '<td>' + rub + '</td>';
            var btc = 0;
            if (value.operation === "pay") {
                btc = value.btc;
            } else if (value.operation === "sell") {
                btc = -value.rub;
            } else btc = 0;
            operation_data += '<td>' + btc + '</td>';
            operation_data += '<td>' + value.commiss + '</td>';
            operation_data += '<td>' + ((value.operation === "translate") ? 0 : value.bot_commiss) + '</td>';
            operation_data += '<td>' + ((value.operation === "translate") ? -value.commiss : value.cur_fin_res) + '</td>';
            operation_data += '</tr>';
        });
        console.log(operation_data);
        $("#report_table").append(operation_data);
    }
});