var dateType = "";
var reserveList = [], minDate = "", maxDate = "";

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
    getReserveList(function (data) {
        $.each(data, function (key, value) {
            if (value.owner === username) {
                reserveList.push(value.title);
            }
        });
        //======fill reserve select
        fillSelectFromArray(document.getElementById("report_user"), reserveList);
        document.getElementById("report_user").value = "выберите резерв";
        //======listening for changes
        $("#report_user").change(function () {
            //get min available date for current reserve
            var r1 = function (reserve) {
                var currDateHeader = new Date(),
                    day = (currDateHeader.getDate() < 10) ? "0" + currDateHeader.getDate() : currDateHeader.getDate(),
                    month = ((currDateHeader.getMonth() + 1) < 10) ? "0" + (currDateHeader.getMonth() + 1) : currDateHeader.getMonth() + 1,
                    year = currDateHeader.getFullYear();
                console.log('&reserv=' + reserve + "&dateEnd=" + month + "/" + day + "/" + year + "&dateBegin=01/01/1990");
                return $.ajax({
                    url: apiServer + '/trafficOnReserves',
                    type: 'GET',
                    crossDomain: true,
                    data: '&reserv=' + reserve + "&dateEnd=" + month + "/" + day + "/" + year + "&dateBegin=01/01/1990",
                    headers: {
                        "authorization": localStorage.getItem('token')
                    },
                    success: function (data) {
                        console.log(data);
                        let lastOperationDate = data[data.length - 1].date;
                        let firstOperationDate = data[0].date;
                        minDate = new Date(firstOperationDate.substring(0, firstOperationDate.indexOf('T'))).setHours(0,0,0,0);
                        maxDate = new Date(lastOperationDate.substring(0, lastOperationDate.indexOf('T'))).setHours(0,0,0,0);
                    }
                });
            };
            r1($(this).val());
            //======fill datePicker
            $("#report_date, #report2_date").val("");
            $("#report_date").datepicker({
                dateFormat: 'd/m/yy',
                beforeShowDay: function (date) {
                    var currDate = new Date(date).setHours(0,0,0,0);
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
                    var currDate = new Date(date).setHours(0,0,0,0);
                    var hDate = (currDate >= minDate) && (currDate <= maxDate);
                    if (hDate) {
                        return [true, "date_event"];
                    } else {
                        return [false, "", ""];
                    }
                }
            });
        });
        $("#report_date, #report2_date").change(function () {
            reBuildTable();
        });
    });
});

function reBuildTable() {
    $("#report_table").find("tr:gt(0)").remove();
    $("#loading").show();
    var reserve = $("#report_user").val();
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
        url: apiServer + '/trafficOnReserves',
        type: 'GET',
        crossDomain: true,
        data: "&reserv=" + reserve + "&dateEnd=" + dateRequest[1] + "&dateBegin=" + dateRequest[0],
        headers: {
            "authorization": localStorage.getItem('token')
        },
        success: function (data) {
            console.log(data);
            var operation_data = '', beginRemainder = 0;
            if (data.length > 0) {
                //counting remainder on start
                switch (data[0].type) {
                    case "transf":
                    case "buy" :
                        if (reserve === data[0].source) {
                            beginRemainder = data[0].remainderOnEnded + data[0].amount;
                        } else {
                            beginRemainder = data[0].remainderOnEnded - data[0].amount;
                        }
                        break;
                    case "sell" :
                        if (reserve === data[0].source) {
                            beginRemainder = data[0].remainderOnEnded - data[0].amount;
                        } else {
                            beginRemainder = data[0].remainderOnEnded + data[0].amount;
                        }
                        break;
                }
                //"before" remainder
                operation_data += '<tr><td colspan="4">Остаток на начало</td><td>' + beginRemainder + '</td></tr>';
                //content
                var sumPlus = 0, sumMinus = 0, sumRemainder = beginRemainder;
                $.each(data, function (key, val) {
                    operation_data += '<tr>';
                    operation_data += '<td>' + val.date.substring(0, val.date.indexOf('T')) + " " + val.date.substring(val.date.indexOf('T') + 1, val.date.indexOf('.')) + "</td>";
                    let op = "";
                    switch (val.type) {
                        case "sell":
                            op = "Продажа";
                            break;
                        case "buy":
                            op = "Покупка";
                            break;
                        case "transf":
                            op = "Ввод\\вывод";
                            break;
                    }
                    operation_data += '<td>' + op + "</td>";
                    operation_data += '<td>' + ((val.destination === reserve) ? val.amount : "") + '</td>';
                    sumPlus += ((val.destination === reserve) ? val.amount : 0);
                    operation_data += '<td>' + ((val.source === reserve) ? val.amount : "") + '</td>';
                    sumMinus += ((val.source === reserve) ? val.amount : 0);
                    operation_data += '<td>' + val.remainderOnEnded + '</td>';
                    sumRemainder = val.remainderOnEnded;
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
