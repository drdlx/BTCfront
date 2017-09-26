var username = sessionStorage.getItem('username'),
    token = sessionStorage.getItem('token'),
    priv = sessionStorage.getItem('permission');
var adminPages = ["registration"];

if ((token === 'null' || token === null) && (username === 'null' || username === null)) {
    window.location = 'index.html';
} else if (priv !== 'admin') {
    for (var i = 0; i < adminPages.length; i++) {
        if (window.location.pathname.includes(adminPages[i])) {
            window.location = 'menu.html';
            break;
        }
    }
}
