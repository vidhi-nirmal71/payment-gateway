var filterText = '';
var dateFilter = {};
filterLabelChange();
getEmployeeTableData();

// Duration filter dropdown change
$('#durationFilter li').on('click', function(){
    let selector = $(this).children();
    filterText = selector.attr('data-id');
    $('.dropdown-item').removeClass('active');
    selector.addClass('active');
    filterLabelChange();
    
    if(filterText != 'date'){
        hideFilterDatesBlock();
        getEmployeeTableData();
    }else if(filterText == 'date'){
        showFilterDatesBlock();
    }
});

function filterLabelChange(){
    let filterSelector = $('.dropdown-menu .dropdown-item.active');
    filterText = $(filterSelector).attr('data-id');
    let activeText = $(filterSelector).text().trim();
    $('#filter-text').text(activeText);
}

function hideFilterDatesBlock(){
    $('#startDateBlock').hide();
    $('#endDateBlock').hide();
    $('#filterBlock').hide();
}

function showFilterDatesBlock(){
    $('#startDateBlock').show();
    $('#endDateBlock').show();
    $('#filterBlock').show();
}

// Set min date for filter end date
$(document).on('change', '#filterStartDate', function () {
    let startDate = $('#filterStartDate').val();
    $('#filterEndtDate').attr('min', startDate || '');
});

// Set max date for filter start date
$(document).on('change', '#filterEndtDate', function () {
    let endDate = $('#filterEndtDate').val();
    $('#filterStartDate').attr('max', endDate || '');
});

// Enable disable Timesheet filter button
$('.date-input').on('change', function(e){
    if( $('#filterStartDate').val() && $('#filterEndtDate').val()){
        enableSubmitBtn('#filterSearch');
    }else{
        $('#filterSearch').attr('disabled', true);
    }
});

$('#filterSearch').on('click', function(){
    disableSubmitBtn('#filterSearch');
    dateFilter['startDate'] = $('#filterStartDate').val();
    dateFilter['endDate'] = $('#filterEndtDate').val();
    getEmployeeTableData();
});


var screenHeight = $(window).height();
var seventyPercentHeight = 0.75 * screenHeight;
$('#userReportTable .table-responsive').css('max-height', seventyPercentHeight + 'px');
$('.card').css('min-height', (seventyPercentHeight+120) + 'px');

$('#resetBtn').click(function(){
    let selector = $('#durationFilter .dropdown-item[data-id="last_working_day"]');
    filterText = selector.attr('data-id');
    $('.dropdown-item').removeClass('active');
    selector.addClass('active');
    $('#filterStartDate, #filterEndtDate').val("").removeAttr('min').removeAttr('max');
    hideFilterDatesBlock();
    filterLabelChange();
    getEmployeeTableData();
});

function getEmployeeTableData() {
    filterText == 'last_working_day' ? $('#resetBlock').hide() : $('#resetBlock').show();
    $('#userReportTable').append(loading());
    $.ajax({
        url: APP_URL + '/report/user/pta/fetch',
        type: "GET",
        data: { 
            filter: filterText,
            dateFilter: dateFilter
        },
        success: function (res) {
            $('#userReportTable').find('.loading-wrapper').remove();
            $('#userReportTable .table-responsive').html(res.data);
            $('#filterSearch').removeClass('sending');
            $('#filterDrop').attr('title', (res.dateRange.start === res.dateRange.end ? res.dateRange.start : `${res.dateRange.start} to ${res.dateRange.end}`));
        },
        error: function (xhr, status, error) {
            console.log(error);
        },
    });
}