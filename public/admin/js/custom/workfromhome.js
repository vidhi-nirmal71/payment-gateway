$(document).ready(function () {
    // Disable past dates for start date field
    var today = new Date();
    var day = ("0" + today.getDate()).slice(-2);
    var month = ("0" + (today.getMonth() + 1)).slice(-2);
    var year = today.getFullYear();
    var formattedDate = year + "-" + month + "-" + day;
    $('#start_date').attr('min', formattedDate);

    var requestPage = 1;
    var activeTabName = '';

    getWfhTableData('#pendingWfhDiv');

    $('#wfhUserFilter').select2({
        placeholder: "Select Employee",
        allowClear: true,
        minimumInputLength: 3,
        ajax: {
            dataType: 'json',
            delay: 250,
            url: APP_URL+'/fetch/wfh/user',
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

    $(document).on('click', '.btnClick', function () {
        activeTabName = $('.tabList .nav-link.active').data('bsTarget');
        requestPage = $(this).attr('data-page');
        getWfhTableData(activeTabName);
    });

    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        const activeTabId = $(e.target).data('bs-target');
        getWfhTableData(activeTabId);
    });

    function getWfhTableData(activeTabName) {
        // if (searchFilterState == 0) {
            let filterEmp = $('#wfhUserFilter').length ? $('#wfhUserFilter').val() : '';

            var activeTab = '';
            if(activeTabName == '#pendingWfhDiv'){
                activeTab = 'Pending';
            }else if(activeTabName == '#approvedWfhDiv'){
                activeTab = 'Approved';
            }else if(activeTabName == '#rejectedWfhDiv'){
                activeTab = 'Rejected';
            }else if(activeTabName == '#expiredWfhDiv'){
                activeTab = 'Expired';
            }else if(activeTabName == '#logsWfhDiv'){
                activeTab = 'Logs';
            }

            // Adding loader to wfh list table
            var $currentTable = $('#wfh'+activeTab+'TableData');
            $currentTable.append(loading());

            $.ajax({
                url: APP_URL+'/wfh/fetch/data',
                type: 'GET',
                data: {
                    page: requestPage,
                    filterEmp: filterEmp,
                    tab: activeTabName,
                },
                success: function (res) {
                    let num = res.data.st;
                    if(res.data.data.length == 0){
                        $currentTable.html(tableNoData);
                    }else{
                        let activeTabId = $('.tabList .nav-link.active').data('bsTarget');
                        let showLoggerCred = activeTabId === '#approvedWfhDiv';

                        let tc = '';
                        if(activeTabId == '#logsWfhDiv'){
                            tc = `<table class="table table-hover table-striped tablecontentcss" id="wfhTable"> <thead> <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Used At</th>
                                <th>Logger ID</th>
                            </tr> </thead> <tbody id="wfh-table-body">`;

                            $.each(res.data.data, function (k, v) {
                                tc += '<tr class="parentTr"  data-id="'+v.id+'">';
                                tc += '<td class="td-index">'+num+'</td>';
                                tc += '<td class="td-empName">'+v.empName+'</td>';
                                tc += '<td class="td-usedAt">'+v.usedAt+'</td>';
                                tc += '<td class="td-loggerId">'+v.loggerId+'</td>';
                                tc += '</tr>';
                                num++;
                            });
                            tc += '</tbody>';
                        }else{
                            tc = `<table class="table table-hover table-striped tablecontentcss" id="wfhTable"> <thead> <tr>
                                <th width="18%">Name</th>
                                <th width="10%">Type</th>
                                <th width="8%">Start Date</th>
                                <th width="8%">End Date</th>
                                <th width="6%">Days</th>
                                <th width="8%">Applied Date</th>
                                ${showLoggerCred ? '<th width="26%">Logger Credentials</th>' : ''}
                                <th width="8%">Status</th>
                                <th width="8%">Action</th>
                            </tr> </thead> <tbody id="wfh-table-body">`;

                            $.each(res.data.data, function (k, v) {
                                tc += '<tr class="parentTr"  data-id="'+v.id+'">';
                                tc += '<td class="td-name showWfhDetails cursor-pointer text-primary" title="Show Details" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-auth="'+v.auth+'">'+v.empName+'</td>';
                                tc += '<td class="td-type">'+v.type+'</td>';
                                tc += '<td class="td-start_date">'+v.start_date+'</td>';
                                tc += '<td class="td-end_date">'+v.end_date+'</td>';
                                tc += '<td class="td-days">'+v.days+'</td>';
                                tc += '<td class="td-created_at">'+v.created_at+'</td>';
                                tc += showLoggerCred ? '<td class="td-logg-cred">' + v.logger_cred + '</td>' : '';
                                tc += '<td class="td-status">'+v.status+'</td>';
                                // let trimmedComment = v.reason.length > 60 ? v.reason.substring(0, 60) + '...' : v.reason;
                                // tc += '<td>'+trimmedComment+'</td>';
                                tc += '<td class="d-none td-reason">'+v.reason+'</td>';
                                tc += '<td class="d-none td-approve_by">'+v.approve_by+'</td>';
                                tc += '<td class="d-none td-comments">'+v.comments+'</td>';
                                tc += '<td>';
                                tc += '<label title="Show Details" class="showWfhDetails cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details"> <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>';
                                if(res.data.permission.delete == true){
                                    tc += '<label title="Delete WFH Request" class="deleteWfh cursor-pointer"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                                }

                                tc += '</td></tr>';

                                if(res.data.permission.approve == true){
                                    $('#canManage').val('1');
                                }

                                num++;
                            });
                            tc += '</tbody>';
                        }


                        if(res.data.button){
                            tc += makePagination(res.data.button);
                        }
                        tc += '</table>';

                        $currentTable.html(tc);
                        var $prevLink = $currentTable.find('a.prev');
                        var $nextLink = $currentTable.find('a.next');
                        $prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        $nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }

                    wfhAjaxProgress = false;

                    if($('#filterEndtDate').is(':visible')){
                        enableSubmitBtn('#filterSearch');
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        // }
    }

    $(document).on('click', '.showWfhDetails', function () {
        $('.showDataTitle').empty();
        $('#showDataBody').empty();
        $('.showDataTitle').text('Work From Home Details');
        let parentTr = $(this).parents('.parentTr');
        let id = parentTr.data('id');

        let empName = parentTr.find('.td-name').text();
        let type = parentTr.find('.td-type').text();
        let startDate = parentTr.find('.td-start_date').text();
        let endDate = parentTr.find('.td-end_date').text();
        let days = parentTr.find('.td-days').text();
        let createdAt = parentTr.find('.td-created_at').text().trim();
        let loggCred = parentTr.find('.td-logg-cred').text();
        let status = parentTr.find('.td-status').text();
        let reason = parentTr.find('.td-reason').text();
        let approvedBy = parentTr.find('.td-approve_by').text();
        let comments = parentTr.find('.td-comments').text();
        var currentAuth = parentTr.find('.td-name').data('auth');

        let htmlData = '';
        htmlData += `<tr> <th>Employee Name:</th> <td>${empName}</td> </tr>`;
        htmlData += `<tr> <th>Type:</th> <td>${type}</td> </tr>`;
        htmlData += `<tr> <th>Start Date:</th> <td>${startDate}</td> </tr>`;
        if (endDate) {
            htmlData += `<tr> <th>End Date:</th> <td>${endDate}</td> </tr>`;
        }
        htmlData += `<tr> <th>Days:</th> <td>${days}</td> </tr>`;
        htmlData += `<tr> <th>Created At:</th> <td>${createdAt}</td> </tr>`;
        if (loggCred) {
            htmlData += `<tr> <th>Logger Cred.:</th> <td>${loggCred}</td> </tr>`;
        }
        htmlData += `<tr> <th>Status:</th> <td>${status}</td> </tr>`;
        htmlData += `<tr> <th>Reason:</th> <td>${reason}</td> </tr>`;
        if (approvedBy) {
            htmlData += `<tr> <th>${status} By:</th> <td>${approvedBy}</td> </tr>`;
        }
        if (comments) {
            htmlData += `<tr> <th>Comment:</th> <td>${comments}</td> </tr>`;
        }

        // if((status == 'Accepted' || status == 'Rejected') && isTraced == 'false'){
        //     htmlData += `<tr> <th>${status} By:</th> <td>${approvedBy}</td> </tr>
        //                 <tr> <th> Previous Comment:</th> <td>${comment}</td> </tr>`;
        // }else if(isTraced == 'true'){
        //     htmlData += `<tr> <th>Deleted By:</th> <td>${deletedBy}</td> </tr>
        //                 <tr> <th>Deleted At:</th> <td>${deletedAt}</td> </tr>`;
        // }
        
        const canManage = $('#canManage').val();
        if(canManage == '1' && currentUserId != currentAuth){
            if(status != 'Expired'){
                htmlData += `<tr> <th class='align-middle'>Comment:</th>
                        <td> <textarea class="form-control comment" name="comments" placeholder="Enter Comment" row="2" value="" id="wfhComment"></textarea> </td>
                    </tr>`;
            }

            if(status == "Pending"){
                htmlData += `<tr> <th class='align-middle'>Action:</th> <td>
                    <button type='button' data-id='${id}' data-class='approve' class='btn btn-success me-sm-3 me-1 mt-1 wfh-approve-btn'>Approve</button>
                    <button type='button' data-id='${id}' data-class='reject' class='btn btn-danger me-sm-3 me-1 mt-1 wfh-reject-btn'>Reject</button> </td>
                </tr>`;
            }else{
                if(status == "Approved"){
                    htmlData += `<tr> <th class='align-middle'>Action:</th> <td>
                            <button type='button' data-id='${id}' data-class='reject' class='btn btn-danger me-sm-3 me-1 mt-1 wfh-reject-btn'>Reject</button> </td>
                            </tr>`;
                }else if(status == "Rejected"){
                    htmlData += `<tr> <th class='align-middle'>Action:</th> <td>
                            <button type='button' data-id='${id}' data-class='approve' class='btn btn-success me-sm-3 me-1 mt-1 wfh-approve-btn'>Approve</button>
                            </tr>`;
                }
            }
        }
        $('#showDataBody').html(htmlData);
    });

    $(document).on('click', '#addWfh', function (){
        resetWfhForm();
        $('#wfhModal').modal('show');
    });

    const $startDate = $('#start_date');
    const $endDate = $('#end_date');

    $startDate.on('change', function () {
        const startVal = $(this).val();
        if (startVal) {
            const nextDay = new Date(startVal);
            nextDay.setDate(nextDay.getDate() + 1);
            const nextDayStr = nextDay.toISOString().split('T')[0];
            $endDate.attr('min', nextDayStr);
        } else {
            $endDate.removeAttr('min');
        }
    });

    $endDate.on('change', function () {
        const endVal = $(this).val();
        if (endVal) {
            $startDate.removeAttr('max');
        }
    });

    $('input[name="type"]').on('change', function () {
        toggleEndDate();
    });

    function toggleEndDate() {
        if ($('#wfhSignleType').is(':checked')) {
            $('.parent-end-date').hide();
            $endDate.val('');
        } else {
            $('.parent-end-date').show();
        }
    }

    $.validator.addMethod("greaterThanStartDate", function (value, element) {
        const startDate = $('#start_date').val();
        if (!value || !startDate) return true; // Skip check if any value is missing
        return new Date(value) > new Date(startDate);
    }, "End Date must be greater than Start Date");

    $('#new-wfh-form').validate({
        rules: {
            type: {
                required: true
            },
            start_date: {
                required: true,
                date: true
            },
            end_date: {
                required: function () {
                    return $('#wfhMultiType').is(':checked');
                },
                date: true,
                greaterThanStartDate: true
            },
            reason: {
                required: true,
            }
        },
        messages: {
            type: "Please select a type",
            start_date: "Start date is required",
            end_date: "End date is required for multiple days",
            reason: {
                required: "Please enter a reason",
                minlength: "Reason must be at least 10 characters"
            }
        },
        submitHandler: function (form) {
            $('#saveWfh').attr('disabled', true);
            $('#saveWfh').addClass('sending');
            $.ajax({
                url: $(form).attr('action'),
                method: $(form).attr('method'),
                data: $(form).serialize(),
                success: function (res) {
                    enableSubmitBtn('#saveWfh');
                    if(res.success){
                        successMessage(res.message);
                        $('#wfhModal').modal('hide');
                        reloadActiveTabFromTable();
                    }else{
                        errorMessage(res.message);
                    }
                },
                error: function (xhr) {
                    var errors = xhr.responseJSON.errors;
                    if (xhr.status === 422) {
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    }else {
                        // errorMessage(res.errors);
                    }
                    enableSubmitBtn('#saveWfh');
                }
            });
        }
    });

    $(document).on('click', '#saveWfh', function () {
        $('#new-wfh-form').submit();
    });

    function resetWfhForm() {
        $('#start_date').attr('max', '');
        const $form = $('#new-wfh-form');
        $form.find('label.error').remove();
        $form.find('.error').removeClass('error');
        $form.find('.is-invalid').removeClass('is-invalid');
        $form.find('.input-error').removeClass('input-error');
        $('.error-message').remove();
        $('#start_date-error').text('');
        $('#end_date-error').text('');
        $('#reason-error').text('');
        $form[0].reset();
        $('.parent-end-date').hide();
    }

    $(document).on('click', '.deleteWfh', function(){
        let parentTr = $(this).parents('.parentTr');
        let wfhId = parentTr.data('id');
        let empName = parentTr.find('.td-name').text();
        let startDate = parentTr.find('.td-start_date').text();

        alert('Alert!','Are you sure you want to delete this WFH Request? <br> <span class="leaveEmpName">Name: '+empName+'</span> <br> <span class="leaveDate">Start Date: '+startDate+'</span>','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url:  APP_URL+"/wfh/" + wfhId + "/delete",
                    type: 'DELETE',
                    success: function(response) {
                        response.success == true ? successMessage(response.message) : errorMessage(response.message);
                        reloadActiveTabFromTable();
                    },
                    error: function(xhr, status, error) {
                        errorMessage(xhr.responseText);
                    }
                });
            }
        });
    });

    // Approve or Reject WFH
    $(document).on('click', '.wfh-approve-btn, .wfh-reject-btn', function () {
        var tdParent = $(this).closest("td");
        var tableParent = tdParent.closest("table");
        $("button", tdParent).prop("disabled", true);

        let wfhId = $(this).attr("data-id");
        let action = $(this).attr("data-class");
        let comment = tableParent.find('#wfhComment').val();

        var confirmMsg = 'Are you sure you want to '+action+' this work from home request?';
        
        alert('Alert!', confirmMsg, 'text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+"/wfh/approve/reject",
                    type: "POST",
                    data: { wfhId: wfhId, action: action, comment:comment },
                    success: function (response) {
                        if(response.status){
                            $('.offcanvas').toggleClass('is-open');
                            $('.offcanvas .btn-close').click()
                            successMessage(response.message);
                        }else{
                            errorMessage(response.message);
                        }
                        reloadActiveTabFromTable();
                    },
                    error: function (xhr, status, response) {
                        var tdParent = $(this).closest("td");
                        $("button", tdParent).prop("disabled", false);
                        errorMessage(response.message);
                    },
                });
            }else{
                $('.offcanvas').toggleClass('is-open');
                $('.offcanvas .btn-close').click()
            }
        });
    });

    function reloadActiveTabFromTable() {
        let activeTabId = $('.tabList .nav-link.active').data('bsTarget');
        getWfhTableData(activeTabId);
    }
});
