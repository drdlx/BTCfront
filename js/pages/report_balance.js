var todayDate = new Date(), dateType = "";
var userList = ["Все пользователи"], dateList = {};

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
                var arr = data.reports.noncrypto,
                arr2 = data.reports.crypto;
                dateList = {};
                $.each(arr, function (key, value) {
                    var currDate = new Date(value.date),
                        day = (currDate.getDate() < 10) ? "0" + currDate.getDate() : currDate.getDate(),
                        month = ((currDate.getMonth() + 1) < 10) ? "0" + (currDate.getMonth() + 1) : currDate.getMonth() + 1,
                        year = currDate.getFullYear();
                    dateList[day + "/" + month + "/" + year] = day + "/" + month + "/" + year;
                });
                $.each(arr2, function (key, value) {
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
        $("#report2_date").datepicker({
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
        $("#report_date, #report2_date").change(function () {
            reBuildTable();
        });
    });
});

function reBuildTable() {
    $("#report_table").find("tr").remove();
    $("#loading").show();
    var user = $("#report_user").val(),
        date1 = $("#report_date").val().split('/'),
        dateDay = (date1[0] < 10) ? "0" + date1[0] : date1[0],
        dateMonth = (date1[1] < 10) ? "0" + date1[1] : date1[1],
        dateYear = date1[2],
        date2 = date1, date2Day = dateDay, date2Month = dateMonth, date2Year = dateYear;
    if (dateType === 'multiple') {
        date2 = $("#report2_date").val().split('/');
        dateDay = (date1[0] - 1 < 10) ? "0" + date1[0] - 1 : date1[0] - 1,
        date2Day = (date2[0] < 10) ? "0" + date2[0] : date2[0];
        date2Month = (date2[1] < 10) ? "0" + date2[1] : date2[1];
        date2Year = date2[2];
    }
    if (user === "Все пользователи") {
        user = "";
    }
    var dateRequest = [dateMonth + "/" + dateDay + "/" + dateYear, date2Month + "/" + date2Day + "/" + date2Year];
    var userReqStr = (priv === 'admin') ? "&user=" + user : "";
    dateRequest.sort(function (a, b) {
        return a > b;
    });
    var request = (localStorage.getItem('permission') === 'admin') ? '/admin/reportfull' : '/reportfull';
    $.ajax({
        url: apiServer + request,
        type: 'GET',
        crossDomain: true,
        data: userReqStr + "&dateEnd=" + dateRequest[1] + "&dateBegin=" + dateRequest[0],
        headers: {
            "authorization": localStorage.getItem('token')
        },
        success: function (data) {
            var operation_data = '', sortedNoncryptoData = {},
                fullData = data.reports.noncrypto.concat(data.reports.crypto),
                myOwn = [], foreign = [], shared = [];

            console.log(fullData);

            $("#loading").hide();
            $("#report_table").append(operation_data);
        }
    });
}
