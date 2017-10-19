$(document).ready(function () {
    localStorage.setItem('token', null);
    localStorage.setItem('username', null);
    localStorage.setItem('permission', null);
    sessionStorage.setItem('header_finres', 0);
    sessionStorage.setItem('header_avg', 0);
    sessionStorage.setItem('sidebarReserves', 0);
    sessionStorage.setItem('sidebarCredits', 0);
    sessionStorage.setItem('sidebarDebits', 0);
});
$("#submit").click(function () {
    $("#submit").hide();
    $("#loading_bar").html("<img src='../img/ajax-load.gif' width='10%'>");

    $("#loginform").on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url : apiServer + '/auth',
            type : 'post',
            crossDomain : true,
            data : $("#loginform").serialize(),
            success : function (data) {
                if (Object.keys(data).length >= 2) {
                    localStorage.setItem('username', $("#login").val());
                    localStorage.setItem('token', data.token.replace(/"/g, ""));
                    localStorage.setItem('permission', data.privilege);
                    window.location = "menu.html"
                } else {
                    $("#loading_bar").text("Something went wrong, contact the administrator");
                    $("#submit").show();
                    document.getElementById('loginform').reset();
                }
            },
            error: function () {
                $("#loading_bar").text("Wrong login/password, try again");
                $("#submit").show();
            }
        });
    });
});