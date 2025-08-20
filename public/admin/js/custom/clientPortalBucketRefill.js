$(document).ready(function () {
    var page = 1;

    fetchBucketTableData();

    // Show client bucket details in sidebar
    $(document).on('click', '.showRefillDetails', function () {
        var hours = $(this).closest('tr').find('.bHours').text();
        var details = $(this).closest('tr').find('.bDetails').text();
        var addedBy = $(this).closest('tr').find('.bAddedBy').text();
        var addedAt = $(this).closest('tr').find('.bAddedAt').text();

        $('.showDataTitle').empty();
        $('#showDataBody').empty();
        $('.showDataTitle').text('Bucket Refill Details');
        $('#showDataBody').html(
            `<tr> <th>Hours:</th> <td>${hours}</td> </tr>
            <tr> <th>Details:</th> <td>${details}</td> </tr>
            <tr> <th>Added By:</th> <td>${addedBy}</td> </tr>
            <tr> <th>Added At:</th> <td>${addedAt}</td> </tr> </tr>`
        );
    });

    $(document).on('click', '.btnClick', function () {
		page = $(this).attr('data-page');
		fetchBucketTableData();
  	});

    function fetchBucketTableData() {
        $.ajax({
            url: APP_URL+'/client/fetch/bucket/refill/list',
            type: 'GET',
            data: { bucketId : bucketId, page: page },
            success: function (res) {
                if(res.data.data.length == 0){
                    $('#bucketTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="bucket_data">
                                <thead>
                                    <tr>
                                        <th style="width:50px;">#</th>
                                        <th style="width:100px;">Hours</th>
                                        <th>Details</th>
                                        <th style="width:160px;">Added By</th>
                                        <th style="width:120px;">Added At</th>
                                        <th style="width:100px;" class="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="document-list-body" class="table-border-bottom-0">`;

                    let num = res.data.st;
                    $.each(res.data.data, function (k, v) {
                        tc += '<tr>';
                        tc += '<td>'+num+'</td>';
                        tc += '<td class="bHours">'+v.hours+'</td>';
                        tc += '<td class="bDetails">'+v.details+'</td>';
                        tc += '<td class="bAddedBy">'+v.added_by+'</td>';
                        tc += '<td class="bAddedAt">'+v.added_at+'</td>';
                        tc += `<td class="text-center">
                                <label class="showRefillDetails cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">
                                    <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span>
                                </label>`;
                        tc += '</td></tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#bucketTable').html(tc);
                    var prevLink = $('#bucket_data a.prev');
                    var nextLink = $('#bucket_data a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
                $('#hoursBar').html(
                    'Bucket Name: <b>'+bucketName + '</b> &nbsp; | &nbsp; ' +
                    'Total: <b>' + res.hoursData.bucketTotalHoursHHmm + '</b> &nbsp; | &nbsp; ' +
                    'Consumed: <b>' + res.hoursData.timesheetHHmm + '</b> &nbsp; | &nbsp; ' +
                    '<span class="' + (res.hoursData.isNegative === true ? 'text-danger' : 'text-success') + '">Remaining: <b>' +
                    res.hoursData.remainingHoursHHmm + '</b></span>'
                );
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    //Show open project page
    $(document).on('click', '.pName', function () {
        var projectId = $(this).closest('tr').data('id');
        let urlToOpen = APP_URL+'/client/project/'+projectId;
        window.open(urlToOpen, '_blank');
    });

});