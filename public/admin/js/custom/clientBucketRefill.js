$(document).ready(function () {
    var page = 1;

    fetchBucketTableData();
    // Open add new bucket modal
    $(document).on('click', '#addNewBucket', function () {
        $('#new-refill-form')[0].reset();
        $('#project_ids').val(null).trigger('change');
        removeErrorMessage();
        $('#refillBucketModal .modal-title').text('Refill Bucket');
        $('#saveNewRefill').text('Save');
        $('#new-refill-form').attr('action', '/client/bucket/refill/store');
        $('#refillBucketModal').modal('show');
    });

    // Initialize select2 for project dropdown in the bucket modal
    $('#project_ids').select2({
        dropdownParent: $("#refillBucketModal .modal-body")
    });

    function removeErrorMessage() {
        // Remove all error messages
        $('#new-refill-form').find('label.error').remove();
        $('#new-refill-form').find('.error').removeClass('error');
        $('#new-refill-form').find('.is-invalid').removeClass('is-invalid');
        $('#new-refill-form').find('.input-error').removeClass('input-error');
    }

    // Save bucket data
    $('#saveTask').on('click', function () {
        $('#new-refill-form').submit();
    });

    $(document).on('click', '#saveNewRefill', function(){
        $('#new-refill-form').validate({
            rules: {
                hours: {
                    required: true,
                    number: true,
                    min: 1,
                },
                date: {
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
                hours:{
                    required: 'Bucket refill hours is required field.'
                },
                date:{
                    required: 'Refill date is required.'
                }
            }
        }); 

        if($('#new-refill-form').valid()) {
            disableSubmitBtn('#saveNewRefill');
            $('#new-refill-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    enableSubmitBtn('#saveNewRefill');
                    fetchBucketTableData();
                    $('#refillBucketModal').modal('hide');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveNewRefill');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, errorMessages) {
                            var fieldId = field.replace(/\./g, '-');
                            var $field = $('#' + fieldId);

                            if ($field.length) {
                                // Remove old error message if it exists
                                $field.next('.error-message').remove(); // For normal input
                                var $error = $('<div class="text-danger error-message">' + errorMessages[0] + '</div>');
                                $error.insertAfter($field);
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
        removeErrorMessage();
        var encryptedId = $(this).data('item-id');
        $.ajax({
            url: '/client/bucket/refill/' + encryptedId + '/edit',
            type: 'GET',
            success: function (res) {
                $('#refillBucketModal .modal-title').text('Edit Bucket');
                $('#hours').val(res.hours);
                $('#date').val(res.added_at);
                $('#details').val(res.details ?? '');

                $('#new-refill-form').attr('action', '/client/bucket/refill/' + encryptedId + '/update');
                $('#saveNewRefill').text('Update');
                $('#refillBucketModal').modal('show');

                if (!$('#new-refill-form input[name="refill_id"]').length) {
                    $('<input>').attr({
                        type: 'hidden',
                        id: 'refill_id',
                        name: 'refill_id',
                        value: encryptedId
                    }).appendTo('#new-refill-form');
                } else {
                    $('#refill_id').val(encryptedId);
                }
            },
            error: function (xhr) {
                console.error(xhr.responseText);
            }
        });
    });

    // Show client bucket details in sidebar
    $(document).on('click', '.showRefillDetails', function () {
        var hours = $(this).closest('tr').find('.bHours').text();
        var details = $(this).closest('tr').find('.bDetails').text();
        var addedBy = $(this).closest('tr').find('.bAddedBy').text();
        var addedAt = $(this).closest('tr').find('.bAddedAt').text();

        $('.showDataTitle').empty();
        $('#showDataBody').empty();
        $('.showDataTitle').text('Client Bucket Details');
        $('#showDataBody').html(
            `<tr> <th>Hours:</th> <td>${hours}</td> </tr>
            <tr> <th>Details:</th> <td>${details}</td> </tr>
            <tr> <th>Added By:</th> <td>${addedBy}</td> </tr>
            <tr> <th>Added At:</th> <td>${addedAt}</td> </tr> </tr>`
        );
    });

    $(document).on('click', '.deleteRefill', function () {
        var refillId = $(this).data('id');
        var refillDetail = $(this).closest('tr').find('.bDetails').text();

        alert('Alert!','Are you sure you want to delete this Refill Bucket? <br> <span class="fw-medium">Details: '+refillDetail+'</span>','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url:  APP_URL+"/clients/bucket/refill/" + refillId + "/delete",
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

    $(document).on('click', '.btnClick', function () {
		page = $(this).attr('data-page');
		fetchBucketTableData();
  	});

    function fetchBucketTableData() {
        $.ajax({
            url: APP_URL+'/clients/bucket/refill/list',
            type: 'GET',
            data: { bucketId : bucketId, page: page },
            success: function (res) {
                if(res.data.data.length == 0){
                    $('#bucketTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="bucket_data">
                                <thead>
                                    <tr>
                                        <th style="width:50px;">#</th>
                                        <th style="width:100px;">Hours</th>
                                        <th>Details</th>
                                        <th style="width:160px;">Added By</th>
                                        <th style="width:120px;">Added At</th>
                                        <th style="width:100px;" class="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="document-list-body" class="table-border-bottom-0">`;

                    let num = res.data.st;
                    $.each(res.data.data, function (k, v) {
                        tc += '<tr>';
                        tc += '<td>'+num+'</td>';
                        tc += '<td class="bHours">'+v.hours+'</td>';
                        tc += '<td class="bDetails">'+v.details+'</td>';
                        tc += '<td class="bAddedBy">'+v.added_by+'</td>';
                        tc += '<td class="bAddedAt">'+v.added_at+'</td>';
                        tc += `<td class="text-center">
                                <label class="showRefillDetails cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">
                                    <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span>
                                </label>
                                <label class="editBucket cursor-pointer" title="Edit Refill" data-item-id="${v.id}">
                                    <span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span>
                                </label>
                                <label title="Delete Leave" class="deleteRefill cursor-pointer" data-id="${v.id}">
                                    <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span>
                                </label>`;
                        tc += '</td></tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#bucketTable').html(tc);
                    var prevLink = $('#bucket_data a.prev');
                    var nextLink = $('#bucket_data a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
                $('#hoursBar').html(
                    'Total: <b>' + res.hoursData.bucketTotalHoursHHmm + '</b> &nbsp; | &nbsp; ' +
                    'Consumed: <b>' + res.hoursData.timesheetHHmm + '</b> &nbsp; | &nbsp; ' +
                    '<span class="' + (res.hoursData.isNegative === true ? 'text-danger' : 'text-success') + '">Remaining: <b>' +
                    res.hoursData.remainingHoursHHmm + '</b></span>'
                );
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }
});