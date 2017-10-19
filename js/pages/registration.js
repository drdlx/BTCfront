$(document).ready(function () {
    //Submit handler
    $("#post_form").on('submit', function (e) {
        e.preventDefault();
        var password = $("#password").val(),
            rePassword = $("#password-repeat").val();
        //rePassword check
        if (password !== rePassword) {
            document.getElementById('error-msg').innerHTML = 'Пароли не совпадают';
        } else {
            //Creating both user and agent
            $.ajax({
                url: apiServer + '/createNewUser',
                type: 'post',
                headers: {'authorization': localStorage.getItem('token')},
                data: $("#post_form").serialize(),
                statusCode: {
                    409: function () {
                        document.getElementById('error-msg').innerHTML = 'Пользователь уже существует';
                    }
                },
                success: function (data) {
                    swal("Успех", 'Пользователь ' + $("#login").val() + ' был создан');
                    document.getElementById('error-msg').innerHTML = '';
                    document.getElementById('post_form').reset();
                },
                //unexpected error handler
                error: function () {
                    document.getElementById('error-msg').innerHTML = 'Что-то пошло не так в ходе добавления нового пользователя';
                    document.getElementById('post_form').reset();
                }
            });
        }
    });
});