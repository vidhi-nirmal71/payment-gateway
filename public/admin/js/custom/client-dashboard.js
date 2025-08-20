$(document).ready(function () {
    var requestPage = 1;
    var dateFilter = {};
    filterLabelChange();
    getBucketTableData();
    getProjectFilterData();

  	$(document).on('click', '.btnClick', function () {
		requestPage = $(this).attr('data-page');
        getBucketTableData();
  	});

    // fnc to get bucket list
    function getBucketTableData() {
        $.ajax({
            url: APP_URL+'/client/fetch/bucket/list',
            type: 'GET',
            data: { page: requestPage },
            success: function (res) {
                if(res.data.data == 0){
                    $('#clientTable').html(tableNoData);
                }else{
                    $('#clientBucketSection').show();
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="uTable"><thead class="table-light"><tr>
                            <th style="width:50px;">#</th>
                            <th>Bucket</th>
                            <th>Project(s)</th>
                            <th class="text-end" width="80px">Total</th>
                            <th class="text-end" width="100px">Consumed</th>
                            <th class="text-end" width="100px">Remaining</th>
                        </tr></thead><tbody class="table-border-bottom-0">`;

                    // let num = res.data.st;
                    let num = 1;
                    $.each(res.data.data, function (k, v) {
                        var activeClass = v.isNegative ? 'text-danger' : 'text-success';
                        tc += '<tr data-id="'+v.id+'">';
                        tc += '<td>'+num+'</td>';
                        tc += '<td class="td-bucket cursor-pointer text-primary">'+ v.bucket +'</td>';
                        tc += '<td class="td-project">'+ v.projects +'</td>';
                        tc += '<td class="td-total text-end" title="View bucket refill history">'+ v.total +'</td>';
                        tc += '<td class="td-consumed text-end" title="View client timesheet for this bucket">'+ v.consumed +'</td>';
                        tc += '<td class="td-remaining text-end '+ activeClass +'">'+ v.remaining +'</td>';
                        tc += '</tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    // if(res.data.morePage){
                    //     tc += makePagination(res.data.button);
                    // }
                    tc += '</table>';
                    $('#clientTable').html(tc);
                    // var prevLink = $('#uTable a.prev');
                    // var nextLink = $('#uTable a.next');
                    // prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    // nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    //Show client timesheet based on bucket
    $(document).on('click', '.td-bucket', function () {
        var bucketId = $(this).closest('tr').data('id');
        let urlToOpen = APP_URL + '/client/bucket/refill/history/' + bucketId;
        window.location.href = urlToOpen; // Open in same window
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
        $('#filterBlock').hide();
    }

    function showFilterDatesBlock(){
        $('#startDateBlock').show();
        $('#endDateBlock').show();
        $('#filterBlock').show();
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
            enableSubmitBtn('#filterSearch');
        }else{
            $('#filterSearch').attr('disabled', true);
        }
    });

    $('#filterSearch').on('click', function(){
        disableSubmitBtn('#filterSearch');
        dateFilter['startDate'] = $('#filterStartDate').val();
        dateFilter['endDate'] = $('#filterEndtDate').val();
        getProjectFilterData();
    });

    // Duration filter dropdown change
    $('#durationFilter li').on('click', function(){
        let selector = $(this).children();
        filterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        filterLabelChange();
        
        if(filterText != 'date'){
            hideFilterDatesBlock();
            getProjectFilterData();
        }else if(filterText == 'date'){
            showFilterDatesBlock();
        }
    });

    // fetch project based on duration filter
    function getProjectFilterData() {
        $('#clientProjectSection').append(loading());
        $.ajax({
            url: APP_URL+'/client/fetch/dashboard/projectdata',
            type: "GET",
            data: {
                page: requestPage,
                filter: filterText,
                dateFilter: dateFilter,
            },
            success: function (res) {
                $('#filterSearch').removeClass('sending');
                if(res.data && res.data?.data.length > 0){
                    let projectsData = '';
                    $.each(res.data.data, function (k, v) {
                        projectsData += `<div class="col-lg-4 col-md-6 col-sm-12 mb-3" title="Click to view timesheet entries for ${v.project_name}">
                            <div class="card widget dashboard-widget card-border-shadow-warning h-100" style="cursor: pointer;" onclick="window.location.href='${APP_URL}/client/project/${v.id}'">
                                <div class="card-body-personal">
                                    <div class="time-list">
                                        <div class="dash-pro-list pt-3 text-center">
                                            <h4 class="mb-2 res-count">${v.project_name}</h4>
                                            <div class="d-flex gap-11 justify-content-between">
                                                <div class="d-flex align-items-center widget-icon me-3">
                                                    <div class="avatar me-2"> <span class="avatar-initial rounded-2 bg-label-dark"><i class="icon-base bx bx-group icon-lg text-dark"></i></span> </div>
                                                    <div> <h6 class="mb-0 pe-2">Resource: ${v.resourceCount}</h6> </div>
                                                </div>
                                                <div class="d-flex align-items-center widget-icon" title="Total consumed hours">
                                                    <div class="avatar me-2"> <span class="avatar-initial rounded-2 bg-label-dark"><i class="icon-base bx bx-hourglass icon-lg text-dark"></i></span> </div>
                                                    <div> <h6 class="mb-0 pe-2">Hours: ${v.hours}</h6> </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    });
                    $('#clientProjectSection').html(projectsData);
                }else{
                    $('#clientProjectSection').html(tableNoData);
                }
            },
            error: function (xhr, status, error) {
                clientTimesheetAjaxProgress = false;
                console.log(error);
            },
        });
    }

});