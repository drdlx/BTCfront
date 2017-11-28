var avgCourse = 0, delayTimer, boughtTotal = 0, xtraData, cryptoCurrency, currencies,
    rubAccounts = [], btcAccounts = [], reservesBuy = [];

$(document).ready(function () {

    var r2 = getCurrencyList(function (data) {
        currencies = data;
    });

    var r3 = getReserveList(function (data) {
        reservesBuy = data;
    });
    $.when(r2, r3).done(function () {
        document.getElementById('avg_course').innerHTML = "-";
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
                document.getElementById('avg_prognosis').innerHTML = "";
                document.getElementById('deal_finrez').innerHTML = '';
                $("#submit_button").prop("disabled", true);
                swal("Успех", "Запись была добавлена", "success");
                reBuildSidebarContent();
                reBuildHeaderInfo();
                getReserveList(function (data) {
                    reservesBuy = data;
                });
                document.getElementById('avg_course').innerHTML = avgHeader;
            },
            error: function (err) {
                swal("Упс", "Что-то пошло не так", "error");
            }
        });
    });
});


function reCount() {
    getUserParameters(function (data) {
        botComission = data.percentBOT;
    });
    clearTimeout(delayTimer);
    delayTimer = setTimeout(function () {
        document.getElementById('avg_course').innerHTML = avgCourse.toFixed(2);
        var btcValue = parseFloat($("#btc").val()),
            courseValue = parseFloat($("#course").val()),
            comissValue = parseFloat($("#commiss").val()),
            rubResult = parseFloat($("#rub").val()),
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
        if (isNaN(rubResult)) {
            rubResult = 0;
        }
        courseValue = (rubResult / btcValue);
        $("#course").val(courseValue.toFixed(2));
        botcomissValue = btcValue * botComission;
        $("#bot_commiss").val(botcomissValue.toFixed(8));

        var prognosisLine = document.getElementById('avg_prognosis');
        //prognosis field setter
        boughtTotal = totalRemainders[cryptoCurrency];
        getAvgPrognose(rubResult, btcValue, boughtTotal, comissValue, botcomissValue, function (data) {
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
            var finrez = getDealFinrez("buy", 0, newAvrg, 0, botcomissValue, comissValue);
            document.getElementById('deal_finrez').innerHTML = '; Финрез сделки: ' + finrez;
            xtraData = "&average_course=" + newAvrg + "&cur_fin_res=" + finrez;
            $("#submit_button").prop("disabled", false);
        });
    }, 1000);
}

function setCryptoCurrency() {
    var selectedReserve = $("#paymCrypto").val();
    $.each(reservesBuy, function (key, value) {
        if (value.title === selectedReserve) {
            cryptoCurrency = value.currency;
        }
    });
    avgCourse = reservesBuy.find(function (a) {
        return a.title === selectedReserve;
    }).average_course;
    reCount();
}

function getAvgPrognose(spent, bought, totalB, commiss, botCommiss, callback) {
    var result = ((totalB * avgCourse) + spent + commiss) / (totalB + bought - botCommiss);
    callback(result);
}

function setNewBotComiss() {
    swal({
        title: "Изменить процент сервисного сбора",
        input: 'text',
        inputPlaceholder: '0.00',
        showCancelButton: true,
        inputValidator: function(value) {
            return new Promise(function (resolve, reject) {
                if ($.isNumeric(value)) {
                    resolve(value);
                } else {
                    reject("Некорректный ввод");
                }
            });
        }
    }).then(function (respond) {
        $.ajax({
            url: apiServer + '/userSettingUp',
            type: 'post',
            headers: {'authorization': token},
            data: "&percentBOT=" + (respond * 0.01),
            success: function (data) {
                swal("Успех", "Процент сервисного сбора был изменен", "success");
                botComission = parseFloat(respond) * 0.01;
                reCount();
            },
            error: function (err) {
                swal("Упс", "Что-то пошло не так, " + JSON.stringify(err), "error");
            }
        });
    });
}
