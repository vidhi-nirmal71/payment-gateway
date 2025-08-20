$(document).ready(function () {
    requestPage = 1;
    pushNotification();

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        pushNotification();
    });

    //Save pushNotification data
    $(document).on('click', '#savePushNotificationForm', function(){
        $('#formNotification').validate({
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
        }); 

        if ($('#formNotification').valid()) {
            disableSubmitBtn('#savePushNotificationForm');
            $('#formNotification').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#formNotification').validate().resetForm();
                    pushNotification();
                    $('#pushNotificationModal').modal('hide');
                    enableSubmitBtn('#savePushNotificationForm');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    console.log('xhr: ', xhr);
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

    $(document).on('click', '.addPushNotification', function(){
        $('#notiMessage, #notiTitle').val('');
        $('#pushNotificationModal').modal('show');
        formValidationReset("#formNotification");
    });

    //Ajax call for fetch data
    function pushNotification() {
        $('#pushNotifiTable').append(loading());
        $.ajax({
            url: APP_URL+'/push-notification/fetchdata',
            type: 'GET',
            data: {page: requestPage},
            success: function (res) {
                if(res.data.data == 0){
                    $('#pushNotifiTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-striped tablecontentcss table-hover" id="annTable"><thead class="table-light"><tr>
                                    <th style="width: 20%;">Created By</th>
                                    <th style="width: 30%;">Title</th>
                                    <th style="width: 50%;">Message</th>
                            </tr></thead><tbody class="table-border-bottom-0">`;

                    $.each(res.data.data, function (k, v) {
                        tc += '<tr id="row-'+v.no+'">';
                        tc += '<td>'+v.user+'</td>';
                        tc += '<td title ="'+ v.title+'">'+ sliceText(v.title, 95) +'</td>';
                        tc += '<td title ="'+ v.message+'">'+ sliceText(v.message, 90) +'</td>';
                        tc += '<td>';
                        tc += '</td></tr>';
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#pushNotifiTable').html(tc);
                    var prevLink = $('#annTable a.prev');
                    var nextLink = $('#annTable a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }
});