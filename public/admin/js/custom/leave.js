requestPage = 1;
let urlPath = window.location.pathname;
var getAll = false;
var searchFilterState = 0;

if( urlPath != '/leave/create' ){
    getLeaveTableData();
    getLeaveFormData(new Date().getFullYear());    
}

$(document).on('click', '.btnClick', function () {
    requestPage = $(this).attr('data-page');
    getLeaveTableData();
});

$(document).on('change', '#selectedleaveYear', function() {
    getLeaveTableData();
});

//on change validation remove
setupSelect2Validation();

var leaveStatus = '';
var empFilter = '';
var filterDate  = '';
function getLeaveTableData() {
    if (searchFilterState == 0) {
        var page = requestPage;
        let urlPath = window.location.pathname;
        leaveStatus = $('#leaveStatusFilter').val();

        if( urlPath == '/leave/manage' ){
            getAll = true;
            empFilter = $('#leaveUserFilter :selected').val();
            filterDate = $('#dateFilter').val();

            var leaveCategory = null;
            if(('#leaveCategoryFilter').length){
                leaveCategory = $('#leaveCategoryFilter').val();
            }
        }

        $('#leaveTable').append(loading());
        var selectedLeaveYear = $('#selectedleaveYear').val();
        $.ajax({
            url: APP_URL+'/leave/fetch/data',
            type: 'GET',
            data: { page: page, leaveStatus: leaveStatus, getAll:getAll, empFilter: empFilter, filterDate: filterDate, leaveCategory: leaveCategory, selectedLeaveYear: selectedLeaveYear},
            success: function (res) {
                $('#leaveTable').find('.loading-wrapper').remove();
                let leaveTable = '';
                let personal = res.data.leaveDetails.Personal && res.data.leaveDetails.Personal.total > 0 ? res.data.leaveDetails.Personal.taken + '/' + res.data.leaveDetails.Personal.total : '';
                let unpaid = res.data.leaveDetails.Unpaid && res.data.leaveDetails.Unpaid.total > 0 ? res.data.leaveDetails.Unpaid.taken + '/' + res.data.leaveDetails.Unpaid.total : '';
                let appreciationLeave = res.data.leaveDetails['Appreciation Leave (C-Off)'];
                let apprentice = appreciationLeave.total > 0 ? appreciationLeave.taken + '/' + appreciationLeave.total : '';

                personal && $('#personal-leave-box').text(personal);
                unpaid && $('#unpaid-leave-box').text(unpaid);
                apprentice && $('#appren-leave-box').text(apprentice);

                if(res.data.totalRecords == 0){
                    $('#leaveTable').html(tableNoData);
                } else {
                    leaveTable += `<table class="table table-hover table-striped tablecontentcss">
                                        <thead class="table-light">
                                            <tr>
                                                <th>Name</th>
                                                <th>Leave Category</th>
                                                <th>Leave Date</th>
                                                <th class="text-end">Duration</th>
                                                <th class="text-center">Status</th>
                                                <th>Applied By</th>
                                                <th>Applied On</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody class="table-border-bottom-0">`;

                    $.each(res.data.data, function (k, v) {
                        var textDanger = (v.notice ? "text-danger" : "");
                        var textHover = (v.notice ? "Ad-hoc Leave" : "");
                        var duration = (v.duration == '0.5' ? v.duration + (v.partOfDay == 'Morning' ? ' - AM' : ' - PM') : v.duration);

                        leaveTable += '<tr class="parentTr">';
                        leaveTable += '<td class="empName '+ textDanger +'" title="'+v.pta+'">'+v.name+'</td>';
                        leaveTable += '<td class="categoryName '+ textDanger +'">'+v.category+'</td>';
                        leaveTable += '<td class="leaveDate '+ textDanger +'">'+v.leaveDate+'</td>';
                        leaveTable += '<td class="duration text-end  '+ textDanger +'" title="'+ (v.duration == '0.5' ? (v.partOfDay == 'Morning' ? 'Morning' : 'Afternoon') : '') +'">' + duration +'</td>';
                        if(v.isDeleted){
                            leaveTable += '<td class="status text-center"> <span class="badge bg-danger rounded-pill">Deleted</span> </td>';
                        }else{
                            leaveTable += '<td class="status text-center"> <span class="badge '+v.class+' rounded-pill">'+v.status+'</span> </td>';
                        }
                        leaveTable += '<td class="partOfDay d-none">'+v.partOfDay+'</td>';
                        leaveTable += '<td class="reason d-none">'+v.reason+'</td>';
                        leaveTable += '<td class="leaveId d-none">'+v.id+'</td>';
                        leaveTable += '<td class="appliedBy '+ textDanger +'">'+v.appliedBy+'</td>';
                        leaveTable += '<td class="applyDate '+ textDanger +'">'+v.appliedOn+'</td>';
                        leaveTable += '<td class="isTraced d-none">'+v.isDeleted+'</td>';
                        leaveTable += '<td class="comment d-none">'+v.comment+'</td>';
                        leaveTable += '<td class="approvedBy d-none">'+(v.approvedBy ? v.approvedBy : '-')+'</td>';

                        leaveTable += '<td class="deletedBy d-none">'+v.deletedBy+'</td>';
                        leaveTable += '<td class="deletedAt d-none">'+v.deletedAt+'</td>';

                        leaveTable += '<td> <a href="javascript:void(0);" title="View Leave Details" class="text-primary showLeaveDetails" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-id="'+v.id+'"><i class="bx bx-show me-1"></i></a>';
                        if(res.data.permission.delete && !v.isDeleted){
                            leaveTable += '<label title="Delete Leave" class="deleteLeave cursor-pointer" data-id="'+v.id+'"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                        }
                        leaveTable += '</td> </tr>';
                    });
                    leaveTable += '</tbody>';

                    if(res.data.morePage){
                        leaveTable += makePagination(res.data.button);
                    }

                    leaveTable += '</table>';
                    $('#leaveTable').html(leaveTable);
                    var prevLink = $('#leaveTable a.prev');
                    var nextLink = $('#leaveTable a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }
}

function getLeaveFormData(selectedYear = null) {
    var page = requestPage;
    let empFlag = window.location.pathname == '/leave/manage' ?? true;
    $.ajax({
        url: APP_URL+'/leave/fetch/formData',
        type: 'GET',
        data: { page: page, empFlag: empFlag, selectedYear: selectedYear},
        success: function (response) {
            $('.leaveForm').html('');
            $('.leaveForm').html(response.data);

            let personal = $('#Personal-count').text();
            let unpaid = $('#Unpaid-count').text();
            let apprentice = $('#Apprenticeleave-count').text();

            personal && $('#personal-leave-box').text(personal) && $('#personalLeaveCard').show();
            unpaid && $('#unpaid-leave-box').text(unpaid) && $('#unpaidLeaveCard').show();
            apprentice && $('#appren-leave-box').text(apprentice) && $('#apprenLeaveCard').show();
        },
        error: function (xhr, status, error) {
            console.log(error,xhr);
        },
    });
}

$(document).on('select2:select', '#leave_category', function (e) {
    $('#leave_category-error').text('');
});

$(document).on('click', '#saveLeaveForm', function(e){
    $('#new-leave-form').validate({
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
                $(error).insertAfter($(element).next('span'));
            } else {
                $(error).insertAfter($(element));
            }
        },
    }); 

    if ($('#new-leave-form').valid()) {
        disableSubmitBtn('#saveLeaveForm');
        $('.error-message').text('');
        e.preventDefault();

        let start_date = $('#start_date').val();
        let end_date = $('#end_date').val() ?? null;

        var formData = {
            emp_name: $('#empName').val() ?? null,
            leave_category: $('#leave_category').val(),
            start_date: start_date,
            leave_type: $('input[name="leave_type"]:checked').val(),
            part_of_day: $('#part_of_hour').val() || null,
            reason: $('#reason').val(),
        };

        if(end_date !== null) {
            var startDateObj = new Date(start_date);
            var endDateObj = new Date(end_date);
            if (startDateObj.getFullYear() !== endDateObj.getFullYear()) {
                var firstSetStart = start_date;
                var firstSetEnd = `${startDateObj.getFullYear()}-12-31`;
                var secondSetStart = `${endDateObj.getFullYear()}-01-01`;
                var secondSetEnd = end_date;

                // need to check for firstSetStart and firstSetEnd is not same ALSO for secondSetStart and secondSetEnd not same
                if (firstSetStart !== firstSetEnd) {
                    var formDataFirstSet = { ...formData };
                    formDataFirstSet.end_date = firstSetEnd;
                    applyForLeave(formDataFirstSet);
                } else {
                    var formDataFirstSet = { ...formData };
                    formDataFirstSet.leave_type = 1;
                    applyForLeave(formDataFirstSet);
                }

                if (secondSetStart !== secondSetEnd) {
                    var formDataSecondSet = { ...formData };
                    formDataSecondSet.start_date = secondSetStart;
                    formDataSecondSet.end_date = secondSetEnd;
                    applyForLeave(formDataSecondSet);
                } else {
                    var formDataSecondSet = { ...formData };
                    formDataSecondSet.leave_type = 1;
                    formDataSecondSet.start_date = secondSetStart;
                    applyForLeave(formDataSecondSet);
                }

            }else{
                formData.end_date = end_date;
                applyForLeave(formData);
            }
        }else{
            applyForLeave(formData);
        }
    }
});


function applyForLeave(formData){
    $.ajax({
        url: APP_URL + '/leave/store',
        type: 'POST',
        data: formData,
        success: function (response) {
            $('.newRowAppended').empty();
            $('#new-leave-form').validate().resetForm();
            $('.select2').trigger('change');

            if ($('#leaveModal').length) {
                var selectedYear = $('#selectedLeaveYear').val();
                getLeaveFormData(selectedYear);
                getLeaveTableData();
            } else {
                localStorage['leaveNotice'] = response.message;
                localStorage['leaveNoticeColor'] = response.color;
                location.href = '/leave';
            }

            if ($('#leaveModal').length) {
                $('#leaveModal').modal('hide');
                if (response.color === 'red') {
                    errorMessage(response.message);
                } else {
                    successMessage(response.message);
                }
            }

            enableSubmitBtn('#saveLeaveForm');
        },
        error: function (xhr) {
            if (xhr.status === 422) {
                var errors = xhr.responseJSON.errors;
                $.each(errors, function (field, error) {
                    if ($('#' + field + '-error').length === 0) {
                        errorMessage(error);
                    } else {
                        $('#' + field + '-error').text(error[0]);
                    }
                });
            } else {
                if (xhr.status === 400) {
                    if (xhr.responseJSON.issue === 'category') {
                        $('#leave_category-error').text(xhr.responseJSON.message);
                    } else if (xhr.responseJSON.issue === 'date') {
                        $('#start_date-error').text(xhr.responseJSON.message);
                    }
                } else {
                    errorMessage(xhr.responseJSON.message);
                }
            }

            enableSubmitBtn('#saveLeaveForm');
        }
    });
}

$(document).on('change', '#selectedLeaveYear', function () {
    var selectedYear = $(this).val();
    var empId = $('#empName').val() ?? null;
    getLeaveCountDetails(empId, selectedYear);
});

function getLeaveCountDetails(empId = null, selectedYear = null) {
    let empName = $('#empName option:selected').text();
        $('#leave_category option').remove();
        $('.leaveDetailsBox').text('Leave Details of '+empName);
        $('#Personal-count').text('Loading...');
        $('#Unpaid-count').text('Loading...');
        $('#total-count-sum').text('Loading...');
        $('#AppreciationLeave-count').text('Loading...');

        $('#leave_category-error').text('');
        $('#start_date-error').text('');
        $.ajax({
            url: APP_URL+'/leave/countDetails',
            type: 'GET',
            data: { empId: empId, selectedYear: selectedYear },
            success: function (response) {
                if(response.success){
                    $('.leave-category-list').html(response.countHtml);
                    $('.leaveDetailsBox').text('Leave Details of ' + empName);
                    $.each(response.category, function(val, data) {
                        $('#leave_category').append(
                            $('<option></option>').val(data['id']).html(data['name'])
                        );
                    });
                }else{
                    errorMessage('Something went wrong!');
                }
            },
            error: function (xhr, status, response) {
                errorMessage(response.message);
            },
        });
}

$(document).on('change', '.LeaveCategoryType', function() {
    var value = $('.LeaveCategoryType:checked').val();
    if(value == 2){
        var appendHtml = `
            <label for="end_date" class="col-md-4 col-form-label text-lg-end">End Date <span class="text-danger">*</span></label>
            <div class="col-md-8">
                <input class="form-control end_date" name="end_date" type="date" value="" id="end_date" min="" required>
                <div class="text-sm text-end" style="font-size: 13px;"><i class='bx bxs-info-circle'></i>Click on the icon to open picker</div>
                <div class="error-message text-danger" id="end_date-error"></div>
            </div>
        `;
        $('.newRowAppended').empty().append(appendHtml);
    }else if (value == 0) {
        var appendHtml = `
            <label for="part_of_hour" class="col-md-4 col-form-label text-lg-end">Part Of Day <span class="text-danger">*</span></label>
            <div class="col-md-8">
                <select id="part_of_hour" class="form-select part_of_day" name="part_of_day" required>
                <option value="" selected>Select Part Of Day</option>
                <option value="morning">Morning</option>
                <option value="afternoon">AfterNoon</option>
                </select>
            </div>
        `;
        $('.newRowAppended').empty().append(appendHtml);
    }else{
        $('.newRowAppended').empty();
    }
});

$(document).on('click', '.showLeaveDetails', function () {
    let empFlag = window.location.pathname == '/leave/manage' ? true : false;
    $('.showDataTitle').empty();
    $('#showDataBody').empty();
    $('.showDataTitle').text('Leave Details');
    let parentTr = $(this).parents('.parentTr');
    let empName = parentTr.find('.empName').text();
    let categoryName = parentTr.find('.categoryName').text();
    let applyDate = parentTr.find('.applyDate').text();
    let leaveDate = parentTr.find('.leaveDate').text();
    let duration = parentTr.find('.duration').text();
    let status = parentTr.find('.status').text().trim();
    let reason = parentTr.find('.reason').text();
    let leaveId = parentTr.find('.leaveId').text();
    let appliedBy = parentTr.find('.appliedBy').text();
    let approvedBy = parentTr.find('.approvedBy').text();
    let isTraced = parentTr.find('.isTraced').text();
    let comment = parentTr.find('.comment').text();
    let deletedBy = parentTr.find('.deletedBy').text();
    let deletedAt = parentTr.find('.deletedAt').text();

    let htmlData = `
        <tr> <th>Employee Name:</th> <td>${empName}</td> </tr>
        <tr> <th>Category Name:</th> <td>${categoryName}</td> </tr>
        <tr> <th>Leave Date:</th> <td>${leaveDate}</td> </tr>
        <tr> <th>Duration:</th> <td>${duration}</td> </tr>
        <tr> <th>Leave Status:</th> <td class='text-capitalize'>${status}</td> </tr>
        <tr> <th>Applied By:</th> <td>${appliedBy}</td> </tr>
        <tr> <th>Apply Date:</th> <td>${applyDate}</td> </tr>
        <tr> <th>Reason:</th> <td>${reason}</td> </tr>
    `;

    if((status == 'Accepted' || status == 'Rejected') && isTraced == 'false'){
        htmlData += `<tr> <th>${status} By:</th> <td>${approvedBy}</td> </tr>
                     <tr> <th> Previous Comment:</th> <td>${comment}</td> </tr>`;
    }else if(isTraced == 'true'){
        htmlData += `<tr> <th>Deleted By:</th> <td>${deletedBy}</td> </tr>
                     <tr> <th>Deleted At:</th> <td>${deletedAt}</td> </tr>`;
    }
    
    if(empFlag && isTraced == 'false'){
        htmlData += `<tr> <th class='align-middle'>Comment:</th>
                <td> <textarea class="form-control comment" name="leavecomment" placeholder="Enter Comment" row="2" value="" id="leavecomment"></textarea> </td>
            </tr>`;

        if(status == "Pending" && isTraced == 'false'){
            htmlData += `<tr> <th class='align-middle'>Action:</th> <td>
                <button type='button' data-id='${leaveId}' data-class='approve' class='btn btn-success me-sm-3 me-1 mt-1 leave-approve-btn'>Approve</button>
                <button type='button' data-id='${leaveId}' data-class='reject' class='btn btn-danger me-sm-3 me-1 mt-1 leave-reject-btn'>Reject</button> </td>
            </tr>`;
        }else{
            if(status == "Accepted"){
                htmlData += `<tr> <th class='align-middle'>Action:</th> <td>
                        <button type='button' data-id='${leaveId}' data-class='reject' class='btn btn-danger me-sm-3 me-1 mt-1 leave-reject-btn'>Reject</button> </td>
                        </tr>`;
            }else if(status == "Rejected"){
                htmlData += `<tr> <th class='align-middle'>Action:</th> <td>
                        <button type='button' data-id='${leaveId}' data-class='approve' class='btn btn-success me-sm-3 me-1 mt-1 leave-approve-btn'>Approve</button>
                        </tr>`;
            }
        }
    }
    $('#showDataBody').html(htmlData);
});

$(document).on('click','.deleteLeave', function(){
    let leaveId = $(this).data('id');
    let parentTr = $(this).parents('.parentTr');
    let empName = parentTr.find('.empName').text();
    let leaveDate = parentTr.find('.leaveDate').text();

    alert('Alert!','Are you sure you want to delete this Leave? <br> <span class="leaveEmpName">Name: '+empName+'</span> <br> <span class="leaveDate">Date: '+leaveDate+'</span>','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url:  APP_URL+"/leave/" + leaveId + "/delete",
                    type: 'DELETE',
                    success: function(response) {
                        response.success == true ? successMessage(response.message) : errorMessage(response.message);
                        getLeaveTableData();
                    },
                    error: function(xhr, status, error) {
                        errorMessage(xhr.responseText);
                    }
                });
            }
        });
});

$(document).on('click', '#resetLeaveSearch', function () {
    searchFilterState = 1;
    $('#leaveUserFilter').val(null).trigger('change');
    $('#leaveStatusFilter').val('1').trigger('change');
    $('#dateFilter').val('');
    $('#leaveCategoryFilter').val(null).trigger('change');
    searchFilterState = 0;
    getLeaveTableData();
});

setTimeout(
    function() {
        let leaveNotice = localStorage['leaveNotice'];
        let leaveNoticeColor = localStorage['leaveNoticeColor'];
        if (leaveNotice) {
            if(leaveNoticeColor == 'red'){
                errorMessage(leaveNotice);
            }else{
                successMessage(leaveNotice);
            }
            localStorage.removeItem('leaveNotice');
            localStorage.removeItem('leaveNoticeColor');
        }
    }, 1000);

// $('.applyLeavebtn').click(function(){
//     $('#new-leave-form .error').removeClass('error');
//     $('#validationMessages').empty();

//     $('#start_date').attr({ 'max': ''});
//     $('#end_date').attr({ 'min': ''});
// });

$(document).on('change', '#multiple_day', checkForEndDate);
$(document).on('change', '#end_date', function(){
    let endDate = $('#end_date').val();
    if(endDate){
        let selectedDate = new Date(endDate);
        selectedDate = new Date(selectedDate.getTime() - ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
        $('#start_date').attr({'max': selectedDate});
    }else{
        $('#start_date').attr({'max': ''});
    }
});

function checkForEndDate(){
    let radioBtnVal = $('input[name="leave_type"]:checked').val();
    $('#start_date-error').text('');
    if(radioBtnVal == 2){
        let startDate = $('#start_date').val();
        if(startDate){
            let selectedDate = new Date(startDate);
            selectedDate = new Date(selectedDate.getTime() + ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#end_date').attr({'min': selectedDate});
        }else{
            $('#end_date').attr({'min': ''});
        }
    }
}