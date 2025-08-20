$(document).ready(function () {
    $('.select2').select2();

    // Save RAS
    $(document).on('click','#saveRasDesignation' ,function (e) {
        e.preventDefault();
        $('#formRasDesignation').validate({
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
                    $(error).insertAfter($(element).parent());
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        });

        if($('#formRasDesignation').valid()) {
            $('#formRasDesignation').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    // Save Roles for Timesheet Defaulter
    $(document).on('click','#saveTimesheetDefaulterRoles' ,function (e) {
        e.preventDefault();
        $('#formTimesheetRolesDefaulter').ajaxSubmit({
            beforeSubmit: function () {
                $('.error-message').text('');
            },
            success: function (response) {
                successMessage(response.message);
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    var errors = xhr.responseJSON.errors;
                    $.each(errors, function (field, error) {
                        var fieldId = field.replace(/\./g, '-');
                        $('#' + fieldId + '-error').text(error[0]);
                    });
                } else {
                    console.log(xhr);
                }
            },
        });
    });

    $(document).on('click','#saveCoreTeam' ,function (e) {
        e.preventDefault();
        $('#formCoreTeam').validate({
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
                    $(error).insertAfter($(element).parent());
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        });

        if($('#formCoreTeam').valid()) {
            $('#formCoreTeam').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $('#core-team').select2({
		placeholder: "Core Team Member",
		allowClear: false,
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

    $(document).on('click','#saveManageSalesHead' ,function (e) {
        e.preventDefault();
        $('#formManageSalesHead').validate({
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
                    $(error).insertAfter($(element).parent());
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        });

        if($('#formManageSalesHead').valid()) {
            $('#formManageSalesHead').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click','#saveManageInternRoles' ,function (e) {
        e.preventDefault();
        $('#formManageInternRole').validate({
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
                    $(error).insertAfter($(element).parent());
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        });

        if($('#formManageInternRole').valid()) {
            $('#formManageInternRole').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click','#saveManageLeaveExemption' ,function (e) {
        e.preventDefault();
        $('#formLeaveExemption').validate({
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
                    $(error).insertAfter($(element).parent());
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        });

        if($('#formLeaveExemption').valid()) {
            $('#formLeaveExemption').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click','#saveGeneralInfo' ,function (e) {
        e.preventDefault();
        $('#formGeneralSetting').validate({
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
                    $(error).insertAfter($(element).parent());
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        });

        if($('#formGeneralSetting').valid()) {
            $('#formGeneralSetting').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click','#saveDesignation' ,function (e) {
        e.preventDefault();
        $('#formManageDesignation').validate({
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
                    $(error).insertAfter($(element).parent());
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        });

        if($('#formManageDesignation').valid()) {
            $('#formManageDesignation').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $('#maintance_mode').on('change', function(){
        alert('Alert!', 'Are you sure you want to change maintenance mode?', 'text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+"/settings/maintenance/mode",
                    type: "POST",
                    data: { switchValue: $('#maintance_mode').prop('checked') },
                    success: function (response) {
                        successMessage(response.message);

                        'in-maintance'
                        $('#maintance').toggleClass('in-maintance');
                    },
                    error: function (xhr, status, response) {
                        // errorMessage(response.message);
                    },
                });
            }else{
                $('#maintance_mode').prop('checked', !$('#maintance_mode').prop('checked'));
            }
        });
    });

    $('#mailWithMailtrap').on('change', function(){
        alert('Alert!', 'Are you sure you want to change email credentials?', 'text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+"/settings/mailtrap/projectClose",
                    type: "POST",
                    data: { switchValue: $('#mailWithMailtrap').prop('checked') },
                    success: function (response) {
                        if(response.success == true){
                            successMessage(response.message);
                        }else{
                            errorMessage(response.message); 
                        }
                    },
                    error: function (xhr, status, response) {
                        // errorMessage(response.message);
                    },
                });
            }else{
                $('#mailWithMailtrap').prop('checked', !$('#mailWithMailtrap').prop('checked'));
            }
        });
    });

    $(document).on('click','#saveFactorInfo' ,function (e) {
        e.preventDefault();
        $('#formFactorSetting').validate({
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
                    $(error).insertAfter($(element).parent());
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        });

        if($('#formFactorSetting').valid()) {
            $('#formFactorSetting').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });


    $('#registrationLink').on('change', function(){
        $.ajax({
            url: APP_URL+"/settings/registration/link",
            type: "POST",
            data: { switchValue: $('#registrationLink').prop('checked') },
            success: function (response) {
                if(response.success == true){
                    successMessage(response.message);
                }else{
                    errorMessage(response.message); 
                }
            },
            error: function (xhr, status, response) {
                // errorMessage(response.message);
            },
        });
    });

});