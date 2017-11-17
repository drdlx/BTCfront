var currDateJournal = new Date(),
    day = currDateJournal.getDate(),
    month = currDateJournal.getMonth() + 1,
    year = currDateJournal.getFullYear();
var page = 0,
    currenciesJournal = [];
const display = 20;
var todayDate = new Date();
var userList = ["Все пользователи"],
    dateList = {};

$(document).ready(function () {
    var r1 = function (username) {
        var userReqStr = "&user=";
        if (username !== "Все пользователи") {
            userReqStr = (priv === 'admin') ? "&user=" + username : "";
        }
        var currDateJournal = new Date(),
            day = (currDateJournal.getDate() < 10) ? "0" + currDateJournal.getDate() : currDateJournal.getDate(),
            month = (currDateJournal.getMonth() + 1 < 10) ? "0" + currDateJournal.getMonth() + 1 : currDateJournal.getMonth() + 1,
            year = currDateJournal.getFullYear();
        return $.ajax({
            url: apiServer + '/journal',
            type: 'GET',
            crossDomain: true,
            data: userReqStr + "&dateEnd=" + year + "-" + month + "-" + day + "&dateBegin=1990-01-01",
            headers: {
                "authorization": localStorage.getItem('token')
            },
            success: function (data) {
                dateList = {};
                $.each(data, function (key, value) {
                    var currDate = value.date.substring(0, value.date.indexOf('T')).split('-'),
                        day = currDate[2],
                        month = currDate[1],
                        year = currDate[0];
                    dateList[day + "/" + month + "/" + year] = day + "/" + month + "/" + year;
                });
            }
        });
    };

    var r2 = getCurrencyList(function (data) {
        currenciesJournal = data;
    });

    var r3 = getAntiagentList(function (data) {
        $.each(data, function (key, value) {
            if (value.internal) {
                userList.push(value.agentname);
            }
        });
    });

    $.when(r1(username), r2, r3).done(function () {
        //======fill users select
        fillSelectFromArray(document.getElementById("report_user"), userList);
        document.getElementById("report_user").value = username;
        //======fill datePicker
        var todayDay = todayDate.getDate(),
            todayMonth = todayDate.getMonth() + 1,
            todayYear = todayDate.getFullYear();
        $("#report_date").val(todayDay + "/" + todayMonth + "/" + todayYear);
        $("#report_date").datepicker({
            dateFormat: 'd/m/yy',
            beforeShowDay: function (date) {
                var currDate = new Date(date),
                    day = (currDate.getDate() < 10) ? "0" + currDate.getDate() : currDate.getDate(),
                    month = (currDate.getMonth() + 1 < 10) ? "0" + currDate.getMonth() + 1 : currDate.getMonth() + 1,
                    year = currDate.getFullYear();
                var hDate = day + "/" + month + "/" + year;
                var highlight = dateList[hDate];
                if (highlight) {
                    return [true, "date_event", highlight];
                } else {
                    return [false, "", ""];
                }
            }
        });
        drawJournal(0, 0);
        //======listening for changes
        $("#report_user").change(function () {
            r1($(this).val());
            page = 0;
            $(".pager-left").addClass("disabled");
            $(".pager-right").removeClass("disabled");
            $("#report_table").find("tr:gt(0)").remove();
            drawJournal(0, 0);
        });
        $("#report_date").change(function () {
            page = 0;
            $(".pager-left").addClass("disabled");
            $(".pager-right").removeClass("disabled");
            $("#report_table").find("tr:gt(0)").remove();
            drawJournal(0, 0);
        });
    });
});


function drawJournal(page, direction) {
    var user = $("#report_user").val(),
        date = $("#report_date").val().split('/'),
        dateDay = (date[0] < 10) ? "0" + date[0] : date[0],
        dateMonth = (date[1] < 10) ? "0" + date[1] : date[1],
        dateYear = date[2];
    if (user === "Все пользователи") {
        user = "";
    }
    var userReqStr = "&user=" + user;
    $.ajax({
        url: apiServer + "/journal",
        type: 'get',
        headers: {
            'authorization': token
        },
        data: "&dateEnd=" + dateYear + "-" + dateMonth + "-" + dateDay + "&dateBegin=" + dateYear + "-" + dateMonth + "-" + dateDay + "&begin=" +
        (display * page) + "&end=" + (display * page + display) + userReqStr,
        success: function (data) {
            if (data && data.length > 0) {
                $("#report_table").find("tr:gt(0)").remove();
                $("#loading").show();
                var operation_data = '';
                $.each(data, function (key, value) {
                    var operation = '',
                        rowClass = '';
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
                    var parsedDate = value.date.split('T'),
                        parsedDay = parsedDate[0].split('-')[2],
                        parsedMonth = parsedDate[0].split('-')[1],
                        parsedYear = parsedDate[0].split('-')[0];
                    operation_data += '<td>' + parsedDay + '/' + parsedMonth + '/' + parsedYear + " " + parsedDate[1].substring(0, parsedDate[1].indexOf(".")) + '</td>';
                    //Operation
                    operation_data += '<td>' + operation + '</td>';
                    //Destination
                    var destination = (value.operation === "translate") ? value.destination : value.paymCrypto;
                    operation_data += '<td>' + destination + '</td>';
                    //Source
                    var source = (value.operation === "translate") ? value.source : value.paym;
                    operation_data += '<td>' + source + '</td>';

                    //Non-crypto checkout
                    var rub = 0,
                        rubClass = "";
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
                    operation_data += '<td class="' + rubClass + '">' + rub.toLocaleString('ru-RU', {
                        maximumFractionDigits: 2,
                    }) + ' ' + non_crypto_currency + '</td>';
                    //Crypto checkout
                    var btc = 0,
                        btcClass = "";
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
                    operation_data += '<td class="' + btcClass + '">' + btc.toLocaleString('ru-RU', {
                        maximumFractionDigits: 8,
                    }) + ' ' + crypto_currency + '</td>';
                    //Commission
                    operation_data += '<td>' + value.commiss.toLocaleString('ru-RU', {
                        maximumFractionDigits: 2
                    }) + ' ' + non_crypto_currency + '</td>';
                    //Service commission (crypto)
                    operation_data += '<td>' + ((value.operation === "translate") ? 0 : value.bot_commiss.toLocaleString('ru-RU', {
                        maximumFractionDigits: 8,
                    })) + ' ' + crypto_currency + '</td>';
                    //Finres
                    operation_data += '<td>' + ((value.operation === "translate") ? -value.commiss.toLocaleString('ru-RU', {
                        maximumFractionDigits: 2
                    }) : value.cur_fin_res.toLocaleString('ru-RU', {
                        maximumFractionDigits: 2
                    })) + '</td>';
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
            $("#loading").hide();
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
