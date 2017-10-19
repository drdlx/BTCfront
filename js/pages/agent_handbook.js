var mentorList = [], studentList = [];
var currencyOption = {};
getCurrencyList(function (data) {
    $.each(data, function (key, value) {
        currencyOption[value.currency] = value.currency;
    })
});

$(document).ready(function () {
    getMentorList(function (data) {
        mentorList = data.mentors;
        studentList = data.students;
    });
    if (localStorage.getItem('permission') === 'admin') {
        $("#add_form").hide();
        $("#add_button").click(function () {
            $("#add_form").toggle(500);
        });
        $("#add_agent").show();
        $("#add_form").on('submit', function (e) {
            e.preventDefault();
            $.ajax({
                url: apiServer + '/anti_agent_add',
                type: 'post',
                headers: {'authorization': localStorage.getItem('token')},
                data: $("#add_form").serialize() + "&internal=false",
                success: function (data) {
                    console.log($("#add_form").serialize());
                    swal("Успех", "Контрагент " + $("#agentname").val() + " добавлен", "success");
                    $("#error-msg").html("");
                    document.getElementById('add_form').reset();
                    buildTable();
                },
                error: function (err) {
                    $("#error-msg").html("Ошибка при добавлении агента");
                    swal("Ошибка при добавлении", "", "error");
                    document.getElementById('add_form').reset();
                }
            });
        });
    }
    buildTable();
});

function buildTable() {
    getAntiagentList(function (data) {
        console.log(data);
        var agents = data;
        if (agents.length === 0) {
            $("#empty_notification").html("Нет добавленных агентов");
        } else {
            $("#empty_notification").html("");
            $("#handbook_table").html('<tr>\n' +
                '<th>Отображаемое имя</th>\n' +
                '<th>Пользователь</th>\n' +
                '<th>Имя</th>\n' +
                '<th>Фамилия</th>\n' +
                '<th>Телефон</th>\n' +
                '<th>E-mail</th>\n' +
                '</tr>');
            var idNum = 0;
            var removeButton = "", addStudentButton = "";
            var operational_data = "";
            $.each(agents, function (key, value) {
                var isMentor = mentorList.find(function (a) {
                        return a.mentor === value.agentname
                    }) !== undefined,
                    isStudent = studentList.find(function (a) {
                        return a.student === value.agentname
                    }) !== undefined,
                    className = "";
                if (isMentor) {
                    className = "mentor"
                } else if (isStudent) {
                    className = "student"
                }
                operational_data += '<tr id="tr' + idNum + "\" class='" + className + "'>";
                operational_data += '<td id="td' + idNum + "\">" + value.agentname + '</td>';

                var internalStr = ((value.internal === true) ? 'Да' : 'Нет');
                operational_data += '<td>' + internalStr + '</td>';
                operational_data += '<td>' + transformValue(value.First_Name) + '</td>';
                operational_data += '<td>' + transformValue(value.Last_Name) + '</td>';
                operational_data += '<td>' + transformValue(value.call) + '</td>';

                if (priv === 'admin' && value.internal === false) {
                    removeButton = ' <a class="delete_button" onclick="removeEntry(' + idNum + ")\"" + '">' +
                        '<i class="fa fa-times" aria-hidden="true"></i></a>';
                } else {
                    removeButton = "";
                }

                if (value.internal === true && value.agentname !== username && !isMentor && !isStudent) {
                    addStudentButton = ' <a class="mentor" onclick="invite(' + "'" + value.agentname + "'" + ")\"" + '">' +
                        '<i class="fa fa-graduation-cap" aria-hidden="true"></i></a>';
                } else {
                    addStudentButton = "";
                }

                operational_data += '<td>' + transformValue(value.mail) + addStudentButton + removeButton + '</td>';
                operational_data += '</tr>';

                idNum++;
            });
            $("#handbook_table").append(operational_data);
            $(".preload").removeClass('preload');
        }
    });
}

function transformValue(value) {
    return ((value != null) && (value != "")) ? value : '-';
}

function removeEntry(id) {
    swal({
        title: "Удаление",
        text: "Вы действительно хотите удалить запись " + document.getElementById("td" + id).innerHTML + "?",
        type: "warning",
        showCancelButton: true,
        focusConfirm: false
    })
        .then(function (isPressed) {
            if (isPressed) {
                $.ajax({
                    url: apiServer + '/anti_agent_del',
                    type: 'post',
                    headers: {'authorization': token},
                    data: "&agentname=" + document.getElementById("td" + id).innerHTML,
                    success: function (data) {
                        swal("Запись успешно удалена", {type: "success"});
                        $("#tr" + id).toggle(400);
                    },
                    error: function (err) {
                        swal("Ошибка при удалении записи", {type: "warning"});
                    }
                });
            }
        });
}

function invite(student) {
    var options = "";
    $.each(currencyOption, function (key, value) {
        options += '<option>' + value + '</option>';
    });
    swal({
        title: "Приглашение",
        type: "question",
        html: "<p class='swal2'>Пригласить " + student + " стать вашим студентом?\n Укажите условия обучения</p>" +
        '<label for="percent_input">Процент от финреза:</label><input id="percent_input" type="number" min="0" max="100" step="0.01" maxlength="3" class="swal2-input" required placeholder="0">' +
        '<select class="swal2-input" id="currency_input" required><option disabled selected value="" hidden>Выберите валюту</option>' + options + '</select>',
        preConfirm: function () {
            return new Promise(function (resolve, reject) {
                var percent = $("#percent_input").val(), currency = $("#currency_input").val();
                if ($.isNumeric(percent) && currency !== null && percent < 100 && percent >= 0) {
                    resolve([percent, currency]);
                } else {
                    reject('Задайте корректные данные');
                }
            });
        },
        showCancelButton: true,
        focusConfirm: false
    })
        .then(function (parsed) {
            if (parsed) {
                $.ajax({
                    url: apiServer + '/addMentor',
                    type: 'post',
                    headers: {'authorization': token},
                    data: "&student=" + student + "&percent=" + parsed[0] + "&currency=" + parsed[1],
                    success: function (data) {
                        swal("Пользователь приглашен", "", "success");
                    },
                    error: function (err) {
                        swal("Ошибка при приглашении", "", "warning");
                    }
                });
            } else {
                return null;
            }
        });
}