$(document).ready(function () {
    var currentDate = new Date().toISOString().split('T')[0];
    var requestPage = 1;
    var filterText = '';
    var dateFilter = {};
    filterLabelChange();
    getTimesheetTableData();
    $('#resourceFilter, #taskFilter').select2();
    // Duration filter dropdown change
    $('#durationFilter li').on('click', function(){
        let selector = $(this).children();
        filterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        filterLabelChange();
        
        if(filterText != 'date'){
            hideFilterDatesBlock();
            getTimesheetTableData();
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
        getTimesheetTableData();
    });

    $('#resourceFilter, #taskFilter').on('change', function(){
        getTimesheetTableData();
    });

    //Pagination Functionality
    $(document).on('click', '.btnClick', function () {
        requestedTable = $(this).parents('table').attr('id');
        requestPage = $(this).attr('data-page');

        if(requestedTable == 'timesheetTable'){
            getTimesheetTableData();
        }
    });

    //Fetch timesheet table data
    var clientTimesheetAjaxProgress = false;
    function getTimesheetTableData() {
        if (!clientTimesheetAjaxProgress) {
            clientTimesheetAjaxProgress = true;

            let userFilter = $('#resourceFilter').length ? $('#resourceFilter').val() : null;
            let filterTask = $('#taskFilter').length ? $('#taskFilter').val() : null;
            let id = $('.pro-Id').data('id');
            if (filterText != 'this_month' || userFilter || filterTask) {
                $('#resetBlock').show();
            } else {
                $('#resetBlock').hide();
            }

            // let timesheetFilterDate = $('#timesheetFilterDate').length ? $('#timesheetFilterDate').val() : null;
            // Adding loader to timesheet list table
            $('#cTTable').append(loading());

            $.ajax({
                url: APP_URL+'/client/timesheet/fetch',
                type: "GET",
                data: {
                    page: requestPage,
                    filter: filterText,
                    dateFilter: dateFilter,
                    id: id,
                    userFilter:userFilter,
                    task: filterTask,
                },
                success: function (res) {
                    $('#filterSearch').removeClass('sending');
                    var opentimesheetDetails = $('#ctDataActiveswitch').is(':checked') == true ? 'display: contents' : 'display: none;';
                    if(res.data && res.data?.data.length > 0){
                        $('.ctTotalHours').text(res.data.totalTime);
                        let tc = `<table class="table tablecontentcss table-hover table-striped" id="timesheetTable"> <thead> <tr>
                            <th width="50px" class="text-center">#</th>
                            <th>Task</th>
                            <th width="180px">Resource</th>
                            <th width="110px" class="text-center">Date</th>
                            <th width="90px" class="text-center">Time</th>
                            <th width="100px" class="text-end">Action</th>
                            </tr> </thead> <tbody id="timesheet-table-body">`;

                        let num = res.data.st;

                        $.each(res.data.data, function (k, v) {
                            var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                            sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                            
                            tc += '<tr>';
                            tc += '<td class="text-center">'+num+'</td>';
                            tc += '<td class="ctTblDiscription text-wrap showclientTimesheet cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="'+v.task+'"><span class="taskData text-primary text-decoration-underline">' + sliceText(v.task, 50) + '</span></br> <span class="ctTblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                            tc += '<td class="td-name">' + sliceText(v.aliasName, 50) + '</td>';
                            tc += '<td class="d-none td-resource">' + v.aliasName + '</td>';
                            tc += '<td class="td-date text-center">'+v.date+'</td>';
                            tc += '<td class="td-time text-center">'+v.time+'</td>';
                            tc += '<td class="d-none td-task">'+v.task+'</td>';
                            tc += '<td class="d-none td-projectName">'+v.project_name+'</td>';
                            tc += '<td class="d-none td-description">'+v.description+'</td>';
                            tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                            tc += '<td class="d-none td-timesheetId">'+v.id+'</td>';
                            tc += '<td class="d-none td-isEscalated">'+v.is_escalated+'</td>';
                            tc += '<td class="text-end">';

                            if (v.is_escalated == 1) {
                                tc += '<label class="escalatedclientTimesheet cursor-pointer" data-entry-id="'+ v.id +'" title="Click to resolve escalated time entry">';
                                tc += '<span class="text-danger cursor"><i class="bx bxs-flag-alt me-1"></i></span></label>';
                            }

                            tc += '<label class="showclientTimesheet cursor-pointer clickOnRmnr" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">';
                            tc += '<span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>'

                            tc += '</td></tr>';
                            num++;
                        });

                        tc += '</tbody>';
                        if(res.data.morePage) { tc += makePagination(res.data.button); }
                        tc += '</table>';
                        $('#cTTable').html(tc);
                        var prevLink = $('#timesheetTable a.prev');
                        var nextLink = $('#timesheetTable a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                        $('#cTTable #loading').remove();
                        $('#detailTimesheetSwitchDiv').show();
                        $('.exportPdfCsvDiv').show();
                    }else{
                        $('.ctTotalHours').text(0);
                        $('.exportPdfCsvDiv').hide();
                        $('#cTTable #loading').remove();
                        $('#detailTimesheetSwitchDiv').hide();
                        $('#cTTable').html('<h6 class="font-20 mb-0 text-light text-center pb-5">No data found</h6>');
                    }

                    requestPage = 1;
                    clientTimesheetAjaxProgress = false;
                },
                error: function (xhr, status, error) {
                    clientTimesheetAjaxProgress = false;
                    console.log(error);
                },
            });
        }
    }

    $(document).on('click', '.addedEscalationclientTimesheet', function () {
        const timesheetId = $(this).data('entry-id');
        alert('Alert!','Are you sure you want to raise the escalation for this time entry?')
        .then(function(result) {
            if(result){
                escalationAjax('add', timesheetId);
            }
        });
    });

    $(document).on('click', '.escalatedclientTimesheet', function () {
        const timesheetId = $(this).data('entry-id');
        alert('Alert!','Are you sure you want to resolve the escalation for this time entry?')
        .then(function(result) {
            if(result){
                escalationAjax('resolve', timesheetId);
            }
        });
    });

    function escalationAjax(flag, timesheetId){
        $.ajax({
            url: APP_URL + '/client/timesheet/escalate',
            type: 'POST',
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                id: timesheetId,
                flag: flag
            },
            success: function (res) {
                $('.offcanvas').toggleClass('is-open');
                $('.offcanvas .btn-close').click();
                successMessage(res.message);
                getTimesheetTableData();
            },
            error: function (err) {
                console.error(err);
                errorMessage('Failed to escalate timesheet.');
            }
        });
    }

    // Show timesheet description below task
    $(document).on('change', '#ctDataActiveswitch', function() {
        let targetClass = $(this).data('target');
        if ($(this).is(':checked')) {
            $(targetClass).show();
        } else {
            $(targetClass).hide();
        }
    });

    //Show Client Timesheet in offcanvas
    $(document).on('click', '.showclientTimesheet', function() {
        var showDataBody = $(document).find('#showData').find('#showDataBody');
        var html = '';
        var offcanvasEndLabel = $(document).find('#showData').find('#offcanvasEndLabel');
        $(offcanvasEndLabel).empty();
        $(showDataBody).empty();

        var projectName = $(this).closest('tr').find('.td-projectName').text();
        var task = $(this).closest('tr').find('.td-task').text();
        var resource = $(this).closest('tr').find('.td-resource').text();
        var description = $(this).closest('tr').find('.td-description').html();
        var time = $(this).closest('tr').find('.td-time').text();
        var date = $(this).closest('tr').find('.td-date').text();
        var timesheetId = $(this).closest('tr').find('.td-timesheetId').text();
        var isEscalated = $(this).closest('tr').find('.td-isEscalated').text();

        
        $(offcanvasEndLabel).text('Client Timesheet Details');
        html += `<tr> <th>Project: </th> <td>${projectName}</td> </tr>
            <tr> <th>Task: </th> <td>${task}</td> </tr>
            <tr> <th>Resource: </th> <td>${resource}</td> </tr>
            <tr> <th>Date: </th> <td>${date}</td> </tr>
            <tr> <th>Time: </th> <td>${time}</td> </tr>
            <tr> <th>Description: </th> <td>${description}</td> </tr>`;

        if (isEscalated == 0) {
            html += `<tr> <th class='align-middle'>Action:</th> <td>
                <button type='button' class='btn btn-primary me-sm-3 me-1 mt-1 addedEscalationclientTimesheet' title="Click to raise escalate time entry" data-entry-id="${timesheetId}">
                    <i class="bx bxs-flag-alt"></i> Escalate Time Entry
                </button></td></tr>`;
        }else{
            html += `<tr> <th class='align-middle'>Action:</th> <td>
                <button type='button' class='btn btn-danger me-sm-3 me-1 mt-1 escalatedclientTimesheet' title="Click to resolve escalated time entry" data-entry-id="${timesheetId}">
                    <i class="bx bxs-flag-alt"></i> Mark as a Resolve
                </button></td></tr>`;
        }

        $(showDataBody).html(html);
        $(showDataBody).show();
    });

    $(document).on('change', '#activeswitch', function() {
        if ($(this).is(':checked')) {
            $('.ctTblDetailDesc').show();
        } else {
            $('.ctTblDetailDesc').hide();
        }
    });

    // Set min date for filter start date
    $(document).on('change', '#filterCtStartDate', function(){
        let startDate = $('#filterCtStartDate').val();
        if(startDate){
            // let selectedDate = new Date(startDate);
            // selectedDate = new Date(selectedDate.getTime() + ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#filterCtEndtDate').attr({'min': startDate});
        }else{
            $('#filterCtEndtDate').attr({'min': ''});
        }
    });

    // Set max date for filter end date
    $(document).on('change', '#filterCtEndtDate', function(){
        let endDate = $('#filterCtEndtDate').val();
        if(endDate){
            let selectedDate = new Date(endDate);
            selectedDate = new Date(selectedDate.getTime() - ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#filterCtStartDate').attr({'max': selectedDate});
        }else{
            $('#filterCtStartDate').attr({'max': ''});
        }
    });

    // Enable disable Timesheet filter button
    $('.date-input').on('change', function(e){
        if( $('#filterCtStartDate').val() || $('#filterCtEndtDate').val()){
            enableSubmitBtn('#filterCtData');
        }else{
            $('#filterCtData').attr('disabled', true);
        }
    });

    $(document).on('click', '#filterCtData', function() {
        getTimesheetTableData();
    });

    $(document).on('click', '#resetBtn', function() {
        $('#filterStartDate').val("").attr({'max': ''});
        $('#filterEndtDate').val("").attr({'min': ''});
        $('#filterSearch').removeClass('sending');
        $('#filterSearch').attr('disabled', true);
        let selector = $('#durationFilter .dropdown-item[data-id="this_month"]');
        filterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        $('#resourceFilter').val(null).trigger('change.select2');
        $('#taskFilter').val(null).trigger('change.select2');
        hideFilterDatesBlock();
        filterLabelChange();
        requestPage = 1;
        setTimeout(() => {
            getTimesheetTableData();
        }, 100);
    });

    //Download the pdf or doc
    // xlsx Download
    $("#downloadCTCsv").click(function (e) {
        e.preventDefault();
        downloadFile('xlsx');
    });

    // PDF Download
    $("#downloadCTPdf").click(function (e) {
        e.preventDefault();
        downloadFile('pdf');
    });

    function downloadFile(type) {
        let userFilter = $('#resourceFilter').length ? $('#resourceFilter').val() : null;
        let id = $('.pro-Id').data('id');
        let task = $('#taskFilter').length ? $('#taskFilter').val() : null;
        $.ajax({
            url: APP_URL+ "/client/timesheet/data/export",
            type: "GET",
            data: { fileType: type, filter: filterText, dateFilter: dateFilter, projectFilter: id, userFilter:userFilter, task:task},
            success: function (response) {
                if (response.success) {
                    const fileExtension = (type === 'xlsx') ? 'xlsx' : 'pdf';
                    let link = document.createElement('a');
                    link.href = response.file_url;
                    link.download = `${response.filename}.${fileExtension}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    errorMessage("Error: Unable to generate file.");
                }
            },
            error: function () {
                errorMessage("Something went wrong. Please try again.");
            }
        });
    }
});
