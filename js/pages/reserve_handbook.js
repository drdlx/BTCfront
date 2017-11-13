getCurrencyList(function (data) {
    currenciesHB = data;
});

$(document).ready(function () {
    document.getElementById('numberCard').addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
    });
    document.getElementById('validity').addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/[^\dA-Z]/g, '').replace(/([0-9]{2})/, '$1\/').trim();
    });
    $("#add_form").hide();
    $("#add_button").click(function () {
        $("#add_form").toggle(500);
    });
    $("#add_reserve").show();
    fillBanksSelect();
    fillOwnerSelect();
    fillResponsibleSelect();
    $("#add_form").on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: apiServer + '/reserves_add',
            type: 'post',
            headers: {'authorization': localStorage.getItem('token')},
            data: $("#add_form").serialize(),
            success: function (data) {
                swal("Успех", "Резерв " + $("#title").val() + " добавлен", "success");
                $("#error-msg").html("");
                document.getElementById('add_form').reset();
                buildTable();
                reBuildSidebarContent();
            },
            error: function (err) {
                $("#error-msg").html("Ошибка при добавлении резерва");
                document.getElementById('add_form').reset();
            }
        });
    });
});

buildTable();

var users = {}, reservesID = {}, selected = [], currenciesHB = [];

function buildTable() {
    getReserveList(function (data) {
        var reserves = data;
        if (reserves.length === 0) {
            $("#empty_notification").html("Нет доступных резервов");
        } else {
            $("#empty_notification").html("");
            $("#handbook_table").html('<tr>\n' +
                '<th>Отображаемое имя</th>\n' +
                '<th>Банк</th>' +
                '<th>Валюта</th>' +
                '<th>Владелец</th>' +
                '<th>Ответственный</th>' +
                '<th>Держатель</th>' +
                '<th>Номер</th>' +
                '<th>Срок действия</th>' +
                '<th>Оплачиваемая</th>' +
                '</tr>');
            var idNum = 0, xtraTools = "", operational_data = "", xtraClass = "";
            $.each(reserves, function (key, value) {
                if (value.owner === username || value.responsible === username) {
                    reservesID[idNum] = value;
                    xtraClass = (value.responsible === username) ? "class=\"owner\" " : "";
                    operational_data += '<tr ' + xtraClass + 'id="tr' + idNum + '\">';
                    operational_data += '<td id="td' + idNum + '\">' + '<div class="absolute_checkbox">'
                        + '<input type="checkbox" onchange="toggleSelection(' + idNum+ ')"></div> '
                        + transformValue(value.title) + '</td>';
                    operational_data += '<td>' + transformValue(value.bank) + '</td>';
                    operational_data += '<td>' + transformValue(value.currency) + '</td>';
                    operational_data += '<td>' + transformValue(value.owner) + '</td>';
                    operational_data += '<td>' + transformValue(value.responsible) + '</td>';
                    operational_data += '<td>' + transformValue(value.legalOwner) + '</td>';
                    operational_data += '<td>' + transformValue(value.numberCard) + '</td>';
                    operational_data += '<td>' + transformValue(value.validity) + '</td>';
                    if (value.owner === username) {
                        xtraTools = '<div class="button_block"><a onclick="removeEntry(' + idNum + ")\"" + '">' +
                            '<i class="fa fa-times red" aria-hidden="true"></i></a></div>';
                    } else {
                        xtraTools = "";
                    }
                    operational_data += '<td>' + ((value.chargeable === true) ? "Да" : "Нет") + xtraTools + '</td>';
                    operational_data += '</tr>';

                    idNum++;
                }
            });
            $("#handbook_table").append(operational_data);
            $(".preload").removeClass('preload');
        }
    });
}

function fillBanksSelect() {
    getBankList(function (data) {
        var select = document.getElementById('bank');
        for (var j = select.options.length; j >= 0; j--) {
            if (j !== select.selectedIndex) {
                select.remove(j);
            } else {
                select.options[j].text = ".....";
            }
        }
        for (var i = 0; i < data.length; i++) {
            var opt = document.createElement("option");
            opt.innerHTML = data[i].bank;
            select.appendChild(opt);
        }
    });
}

