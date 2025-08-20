$(document).ready(function () {
    var tableFilterData = {
        'search': '',
    };
    var requestPage = 1;

    getFilledTableData();

	$('#searchInput').on('keyup', function () {
		requestPage = 1;
		getFilledTableData();
  	});

  	$(document).on('click', '.btnClick', function () {
		requestPage = $(this).attr('data-page');
        getFilledTableData();
  	});

    function getFilledTableData() {
        tableFilterData['search'] = $('#searchInput').val() ?? null;
        $.ajax({
            url: APP_URL+'/quarterly/get/all/feedback',
            type: 'GET',
            data: { tableFilterData : tableFilterData, page: requestPage  },
            success: function (res) {
                if(res.data.data == 0){
                    $('#feedbackTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="uTable"><thead class="table-light"><tr>
                            <th width="3%">#</th>        
                            <th width="10%">Quarter Month</th>
                            <th width="12%">Client Name</th>
                            <th width="67%">Project Name</th>
                            <th width="8%" class="text-center">Action</th>
                        </tr></thead><tbody class="table-border-bottom-0">`;

                    let num = res.data.st;
                    $.each(res.data.data, function (k, v) {
                        tc += '<tr>';
                        tc += '<td>'+num+'</td>';
                        tc += '<td class="td-quarterMonth">'+ v.quarter +'</td>';
                        tc += '<td class="td-client">'+ v.client_name +'</td>';
                        tc += '<td class="td-projectName">'+ v.projects +'</td>';
                        tc += '<td class="td-recommend d-none">'+ v.recommend +'</td>';
                        tc += '<td class="td-satisfied d-none">'+ v.satisfied +'</td>';
                        tc += '<td class="td-takenBy d-none">'+ v.taken_by +'</td>';
                        tc += '<td class="td-feedback d-none">'+ v.feedback +'</td>';
                        tc += '<td class="td-overallExperience d-none">'+ v.overall_experience +'</td>';
                        tc += '<td class="td-fillDate d-none">'+ v.filled_at +'</td>';
                        tc += '<td class="td-files d-none">'+ JSON.stringify(v.files) +'</td>';
                        tc += `<td class="td-fdView text-center"> <label title="View Feedback" class="text-primary cursor-pointer showFeedback" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-id=${v.id}> <i class="bx bx-show me-1"></i></label></td>`;


                        tc += '</tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#feedbackTable').html(tc);
                    var prevLink = $('#uTable a.prev');
                    var nextLink = $('#uTable a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    // Show client feedback details in offcanvas
    $(document).on('click', '.showFeedback', function () {
        var pNmae = $(this).closest('tr').find('.td-projectName').text();
        var cNmae = $(this).closest('tr').find('.td-client').text();
        var feedback = $(this).closest('tr').find('.td-feedback').text();
        var fillDate = $(this).closest('tr').find('.td-fillDate').text();
        var quarter = $(this).closest('tr').find('.td-quarterMonth').text();
        var takenBy = $(this).closest('tr').find('.td-takenBy').text();
        var satisfied = $(this).closest('tr').find('.td-satisfied').text();
        var recommend = $(this).closest('tr').find('.td-recommend').text();
        var overallExperience = $(this).closest('tr').find('.td-overallExperience').text();
        var storedData = JSON.parse($(this).closest('tr').find('.td-files').text());
        var filesList = '';
        $.each(storedData, function(i, v) {
            let name = v.name;
            let filename = name.replace(/_(\d+)\.(\w+)$/, ".$2");
            filesList += '<li> <a href="'+ APP_URL+'/quarterly/feedback/file/'+ v.id +'" target="_blank">' +filename+ '</a></li>'
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

});
