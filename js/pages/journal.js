var currDateJournal = new Date(), day = currDateJournal.getDate(), month = currDateJournal.getMonth() + 1,
    year = currDateJournal.getFullYear();

$.ajax({
    url: apiServer + "/journal",
    type: 'get',
    headers: {'authorization': token},
    data: "&dateEnd=" + month + "/" + day + "/" + year + "&dateBegin=",
    success: function (data) {
        console.log(data);
        var operation_data = '';
        $.each(data[0], function (key, value) {
            var operation = '', rowClass = '';
            switch (value.operation) {
                case "pay":
                    operation = "Покупка";
                    rowClass = "buy";
                    break;
                case "sell":
                    operation = "Продажа";
                    rowClass = "sell";
                    break;
                case "translate":
                    operation = "Ввод\\Вывод";
                    rowClass = "transfer";
                    break;
            }
            //Date
            operation_data += '<tr class="' + rowClass +'">';
            var parsedDate = value.date.split('T');
            operation_data += '<td>' + parsedDate[0] + " " + parsedDate[1].substring(0, parsedDate[1].indexOf(".")) + '</td>';
            //Operation
            operation_data += '<td>' + operation + '</td>';
            //Source
            var source = (value.operation === "translate") ? value.source : value.paym;
            operation_data += '<td>' + source + '</td>';
            //Non-crypto checkout
            var rub = 0, rubClass = "";
            if (value.operation === "pay") {
                rub = -value.rub;
                rubClass = "red";
            } else if (value.operation === "sell") {
                rub = value.rub;
                rubClass = "green";
            } else {
                rub = value.transaction;
            }
            operation_data += '<td class="' + rubClass + '">' + rub + '</td>';
            //Crypto checkout
            var btc = 0, btcClass = "";
            if (value.operation === "pay") {
                btc = value.btc;
                btcClass = "green";
            } else if (value.operation === "sell") {
                btc = -value.btc;
                btcClass = "red";
            } else {
                btc = 0;
            }
            operation_data += '<td class="' + btcClass + '">' + btc + '</td>';
            operation_data += '<td>' + value.commiss + '</td>';
            operation_data += '<td>' + ((value.operation === "translate") ? 0 : value.bot_commiss) + '</td>';
            operation_data += '<td>' + ((value.operation === "translate") ? -value.commiss : value.cur_fin_res) + '</td>';
            operation_data += '</tr>';
        });
        $("#report_table").append(operation_data);
    }
});