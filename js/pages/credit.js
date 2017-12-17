var dateType = "";
var userList = [], minDate = "", maxDate = "";

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
    getAntiagentList(function (data) {
        $.each(data, function (key, value) {
            if (value.internal === true) {
                userList.push(value.agentname);
            }
        });
        //======fill reserve select
        fillSelectFromArray(document.getElementById("report_user"), userList);
        fillSelectFromArray(document.getElementById("report_credit"), userList);
        //======listening for changes
        $("#report_user, #report_credit").change(function () {
            $("#report_date").val("");
            $("#report2_date").val("");
            //get min available date for current debit\credit pair
            var r1 = function (debit, credit) {
                var currDateHeader = new Date(),
                    day = (currDateHeader.getDate() < 10) ? "0" + currDateHeader.getDate() : currDateHeader.getDate(),
                    month = ((currDateHeader.getMonth() + 1) < 10) ? "0" + (currDateHeader.getMonth() + 1) : currDateHeader.getMonth() + 1,
                    year = currDateHeader.getFullYear();
                return $.ajax({
                    url: apiServer + '/creditTransaction',
                    type: 'GET',
                    crossDomain: true,
                    data: '&debet=' + debit + "&credit=" + credit + "&dateEnd=" + month + "/" + day + "/" + year + "&dateBegin=01/01/1990",
                    headers: {
                        "authorization": localStorage.getItem('token')
                    },
                    success: function (data) {
                        console.log(data);
                        let lastOperationDate = data[data.length - 1].date;
                        let firstOperationDate = data[0].date;
                        minDate = new Date(firstOperationDate.substring(0, firstOperationDate.indexOf('T'))).setHours(0, 0, 0, 0);
                        maxDate = new Date(lastOperationDate.substring(0, lastOperationDate.indexOf('T'))).setHours(0, 0, 0, 0);
                    }
                });
            };
            if ($("#report_user").val() !== "....." && $("#report_credit").val() !== ".....") {
                r1($("#report_user").val(), $("#report_credit").val());
                //======fill datePicker
                $("#report_date").datepicker({
                    dateFormat: 'd/m/yy',
                    beforeShowDay: function (date) {
                        var currDate = new Date(date).setHours(0, 0, 0, 0);
                        var hDate = (currDate >= minDate) && (currDate <= maxDate);
                        if (hDate) {
                            return [true, "date_event"];
                        } else {
                            return [false, "", ""];
                        }
                    }
                });
                $("#report2_date").datepicker({
                    dateFormat: 'd/m/yy',
                    beforeShowDay: function (date) {
                        var currDate = new Date(date).setHours(0, 0, 0, 0);
                        var hDate = (currDate >= minDate) && (currDate <= maxDate);
                        if (hDate) {
                            return [true, "date_event"];
                        } else {
                            return [false, "", ""];
                        }
                    }
                });
            }
        });
        $("#report_date, #report2_date").change(function () {
            if ($("#report_user").val() !== "....." && $("#report_credit").val() !== ".....") {
                reBuildTable();
            }
        });
    });
});

function reBuildTable() {
    $("#report_table").find("tr:gt(0)").remove();
    $("#loading").show();
    var debit = $("#report_user").val(), credit = $("#report_credit").val();
    var date1 = $("#report_date").val().split('/'),
        dateDay = (date1[0] < 10) ? "0" + date1[0] : date1[0],
        dateMonth = (date1[1] < 10) ? "0" + date1[1] : date1[1],
        dateYear = date1[2],
        date2 = date1, date2Day = dateDay, date2Month = dateMonth, date2Year = dateYear;
    if (dateType === 'multiple' && $("#report2_date").val() !== "") {
        date2 = $("#report2_date").val().split('/');
        date2Day = (date2[0] < 10) ? "0" + date2[0] : date2[0];
        date2Month = (date2[1] < 10) ? "0" + date2[1] : date2[1];
        date2Year = date2[2];
    }
    var dateRequest = [dateYear + "-" + dateMonth + "-" + dateDay, date2Year + "-" + date2Month + "-" + date2Day];
    dateRequest.sort(function (a, b) {
        return a > b;
    });
    $.ajax({
        url: apiServer + '/creditTransaction',
        type: 'GET',
        crossDomain: true,
        data: "&debet=" + debit + "&credit=" + credit + "&dateEnd=" + dateRequest[1] + "&dateBegin=" + dateRequest[0],
        headers: {
            "authorization": localStorage.getItem('token')
        },
        success: function (data) {
            console.log("&debet=" + debit + "&credit=" + credit + "&dateEnd=" + dateRequest[1] + "&dateBegin=" + dateRequest[0]);
            console.log(data);
            var operation_data = '', beginRemainder = 0;
            if (data.length > 0) {
                //counting remainder on start

                if (debit === data[0].source) {
                    beginRemainder = data[0].__v + data[0].transaction;
                } else {
                    beginRemainder = data[0].__v - data[0].transaction;
                }


                //"before" remainder
                operation_data += '<tr><td colspan="4">Остаток на начало</td><td>' + beginRemainder + '</td></tr>';
                //content
                var sumPlus = 0, sumMinus = 0, sumRemainder = beginRemainder;
                $.each(data, function (key, val) {
                    operation_data += '<tr>';
                    operation_data += '<td>' + val.date.substring(0, val.date.indexOf('T')) + " " + val.date.substring(val.date.indexOf('T') + 1, val.date.indexOf('.')) + "</td>";
                    operation_data += '<td>' + val.description + "</td>";
                    operation_data += '<td>' + ((val.user === credit) ? val.transaction : "") + '</td>';
                    sumPlus += ((val.user === credit) ? val.transaction : 0);
                    operation_data += '<td>' + ((val.user === debit) ? val.transaction : "") + '</td>';
                    sumMinus += ((val.source === debit) ? val.transaction : 0);
                    operation_data += '<td>' + val.__v + '</td>';
                    sumRemainder = val.__v;
                    operation_data += '<tr>';
                });
                operation_data += '<tr><td colspan="2">Итого:</td><td>' + sumPlus + '</td><td>' + sumMinus + '</td><td>' + sumRemainder + '</td></tr>'
            } else {
                operation_data += "<tr><td colspan='5'>Не обнаружено операций за указанный период</td></tr>"
            }
            $("#loading").hide();
            $("#report_table").append(operation_data);
        }
    });
}
