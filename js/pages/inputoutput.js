var currencies, userReserves = [], sourceList = [], agents = [], selectedCurrency,
    sourceType = "", destType = "";
$(document).ready(function () {
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
    $.when(r1, r2, r3).done(function () {
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

function fillOutputSelect(inputValue) {
    var found = false;
    //checking if an input is a reserve
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
            found = true;
            sourceType = 'reserve';
            break;
        }
    }
    //checking if an input is an agent
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
    //checking if an output is a reserve
    for (var i = 0; i < userReserves.length; i++) {
        if (userReserves[i].title === outputValue) {
            found = true;
            destType = 'reserve';
            selectedCurrency = userReserves[i].currency;
            break;
        }
    }
    //checking if an input is an agent
    if (!found) {
        for (var j = 0; j < agents.length; j++) {
            if (agents[j].agentname === outputValue && agents[j].internal === false) {
                destType = 'agent';
                break;
            }
        }
    }
}