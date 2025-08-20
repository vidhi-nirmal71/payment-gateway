$(document).ready(function () {
    var tableFilterData = {
        'search': '',
    };
    $('.select2').select2();
    requestPage = 1;
    getCompletedProjectClientTableData();

    //on change validation remove
    setupSelect2Validation();

    //Filter on Employee tab
    var tableFilterData = {};
	tableFilterData['requestPage'] = 1; 

    $('#searchInput').on('keyup', function () {
		tableFilterData['requestPage'] = 1;
		getCompletedProjectClientTableData();
  	});

  	$(document).on('click', '.btnClick', function () {
		tableFilterData['requestPage'] = $(this).attr('data-page');
        getCompletedProjectClientTableData();
  	});


    // fnc to get client list
    function getCompletedProjectClientTableData() {
        tableFilterData['search'] = $('#searchInput').val() ?? null;
        $.ajax({
            url: APP_URL+'/completed/project/feedback',
            type: 'GET',
            data: { tableFilterData : tableFilterData, page: tableFilterData['requestPage']  },
            success: function (res) {
                if(res.data.data == 0){
                    $('#completedFeedbackTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="uTable"><thead class="table-light"><tr>
                            <th>#</th>
                            <th>Project Name</th>
                            <th>Client Name</th>
                            <th class="text-center">View Log</th>
                            <th class="text-center">View Feedback</th>
                        </tr></thead><tbody class="table-border-bottom-0">`;

                    let num = res.data.st;
                    $.each(res.data.data, function (k, v) {
                        tc += '<tr data-id="'+v.id+'">';
                        tc += '<td>'+num+'</td>';
                        tc += '<td class="td-projectName">'+ v.project_name +'</td>';
                        tc += '<td class="td-clientName">'+ v.client_name +'</td>';
                        tc += `<td class="td-fdView text-center"> <label title="View Client Feedback Log" class="text-primary cursor-pointer showFeedbackLog" data-id=${v.id}>
                                <i class='bx bx-book-content me-1'></i></label> </td>`;
                        tc += '<td class="td-feedback d-none">'+ v.feedback +'</td>';
                        tc += '<td class="td-satisfied d-none">'+ v.satisfied +'</td>';
                        tc += '<td class="td-overall_experience d-none">'+ v.overall_experience +'</td>';
                        tc += '<td class="td-recommend d-none">'+ v.recommend +'</td>';
                        tc += '<td class="td-feedback_fill_date d-none">'+ v.feedback_fill_date +'</td>';
                        tc += '<td class="td-fdView text-center">';
                        if(v.feedback){
                        tc += `<label title="View Client Feedback" class="text-primary cursor-pointer showFeedback" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-id=${v.id}>
                                <i class="bx bx-show me-1"></i></label>`;
                        }else{
                            tc += '-';
                        }
                        tc += '</td>';
                        tc += '</tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#completedFeedbackTable').html(tc);
                    var prevLink = $('#uTable a.prev');
                    var nextLink = $('#uTable a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');

                    // Check if the 'feedback-view' parameter exists then show feedback details
                    const params = new URLSearchParams(window.location.search);
                    if (params.has('feedback-view')) {
                        const feedbackId = params.get('feedback-view');
                        const feedbackRow = $('tr[data-id="' + feedbackId + '"]');
                        if (feedbackRow.length) {
                            feedbackRow.find('.showFeedback').click();
                        }
                    }
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    // Show client feedback details
    $(document).on('click', '.showFeedback', function () {
        var pNmae = $(this).closest('tr').find('.td-projectName').text();
        var cNmae = $(this).closest('tr').find('.td-clientName').text();
        var feedback = $(this).closest('tr').find('.td-feedback').text();
        var satisfied = $(this).closest('tr').find('.td-satisfied').text();
        var overall_experience = $(this).closest('tr').find('.td-overall_experience').text();
        var recommend = $(this).closest('tr').find('.td-recommend').text();
        var feedbackFillDate = $(this).closest('tr').find('.td-feedback_fill_date').text();

        $('.showDataTitle').empty();
        $('#showDataBody').empty();
        $('.showDataTitle').text('Client Feedback Details');
        $('#showDataBody').html(
            `<tr> <th>Project Name:</th> <td>${pNmae}</td> </tr>
            <tr> <th>Client Name:</th> <td>${cNmae}</td> </tr>
            <tr> <th>Satisfied with Dev Service & Support:</th> <td>${satisfied}</td> </tr>
            <tr> <th>Overall Experience:</th> <td>${overall_experience}</td> </tr>
            <tr> <th>Recommend IT Path Solutions:</th> <td>${recommend}</td> </tr>
            <tr> <th>Received At:</th> <td>${feedbackFillDate}</td> </tr>
            <tr> <th>Feedback:</th> <td>${feedback}</td> </tr>`
        );
    });

    $(document).on('click', '.showFeedbackLog', function(){
        var feedbackId = $(this).attr('data-id');
        $.ajax({
            url: APP_URL+'/view/feedback/email/log',
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
                        emailSentDetails += '<tr><td> Email '+count+': Sent on '+ v +'</td></tr>';
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