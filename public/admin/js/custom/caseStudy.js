$(document).ready(function () {
    requestPage = 1;
    fetchCaseStudies();

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        fetchCaseStudies();
    });

    $('#searchInput').on('keyup', function () {
		requestPage = 1;
		fetchCaseStudies();
  	});

    $('#caseStudyForm').validate({
        rules: {
            title: {
                required: true,
                maxlength: 255
            },
            attachment: {
                required: true,
                extension: "pdf|doc|docx|png|jpg|jpeg"
            },
            keywords: {
                maxlength: 255
            }
        },
        messages: {
            title: {
                required: "The title field is required.",
                maxlength: "Title must not exceed 255 characters."
            },
            attachment: {
                required: "Please upload an attachment.",
                extension: "Allowed file types: pdf, doc, docx, png, jpg, jpeg."
            },
            keywords: {
                maxlength: "Keywords must not exceed 255 characters."
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass(errorClass).removeClass(validClass);
            $(element).parent('div').addClass('input-error').removeClass(validClass);
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass(errorClass).addClass(validClass);
            $(element).parent('div').removeClass('input-error').addClass(validClass);
        },
        errorPlacement: function (error, element) {
            if ($(element).parent('.input-group').length) {
                $(error).insertAfter($(element).parent());
            } else if ($(element).hasClass('select2-hidden-accessible')) {
                $(error).insertAfter($(element).next('span'));
            } else {
                $(error).insertAfter($(element));
            }
        }
    });

    // Save Case Study
    $(document).on('click', '#saveCaseStudyForm', function () {
        if ($('#caseStudyForm').valid()) {
            disableSubmitBtn('#saveCaseStudyForm');
            $('#caseStudyForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#caseStudyForm').validate().resetForm();
                    $('.select2').trigger('change');
                    fetchCaseStudies();
                    $('#caseStudyModal').modal('hide');
                    enableSubmitBtn('#saveCaseStudyForm');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        let errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    }
                }
            });
        }
    });

    // Open modal
    $(document).on('click', '.addCaseStudy', function () {
        $('#caseStudyModal .modal-title').text('Add Case Study');
        $('#caseStudyForm').attr('action', APP_URL + '/case-studies/store');
        $('.attachment').hide();
        $('#case_attachment').rules('add', 'required');
        $('#case_attachment, #case_title, #case_description, #case_keywords').val('');
        $('#caseStudyModal').modal('show');
        $('#case_title').attr('required');
        formValidationReset("#caseStudyForm");
        $('#editAttachmentNote').hide();
    });

    $(document).on('click', '#resetCaseStudySearch', function(){
        $('#searchInput').val('');
        fetchCaseStudies();
    });

    // Fetch Data
    function fetchCaseStudies() {
        $('#caseStudyTable').append(loading());
        let searchInput = $('#searchInput').val();
        searchInput ? $('.reset-search').show() : $('.reset-search').hide();

        $.ajax({
            url: APP_URL + '/case-studies/fetchdata',
            type: 'GET',
            data: { page: requestPage, search: searchInput},
            success: function (res) {
                if (res.data.data.length === 0) {
                    $('#caseStudyTable').html(tableNoData);
                } else {
                    let tc = `<table class="table table-striped tablecontentcss table-hover" id="caseTable"><thead class="table-light"><tr>
                                <th width="50px" class="text-center">#</th>
                                <th>Title</th>
                                <th width="250px">Attachment</th>
                                <th width="150px">Uploaded By</th>
                              </tr></thead><tbody class="table-border-bottom-0">`;

                    $.each(res.data.data, function (k, v) {
                        tc += `<tr data-id="${v.id}">
                            <td class="text-center">${k + 1}</td>
                            <td class="text-primary cursor-pointer showCaseStudyDetails" data-bs-toggle="offcanvas" data-bs-target="#showData" title="Show Details">${sliceText(v.title, 60)}</td>
                            <td class="td-originalName">${v.attachment ?? '-'}</td>
                            <td class="td-keywords d-none">${sliceText(v.keywords, 60)}</td>
                            <td class="td-createdby">${v.userName}</td>

                            <td class="td-title d-none">${v.title}</td>
                            <td class="td-description d-none">${v.description}</td>
                            <td class="td-fileExist d-none">${v.attachment ?? '-'}</td>
                            <td class="td-download-permission d-none">${res.data.permission.download}</td>`;
                        // if (res.data.permission.view) {
                        //     tc += `<label title="View" class="text-primary cursor-pointer showCaseStudyDetails" data-bs-toggle="offcanvas" data-bs-target="#showData"><i class="bx bx-show me-1"></i></label>`;
                        // }
                        // if (res.data.permission.edit || v.isOwner) {
                        //     tc += `<label title="Edit" class="text-info cursor-pointer editCaseStudy"><i class="bx bx-edit-alt me-1"></i></label>`;
                        // }
                        // if (res.data.permission.delete || v.isOwner) {
                        //     tc += `<label title="Delete" class="deleteCaseStudy text-danger cursor-pointer"><i class="bx bx-trash me-1"></i></label>`;
                        // }
                        tc += `</tr>`;
                    });

                    tc += `</tbody>`;
                    if (res.data.morePage) {
                        tc += makePagination(res.data.button);
                    }
                    tc += `</table>`;
                    $('#caseStudyTable').html(tc);
                    $('#caseTable a.prev').html('<i class="tf-icon bx bx-chevron-left"></i>');
                    $('#caseTable a.next').html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },
            error: function (err) {
                console.error(err);
            }
        });
    }

    // View details
    $(document).on('click', '.showCaseStudyDetails', function () {
        var id = $(this).closest('tr').data('id');
        var $row = $(this).closest('tr');
        var title = $row.find('.td-title').text();
        var attachmentName = $row.find('.td-originalName').text();
        var keywords = $row.find('.td-keywords').text();
        var createdBy = $row.find('.td-createdby').text();
        var description = $row.find('.td-description').text();
        var hasAttachment = $row.find('.td-fileExist').text().trim();
        var downloadPermission = $row.find('.td-download-permission').text().trim();
        var canDownload = hasAttachment !== '-' && downloadPermission === 'true';

        $('.showDataTitle').text('Case Study Details');
        $("#showDataBody").html(`
            <tr><th>Title:</th><td>${title}</td></tr>
            <tr><th>Description:</th><td>${description.replace(/\n/g, '<br>')}</td></tr>
            <tr><th>Keywords:</th><td>${keywords}</td></tr>
            ${canDownload ? `<tr><th>Attachment:</th><td class="cursor-pointer text-primary" id="downloadCaseStudy" data-item-id="${id}" title="Download"> ${attachmentName} <span> <i class='bx bx-download'></i></span></td></tr>` : ''}
            <tr><th>Created By:</th><td>${createdBy}</td></tr>
        `);
    });

    // Edit case study
    $(document).on('click', '.editCaseStudy', function () {
        let id = $(this).closest('tr').data('id');
        $('.modal-title').text('Edit Case Study');
        formValidationReset("#caseStudyForm");

        $.ajax({
            url: APP_URL + '/case-studies/' + id + '/edit',
            type: 'GET',
            success: function (response) {
                $('#caseStudyForm').attr('action', APP_URL + '/case-studies/' + id + '/update');
                $('#case_attachment').removeAttr('required');
                $('#case_title').val(response.data.title);
                $('#case_keywords').val(response.data.keywords);
                $('#case_description').val(response.data.description);
                $('.attachment').text('Existing File: ' + response.data.original_name).show();
                $('#editAttachmentNote').show();
                $('#case_attachment').rules('remove', 'required');
                $('#case_attachment').val('');
                $('#caseStudyModal').modal('show');
            },
            error: function (xhr) {
                console.error(xhr);
            }
        });
    });

    // Delete
    $(document).on('click', '.deleteCaseStudy', function () {
        let id = $(this).closest('tr').data('id');
        alert('Alert!', 'Are you sure you want to delete this case study?', 'text-danger').then(function (result) {
            if (result) {
                $.ajax({
                    url: APP_URL + '/case-studies/' + id + '/delete',
                    type: 'DELETE',
                    success: function (response) {
                        fetchCaseStudies();
                        successMessage(response.message);
                    },
                    error: function (xhr) {
                        errorMessage(xhr.responseText);
                    }
                });
            }
        });
    });

    // Download
    $(document).on('click', '#downloadCaseStudy', function () {
        let id = $(this).data('item-id');
        if(id){
            window.open(APP_URL + '/case-studies/file/download/' + id);
        }else{
            errorMessage('Something went wrong!');
        }
    });
});