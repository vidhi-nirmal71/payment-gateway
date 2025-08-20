$(document).ready(function () {
    fetchBucketTableData();
    // Open add new bucket modal
    $(document).on('click', '#addNewBucket', function () {
        resetBucketForm();
        removeErrorMessage();
        $('#bucketModal .modal-title').text('Add Bucket');
        $('#saveNewBucket').text('Save');
        $('#new-bucket-form').attr('action', '/client/bucket/store');
        $('#bucketModal').modal('show');
    });

    function resetBucketForm(){
        $('#new-bucket-form')[0].reset();
        $('#project_ids').val(null).trigger('change');
        $('#stackholders').val(null).trigger('change');
    }

    // Initialize select2 for project dropdown in the bucket modal
    $('#project_ids').select2({
        dropdownParent: $("#bucketModal .modal-body")
    });

    $('#stackholders').select2({
        minimumInputLength: 3,
        dropdownParent: $('#bucketModal .modal-body'), // Attach dropdown to modal body
        ajax: {
            dataType: 'json',
            delay: 250,
            url: APP_URL + '/search/users',
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.name,
                            id: item.id
                        };
                    })
                };
            },
            cache: true,
        }
    });

    function hasStakeholdersSelected() {
        const val = $('#stackholders').val();
        return val && val.length > 0;
    }

    // Handler for Select2 change
    $('#stackholders').on('change', function () {
        if (!hasStakeholdersSelected()) {
            $('#reminderCheck-error').text('Reminder disabled because no stakeholder has been added.');
            $('#reminderCheck').prop('checked', false); // Uncheck the reminder switch
        } else {
            $('#reminderCheck-error').text(''); // Clear error
        }
    });

    // Handler for reminder switch toggle
    $('#reminderCheck').on('change', function () {
        if ($(this).is(':checked') && !hasStakeholdersSelected()) {
            $('#reminderCheck-error').text('Please add stakeholder(s) before setting a reminder.');
            $(this).prop('checked', false); // Revert toggle
        } else {
            $('#reminderCheck-error').text('');
        }
    });

    function removeErrorMessage() {
        // Remove all error messages
        $('#new-bucket-form').find('label.error').remove();
        $('#new-bucket-form').find('.error').removeClass('error');
        $('#new-bucket-form').find('.is-invalid').removeClass('is-invalid');
        $('#new-bucket-form').find('.input-error').removeClass('input-error');
        $('.error-message').remove();
        $('#reminderCheck-error').text('');
    }

    // Save bucket data
    $('#saveTask').on('click', function () {
        $('#new-bucket-form').submit();
    });

    $(document).on('click', '#saveNewBucket', function(){
        $('#new-bucket-form').validate({
            rules: {
                name: {
                    required: true,
                },
                // description: {
                //     required: true,
                // },
                "project_ids[]": {
                    required: true,
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
                    $(error).insertAfter($(element).parent());      // radio/checkbox
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
            messages: {
                name:{
                    required: 'Bucket name is required field.'
                }, description:{
                    required: 'Description is required.'
                }, "project_ids[]":{
                    required: 'Project is required.'
                },
            }
        }); 

        if($('#new-bucket-form').valid()) {
            disableSubmitBtn('#saveNewBucket');
            $('#new-bucket-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');

                    if ($('#reminderCheck').is(':checked') && !hasStakeholdersSelected()) {
                        $('#reminderCheck-error').text('Please add stakeholder(s) before setting a reminder.');
                        return false;
                    } else {
                        $('#reminderCheck-error').text('');
                    }
                },
                success: function (response) {
                    enableSubmitBtn('#saveNewBucket');
                    fetchBucketTableData();

                    $('#bucketModal').modal('hide');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveNewBucket');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, errorMessages) {
                            var fieldId = field.replace(/\./g, '-');
                            var $field = $('#' + fieldId);
                
                            if ($field.length) {
                                // Remove old error message if it exists
                                if ($field.hasClass('select2-hidden-accessible')) {
                                    $field.next('.select2').next('.error-message').remove(); // For select2
                                } else {
                                    $field.next('.error-message').remove(); // For normal input
                                }
                                var $error = $('<div class="text-danger error-message">' + errorMessages[0] + '</div>');
                                if ($field.hasClass('select2-hidden-accessible')) {
                                    $error.insertAfter($field.next('.select2'));
                                } else {
                                    $error.insertAfter($field);
                                }

                                $field.addClass('is-invalid');
                            } else {
                                toastr.error(errorMessages[0]);
                            }
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click', '.editBucket', function () {
        resetBucketForm();
        removeErrorMessage();
        var encryptedId = $(this).closest('td').data('id');
        $.ajax({
            url: '/client/bucket/' + encryptedId + '/edit',
            type: 'GET',
            success: function (res) {
                $('#bucketModal .modal-title').text('Edit Bucket');
                $('#name').val(res.name);
                $('#description').val(res.description);
                $('#threshold').val(res.threshold);

                var projectSelect = $('#project_ids');
                projectSelect.val(res.project_ids).trigger('change');
                res.threshold_reminder == 1 ? $('#reminderCheck').prop('checked', true) : $('#reminderCheck').prop('checked', false);
                
                // set prefilled user if exist
                if (res.stackholders && res.stackholders.length > 0) {
                    $('#stackholders').empty();
                    res.stackholders.forEach(function (sh) {
                        const option = new Option(sh.name, sh.id, true, true); // id = user_id
                        $('#stackholders').append(option);
                    });
                    $('#stackholders').trigger('change');
                } else {
                    $('#stackholders').val(null).trigger('change');
                }

                $('#new-bucket-form').attr('action', '/client/bucket/' + encryptedId + '/update');
                $('#saveNewBucket').text('Update');
                $('#bucketModal').modal('show');

                if (!$('#new-bucket-form input[name="bucket_id"]').length) {
                    $('<input>').attr({
                        type: 'hidden',
                        id: 'bucket_id',
                        name: 'bucket_id',
                        value: encryptedId
                    }).appendTo('#new-bucket-form');
                } else {
                    $('#bucket_id').val(encryptedId);
                }
            },
            error: function (xhr) {
                console.error(xhr.responseText);
            }
        });
    });

    $(document).on('click', '.deleteBucket', function () {
        var encryptedId = $(this).closest('td').data('id');
        var bucketName = $(this).closest('tr').find('.bName').text();

        alert('Alert!','Are you sure you want to delete this Bucket? <br> <span class="fw-medium">Bucket Name: '+bucketName+'</span>','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url:  APP_URL+"/client/bucket/" + encryptedId + "/delete",
                    type: 'DELETE',
                    success: function(response) {
                        response.success == true ? successMessage(response.message) : errorMessage(response.message);
                        fetchBucketTableData();
                    },
                    error: function(xhr, status, error) {
                        errorMessage(xhr.responseText);
                    }
                });
            }
        });
    });

    function fetchBucketTableData() {
        $.ajax({
            url: APP_URL+'/clients/bucket/list',
            type: 'GET',
            data: { clientId : clientId },
            success: function (res) {
                if(res.data == 0){
                    $('#bucketTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="bucket_data">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Projects</th>
                                            <th style="min-width: 110px;">Created By</th>
                                            <th class="text-end" style="min-width: 102px;">Threshold</th>
                                            <th class="text-end" style="min-width: 76px;">Total</th>
                                            <th class="text-end" style="min-width: 100px;">Consumed</th>
                                            <th class="text-end" style="min-width: 100px;">Remaining</th>
                                            <th class="text-center" style="min-width: 92px;">Reminder</th>
                                            <th class="text-center" style="min-width: 100px;">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="document-list-body" class="table-border-bottom-0">`;

                    let num = 1;
                    $.each(res.data, function (k, v) {
                        tc += '<tr>';
                        tc += '<td>'+num+'</td>';
                        tc += '<td class="bName"> <a title="Show Bucket Details" class="text-primary cursor-pointer" href="'+APP_URL+'/client/bucket/details/'+v.id+'">'+v.name+'</a> </td>';
                        tc += '<td class="d-none bDescription">'+v.description+'</td>';
                        tc += '<td class="bProjects">'+v.projects+'</td>';
                        tc += '<td class="bCreatedBy">'+v.createdBy+'</td>';
                        tc += '<td class="bThreshold text-end">'+v.threshold+'</td>';
                        tc += '<td class="bTotal text-end">'+v.total+'</td>';
                        tc += '<td class="bConsumed text-end">'+v.consumed+'</td>';
                        tc += '<td class="bRemaining text-end ' + (v.isNegative === true ? 'text-danger' : 'text-success') + '">'+v.remaining+'</td>';
                        tc += '<td class="bucketname d-none">'+v.name+'</td>';
                        tc += `<td class="text-center" data-editid="${v.id}" data-bucketname="${v.name}" data-stackholders="${v.stackholders}">
                                    <div class="form-check form-switch ms-2 float-start">
                                        <input class="form-check-input reminderlistCheck" type="checkbox"
                                            ${v.threshold_reminder == 1 ? "checked" : ""}
                                            ${v.threshold_reminder == 1 && v.stackholders?.length ? `title="${v.stackholders.join(', ')}"` : ''}>
                                    </div>
                                </td>`;
                        tc += `<td class="text-center" data-id="${v.id}">
                                <a title="Show Bucket Details" class="text-primary cursor-pointer" href="${APP_URL}/client/bucket/details/${v.id}">
                                    <i class="bx bx-show me-1"></i></a>
                                <label class="editBucket cursor-pointer" title="Edit Bucket">
                                    <span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span>
                                </label>
                                <label title="Delete Bucket" class="deleteBucket cursor-pointer"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>
                                `;
                        tc += '</td></tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    // if(res.data.morePage){
                    //     tc += makePagination(res.data.button);
                    // }
                    tc += '</table>';
                    $('#bucketTable').html(tc);
                    // var prevLink = $('#uTable a.prev');
                    // var nextLink = $('#uTable a.next');
                    // prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    // nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    $(document).on('change', '.reminderlistCheck', function () {
        let $this = $(this);
        let checkedValue = $this.prop('checked');
        let $td = $this.closest('td');
        let editId = $td.data('editid');
        let bucketname = $td.data('bucketname');
        let stackholders = $td.data('stackholders') || [];

        if (checkedValue && stackholders.length === 0) {
            errorMessage('Please add stakeholder(s) before setting a reminder.');
            $this.prop('checked', false);
            return;
        }

        let message = checkedValue
        ? 'Are you sure you want to set a reminder for the "' + bucketname + '" bucket?'
        : 'Are you sure you want to unset the reminder for the "' + bucketname + '" bucket?';
    
        alert('Alert!', message, 'text-danger').then(function (result) {
            if (result) {
                $.ajax({
                    url: APP_URL + "/client/bucket/reminder",
                    type: "POST",
                    data: {
                        reminder: checkedValue ? 1 : 0,
                        bucket_id: editId,
                    },
                    success: function (response) {
                        if (response.success == true) {
                            fetchBucketTableData();
                            successMessage(response.message);
                        } else {
                            errorMessage(response.message);
                            $this.prop('checked', !checkedValue);
                        }
                    },
                    error: function () {
                        errorMessage('Something went wrong!');
                        $this.prop('checked', !checkedValue);
                    }
                });
            } else {
                $this.prop('checked', !checkedValue);
            }
        });
    });
});