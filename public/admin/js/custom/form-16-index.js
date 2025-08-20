$(document).ready(function () {
	var searchFilterState = 0;
	var requestPage = 1;
	performFilter();

	$('#searchInput').on('change', function () {
		requestPage = 1;
		performFilter();
  	});

  	$('#assessmentYear').on('change', function () {
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
		$('#assessmentYear').val(null).trigger('change');
		searchFilterState = 0;
		performFilter();
  	});

  	function performFilter() {
		if (searchFilterState == 0) {
			let search = $('#searchInput').val() ?? '';
			let assessmentYear = $('#assessmentYear').val() ?? '';
			if(search != '' || assessmentYear != '') {
				$('.reset-filter').show();
			}else{
				$('.reset-filter').hide();
			}

			var page = requestPage;
			$('#form16Table').append(loading());
			$.ajax({
				url: APP_URL+'/payroll/form16/fetchdata',
				type: 'GET',
				data: { search: search, assessmentYear: assessmentYear, page: page},
				success: function (res) {
					$('#form16Table').find('.loading-wrapper').remove();
					if(res.data.data == 0){
						$('#form16Table').html(tableNoData);
					}else{
						let indexStart = res.data.st;
						let tc = `<table class="table table-striped tablecontentcss table-hover" id="annTable"><thead class="table-light"><tr>
								<th class="text-center" width="4%">#</th>
								<th width="20%">Employee Name</th>
								<th width="20%">File Name</th>
								<th width="20%">Comment</th>
								<th class="text-center" width="12%">Assessment Year</th>
								<th class="text-center" width="10%">Action</th>
							</tr></thead><tbody class="table-border-bottom-0">`;

						$.each(res.data.data, function (k, v) {
							tc += '<tr class="parentTr" data-item-id="'+v.id+'">';
							tc += '<td class="text-center">'+indexStart+'</td>';
							tc += '<td class="empName">'+v.name+'</td>';
							tc += '<td>'+v.fName+'</td>';
							tc += '<td>'+v.fComt+'</td>';
							tc += '<td class="text-center">'+v.ay+'</td>';
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
								tc += `<label title="Download Form-16" class="downloadForm16 cursor-pointer ps-1">
									<span class="text-info"><i class="bx bx-download me-1"></i></span>
								</label>`;
								tc += `<label title="Delete Form-16" class="deleteForm16 cursor-pointer ps-1">
									<span class="text-danger"><i class="bx bx-trash me-1"></i></span>
								</label>`;
							}
							tc += '</td></tr>';
							indexStart++;
						});

						if(res.data.morePage){
							tc += makePagination(res.data.button);
						}

						$('#form16Table').html(tc);
						var prevLink = $('#form16Table a.prev');
						var nextLink = $('#form16Table a.next');
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

	$(document).on('click', '.addNewForm16', function () {
		$('#new-form-16')[0].reset();
		$('#new-form-16').trigger('reset');
		$('#form16Modal').modal('show');
	});
	
	$(document).on('click', '#saveZip', function() {
		$('#new-form-16').validate({
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
				assessment_year: {
					required: true
				},
				form16_attachment: {
					required: true,
					extension: "zip"
				}
			},
			messages: {
				assessment_year: {
					required: "Assessment year is required"
				},
				form16_attachment: {
					required: "Zip file is required"
				},
				form16_attachment: {
					extension: "Only zip file is allowed"
				}
			}
		});

		// If the form is valid, submit it
		if ($('#new-form-16').valid()) {
			disableSubmitBtn('#saveZip');
			$('#new-form-16').ajaxSubmit({
				beforeSubmit: function() {
					$('.error-message').text('');
				},
				success: function(resp) {
					$('#new-form-16').validate().resetForm();
					$('#form16Modal').modal('hide');
					$('#form16Attachment').val(null).trigger('change');

					performFilter();
					enableSubmitBtn('#saveZip');
					successMessage(resp.message);

					if (resp.notMappedData && resp.notMappedData.length > 0) {
						var $container = $(document).find('.listOfNotMatchedPdf');
						$container.empty();
						var $ol = $('<ol></ol>');
						$.each(resp.notMappedData, function(index, fileName) {
							$ol.append($('<li></li>').text(fileName));
						});

						$container.append($ol).show();
						$('#form16NotMatchedModal').modal('show');
					}
				},
				error: function(xhr) {
					enableSubmitBtn('#saveZip');
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

	// Download form-16
	$(document).on('click', '.downloadForm16', function () {
		let id = $(this).closest('tr').data('item-id');
		if(id){
			window.open(APP_URL + '/payroll/form16/' + id, '_blank');
		}else{
			errorMessage('Something went wrong!');
		}
	});

	// send an email with form 16 as attachement
	$(document).on('click', '.sendEmail', function () {
		let id = $(this).closest('tr').data('item-id');
		let email = $(this).data('email');
		alert('Alert!','Are you sure you want to send an email with form-16? <br> <span class="text-light fw-semibold">Email will be to '+email+'</span>','text-danger')
			.then(function(result) {
				if(result){
					$.ajax({
						url: APP_URL+'/payroll/email/form16/' + id ,
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

	//Delete form-16
	$(document).on('click', '.deleteForm16', function () {
		let parentTr = $(this).closest('tr');
		var id = parentTr.data('item-id');
		let empName = parentTr.find('.empName').text();
		alert('Alert!','Are you sure you want to delete this form-16 of '+empName+'?','text-danger')
		.then(function(result) {
			if(result){
				$.ajax({
					url: APP_URL+'/payroll/form16/' + id + '/delete',
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
