var avgCourse, delayTimer, boughtTotal, spentTotal, xtraData;

$(document).ready(function () {
    var r1 = getFullPaymentData(function (data) {
        document.getElementById('avg_course').innerHTML = data.avg;
        avgCourse = parseFloat(data.avg);
        spentTotal = parseFloat(data.rub);
        boughtTotal = parseFloat(data.btc);
    });
    var currencies;
    var r2 = getCurrencyList(function (data) {
        currencies = data;
    });
    var rubAccounts = [], btcAccounts = [], reservesBuy = [];
    var r3 = getReserveList(function (data) {
        reservesBuy = data;
    });
    $.when(r1, r2, r3).done(function () {
        $.each(reservesBuy, function (key, value) {
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
                })
            }
        });
        fillSelectFromArray(document.getElementById('paym'), rubAccounts);
        fillSelectFromArray(document.getElementById('paymCrypto'), btcAccounts);
    });
});


$("#post_form").on('submit', function (e) {
    e.preventDefault();
    $.ajax({
        url: apiServer + '/pay',
        headers: {
            'authorization': localStorage.getItem('token')
        },
        type: 'post',
        crossDomain: true,
        data: $("#post_form").serialize() + xtraData,
        success: function () {
            document.getElementById('post_form').reset();
            getFullPaymentData(function (data) {
                document.getElementById('avg_course').innerHTML = data.avg;
                avgCourse = parseFloat(data.avg);
                spentTotal = parseFloat(data.rub);
                boughtTotal = parseFloat(data.btc);
            });
            document.getElementById('avg_prognosis').innerHTML = "";
            document.getElementById('deal_finrez').innerHTML = '';
            $("#submit_button").prop("disabled", true);
            swal("Успех", "Запись была добавлена", "success");
            reBuildSidebarContent();
            reBuildHeaderInfo();
        },
        error: function (err) {
            swal("Упс", "Что-то пошло не так", "error");
        }
    });
});

function reCount() {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(function () {
        document.getElementById('avg_course').innerHTML = avgCourse;
        var btcValue = parseFloat($("#btc").val()),
            courseValue = parseFloat($("#course").val()),
            comissValue = parseFloat($("#commiss").val()),
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
        botcomissValue = btcValue * botComission;
        $("#bot_commiss").val(botcomissValue.toFixed(8));
        var rubResult = (courseValue * btcValue);
        $("#rub").val(rubResult.toFixed(2));

        var prognosisLine = document.getElementById('avg_prognosis');
        //prognosis field setter
        getAvgPrognose(rubResult, btcValue, boughtTotal, function (data) {
            var percentage = ((data / (avgCourse / 100)) - 100);
            var percentage_string = "";
            if (percentage > 0) {
                if (!isFinite(percentage)) {
                    percentage = 0;
                }
                percentage_string = ("+" + percentage.toFixed(2));
                prognosisLine.setAttribute('class', 'red');
            } else {
                percentage_string = (percentage.toFixed(2));
                prognosisLine.setAttribute('class', 'green');
            }
            var newAvrg = data;
            if (isNaN(newAvrg) || newAvrg.isUndefined) {
                newAvrg = 0;
                percentage_string = 0;
            }
            prognosisLine.innerHTML = '; Новый ср. курс: ' + newAvrg.toFixed(2) + ' (' + percentage_string + '%)';
            var finrez = getDealFinrez(0, newAvrg, 0, botcomissValue, comissValue);
            document.getElementById('deal_finrez').innerHTML = '; Финрез сделки: ' + finrez;
            xtraData = "&average_course=" + newAvrg + "&cur_fin_res=" + finrez;
            $("#submit_button").prop("disabled", false);
        });
    }, 1000);
}

function getAvgPrognose(spent, bought, totalB, callback) {
    var result = ((totalB * avgCourse) + spent) / (totalB + bought);
    callback(result);
}