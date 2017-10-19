var todayDate = new Date(), avgCourse;
var userList = ["Все пользователи"], dateList = {};

$(document).ready(function () {
    //get all available dates for current user
    var r1 = function (username) {
        var request = (priv === 'admin') ? '/admin/reportfull' : '/reportfull', userReqStr = "";
        if (username !== "Все пользователи") {
            userReqStr = (priv === 'admin') ? "&user=" + username : "";
        }
        return $.ajax({
            url: apiServer + request,
            type: 'GET',
            crossDomain: true,
            data: userReqStr,
            headers: {
                "authorization": localStorage.getItem('token')
            },
            success: function (data) {
                var arr = data.data;
                dateList = {};
                $.each(arr, function (key, value) {
                    var currDate = new Date(value.date), day = currDate.getDate(), month = currDate.getMonth() + 1, year = currDate.getFullYear();
                    dateList[month + "/" + day + "/" + year] = month + "/" + day + "/" + year;
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
        $("#report_date").val(todayMonth + "/" + todayDay + "/" + todayYear);
        $("#report_date").datepicker({
            dateFormat: 'm/d/yy',
            beforeShowDay: function (date) {
                var currDate = new Date(date), day = currDate.getDate(), month = currDate.getMonth() + 1, year = currDate.getFullYear();
                var hDate = month + "/" + day + "/" + year;
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
            reBuildTable();
            r1($(this).val());
        });
        $("#report_date").change(function () {
            reBuildTable();
        });
    });
});

function reBuildTable() {
    $("#report_table").find("tr:gt(0)").remove();
    $("#loading").show();
    var request = (localStorage.getItem('permission') === 'admin') ? '/admin/reportfull' : '/reportfull';
    var user = $("#report_user").val(), date = $("#report_date").val();
    if (user === "Все пользователи") { user = ""}
    var userReqStr = (priv === 'admin') ? "&user=" + user : "";
    $.ajax({
        url: apiServer + request,
        type: 'GET',
        crossDomain: true,
        data: userReqStr + "&date=" + date,
        headers: {
            "authorization": localStorage.getItem('token')
        },
        success: function (data) {
            var overallRemains = 0, overallConsume = 0, overallComing = 0, overallIO = 0, overallComiss = 0, overallFinres = 0;
            var operation_data = '', unsorted = (user === "") ? data.report : data.report.noncrypto, sortedData = {};
            if (unsorted !== undefined) {
                sortedData = unsorted.sort(function (a, b) {
                    return a.user.localeCompare(b.user);
                });
            }
            var currentUser = '', colCount = 7;
            //---------------------------------------
            $.each(sortedData, function (key, value) {
                var currDate = new Date(value.date), day = currDate.getDate(), month = currDate.getMonth() + 1,
                    year = currDate.getFullYear();
                dateList[month + "/" + day + "/" + year] = month + "/" + day + "/" + year;
                if ((currentUser !== value.user) && (priv === 'admin') && (user === "")) {
                    currentUser = value.user;
                    operation_data += '<tr class="report-user-header">';
                    operation_data += '<td colspan="' + colCount + '">' + currentUser + "</td>";
                    operation_data += '</tr>';
                }

                operation_data += '<tr>';
                operation_data += '<td>' + value.paym + '</td>';

                operation_data += '<td>' + value.remainder.toFixed(2) + '</td>';
                overallRemains += value.remainder;

                operation_data += '<td>' + value.consumption.toFixed(2) + '</td>';
                overallConsume += value.consumption;

                operation_data += '<td>' + value.coming.toFixed(2) + '</td>';
                overallComing += value.coming;

                operation_data += '<td>' + value.transaction.toFixed(2) + '</td>';
                overallIO += value.transaction;

                operation_data += '<td>' + value.commiss.toFixed(2) + '</td>';
                overallComiss += value.commiss;

                operation_data += '<td>' + value.cur_fin_res.toFixed(2) + '</td>';
                overallFinres += value.cur_fin_res;

                operation_data += '</tr>';
            });

            operation_data += '<tr class="overall">';
            operation_data += '<td>' + 'ИТОГО:' + '</td>';
            operation_data += '<td>' + overallRemains.toFixed(2) + '</td>';
            operation_data += '<td>' + overallConsume.toFixed(2) + '</td>';
            operation_data += '<td>' + +overallComing.toFixed(2) + '</td>';
            operation_data += '<td>' + overallIO.toFixed(2) + '</td>';
            operation_data += '<td>' + overallComiss.toFixed(2) + '</td>';
            operation_data += '<td>' + overallFinres.toFixed(2) + '</td>';
            operation_data += '</tr>';
            $("#loading").hide();
            $("#report_table").append(operation_data);
        }
    });
}