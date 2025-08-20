var screenHeight = $(window).height();
var seventyPercentHeight = 0.75 * screenHeight;
$('#unpaidLeaveReportTable .table-responsive').css('max-height', seventyPercentHeight + 'px');
$('.card').css('min-height', (seventyPercentHeight+120) + 'px');

document.addEventListener("DOMContentLoaded", function() {
    var currentDate = new Date().toISOString().slice(0, 7);
    if(currentDate){
        document.getElementById("filterMonth").value = currentDate;
        document.getElementById("filterMonth").setAttribute("max", currentDate);
    }else{
        document.getElementById("filterMonth").setAttribute("max", '');
    }
});

$(document).on('change', '#filterMonth', function(){
    $('#unpaidLeaveReportTable').append(loading());
    var selectedMonth = $("#filterMonth").val();
    $.ajax({
        url: APP_URL + '/report/unpaid-leave/fetch',
        type: "GET",
        data: { selectedMonth: selectedMonth },
        success: function (res) {
            $('#unpaidLeaveReportTable').find('.loading-wrapper').remove();
            $('#unpaidLeaveReportTable .table-responsive').html(res.data);
        },
        error: function (xhr, status, error) {
            console.log(error);
        },
    });
});