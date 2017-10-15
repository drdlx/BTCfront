var apiServer = 'http://52.243.47.71:3000';
var botComission = 0.0098;


function fillSelectWithCurrencies(select, sourceSelect) {
    var sselect = document.getElementById(sourceSelect);
    var bank = sselect.options[sselect.selectedIndex].value;
    var currencies = '';
    getBankList(function (data) {
        $.each(data, function (key, value) {
            if (value.bank === bank) {
                currencies = value.currency.split(',');
            }
        });
        select.removeAttribute('disabled');
        for (var j = select.options.length; j >= 0; j--) {
            select.remove(j);
        }
        for (var i = 0; i < currencies.length; i++) {
            var opt = document.createElement("option");
            opt.innerHTML = currencies[i];
            select.appendChild(opt);
        }
    });
}

function fillSelectFromArray(select, array) {
    select.removeAttribute('disabled');
    for (var j = select.options.length; j >= 0; j--) {
        if (j !== select.selectedIndex) {
            select.remove(j);
        } else {
            select.options[j].text = ".....";
        }
    }
    for (var i = 0; i < array.length; i++) {
        var opt = document.createElement("option");
        opt.innerHTML = array[i];
        opt.value = array[i];
        select.appendChild(opt);
    }
}

function getFullPaymentData(callback) {
    var totalRub = 0, totalBtc = 0, currentAvg = 0;
    return $.ajax({
        url: apiServer + '/reportpay',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
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
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getFullSalesData(callback) {
    return $.ajax({
        url: apiServer + '/reportsell',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        crossDomain: true,
        success: function (data) {
            var result = {
                'data': data
            };
            callback(result);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getFullTransferData(callback) {
    return $.ajax({
        url: apiServer + '/reporttranslate',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        crossDomain: true,
        success: function (data) {
            var result = {
                'data': data
            };
            callback(result);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getUnacceptedTransferData(callback) {
    return $.ajax({
        url: apiServer + '/checktranslate',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        crossDomain: true,
        success: function (data) {
            var result = {
                'data': data
            };
            callback(result);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getReserveList(callback) {
    return $.ajax({
        url: apiServer + '/reserves',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        success: function (data) {
            callback(data);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getCurrencyList(callback) {
    return $.ajax({
        url: apiServer + '/currency',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        success: function (data) {
            callback(data);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getBankList(callback) {
    return $.ajax({
        url: apiServer + '/banks',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        success: function (data) {
            callback(data);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getAntiagentList(callback) {
    return $.ajax({
        url: apiServer + '/anti_agent',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        success: function (data) {
            callback(data);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getCredits(callback) {
    return $.ajax({
        url: apiServer + '/reportcredit',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        success: function (data) {
            callback(data);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getRemainders(callback) {
    return $.ajax({
        url: apiServer + "/remainder",
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        success: function (data) {
            callback(data);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getMentorInvites(callback) {
    return $.ajax({
        url: apiServer + '/checkMentor',
        type: 'get',
        headers: {'authorization': localStorage.getItem('token')},
        success: function (data) {
            callback(data);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getMentorList(callback) {
    return $.ajax({
        url: apiServer + "/listMentor",
        type: 'get',
        headers: {'authorization' : localStorage.getItem('token')},
        success: function (data) {
            callback(data);
        },
        error: function (err) {
            callback(err.status);
        }
    });
}

function getGlobalStatsFull(callback) {
    var fullList, payList = null, sellList = null;

    //pays request
    function pays() {
        return $.ajax({
            url: apiServer + '/reportpay',
            type: 'GET',
            crossDomain: true,
            headers: {
                'authorization': localStorage.getItem('token')
            },
            success: function (data) {
                payList = data;
                $.each(payList, function (key, value) {
                    value.operation = 'pay'
                });
            }
        });
    }

    //sells request
    function sells() {
        return $.ajax({
            url: apiServer + "/reportSell",
            crossDomain: true,
            type: 'GET',
            headers: {
                'authorization': localStorage.getItem('token')
            },
            success: function (data) {
                sellList = data;
                $.each(sellList, function (key, value) {
                    value.operation = 'sell';
                });
            }
        });
    }

    //каждой записи добавляю новое поле с типом операции - operation, чтобы их можно было отличить

    $.when(pays(), sells()).done(function (a1, a2) {
        //совмещаю списки покупок и продаж, и сортирую по дате
        //merging both lists and sorting result
        fullList = payList.concat(sellList);
        fullList.sort(function (a, b) {
            return a.date > b.date ? 1 : -1;
        });

        //processing data
        var totalFinrez = 0, totalRub = 0, totalBtc = 0, currentAvg = 0;
        $.each(fullList, function (key, value) {
            //операции продажи - влияют только на финрез
            if (value.operation === "sell") {
                totalFinrez += getDealFinrez(value.rub, currentAvg, value.btc, value.bot_commiss, value.commiss);
                totalBtc -= value.btc + value.bot_commiss;
                totalRub += value.rub - value.commiss;
            }
            //операции покупки - меняют средний курс
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

function getDealFinrez(income, avgCourse, btcOutcome, botCommiss, comiss) {
    var result;
    result = (income - (avgCourse * btcOutcome) - (botCommiss * avgCourse) - comiss).toFixed(2);
    return parseFloat(result);
}


