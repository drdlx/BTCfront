var todayDate = new Date();
var userList = ["Все пользователи"], dateList = {};

$(document).ready(function () {
    //get all available dates for current user
    var r1 = function (username) {
        var request = (priv === 'admin') ? '/admin/reportfull' : '/reportfull', userReqStr = "&user=";
        if (username !== "Все пользователи") {
            userReqStr = (priv === 'admin') ? "&user=" + username : "";
        }
        var currDateHeader = new Date(),
            day = (currDateHeader.getDate() < 10) ? "0" + currDateHeader.getDate() : currDateHeader.getDate(),
            month = ((currDateHeader.getMonth() + 1) < 10) ? "0" + (currDateHeader.getMonth() + 1) : currDateHeader.getMonth() + 1,
            year = currDateHeader.getFullYear();
        return $.ajax({
            url: apiServer + request,
            type: 'GET',
            crossDomain: true,
            data: userReqStr + "&dateEnd=" + month + "/" + day + "/" + year + "&dateBegin=1/1/1990",
            headers: {
                "authorization": localStorage.getItem('token')
            },
            success: function (data) {
                console.log(data);
                var arr = data.reports.noncrypto;
                dateList = {};
                $.each(arr, function (key, value) {
                    var currDate = new Date(value.date),
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
    $.when(r1(username), r2).done(function () {
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
        reBuildTable();
        //======listening for changes
        $("#report_user").change(function () {
            r1($(this).val());
            reBuildTable();
        });
        $("#report_date").change(function () {
            reBuildTable();
        });
    });
});

function reBuildTable() {
    $("#report_table").find("tr:gt(0)").remove();
    $("#loading").show();
    var user = $("#report_user").val(),
        date = $("#report_date").val().split('/'),
        dateDay = (date[0] < 10) ? "0" + date[0] : date[0],
        dateMonth = (date[1] < 10) ? "0" + date[1] : date[1],
        dateYear = date[2];
    if (user === "Все пользователи") {
        user = "";
    }
    var userReqStr = (priv === 'admin') ? "&user=" + user : "";
    var request = (localStorage.getItem('permission') === 'admin') ? '/admin/reportfull' : '/reportfull';
    $.ajax({
        url: apiServer + request,
        type: 'GET',
        crossDomain: true,
        data: userReqStr + "&dateEnd=" + dateMonth + "/" + dateDay + "/" + dateYear + "&dateBegin=" + dateMonth + "/" + dateDay + "/" + dateYear,
        headers: {
            "authorization": localStorage.getItem('token')
        },
        success: function (data) {
            var overallRemains = 0, overallConsume = 0, overallComing = 0, overallIO = 0, overallComiss = 0,
                overallFinres = 0;
            var operation_data = '', sortedNoncryptoData = {},
                unsortedNoncrypto = data.reports.noncrypto,
                unsortedCrypto = data.reports.crypto;
            if (unsortedNoncrypto !== undefined) {
                sortedNoncryptoData = unsortedNoncrypto.sort(function (a, b) {
                    return a.responsible.localeCompare(b.responsible);
                });
            }
            var currentUser = '', colCount = 7;
            //---------------------------------------
            $.each(sortedNoncryptoData, function (key, value) {
                var currDate = new Date(value.date), day = currDate.getDate(), month = currDate.getMonth() + 1,
                    year = currDate.getFullYear();
                dateList[month + "/" + day + "/" + year] = month + "/" + day + "/" + year;
                if ((currentUser !== value.responsible) && (priv === 'admin') && (user === "")) {
                    currentUser = value.responsible;
                    operation_data += '<tr class="report-user-header">';
                    operation_data += '<td colspan="' + colCount + '">' + currentUser + "</td>";
                    operation_data += '</tr>';
                }

                operation_data += '<tr>';
                operation_data += '<td>' + value.paym + '</td>';

                operation_data += '<td>' + value.remainder.toLocaleString('ru-RU', {
                    maximumFractionDigits: 2
                }) + '</td>';
                overallRemains += value.remainder;

                operation_data += '<td>' + value.consumption.toLocaleString('ru-RU', {
                    maximumFractionDigits: 2
                }) + '</td>';
                overallConsume += value.consumption;

                operation_data += '<td>' + value.coming.toLocaleString('ru-RU', {
                    maximumFractionDigits: 2
                }) + '</td>';
                overallComing += value.coming;

                operation_data += '<td>' + value.transaction.toLocaleString('ru-RU', {
                    maximumFractionDigits: 2
                }) + '</td>';
                overallIO += value.transaction;

                operation_data += '<td>' + value.commiss.toLocaleString('ru-RU', {
                    maximumFractionDigits: 2
                }) + '</td>';
                overallComiss += value.commiss;

                operation_data += '<td>' + value.cur_fin_res.toLocaleString('ru-RU', {
                    maximumFractionDigits: 2
                }) + '</td>';
                overallFinres += value.cur_fin_res;

                operation_data += '</tr>';
            });

            operation_data += '<tr class="overall">';
            operation_data += '<td>' + 'ИТОГО:' + '</td>';
            operation_data += '<td>' + overallRemains.toLocaleString('ru-RU', {
                maximumFractionDigits: 2
            }) + '</td>';
            operation_data += '<td>' + overallConsume.toLocaleString('ru-RU', {
                maximumFractionDigits: 2
            }) + '</td>';
            operation_data += '<td>' + overallComing.toLocaleString('ru-RU', {
                maximumFractionDigits: 2
            }) + '</td>';
            operation_data += '<td>' + overallIO.toLocaleString('ru-RU', {
                maximumFractionDigits: 2
            }) + '</td>';
            operation_data += '<td>' + overallComiss.toLocaleString('ru-RU', {
                maximumFractionDigits: 2
            }) + '</td>';
            operation_data += '<td>' + overallFinres.toLocaleString('ru-RU', {
                maximumFractionDigits: 2
            }) + '</td>';
            operation_data += '</tr>';
            $("#loading").hide();
            $("#report_table").append(operation_data);
        }
    });
}
