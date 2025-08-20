$(document).ready(function () {
    var requestPage = 1;
    var searchFilterState = 0;
    //Filter on Notice & Appreciation tab
    var tableFilterData = {
        'projects': '',
        'userName': '',
        'subType' : '',
        'type' : ''
    };
    var naDateFilter = {};
    var nafilterText = '';

    let urlPath = window.location.pathname;
    if( urlPath != '/notice-appreciation/create' ){
        getNoticeTableData();
        if($('.addnoticeandapp').length > 0){
            getFormData();
        }
    }

    $('#subType').on('change',function () {
        let subTypeVal = $('#subType').val() || null;
        if(subTypeVal == 0){
            $('.projects-name').show();
            // $('.notice-appreciation-type').show();
        }else{
            $('.projects-name').hide();
            // $('.notice-appreciation-type').hide();
        }
    });

    $('#naFilterSearch').on('click', function(){
        disableSubmitBtn('#naFilterSearch');
        naDateFilter['startDate'] = $('#naFilterStartDate').val();
        naDateFilter['endDate'] = $('#naFilterEndtDate').val();
        nafilterText = 'date';
        getNoticeTableData();
    });

    // N&A index page filter dropdown change
    $('#naDurationFilter li').on('click', function(e){
        let selector = $(this).children();
        nafilterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');

        if(nafilterText == 'today' || nafilterText == 'week' || nafilterText == 'month'){
            $('#naStartDateBlock').hide();
            $('#naEndDateBlock').hide();
            $('#naFilterBlock').hide();
            getNoticeTableData();
        }else if(nafilterText == 'date'){
            $('#naStartDateBlock').show();
            $('#naEndDateBlock').show();
            $('#naFilterBlock').show();
        }
    });

    // Set min date for filter start date
    $(document).on('change', '#naFilterStartDate', function(){
        let startDate = $('#naFilterStartDate').val();
        if(startDate){
            let selectedDate = new Date(startDate);
            selectedDate = new Date(selectedDate.getTime() + ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#naFilterEndtDate').attr({ 'min': selectedDate});
        }else{
            $('#naFilterEndtDate').attr({'min': ''});
        }
    });

    // Set max date for filter end date
    $(document).on('change', '#naFilterEndtDate', function(){
        let endDate = $('#naFilterEndtDate').val();
        if(endDate){
            let selectedDate = new Date(endDate);
            selectedDate = new Date(selectedDate.getTime() - ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#naFilterStartDate').attr({ 'max': selectedDate});
        }else{
            $('#naFilterStartDate').attr({'max': ''});
        }
    });

    // Enable disable Timesheet filter button
    $('.date-input').on('change', function(e){
        if( $('#naFilterStartDate').val() || $('#naFilterEndtDate').val()){
            enableSubmitBtn('#naFilterSearch');
        }else{
            $('#naFilterSearch').attr('disabled', true);
        }
    });

    $('#naFilterSearch').on('click', function(){
        disableSubmitBtn('#naFilterSearch');
        naDateFilter['startDate'] = $('#naFilterStartDate').val();
        naDateFilter['endDate'] = $('#naFilterEndtDate').val();
        nafilterText = 'date';
        getNoticeTableData();
    });


    $('#projects, #users, #subType, #noticeType').on('change', function () {
        tableFilterData['requestPage'] = 1;
        getNoticeTableData();
    });

    $(document).on('click', '#resetFilterNa', function () {
        searchFilterState = 1;
        $('#users').val('').trigger('change');
        $('#noticeType').val('').trigger('change');
        $('#subType').val('').trigger('change');
        $('#projects').val('').trigger('change');
        $('#naFilterStartDate, #naFilterEndtDate').val("").removeAttr('min').removeAttr('max');
        $('#naStartDateBlock, #naEndDateBlock, #naFilterBlock').hide();
        naDateFilter['startDate'] = '';
        naDateFilter['endDate'] = '';
        nafilterText = '';
        $('#naDurationFilter .dropdown-item').removeClass('active');
        disableSubmitBtn('#naFilterSearch');

        searchFilterState = 0;
        getNoticeTableData();
    });

    $(document).on('click', '.btnClick', function () {
        tableFilterData['requestPage'] = $(this).attr('data-page');
        getNoticeTableData();
    });

    $(document).on('change' , '#projectName', function(){
        var project = $('#projectName').val();
        if(project){
            $('#manageAttachment').show();
        }else{
            $('#manageAttachment').hide();
        }
    })

    //on change validation remove
    setupSelect2Validation();

    $(document).on('click','#saveNoticeAppr' , function () {
        $('#new-notice-form').validate({
            rules: {
                notice_emp: {
                    required: true,
                },
                description: {
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
                    $(error).insertAfter($(element).parent());
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
            messages: {
                notice_emp: {
                    required: 'Employee name is required',
                },description: {
                    required: 'The Description field is required',
                }
            },
        }); 

        if($('#new-notice-form').valid()) {
            disableSubmitBtn('#saveNoticeAppr');
            $('#new-notice-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-notice-form').validate().resetForm();
                    $('#projectName, #noticeEmp').empty();
                    $('#noticeEmp, #projectName').val('').trigger('change');
                    
                    $('#noticeEmp').html('<option value="">Select Employee</option>');
                    $('#projectName').html('<option value="">Select Employee First</option>');

                    if(urlPath != 'notice-appreciation/create'){
                        getNoticeTableData();
                        $('#noticeModal').modal('hide');
                    }
                    enableSubmitBtn('#saveNoticeAppr');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveNoticeAppr');
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

    $(document).on('click','.addnoticeandapp', function(){
        $('.modal-title').html('Add Notice & Appreciation');
        $('#new-notice-form').attr('action', '/notice-appreciation/store');
        $('#new-notice-form .error').removeClass('error');
        $('#validationMessages').empty();
       
        $('#noticeAndAppDescription').val('');
        $('#appreciation').prop('checked', true);
        $('.selectedFileDiv').val('').hide();
        $('#noticeEmp').prop('disabled', false);
        $('#projectName, #noticeEmp').empty();
        $('#noticeEmp, #projectName').val('').trigger('change');
        $('#noticeEmp').html('<option value="">Select Employee</option>');
        $('#projectName').html('<option value="">Select Employee First</option>');

        $('#noticeEmp').select2({
            dropdownParent: $('#noticeModal .modal-body'),
            minimumInputLength: 3,
            ajax: {
                dataType: 'json',
                delay: 250,
                url: APP_URL+'/notice-appreciation/user/list',
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
    });

    function getFormData() {
        $.ajax({
            url: APP_URL+'/notice-appreciation/fetch/formData',
            type: 'GET',
            data: {page: requestPage},
            success: function (response) {
                $('.noticeAndAppreciationForm').html(response.data);
            },
            error: function (xhr, status, error) {
                console.log(error,xhr);
            },
        });
    }

    // ajax call for notice and appreciation Table data
    function getNoticeTableData() {
        if( urlPath != '/notice-appreciation/create' ){
            if(searchFilterState == 0){
                let isProjectsVisible = $('.projects-name').css('display') === 'block';
                tableFilterData['projects'] = isProjectsVisible ? $('#projects').val() : null;
                tableFilterData['userName'] = $('#users').val() ?? null;
                tableFilterData['subType'] = $('#subType').val() ?? null;
                tableFilterData['type'] = $('#noticeType').val() ?? null;

                $('#noticeandappreciationTable').append(loading());
                $.ajax({
                    url: APP_URL+'/notice-appreciation',
                    type: 'GET',
                    data: { page: tableFilterData['requestPage'] , tableFilterData: tableFilterData, filterText: nafilterText, dateFilter: naDateFilter },
                    success: function (res) {
                        $('#naFilterSearch').removeClass('sending');
                        $('#noticeandappreciationTable').find('.loading-wrapper').remove(); // Remove loading message

                        //Display N&A count of particular employee
                        if(tableFilterData['userName']){
                            $('.addCountDetail').empty();
                            let totalNoticeCount = res.noticeAndAppriciationCount[0].notice ?? 0;
                            let totalApprCount = res.noticeAndAppriciationCount[0].appreciation ?? 0;
                            $('.addCountDetail').append(`<div class="pt-2 ps-3 d-flex">
                                                                <div class="noticecount">Total Notice: <span class="">${totalNoticeCount}</span> &nbsp; | &nbsp; </div>
                                                                <div class="appriciationcount">Total Appriciation: <span class="">${totalApprCount}</span></div>
                                                            </div>`);
                        }else{
                            $('.addCountDetail').empty();
                        }

                        if(res.count == 0){
                            $('#noticeandappreciationTable').html(tableNoData);
                        }else{
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="noticeTable"><thead class="table-light"><tr>
                                    <th style="width:5%;">No</th>
                                    <th style="width:15%;">Employee</th>
                                    <th style="width:15%;">Type</th>
                                    <th style="width:20%;">Sub Type</th>
                                    <th style="width:55%;">Project</th>
                                    <th style="width:15%;">Created At</th>
                                    <th style="width:10%;">Action</th>
                                    </tr></thead><tbody class="table-border-bottom-0" id="notice-table-body">`;

                            let num = res.data.st;
                            $.each(res.data.data, function (k, v) {
                                tc += '<tr>';
                                tc += '<td>'+num+'</td>';
                                tc += '<td class="td-employee-name">'+v.userName+'</td>';
                                tc += '<td class="d-none td-delete-permission">'+res.data.permission.delete+'</td>';
                                tc += '<td class="td-type"><span class="badge rounded-pill '+v.typeColor+'">'+v.type+'</span></td>';
                                tc += '<td class="td-sub-type">'+ (v.subType == '-' && v.projectName != '-' ? 'Project' : v.subType) +'</td>';
                                tc += '<td class="td-project-name">'+v.projectName+'</td>';
                                tc += '<td class="td-createdAt" title="'+v.createdAtTime+'">'+v.createdAt+'</td>';
                                tc += '<td class="d-none td-description">'+v.fullDetail+'</td>';
                                tc += '<td class="d-none td-file">'+v.fileName+'</td>';
                                tc += '<td class="d-none td-createdBy">'+v.cretedBy+'</td>';
                                tc += '<td>';
                                tc += '<label class="showNotices cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'" title="Show Details" data-doc-id="'+v.document_id+'" data-file-url="'+v.url+'">';
                                tc += '<span class="text-primary cursor"><i class="bx bx-show me-1"></i></span></label>';

                                if(res.data.permission.edit == true){
                                    tc += '<label class="editNA cursor-pointer" title="Edit N&A" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'" data-doc-id="'+v.document_id+'">';
                                    tc += '<span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>';
                                }
                                if(res.data.permission.delete == true){
                                    tc += '<label class="deleteNotice cursor-pointer" title="Delete N&A" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'">';
                                    tc += '<span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                                }

                                tc += '</td></tr>';
                                num++;
                            });
                            tc += '</tbody>';
                            if(res.data.morePage){
                                tc += makePagination(res.data.button);
                            }
                            tc += '</table>';
                            $('#noticeandappreciationTable').html(tc);
                            var prevLink = $('#noticeTable a.prev');
                            var nextLink = $('#noticeTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                        }
                        requestPage = 1;
                    },
                    error: function (xhr, status, error) {
                        console.log(error);
                    },
                });
            }
        }
    }

    //ajax call delete Notices
    $(document).on('click','.deleteNotice', function(){
        var id = $(this).data('item-id');
        alert('Alert!','Are you sure you want to delete this data?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url:  APP_URL+'/notice-appreciation/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        $('.offcanvas').toggleClass('is-open');
                        $('.offcanvas .btn-close').click();
                        getNoticeTableData();
                        $('#toastContent').text(response.message);
                        $('.toast').addClass('bg-success');
                        $('#AppToast').toast('show');
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    $(document).on('click', '.showNotices', function () {
        var id =  $(this).data("item-id");
        var projectid =  $(this).data("item-project-id");
        var deletePermission = $(this).closest('tr').find('.td-delete-permission').text();
        var projectName = $(this).closest('tr').find('.td-project-name').text();
        var TypeName = $(this).closest('tr').find('.td-type').text();
        var subTypeName = $(this).closest('tr').find('.td-sub-type').text();
        var employeeName = $(this).closest('tr').find('.td-employee-name').text();
        var description = $(this).closest('tr').find('.td-description').text();
        var file = $(this).closest('tr').find('.td-file').text();
        var fileUrl = $(this).data("file-url");
        var docId = $(this).data("doc-id");
        var downloadIcon = fileUrl ? `<span class='cursor-pointer openDoc text-info mx-1'' title='Click To Open File' data-doc-id='${docId}'> <i class='fa-solid fa-up-right-from-square cursor'></i></span><span class='cursor-pointer downloadDoc' style='color:blue;' title='Click To Download File' data-doc-id='${docId}'> <i class='bx bx-download cursor'></i></span>` : '' ;
        var createdAt = $(this).closest('tr').find('.td-createdAt').text();
        var createdBy = $(this).closest('tr').find('.td-createdBy').text();
        var typeClass = TypeName == 'Appreciation' ? 'bg-success' : 'bg-danger';

        $('.showDataTitle').empty();
        $('#showDataBody').empty();
        $('.showDataTitle').text(TypeName+' Details');
        $('#showDataBody').html(
            `<tr> <th>Employee:</th> <td>${employeeName}</td> </tr>
            <tr> <th>Project:</th> <td>${projectName !== '' ? projectName : '-'}</td> </tr>
            <tr> <th>Description:</th> <td>${description}</td> </tr>
            <tr> <th>Created At:</th> <td>${createdAt}</td> </tr>
            <tr> <th>Created By:</th> <td>${createdBy}</td> </tr>
            <tr> <th>Type:</th> <td><span class="badge rounded-pill ${typeClass}">${TypeName}</span></td> </tr>
            ${subTypeName !== '-' ? `<tr> <th>Sub Type:</th> <td>${subTypeName}</td> </tr>` : ''}
            ${file !== '-' ? `<tr> <th>File:</th> <td>${file}${downloadIcon}</td> </tr>` : ''}
            ${deletePermission == 'true' ? `<tr><th class="align-middle">Action:</th><td><button type='button' data-item-id='${id}' data-item-project-id='${projectid}' class='btn btn-danger me-sm-3 me-1 mt-1 deleteNotice'>Delete</button></td></tr>` : ''}`
        );
    });

    //Open download file
    $(document).on('click', '.openDoc', function () {
        var docId = $(this).data('doc-id');
        window.open('/project/file/open/' + docId);
    });

    //download file
    $(document).on('click', '.downloadDoc', function () {
        var docId = $(this).data('doc-id');
        window.open('/project/file/download/' + docId);
    });

    //edit popup data
    $(document).on('click', '.editNA', function () {
        $('#validationMessages').empty();
        $('.modal-title').html('Edit Notice & Appreciation');
        formValidationReset("#new-notice-form");

        var id = $(this).data('item-id');
        var docId = $(this).data('doc-id');
        var projectId = $(this).data('item-project-id');
        $.ajax({
            url: APP_URL+'/notice-appreciation/' + id + '/edit',
            type: 'GET',
            data: { id: id,projectId :projectId},
            success: function (res) {
                $('#new-notice-form').attr('action', '/notice-appreciation/' + id + '/update');
                $('#noticeAndAppDescription').val(res.noticeAndAppData.description);

                //Checkbox
                if (res.noticeAndAppData.type == 1) {
                    $('#appreciation').prop('checked', true);
                } else if (res.noticeAndAppData.type == 2) {
                    $('#notice').prop('checked', true);
                }

                //Employee dropdown data
                var option = new Option(res.noticeAndAppData.user.name,res.empId, true, true);
                $('#noticeEmp').html(option).prop('disabled', true);
               
                //Project dropdown
                if(res.encryptedProjects.length == 0){
                    $('#projectName').html('');
                    $('#projectName').append('<option value="">No Assigned Project Found</option>');
                }else{
                    $('#projectName').select2({
                        dropdownParent: $('#noticeModal .modal-body'),
                    });

                    $('#projectName').html('<option value="">Select Project</option>');
                    $.each(res.encryptedProjects, function (projectId, projectName) {
                        var selectedAttribute =  res.selectedProjectId == projectId ? 'selected' : '';
                        var option = $('<option>').text(projectName).val(projectId).prop('selected', selectedAttribute);
                        $('#projectName').append(option);
                    });
                }

                //if project then show the attachment
                if(res.noticeAndAppData.project_id){
                    $('#manageAttachment').show();
                }else{
                    $('#manageAttachment').hide();
                }

                //Download file option if already stored
                if(res.noticeAndAppData.document_id != null){
                    $('.selectedFileDiv').show();
                    $('#uploadedFileName')
                    .data('doc-id', docId)
                    .text(res.noticeAndAppData.documents.original_name);
                    $('#manageAttachment').show();
                }else{
                    $('.selectedFileDiv').hide();
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
        // Show the modal
        $('#noticeModal').modal('show');
    });

});