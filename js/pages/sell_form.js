var delayTimer, avg, xtraData, rubAccounts =[],
    btcAccounts = [], reservesSell = [];
$(document).ready(function () {
    if (sessionStorage.getItem('header_avg') !== null) {
        avg = sessionStorage.getItem('header_avg');
    } else {
        avg = 0;
    }
    document.getElementById('avg_course').innerHTML = avg;


    var currencies;
    var r1 = getCurrencyList(function (data) {
        currencies = data;
    });

    var r2 = getReserveList(function (data) {
        reservesSell = data;
    });

    $.when(r1, r2).done(function () {
        $.each(reservesSell, function (key, value) {
            if (value.responsible === username) {
                var currency = value.currency;
                $.each(currencies, function (key1, value1) {
                    if (currency === value1.currency) {
                        if (value1.isCrypto === true) {
                            btcAccounts.push(value.title);
                        } else {
                            rubAccounts.push(value.title);
                        }
                    }
                });
            }
        });

        fillSelectFromArray(document.getElementById('paym'), rubAccounts);
        fillSelectFromArray(document.getElementById('paymCrypto'), btcAccounts);
    });

    $("#post_form").on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: apiServer + '/sell',
            type: 'post',
            crossDomain: true,
            headers: {
                'authorization': localStorage.getItem('token')
            },
            data: $("#post_form").serialize() + xtraData,
            success: function () {
                document.getElementById('post_form').reset();
                document.getElementById('deal_finrez').innerHTML = "";
                $("#submit_button").prop("disabled", true);
                swal("Успех", "Запись успешно добавлена", "success");
                reBuildSidebarContent();
                reBuildHeaderInfo();
            },
            error: function () {
                swal("Упс", "Что-то пошло не так", "error");
            }
        });
    });
});

function reCount(initiator) {
    getUserParameters(function (data) {
        botComission = data.percentBOT;
    });
    clearTimeout(delayTimer);
    delayTimer = setTimeout(function () {
        avg = avgHeader;
        document.getElementById('avg_course').innerHTML = avg.toFixed(2);
        var btcValue = parseFloat($("#btc").val()),
            courseValue = parseFloat($("#course").val()),
            comissValue = parseFloat($("#commiss").val()),
            rubValue = parseFloat($("#rub").val()),
            botcomissValue;
        if (isNaN(btcValue)) {
            btcValue = 0;
        }
        if (isNaN(courseValue)) {
            courseValue = 0;
        }
        if (isNaN(comissValue)) {
            comissValue = 0;
        }
        if (isNaN(rubValue)) {
            rubValue = 0;
        }
        switch (initiator) {
            case "rub":
                btcValue = rubValue / courseValue;
                $("#btc").val(btcValue.toFixed(8));
                break;
            default:
                rubValue = courseValue * btcValue;
                $("#rub").val(rubValue.toFixed(2));
        }
        botcomissValue = btcValue * botComission;
        $("#bot_commiss").val(botcomissValue.toFixed(8));

        var finrez = getDealFinrez(rubValue, avg, btcValue, botcomissValue, comissValue);
        var finrez_field = document.getElementById('deal_finrez');
        var finrez_string = "";
        if (finrez > 0) {
            finrez_field.setAttribute('class', 'green');
            finrez_string = "+" + finrez;
        } else {
            finrez_field.setAttribute('class', 'red');
            finrez_string = finrez;
        }
        if (isNaN(finrez) || finrez.isUndefined) { finrez_string = 0 }
        finrez_field.innerHTML = '; Финрез от сделки: ' + finrez_string;
        xtraData = "&cur_fin_res=" + finrez + "&average_course=" + avg;
        $("#submit_button").prop("disabled", false);
    }, 1000);
}

function setCryptoCurrency() {
    var selectedReserve = $("#paymCrypto").val();
    $.each(reservesSell, function (key, value) {
        if (value.title === selectedReserve) {
            cryptoCurrency = value.currency;
        }
    });
    reCount();
}
