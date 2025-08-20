$(document).ready(function () {
    var requestPage = 1;
    var searchFilterState = 0;
    var filterText = '';
    var dateFilter = {};
    var projectId = null;

    let urlPath = window.location.pathname;
    if( urlPath != '/timesheet/create' ){
        getTimesheetTableData();
        projectList();
    }

    if(urlPath == '/timesheet/create'){
        timeEntryTimePickerChange();
        $('#isProjectView').val('false');
    }

    $('#projectType').select2();
    $('#projectTask').select2();
    $('#timesheetType').select2();

    $('#timesheetUserFilter').select2({
        placeholder: "Select Employee",
        allowClear: true,
        minimumInputLength: 3,
        ajax: {
            dataType: 'json',
            delay: 250,
            url: APP_URL+'/fetch/timesheet/user',
            processResults: function (data) {
                return {
                    results: $.map(data, function (key, value) {
                        return {
                            text: key,
                            id: value,
                        }
                    })
                };
            },
            cache: true,
        }
    });

    //initialize Select2
    $('#proTaskFilter').select2({
        placeholder: "Select Task",
        allowClear: true,
        minimumInputLength: 3,
        ajax: {
            dataType: 'json',
            delay: 250,
            url: APP_URL + '/fetch/timesheet/task',
            data: function (params) {
                return {
                    projectId: projectId,
                    term: params.term 
                };
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (key, value) {
                        let truncatedText = key.length > 30 ? key.substring(0, 30) + "..." : key;
                        return {
                            text: truncatedText,
                            id: value,
                            title: key
                        };
                    })
                };
            },
            cache: true,
        }
    }).on('select2:open', function() {
        setTimeout(() => {
            $('.select2-results__option').each(function() {
                $(this).attr('title', $(this).text());
            });
        }, 100);
    });

    //timesheet pagination
    var activeTabName = '';
    $(document).on('click', '.btnClick', function () {
        let activeTabName = $(this).closest('table').attr('id');
        requestPage = $(this).attr('data-page');
        getTimesheetTableData(activeTabName);
    });

    // Timesheet index page filter dropdown change
    $('#durationFilter li').on('click', function(e){
        let selector = $(this).children();
        filterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');

        if(filterText == 'today' || filterText == 'week' || filterText == 'month'){
            hideFilterDatesBlock();
            getTimesheetTableData();
        }else if(filterText == 'date'){
            showFilterDatesBlock();
        }
    });

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

    // Set min date for filter start date
    $(document).on('change', '#filterStartDate', function(){
        let startDate = $('#filterStartDate').val();
        if(startDate){
            $('#filterEndtDate').attr({'min': startDate});
        } else {
            $('#filterEndtDate').attr({'min': ''});
        }
    });

    // Set max date for filter end date
    $(document).on('change', '#filterEndtDate', function(){
        let endDate = $('#filterEndtDate').val();
        if(endDate){
            $('#filterStartDate').attr({'max': endDate});
        } else {
            $('#filterStartDate').attr({'max': ''});
        }
    });

    // Enable disable Timesheet filter button
    $('.date-input').on('change', function(e){
        if( $('#filterStartDate').val() || $('#filterEndtDate').val()){
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

    let debounceTimer;
    $('#timesheetUserFilter, #projectFilter, #projectType, #timesheetType, #proTaskFilter').on('change', function(){
        var changedElement = $(this).attr('id');
        if (changedElement === 'projectFilter') {
            var projectFilterValue = $(this).val(); // Get the selected value
            if(projectFilterValue){
                projectId = projectFilterValue;
                $('.projectTaskList').show();
            }else{
                projectId = null;
                $('.projectTaskList').hide();
            }

            // Destroy and reinitialize Select2 to ensure it gets the latest projectId
            $('#proTaskFilter').select2('destroy').select2({
                placeholder: "Select Task",
                allowClear: true,
                minimumInputLength: 3,
                ajax: {
                    dataType: 'json',
                    delay: 250,
                    url: APP_URL + '/fetch/timesheet/task',
                    data: function (params) {
                        return {
                            projectId: projectId,
                            term: params.term 
                        };
                    },
                    processResults: function (data) {
                        return {
                            results: $.map(data, function (key, value) {
                                let truncatedText = key.length > 30 ? key.substring(0, 30) + "..." : key;
                                return {
                                    text: truncatedText,
                                    id: value,
                                    title: key
                                };
                            })
                        };
                    },
                    cache: true,
                }
            }).on('select2:open', function() {
                setTimeout(() => {
                    $('.select2-results__option').each(function() {
                        $(this).attr('title', $(this).text());
                    });
                }, 100);
            });
        }

        if(changedElement === 'projectType' || changedElement === 'timesheetUserFilter'){
            $('#projectFilter').val(null).trigger('change');
            projectList();
        }

        if(searchFilterState == 0){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
                getTimesheetTableData();
            }, 1000);
        }
    });

    function projectList()
    {
        let filterEmp = $('#timesheetUserFilter').length ? $('#timesheetUserFilter').val() : null;
        let filterProjectType = $('#projectType').length ? $('#projectType').val() : null;

        $('#projectFilter').select2({
            placeholder: "Select Project",
            allowClear: true,
            minimumInputLength: 3,
            ajax: {
                dataType: 'json',
                delay: 250,
                url: APP_URL+'/timesheet/searched/projects',
                data: function (params) {
                    return {
                        term: params.term,
                        projectType : filterProjectType,
                        filterEmp: filterEmp,
                    };
                },
                processResults: function (data) {
                    return {
                        results: $.map(data.projects, function (item) {
                            return {
                                text: item.name,
                                id: item.id
                            }
                        })
                    };
                },
                cache: false,
            }
        });
    }

    //ajax call of timesheet data
    var approvePermission = false;
    function getTimesheetTableData(activeTabName = null) {
        if (searchFilterState == 0) {
            let filterEmp = $('#timesheetUserFilter').length ? $('#timesheetUserFilter').val() : null;
            let filterProject = $('#projectFilter').length ? $('#projectFilter').val() : null;
            let filterProjectType = $('#projectType').length ? $('#projectType').val() : null;
            let filterTimesheetType = $('#timesheetType').length ? $('#timesheetType').val() : null;
            let filterTask = $('#proTaskFilter').length ? $('#proTaskFilter').val() : null;

            if(filterEmp || filterProject || filterProjectType || filterTimesheetType || filterText || filterTask){
                $('#resetBlock').show();
            }else{
                $('#resetBlock').hide();
            }

            // Adding loader to timesheet list table
            $('#timesheetPendingTableData, #timesheetApprovedTableData, #timesheetRejectedTableData').append(loading());

            $.ajax({
                url: APP_URL+'/timesheet/fetchData',
                type: 'GET',
                data: {
                    page: requestPage,
                    filterText: filterText,
                    dateFilter: dateFilter,
                    filterEmp: filterEmp,
                    project: filterProject,
                    statusName: activeTabName,
                    projectType : filterProjectType,
                    timesheetType : filterTimesheetType,
                    task : filterTask,
                },
                success: function (res) {
                    // $('#timesheetPendingTableData, #timesheetApprovedTableData, #timesheetRejectedTableData').find('.loading-wrapper').remove();
                    approvePermission = res.approvePermission;
                    var opentimesheetDetails = $('#activeswitch').is(':checked') == true ? 'display: contents' : 'display: none;';

                    if(activeTabName == null || activeTabName == 'pendingTimesheetTable') {
                        if(res.pendingData.total == 0){
                            $('#timesheetPendingTableData').html(tableNoData);
                            $('#pendingTimesheetCount').text('(0)');
                        }else{
                            let tc = `<table class="table table-hover table-striped tablecontentcss" id="pendingTimesheetTable"> <thead> <tr>`;

                            // var hasTrue = res.pendingData.data.some(function(element) {
                            //     return element.staApprove === true;
                            // });

                            // if(approvePermission == true || hasTrue == true){
                            if(approvePermission == true){
                                tc += `<th width="" id="checkAllPending">
                                            <div class="form-check"> <input class="form-check-input" type="checkbox" value="" id="selectAllPending"> <label class="form-check-label" for="selectAllPending"></label> </div>
                                        </th>`;
                            }
                            tc += `<th width="18%">Project</th>
                                    <th width="7%">Type</th>
                                    <th width="30%">Task</th>
                                    <th width="15%">Employee</th>
                                    <th width="10%">Date</th>
                                    <th width="10%">Time</th>
                                    <th width="10%">Action</th>
                                </tr> </thead> <tbody id="timesheet-table-body">`;

                            let totalTimeInSeconds = 0;
                            let num = res.pendingData.st;

                            $.each(res.pendingData.data, function (k, v) {
                                tc += '<tr class="pendingEntry">';
                                // if((approvePermission == true) || (v.staApprove == true)){
                                if(approvePermission == true){
                                    tc += '<td class=""> <div class="form-check"> <input class="form-check-input pendingCheck" type="checkbox" value="'+v.id+'" id="pending-'+k+'"> <label class="form-check-label" for="pending-'+k+'"></label> </div> </td>';
                                // }else if(hasTrue == true){
                                //     tc += '<td class="emptyCheckbox"></td>';
                                }
                                tc += '<td class="td-project-name showTimesheet cursor-pointer text-primary" title="Show Timesheet" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'">'+v.project+'</td>';
                                tc += '<td class="" title="'+(v.billable == 1 ? 'Billable' : 'Non-Billable')+'">'+ (v.billable == 1 ? 'B' : 'NB') +'</td>';
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                tc += '<td class="tblDiscription text-wrap">' + sliceText(v.task, 60) + '</br> <span class="tblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-employee">'+v.emp+'</td>';
                                tc += '<td class="td-date">'+v.date+'</td>';
                                tc += '<td class="td-time">'+v.time+'</td>';
                                tc += '<td class="d-none td-title">'+v.task+'</td>';
                                tc += '<td class="d-none td-billable">'+v.billable+'</td>';
                                tc += '<td class="d-none td-billableType">'+v.billableType+'</td>';
                                tc += '<td class="d-none td-description">'+sanitizedString+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '<td>';

                                tc += '<label title="Show Timesheet" class="showTimesheet cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'" title="Show Details"> <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>';
                                if(res.pendingData.permission.delete == true || v.deletePermission == true){
                                    tc += '<label title="Delete Timesheet" class="deleteTimesheet cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                                }
                                tc += '</td></tr>';
                                const timeParts = v.time.split(":");
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                const seconds = parseInt(timeParts[2], 10);
                                let totalSeconds = 0;
                                totalSeconds = (hours ? hours * 3600 : 0) + (minutes ? minutes * 60 : 0) + (seconds ? seconds : 0);
                                totalTimeInSeconds += totalSeconds;
                                num++;
                            });
                            tc += '</tbody>';
                            const formattedTotalTime = secondsToHHMMSS(totalTimeInSeconds);
                            if(res.pendingData.morePage){
                                tc += makePagination(res.pendingData.button);
                            }
                            tc += `<tfoot> <tr>`;

                            // if(approvePermission == true || hasTrue == true){
                            if(approvePermission == true){
                                tc += `<td colspan="5"> <div class="app-rej-sel-btn" style="display: none;">
                                            <a href="javascript:;" class="btn btn-sm btn-label-success" data-action="approve" id="approveSelected">Approve Selected</a>
                                            <a href="javascript:;" class="btn btn-sm btn-label-danger ms-1" data-action="reject" id="rejectSelected">Reject Selected</a>
                                        </div> </td>`;
                            }else{
                                tc += `<td colspan="4"></td>`;
                            }
                            tc += `<td class="text-end"><b>Total :</b></td>
                                    <td><b>${formattedTotalTime}</b></td>
                                    <td></td>
                                </tr>
                            </tfoot>`;
                            tc += '</table>';
                            $('#timesheetPendingTableData').html(tc);

                            var prevLink = $('#timesheetPendingTableData a.prev');
                            var nextLink = $('#timesheetPendingTableData a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');

                            $('#pendingTimesheetCount').text('('+res.pendingData.total+')');
                        }
                    }

                    if(activeTabName == null || activeTabName == 'approvedTimesheetTable') {
                        if(res.approvedData.total == 0){
                            $('#timesheetApprovedTableData').html(tableNoData);
                            $('#approvedTimesheetCount').text('(0)');
                        }else{
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="approvedTimesheetTable"> <thead> <tr>
                                            <th width="18%">Project</th>
                                            <th width="7%">Type</th>
                                            <th width="30%">Task</th>
                                            <th width="15%">Employee</th>
                                            <th width="10%">Date</th>
                                            <th width="10%">Time</th>
                                            <th width="10%">Action</th>
                                        </tr> </thead> <tbody id="pending-timesheet-table-body">`;

                            let totalTimeInSeconds = 0;
                            let num = res.approvedData.st;

                            $.each(res.approvedData.data, function (k, v) {
                                tc += '<tr>';
                                tc += '<td class="td-project-name showTimesheet cursor-pointer text-primary" title="Show Timesheet" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'">'+v.project+'</td>';
                                tc += '<td class="" title="'+(v.billable == 1 ? 'Billable' : 'Non-Billable')+'">'+ (v.billable == 1 ? 'B' : 'NB') +'</td>';
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                tc += '<td class="tblDiscription text-wrap">' + sliceText(v.task, 60) + '</br> <span class="tblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-employee">'+v.emp+'</td>';
                                tc += '<td class="td-date">'+v.date+'</td>';
                                tc += '<td class="td-time">'+v.time+'</td>';
                                tc += '<td class="d-none td-title">'+v.task+'</td>';
                                tc += '<td class="d-none td-billable">'+v.billable+'</td>';
                                tc += '<td class="d-none td-billableType">'+v.billableType+'</td>';
                                tc += '<td class="d-none td-description">'+sanitizedString+'</td>';
                                tc += '<td class="d-none td-approveRejectBy">'+v.approveRejectBy+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '<td class="d-none td-status">Approved</td>';
                                tc += '<td>';
                                tc += '<label title="Show Timesheet" class="showTimesheet cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>';

                                if(res.approvedData.permission.delete == true || v.deletePermission == true){
                                    tc += '<label title="Delete Timesheet" class="deleteTimesheet cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                                }
                                tc += '</td></tr>';
                                const timeParts = v.time.split(":");
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                const seconds = parseInt(timeParts[2], 10);
                                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                                totalTimeInSeconds += totalSeconds;
                                num++;
                            });

                            tc += '</tbody>';
                            const formattedTotalTime = secondsToHHMMSS(totalTimeInSeconds);
                            if(res.approvedData.morePage) { tc += makePagination(res.approvedData.button); }

                            tc += `<tfoot>
                                        <tr>
                                            <td colspan="4"></td>
                                            <td class="text-end"><b>Total :</b></td>
                                            <td><b>${formattedTotalTime}</b></td>
                                            <td></td>
                                        </tr>
                                    </tfoot>`;
                            tc += '</table>';
                            $('#timesheetApprovedTableData').html(tc);
                            var prevLink = $('#approvedTimesheetTable a.prev');
                            var nextLink = $('#approvedTimesheetTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                            $('#approvedTimesheetCount').text('('+res.approvedData.total+')');
                        }
                    }

                    if(activeTabName == null || activeTabName == 'rejectedTimesheetTable') {
                        if(res.rejectedData.total == 0){
                            $('#timesheetRejectedTableData').html(tableNoData);
                            $('#rejectedTimesheetCount').text('(0)');
                        }else{
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="rejectedTimesheetTable"> <thead> <tr>
                                            <th width="18%">Project</th>
                                            <th width="7%">Type</th>
                                            <th width="30%">Task</th>
                                            <th width="15%">Employee</th>
                                            <th width="10%">Date</th>
                                            <th width="10%">Time</th>
                                            <th width="10%">Action</th>
                                        </tr> </thead> <tbody id="rejected-timesheet-table-body">`;

                            let totalTimeInSeconds = 0;
                            let num = res.rejectedData.st;

                            $.each(res.rejectedData.data, function (k, v) {
                                tc += '<tr>';
                                tc += '<td class="td-project-name showTimesheet cursor-pointer text-primary" title="Show Timesheet" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'">'+v.project+'</td>';
                                tc += '<td class="" title="'+(v.billable == 1 ? 'Billable' : 'Non-Billable')+'">'+ (v.billable == 1 ? 'B' : 'NB') +'</td>';
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                tc += '<td class="tblDiscription text-wrap">' + sliceText(v.task, 60) + '</br> <span class="tblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-employee">'+v.emp+'</td>';
                                tc += '<td class="td-date">'+v.date+'</td>';
                                tc += '<td class="td-time">'+v.time+'</td>';
                                tc += '<td class="d-none td-title">'+v.task+'</td>';
                                tc += '<td class="d-none td-billable">'+v.billable+'</td>';
                                tc += '<td class="d-none td-billableType">'+v.billableType+'</td>';
                                tc += '<td class="d-none td-description">'+sanitizedString+'</td>';
                                tc += '<td class="d-none td-approveRejectBy">'+v.approveRejectBy+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '<td class="d-none td-status">Rejected</td>';
                                tc += '<td>';
                                tc += '<label title="Show Timesheet" class="showTimesheet cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>';

                                tc +=`<label title="Edit Timesheet" class="text-info cursor-pointer editTimesheet" data-item-id="${v.id}"> <i class="bx bx-edit-alt me-1"></i></label>`;

                                if(res.rejectedData.permission.delete == true || v.deletePermission == true){
                                    tc += '<label title="Delete Timesheet" class="deleteTimesheet cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                                }

                                tc += '</td></tr>';
                                const timeParts = v.time.split(":");
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                const seconds = parseInt(timeParts[2], 10);
                                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                                totalTimeInSeconds += totalSeconds;
                                num++;
                            });

                            tc += '</tbody>';
                            const formattedTotalTime = secondsToHHMMSS(totalTimeInSeconds);
                            if(res.rejectedData.morePage) { tc += makePagination(res.rejectedData.button); }

                            tc += `<tfoot>
                                        <tr>
                                            <td colspan="4"></td>
                                            <td class="text-end"><b>Total :</b></td>
                                            <td><b>${formattedTotalTime}</b></td>
                                            <td></td>
                                        </tr>
                                    </tfoot>`;
                            tc += '</table>';
                            $('#timesheetRejectedTableData').html(tc);
                            var prevLink = $('#rejectedTimesheetTable a.prev');
                            var nextLink = $('#rejectedTimesheetTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                            $('#rejectedTimesheetCount').text('('+res.rejectedData.total+')');

                        }
                    }

                    $('#timesheetPendingTableData #loading, #timesheetApprovedTableData #loading, #timesheetRejectedTableData #loading').remove();
                    requestPage = 1;
                    timesheetAjaxProgress = false;

                    if($('#filterEndtDate').is(':visible')){
                        enableSubmitBtn('#filterSearch');
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        }
    }

    $(document).on('click', '#resetAll', function() {
            searchFilterState = 1;
            $('#filterStartDate, #filterEndtDate').val("").removeAttr('min').removeAttr('max');
            $('#timesheetUserFilter').val(null).trigger('change');
            $('#projectType').val(null).trigger('change');
            $('#projectFilter').val(null).trigger('change');
            $('#timesheetType').val(null).trigger('change');
            $('#durationFilter .dropdown-item').removeClass('active');
            $('#filterSearch').attr('disabled', true);
            $('#proTaskFilter').val(null).trigger('change');
            hideFilterDatesBlock();
            filterText = '';
            searchFilterState = 0;
            requestPage = 1;
            getTimesheetTableData();
            projectList();
    })

    // Show timesheet description below task
    $(document).on('change', '#activeswitch', function() {
        if ($(this).is(':checked')) {
            $('.tblDetailDesc').show();
        } else {
            $('.tblDetailDesc').hide();
        }
    });

    // Click event for individual checkboxes for timesheet pending entry
    $(document).on("click", ".pendingCheck", function() {
        var allChecked = $('.pendingCheck:checked').length === $('.pendingCheck').length;
        $('#selectAllPending').prop('checked', allChecked);
        showTimesheetApproveReject();
    });

    // Click event for "Select All" checkbox for timesheet pending entry
    $(document).on("click", "#selectAllPending", function() {
        var isChecked = $(this).prop('checked');
        $('.pendingCheck').prop('checked', isChecked);
        showTimesheetApproveReject();
    });

    function showTimesheetApproveReject(){
        if($('.pendingCheck:checked').length > 0){
            $('.app-rej-sel-btn').show();
        }else{
            $('.app-rej-sel-btn').hide();
        }
    }

    $(document).on('click', '#approveSelected, #rejectSelected', function(){
        var actionName = $(this).data('action');
        var entryIds = $('.pendingCheck:checked').map(function() {
            return $(this).val();
        }).get();

        let confirmText = 'Are you sure you want to '+$(this).text()+'?';
        alert('Alert!', confirmText, 'text-danger')
            .then(function(result) {
                if (result) {
                    timeheetApproveReject(actionName, entryIds);
                }
        });
    });

    function timeheetApproveReject(actionName, entryIds){
        $.ajax({
            url: APP_URL+'/timesheet/approve/reject',
            type: 'POST',
            data: { actionName: actionName, entryIds: entryIds },
            success: function (response) {
                if(response.status == 'success'){
                    getTimesheetTableData();
                    successMessage(response.message);
                    $('.offcanvas').toggleClass('is-open');
                    $('.offcanvas .btn-close').click()
                }else{
                    errorMessage(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.log(error,xhr);
            },
        });
    }

    $(document).on('click', '.editTimesheet', function(){
        var editEntryId = $(this).closest('label').data('item-id');
        $.ajax({
            url: APP_URL+'/timesheet/' + editEntryId + '/edit',
            type: 'GET',
            data: { editEntryId: editEntryId},
            success: function (res) {
                if(res.data){
                    $('#edit-timesheet-model').html(res.data);
                    $('#editTimesheetModal #editDescription').summernote({
                        height: 200,
                        toolbar: [
                            ['style', ['style']],
                            ['font', ['bold', 'italic', 'underline', 'clear']],
                            ['para', ['ul', 'ol']],
                            ['color', ['color']],
                            ['view', ['codeview']]
                        ],
                        callbacks: {
                            onChange: function(contents, $editable) {
                                if(!$('#editTimesheetModal #editDescription').summernote('isEmpty')){
                                    $('#editTimesheetModal #editDescription-error').hide()
                                }
                            },
                            // callback for pasting text only (no formatting)
                            onPaste: function (e) {
                                var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                                e.preventDefault();
                                bufferText = bufferText.replace(/\r?\n/g, '<br>');
                                document.execCommand('insertHtml', false, bufferText);
                            }
                        }
                    }).summernote('code', res.summernote);

                    $('#editTimesheetModal #editProjectName, #editTimesheetModal #editProjectTask, #editTimesheetModal #nonBillingValue').select2({
                        dropdownParent: $("#editTimesheetModal .modal-body"), 
                    });
                    $('#editTimesheetModal').modal('show');

                }else{
                    errorMessage('Something went wrong!');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    //ajax call to fetch task based on project change in reject timesheet edit form
    $(document).on('change', '#editProjectName', function () {
        var projectId = $(this).val();
        $.ajax({
            url: APP_URL+'/timesheet',
            type: 'GET',
            data: { project: projectId },
            success: function (response) {
                document.getElementById('editProjectTask').disabled = false;
                $('#editProjectTask').empty();
                
                var data = response.data;
                var taskoption = '';
                taskoption += "<option value='' selected>" + 'Select Task' + "</option>";
                $.each(data, function(item) {
                    var val = data[item];
                    taskoption += "<option value='" + val.id + "'>" + val.title + "</option>";
                });
                $('#editProjectTask').html(taskoption);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    $(document).on('click', '#updateTimesheet', function () {
        $.validator.addMethod('summerNoteRequired', function (value, element) {
            return !$('#editDescription').summernote('isEmpty');
        }, 'Description field is required');

        $('#edit-timesheet-form').validate({
            ignore: [],
            rules:{
                editProjectName: {
                    required: true,
                }, editProjectTask: {
                    required: true,
                }, is_billable: {
                    required: true,
                }, editDescription: {
                    summerNoteRequired: true, 
                }, nonBillingValue: {
                    required: true,
                }
            },
            highlight: function(element, errorClass, validClass) {
                $(element).addClass(errorClass).removeClass(validClass);
                $(element).parent('div').addClass('input-error').removeClass(validClass);
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).removeClass(errorClass).addClass(validClass);
                $(element).parent('div').removeClass('input-error').addClass(validClass);
            },
            errorPlacement: function (error, element) {
                if ($(element).parent('.input-group').length) {
                    $(error).insertAfter($(element).parent());      // radio/checkbox
                } else if(element.attr('name') == 'editDescription') {
                    $(error).insertBefore($('#editDescription-error')); // for description error message
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
            messages: {
                editProjectName: {
                    required: 'Project field is required',
                }, editProjectTask: {
                    required: 'Task field is required',
                },editDescription: {
                    required: 'Description field is required',
                }
            },
        }); 

        if($('#edit-timesheet-form').valid()) {
            disableSubmitBtn('#updateTimesheet');
            $('#edit-timesheet-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text("");
                },
                success: function (response) {
                    $('#edit-timesheet-form').validate().resetForm();
                    $('.nonBillableTypeOption').empty();
                    $('#editTimesheetModal').modal("hide");
                    getTimesheetTableData();
                    enableSubmitBtn('#updateTimesheet');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#updateTimesheet');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, "-");
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //ajax call to fetch task based on project
    $(document).on('change' , '.project' , function(){
        var currentSel = $(this);
        var timesheetBlock = $(currentSel).closest('.timesheet-block');
        var projectId = $(this).val();
        if(projectId){
            $.ajax({
                url: APP_URL+'/timesheet',
                type: 'GET',
                data: { project: projectId },
                success: function (response) {
                    var projectTask = timesheetBlock.find('.projectTask');
                    $(projectTask).prop('disabled', false);
                    $(projectTask).empty();

                    var data = response.data
                    var taskoption = '';
                    taskoption += "<option value='' selected>" + 'Select Task' + "</option>";
                    $.each(data, function(item) {
                        var val = data[item];
                        taskoption += "<option value='" + val.id + "'>" + val.title + "</option>";
                    });

                    $(projectTask).html(taskoption);

                    if($('#timesheetModal').is(':visible')){
                        $(projectTask).select2({
                            dropdownParent: $('#addModelTimeSheetData .modal-body')
                        });
                    }else{
                        $(projectTask).select2();
                    }

                    if(response.projectClient == 'IPS Internal'){
                        timesheetBlock.find('[id^="billableOption_"]').css('display', 'none');
                        timesheetBlock.find('[id^="non_billable_"]').prop('checked', true);
                        timesheetBlock.find('[id^="nbTypeOption_"]').show();
                        $(timesheetBlock).find('.billingType').removeClass('col-lg-3').addClass('col-lg-2');
                    }else{
                        timesheetBlock.find('[id^="billableOption_"]').show();
                        timesheetBlock.find('[id^="billable_"]').prop('checked', true);
                        timesheetBlock.find('[id^="non_billable_"]').prop('checked', false);
                        timesheetBlock.find('[id^="nbTypeOption_"]').hide();
                        $(timesheetBlock).find('.billingType').addClass('col-lg-3');
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        }else{
            timesheetBlock.find('.projectTask').empty();
            timesheetBlock.find('.projectTask').append("<option value='' selected>" + 'Select Task' + "</option>");
            timesheetBlock.find('.projectTask').prop('disabled', true);
            timesheetBlock.find('[id^="billableOption_"]').show();
            timesheetBlock.find('[id^="billable_"]').prop('checked', true);
            timesheetBlock.find('[id^="non_billable_"]').prop('checked', false);
            timesheetBlock.find('[id^="nbTypeOption_"]').hide();
        }
    });

    if(urlPath == '/timesheet/create'){
        initializeTimepicker($('#EntryHrs_0'), setTimeHrs, setTimeHH, setTimeMM);

        $.validator.addMethod('notGreaterThanAvailableTime', function(value, element) {
            let currentTimeArray = value.split(':');
            let currentTimeMinutes = parseInt(currentTimeArray[0]) * 60 + parseInt(currentTimeArray[1]);
            let  availableTimeMax = setTimeHrs.split(':');
            let availableTimeMinutes = parseInt(availableTimeMax[0]) * 60 + parseInt(availableTimeMax[1]);
            return (currentTimeMinutes <= availableTimeMinutes);
        }, 'Time entry should not exceed ' + setTimeHrs+' hours.');

        $.validator.addMethod('summerNoteRequired', function (value, element) {
            // return !$(element).summernote('isEmpty');
            var content = $(element).summernote('code').trim();
            var isEmpty = content === '' || content === '<p><br></p>' || content === '<br>' || content === '<div><br></div>' || content.replace(/<[^>]*>/g, '').trim() === '';
            
            if(isEmpty){
                return false;
            }
            return true;

        }, 'Description field is required');
        
        $.validator.addMethod('isZeroTime', function (value, element) {
            return value == '00:00' ? false : true;
        }, 'Enter valid time entry');
    }

    $('#new-timesheet-form').validate({
        ignore: [],
        rules:{
            'project[]': {
                required: true,
            },
            'projectTask[]': {
                required: true,
            },
            'time[]': {
                isZeroTime: true,
                notGreaterThanAvailableTime : true,
                required: true,
            }, 'description[]': {
                summerNoteRequired: true,
                
            }, 'nonBillingValue[]': {
                required: true,
            }
        },
        highlight: function(element, errorClass, validClass) {
            $(element).addClass(errorClass).removeClass(validClass);
            $(element).parent('div').addClass('input-error').removeClass(validClass);
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).removeClass(errorClass).addClass(validClass);
            $(element).parent('div').removeClass('input-error').addClass(validClass);
        },
        errorPlacement: function (error, element) {
            if ($(element).parent('.input-group').length) {
                $(error).insertAfter($(element).parent()); // radio/checkbox
            } else if(element.attr('name') == 'description[]') {
                $(error).insertBefore($(element).parents('.timesheet-block').find('.description-error')); // for description error message
            } else if ($(element).hasClass('select2-hidden-accessible')) {
                $(error).insertAfter($(element).next('span'));  // select2
            } else {
                $(error).insertAfter($(element)); // default
            }
        },
        messages: {
            'project[]': {
                required: 'Project field is required',
            }, 'projectTask[]': {
                required: 'Task field is required',
            }, 'time[]': {
                required: 'Time field is required',
            }, 'description[]': {
                required: 'Description field is required',
            }
        },
    });

    function totalTimeValidate(){
        var totalFilledTime = 0;
        $('.EntryHrs').each(function(index, element) {
            var inputValue = $(element).val();
            if(isNaN(inputValue)){
                let  timeValue = inputValue.split(':');
                totalFilledTime += parseInt(timeValue[0]) * 60 + parseInt(timeValue[1]);
            }
        });
        
        let  avaiTimeValue = availTimeTotal.split(':');
        avaiTimeValue = parseInt(avaiTimeValue[0]) * 60 + parseInt(avaiTimeValue[1]);
        if(avaiTimeValue < totalFilledTime){
            $('#extraTimeEntryError').text('Your current total time entry is exceeds the available time.');
            return false;
        }else{
            $('#extraTimeEntryError').text('');
            return true;
        }
    }

    if(localStorage.getItem('timesheetSuccess')){
        successMessage(localStorage.getItem('timesheetSuccess'));
        localStorage.setItem('timesheetSuccess', '');
    }

    //save add timesheet form
    $(document).on('click','#saveTimesheet',function () {
        // validate total entry time should not exceeds the available time
        if(!totalTimeValidate()){
            return false;
        }

        if($('#new-timesheet-form').valid()) {
            $('#new-timesheet-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {

                    if(urlPath != '/timesheet/create'){
                        getTimesheetTableData();
                    }
                    if(urlPath == '/timesheet/create'){
                        if(response.status == 'error'){
                            $('.billable-error').remove();
                            let timesheetClass = [];
                            $.each(response.timesheetWithError, function(index, value) {
                                if (value.hasOwnProperty('availTime')) { // time entry
                                    timesheetClass.push('appendMainBlock_'+index);
                                    $('#appendMainBlock_'+index).prepend('<p class="text-danger billable-error fw-semibold">Billable hours cannot be submitted in this project as there are only '+ value.availTime +' hours available.</p>');
                                }
                                if (value.hasOwnProperty('project')) { // project
                                    $('#project-error_'+index).text(value.project);
                                }
                                if (value.hasOwnProperty('projectTask')) { // project task
                                    $('#projectTask-error_'+index).text(value.projectTask);
                                }
                                if (value.hasOwnProperty('times')) { // project billing type radio button
                                    $('#time-error_'+index).text(value.times);
                                }
                                if (value.hasOwnProperty('is_billable')) { // project billing type radio button
                                    $('#is_billable-error_'+index).text(value.is_billable);
                                }
                                if (value.hasOwnProperty('description')) { // description
                                    $('#description-error_'+index).text(value.description);
                                }
                            });

                            // Remove valid timesheet block
                            // $('.timesheet-block').each(function(index, element) {
                            //     var elementId = $(element).attr('id');
                            //     if($('#'+elementId).is(':visible') && !timesheetClass.includes(elementId)){
                            //         $('#'+elementId).closest('.single-block').remove();
                            //     }
                            // });

                            $('#AppToast').toast({ autohide: false });
                            errorMessage('A few timesheets have errors. Please correct them and submit again.');

                        }else if(response.status == 'success'){
                            localStorage.setItem('timesheetSuccess', 'Timesheet added successfully.');
                            location.reload();
                            $('#new-timesheet-form').validate().resetForm();
                            $('#description').summernote('reset');
                            $('#timesheetModal').modal('hide');
                        }
                    }
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        if(xhr.responseJSON.status == 'error' && xhr.responseJSON.message){
                            errorMessage(xhr.responseJSON.message);
                        }else{
                            var errors = xhr.responseJSON.errors;
                            var errorMsgs = '';
                            $.each(errors, function (field, error) {
                                var errorMsg = error.join(' ');
                                $('#extraTimeEntryError').text(errorMsg);
                            });
                        }
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('change', '#description', function(){
        $('#new-timesheet-form').validate().element('#description');
    });

    //view timesheet details page
    $(document).on('click', '.showTimesheet', function () {
        var showDataBody = $(document).find('#showData').find('#showDataBody');
        var html = '';
        var offcanvasEndLabel = $(document).find('#showData').find('#offcanvasEndLabel');
        $(offcanvasEndLabel).empty();
        $(showDataBody).empty();

        var checkClass = $(this).closest('tr').hasClass('pendingEntry');
        var projectName = $(this).closest('tr').find('.td-project-name').text();
        var task = $(this).closest('tr').find('.td-title').text();
        var description = $(this).closest('tr').find('.td-description').html();
        var billableType = $(this).closest('tr').find('.td-billableType').text();
        var time = $(this).closest('tr').find('.td-time').text();
        var billable = $(this).closest('tr').find('.td-billable').text();
        var date = $(this).closest('tr').find('.td-date').text().split(" ")[0];
        var approveRejectBy = $(this).closest('tr').find('.td-approveRejectBy').text();
        var status = $(this).closest('tr').find('.td-status').text();
        var employee = $(this).closest('tr').find('.td-employee').text();
        let billableValue = billable == 1 ? 'Yes' : 'No';
        var filledAt = $(this).closest('tr').find('.td-filled_at').text();

        $(offcanvasEndLabel).text('Timesheet Details');
        html += `<tr> <th>Employee: </th> <td>${employee}</td> </tr>
            <tr> <th>Project: </th> <td>${projectName}</td> </tr>
            <tr> <th>Task: </th> <td>${task}</td> </tr>
            <tr> <th>Description: </th> <td>${description}</td> </tr>
            <tr> <th>Date: </th> <td>${date}</td> </tr>
            <tr> <th>Filled At: </th> <td>${filledAt}</td> </tr>
            <tr> <th>Time: </th> <td>${time}</td> </tr>
            <tr> <th>Billable: </th> <td>${billableValue}</td> </tr>`;            
        if(status){
            html += `<tr> <th>${status} By: </th> <td>${approveRejectBy}</td> </tr>`;
        }
        if (billableValue == "No") {
            html += `<tr> <th>Non Billable Type:</th> <td>${billableType}</td> </tr>`;
        }

        if(checkClass){
            if($(this).hasClass('td-project-name')){
                var entryId = $(this).data('item-id');
            }else{
                var entryId = $(this).closest('label').data('item-id');
            }
            if((entryId && approvePermission == true) || ($(this).closest('tr').find('.pendingCheck').length > 0)){
                html += `<tr> <th class='align-middle'>Action:</th> <td>
                            <button type='button' data-id='${entryId}' data-class='approve' class='btn btn-success me-sm-3 me-1 mt-1 timesheet-approve-btn'>Approve</button>
                            <button type='button' data-id='${entryId}' data-class='reject' class='btn btn-danger me-sm-3 me-1 mt-1 timesheet-reject-btn'>Reject</button> </td>
                        </tr>`;
            }
        }
        $(showDataBody).html(html);
        $(showDataBody).show();
    });

    $(document).on('click', '.timesheet-approve-btn, .timesheet-reject-btn', function(){
        var actionName = $(this).data('class');
        var entryIds = [$(this).data('id')];

        let confirmText = 'Are you sure you want to '+actionName+'?';
        alert('Alert!', confirmText, 'text-danger')
            .then(function(result) {
                if (result) {
                    timeheetApproveReject(actionName, entryIds);
                }
        });
    });

    //ajax call delete timesheet
    $(document).on('click','.deleteTimesheet', function(){
        var id = $(this).data('item-id');
        alert('Alert!','Are you sure you want to delete this data?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url:  APP_URL+'/timesheet/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        successMessage(response.message);
                        getTimesheetTableData();
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    // Timesheet dropdown append if PROJECT BILLING TYPE is non-billable
    $(document).on('change', '.timesheetType', function (){
        var selectedOption = $(this).val();
        var nonBillableTypeOption = $(this).closest('.timesheet-block').find('.nonBillableTypeOption');
        selectedOption == 0 ? $(nonBillableTypeOption).show() : $(nonBillableTypeOption).hide();
    });

    $(document).on('change', '.editTimesheetType', function (){
        var selectedOption = $(this).val();
        if(selectedOption == 0){
            $('.nonBillableTypeOption').show();
        }else{
            $('.nonBillableTypeOption').hide();
        }
    });

    $(document).on('click', '#addTimesheet', function(){
        document.location.href = '/timesheet/create';
    });

    var timesheetCount = 1;
    $(document).on('click', '.add-new-timesheet', function(){
        var timesheetHtml = $('#append-timesheet').html();
        timesheetHtml = timesheetHtml.replace(/_0/g, '_' + timesheetCount);
        timesheetHtml = timesheetHtml.replace('appendMainBlock-00', 'appendMainBlock_' + timesheetCount);
        timesheetHtml = timesheetHtml.replace(/name="is_billable\[]"/g, 'name="is_billable[' + timesheetCount + ']"');

        $('.timesheet-parent').append(timesheetHtml);
        $('.timesheet-parent .project:last, .timesheet-parent .nonBillingValue:last').select2();
        var timeInput = $(".timesheet-parent").find('#EntryHrs_'+timesheetCount);
        initializeTimepicker(timeInput, setTimeHrs, setTimeHH, setTimeMM);
        editorTextarea($(".timesheet-parent").find('#description_'+timesheetCount));

        $(timeInput).rules('add', {
            required: true,
            notGreaterThanAvailableTime : true,
            isZeroTime: true,
        });

        $('.billableOption_' + timesheetCount).show();
        $('#billable_' + timesheetCount).prop('checked', true);
        $('#non_billable_' + timesheetCount).prop('checked', false);
        $('.nbTypeOption_0' + timesheetCount).hide();

        timesheetCount++;
    });

    $(document).on('change', '.project, .projectTask, .EntryHrs, .description', function(){
        $(this).valid();
    });

    $(document).on('focusout', '#timesheetModal .note-editable', function(){
        $(this).parents('.timesheetDesc').find('.description').valid();
    });

    $(document).on('click', '.remove-added-timesheet', function(){
        $(this).parents('.single-block').remove();
    });

    editorTextarea('#description_0');
    function editorTextarea(element){
        $(element).summernote({
            height: 130,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'clear']],
                ['para', ['ul', 'ol']],
                ['color', ['color']],
                ['view', ['codeview']]
            ],
            pastePlain: true,
            callbacks: {
                // callback for pasting text only (no formatting)
                onPaste: function (e) {
                    var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                    e.preventDefault();
                    bufferText = bufferText.replace(/\r?\n/g, '<br>');
                    document.execCommand('insertHtml', false, bufferText);
                }
            }
        });
    }
    
    function initializeTimepicker(element, setTimeHrs, setTimeHH, setTimeMM) {
        $(element).timepicker({
            showPeriodLabels: false,
        });
        $(element).timepicker('setTime', setTimeHrs);
        $(element).timepicker('option', {
            maxTime: { hour: setTimeHH, minute: setTimeMM }
        });
        $('#extraTimeEntryError').text('');
    }

    $(document).on('change', '.EntryHrs', function(){
        totalTimeValidate();
    });

    let url = new URL(window.location.href);
    if (url.searchParams.has('filter')) {
        url.searchParams.delete('filter');
        window.history.replaceState(null, '', url.href);
        setTimeout(function() {
            $('.nav-link[data-bs-target="#rejectedTimesheetDiv"]').click();
        }, 1000);
    }

    function timeEntryTimePickerChange(){
        // $('.EntryHrs').timepicker({showPeriodLabels: false,});
        // $('.EntryHrs').timepicker('setTime', '02:00');
        // $('.EntryHrs').timepicker('option', {
        //     maxTime: { hour: '02', minute: '00' }
        // });

        // var HHMM = $('.timeSlo').find(':selected').attr('data-timediff');
        // if(HHMM != undefined){
        //     var HHMMArray = HHMM.split(':');
        //     $('.EntryHrs').timepicker('setTime',HHMM);
        //     $('.EntryHrs').timepicker({ maxTime: '02:00' });

        //     $('.EntryHrs').timepicker('option', { 
        //         maxTime: { hour: HHMMArray[0], minute: HHMMArray[1]}
        //     });
        // }

        // $(document).on('change','.timeSlot',function(){
        //     $('.EntryHrs').timepicker({showPeriodLabels: false,});
        //     var HHMM = $(this).find(':selected').attr('data-timediff');
        //     if(HHMM != undefined){          
        //         var HHMMArray=HHMM.split(':');               
        //         $('.EntryHrs').timepicker('setTime',HHMM);
        //         $('.EntryHrs').timepicker('option', { maxTime: { hour: HHMMArray[0], minute: HHMMArray[1]} });
        //     }
        //     $('#availableTime').val(HHMM);
        // });

        // $('.timeSlot').trigger('change');

        // $('.select2').select2();
    }
});