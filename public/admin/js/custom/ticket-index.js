$('#projectManagerFilter, #priority, #ticketStatus').select2();
$(document).ready(function () {
	var searchFilterState = 0;
	var requestPage = 1;
	performFilter();

	$('#searchInput').on('change', function () {
		requestPage = 1;
		performFilter();
  	});

  	$('#teamMember, #priority, #ticketStatus').on('change', function () {
		requestPage = 1;
		performFilter();
  	});

  	$(document).on('click', '.btnClick', function () {
		requestPage = $(this).attr('data-page');
		performFilter();
  	});

	// fetch team members for filter
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

	// fetch team members for filter
	$('#ticketProject').select2({
		dropdownParent: $('#ticketModal'),
		placeholder: "Select Project",
		allowClear: true,
		minimumInputLength: 3,
		ajax: {
			dataType: 'json',
			delay: 250,
			url: APP_URL+'/project/search',
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

	// Reset Filters
	$(document).on('click', '#resetProjectSearchForm', function () {
		searchFilterState = 1;
		$('#searchInput').val("");
		$('#priority').val(null).trigger('change');
		$('#ticketStatus').val(null).trigger('change');
		$('#teamMember').val(null).trigger('change');
		searchFilterState = 0;
		performFilter();
  	});

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
			var ticketId = cell.data('item-id');
			updateStatus(ticketId, selectedOption, cell);
		});

		// $('.dropdown').not(dropdown).hide();
		$('.status-value').not(statusValue).show();
	});

	function updateStatus(ticketId, selectedOption, cell) {
		$.ajax({
			url: APP_URL+'/tickets/change/status',
			method: 'POST',
			data: {
				ticketId: ticketId,
				status: selectedOption
			},
			dataType: 'json',
			success: function (response) {
				cell.find('.status-value').text(response.status);
				successMessage(response.message);
			},
			error: function (xhr, status, response) {
				errorMessage(response.message);
			}
		});
	}

  	function performFilter() {
		if (searchFilterState == 0) {
			let search = $('#searchInput').val() ?? '';
			let teamMember = $('#teamMember').val() ?? '';
			let priority = $('#priority').val() ?? '';
			let ticketStatus = $('#ticketStatus').val() ?? '';
			if(search != '' || teamMember != '' || priority != '' || ticketStatus != '') {
				$('.reset-filter').show();
			}else{
				$('.reset-filter').hide();
			}

			var page = requestPage;
			$('#projectTable').append(loading());
			$.ajax({
				url: APP_URL+'/tickets/fetchdata',
				type: 'GET',
				data: { search: search, teamMember: teamMember, priority: priority, ticketStatus: ticketStatus, page: page},
				success: function (res) {
					$('#projectTable').find('.loading-wrapper').remove();
					if(res.data.data == 0){
						$('#projectTable').html(tableNoData);
					}else{
						let indexStart = res.data.st;
						let tc = `<table class="table table-striped tablecontentcss table-hover" id="annTable"><thead class="table-light"><tr>
								<th class="text-center" width="4%">#</th>
								<th width="14%">Ticket Code</th>
								<th width="14%">Created By</th>
								<th>Subject</th>
								<th width="10%">Date</th>
								<th width="9%">Status</th>
								<th width="8%">Priority</th>
								<th width="5%">Action</th>
							</tr></thead><tbody class="table-border-bottom-0">`;

						$.each(res.data.data, function (k, v) {
							tc += '<tr class="parentTr" data-item-id="'+v.id+'">';
							tc += '<td class="text-center">'+indexStart+'</td>';
							tc += '<td class="td-code">'+v.code+'</td>';
							tc += '<td class="td-createdBy">'+v.createdBy+'</td>';
							tc += '<td class="td-subject" title="'+ v.subject +'">'+ sliceText(v.subject, 70)+'</td>';
							tc += '<td class="td-createdAt">'+v.createdAt+'</td>';
							// tc += '<td class="td-status">'+v.status+'</td>';
							tc += '<td class="clickable-cell" data-item-id="'+v.id+'">';
								if((v.permission.responder == true || v.permission.manage == true)){
									tc += '<span class="status-value" data-value="'+v.tStatus+'">'+v.tStatus+'</span>';
									tc += '<div class="dropdown" style="display: none;">';
									tc += '<select class="status-dropdown">';

									$.each(res.data.statuses, function (key, value) {
										tc += '<option value="'+key+'" '+(v.status == key ? 'selected' : '')+'>'+value+'</option>';
									});
									tc += '</select> </div>';
								}else{
									tc += v.tStatus;
								}
							tc += '</td>';
							tc += '<td class="td-priority">'+v.priority+'</td>';
							tc += '<td class="td-message d-none">'+v.message+'</td>';
							tc += '<td class="td-project d-none">'+v.project+'</td>';
							tc += '<td class="td-closedBy d-none">'+v.closedBy+'</td>';
							tc += '<td class="td-closedAt d-none">'+v.closedAt+'</td>';
							tc += '<td class="td-attachment d-none">'+v.attachment+'</td>';
							tc += '<td class="td-responder d-none">'+v.permission.responder+'</td>';
							tc += '<td class="td-comment d-none">'+v.comment+'</td>';
							
							tc += '<td>';
							tc += `<label title="View Ticket Details" class="text-primary cursor-pointer showDetails" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="${v.id}">
										<i class="bx bx-show me-1"></i>
									</label>`;
							if (v.permission.edit === true) {
								tc += `<label title="Edit Ticket" onclick="setFocusOnFirstInput('#ticketModal')" class="text-info cursor-pointer editTicket" data-item-id="${v.id}">
											<i class="bx bx-edit-alt me-1"></i>
									   </label>`;
							}
							if (v.permission.delete === true) {
								tc += `<label title="Delete Ticket" class="deleteTicket cursor-pointer" data-item-id="${v.id}">
											<span class="text-danger"><i class="bx bx-trash me-1"></i></span>
									   </label>`;
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

	$(document).on('click', '.showDetails', function () {
		$('.showDataTitle').empty();
		$('#showDataBody').empty();
		$('.showDataTitle').text('Ticket Details');
		let parentTr = $(this).parents('.parentTr');
		let code = parentTr.find('.td-code').text();
		let createdBy = parentTr.find('.td-createdBy').text();
		let subject = parentTr.find('.td-subject').text();
		let createdAt = parentTr.find('.td-createdAt').text();
		let status = parentTr.find('.td-status').text().trim();
		let priority = parentTr.find('.td-priority').text();
		let message = parentTr.find('.td-message').text();
		let project = parentTr.find('.td-project').text();
		let closedBy = parentTr.find('.td-closedBy').text();
		let closedAt = parentTr.find('.td-closedAt').text();
		let attachment = parentTr.find('.td-attachment').text();
		let responderFlag = parentTr.find('.td-responder').text();
		let comment = parentTr.find('.td-comment').text();
		let ticketId = $(parentTr).data('item-id');

		let htmlData = '';
		if (code) htmlData += `<tr> <th>Ticket Code:</th> <td>${code}</td> </tr>`;
		if (subject) htmlData += `<tr> <th>Subject:</th> <td>${subject}</td> </tr>`;
		if (message != '') htmlData += `<tr> <th>Details:</th> <td>${message}</td> </tr>`;
		if (status) htmlData += `<tr> <th>Status:</th> <td class='text-capitalize'>${status}</td> </tr>`;
		if (priority) htmlData += `<tr> <th>Priority:</th> <td>${priority}</td> </tr>`;
		if (project) htmlData += `<tr> <th>Project:</th> <td>${project}</td> </tr>`;
		if (createdBy) htmlData += `<tr> <th>Created By:</th> <td>${createdBy}</td> </tr>`;
		if (createdAt) htmlData += `<tr> <th>Created At:</th> <td>${createdAt}</td> </tr>`;
		if (closedBy) htmlData += `<tr> <th>Closed By:</th> <td>${closedBy}</td> </tr>`;
		if (closedAt) htmlData += `<tr> <th>Closed At:</th> <td>${closedAt}</td> </tr>`;
		if (attachment != 'null') htmlData += `<tr> <th>Attachment:</th> <td><a href="${APP_URL}/storage/tickets/${attachment}" target="_blank" class="text-primary">Download Attachment</a></td> </tr>`;
		if (comment != '') htmlData += `<tr> <th>Previous Comment:</th> <td>${comment}</td> </tr>`;

		if(responderFlag == 'true'){
			htmlData += `<tr> <th class='align-top'>Comment:</th>
					<td> <textarea class="form-control comment" name="ticketComment" placeholder="Enter Comment" row="2" value="" id="ticketComment"></textarea> </td>
				</tr>`;

			htmlData += `<tr> <th class='align-middle'>Action:</th> <td>
				<button type='button' data-id='${ticketId}' data-class='addComment' class='btn btn-primary me-sm-3 me-1 mt-1 save-comment-btn'>Save</button>
				</tr>`;
		}

		$('#showDataBody').html(htmlData);
	});

	$(document).on('click', '.save-comment-btn', function () {
		var tdParent = $(this).closest("td");
		var tableParent = tdParent.closest("table");
		$("button", tdParent).prop("disabled", true);

		let ticketId = $(this).attr("data-id");
		let comment = tableParent.find('#ticketComment').val();

		var confirmMsg = 'Are you sure you want to add comment?';
		
		alert('Alert!', confirmMsg, 'text-danger')
		.then(function(result) {
			if(result){
				$.ajax({
					url: APP_URL+"/tickets/comment/save",
					type: "POST",
					data: { ticketId: ticketId, comment: comment},
					success: function (response) {
						if(response.success){
							$('.offcanvas').toggleClass('is-open');
							$('.offcanvas .btn-close').click();
							successMessage(response.message);
						}else{
							errorMessage(response.message);
						}
						performFilter();
					},
					error: function (xhr, status, response) {
						var tdParent = $(this).closest("td");
						$("button", tdParent).prop("disabled", false);
						errorMessage(response.message);
					},
				});
			}else{
				$('.offcanvas').toggleClass('is-open');
				$('.offcanvas .btn-close').click()
			}
		});
	});

	$(document).on('click', '.addNewTicket', function () {
		$('#new-ticket-form')[0].reset();
		$('#new-ticket-form').trigger('reset');
		$('#ticketCode').val(generateRandomString());
		$('#new-ticket-form').attr('action', APP_URL + '/tickets/store');
		$('#ticketModal').modal('show');
	});

	function generateRandomString(length = 4) {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			result += characters.charAt(randomIndex);
		}
		const paddedUserId = userId.toString().padStart(4, '0')
		return result + paddedUserId;
	}
	
	$(document).on('click', '#saveTicket', function() {
		$('#new-ticket-form').validate({
			highlight: function(element, errorClass, validClass) {
				$(element).addClass(errorClass).removeClass(validClass);
				$(element).parent('div').addClass('input-error').removeClass(validClass);
			},
			unhighlight: function(element, errorClass, validClass) {
				$(element).removeClass(errorClass).addClass(validClass);
				$(element).parent('div').removeClass('input-error').addClass(validClass);
			},
			errorPlacement: function(error, element) {
				if ($(element).parent('.input-group').length) {
					$(error).insertAfter($(element).parent()); // radio/checkbox
				} else {
					$(error).insertAfter($(element)); // default
				}
			},
			rules: {
				ticket_code: {
					required: true
				},
				ticket_priority: {
					required: true
				},
				ticket_subject: {
					required: true, maxlength: 255
				},
				ticket_attachment: {
					required: false, // Make this required if you need it
					extension: "jpg|jpeg|png|pdf|docx|xlsx|zip"
				}
			},
			messages: {
				ticket_code: {
					required: "Ticket code is required"
				},
				ticket_priority: {
					required: "Priority is required"
				},
				ticket_subject: {
					required: "Subject is required",
					maxlength: 'The ticket subject must not be greater than 255 characters'
				},
				ticket_details: {
					required: "Details are required"
				},
				ticket_project: {
					required: "Project is required"
				},
				ticket_attachment: {
					extension: "Only image, pdf, docx, xlsx, and zip files are allowed."
				}
			}
		});

		// If the form is valid, submit it
		if ($('#new-ticket-form').valid()) {
			disableSubmitBtn('#saveTicket');
			$('#new-ticket-form').ajaxSubmit({
				beforeSubmit: function() {
					$('.error-message').text('');
				},
				success: function(response) {
					$('.newRowAppended').empty();
					$('#new-ticket-form').validate().resetForm();
					$('#ticketModal').modal('hide');
					$('#ticketPriority').val(null).trigger('change');
					performFilter();
					enableSubmitBtn('#saveTicket');
					successMessage(response.message);
				},
				error: function(xhr) {
					console.log('xhr: ', xhr);
					if (xhr.status === 422) {
						var errors = xhr.responseJSON.errors;
						$.each(errors, function(field, error) {
							var fieldId = field.replace(/\./g, '-');
							$('#' + fieldId + '-error').text(error[0]);
						});
					} else {
						console.log(xhr);
					}
				}
			});
		}
	});

	$(document).on('click', '.editTicket', function () {
		let parentTr = $(this).parents('.parentTr');
		let ticketId = $(parentTr).data('item-id');

		$.ajax({
			url: APP_URL + '/tickets/' + ticketId + '/edit',
			type: 'GET',
			success: function(response) {
				if(response.status == 'success'){
					let ticket = response.data;
					$('#ticketModalLabel').text('Edit Ticket');
					$('#ticketCode').val(ticket.ticket_code);
					$('#ticketPriority').val(ticket.priority).trigger('change');
					$('#ticketSubject').val(ticket.subject);
					$('#ticketDetails').val(ticket.message);
	
					if (ticket.project_id) {
						let projectOption = new Option(ticket.project.name, ticket.project.id, true, true);
						$('#ticketProject').append(projectOption).trigger('change');
					}
					$('#new-ticket-form').attr('action', APP_URL + '/tickets/' + ticketId + '/update');
	
					$('#ticketModal').modal('show');
				}else{
					errorMessage('Something went wrong while fetching ticket details.');
				}
			},
			error: function(xhr) {
				console.log('Error fetching ticket:', xhr);
			}
		});
	});

	//Delete Ticket
	$(document).on('click', '.deleteTicket', function () {
		var id = $(this).data('item-id');
		alert('Alert!','Are you sure you want to delete this ticket?','text-danger')
		.then(function(result) {
			if(result){
				$.ajax({
					url: APP_URL+'/tickets/' + id + '/delete',
					type: 'DELETE',
					success: function(response) {
						performFilter();
						successMessage(response.message);
					},
					error: function(xhr, status, error) {
						console.error(xhr.responseText);
					}
				});
			}
		});
	});

});
