$.ajax({
    url: apiServer + "/journal",
    type:'get',
    headers: {'authorization': token},
    success: function (data) {
        console.log(data);
        console.log(data[0])
    }
});