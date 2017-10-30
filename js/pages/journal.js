var currDateJournal = new Date(), day = currDateJournal.getDate(), month = currDateJournal.getMonth() + 1,
    year = currDateJournal.getFullYear();
var page = 0, currenciesJournal = [];
const display = 20;

getCurrencyList(function (data) {
    currenciesJournal = data;
    drawJournal(0, 0);
});

function drawJournal(page, direction) {
    $.ajax({
        url: apiServer + "/journal",
        type: 'get',
        headers: {'authorization': token},
        data: "&dateEnd=" + month + "/" + day + "/" + year + "&dateBegin=&begin="
        + (display * page) + "&end=" + (display * page + display) + "&user=" + username,
        success: function (data) {
            console.log(data);
            if (data && data.length > 0) {
                $("#report_table").find("tr:gt(0)").remove();
                var operation_data = '';
                $.each(data, function (key, value) {
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
                    operation_data += '<tr class="' + rowClass + '">';
                    var parsedDate = value.date.split('T');
                    operation_data += '<td>' + parsedDate[0] + " " + parsedDate[1].substring(0, parsedDate[1].indexOf(".")) + '</td>';
                    //Operation
                    operation_data += '<td>' + operation + '</td>';
                    //Source
                    var source = (value.operation === "translate") ? value.source : value.paym;
                    operation_data += '<td>' + source + '</td>';
                    //Destination
                    var destination = (value.operation === "translate") ? value.destination : value.paymCrypto;
                    operation_data += '<td>' + destination + '</td>';

                    //Non-crypto checkout
                    var rub = 0, rubClass = "";
                    var non_crypto_currency = (value.operation === "translate") ? value.currency : value.currencyNonCrypto;
                    if (value.operation === "pay") {
                        rub = -value.rub;
                        rubClass = "red";
                    } else if (value.operation === "sell") {
                        rub = value.rub;
                        rubClass = "green";
                    } else {
                        if (currenciesJournal.find(function (a) {
                                return a.currency === non_crypto_currency;
                            }).isCrypto) {
                            non_crypto_currency = "";
                            rub = 0;
                        } else {
                            rub = value.transaction;
                        }
                    }
                    operation_data += '<td class="' + rubClass + '">' + rub + ' ' + non_crypto_currency + '</td>';
                    //Crypto checkout
                    var btc = 0, btcClass = "";
                    var crypto_currency = (value.operation === "translate") ? value.currency : value.currencyCrypto;
                    if (value.operation === "pay") {
                        btc = value.btc;
                        btcClass = "green";
                    } else if (value.operation === "sell") {
                        btc = -value.btc;
                        btcClass = "red";
                    } else {
                        if (currenciesJournal.find(function (a) {
                                return a.currency === crypto_currency;
                            }).isCrypto) {
                            btc = value.transaction;
                        } else {
                            btc = 0;
                            crypto_currency = "";
                        }
                    }
                    operation_data += '<td class="' + btcClass + '">' + btc + ' ' + crypto_currency +'</td>';
                    operation_data += '<td>' + value.commiss + ' ' + non_crypto_currency + '</td>';
                    operation_data += '<td>' + ((value.operation === "translate") ? 0 : value.bot_commiss) + ' ' + crypto_currency + '</td>';
                    operation_data += '<td>' + ((value.operation === "translate") ? -value.commiss : value.cur_fin_res) + '</td>';
                    operation_data += '</tr>';
                });
                $("#report_table").append(operation_data);
                if (direction > 0) {
                    $(".pager-left").toggleClass("disabled", false);
                }
                if (direction < 0) {
                    $(".pager-right").toggleClass("disabled", false);
                }
            } else {
                if (direction > 0) {
                    page--;
                    $(".pager-right").toggleClass("disabled", true);
                }
            }
        }
    });
}

function prevPage() {
    page--;
    if (page >= 0) {
        drawJournal(page, -1);
        $(".pager-right").toggleClass("disabled", false);
    } else {
        $(".pager-left").toggleClass("disabled", true);
        page++;
    }
}

function nextPage() {
    page++;
    drawJournal(page, 1);
}
