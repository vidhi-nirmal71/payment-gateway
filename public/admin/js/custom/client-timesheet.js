$(document).ready(function () {
    var currentDate = new Date().toISOString().split('T')[0];
    var requestPage = 1;
    var filterText = '';
    var dateFilter = {};
    var filterFormText = '';
    var dateFormFilter = {};
    filterLabelChange();

    $('#ctProjectFilter, #projectClientFilter, #clientTimesheetUserFilter').select2();

    //Pagination Functionality
    $(document).on('click', '.btnClick', function () {
        requestedTable = $(this).parents('table').attr('id');
        requestPage = $(this).attr('data-page');

        if(requestedTable == 'clientTimesheetTable'){
            getClientTimesheetTableData();
        }else if(requestedTable == 'filterTSTable'){
            getFilterTimesheetTableData();
        }else if(requestedTable =='filledClientTimesheetTable'){
            getFilledClientTimesheetTableData();
        }
    });
    //Client Timesheet functionalities
    getClientTimesheetTableData();

    function fetchEmployeesForProject() {
        let projectId = $('#ctProjectFilter').val();

        if (projectId) {
            $.ajax({
                url: APP_URL + '/fetch/client-timesheet/user',
                type: 'GET',
                data: {project_id: projectId},
                success: function (res) {
                    if (res.length == 0) {  
                        $('#clientTimesheetUserFilter').html('');
                        $('#clientTimesheetUserFilter').append('<option value="">No Employee Found</option>');              
                    }else{
                        $('#clientTimesheetUserFilter').empty();
                        $('#clientTimesheetUserFilter').append('<option value="">Select Employee</option>');

                        $.each(res, function (key, value) {
                            var ctname = value.alias_name ? `${value.alias_name} (${value.name.trim()})` : value.name.trim();
                            $('#clientTimesheetUserFilter').append(
                                $('<option>', {
                                    value: key,
                                    text: ctname
                                })
                            );
                        });

                        $('.ct-user-filter-data').show();
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                }
            });
        }
    }

    //Fetch project list for client timesheet Filter
    function projectList()
    {
        let filterClient = $('#projectClientFilter').length ? $('#projectClientFilter').val() : null;
        if (filterClient && filterClient !== '') {
            $.ajax({
                url: APP_URL+'/client/projects/list',
                type: 'GET',
                data: {
                    filterClient: filterClient
                },
                success: function (res) {
                    if (res.projects.length == 0) {  
                        $('#ctProjectFilter').html('');
                        $('#ctProjectFilter').append('<option value="">No Project Found</option>');              
                    }else{
                        $('#ctProjectFilter').empty();
                        $('#ctProjectFilter').html('<option value="">Select Project</option>');
                        $.each(res.projects, function (index, item) {
                            var option = $('<option>').text(item.name).val(item.id);
                            $('#ctProjectFilter').append(option);
                        });
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        } else {
            $('#ctProjectFilter').html('');
            $('.ct-user-filter-data').hide();
        }
    }

    // Duration filter dropdown change
    $('#durationFilter li').on('click', function(){
        let selector = $(this).children();
        filterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        filterLabelChange();
        
        if(filterText != 'date'){
            hideFilterDatesBlock();
            getClientTimesheetTableData();
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
        $('#filterCtBlock').hide();
    }

    function showFilterDatesBlock(){
        $('#startDateBlock').show();
        $('#endDateBlock').show();
        $('#filterCtBlock').show();
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
            enableSubmitBtn('#filterCtData');
        }else{
            $('#filterCtData').attr('disabled', true);
        }
    });

    $('#filterCtData').on('click', function(){
        disableSubmitBtn('#filterCtData');
        dateFilter['startDate'] = $('#filterStartDate').val();
        dateFilter['endDate'] = $('#filterEndtDate').val();
        getClientTimesheetTableData();
    });

    $('#projectClientFilter').on('change', function() {
        if ($(this).val() === '') {
            $('.ct-project-filter-data').hide();
            $('.ct-user-filter-data').hide();
        } else {
            $('.ct-project-filter-data').show();
            projectList();
        }

        setTimeout(() => {
            getClientTimesheetTableData();
        }, 100);
    });

    $('#ctProjectFilter').on('change', function() {
        if ($(this).val() !== '') {
            fetchEmployeesForProject();
            $('.ct-user-filter-data').show();
            $('.exportPdfCsvDiv').show();
        } else {
            $('#clientTimesheetUserFilter').html('');
            $('.ct-user-filter-data').hide();
            $('.exportPdfCsvDiv').hide();
        }

        setTimeout(() => {
            getClientTimesheetTableData();
        }, 100);
    });

    $('#clientTimesheetUserFilter').on('change', function() {
        setTimeout(() => {
            getClientTimesheetTableData();
        }, 100);
    });

    //Fetch filter timesheet for client timesheet form
    var filterTimesheetAjaxProgress = false;
    function getFilterTimesheetTableData() {
        if (!filterTimesheetAjaxProgress) {
            filterTimesheetAjaxProgress = true;

            let projectId = $('#ctProjectId').length ? $('#ctProjectId').val() : null;
            if(filterFormText != 'today'){
                $('#resetCtFormBlock').show();
            }else{
                $('#resetCtFormBlock').hide();
            }
            // Adding loader to timesheet list table
            $('#timesheetTable').append(loading());

            if(filterFormText != '' && projectId){
                $.ajax({
                    url: APP_URL+'/project-client-timesheet/timesheet/data',
                    type: "GET",
                    data: {
                        page: requestPage,
                        project: projectId,
                        filter: filterFormText,
                        dateFilter: dateFormFilter,
                    },
                    success: function (res) {
                        var opentimesheetDetails = $('#dataActiveswitch').is(':checked') == true ? 'display: contents' : 'display: none;';
    
                        if(res.data && res.data?.data.length > 0){
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="filterTSTable"> <thead> <tr>
                                        <th width="18%">Project</th>
                                        <th width="7%">Type</th>
                                        <th width="30%">Task</th>
                                        <th width="15%">Employee</th>
                                        <th width="10%">Date</th>
                                        <th width="10%">Time</th>
                                        <th width="10%">Action</th>
                                        </tr> </thead> <tbody id="pending-timesheet-table-body">`;
    
                            let totalTimeInSeconds = 0;
                            let num = res.data.st;
    
                            $.each(res.data.data, function (k, v) {
                                tc += '<tr>';
                                tc += '<td class="td-project-name" title="'+v.project+'" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'">'+  sliceText(v.project, 30) +'</td>';
                                tc += '<td class="" title="'+(v.billable == 1 ? 'Billable' : 'Non-Billable')+'">'+ (v.billable == 1 ? 'B' : 'NB') +'</td>';
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                tc += '<td class="tblDiscription text-wrap" title="'+v.task+'">' + sliceText(v.task, 30) + '</br> <span class="formTblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-employee">'+v.emp+'</td>';
                                tc += '<td class="td-date">'+v.date+'</td>';
                                tc += '<td class="td-time">'+v.time+'</td>';
                                tc += '<td class="d-none td-title">'+v.task+'</td>';
                                tc += '<td class="d-none td-billable">'+v.billable+'</td>';
                                tc += '<td class="d-none td-billableType">'+v.billableType+'</td>';
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                tc += '<td class="d-none td-description">'+sanitizedString+'</td>';
                                tc += '<td class="d-none td-approveRejectBy">'+v.approveRejectBy+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '<td class="d-none td-status">Approved</td>';
                                tc += '<td>';
                                tc += '<label title="Copy Timesheet Details" class="copyTimesheetDetails cursor-pointer" data-id-data-emp="'+ v.dataIdEmp +'" data-task="'+v.task +'" data-details="'+ v.description +'"> <span class="text-primary cursor"><i class="bx bx-copy me-1"></i></span> </label>';
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
                            if(res.data.morePage) { tc += makePagination(res.data.button); }
                            tc += '</table>';
                            $('#timesheetTable').html(tc);
                            var prevLink = $('#filterTSTable a.prev');
                            var nextLink = $('#filterTSTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                            $('#timesheetTable #loading').remove();
                            $('#detailTimesheetSwitchDiv').show();
                        }else{
                            $('#timesheetTable #loading').remove();
                            $('#detailTimesheetSwitchDiv').hide();
                            $('#timesheetTable').html('<h6 class="font-20 mb-0 text-light text-center pb-5">No data found</h6>');
                        }
    
                        requestPage = 1;
                        filterTimesheetAjaxProgress = false;
                    },
                    error: function (xhr, status, error) {
                        filterTimesheetAjaxProgress = false;
                        console.log(error);
                    },
                });
            }
        }
    }

    var filledClientTimesheetAjaxProgress = false;
    function getFilledClientTimesheetTableData() {
        if (!filledClientTimesheetAjaxProgress) {
            filledClientTimesheetAjaxProgress = true;

            let projectId = $('#ctProjectId').length ? $('#ctProjectId').val() : null;

            if(filterFormText != 'today'){
                $('#resetCtFormBlock').show();
            }else{
                $('#resetCtFormBlock').hide();
            }

            // Adding loader to timesheet list table
            $('#filledClientTimesheetTable').append(loading());

            if(filterFormText != '' && projectId){
                $.ajax({
                    url: APP_URL+'/project-client-timesheet/fetch',
                    type: "GET",
                    data: {
                        page: requestPage,
                        isForm: true,
                        project: projectId,
                        filter: filterFormText,
                        dateFilter: dateFormFilter,
                    },
                    success: function (res) {
                        var opentimesheetDetails = $('#ctFormDataActiveswitch').is(':checked') == true ? 'display: contents' : 'display: none;';
                        if(res.data && res.data?.data.length > 0){
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="filledClientTimesheetTable"> <thead> <tr>
                                        <th width="40%">Task</th>
                                        <th width="20%">Project</th>
                                        <th width="10%">Name</th>
                                        <th width="15%">Date</th>
                                        <th width="15%">Time</th>
                                        </tr> </thead> <tbody id="client-timesheet-table-body">`;
    
                            let totalTimeInSeconds = 0;
                            let num = res.data.st;
    
                            $.each(res.data.data, function (k, v) {
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                
                                tc += '<tr>';
                                tc += '<td class="tblDiscription text-wrap" title="'+v.task+'">' + sliceText(v.task, 50) + '</br> <span class="formCTTblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-projectName">'+v.project_name+'</td>';
                                tc += '<td class="td-name">'+v.aliasName+'</td>';
                                tc += '<td class="td-date">'+v.date+'</td>';
                                tc += '<td class="td-time">'+v.time+'</td>';
                                tc += '<td class="d-none td-task">'+v.task+'</td>';
                                tc += '<td class="d-none td-projectName">'+v.project_name+'</td>';
                                tc += '<td class="d-none td-description">'+v.description+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '</tr>';
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
                            if(res.data.morePage) { tc += makePagination(res.data.button); }
                            tc += '</table>';
                            $('#filledClientTimesheetTable').html(tc);
                            var prevLink = $('#filledClientTimesheetTable a.prev');
                            var nextLink = $('#filledClientTimesheetTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                            $('#filledClientTimesheetTable #loading').remove();
                            $('#detailFilledCTTimesheetSwitchDiv').show();
                        }else{
                            $('#filledClientTimesheetTable #loading').remove();
                            $('#detailFilledCTTimesheetSwitchDiv').hide();
                            $('#filledClientTimesheetTable').html('<h6 class="font-20 mb-0 text-light text-center pb-5">No data found</h6>');
                        }
    
                        requestPage = 1;
                        filledClientTimesheetAjaxProgress = false;
                    },
                    error: function (xhr, status, error) {
                        filledClientTimesheetAjaxProgress = false;
                        console.log(error);
                    },
                });
            }
        }
    }

    //Fetch client timesheet table data
    var clientTimesheetAjaxProgress = false;
    function getClientTimesheetTableData() {
        if (!clientTimesheetAjaxProgress) {
            clientTimesheetAjaxProgress = true;

            let filterProject = $('#ctProjectFilter').length ? $('#ctProjectFilter').val() : null;
            let filterEmp = $('#clientTimesheetUserFilter').length ? $('#clientTimesheetUserFilter').val() : null;
            let filterClient = $('#projectClientFilter').length ? $('#projectClientFilter').val() : null;

            if(filterText != 'this_month' || filterProject || filterEmp || filterClient){
                $('#resetCtBlock').show();
            }else{
                $('#resetCtBlock').hide();
            }

            // Adding loader to timesheet list table
            $('#cTTable').append(loading());

            $.ajax({
                url: APP_URL+'/project-client-timesheet/fetch',
                type: "GET",
                data: {
                    page: requestPage,
                    project: filterProject,
                    filterEmp: filterEmp,
                    filterClient: filterClient,
                    filter: filterText,
                    dateFilter: dateFilter,
                    bucketId: bucketId,
                },
                success: function (res) {
                    var opentimesheetDetails = $('#activeswitch').is(':checked') == true ? 'display: contents' : 'display: none;';
                    $('#filterCtData').removeClass('sending');
                    if(res.data && res.data?.data.length > 0){
                        $('.ctTotalHours').text(res.data.totalTime);
                        let tc = `<table class="table tablecontentcss table-hover table-striped" id="clientTimesheetTable"> <thead> <tr>
                                    <th width="250px">Project</th>
                                    <th>Task</th>
                                    <th width="170px">Name</th>
                                    <th width="170px">Filled By</th>
                                    <th width="110px">Date</th>
                                    <th width="90px">Time</th>
                                    <th width="100px" class="text-center">Action</th>
                                    </tr> </thead> <tbody id="client-timesheet-table-body">`;

                        let totalTimeInSeconds = 0;
                        let num = res.data.st;

                        $.each(res.data.data, function (k, v) {
                            var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                            sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                            
                            tc += '<tr>';
                            tc += '<td class="showclientTimesheet cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="'+v.project_name+'"><span class="text-primary">' + sliceText(v.project_name, 30) + '</td>';
                            tc += '<td class="ctTblDiscription text-wrap" title="'+v.task+'"><span>' + sliceText(v.task, 70) + '</span></br> <span class="tblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                            tc += '<td class="td-name">' + sliceText(v.aliasName, 50) + '</td>';
                            tc += '<td class="td-filledBy">'+v.createdBy+'</td>';
                            tc += '<td class="td-date">'+v.date+'</td>';
                            tc += '<td class="td-time">'+v.time+'</td>';
                            tc += '<td class="d-none td-task">'+v.task+'</td>';
                            tc += '<td class="d-none td-projectName">'+v.project_name+'</td>';
                            tc += '<td class="d-none td-description">'+v.description+'</td>';
                            tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                            tc += '<td class="text-end">';

                            if (v.is_escalated == 1) {
                                tc += '<label title="Escalated Timesheet"><span class="text-danger"><i class="bx bxs-flag-alt me-1"></i></span></label>';
                            }

                            tc += '<label class="showclientTimesheet cursor-pointer clickOnRmnr" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">';
                            tc += '<span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>'
                            if(v.canDelete){
                                tc += '<label onclick="setFocusOnFirstInput(\'#clientTimesheetModal\')" class="editClientTimesheetRecord cursor-pointer" data-item-id="'+v.id+'" data-item-edit-project-id="'+v.projectId+'"> <span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>';
                                tc += '<label class="deleteClientTimesheet cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'">';
                                tc += '<span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
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
                        if(res.data.morePage) { tc += makePagination(res.data.button); }
                        tc += '</table>';
                        $('#cTTable').html(tc);
                        var prevLink = $('#clientTimesheetTable a.prev');
                        var nextLink = $('#clientTimesheetTable a.next');
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

                    if(res.data && res.data?.data.length > 0 && filterClient != '' && filterClient != null){
                        // Enable button and update title of email
                        $('.emailTimesheet').prop('disabled', false);
                        $('.email-btn-wrapper').attr('title', 'Send email');
                      
                    }else{
                        // Disable button and update title of email
                        $('.emailTimesheet').prop('disabled', true);
                        $('.email-btn-wrapper').attr('title', 'Select client first to send an email');
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

    // Show timesheet description below task
    $(document).on('change', '#activeswitch, #dataActiveswitch, #ctFormDataActiveswitch', function() {
        let targetClass = $(this).data('target');
        if ($(this).is(':checked')) {
            $(targetClass).show();
        } else {
            $(targetClass).hide();
        }
    });

    $(document).on("click", ".copyTimesheetDetails", function() {
        var description = $(this).data("details").trim();
        var task = $(this).data("task").trim();
        var empId = $(this).data("idDataEmp");
        var existingContent = $('#ct_description').summernote('code').trim();
        var existingTask = $('#ctTask').val().trim();

        var formattedContent;
        if(existingContent != '<div><br></div>'){
            formattedContent = existingContent + '<br>' + description;
        }else{
            formattedContent = description;
        }
        
        $('#ct_description').summernote('code', formattedContent);
        if (existingTask === '') {
            $('#ctTask').val(task);
        }

        // Find the encrypted value in the dropdown using the plain ID
        var encryptedVal = $('#teamCtData option').filter(function () {
            return $(this).data('id-data') == empId;
        }).val();

        if (encryptedVal) {
            $('#teamCtData').val(encryptedVal).trigger('change');
        }
    });

    //Add Client Timesheet
    $(document).on('click', '.clientTimesheetFromButton', function() {
        fetchClientTimesheetCreateEditForm({}, 'Add Client Timesheet')
    });

    //Edit Client TImesheet Details
    $(document).on('click', '.editClientTimesheetRecord', function(){
        $('.hoursMessage').remove();
        var editEntryId = $(this).data('item-id');
        var projectId = $(this).data('item-edit-project-id');

        payload = {editId : editEntryId, projectId : projectId};
        fetchClientTimesheetCreateEditForm(payload, 'Edit Client Timesheet')
    });

    //Common function for the create and edit form of client timesheet
    function fetchClientTimesheetCreateEditForm(payload, title){
        $.ajax({
            url: APP_URL+'/project-client-timesheet/create-edit',
            type: 'GET',
            data: payload,
            success: function (response) {
                if(response.data){
                    $('.modal-title').html(title);
                    $('#client-timesheet-body').html(response.data);
                    $('#ct_description').summernote({
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
                                if(!$('#description').summernote('isEmpty')){
                                    $('#description-error').hide()
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
                    });
                    filterCtFormLabelChange();

                    $('#teamCtData').select2({
                        width: '100%',
                        dropdownParent: $('#clientTimesheetModal .modal-body')
                    });

                    var ctTime = response.formData?.time ?? '00:00';
                    initializeTimepicker($('#TimesheetEntryHrs'), ctTime, 23, 55);

                    $('#ctProjectName').val(response.formData.project_name);
                    // $('#crProjectId').val(projectId);
                   
                    if(response.formData.length != 0){
                        $('#crEditId').val(response.formData.id);
                        $('#crProjectId').val(response.formData.projectId);
                        $('#ctTask').val(response.formData.task);
                        $('#ctDate').val(response.formData.date);
                        $('#ct_description').summernote('code', response.formData.description);
                        $('#ctProjectId').val(response.formData.projectId);
                    }else{
                        $('#ctDate').val(currentDate);
                    }
                    getFilterTimesheetTableData();
                    getFilledClientTimesheetTableData();
                    
                    if(! isCurrentOrFutureMonth($('#ctDate').val())){
                        const message = 'This is a past month\'s record - make sure hours are managed in the "Hours" tab.';
                        $('#appendMainBlock').prepend(`<p class="text-danger hoursMessage">${message}</p>`);
                    }
                }else{
                    errorMessage('Something went wrong!');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    // Save Client Timesheet
    $(document).on('click', '#saveClientTimesheet', function() {
        $.validator.addMethod('summerNoteRequired', function (value, element) {
            var content = $(element).summernote('code').trim();
            var isEmpty = content === '' || content === '<p><br></p>' || content === '<br>' || content === '<div><br></div>' || content.replace(/<[^>]*>/g, '').trim() === '';
            
            if(isEmpty){
                return false;
            }
            return true;
        }, 'Description field is required');

        $.validator.addMethod('nonZeroTime', function(value, element) {
            return value !== '00:00';
        }, 'Time entry cannot be 00:00');        

        let rules = {
            projectName: { required: true },
            task: { required: true, maxlength: 255 },
            time: { required: true, nonZeroTime: true},
            description: { summerNoteRequired: true },
        };
    
        if ($('#teamCtData').length > 0) {
            rules['teamCtData'] = { required: true };
        }

        $('#new-client-timesheet-form').validate({
            ignore: [],
            rules: rules,
            
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
                } else if(element.attr('name') == 'description') {
                    $(error).insertBefore($('#ct_description-error')); // for description error message
                } else if (element.attr('name') === 'teamCtData') {
                    $('#teamCtData-error').html(error);
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
            messages: {
                projectName: { required: 'The Project field is required' },
                task: { required: 'The Task field is required', maxlength: 'The task must not be greater than 255 characters.' },
                time: { required: 'The Time field is required', nonZeroTime: 'Please enter a valid time (not 00:00)' },
                description: { required: 'The Description field is required'},
                teamCtData: { required: 'The Employee field is required' },
            },
        });

        if($('#new-client-timesheet-form').valid()) {
            disableSubmitBtn('#saveClientTimesheet');
            $('#new-client-timesheet-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-client-timesheet-form').validate().resetForm();
                    $('#clientTimesheetModal').modal('hide');
                    getClientTimesheetTableData();
                    enableSubmitBtn('#saveClientTimesheet');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveClientForm');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;

                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    }else {
                        console.log(xhr);
                    }
                },
            });
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
        var name = $(this).closest('tr').find('.td-name').text();
        var task = $(this).closest('tr').find('.td-task').text();
        var description = $(this).closest('tr').find('.td-description').html();
        var time = $(this).closest('tr').find('.td-time').text();
        var date = $(this).closest('tr').find('.td-date').text();
        var filledAt = $(this).closest('tr').find('.td-filled_at').text();
        var filledBy = $(this).closest('tr').find('.td-filledBy').text();

        $(offcanvasEndLabel).text('Client Timesheet Details');
        html += `<tr> <th>Project: </th> <td>${projectName}</td> </tr>
            <tr> <th>Task: </th> <td>${task}</td> </tr>
            <tr> <th>Name: </th> <td>${name}</td> </tr>
            <tr> <th>Date: </th> <td>${date}</td> </tr>
            <tr> <th>Time: </th> <td>${time}</td> </tr>
            <tr> <th>Filled By: </th> <td>${filledBy}</td> </tr>
            <tr> <th>Filled At: </th> <td>${filledAt}</td> </tr>
            <tr> <th>Description: </th> <td>${description}</td> </tr>`;
        $(showDataBody).html(html);
        $(showDataBody).show();
    });

    //Delete Client Timesheet
    $(document).on('click','.deleteClientTimesheet', function(){
        var id = $(this).data('item-id');
        var date = $(this).closest('tr').find('.td-date').text();
        var message = 'Are you sure you want to delete this data?';
        if(!isCurrentOrFutureMonth(date)){
            message += '<br> This is a past month\'s record - make sure hours are managed in "Hours" Tab.';
        }

        alert('Alert!', message, 'text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/project-client-timesheet/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        getClientTimesheetTableData();
                        successMessage(response.message);
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

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

    $(document).on('change', '#activeswitch', function() {
        if ($(this).is(':checked')) {
            $('.ctTblDetailDesc').show();
        } else {
            $('.ctTblDetailDesc').hide();
        }
    });

    //Download the pdf or doc
    // CSV Download
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
        let filterProject = $('#ctProjectFilter').length ? $('#ctProjectFilter').val() : null;
        let filterEmp = $('#clientTimesheetUserFilter').length ? $('#clientTimesheetUserFilter').val() : null;
        let filterClient = $('#projectClientFilter').length ? $('#projectClientFilter').val() : null;

        $.ajax({
            url: APP_URL+ "/project-client-timesheet/export",
            type: "GET",
            data: { fileType: type,
                project: filterProject,
                filterEmp: filterEmp,
                filterClient: filterClient,
                filter: filterText,
                dateFilter: dateFilter,
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

    // Set min date for filter start date
    // $(document).on('change', '#filterCtStartDate', function(){
    //     let startDate = $('#filterCtStartDate').val();
    //     if(startDate){
    //         // let selectedDate = new Date(startDate);
    //         // selectedDate = new Date(selectedDate.getTime() + ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
    //         $('#filterCtEndtDate').attr({'min': startDate});
    //     }else{
    //         $('#filterCtEndtDate').attr({'min': ''});
    //     }
    // });

    // // Set max date for filter end date
    // $(document).on('change', '#filterCtEndtDate', function(){
    //     let endDate = $('#filterCtEndtDate').val();
    //     if(endDate){
    //         let selectedDate = new Date(endDate);
    //         selectedDate = new Date(selectedDate.getTime() - ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
    //         $('#filterCtStartDate').attr({'max': selectedDate});
    //     }else{
    //         $('#filterCtStartDate').attr({'max': ''});
    //     }
    // });

    // Enable disable Timesheet filter button
    // $('.date-input').on('change', function(e){
    //     if( $('#filterCtStartDate').val() || $('#filterCtEndtDate').val()){
    //         enableSubmitBtn('#filterCtData');
    //     }else{
    //         $('#filterCtData').attr('disabled', true);
    //     }
    // });

    $(document).on('click', '#filterCtData', function() {
        getClientTimesheetTableData();
    });

    $(document).on('click', '#resetCtAll', function() {
        $('#filterStartDate').val("").attr({'max': ''});
        $('#filterEndtDate').val("").attr({'min': ''});
        $('#ctProjectFilter').html('').val(null).trigger('change');
        $('#clientTimesheetUserFilter').html('').val(null).trigger('change.select2');
        $('#projectClientFilter').val(null).trigger('change.select2');
        $('.ct-project-filter-data').hide();
        $('.ct-user-filter-data').hide();
        $('#filterCtData').attr('disabled', true);
        let selector = $('#durationFilter .dropdown-item[data-id="this_month"]');
        filterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        hideFilterDatesBlock();
        filterLabelChange();
        requestPage = 1;
        setTimeout(() => {
            getClientTimesheetTableData();
        }, 100);
    });

    // Duration Form filter dropdown change
    $(document).on('click', '#durationFormFilter li', function(){
        let selector = $(this).children();
        filterFormText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        filterCtFormLabelChange();

        if(filterFormText != 'date'){
            hideCtFormFilterDatesBlock();
            getFilterTimesheetTableData();
            getFilledClientTimesheetTableData();
        }else if(filterFormText == 'date'){
            showCtFormFilterDatesBlock();
        }
    });

    function filterCtFormLabelChange(){
        let filterSelector = $('#durationFormFilter .dropdown-item.active');
        filterFormText = $(filterSelector).attr('data-id');
        let activeText = $(filterSelector).text().trim();
        $('#filter-ct-form-text').text(activeText);
    }

    function hideCtFormFilterDatesBlock(){
        $('#startDateCtFormBlock').hide();
        $('#endDateCtFormBlock').hide();
        $('#filterCtFormBlock').hide();
    }

    function showCtFormFilterDatesBlock(){
        $('#startDateCtFormBlock').show();
        $('#endDateCtFormBlock').show();
        $('#filterCtFormBlock').show();
    }

    // Set min date for filter end date
    $(document).on('change', '#filterFormStartDateCt', function () {
        let startDate = $('#filterFormStartDateCt').val();
        $('#filterFormEndtDateCt').attr('min', startDate || '');
    });

    // Set max date for filter start date
    $(document).on('change', '#filterFormEndtDateCt', function () {
        let endDate = $('#filterFormEndtDateCt').val();
        $('#filterFormStartDateCt').attr('max', endDate || '');
    });

    // Enable disable Timesheet filter button
    $(document).on('change','.form-date-input', function(e){
        if( $('#filterFormStartDateCt').val() && $('#filterFormEndtDateCt').val()){
            enableSubmitBtn('#filterCtFormData');
        }else{
            $('#filterCtFormData').attr('disabled', true);
        }
    });

    $(document).on('click','#filterCtFormData', function(){
        disableSubmitBtn('#filterCtFormData');
        dateFormFilter['startDate'] = $('#filterFormStartDateCt').val();
        dateFormFilter['endDate'] = $('#filterFormEndtDateCt').val();
        setTimeout(() => {
            getFilterTimesheetTableData();
            getFilledClientTimesheetTableData();
        }, 100);
        $('#filterCtFormData').removeClass('sending');
    });

    $(document).on('click', '#resetCtFormAll', function() {
        $('#filterFormStartDateCt').val("").attr({'max': ''});
        $('#filterFormEndtDateCt').val("").attr({'min': ''});
        $('#filterCtFormData').attr('disabled', true);
        let selector = $('#durationFormFilter .dropdown-item[data-id="today"]');
        filterFormText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        hideCtFormFilterDatesBlock();
        filterCtFormLabelChange();
        requestPage = 1;
        setTimeout(() => {
            getFilterTimesheetTableData();
            getFilledClientTimesheetTableData();
        }, 100);
    });

    let tagifyTo = null;
    let tagifyCc = null;

    // on the click email set the subject/body default
    $(document).on('click', '.emailTimesheet', function () {
        let filterProject = $('#ctProjectFilter').length ? $('#ctProjectFilter').val() : null;
        let filterEmp = $('#clientTimesheetUserFilter').length ? $('#clientTimesheetUserFilter').val() : null;
        let filterClient = $('#projectClientFilter').length ? $('#projectClientFilter').val() : null;

        if(filterClient != '') {
            $.ajax({
                url: APP_URL + '/project-client-timesheet/email/form',
                type: 'GET',
                data: {
                    project: filterProject,
                    filterEmp: filterEmp,
                    filterClient: filterClient,
                    filter: filterText,
                    dateFilter: dateFilter,
                },
                success: function (resp) {
                    if (resp.success) {
                        $('#emailTimesheetModal .modal-body').html(resp.data);
                        // Initialize tagify
                        tagifyTo = initTagify('#emailTo', '#emailTo-error', true);
                        tagifyCc = initTagify('#emailCc', '#emailCc-error');
                        $('#emailTimesheetModal').modal('show');
                    } else {
                        console.log(resp.message || 'Unable to load form.');
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        }else{
            errorMessage('Please select a client to send an email.');
        }
    });

    $(document).on('click', '#submitEmailTimesheet', function(){
        let filterProject = $('#ctProjectFilter').length ? $('#ctProjectFilter').val() : null;
        let filterEmp = $('#clientTimesheetUserFilter').length ? $('#clientTimesheetUserFilter').val() : null;
        let filterClient = $('#projectClientFilter').length ? $('#projectClientFilter').val() : null;

        const isToValid = validateTagifyEmails(tagifyTo, '#emailTo-error', true);
        const isCcValid = validateTagifyEmails(tagifyCc, '#emailCc-error', false);

        if (!isToValid || !isCcValid) {
            return;
        }

        $('#newEmailTimesheetForm').validate({
            rules:{
                'subject': { required: true },
                'emailBody': { required: true},
            },
            messages: {
                subject: { required: 'Subject field is required',  maxlength: 'The subject must not be greater than 255 characters.'},
                emailBody: { required: 'Body field is required'},
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
                    $(error).insertAfter($(element).parent());     // radio/checkbox
                }else if ($(element).hasClass('select2-hidden-accessible')) {
					$(error).insertAfter($(element).next('span'));  // select2
				} else {
                    $(error).insertAfter($(element));               // default
                }
            },
        });

        if ($('#newEmailTimesheetForm').valid()) {
            disableSubmitBtn('#submitEmailTimesheet');

            $('#emailTo, #emailCc').removeAttr('name');
            const toEmails = tagifyTo.value.map(tag => tag.value);
            const ccEmails = tagifyCc.value.map(tag => tag.value);

            $('#newEmailTimesheetForm').ajaxSubmit({
                data: {
                    project: filterProject,
                    filterEmp: filterEmp,
                    filterClient: filterClient,
                    filter: filterText,
                    dateFilter: dateFilter,
                    to: toEmails,
                    cc: ccEmails,
                },
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#emailSubject').text('');
                    $('#emailBody').text('');
                    $('.newRowAppended').empty();
                    $('#newEmailTimesheetForm').validate().resetForm();
                    $('#emailTimesheetModal').modal('hide');
                    enableSubmitBtn('#submitEmailTimesheet');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    console.log('xhr: ', xhr);
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;

                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });
});
