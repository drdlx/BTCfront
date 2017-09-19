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

function getAvgCourse(callback) {
    var normal = 0, crypto = 0, avg_course = 0;
    $.getJSON(apiServer + '/reportpay', function (data) {
        $.each(data, function (key, value) {
            /*TODO include check for currencies; Right now it is counting everything as currency='BTC'*/
            crypto += value.btc;
            normal += value.rub;
        });
        avg_course = (normal / crypto).toFixed(2);
        callback(avg_course);
    });
}

function getTotalCryptoBought(callback) {
    var result = 0;
    $.getJSON(apiServer + '/reportpay', function (data) {
        $.each(data, function (key, value) {
            /*TODO include check for currencies; Right now it is counting everything as currency='BTC'*/
            result += value.btc;
        });
        callback(result);
    });
}

function getTotalNormalSpent(callback) {
    var result = 0;
    $.getJSON(apiServer + '/reportpay', function (data) {
        $.each(data, function (key, value) {
            /*TODO include check for currencies; Right now it is counting everything as currency='BTC'*/
            result += value.rub;
        });
        callback(result);
    });
}

function getDealFinrez(income, avg, btc, botcom) {
    var result;
    result = (income - (avg * btc) - (botcom * avg)).toFixed(2);
    return result;
}
