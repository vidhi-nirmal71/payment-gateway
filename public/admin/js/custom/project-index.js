$(document).ready(function () {
	var searchFilterState = 0;
	var tableFilterData = {};
	var overdue = 'No';

	var currentPath = window.location.pathname;
	// Get the query parameters (including the question mark)
	var queryParams = window.location.search;
	// Combine the path and query parameters to get the full URL with parameters
	var fullURL = currentPath + queryParams;
	
	if(fullURL == '/projects?data=overdue'){
		overdue = 'Yes';			
	}else{
		overdue = 'No';
	}

	//on change validation remove
    setupSelect2Validation();

	tableFilterData['requestPage'] = 1;
	performFilter();

	$('#searchInput').on('change', function () {
		tableFilterData['requestPage'] = 1;
		performFilter();
  	});

	$('#avpAssignedProjects').on('change', function() {
		performFilter();
	});

  	$('#projectUserFilter').change(function() {
		tableFilterData['requestPage'] = 1;
		performFilter();
  	});

	$('#projectManagerFilter').change(function() {
		tableFilterData['requestPage'] = 1;
		performFilter();
  	});

	  $('#projectClientFilter').change(function() {
		tableFilterData['requestPage'] = 1;
		performFilter();
  	});

  	$('#status, #type').on('change', function () {
		tableFilterData['requestPage'] = 1;
		performFilter();
  	});

	  $('#teamMember').on('change', function () {
		tableFilterData['requestPage'] = 1;
		performFilter();
  	});

  	$(document).on('click', '.btnClick', function () {
		tableFilterData['requestPage'] = $(this).attr('data-page');
		performFilter();
  	});

	  $('#teamMember').select2({
		placeholder: "Team Member",
		allowClear: true,
		minimumInputLength: 3,
		ajax: {
			dataType: 'json',
			delay: 250,
			url: APP_URL+'/search/users',
			processResults: function (data) {
				return {
					results: $.map(data, function (item) {
						return {
							text: item.name,
							id: item.id
						}
					})
				};
			},
			cache: true,
		}
	});

	$(document).on('click', '#resetProjectSearchForm', function () {
		searchFilterState = 1;
		$('#searchInput').val("");
		$('#projectManagerFilter').val(null).trigger('change');
		$('#projectClientFilter').val(null).trigger('change');
		$('#teamMember').val(null).trigger('change');
		$('#status').val(null).trigger('change');
		$('#type').val(null).trigger('change');
		$('#avpAssignedProjects').prop('checked',true);
		searchFilterState = 0;
		performFilter();
  	});

  	function performFilter() {
		if (searchFilterState == 0) {
			tableFilterData['search'] = $('#searchInput').val();
			tableFilterData['status'] = $('#status').val();
			tableFilterData['type'] = $('#type').val();
			tableFilterData['userFilter'] = $('select[name=userFilter]').val();
			tableFilterData['projectManager'] = $('select[name=projectmanagerFilter]').val();
			tableFilterData['projectClient'] = $('select[name=projectclientFilter]').val();
			tableFilterData['teamMember'] = $('#teamMember').val();
			tableFilterData['showAllProjectAVP'] = $('#avpAssignedProjects').length ? $('#avpAssignedProjects').prop('checked') : false;

			var page = tableFilterData['requestPage'];
			$('#projectTable').append(loading());
			$.ajax({
				url: APP_URL+'/projects/filter',
				type: 'POST',
				data: { tableFilterData: tableFilterData, page: page, overdue : overdue},
				success: function (res) {
					$('#projectTable').find('.loading-wrapper').remove();
					let indexStart = res.data.st;
					if(res.data.count == 0){
						$('#projectTable').html(tableNoData);
					}else{
						let tc = `<table class="table table-striped tablecontentcss table-hover" id="annTable"><thead class="table-light"><tr>
									<th class="text-center" width="4%">#</th>
									<th width="37%">Name</th>
									<th width="15%">PTA / PM</th>
									<th width="15%">Client</th>
									<th width="13%">Status</th>
									<th width="8%">Type</th>
									<th width="8%">Action</th>
								</tr></thead><tbody class="table-border-bottom-0">`;

						$.each(res.data.data, function (k, v) {
							let managerName = v.mName.split(' ');
							managerName = managerName[0];
							tc += '<tr>';
							if((res.data.permission.edit == true && v.pendingTimesheet == true) || v.staApprove){
								tc += '<td class="text-center"><span class="circle-with-text" title="Pending Timesheet">'+indexStart+'</span></td>';
							}else{
								tc += '<td class="text-center">'+indexStart+'</td>';
							}
							tc += '<td class="d-none td-id">'+v.id+'</td>';
							tc += '<td class="d-none td-name">'+v.name+'</td>';
							tc += '<td><a href="'+APP_URL+'/projects/'+v.id+'" class="' + (v.overdue ? 'text-danger' : 'project-name-link') +'" title="' + (v.overdue ? 'Show Overdue Project Details' : 'Show Project Details') +'">'+v.name+'</a></td>';
							tc += '<td> <div class="d-flex justify-content-start"> <img src="'+v.mImage+'" alt="Avatar" class="rounded-circle" title="'+v.mName+'" width="30" height="30"> <div class="d-flex flex-column mt-1"> <span class="text-truncate" style="margin-left: 6px;">'+ managerName +'</span> </div> </div> </td>';
							tc += '<td>'+v.client+'</td>';
							tc += '<td class="clickable-cell" data-item-id="'+v.id+'">';
								if((res.data.permission.edit == true && v.pStatus != 'Completed') || res.data.permission.can_edit_all == true){
									tc += '<span class="status-value" data-value="'+v.pStatus+'">'+v.pStatus+'</span>';
									tc += '<div class="dropdown" style="display: none;">';
									tc += '<select class="status-dropdown">';

									$.each(res.data.status, function (key, value) {
										tc += '<option value="'+key+'" '+(v.status == key ? 'selected' : '')+'>'+value+'</option>';
									});
									tc += '</select> </div>';
								}else{
									tc += v.pStatus;
								}
							tc += '</td>';
							tc += '<td>'+v.type+'</td>';
							tc += '<td>';
								if((res.data.permission.edit == true && v.pStatus != 'Completed')){
									tc += '<a href="'+APP_URL+'/projects/'+v.id+'/edit" title="Edit Project" class="text-info" id="editProject"> <i class="bx bx-edit-alt me-1"></i> </a>';
								}else if(res.data.permission.can_edit_all == true && v.reopenRequest == 1 ){
									tc+='<a title="Request for Re-open" class="text-secondary text-nowrap d-inline-block" id="reopenRequestAccepted">';
									tc +='<span class="tf-icons bx bxs-message-rounded-edit"></span>';
									tc +='<span class="badge rounded-pill bg-info text-white badge-notifications">'+(v.reopenRequest !== null ? v.reopenRequest: 0 )+'</span>';
									tc +='</a>';
								}else if(res.data.permission.edit == true && v.pStatus == 'Completed' && res.data.permission.can_edit_all != true && v.ProjectManager == true){
									tc += '<a title="Request to Re-open" class="text-info cursor-pointer" id="reopenRequest" data-item-project-id="'+v.id+'"> <i class="bx bx-reset me-1"></i> </a>';
								}
							tc += '<a href="'+APP_URL+'/projects/'+v.id+'" title="' + (v.overdue ? 'Show Overdue Project Details' : 'Show Project Details') +'" class="text-primary" id="showProject" data-item-project-id="'+v.id+'"> <i class="bx bx-show me-1"></i> </a>';

							if((res.data.permission.edit)){
								tc += '<span class="bx bxs-user-plus AddMemberButton cursor-pointer" style="padding-right: 3px;" title="Add Members" data-bs-toggle="modal" data-bs-target="#teamMemberModal"></span>'
							}

							if ((v.slack_timesheet)) {
								tc += '<span class="bx bxl-slack SlackButton cursor-pointer text-warning" style="padding-right: 3px;" title="Send today\'s timesheet in Slack" data-item-project-id="'+v.id+'"></span>';
							}

							// Show link to lms lead
							if(res.data.permission.edit == true && v.lmsLead){
								tc += '<a href="http://ips-lms.itpathsolutions.com:88/admin/leads/'+v.lmsLead+'" title="Open LMS Lead" target="_blank" class="text-primary cursor-pointer"> <i class="fa-solid fa-up-right-from-square cursor"></i> </a>';
							}
							tc += '</td></tr>';
							indexStart++;
						});
						if(res.data.morePage){
							tc += makePagination(res.data.button);
						}
						$('#projectTable').html(tc);
						var prevLink = $('#projectTable a.prev');
						var nextLink = $('#projectTable a.next');
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

	
	$(document).on('click','#reopenRequest', function(e){
		var projectId = $(this).data('item-project-id');
		$.ajax({
			url: APP_URL+'/project/reopenRequest',
			method: 'POST',
			data: {id : projectId},
			dataType: 'json',
			success: function (response) {
				successMessage(response.message);
			},
			error: function (xhr, status, error) {
				console.log(error);
			}
		});
		e.preventDefault();
	});

	
	$(document).on('click','.AddMemberButton', function(){
		var id = $(this).closest('tr').find('.td-id').text();
		var name = $(this).closest('tr').find('.td-name').text() == '' ? '-' : $(this).closest('tr').find('.td-name').text() ;
		getMemberFormData(id);
		$('.modal-title').html('Select Team Member For '+ name);
		$('#teamMemberModal').modal('show');
	});

	function getMemberFormData(id) {
		$.ajax({
			url: APP_URL + '/project/' + id + '/edit-member',
			type: 'GET',
			data: { id: id },
			success: function (response) {
				$('#teamMemberUpdate').empty();
				// Append selected team member option in select

				$('#id').val(id);
				$.each(response.data.allUsers, function (id, name) {
                    var option = new Option(name, id, true, true);
                    $('#teamMemberUpdate').append(option).trigger('change');
                });

				$('#teamMemberUpdate').select2({
					placeholder: "Select Team member",
					// allowClear: true,
					minimumInputLength: 3,
					ajax: {
						dataType: 'json',
						delay: 250,
						url: APP_URL+'/search/users',
						processResults: function (data) {
							return {
								results: $.map(data, function (item) {
									return {
										text: item.name,
										id: item.id
									}
								})
							};
						},
						cache: true,
					}
				});

				$('#team-member-form').validate().resetForm();
			},
			error: function (xhr, status, error) {
				console.log(error);
			},
		});
	}

	$(document).on('click', '#saveNewMember', function(){
		$('#team-member-form').validate({
			rules:{
				'team_members[]': {
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
                    $(error).insertAfter($(element).parent());      // radio/checkbox
                }else if ($(element).hasClass('select2-hidden-accessible')) {
					$(error).insertAfter($(element).next('span'));  // select2
				} else {
                    $(error).insertAfter($(element));               // default
                }
            },
    
            messages: {
                title: {
                    required: 'Team Members field is required',
				}
            },
        });

        if( $('#team-member-form').valid() ) {
            disableSubmitBtn('#saveNewMember');
            $('#team-member-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#teamMemberModal').modal('hide');
                    enableSubmitBtn('#saveNewMember');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveNewMember');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldElement = $("[id='" + field + "']");
                            fieldElement.next('div').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
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

		// $('.dropdown').not(dropdown).hide();
		$('.status-value').not(statusValue).show();
  	});

	function updateStatus(projectId, selectedOption, selectedText, PrevselectedText,cell) {
		$.ajax({
			url: APP_URL+'/project/update-status',
			method: 'POST',
			data: {
				projectId: projectId,
				selectedOption: selectedOption
			},
			dataType: 'json',
			success: function (response) {
				cell.find('.status-value').text(response.projectStatus);
				successMessage(response.message);
				if(PrevselectedText == 'Completed'){
					$.ajax({
						url: APP_URL+'/project/reopenRequest/accepted',
						method: 'POST',
						data: {id : projectId},
						dataType: 'json',
						success: function (response) {
							successMessage(response.message);
							setTimeout(() => {
								location.reload();
							}, 1100);
						},
						error: function (xhr, status, error) {
							console.log(error);
						}
					});
				}else if(selectedText == 'Completed'){
					location.reload();
				}
			},
			error: function (xhr, status, error) {
				console.log(error);
			}
		});
	}

	$(document).on('click', '.SlackButton', function () {
		const projectId = $(this).data('item-project-id');
		alert('Alert!','Are you sure you want to send today\'s timesheet data to Slack?','text-danger')
        .then(function(result) {
            if(result){
				$.ajax({
					url: APP_URL + '/projects/'+ projectId +'/slack-timesheet',
					method: 'POST',
					dataType: 'json',
					success: function (response) {
						successMessage(response.message);
					},
					error: function (xhr, status, error) {
						errorMessage(xhr.responseJSON.message);
					}
				});
			}
		});
	});

});
