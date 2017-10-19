var creditsTable = [], debetsTable = [];
$(document).ready(function () {
    getCredits(function (data) {
        console.log(data);
        $.each(data.credit, function (key, value) {
            creditsTable.push(value);
        });
        $.each(data.debet, function (key, value) {
            debetsTable.push(value);
        });
        buildCreditTable();
        buildDebtTable();
        if (creditsTable.length === 0 && debetsTable.length === 0) {
            $("#notification").html("Нет активных кредитов");
        }
    })
});

function buildCreditTable() {
    if (creditsTable.length !== 0) {
        $("#credit_table").html('<tr>\n' +
            '<th>Заемщик</th>' +
            '<th>Сумма долга</th>' +
            '</tr>');
        var operational_data = "", creditList = {}, currentUser = "", creditSum = 0;
        creditsTable.sort(function (a1, a2) {
            return a1.debet.localeCompare(a2.debet);
        });
        $.each(creditsTable, function (key, value) {
            if (value.debet === currentUser && currentUser !== "") {
                creditSum += value.debts;
            } else {
                creditSum = value.debts;
            }
            currentUser = value.debet;
            creditList[currentUser] = creditSum;
        });
        $.each(creditList, function (key, value) {
            operational_data += '<tr>';
            operational_data += '<td>' + key + '</td>';
            operational_data += '<td>' + value.toFixed(2) + '</td>';
            operational_data += '</tr>';
        });
        $("#credit_table").append(operational_data);
        $("#credit_header").show(100);
        $("#credit_table.preload").removeClass('preload');
    } else {
        $("#credit_header").hide();
    }
}

function buildDebtTable() {
    if (debetsTable.length !== 0) {
        $("#debit_table").html('<tr>\n' +
            '<th>Кредитор</th>' +
            '<th>Сумма долга</th>' +
            '</tr>');
        var operational_data = "", debitList = {}, currentUser = "", debitSum = 0;
        $.each(debetsTable, function (key, value) {
            if (value.credit === currentUser && currentUser !== "") {
                debitSum += value.debts;
            } else {
                debitSum = value.debts;
            }
            currentUser = value.credit;
            debitList[currentUser] = debitSum;
        });
        $.each(debitList, function (key, value) {
            operational_data += '<tr>';
            operational_data += '<td>' + key + '</td>';
            operational_data += '<td>' + value.toFixed(2) + '</td>';
            operational_data += '</tr>';
        });
        $("#debit_table").append(operational_data);
        $("#debit_header").show(100);
        $("#debit_table.preload").removeClass('preload');
    } else {
        $("#debit_header").hide();
    }
}