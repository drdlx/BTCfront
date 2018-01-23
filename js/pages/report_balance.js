var todayDate = new Date(), dateType = "";
var userList = [], dateList = {}, currencyList = [], reserveList = [];

$(document).ready(function () {
    $('input[name=type]').on('change', function () {
        if (this.value === 'multiple') {
            dateType = 'multiple';
            $("#report2_date").show();
            $("#report_date_label").html("От");
            $("#report2_date_label").html("До");
        } else {
            dateType = 'single';
            $("#report2_date").hide();
            $("#report2_date").val("");
            $("#report_date_label").html("");
            $("#report2_date_label").html("");
            reBuildTable();
        }
    });
    //get all available dates for current user
    var r1 = function (username) {
        var userReqStr = "&user=" + username;

        var currDateHeader = new Date(),
            day = (currDateHeader.getDate() < 10) ? "0" + currDateHeader.getDate() : currDateHeader.getDate(),
            month = ((currDateHeader.getMonth() + 1) < 10) ? "0" + (currDateHeader.getMonth() + 1) : currDateHeader.getMonth() + 1,
            year = currDateHeader.getFullYear();
        console.log(userReqStr + "&dateEnd=" + month + "/" + day + "/" + year + "&dateBegin=01/01/1990");
        return $.ajax({
            url: apiServer + '/reportRemainder',
            type: 'GET',
            crossDomain: true,
            data: userReqStr + "&dateEnd=" + month + "/" + day + "/" + year + "&dateBegin=01/01/1990",
            headers: {
                "authorization": localStorage.getItem('token')
            },
            success: function (data) {
                dateList = {};
                console.log(data);
                $.each(data, function (key, value) {
                    var currDate = new Date(key),
                        day = (currDate.getDate() < 10) ? "0" + currDate.getDate() : currDate.getDate(),
                        month = ((currDate.getMonth() + 1) < 10) ? "0" + (currDate.getMonth() + 1) : currDate.getMonth() + 1,
                        year = currDate.getFullYear();
                    dateList[day + "/" + month + "/" + year] = day + "/" + month + "/" + year;
                });
            }
        });
    };
    var r2 = getAntiagentList(function (data) {
        $.each(data, function (key, value) {
            if (value.internal) {
                userList.push(value.agentname);
            }
        });
    });
    var r3 = getCurrencyList(function (data) {
        currencyList = data;
    });
    var r4 = getReserveList(function (data) {
       reserveList = data;
    });
    $.when(r1(username), r2, r3, r4).done(function () {
        //======fill users select
        fillSelectFromArray(document.getElementById("report_user"), userList);
        document.getElementById("report_user").value = username;
        //======fill datePicker
        var todayDay = todayDate.getDate(), todayMonth = todayDate.getMonth() + 1, todayYear = todayDate.getFullYear();
        $("#report_date").val(todayDay + "/" + todayMonth + "/" + todayYear);
        $("#report_date").datepicker({
            dateFormat: 'd/m/yy',
            beforeShowDay: function (date) {
                var currDate = new Date(date),
                    day = (currDate.getDate() < 10) ? "0" + currDate.getDate() : currDate.getDate(),
                    month = (currDate.getMonth() + 1 < 10) ? "0" + (currDate.getMonth() + 1) : currDate.getMonth() + 1,
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
        $("#report2_date").datepicker({
            dateFormat: 'd/m/yy',
            beforeShowDay: function (date) {
                var currDate = new Date(date),
                    day = (currDate.getDate() < 10) ? "0" + currDate.getDate() : currDate.getDate(),
                    month = (currDate.getMonth() + 1 < 10) ? "0" + (currDate.getMonth() + 1) : currDate.getMonth() + 1,
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
        reBuildTable();
        //======listening for changes
        $("#report_user").change(function () {
            r1($(this).val());
            reBuildTable();
        });
        $("#report_date, #report2_date").change(function () {
            reBuildTable();
        });
    });
});

function reBuildTable() {
    $("#report_table").find("tr").remove();
    $("#loading").show();
    //forming dates for request
    var user = $("#report_user").val(),
        date1 = $("#report_date").val().split('/'),
        dateDay = (date1[0] < 10) ? "0" + date1[0] : date1[0],
        dateMonth = (date1[1] < 10) ? "0" + date1[1] : date1[1],
        dateYear = date1[2],
        date2 = date1, date2Day = dateDay, date2Month = dateMonth, date2Year = dateYear;
    if (dateType === 'multiple') {
        date2 = $("#report2_date").val().split('/');
        date2Day = (date2[0] < 10) ? "0" + date2[0] : date2[0];
        date2Month = (date2[1] < 10) ? "0" + date2[1] : date2[1];
        date2Year = date2[2];
    }
    var dateRequest = [dateMonth + "/" + dateDay + "/" + dateYear, date2Month + "/" + date2Day + "/" + date2Year];
    var userReqStr = (priv === 'admin') ? "&user=" + user : "&user=" + username;
    dateRequest.sort(function (a, b) {
        return a > b;
    });
    $.ajax({
        url: apiServer + '/reportRemainder',
        type: 'GET',
        crossDomain: true,
        data: userReqStr + "&dateEnd=" + dateRequest[1] + "&dateBegin=" + dateRequest[0],
        headers: {
            "authorization": localStorage.getItem('token')
        },
        success: function (data) {
            var operation_data = '<tr><th></th>',
                myOwn = {}, foreign = {}, switched = {}, debits = {}, credits = {},
                ownSum = [], foreignSum = [], switchedSum = [], debitsSum = {}, creditsSum = {},
                equity = {}, finres = {};
            var cols = Object.keys(data).length + 1;

            function countReserveBlock(sourceArray, block, sumObj) {
                var sum = 0;
                $.each(sourceArray, function (kkey, reserve) {
                    if (!(reserve.title in block)) {
                        block[reserve.title] = {};
                    }
                    if (!(reserve.date in finres)) {
                        finres[reserve.date] = 0;
                    }
                    if (!(reserve.date in equity)) {
                        equity[reserve.date] = 0;
                    }
                    block[reserve.title][reserve.date] = (currencyList.find(function (a) {
                        return a.currency === reserve.currency;
                    }).isCrypto) ? reserve.remainder * reserveList.find(function (a) {
                        return a.title === reserve.title;
                    }).average_course : reserve.remainder;
                    sum += block[reserve.title][reserve.date];
                });
                sumObj.push(sum);
            }
            function countDebitBlock(sourceArray, block, sumObj) {
                $.each(sourceArray, function (kkey, item) {
                    //creating new objects
                    if (!(item.credit in block)) {
                        block[item.credit] = {};
                    }
                    if (!(item.currency in block[item.credit])) {
                        block[item.credit][item.currency] = {};
                    }
                    //transforming crypto-currencies into valuable fiat
                    let currentCurrency = item.currency, avg_course = 1;
                    if (currencyList.find(function (a) {
                            return a.currency === currentCurrency;
                        }).isCrypto === true) {
                        let sumRemaindr = 0, sumAvg = 0;
                        $.each(reserveList, function (objK, val) {
                            if ((val.owner === user || val.responsible === user) && val.currency === currentCurrency) {
                                sumRemaindr += val.remainder;
                                sumAvg += val.average_course * val.remainder;
                            }
                        });
                        avg_course = sumAvg / sumRemaindr;
                    }

                    block[item.credit][item.currency][item.date] = (item.debts * avg_course);

                    //sum
                    if (!(item.credit in sumObj)) {
                        sumObj[item.credit] = {};
                    }
                    if (!(item.date in sumObj[item.credit])) {
                        sumObj[item.credit][item.date] = 0;
                    }
                    sumObj[item.credit][item.date] += item.debts * avg_course;
                    equity[item.date] -= item.debts;
                });
            }
            function countCreditBlock(sourceArray, block, sumObj) {
                $.each(sourceArray, function (kkey, item) {
                    if (!(item.debet in block)) {
                        block[item.debet] = {};
                    }
                    if (!(item.currency in block[item.debet])) {
                        block[item.debet][item.currency] = {};
                    }

                    //transforming crypto-currencies into valuable fiat
                    let currentCurrency = item.currency, avg_course = 1;
                    if (currencyList.find(function (a) {
                            return a.currency === currentCurrency;
                        }).isCrypto === true) {
                        let sumRemaindr = 0, sumAvg = 0;
                        $.each(reserveList, function (objK, val) {
                            if ((val.owner === user || val.responsible === user) && val.currency === currentCurrency) {
                                sumRemaindr += val.remainder;
                                sumAvg += val.average_course * val.remainder;
                            }
                        });
                        avg_course = sumAvg / sumRemaindr;
                    }
                    block[item.debet][item.currency][item.date] = (item.debts * avg_course);

                    //sum
                    if (!(item.debet in sumObj)) {
                        sumObj[item.debet] = {};
                    }
                    if (!(item.date in sumObj[item.debet])) {
                        sumObj[item.debet][item.date] = 0;
                    }
                    sumObj[item.debet][item.date] += item.debts * avg_course;
                    equity[item.date] += item.debts;
                });
            }
            function drawReserveBlock(block, sumObj) {
                for (var i = 0; i < cols - 1; i++) {
                    operation_data += '<td><b>' + sumObj[i].toLocaleString('ru-RU', {
                        maximumFractionDigits: 2
                    }) + '</b></td>';
                    equity[Object.keys(equity)[i]] += sumObj[i];
                }
                operation_data += '</tr>';
                $.each(block, function (title, date) {
                    operation_data += "<tr><td>" + title + "</td>";
                    $.each(date, function (key, val) {
                        operation_data += "<td>" + val.toLocaleString('ru-RU', {
                            maximumFractionDigits: 2
                        }) + "</td>";

                    });
                    operation_data+= '</tr>';
                });
            }
            function drawSettlementsBlock(block, sumObj) {
                //Name of debit - first group
                $.each(block, function (title, obj) {
                    operation_data += '<tr>';
                    operation_data += '<td><b>' + title + '</b></td>';
                    $.each(sumObj[title], function (datte, val) {
                        operation_data += '<td><b>' + val.toLocaleString('ru-RU', {
                            maximumFractionDigits: 2
                        }) + '</b></td>';
                    });
                    operation_data += "</tr>";

                    //Currency - second group
                    let currencySet = [];
                    if (Object.keys(obj).length > 0) {
                        $.each(Object.keys(obj), function (currName, vl) {
                            currencySet.push(vl);
                        });

                        for (var j = 0; j < currencySet.length; j++) {
                            operation_data += '<tr>';
                            operation_data += '<td>' + currencySet[j].toLocaleString('ru-RU', {
                                maximumFractionDigits: 2
                            }) + '</td>';
                            $.each(obj[currencySet[j]], function (date, remainders) {
                                operation_data += '<td>' + remainders.toLocaleString('ru-RU', {
                                    maximumFractionDigits: 2
                                }) + '</td>';
                            });
                            operation_data += '</tr>';
                        }
                    }
                });
            }


            //table headers and counting
            $.each(data, function (key, value) {
                countReserveBlock(value.OwnAndResReserv, myOwn, ownSum);
                countReserveBlock(value.OwnReserv, foreign, foreignSum);
                countReserveBlock(value.ResReserv, switched, switchedSum);
                countDebitBlock(value.Debet, debits, debitsSum);
                countCreditBlock(value.Credit, credits, creditsSum);
                //date headers
                var headDate = key.split('/');
                operation_data += '<th>' + headDate[1] + '\.' + headDate[0] + '</th>';
            });
            operation_data += '</tr><tr class="report-user-header">';
            //reserves section
            operation_data += '<td colspan="' + cols + '" class="report-user-header">Резервы</td>';
            operation_data += '</tr><tr>';
            //"My own reserves" draw
            operation_data += '<td><b>Мои резервы</b></td>';
            drawReserveBlock(myOwn, ownSum);
            //"On other's responsibility" draw
            operation_data += '<td><b>Мои резервы в подотчете</b></td>';
            drawReserveBlock(foreign, foreignSum);
            //debits section
            operation_data += '<tr class="report-user-header"><td colspan="' + cols + '">Дебеторская задолженность</td></tr>';
            drawSettlementsBlock(debits, debitsSum);
            //credits section
            operation_data += '<tr class="report-user-header"><td colspan="' + cols + '">Кредиторская задолженность</td></tr>';
            drawSettlementsBlock(credits, creditsSum);
            operation_data += '<tr class="report-user-header"><td class>Собственный капитал</td>';
            $.each(equity, function (date, sum) {
               operation_data += '<td>' + sum.toLocaleString('ru-RU', {
                   maximumFractionDigits: 2
               }) + '</td>';
            });
            operation_data += '</tr>';
            $("#loading").hide();
            $("#report_table").append(operation_data);
        }
    });
}
