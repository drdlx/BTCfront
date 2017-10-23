$(document).ready(function () {
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

var users = {}, reservesID = {};

function buildTable() {
    getReserveList(function (data) {
        var reserves = data;
        if (reserves.length === 0) {
            $("#empty_notification").html("Нет доступных резервов");
        } else {
            $("#empty_notification").html("");
            $("#handbook_table").html('<tr>\n' +
                '<th>Отображаемое имя</th>\n' +
                '<th>Банк</th>\n' +
                '<th>Валюта</th>\n' +
                '<th>Владелец</th>\n' +
                '<th>Ответственный</th>\n' +
                '</tr>');
            var idNum = 0, xtraTools = "", operational_data = "", xtraClass = "";
            $.each(reserves, function (key, value) {
                if (value.owner === username || value.responsible === username) {
                    reservesID[idNum] = value;
                    xtraClass = (value.owner === username) ? "class=\"owner\" " : "";
                    operational_data += '<tr ' + xtraClass + 'id="tr' + idNum + '\">';
                    operational_data += '<td id="td' + idNum + '\">' + transformValue(value.title) + '</td>';
                    operational_data += '<td>' + transformValue(value.bank) + '</td>';
                    operational_data += '<td>' + transformValue(value.currency) + '</td>';
                    operational_data += '<td>' + transformValue(value.owner) + '</td>';

                    if (value.owner === username) {
                        xtraTools = '<div class="button_block"><a onclick="updateEntry(' + idNum + ")" + '">' +
                            '<i class="fa fa-retweet darkaccent" aria-hidden="true"></i></a><a onclick="removeEntry(' + idNum + ")\"" + '">' +
                            '<i class="fa fa-times red" aria-hidden="true"></i></a></div>';
                    } else {
                        xtraTools = "";
                    }

                    operational_data += '<td>' + transformValue(value.responsible) + xtraTools + '</td>';
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

function transformValue(value) {
    return ((value != null) && ($.trim(value).length > 0) ? value : '-');
}

function removeEntry(id) {
    swal({
        title: "Удаление",
        text: "Вы действительно хотите удалить запись " + document.getElementById("td" + id).innerHTML + "?",
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

function updateEntry(id) {
    swal({
        title: "Смена ответственного",
        text: "Выберите пользователя, которому желаете передать свой резерв под ответственность",
        input: "select",
        inputOptions: users,
        inputPlaceholder: "Ответственный...",
        showCancelButton: true,
        focusCancel: true
    })
        .then(function (isPressed) {
            if (isPressed) {
                $.ajax({
                    url: apiServer + '/reserves_up',
                    type: 'post',
                    headers: {'authorization': token},
                    data: "&title=" + reservesID[id].title + "&id=" + reservesID[id]._id + "&bank=" + reservesID[id].bank +
                    "&currency=" + reservesID[id].currency + "&owner=" + reservesID[id].owner + "&responsible=" + isPressed,
                    success: function (data) {
                        swal("Запись успешно обновлена", "", "success");
                        reBuildSidebarContent();
                    },
                    error: function (err) {
                        swal("Ошибка при обновлении записи", "", "warning");
                    }
                });
            }
        });
}
