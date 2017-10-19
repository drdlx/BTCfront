$(document).ready(function () {
    if (localStorage.getItem('permission') === 'admin') {
        $("#add_form").hide();
        $("#add_button").click(function () {
            $("#add_form").toggle(500);
        });
        $("#add_bank").show();
        fillCurrencySelect();
        $("#add_form").on('submit', function (e) {
            e.preventDefault();
            var bankNameVal = $("#bank").val(),
                currencyVal = "";
            $.each($("#currency").val(), function (key, value) {
                currencyVal += value + ',';
            });
            currencyVal = currencyVal.substring(0, currencyVal.length - 1);
            $.ajax({
                url: apiServer + '/banks_add',
                type: 'post',
                headers: {'authorization': localStorage.getItem('token')},
                data: "bank=" + bankNameVal + "&currency=" + currencyVal,
                success: function (data) {
                    swal("Успех", "Банк " + $("#bank").val() + " добавлен", "success");
                    $("#error-msg").html("");
                    document.getElementById('add_form').reset();
                    buildTable();
                },
                error: function (err) {
                    $("#error-msg").html("Ошибка при добавлении банка");
                    document.getElementById('add_form').reset();
                }
            });
        });
    }
    buildTable();
});

function buildTable() {
    getBankList(function (data) {
        console.log(data);
        var banks = data;
        if (banks.length === 0) {
            $("#empty_notification").html("Нет созданных банков");
        } else {
            $("#empty_notification").html("");
            $("#handbook_table").html('<tr>\n' +
                '<th>Банк</th>\n' +
                '<th>Валюты</th>\n' +
                '</tr>');
            var operational_data = "";
            var idNum = 0;
            var xtraTools = "";
            $.each(banks, function (key, value) {
                operational_data += '<tr id="tr' + idNum + "\">";
                operational_data += '<td id="td' + idNum + "\">" + transformValue(value.bank) + '</td>';

                if (priv === 'admin') {
                    xtraTools = '<a class="delete_button" onclick="removeEntry(' + idNum + ")\"" + '">' +
                        '<i class="fa fa-times" aria-hidden="true"></i></a>';
                }

                operational_data += '<td>' + transformValue(value.currency) + xtraTools + '</td>';
                operational_data += '</tr>';

                idNum++;
            });
            $("#handbook_table").append(operational_data);
            $(".preload").removeClass('preload');
        }
    });
}

function fillCurrencySelect() {
    getCurrencyList(function (data) {
        $.each(data, function (key, value) {
            var opt_data = "<option value=\"";
            opt_data  += value.currency + "\" >";
            opt_data += value.currency;
            opt_data += "</option>";
            $("#currency").append(opt_data);
        });
        $("#currency").multiselect({
            nonSelectedText: 'Выберите валюты'
        });
    });
}

function transformValue(value) {
    return ((value != null) && (value !="")) ? value : '-';
}

function removeEntry(id) {
    console.log("clicked on row #" + id);
    swal({
        title: "Удаление",
        text: "Вы действительно хотите удалить запись " + document.getElementById("td" + id).innerHTML + "?",
        icon: "warning",
        buttons: true,
        dangerMode: true
    })
        .then(function (isPressed) {
            if (isPressed) {
                $.ajax({
                    url: apiServer + '/banks_del',
                    type: 'post',
                    headers: {'authorization': token},
                    data: "&bank=" + document.getElementById("td" + id).innerHTML,
                    success: function (data) {
                        swal("Запись успешно удалена", {icon: "success"});
                        $("#tr" + id).toggle(400);
                    },
                    error: function (err) {
                        swal("Ошибка при удалении записи", {icon: "warning"});
                    }
                });
            }
        });
}