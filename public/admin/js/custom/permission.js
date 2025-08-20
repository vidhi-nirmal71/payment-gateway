$(document).ready(function () {
    // Save new permission via Ajax
    $('#saveNewPermission').on('click', function(){
        $('#new-add-permission-form').validate({
            rules:{
                permissionName: {
                    required: true,
                },module: {
                    required: true,
                },
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
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
            messages: {
                permissionName: {
                    required: 'Permission name field is required',
                },module: {
                    required: 'Module Name field is required',
                },
            },
        }); 
        if($('#new-add-permission-form').valid()) {
            $('#new-add-permission-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('#saveNewPermission').attr('disabled', true);
                    $('#saveNewPermission').addClass('sending');
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-add-permission-form').validate().resetForm();
                    $('#addPermissionModal').modal('hide');
                    successMessage(response.message);
                    window.location.reload();
                },
                error: function (xhr) {
                    $('#saveNewPermission').attr('disabled', false);
                    $('#saveNewPermission').removeClass('sending');
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
        };
    });

    //on change validation remove
    setupSelect2Validation();
    
    // Assign permission to role
    // Validate create/edit designation form validate and submit
    $(function() {
        $('#formRole').validate({
            rules:{
                designation: {
                    required: true,
                },
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
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
            messages: {
                designation: {
                    required: 'Designation field is required',
                },
            },
            submitHandler: function(form) {
                if($('#formRole').valid()) {
                    $('#saveRole').attr('disabled', true);
                    $('#saveRole').addClass('sending');
                }
                form.submit();
            }
        });
    });

    $('#syncPermission').on('click', function(){
        $('#rolePermissionSync').submit()
        $('#syncPermission').attr('disabled', true);
        $('#syncPermission').addClass('sending');
    });

    $(function() {
        $('#accordionWithIcon .check-all').click(function() {
            $(this).parents('.accordion-item').find('.check-one').prop('checked', this.checked);
        })
        $('#accordionWithIcon .check-one').click(function() {
            var parentItem = $(this).parents('.accordion-body').parents('.accordion-item');
            $(parentItem).find('.check-all').prop('checked', $(parentItem).find('.check-one:checked').length == $(parentItem).find('.check-one').length)
        });
        $('#accordionWithIcon .check-all').each(function() {
            var parentItem = $(this).parents('.accordion-item');
            let lengthAllChild = $(parentItem).find('.check-one').length;
            if(lengthAllChild){
                let check = $(parentItem).find('.check-one:checked').length == lengthAllChild;
                $(parentItem).find('.check-all').prop('checked', check)
            }
        })
    });

    $(document).on('click', '.addPermission', function(){
        $('#new-add-permission-form').validate().resetForm();
        $('#new-add-permission-form .error').removeClass('error');
        $('#validationMessages').empty();
        $('#project').select2();
    });
});