$(document).ready(function () {
    requestPage = 1;
    announcement();

    $('#announcementtype').select2();
    //on change validation remove
    setupSelect2Validation();

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        announcement();
    });

    //Save announcement data
    $(document).on('click', '#saveAnnouncementForm', function(){
        $('#announcementForm').validate({
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

        if ($('#announcementForm').valid()) {
            disableSubmitBtn('#saveAnnouncementForm');
            $('#announcementForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('.newRowAppended').empty();
                    $('#announcementForm').validate().resetForm();
                    $('.select2').trigger('change');
                    announcement();
                    $('#announcementModal').modal('hide');
                    enableSubmitBtn('#saveAnnouncementForm');
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

    $(document).on('click', '.addAnnouncement', function(){
        $('#announcementModal .modal-title').text('Add Announcement');
        $('#announcementForm').attr('action', 'announcement/store');
        $('.attachment').hide();
        $('#attachment, #title, #description').val('');
        $('#announcementModal').modal('show');
        $('#title').attr('required');
        formValidationReset("#announcementForm");
        $('.announcementtype').select2({
            dropdownParent: $('#announcementModal .modal-body'),
        });
    });

    //Ajax call for fetch data
    function announcement() {
        $('#annoucementTable').append(loading());
        $.ajax({
            url: APP_URL+'/announcement/fetchdata',
            type: 'GET',
            data: {page: requestPage},
            success: function (res) {
                if(res.data.data == 0){
                    $('#annoucementTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-striped tablecontentcss table-hover" id="annTable"><thead class="table-light"><tr>
                                <th>Announced By</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Attachment</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr></thead><tbody class="table-border-bottom-0">`;

                    $.each(res.data.data, function (k, v) {
                        tc += '<tr id="row-'+v.no+'">';
                        tc += '<td class="td-username">'+v.userName+'</td>';
                        tc += '<td>'+ sliceText(v.title, 60) +'</td>';
                        tc += '<td class="td-title d-none">'+ v.title +'</td>';
                        tc += '<td class="td-type">'+v.type+'</td>';
                        tc += '<td class="td-originalName">'+v.originalName+'</td>';
                        tc += '<td>'+ sliceText(v.fullDetail, 60) +'</td>';
                        tc += '<td class="td-fileExist d-none">'+ v.attachment + '</td>';
                        tc += '<td class="td-description d-none">'+(v.fullDetail? v.fullDetail : '-')+'</td>';
                        tc += '<td>';
                        if(res.data.permission.view == true){
                            tc +=`<label title="Show Announcement" class="text-primary cursor-pointer showAnnouncementDetails" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="${v.id}">
                                  <i class="bx bx-show me-1"></i></label>`;
                        }
                        if(res.data.permission.edit == true){
                            tc +=`<label title="Edit Announcement" onclick="setFocusOnFirstInput('#announcementModal')" class="text-info cursor-pointer editAnnouncement" data-item-id="${v.id}">
                                    <i class="bx bx-edit-alt me-1"></i></label>`;
                        }
                        if(res.data.permission.delete == true){
                            tc +=`<label title="Delete Announcement" class="deleteAnnouncement cursor-pointer" data-item-id='${ v.id }'>
                            <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span></label>`;
                        }

                        tc += '</td></tr>';
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#annoucementTable').html(tc);
                    var prevLink = $('#annTable a.prev');
                    var nextLink = $('#annTable a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');

                    let idNeedToClick = localStorage.getItem('dashAnnounClick');
                    if(idNeedToClick){
                        $('#'+idNeedToClick).find('.showAnnouncementDetails').click();
                        localStorage.removeItem('dashAnnounClick');
                    }
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    //View Announcement
    $(document).on('click' , '.showAnnouncementDetails' , function(){
        var username = $(this).closest('tr').find('.td-username').text();
        var title = $(this).closest('tr').find('.td-title').text();
        var type = $(this).closest('tr').find('.td-type').text();
        var description = $(this).closest('tr').find('.td-description').text();
        var originalName = $(this).closest('tr').find('.td-originalName').text();
        var id = $(this).data("item-id");

        $('.showDataTitle').empty();
        $("#showDataBody").empty();
        $('.showDataTitle').text('Announcement Details');

        var fileAttachment = '';
        if($(this).closest('tr').find('.td-fileExist').text() == '1'){
            fileAttachment = `<tr> <th>Attachment:</th> <td class="td-originalname">${originalName}
                    <span class="cursor-pointer" id="downloadAnnouncement" title="Download File" style="margin-left:0.5rem; color: #696cff;" data-item-id="${id}"> <i class='bx bx-download'></i></span>
                </td> </tr>`;
        }

        $('#showDataBody').html(
            `<tr> <th>Title:</th> <td>${title}</td> </tr>
            <tr> <th>Type:</th> <td>${type}</td> </tr>
            <tr> <th>Description:</th> <td>${description.replace(/\n/g, '<br>')}</td> </tr>
            ${fileAttachment}
            <tr> <th>Announced By:</th> <td>${username}</td> </tr>`
        );
    });

    //edit channel popup
    $(document).on('click', '.editAnnouncement', function () {
        var id = $(this).data('item-id');
        $('.modal-title').html('Edit Announcement');
        formValidationReset("#announcementForm");
        $.ajax({
            url: APP_URL+'/announcement/' + id + '/edit',
            type: 'GET',
            data: { id: id},
            success: function (response) {
                $('#announcementForm').attr('action', '/announcement/' + id + '/update');
                $('#attachment').removeAttr('required');
                $('.title').val(response.data.title);
                $(".announcementtype").val(response.data.type).trigger('change');
                $('.attachment').text('Selected File: '+response.data.original_name).show();
                $('.description').val(response.data.description);
                $('#announcementModal').modal('show');
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    //Delete Announcement
    $(document).on('click', '.deleteAnnouncement', function () {
        var id = $(this).data('item-id');
        alert('Alert!','Are you sure you want to delete this data?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/announcement/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        announcement();
                        successMessage(response.message);
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    //Download file
    $(document).on('click', '#downloadAnnouncement', function () {
        var id = $(this).data('item-id');
        window.open('/announcement/file/download/' + id);
    });
});