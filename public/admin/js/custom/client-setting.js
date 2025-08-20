$(document).ready(function () {
    $(document).on('click','#saveGeneralSetting' ,function (e) {
        e.preventDefault();
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
    });
});
