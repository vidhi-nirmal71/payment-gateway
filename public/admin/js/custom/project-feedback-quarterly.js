document.addEventListener("DOMContentLoaded", function() {
    var currentDate = new Date().toISOString().slice(0, 7);
    document.getElementById("filterMonth").value = currentDate;
});

$(document).ready(function () {
    var tableFilterData = {
        'search': '',
    };
    $('.select2').select2();
    requestPage = 1;
    getAddedProjectClientTableData();

    //on change validation remove
    setupSelect2Validation();
    getNextQuarterFeedbackTable();

    //Filter on Employee tab
    var tableFilterData = {};
	tableFilterData['requestPage'] = 1; 


    $(document).on('change', '#filterMonth', function(){
        $('#quarterlyFeedbackTable h6').text('');
        getAddedProjectClientTableData();
        $('#quarterlyFeedbackTable').append(loading());
    });

    // function to get client quarterly feedback data
    function getAddedProjectClientTableData() {
        tableFilterData['search'] = $('#searchInput').val() ?? null;
        var monthYear = $('#filterMonth').val();
        $.ajax({
            url: APP_URL+'/quarterly/project/feedback',
            type: 'GET',
            data: { tableFilterData : tableFilterData, page: tableFilterData['requestPage'], monthYear: monthYear  },
            success: function (res) {
                if(res.data == 0){
                    $('#quarterlyFeedbackTable').html(tableNoData);
                }else{
                    var emailLog = res.log;
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="uTable"><thead class="table-light"><tr>
                            <th width="3%">#</th>
                            <th width="16%">Client Name</th>
                            <th width="72%">Project Name</th>
                            <th width="9%">Action</th>
                        </tr></thead><tbody class="table-border-bottom-0">`;
                    let num = 1;
                    $.each(res.data, function (k, v) {
                        var textDanger = (v.feedback ? '' : 'text-danger');
                        tc += '<tr data-id="'+v.client_id+'">';
                        tc += '<td class="'+textDanger+'">'+num+'</td>';
                        tc += '<td class="td-clientName '+textDanger+'">'+ v.name +'</td>';

                        var projectIds = '';
                        var projectNameWithAvp = $.map(v.projects, function(value, key) {
                            projectIds += (projectIds ? ', ' : '') + key;
                            return value.pName + ' (' + value.avpUser + ')';
                        }).join(', ');

                        tc += '<td class="td-projectName '+textDanger+'">'+ projectNameWithAvp +'</td>';
                        tc += '<td class="td-projectIds d-none">'+ projectIds +'</td>';
                        tc += '<td class="td-clientEmail d-none">'+ v.email +'</td>';
                        tc += '<td class="td-quarter d-none">'+ v.quarter +'</td>';
                        tc += '<td class="td-recommend d-none">'+ v.recommend +'</td>';
                        tc += '<td class="td-satisfied d-none">'+ v.satisfied +'</td>';
                        tc += '<td class="td-takenBy d-none">'+ v.taken_by +'</td>';
                        tc += '<td class="td-feedback d-none">'+ v.feedback +'</td>';
                        tc += '<td class="td-overallExperience d-none">'+ v.overall_experience +'</td>';
                        tc += '<td class="td-fillDate d-none">'+ v.filled_at +'</td>';
                        tc += '<td class="td-files d-none">'+ JSON.stringify(v.files) +'</td>';
                        tc += '<td class="td-fdView">';
                            if(v.feedback){
                            tc += `<label title="View Feedback" class="text-primary cursor-pointer showFeedback" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-id=${v.id}>
                                    <i class="bx bx-show me-1"></i></label>`;
                            }else{
                                tc += `<span class="bx bx-edit-alt addFeedback text-info cursor-pointer pe-1" title="Add Feedback" data-bs-toggle="modal" data-bs-target="#addFeedbackModal"></span> 
                                        <span class="bx bx-envelope sendEmailModal text-warning cursor-pointer pe-2" style="padding-right: 3px;" title="Send an email to client for feedback" ></span>`;
                            }
                            if(emailLog.hasOwnProperty(v.cId)){
                                if(v.feedback == '' || v.feedback == null){
                                    tc += `<label title="Copy Feedback Link" class="pe-1 text-primary cursor-pointer copyFeedbackLink" data-id=${emailLog[v.cId]}> <i class='bx bx-copy'></i> </label>`;
                                }
                                tc += `<label title="View Client Feedback Log" class="text-primary cursor-pointer showFeedbackLog" data-id=${emailLog[v.cId]}>
                                        <i class='bx bx-book-content ms-1'></i></label>`;
                            }
                        tc += '</td>';
                        tc += '</tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    tc += '</table>';

                    $('#quarterlyFeedbackTable').html(tc);
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    // Copy feedback link
    $(document).on('click', '.copyFeedbackLink', function(){
        var link = $(this).attr('data-id');
        if(link){
            link = APP_URL +'/project/quarterly/feedback/'+link;
            if(copyToClipboard(link)){
                successMessage('Link copied');
            }else{
                errorMessage('Something went wrong');
            }
        }
    });

    // Show client feedback details in offcanvas
    $(document).on('click', '.showFeedback', function () {
        var pNmae = $(this).closest('tr').find('.td-projectName').text();
        var cNmae = $(this).closest('tr').find('.td-clientName').text();
        var feedback = $(this).closest('tr').find('.td-feedback').text();
        var fillDate = $(this).closest('tr').find('.td-fillDate').text();
        var quarter = $(this).closest('tr').find('.td-quarter').text();
        var takenBy = $(this).closest('tr').find('.td-takenBy').text();
        var satisfied = $(this).closest('tr').find('.td-satisfied').text();
        var recommend = $(this).closest('tr').find('.td-recommend').text();
        var overallExperience = $(this).closest('tr').find('.td-overallExperience').text();

        var storedData = JSON.parse($(this).closest('tr').find('.td-files').text());
        var filesList = '';
        $.each(storedData, function(index, item) {
            let name = item.name;
            let filename = name.replace(/_(\d+)\.(\w+)$/, ".$2");
            filesList += '<li> <a href="'+ APP_URL+'/quarterly/feedback/file/'+item.id +'" target="_blank">' +filename+ '</a></li>'
        });

        $('.showDataTitle').empty();
        $('#showDataBody').empty();
        $('.showDataTitle').text('Client Feedback Details');
        $('#showDataBody').html(
            `<tr> <th>Client Name:</th> <td>${cNmae}</td> </tr>
            <tr> <th>Project Name:</th> <td>${pNmae}</td> </tr>
            <tr> <th>Feedback Quarter:</th> <td>${quarter}</td> </tr>
            <tr> <th>Feedback Added By:</th> <td>${takenBy}</td> </tr>
            <tr> <th>Feedback Added At:</th> <td>${fillDate}</td> </tr>
            <tr> <th>Satisfied:</th> <td>${satisfied}</td> </tr>
            <tr> <th>Recommend:</th> <td>${recommend}</td> </tr>
            <tr> <th>Overall Experience:</th> <td>${overallExperience}</td> </tr>
            <tr> <th>Feedback:</th> <td>${feedback}</td> </tr>
            <tr> <th>Uploded Files:</th> <td> <ol class="ps-3">${filesList}</ol> </td> </tr>`
        );
    });

    $(document).on('click', '.addFeedback ', function(){
        $('#client-feedback-Quarter-form')[0].reset();

        var projectIds = $(this).closest('tr').find('.td-projectIds');
        $('#quarterClientId').val($(this).closest('tr').data('id'));
        $('#quarterProjectId').val($(projectIds).text());
        $('#currentQuarter').val($('#filterMonth').val()+'-01');
    });

    $(document).on('click', '#saveQuarterlyFeedback', function(e){
        disableSubmitBtn('#saveQuarterlyFeedback');
        if (!validateForm()) {
            enableSubmitBtn('#saveQuarterlyFeedback');
            e.preventDefault();
        }
        $('#client-feedback-Quarter-form').ajaxSubmit({
            beforeSubmit: function () {
                $('.error-message').text('');
            },
            success: function (response) {
                enableSubmitBtn('#saveQuarterlyFeedback');
                if(response.success){
                    $('#addFeedbackModal').modal('hide');
                    successMessage(response.message);
                    getAddedProjectClientTableData();
                }else{
                    errorMessage(response.message)
                }
            },
            error: function (xhr) {
                enableSubmitBtn('#saveQuarterlyFeedback');
                if (xhr.status === 422) {
                    var errors = xhr.responseJSON.errors;
                    $.each(errors, function (field, error) {
                        var fieldElement = $("[id='" + field + "-error']");
                        if($(fieldElement).length){
                            $(fieldElement).text(error[0]);
                        }else{
                            errorMessage('Something went wrong! Please try again.');
                            setTimeout(function() {
                                location.reload();
                            }, 3000);
                        }
                    });
                } else {
                    errorMessage('Something went wrong! Please try again.');
                }
            },
        });
	});


    function getNextQuarterFeedbackTable(){
        $.ajax({
            url: APP_URL+'/next/quarter/project/feedback',
            type: 'GET',
            data: { },
            success: function (res) {
                if(res.data == 0){
                    $('#nextQuarterFeedbackTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="nextQuarterTable"><thead class="table-light"><tr>
                            <th>#</th>
                            <th>Client Name</th>
                            <th>Next Quarter</th>
                        </tr></thead><tbody class="table-border-bottom-0">`;
                    let num = 1;
                    $.each(res.data, function (k, v) {
                        tc += '<tr>';
                            tc += '<td>'+num+'</td>';
                            tc += '<td class="td-clientName">'+ v.name +'</td>';
                            var result = $.map(v.dates, function(value, key) {
                                return value;
                            }).join(', ');
                            tc += '<td class="td-projectName">'+ result+'</td>';
                        tc += '</tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    tc += '</table>';

                    $('#nextQuarterFeedbackTable').html(tc);
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }


    // FEEDBACK FORM VALIDATION 
    function validateForm() {
        var isValid = true;
        $('.text-danger').text('');

        if (!$('#satisfiedRatings').val()) {
            $('#satisfiedRatings-error').text('The satisfied ratings field is required.');
            isValid = false;
        }
        if (!$('#overallExperienceRatings').val()) {
            $('#overallExperienceRatings-error').text('The overall experience ratings field is required.');
            isValid = false;
        }
        if (!$('#recommendRatings').val()) {
            $('#recommendRatings-error').text('The recommend ratings field is required.');
            isValid = false;
        }
        var feedback = $('#feedback').val().trim();
        if (!feedback) {
            $('#feedback-error').text('The feedback field is required.');
            isValid = false;
        } else if (feedback.length < 10) {
            $('#feedback-error').text('The feedback must be at least 10 characters.');
            isValid = false;
        }

        return isValid;
    }

    $('#satisfied-ratings').rateYo({
        starWidth: "30px",
        numStars: 5,
        halfStar: true,
        ratedFill: '#21C0C0',
        onChange: function (rating, rateYoInstance) {
            $('#satisfied-ratings'). prop('title', rating);
        }
    });

    $('#overall-experience-ratings').rateYo({
        starWidth: "30px",
        numStars: 5,
        halfStar: true,
        ratedFill: '#21C0C0',
        onChange: function (rating, rateYoInstance) {
            $('#overall-experience-ratings'). prop('title', rating);
        }
    });

    $('#recommend-ratings').rateYo({
        starWidth: "30px",
        numStars: 5,
        halfStar: true,
        ratedFill: '#21C0C0',
        onChange: function (rating, rateYoInstance) {
            $('#recommend-ratings'). prop('title', rating);
        }
    });

    $('#satisfied-ratings').rateYo().on("rateyo.set", function (e, data) {
        $('#satisfiedRatings').val(data.rating);
        if($('#satisfiedRatings').val()){
            $('#satisfiedRatings-error').text('');
        }
    });

    $('#overall-experience-ratings').rateYo().on("rateyo.set", function (e, data) {
        $('#overallExperienceRatings').val(data.rating);
        if($('#overallExperienceRatings').val()){
            $('#overallExperienceRatings-error').text('');
        }
    });

    $('#recommend-ratings').rateYo().on("rateyo.set", function (e, data) {
        $('#recommendRatings').val(data.rating);
        if($('#recommendRatings').val()){
            $('#recommendRatings-error').text('');
        }
    });

    $('#feedback').on('keyup', function () {
        if($('#feedback').val()){
            $('#feedback-error').text('');
        }
    });

    $(document).on('click', '.sendEmailModal', function(e){
        var projectIds = $(this).closest('tr').find('.td-projectIds');
        var clientEmail =  $(this).closest('tr').find('.td-clientEmail').text();
        clientEmail = clientEmail != 'null' && clientEmail ? clientEmail : '';

        $('#emailQuarterClientId').val($(this).closest('tr').data('id'));
        $('#emailQuarterProjectId').val($(projectIds).text());
        $('#emailCurrentQuarter').val($('#filterMonth').val());
        $('#clientFeedbackEmail').val(clientEmail);
        $('#clientFeedbackEmail-error').text('');
        $('#clientFeedbackEmail').removeClass('error');
        $('#sendFeedbackEmailModal').modal('show');
    });


    $(document).on('click','#sendQuarterlyFeedbackEmail', function(e){
        e.preventDefault();
        $('#clientFeedbackQuarterEmailForm').validate({
            rules: {
                client_email: {
                    required: true,
                    email: true
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
                } else {
                    $(error).insertAfter($(element));
                }
            },
        });

        if($('#clientFeedbackQuarterEmailForm').valid()) {
            $('#clientFeedbackQuarterEmailForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.clientFeedbackEmail-error').text('');
                },
                success: function (response) {
                    $('#clientFeedbackEmail').val('');
                    $('#emailQuarterClientId').val('');
                    $('#emailQuarterProjectId').val('');
                    $('#emailCurrentQuarter').val('');
                    $('#clientFeedbackQuarterEmailForm').validate().resetForm();
                    $("#sendFeedbackEmailModal").modal("hide");
                    getAddedProjectClientTableData();
                    successMessage(response.message);
                },
                error: function (xhr) {
                    console.log('xhr: ', xhr);
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, "-");
                            $("#" + fieldId + "-error").text(error[0]);
                        });
                    }else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click', '.showFeedbackLog', function(){
        var feedbackId = $(this).attr('data-id');
        $.ajax({
            url: APP_URL+'/quarterly/feedback/email/log',
            type: 'GET',
            data: { feedbackId : feedbackId, },
            success: function (res) {
                if(res.success){
                    $('.showDataTitle').empty();
                    $('#showDataBody').empty();
                    $('.showDataTitle').text('Client Feedback Log Details');
                    var emailSentDetails = '';
                    var count = 1;
                    $.each(res.data, function (k, v) {
                        var sentTo = '';
                        if(v.sentTo){
                            sentTo = ' and sent an email to: '+v.sentTo;
                        }
                        emailSentDetails += '<tr><td> Email '+count+': Sent on '+ v.date +' by '+ v.sentBy + sentTo + '</td></tr>';
                        count++;
                    });
                    $('#showDataBody').html(
                        `<tr> <th>Feedback Email History:</th></tr> ${emailSentDetails}`
                    );
                    var myOffcanvas = new bootstrap.Offcanvas(document.getElementById('showData'));
                    myOffcanvas.show();
                }else{
                    errorMessage(res.message);
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

});