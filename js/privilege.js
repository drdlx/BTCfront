var username = localStorage.getItem('username'),
    token = localStorage.getItem('token'),
    priv = localStorage.getItem('permission');
var adminPages = ["registration"];

if ((token === 'null') || (username === 'null')) {
    window.location = 'index.html';
} else {
    if (priv !== 'admin') {
        for (var i = 0; i < adminPages.length; i++) {
            if (window.location.pathname.includes(adminPages[i])) {
                window.location = 'menu.html';
                break;
            }
        }
    }
}

function tokenTimedOut() {
    swal("Время сессии истекло", "Необходимо выполнить повторный вход в систему. Вы будете перенаправленны" +
        "в форму авторизации", "error").then(function () {
        logOutFromSystem();
    });
}

function logOutFromSystem() {
    localStorage.setItem('token', null);
    localStorage.setItem('username', null);
    localStorage.setItem('permission', null);
    sessionStorage.setItem('header_finres', null);
    sessionStorage.setItem('header_avg', null);
    sessionStorage.setItem('sidebarReserves', null);
    sessionStorage.setItem('sidebarCredits', null);
    sessionStorage.setItem('sidebarDebits', null);
    window.location = 'index.html';
}
