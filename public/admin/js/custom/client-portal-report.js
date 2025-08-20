$(document).ready(function () {

    var requestPage = 1;
    var filterText = '';
    var dateFilter = {};
    var searchFilterState = 0;
    filterLabelChange();
    getTimesheetTableData();

    // Initialize Select2 for filters
    $('#bucketFilter, #projectFilter, #userFilter').select2();

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
        $('#filterBtnSection').hide();
    }

    function showFilterDatesBlock(){
        $('#startDateBlock').show();
        $('#endDateBlock').show();
        $('#filterBtnSection').show();
    }

    // get project list based on bucket filter
    $(document).on('change', '#bucketFilter', async function() {
        $('#projectFilter').val(null).trigger('change.select2');
        $('#userFilter').val(null).trigger('change.select2');
        searchFilterState = 1;
        let bucketFilter = $('#bucketFilter').length ? $('#bucketFilter').val() : '';
        hideUserFilter();
        await projectAjxCall(bucketFilter);
        searchFilterState = 0;
        getTimesheetTableData();
    });

    // get user list based on project filter
    $(document).on('change', '#projectFilter', function () {
        searchFilterState = 1;
        $('#userFilter').val(null).trigger('change.select2');
        let projectFilter = $('#projectFilter').val();
        if(projectFilter){
            $.ajax({
                url: APP_URL+'/client/report/users/list',
                type: 'GET',
                data: { projectFilter: projectFilter },
                success: function (res) {
                    $('.user-section').show();

                    if ($.isEmptyObject(res) || res.length === 0) {
                        $('#userFilter').html('<option value="">No Resource Found</option>');
                    } else {
                        $('#userFilter').empty().append('<option value="">Select Resource</option>');
                        $.each(res, function (index, user) {
                            var option = $('<option>').val(user.encrypted_id).text(user.name);
                            $('#userFilter').append(option);
                        });
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        }else{
            hideUserFilter();
        }
        searchFilterState = 0;
        getTimesheetTableData();
    });

    $('#userFilter').on('change', function(){
        getTimesheetTableData();
    });

    async function projectAjxCall(bucketFilter) {
        return $.ajax({
            url: APP_URL+'/client/report/projects/list',
            type: 'GET',
            data: {
                bucketFilter: bucketFilter
            },
            success: function (res) {
                if ($.isEmptyObject(res)) {
                    $('#projectFilter').html('<option value="">No Project Found</option>');
                } else {
                    $('#projectFilter').empty().append('<option value="">Select Project</option>');
                    $.each(res, function (id, name) {
                        var option = $('<option>').val(id).text(name);
                        $('#projectFilter').append(option);
                    });
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    function hideUserFilter() {
        $('#userFilter').val(null).trigger('change.select2');
        $('.user-section').hide();
    }

    // Set max date for filter start date
    $(document).on('change', '#filterEndDate', function () {
        let endDate = $('#filterEndDate').val();
        $('#filterStartDate').attr('max', endDate || '');
    });

    // Set min date for filter end date
    $(document).on('change', '#filterStartDate', function () {
        let startDate = $('#filterStartDate').val();
        $('#filterEndDate').attr('min', startDate || '');
    });

    // Enable disable Timesheet filter button
    $('.date-input').on('change', function(e){
        if( $('#filterStartDate').val() && $('#filterEndDate').val()){
            enableSubmitBtn('#filterSearch');
        }else{
            $('#filterSearch').attr('disabled', true);
        }
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
        if (!clientTimesheetAjaxProgress && searchFilterState == 0) {
            clientTimesheetAjaxProgress = true;

            let bucketFilter = $('#bucketFilter').length ? $('#bucketFilter').val() : null;
            let projectFilter = $('#projectFilter').length ? $('#projectFilter').val() : null;
            let userFilter = $('#userFilter').length ? $('#userFilter').val() : null;
            if (filterText != 'this_month' || projectFilter || bucketFilter || userFilter) {
                $('#resetBlock').show();
            } else {
                $('#resetBlock').hide();
            }

            // let timesheetFilterDate = $('#timesheetFilterDate').length ? $('#timesheetFilterDate').val() : null;
            // Adding loader to timesheet list table
            $('#cTTable').append(loading());

            $.ajax({
                url: APP_URL+'/client/report/fetch/timesheet',
                type: "GET",
                data: {
                    page: requestPage,
                    filter: filterText,
                    dateFilter: dateFilter,
                    bucketFilter: bucketFilter,
                    projectFilter: projectFilter,
                    userFilter: userFilter,
                },
                success: function (res) {
                    $('#filterCtData').removeClass('sending');
                    var showDetails = $('#showDescriptionSwitch').is(':checked') == true ? 'display: contents' : 'display: none;';

                    if(res.data && res.data?.data.length > 0){
                        $('.ctTotalHours').text(res.data.totalTime);
                        let tc = `<table class="table tablecontentcss table-hover table-striped" id="timesheetTable"> <thead> <tr>
                            <th width="50px" class="text-center">#</th>
                            <th width="250px">Project</th>
                            <th>Task</th>
                            <th width="180px">Resource</th>
                            <th width="110px" class="text-center">Date</th>
                            <th width="90px" class="text-center">Hours</th>
                            </tr> </thead> <tbody id="timesheet-table-body">`;

                        let num = res.data.st;

                        $.each(res.data.data, function (k, v) {
                            var sanitizedString = v.d.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                            sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');

                            tc += '<tr>';
                            tc += '<td class="text-center">'+num+'</td>';
                            tc += '<td class="td-projectName showclientTimesheet cursor-pointer text-primary text-decoration-underline" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd">'+v.pn+'</td>';
                            tc += '<td class="ctTblDiscription text-wrap" title="'+v.task+'"><span class="taskData">' + sliceText(v.task, 50) + '</span></br> <span class="detailDesc fs14" style="'+showDetails+'">' + sanitizedString + '</span></td>';
                            tc += '<td class="d-none td-task">'+v.task+'</td>';
                            tc += '<td class="td-resource">' + v.name + '</td>';
                            tc += '<td class="td-date text-center">'+v.date+'</td>';
                            tc += '<td class="td-time text-center">'+v.time+'</td>';
                            tc += '<td class="d-none td-description">'+v.d+'</td>';
                            tc += '</tr>';
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
                        $('.ctTotalHours').text('00:00');
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

    $('#filterCtData').on('click', function(){
        disableSubmitBtn('#filterCtData');
        dateFilter['startDate'] = $('#filterStartDate').val();
        dateFilter['endDate'] = $('#filterEndDate').val();
        getTimesheetTableData();
    });

    // Show timesheet description below task
    $(document).on('change', '#showDescriptionSwitch', function() {
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

        $(offcanvasEndLabel).text('Client Timesheet Details');
        html += `<tr> <th>Project: </th> <td>${projectName}</td> </tr>
            <tr> <th>Task: </th> <td>${task}</td> </tr>
            <tr> <th>Resource: </th> <td>${resource}</td> </tr>
            <tr> <th>Date: </th> <td>${date}</td> </tr>
            <tr> <th>Hours: </th> <td>${time}</td> </tr>
            <tr> <th>Description: </th> <td>${description}</td> </tr>`;

        $(showDataBody).html(html);
        $(showDataBody).show();
    });

    // Set min date for filter start date
    $(document).on('change', '#filterStartDate', function(){
        let startDate = $('#filterStartDate').val();
        if(startDate){
            $('#filterEndtDate').attr({'min': startDate});
        }else{
            $('#filterEndtDate').attr({'min': ''});
        }
    });

    // Set max date for filter end date
    $(document).on('change', '#filterEndtDate', function(){
        let endDate = $('#filterCtEndtDate').val();
        if(endDate){
            let selectedDate = new Date(endDate);
            selectedDate = new Date(selectedDate.getTime() - ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#filterStartDate').attr({'max': selectedDate});
        }else{
            $('#filterStartDate').attr({'max': ''});
        }
    });

    // Enable disable Timesheet filter button
    $('.date-input').on('change', function(e){
        if( $('#filterStartDate').val() || $('#filterEndDate').val()){
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
        $('#filterEndDate').val("").attr({'min': ''});

        let selector = $('#durationFilter .dropdown-item[data-id="this_month"]');
        filterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        $('#bucketFilter').val(null).trigger('change.select2');
        $('#projectFilter').val(null).trigger('change.select2');

        projectAjxCall(''); // Reset project filter
        hideUserFilter(); // Hide user filter
        hideFilterDatesBlock();
        filterLabelChange();
        requestPage = 1;
        setTimeout(() => {
            getTimesheetTableData();
        }, 100);
    });

    //Download the pdf or doc
    // CSV Download
    $("#downloadXlsx").click(function (e) {
        e.preventDefault();
        downloadFile('xlsx');
    });

    // PDF Download
    $("#downloadCTPdf").click(function (e) {
        e.preventDefault();
        downloadFile('pdf');
    });

    function downloadFile(type) {
        let bucketFilter = $('#bucketFilter').length ? $('#bucketFilter').val() : null;
        let projectFilter = $('#projectFilter').length ? $('#projectFilter').val() : null;
        let userFilter = $('#userFilter').length ? $('#userFilter').val() : null;
        $.ajax({
            url: APP_URL+ "/client/timesheet/data/export",
            type: "GET",
            data: {
                fileType: type,
                filter: filterText,
                dateFilter: dateFilter,
                bucketFilter: bucketFilter,
                projectFilter: projectFilter,
                userFilter: userFilter
            },
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
