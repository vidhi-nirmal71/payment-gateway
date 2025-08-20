$(document).ready(function () {
	var searchFilterState = 0;
	var requestPage = 1;
	performFilter();

	$('#searchInput').on('change', function () {
		requestPage = 1;
		performFilter();
  	});

  	$('#filterMonth').on('change', function () {
		requestPage = 1;
		performFilter();
  	});

  	$(document).on('click', '.btnClick', function () {
		requestPage = $(this).attr('data-page');
		performFilter();
  	});

	// Reset Filters
	$(document).on('click', '#resetProjectSearchForm', function () {
		searchFilterState = 1;
		$('#searchInput').val("");
		$('#filterMonth').val(null).trigger('change');
		searchFilterState = 0;
		performFilter();
  	});

  	function performFilter() {
		if (searchFilterState == 0) {
			let search = $('#searchInput').val() ?? '';
			let filterMonth = $('#filterMonth').val() ?? '';
			if(search != '' || filterMonth != '') {
				$('.reset-filter').show();
			}else{
				$('.reset-filter').hide();
			}

			var page = requestPage;
			$('#salaryTable').append(loading());
			$.ajax({
				url: APP_URL+'/payroll/salary/fetchdata',
				type: 'GET',
				data: { search: search, filterMonth: filterMonth, page: page},
				success: function (res) {
					$('#salaryTable').find('.loading-wrapper').remove();
					if(res.data.data == 0){
						$('#salaryTable').html(tableNoData);
					}else{
						let indexStart = res.data.st;
						let tc = `<table class="table table-striped tablecontentcss table-hover" id="annTable"><thead class="table-light"><tr>
								<th class="text-center" width="4%">#</th>
								<th width="20%">Employee Name</th>
								<th width="20%">Month-Year</th>
								<th width="20%">PAN</th>
								<th width="20%">Comment</th>
								<th class="text-center" width="10%">Action</th>
							</tr></thead><tbody class="table-border-bottom-0">`;

						$.each(res.data.data, function (k, v) {
							tc += '<tr class="parentTr" data-item-id="'+v.id+'">';
							tc += '<td class="text-center">'+indexStart+'</td>';
							tc += '<td class="empName">'+v.name+'</td>';
							tc += '<td>'+v.month_year+'</td>';
							tc += '<td>'+v.pan+'</td>';
							tc += '<td>'+v.comment+'</td>';
							tc += '<td class="text-center">';

							if (v.email) {
								tc += `<label title="Send Email" class="sendEmail cursor-pointer" data-email="${v.email}">
									<span class="text-primary"><i class="bx bx-envelope me-1"></i></span>
								</label>`;
							} else {
								tc += `<label title="No Email Found">
									<span class="text-muted"><i class="bx bx-envelope me-1" style="opacity: 0.5; pointer-events: none;"></i></span>
								</label>`;
							}

							if (res.data.canManage === true) {
								tc += `<label title="Download Salary Slip" class="downloadSalarySlip cursor-pointer ps-1">
									<span class="text-info"><i class="bx bx-download me-1"></i></span>
								</label>`;
								tc += `<label title="Delete Salary Slip" class="deleteSalaryRecord cursor-pointer ps-1">
									<span class="text-danger"><i class="bx bx-trash me-1"></i></span>
								</label>`;
							}
							tc += '</td></tr>';
							indexStart++;
						});

						if(res.data.morePage){
							tc += makePagination(res.data.button);
						}

						$('#salaryTable').html(tc);
						var prevLink = $('#salaryTable a.prev');
						var nextLink = $('#salaryTable a.next');
						prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
						nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
					}
				},
				error: function (xhr, status, error) {
					errorMessage('Something went wrong!');
				},
			});
		}
  	}

	$(document).on('click', '.addNewSalarySheet', function () {
		$('#new-salary')[0].reset();
		$('#new-salary').trigger('reset');
		$('#salarySlipModal').modal('show');
	});
	
	$(document).on('click', '#savePayslip', function() {
		$('#new-salary').validate({
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
					$(error).insertAfter($(element).parent());
				} else {
					$(error).insertAfter($(element));
				}
			},
			rules: {
				assessment_year: {
					required: true
				},
				salary_attachment: {
					required: true,
				}
			},
			messages: {
				assessment_year: {
					required: "Assessment year is required"
				},
				salary_attachment: {
					required: "Salary sheet is required"
				},
				salary_attachment: {
					extension: "Only excel file is allowed"
				}
			}
		});

		// If the form is valid, submit it
		if ($('#new-salary').valid()) {
			disableSubmitBtn('#savePayslip');
			$('#new-salary').ajaxSubmit({
				beforeSubmit: function() {
					$('.error-message').text('');
				},
				success: function(resp) {
					$('#new-salary').validate().resetForm();
					$('#salarySlipModal').modal('hide');
					$('#form16Attachment').val(null).trigger('change');

					performFilter();
					enableSubmitBtn('#savePayslip');
					successMessage(resp.message);
				},
				error: function(xhr) {
					enableSubmitBtn('#savePayslip');
					if (xhr.status === 422) {
						var errors = xhr.responseJSON.errors;
						$.each(errors, function(field, error) {
							var fieldId = field.replace(/\./g, '-');
							$('#' + fieldId + '-error').text(error[0]);
						});
					} else {
						errorMessage('Something went wrong!');
					}
				}
			});
		}
	});

	// Download Salary Slip
	$(document).on('click', '.downloadSalarySlip', function () {
		let id = $(this).closest('tr').data('item-id');
		if(id){
			window.open(APP_URL + '/payroll/salary/' + id, '_blank');
		}else{
			errorMessage('Something went wrong!');
		}
	});

	// send an email with salary slip as attachement
	$(document).on('click', '.sendEmail', function () {
		let id = $(this).closest('tr').data('item-id');
		let email = $(this).data('email');
		alert('Alert!','Are you sure you want to send an email with Salary Slip? <br> <span class="text-light fw-semibold">Email will be to '+email+'</span>','text-danger')
			.then(function(result) {
				if(result){
					$.ajax({
						url: APP_URL+'/payroll/email/salary/' + id ,
						type: 'GET',
						success: function(res) {
							successMessage(res.message);
						},
						error: function(xhr, status, error) {
							errorMessage(xhr.responseText);
						}
					});
				}
		});
	});

	//Delete Salary Slip
	$(document).on('click', '.deleteSalaryRecord', function () {
		let parentTr = $(this).closest('tr');
		var id = parentTr.data('item-id');
		let empName = parentTr.find('.empName').text();
		alert('Alert!','Are you sure you want to delete this Salary Slip of '+empName+'?','text-danger')
		.then(function(result) {
			if(result){
				$.ajax({
					url: APP_URL+'/payroll/salary/' + id + '/delete',
					type: 'DELETE',
					success: function(res) {
						performFilter();
						successMessage(res.message);
					},
					error: function(xhr, status, error) {
						errorMessage(xhr.responseText);
					}
				});
			}
		});
	});

});
