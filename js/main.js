var apiServer = 'http://52.243.47.71:3000';
var rubAccounts = ['Sberbank', 'Alfa-Bank', 'QIWI', 'Yandex.Money', 'QIWI-Yobit', 'Tinkoff', 'Rocketbank'];
var btcAccounts = ['BTC bot', 'BTC Yobit'];

function fillSellect(select, data) {
    for (var i = 0; i < data.length; i++) {
        var opt = document.createElement("option");
        opt.innerHTML = data[i];
        select.appendChild(opt);
    }
}
