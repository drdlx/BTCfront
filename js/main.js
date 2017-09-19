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
