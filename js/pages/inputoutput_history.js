var agents = null, reserves = null, unacceptedList = [], acceptedList = [];
$(document).ready(function () {
    var q1 = getAntiagentList(function (data) {
        agents = data;
    });
    var q2 = getReserveList(function (data) {
        reserves = data;
    });
    var q3 = getUnacceptedTransferData(function (data) {
        unacceptedList = data;
    });
    var q4 = getFullTransferData(function (data) {
        acceptedList = data;
    });
    $.when(q1, q2, q3, q4).done(function () {
        fillTable(unacceptedList, "#unaccepted_table");
        fillTable(acceptedList, "#report_table");
        console.log(acceptedList);
        $("#loading").prop('class', 'hidden');
    });
});

function getParticipantData(input, callback) {
    var agent = null, reserve = null;
    var found = false;
    //check if input is an agent
    $.each(agents, function (key, value) {
        if (input === value.agentname) {
            agent = input;
            found = true;
        }
    });
    if (!found) {
        $.each(reserves, function (key, value) {
            if (input === value.title) {
                reserve = input;
                agent = value.owner;
                found = true;
            }
        });
    }

    var result = {
        reserve: reserve,
        agent: agent
    };
    callback(result);
}

var unacceptedID = {}, acceptedID = {};

function fillTable(data, targetID) {
    if (data.data.length > 0) {
        var operation_data = '';
        var rowNumber = 0;
        $.each(data.data, function (key, value) {
            rowNumber++;
            var source = {};
            getParticipantData(value.source, function (data) {
                var xtraData = "";
                source = data;
                operation_data += '<tr id="' + targetID.substring(1, targetID.length) + "_tr" + rowNumber + '\">';
                operation_data += '<td><div class="transfer_participant">' +
                    '<span class="transfer_data"><i class="fa fa-male" aria-hidden="true"></i>' + source.agent + '</span>';
                if (source.reserve !== null) {
                    operation_data += '<span class="transfer_data"><i class="fa fa-credit-card" aria-hidden="true"></i>' + source.reserve + '</span>';
                }
                operation_data += '</div></td>';
                var destination = {};
                getParticipantData(value.destination, function (data) {
                    destination = data;
                    //======forming comission string and getting a currency========
                    var commiss = value.commiss;
                    var comStr = (commiss > 0) ? " (+" + commiss + ")" : "";
                    var curStr = "", creditStr = (value.percent > 0) ? "<span class='red'> " + value.percent + "%</span>" : "";
                    //====trying to get currency from source
                    if (source.reserve !== null) {
                        for (var j = 0; j < reserves.length; j++) {
                            if (reserves[j].title === source.reserve) {
                                curStr = reserves[j].currency;
                                break;
                            }
                        }
                    }
                    //====if we have failed, then we are got to get currency from destination
                    if (curStr === "" && destination.reserve !== null) {
                        for (var n = 0; n < reserves.length; n++) {
                            if (reserves[n].title === destination.reserve) {
                                curStr = reserves[n].currency;
                                break;
                            }
                        }
                    }
                    operation_data += '<td class="transfer_arrow">' +
                        '<div class="description">' + value.description + '</div>' +
                        '<img src="../img/arrow.png" width="50px">' + value.transaction + '<span class="red">' + comStr + "</span> " + curStr + creditStr
                    '</td>';

                    operation_data += '<td><div class="transfer_participant">' +
                        '<span class="transfer_data"><i class="fa fa-male" aria-hidden="true"></i>' + destination.agent + '</span>';
                    if (destination.reserve !== null) {
                        operation_data += '<span class="transfer_data"><i class="fa fa-credit-card" aria-hidden="true"></i>' + destination.reserve + '</span>';
                    }
                    operation_data += '</div></td>';

                    if (targetID === '#unaccepted_table') {
                        xtraData = '<div class="table_row_overlay col-md-7"><button class="accept col-md-6" onclick="acceptEntry(' + rowNumber + ", \'" + source.reserve + "\')\">" +
                            '<i class="fa fa-chevron-down" aria-hidden="true">Подтвердить</i></button>';
                        xtraData += '<button class="decline col-md-6" onclick="declineEntry(' + rowNumber + ")\"" + '>' +
                            '<i class="fa fa-times" aria-hidden="true">Отклонить</i></button></div>';
                        unacceptedID["" + rowNumber] = value._id;
                    }
                    if (targetID === '#report_table') {
                        acceptedID["" + rowNumber] = value._id;
                    }

                    operation_data += '<td>' + value.date.substring(0, value.date.indexOf('T')) + xtraData + '</td>';
                    operation_data += '</tr>';
                });
            });
        });
        $(targetID + " tr th").removeClass("hidden");
        $(targetID).append(operation_data);
    } else if (targetID === '#report_table') {
        $("#message").html("Завершенных операций пока нет");
    }
}

function acceptEntry(id, sourceReserve) {
    var currency = "", userReservesOptions = {};
    for (var j = 0; j < reserves.length; j++) {
        if (reserves[j].title === sourceReserve) {
            currency = reserves[j].currency;
            break;
        }
    }
    for (var i = 0; i < reserves.length; i++) {
        if (reserves[i].currency === currency && reserves[i].owner === username) {
            userReservesOptions[reserves[i].title] = reserves[i].title;
        }
    }
    swal({
        title: 'Подтверждение операции',
        text: "Выберите целевой резерв",
        input: 'select',
        inputOptions: userReservesOptions,
        inputPlaceholder: 'Выберите резерв',
        showCancelButton: true,
        inputValidator: function (value) {
            return new Promise(function (resolve, reject) {
                if (value !== '') {
                    resolve()
                } else {
                    reject('Выберите любой резерв')
                }
            })
        }
    }).then(function (isPressed) {
        if (isPressed) {
            $.ajax({
                url: apiServer + '/confirmation',
                type: 'post',
                headers: {'authorization': token},
                data: "&id=" + unacceptedID[id] + "&fulfilled=true&destination=" + isPressed,
                success: function (data) {
                    swal("Успех", "Перевод был подтвержден", "success");
                    $("#unaccepted_table_tr" + id).detach().appendTo($("#report_table"));
                    delete unacceptedID[id];
                    $("#report_table").show(200);
                    if (Object.keys(unacceptedID).length === 0) {
                        $("#unaccepted_table").hide(200);
                        $("#message").html("");
                    }
                    reBuildSidebarContent();
                    reBuildHeaderInfo();
                },
                error: function (err) {
                    swal("Упс", "Ошибка при подтверждении перевода", "error");
                }
            });
        }
    });
}

function declineEntry(id) {
    swal({
        title: 'Подтверждение операции',
        text: "Вы действительно хотите отклонить этот перевод?",
        type: "question",
        showCancelButton: true
    }).then(function (pressed) {
        if (pressed) {
            $.ajax({
                url: apiServer + '/confirmation',
                type: 'post',
                headers: {'authorization': token},
                data: "&id=" + unacceptedID[id] + "&fulfilled=false",
                success: function () {
                    swal("Успех", "Перевод был отклонен", "success");
                    $("#unaccepted_table_tr" + id).hide();
                    delete unacceptedID[id];
                    if (Object.keys(unacceptedID).length === 0) {
                        $("#unaccepted_table").hide(200);
                        $("#message").html("");
                    }
                    reBuildSidebarContent();
                },
                error: function (err) {
                    swal("Упс", "Ошибка при отмене перевода", "error");
                }
            });
        }
    });
}