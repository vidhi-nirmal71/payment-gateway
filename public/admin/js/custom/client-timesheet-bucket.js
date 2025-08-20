$(document).ready(function () {
    var tableFilterData = {
        'client': '',
    };
    $('.select2').select2();
    requestPage = 1;
    let canViewBucket = false;
    getClientTableData();

    //on change validation remove
    setupSelect2Validation();

    //Filter on Employee tab
    var tableFilterData = {};
	tableFilterData['requestPage'] = 1; 

  	$('#client').on('change', function () {
		tableFilterData['requestPage'] = 1;
		getClientTableData();
  	});

  	$(document).on('click', '.btnClick', function () {
		tableFilterData['requestPage'] = $(this).attr('data-page');
        getClientTableData();
  	});


    // fnc to get client list
    function getClientTableData() {
		tableFilterData['client'] = $('#client').val() ?? null;
        $.ajax({
            url: APP_URL+'/fetch/client/bucket/list',
            type: 'GET',
            data: { tableFilterData : tableFilterData, page: tableFilterData['requestPage']  },
            success: function (res) {
                if(res.data.data == 0){
                    $('#clientTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="uTable"><thead class="table-light"><tr>
                            <th>#</th>
                            <th style="min-width: 100px;">Client</th>
                            <th style="min-width: 100px;">Project(s)</th>
                            <th style="min-width: 100px;">Bucket</th>
                            <th style="min-width: 92px;">Reminder</th>
                            <th class="text-end" style="min-width: 76px;">Total</th>
                            <th class="text-end" style="min-width: 100px;">Consumed</th>
                            <th class="text-end" style="min-width: 100px;">Remaining</th>
                        </tr></thead><tbody class="table-border-bottom-0">`;

                    let num = res.data.st;
                    if(res.data.permission.bucket_refill){
                        canViewBucket = true;
                    }
                    $.each(res.data.data, function (k, v) {
                        var activeClass = v.isNegative ? 'text-danger' : 'text-success';
                        tc += '<tr data-id="'+v.id+'">';
                        tc += '<td>'+num+'</td>';
                        tc += '<td class="td-client">'+ v.client +'</td>';
                        tc += '<td class="td-project">'+ v.projects +'</td>';
                        if(canViewBucket){
                            tc += '<td class="td-bucket text-primary cursor-pointer" title="View Bucket Details & Refill">'+ v.bucket +'</td>';
                        }else{
                            tc += '<td class="td-bucket">'+ v.bucket +'</td>';
                        }
                        tc += `<td ${v.threshold_reminder == 1 && v.stackholders?.length ? `title="${v.stackholders.join(', ')}"` : ''}>
                                    <span class="${v.threshold_reminder == 1 ? 'dotted-underline' : ''}">
                                    ${v.threshold_reminder == 1 ? 'Yes' : 'No'}
                                    </span>
                                </td>`;
                        tc += '<td class="td-total cursor-pointer text-end text-primary" title="View bucket refill history">'+ v.total +'</td>';
                        tc += '<td class="td-consumed cursor-pointer text-end text-primary" title="View client timesheet for this bucket">'+ v.consumed +'</td>';
                        tc += '<td class="td-remaining text-end '+ activeClass +'">'+ v.remaining +'</td>';
                        // tc += '<td class="text-center">';
                    
                        // if(res.data.permission.view == true){
                        //     tc +=`<a title="Show Client Details" class="text-primary cursor-pointer" id="showClientDetails" href="${APP_URL}/client/details/${v.id}">
                        //     <i class="bx bx-show me-1"></i></a>`;
                        // }
                        // if(res.data.permission.edit == true){
                        //     tc +=`<label title="Edit Client" onclick="setFocusOnFirstInput(\'#userModal\')" class="editClient cursor-pointer" aria-controls="offcanvasEnd" data-item-id="${ v.id }"
                        //     data-item-user-id="${ v.id }"> <span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>`;
                        // }
                        // tc += '</td>'
                        tc += '</tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#clientTable').html(tc);
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

    // Show client timesheet based on bucket
    $(document).on('click', '.td-consumed', function () {
        var bucketId = $(this).closest('tr').data('id');
        let urlToOpen = APP_URL+'/project/client/bucket/timesheet/'+bucketId;
        window.location.href = urlToOpen;
    });

    // Show client timesheet based on bucket
    $(document).on('click', '.td-total', function () {
        var bucketId = $(this).closest('tr').data('id');
        let urlToOpen = APP_URL+'/project/client/bucket/refill/'+bucketId;
        window.location.href = urlToOpen;
    });

    // Bucket link open 
    $(document).on('click', '.td-bucket', function () {
        if(canViewBucket){
            var bucketId = $(this).closest('tr').data('id');
            let urlToOpen = APP_URL+'/client/bucket/details/'+bucketId;
            window.location.href = urlToOpen;
        }
    });

});