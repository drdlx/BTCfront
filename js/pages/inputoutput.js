var currencies, userReserves = [], sourceList = [], agents = [], selectedCurrency,
    sourceType = "", destType = "", lastDate = "", lastTime = "";

$(document).ready(function () {

    var r4 = function () {
        var currDate = new Date(),
            day = (currDate.getDate() < 10) ? "0" + currDate.getDate() : currDate.getDate(),
            month = (currDate.getMonth() + 1 < 10) ? "0" + (currDate.getMonth() + 1) : currDate.getMonth() + 1,
            year = currDate.getFullYear();
        return $.ajax({
            url: apiServer + "/journal",
            type: 'get',
            headers: {'authorization': token},
            data: "&begin=0&end=1" + "&dateEnd=" + year + "-" + ((month < 10) ? "0" + month : month) + "-" + ((day < 10) ? "0" + day : day) + "&dateBegin=" + "&user=" + username,
            success: function (data) {
                if (data.length > 0) {
                    var datet = data[0].date;
                    lastDate = datet.substring(0, datet.indexOf('T')).split("-");
                    lastTime = datet.substring(datet.indexOf('T') + 1, datet.indexOf('.')).split(":");
                }
            }
        });
    };
    var r1 = getCurrencyList(function (data) {
        currencies = data;
    });
    var r2 = getReserveList(function (data) {
        $.each(data, function (key, value) {
            if (value.responsible === username) {
                userReserves.push(value);
                sourceList.push(value.title);
            }
        });
    });
    var r3 = getAntiagentList(function (data1) {
        $.each(data1, function (key1, value1) {
            agents.push(value1);
            if (value1.internal === false) {
                sourceList.push(value1.agentname);
            }
        });
    });
    $.when(r1, r2, r3, r4()).done(function () {
        var todayDate = new Date();
        var todayDay = todayDate.getDate(), todayMonth = todayDate.getMonth() + 1, todayYear = todayDate.getFullYear(),
            cHrs = (todayDate.getHours() < 10) ? "0" + todayDate.getHours() : todayDate.getHours(),
            cMin = (todayDate.getMinutes() < 10) ? "0" + todayDate.getMinutes() : todayDate.getMinutes(),
            cSec = (todayDate.getSeconds() < 10) ? "0" + todayDate.getSeconds() : todayDate.getSeconds();
        $("#date").datepicker({
            dateFormat: 'dd/mm/yy',
            beforeShowDay: function (date) {
                var hDate = new Date(date);
                if (hDate >= (new Date(lastDate[0], lastDate[1] - 1, lastDate[2])) && hDate <= todayDate) {
                    return [true, "date_event"];
                } else {
                    return [false, "", ""];
                }
            }
        });
        $("#date").change(function () {
            if ($("#date").val() === todayDay + "/" + todayMonth + "/" + todayYear) {
                $("#date").val($("#date").val() + " " + cHrs + ":" + cMin + ":" + cSec);
            } else if ($("#date").val() === lastDate[2] + "/" + lastDate[1] + "/" + lastDate[0]) {
                let nDate = new Date(lastDate[0] + "-" + lastDate[1] + "-" + lastDate[2]);
                nDate.setHours(lastTime[0]);
                nDate.setMinutes(lastTime[1]);
                nDate.setSeconds(parseInt(lastTime[2]) + 1);
                $("#date").val($("#date").val() + " " + nDate.getHours() + ":" + nDate.getMinutes() + ":" + nDate.getSeconds());
            } else {
                $("#date").val($("#date").val() + " 00:00:01");
            }
        });

        fillSelectFromArray(document.getElementById('source'), sourceList);
        $("#source option").each(function () {
            if ($.inArray($(this).val(), agents.map(function (a) {
                    return a.agentname;
                })) !== -1) {
                $(this).prop("class", "agent");
            } else {
                $(this).prop("class", "reserve");
            }
        });
    });

    $("#post_form").on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: apiServer + '/translate',
            type: 'post',
            crossDomain: true,
            headers: {'authorization': localStorage.getItem('token')},
            data: $("#post_form").serialize() + "&currency=" + selectedCurrency,
            success: function () {
                //filling datepicker back
                let rr1 = r4();
                $.when(rr1).done(function () {
                    let nDate = new Date(lastDate[0] + "-" + lastDate[1] + "-" + lastDate[2]);
                    nDate.setHours(lastTime[0]);
                    nDate.setMinutes(lastTime[1]);
                    nDate.setSeconds(parseInt(lastTime[2]) + 1);
                    $("#date").val(lastDate[2] + "/" + lastDate[1] + "/" + lastDate[0] + " " + nDate.getHours() + ":" + nDate.getMinutes() + ":" + nDate.getSeconds());
                });

                document.getElementById('post_form').reset();
                swal("Успех", "Операция перевода была добавлена", "success");
                reBuildSidebarContent();
                reBuildHeaderInfo();
            },
            error: function () {
                swal("Упс", "Что-то пошло не так", "error");
            }
        });
    });
});


function fillOutputSelect(inputValue) {
    var found = false;
    //checking if input is a reserve
    for (var i = 0; i < userReserves.length; i++) {
        if (userReserves[i].title === inputValue) {
            selectedCurrency = userReserves[i].currency;
            var result1 = [];
            $.each(agents, function (key, value) {
                result1.push(value.agentname);
            });
            $.each(userReserves, function (key, value) {
                if ((value.title !== inputValue) && (value.currency === selectedCurrency)) {
                    result1.push(value.title);
                }
            });
            fillSelectFromArray(document.getElementById('destination'), result1);
            $(".currency").html(selectedCurrency).removeClass('transparent');
            found = true;
            sourceType = 'reserve';
            break;
        }
    }
    //checking if input is an agent
    if (!found) {
        for (var j = 0; j < agents.length; j++) {
            if (agents[j].agentname === inputValue) {
                var result = [];
                $.each(userReserves, function (key, value) {
                    result.push(value.title);
                });
                fillSelectFromArray(document.getElementById('destination'), result);
                sourceType = 'agent';
                break;
            }
        }
    }
    $("#destination option").each(function () {
        if ($.inArray($(this).val(), agents.map(function (a) {
                return a.agentname;
            })) !== -1) {
            $(this).prop("class", "agent");
        } else {
            $(this).prop("class", "reserve");
        }
    });
}

function checkOutput(outputValue) {
    var found = false;
    //checking if output is a reserve
    for (var i = 0; i < userReserves.length; i++) {
        if (userReserves[i].title === outputValue) {
            found = true;
            destType = 'reserve';
            selectedCurrency = userReserves[i].currency;
            $(".currency").html(selectedCurrency).removeClass('transparent');
            break;
        }
    }
    //checking if output is an agent
    if (!found) {
        for (var j = 0; j < agents.length; j++) {
            if (agents[j].agentname === outputValue && agents[j].internal === false) {
                destType = 'agent';
                break;
            }
        }
    }
}
