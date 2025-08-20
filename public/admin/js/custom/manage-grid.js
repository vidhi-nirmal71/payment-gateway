$(document).ready(function() {
    $(document).on('click','#saveManageGrid' ,function () {

        $.validator.addMethod("positiveFloatOrZero", function(value, element) {
            if (value === "") {
                return true;
            }
            return /^(\d+(\.\d*)?|\.\d+)$/.test(value);
        }, "Please enter a valid positive number.");

        $('#manageGridForm').validate({
            rules:{
                "number[*]": {
                    positiveFloatOrZero: true
                },
            },
            messages: {
                'number[*]': {
                    positiveFloatOrZero: "Please enter a positive number."
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
                    $(error).insertAfter($(element).parent());
                } else {
                    $(error).insertAfter($(element));
                }
            },
        }); 
    
        if($('#manageGridForm').valid()) {
            disableSubmitBtn('#saveManageGrid');
            $('#manageGridForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    enableSubmitBtn('#saveManageGrid');
                    successMessage(response.message);
                    location.reload(true);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveManageGrid');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    }
                },
            });
        }
    });

    // On click Add/Edit Float number
    $('#editGridBtn').on('click', function(){
        $('#viewGridData').hide();
        $('#manageGridEdit').show();
        $('#viewManageGridTable').removeClass('d-flex');
        $('#viewManageGridTable').hide();
    });

    // On click cancel button on edit view
    $('#changeTableView').on('click', function(){
        $('#viewGridData').show();
        $('#manageGridEdit').hide();
        $('#viewManageGridTable').addClass('d-flex');
        $('#viewManageGridTable').show();
    });

    if(gridValueCheck == 'yes'){
        $('#viewManageGridTable').removeClass('d-flex');
        $('#viewManageGridTable').hide();
    }

});