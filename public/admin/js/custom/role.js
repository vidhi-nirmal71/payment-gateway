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