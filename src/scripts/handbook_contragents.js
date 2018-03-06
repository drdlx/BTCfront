$(function () {
  var env = new nunjucks.Environment(new nunjucks.WebLoader('../partials'));
  $.ajax({
      url: '/mockapi/structure.json',
      //type: "POST",
      contentType: "application/json; charset=utf-8",
      success: function (response) {
        var $tableBody = $('.contragents__table-body');
        var template = env.getTemplate('/handbook/contragents-partials.html');

        //response.contragents.for (item in data.contragents) {
        response.contragents.forEach(function(contragent) {
          $tableBody.append(
            nunjucks.render( template, {
              login: contragent.login,
              status: contragent.status,
              firstName: contragent.firstName,
              lastName: contragent.lastName,
              phone: contragent.phone,
              email: contragent.email
            })
          );
        });
      }
  });
});
