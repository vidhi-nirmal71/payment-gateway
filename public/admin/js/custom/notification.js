$(document).ready(function () {
    requestPage = 1;
    notification();

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        notification();
    });

    //Save notification data
    $(document).on('click', '#saveNotificationForm', function(){
        $('#notificationForm').validate({
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

        if ($('#notificationForm').valid()) {
            disableSubmitBtn('#saveNotificationForm');
            $('#notificationForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('.newRowAppended').empty();
                    $('#notificationForm').validate().resetForm();
                    $('.select2').trigger('change');
                    notification();
                    $('#notificationModal').modal('hide');
                    enableSubmitBtn('#saveNotificationForm');
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

    $(document).on('click', '.addNotification', function(){
        $('#notificationModal .modal-title').text('Add Notification');
        $('#notificationForm').attr('action', 'notification/store');
        $('.attachment').hide();
        $('#attachment, #title, #description').val('');
        $('#notificationModal').modal('show');
        $('#attachment, #title').attr('required', 'required');
        formValidationReset("#notificationForm");
        $('.notificationtype').select2({
            dropdownParent: $('#notificationModal .modal-body'),
        });
    });

    //Ajax call for fetch data
    function notification() {
        $('#notificationTable').append(loading());
        $.ajax({
            url: APP_URL+'/notification/fetchdata',
            type: 'GET',
            data: {page: requestPage},
            success: function (res) {
                if(res.data.data == 0){
                    $('#notificationTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-striped tablecontentcss table-hover" id="notiTable"><thead class="table-light"><tr>
                                <th>Message</th>
                                <th>Type</th>
                                <th>Created By</th>
                                <th>Action</th>
                            </tr></thead><tbody class="table-border-bottom-0">`;

                    $.each(res.data.data, function (k, v) {
                        tc += '<tr id="row-'+v.no+'">';
                        // tc += '<td>'+ sliceText(v.title, 60) +'</td>';
                        tc += '<td class="td-title">'+ v.title +'</td>';
                        tc += '<td class="td-type">'+v.type+'</td>';
                        tc += '<td class="td-createdBy">'+v.createdBy+'</td>';
                        tc += '<td>';
                        if(res.data.permission.view == true){
                            tc +=`<label title="Show Notification" class="text-primary cursor-pointer showNotificationDetails" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="${v.id}">
                                  <i class="bx bx-show me-1"></i></label>`;
                        }
                        if(res.data.permission.edit == true){
                            tc +=`<label title="Edit Notification" onclick="setFocusOnFirstInput('#notificationModal')" class="text-info cursor-pointer editNotification" data-item-id="${v.id}">
                                    <i class="bx bx-edit-alt me-1"></i></label>`;
                        }
                        if(res.data.permission.delete == true){
                            tc +=`<label title="Delete Notification" class="deleteNotification cursor-pointer" data-item-id='${ v.id }'>
                            <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span></label>`;
                        }
                        tc += '</td></tr>';
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#notificationTable').html(tc);
                    var prevLink = $('#notiTable a.prev');
                    var nextLink = $('#notiTable a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    //View Notification
    $(document).on('click' , '.showNotificationDetails' , function(){
        var title = $(this).closest('tr').find('.td-title').text();
        var type = $(this).closest('tr').find('.td-type').text();
        var createdBy = $(this).closest('tr').find('.td-createdBy').text();

        $('.showDataTitle').empty();
        $('#showDataBody').empty();
        $('.showDataTitle').text('Notification Details');
        $('#showDataBody').html(
            `<tr> <th>Title:</th> <td>${title}</td> </tr>
            <tr> <th>Type:</th> <td>${type}</td> </tr>
            <tr> <th>Created By:</th> <td>${createdBy}</td> </tr>`
        );
    });

    //edit notification
    $(document).on('click', '.editNotification', function () {
        var id = $(this).data('item-id');
        $('.modal-title').html('Edit Notification');
        formValidationReset("#notificationForm");
        $.ajax({
            url: APP_URL+'/notification/' + id + '/edit',
            type: 'GET',
            data: { id: id},
            success: function (response) {
                $('#notificationForm').attr('action', '/notification/' + id + '/update');
                $('.title').val(response.data.title);
                $('.notificationtype').val(response.data.type).trigger('change');
                $('#notificationModal').modal('show');
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    //Delete Notification
    $(document).on('click', '.deleteNotification', function () {
        var id = $(this).data('item-id');
        alert('Alert!','Are you sure you want to delete this notification?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/notification/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        notification();
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