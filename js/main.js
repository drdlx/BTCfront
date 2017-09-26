var apiServer = 'http://52.243.47.71:3000';
var rubAccounts = ['Sberbank', 'Alfa-Bank', 'QIWI', 'Yandex.Money', 'QIWI-Yobit', 'Tinkoff', 'Rocketbank'];
var btcAccounts = ['BTC bot', 'BTC Yobit'];
var botComission = 0.008;


function fillSelect(select, data) {
    for (var j = select.options.length; j >= 0; j--) {
        select.remove(j);
    }
    for (var i = 0; i < data.length; i++) {
        var opt = document.createElement("option");
        opt.innerHTML = data[i];
        select.appendChild(opt);
    }
}

function defineReservesSet(select_id) {
    var select = document.getElementById(select_id);
    var value = select.options[select.selectedIndex].value;
    if (value === ('BTC')) {
        return btcAccounts;
    } else if (value === ('RUB')) {
        return rubAccounts;
    } else return [];
}

function getFullPaymentData(callback) {
    var totalRub = 0, totalBtc = 0, currentAvg = 0;
    $.ajax({
        url: apiServer + '/reportpay',
        type: 'get',
        headers: {'authorization': sessionStorage.getItem('token')},
        crossDomain: true,
        success: function (data) {
            $.each(data, function (key, value) {
                currentAvg = ((totalBtc * currentAvg) + value.rub) / (totalBtc + value.btc);
                totalBtc += value.btc - value.bot_commiss;
                totalRub -= value.rub + value.commiss;
            });
            var result = {
                'data': data,
                'avg': currentAvg.toFixed(2),
                'btc': totalBtc.toFixed(8),
                'rub': totalRub.toFixed(2)
            };
            callback(result);
        }
    });
}

function getFullSalesData(callback) {
    $.ajax({
        url: apiServer + '/reportsell',
        type: 'get',
        headers: {'authorization': sessionStorage.getItem('token')},
        crossDomain: true,
        success: function (data) {
            var result = {
                'data': data
            };
            callback(result);
        }
    });
}

function getReserveList(callback) {
    $.ajax({
        url: apiServer + '/reserves',
        type: 'get',
        headers: { 'authorization' : sessionStorage.getItem('token')},
        success: function (data) {
            callback(data);
        }
    });
}

function getCurrencyList(callback) {
    $.ajax({
        url: apiServer + '/currency',
        type: 'get',
        headers: { 'authorization' : sessionStorage.getItem('token')},
        success: function (data) {
            callback(data);
            return data;
        }
    });
}

function getBankList(callback) {
    $.ajax({
        url: apiServer + '/banks',
        type: 'get',
        headers: { 'authorization' : sessionStorage.getItem('token')},
        success: function (data) {
            callback(data);
            return data;
        }
    });
}

function getAntiagentList(callback) {
    $.ajax({
        url: apiServer + '/anti_agent',
        type: 'get',
        headers: { 'authorization' : sessionStorage.getItem('token')},
        success: function (data) {
            callback(data);
            return data;
        }
    });
}

function getDealFinrez(income, avgCourse, btcOutcome, botCommiss, comiss) {
    var result;
    result = (income - (avgCourse * btcOutcome) - (botCommiss * avgCourse) - comiss).toFixed(2);
    return parseFloat(result);
}

function getGlobalStatsFull(callback) {
    var fullList, payList = null, sellList = null;
    //pays
    function pays() {
        return $.ajax({
            url: apiServer + '/reportpay',
            type: 'GET',
            crossDomain: true,
            headers: {
                'authorization': sessionStorage.getItem('token')
            },
            success: function (data) {
                payList = data;
                $.each(payList, function (key, value) {
                    value.operation = 'pay'
                });
            }
        });
    }
    //sells
    function sells() {
        return $.ajax({
            url: apiServer + "/reportSell",
            crossDomain: true,
            type: 'GET',
            headers: {
                'authorization': sessionStorage.getItem('token')
            },
            success: function (data) {
                sellList = data;
                $.each(sellList, function (key, value) {
                    value.operation = 'sell';
                });
            }
        });
    }

    $.when(pays(), sells()).done(function (a1, a2) {

        //merging both lists and sorting result
        fullList = payList.concat(sellList);
        fullList.sort(function (a, b) {
            return a.date > b.date ? 1 : -1;
        });

        //processing data
        var totalFinrez = 0, totalRub = 0, totalBtc = 0, currentAvg = 0;
        $.each(fullList, function (key, value) {
            if (value.operation === "sell") {
                totalFinrez += getDealFinrez(value.rub, currentAvg, value.btc, value.bot_commiss, value.commiss);
                totalBtc -= value.btc + value.bot_commiss;
                totalRub += value.rub - value.commiss;
            }
            else if (value.operation === 'pay') {
                currentAvg = ((totalBtc * currentAvg) + value.rub) / (totalBtc + value.btc);
                totalBtc += value.btc - value.bot_commiss;
                totalRub -= value.rub + value.commiss;
                totalFinrez += getDealFinrez(0, currentAvg, 0, value.bot_commiss, value.commiss);
            }
        });

        //sending data to the callback function
        var result = {
            'avgCourse': currentAvg.toFixed(2),
            'totalBtc': totalBtc.toFixed(8),
            'totalRub': totalRub.toFixed(2),
            'totalFinrez': totalFinrez.toFixed(2)
        };
        callback(result);
    });
}
