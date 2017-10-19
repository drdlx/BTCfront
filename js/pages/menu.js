$(document).ready(function (e) {
    getUnacceptedTransferData(function (data) {
        if (data.data.length > 0) {
            $("#quick_transfer_button").prop("class", "unaccepted quick_access");
            $("#quick_transfer_button").html(data.data.length);
        }
    });
    if (localStorage.getItem('permission') === 'admin') {
        var list = document.getElementsByClassName('hidden');
        while (list.length > 0) {
            list[0].classList.remove('hidden');
        }
    }
})