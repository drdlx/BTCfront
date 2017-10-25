$(document).ready(function () {
    if (localStorage.getItem('permission') === 'admin') {
        $("#add_form").hide();
        $("#add_button").click(function () {
            $("#add_form").toggle(500);
        });
        $("#add_currency").show();
        $("#add_form").on('submit', function (e) {
            e.preventDefault();
            var currencyVal = $("#currency").val().toUpperCase(),
                isCryptoVal = ($("#isCrypto").is(':checked'));
            $.ajax({
                url: apiServer + '/currency_add',
                type: 'post',
                headers: {'authorization': localStorage.getItem('token')},
                data: "currency=" + currencyVal + "&isCrypto=" + isCryptoVal,
                success: function (data) {
                    swal("Успех", "Валюта " + $("#currency").val() + " добавлена", "success");
                    $("#error-msg").html("");
                    document.getElementById('add_form').reset();
                    buildTable();
                },
                error: function (err) {
                    $("#error-msg").html("Ошибка при добавлении валюты");
                    document.getElementById('add_form').reset();
                }
            });
        });
    }
    buildTable();
});

function buildTable() {
    getCurrencyList(function (data) {
        console.log(data);
        var currencies = data;
        if (currencies.length === 0) {
            $("#empty_notification").html("Нет созданных валют");
        } else {
            $("#empty_notification").html("");

            $("#handbook_table").html('<tr>\n' +
                '<th>Валюта</th>\n' +
                '<th>Крипто</th>\n' +
                '</tr>');
            var operational_data = "";
            var idNum = 0;
            var xtraTools = "";
            $.each(currencies, function (key, value) {
                operational_data += '<tr id="tr' + idNum + "\">";
                operational_data += '<td id="td' + idNum + "\">" + value.currency + '</td>';

                xtraTools = '<div class="button_block">';
                if (priv === 'admin') {
                    xtraTools += '<a class="delete_button" onclick="removeEntry(' + idNum + ")\"" + '">' +
                        '<i class="fa fa-times" aria-hidden="true"></i></a>';
                }
                xtraTools += '</div>';

                var transformedBool = (value.isCrypto === true) ? "Да" : "Нет";
                operational_data += '<td>' + transformedBool + xtraTools + '</td>';
                operational_data += '</tr>';

                idNum += 1;
            });
            $("#handbook_table").append(operational_data);
            $(".preload").removeClass('preload');
        }
    });
}

function removeEntry(id) {
    console.log("clicked on row #" + id);
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
                    url: apiServer + '/currency_del',
                    type: 'post',
                    headers: {'authorization': token},
                    data: "&currency=" + document.getElementById("td" + id).innerHTML,
                    success: function (data) {
                        swal("Запись успешно удалена", "", "success");
                        $("#tr" + id).toggle(400);
                    },
                    error: function (err) {
                        swal("Ошибка при удалении записи", "", "warning");
                    }
                });
            }
        });
}