function fillOwnerSelect() {
    var select = document.getElementById('owner');
    for (var j = select.options.length; j >= 0; j--) {
        if (j !== select.selectedIndex) {
            select.remove(j);
        } else {
            select.options[j].text = ".....";
        }
    }
    getAntiagentList(function (data) {
        for (var i = 0; i < data.length; i++) {
            if (priv === 'admin') {
                var opt = document.createElement("option");
                opt.innerHTML = data[i].agentname;
                select.appendChild(opt);
            }
            if (data[i].internal) {
                users[data[i].agentname] = data[i].agentname;
            }
        }
        if (priv !== 'admin') {
            var opt = document.createElement("option");
            opt.innerHTML = username;
            select.appendChild(opt);
        }
    });
}

function fillResponsibleSelect() {
    var select = document.getElementById('responsible');
    for (var j = select.options.length; j >= 0; j--) {
        if (j !== select.selectedIndex) {
            select.remove(j);
        } else {
            select.options[j].text = ".....";
        }
    }
    if (priv === 'admin') {
        getAntiagentList(function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].internal === true) {
                    var opt = document.createElement("option");
                    opt.innerHTML = data[i].agentname;
                    select.appendChild(opt);
                }
            }
        });
    } else {
        var opt = document.createElement("option");
        opt.innerHTML = username;
        select.appendChild(opt);
    }
}

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
        selectCurrency();
    });
}

function selectCurrency() {
    $("#average_course").val(0);

    var currencyStr = $("#currency").val(),
    currency = currenciesHB.find(function (a) {
        return a.currency === currencyStr;
    });

    if (currency.isCrypto) {
        $("#average_course_block").show(100);
    } else {
        $("#average_course_block").hide(100);
    }
}

function transformValue(value) {
    return ((value != null) && ($.trim(value).length > 0) ? value : '-');
}

function removeEntry(id) {
    swal({
        title: "Удаление",
        text: "Вы действительно хотите удалить запись " + reservesID[id].title + "?",
        type: "warning",
        showCancelButton: true,
        focusCancel: true
    })
        .then(function (isPressed) {
            if (isPressed) {
                $.ajax({
                    url: apiServer + '/reserves_del',
                    type: 'post',
                    headers: {'authorization': token},
                    data: "&title=" + reservesID[id].title,
                    success: function (data) {
                        swal("Запись успешно удалена", "", "success");
                        $("#tr" + id).toggle(400);
                        delete reservesID[id];
                        reBuildSidebarContent();
                    },
                    error: function (err) {
                        swal("Ошибка при удалении записи", "", "warning");
                    }
                });
            }
        });
}

function sendResponsibleSwitch() {
    var dataToSend = [];
    for (var i = 0; i < selected.length; i++) {
        dataToSend.push(reservesID[selected[i]]._id);
    }
    swal({
        title: "Смена ответственного",
        text: "Выберите пользователя, которому желаете передать свои резервы под ответственность",
        input: "select",
        inputOptions: users,
        inputPlaceholder: "Ответственный...",
        showCancelButton: true,
        focusCancel: true
    }).then(function (responsible) {
        if (responsible) {
            $.ajax({
                url: apiServer + '/passReserves',
                type: 'post',
                headers: {'authorization' : token},
                data: {
                    data: dataToSend,
                    responsible: responsible
                },
                success: function (data) {
                    swal("Запрос на передачу резервов был отправлен", "", "success");
                    toggleResponsibilityBlock();
                },
                error: function () {
                    swal("Ошибка при отправке запроса", "", "warning");
                }
            });
        }
    });
}

function toggleResponsibilityBlock() {
    $('input:checkbox').prop("checked", false);
    selected = [];
    $(".absolute_checkbox").toggleClass("active");
    $("#changeResponsibleActivate").toggleClass("active").toggle("disabled");
    $("#changeResponsibleButtons").toggleClass("active");
    $("#responsibleMsg").toggle(200);
}

function toggleSelection(id) {
    if (selected.indexOf(id) !== -1) {
        selected.splice(selected.indexOf(id), 1);
    } else {
        selected.push(id);
    }
}
