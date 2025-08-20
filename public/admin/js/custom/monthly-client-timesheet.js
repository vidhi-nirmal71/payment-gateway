$(document).ready(function () {
    requestPage = 1;
    initializeFilters(true);
    monthlyClientTimesheet();

    $('#statusFilter, #clientFilter').select2();
    setupSelect2Validation();

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        monthlyClientTimesheet();
    });

    function getLastMonth() {
        var currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - 1);
        return currentDate.toISOString().slice(0, 7);
    }

    function initializeFilters(resetToLastMonth = false) {
        if (resetToLastMonth) {
            $('#filterMonth').val(getLastMonth());
        }
    }

    $(document).on('change', '#statusFilter, #clientFilter, #filterMonth', function () {
        monthlyClientTimesheet();
    });

    $('#resetBtn').click(function(){
        $('#clientFilter').val(null).trigger('change.select2');
        $('#statusFilter').val(null).trigger('change.select2');
        initializeFilters(true);
        monthlyClientTimesheet();
    });

    //Ajax call for fetch data
    function monthlyClientTimesheet() {
        $('#monthlyClientTimesheetTable').append(loading());
        var client = $('#clientFilter').val();
        var status = $('#statusFilter').val();
        var monthYear = $('#filterMonth').val();
        var lastMonth = getLastMonth();

        if(status != '' || client != '' || (monthYear !== '' && monthYear != lastMonth)){
            $('#resetBlock').show()
        }else{
            $('#resetBlock').hide()
        }

        $.ajax({
            url: APP_URL+'/report/monthly/client/timesheet/fetch',
            type: 'GET',
            data: {page: requestPage, monthYear: monthYear, client: client, status: status},
            success: function (res) {
                $('#filterSearch').removeClass('sending');
                if (res.data.data.length === 0) {
                    $('#monthlyClientTimesheetTable').html(tableNoData);
                } else {
                    let showAction = res.data.permission.delete === true;

                    let tc = `<table class="table table-striped tablecontentcss table-hover" id="monthlyClientTimesheetTableResult">
                                <thead class="table-light">
                                    <tr>
                                        <th>Client</th>
                                        <th>Project</th>
                                        <th>Resource</th>
                                        <th width="120px">Time</th>
                                        <th width="150px">Status</th>
                                        ${showAction ? '<th width="100px">Action</th>' : ''}
                                    </tr>
                                </thead>
                                <tbody class="table-border-bottom-0">`;
            
                    $.each(res.data.data, function (k, v) {
                        tc += '<tr id="row-' + v.id + '">';
                        tc += '<td class="td-client">' + (v.client_name ?? '-') + '</td>';
                        tc += '<td class="td-project">' + (v.project_name ?? '-') + '</td>';
                        tc += '<td class="td-resource" style="max-width:200px; white-space:normal; word-wrap:break-word; word-break:break-word;">' + (v.resources ?? '-') + '</td>';
                        tc += '<td class="td-time">' + (v.time ?? '-') + '</td>';
                        tc += '<td class="clickable-cell" data-item-id="'+v.id+'">';
								if((res.data.permission.edit == true)){
									tc += '<span class="status-value" data-value="'+v.statusValue+'">'+v.statusValue+'</span>';
									tc += '<div class="dropdown" style="display: none;">';
									tc += '<select class="status-dropdown">';

									$.each(res.statusData, function (key, value) {
										tc += '<option value="'+key+'" '+(v.status == key ? 'selected' : '')+'>'+value+'</option>';
									});
									tc += '</select> </div>';
								}else{
									tc += v.statusValue;
								}
						tc += '</td>';

                        if (showAction) {
                            tc += `<td class="text-center"> <label title="Delete" class="deleteRecord cursor-pointer" data-item-id='${v.id}'>
                                <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span></label></td>`;
                        }
                        tc += '</tr>';
                    });
            
                    tc += '</tbody>';
            
                    if (res.data.morePage) {
                        tc += makePagination(res.data.button);
                    }
            
                    tc += '</table>';
            
                    $('#monthlyClientTimesheetTable').html(tc);
            
                    // Replace pagination arrows
                    var prevLink = $('#monthlyClientTimesheetTable a.prev');
                    var nextLink = $('#monthlyClientTimesheetTable a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },                       
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    //Delete monthlyClientTimesheet
    $(document).on('click', '.deleteRecord', function () {
        var id = $(this).data('item-id');
        alert('Alert!','Are you sure you want to delete this data?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/report/monthly/client/timesheet/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        monthlyClientTimesheet();
                        successMessage(response.message);
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    // Hide Project list status change dropdown if user click outside
  	$(document).click(function (e) {
		e.stopPropagation();
		var container = $('.clickable-cell');
		if (container.has(e.target).length === 0) {
            if($('.clickable-cell .dropdown').is(':visible')){
				$('.clickable-cell .dropdown').hide();
				$('.clickable-cell .status-value').show();
	  		}
		}
  	});

    // Below code for project status change - dropdown
  	$(document).on('click', '.clickable-cell', function () {
		var cell = $(this);
		var dropdown = cell.find('.dropdown');
		var statusValue = cell.find('.status-value');
		var PrevselectedText = $(this).find(':selected').text();
		statusValue.hide();
		dropdown.show();
		dropdown.find('.status-dropdown').off('change');
		dropdown.find('.status-dropdown').on('change', function () {
	  		var selectedOption = $(this).val();
			var selectedText = $(this).find(':selected').text();
			dropdown.hide();
			statusValue.show();
			var projectId = cell.data('item-id');
			updateStatus(projectId, selectedOption, selectedText, PrevselectedText, cell);
		});

		$('.status-value').not(statusValue).show();
  	});

    function updateStatus(id, selectedOption, selectedText, PrevselectedText, cell) {
        alert('Alert!','Are you sure you want to change the status?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/report/monthly/client/timesheet/update-status',
                    method: 'POST',
                    data: {
                        id: id,
                        selectedOption: selectedOption
                    },
                    dataType: 'json',
                    success: function (response) {
                        cell.find('.status-value').text(response.timesheetStatus);
                        successMessage(response.message);
                    },
                    error: function (xhr, status, error) {
                        console.log(error);
                    }
                });
            }
        });
	}
});