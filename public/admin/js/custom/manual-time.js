$(document).ready(function () {
    requestPage = 1;
    let selfListFlag = window.location.pathname == '/manualtime' ? true : false;
    if(selfListFlag){
        manualtime();
    }
    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        manualtime();
    });

    //Save Manual Time data
    $(document).on('click', '#saveManualTime', function(){
        $('#new-manualtime-form').validate({
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
                }else {
                    $(error).insertAfter($(element));               // default
                }
            },
        }); 

        if ($('#new-manualtime-form').valid()) {
            disableSubmitBtn('#saveManualTime');
            $('#new-manualtime-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('.newRowAppended').empty();
                    $('#new-manualtime-form').validate().resetForm();
                    if(selfListFlag){
                        manualtime();
                    }
                    $('#manualtimeModal').modal('hide');
                    $('.select2').trigger('change');
                    enableSubmitBtn('#saveManualTime');
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

    $(document).on('click', '.addManualTime', function(){
        $('#manualtimeModal .modal-title').text('Add Manual Time');
        $('#new-manualtime-form').attr('action', 'manualtime/store');
        $('#manualtimeModal').modal('show');
        formValidationReset("#new-manualtime-form");

        $('#manualTimeUser').select2({
            dropdownParent: $("#manualtimeModal .modal-body"),
            minimumInputLength: 3,
            ajax: {
                dataType: 'json',
                delay: 250,
                url: APP_URL+'/search/users',
                processResults: function (data) {
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item.name,
                                id: item.id
                            }
                        })
                    };
                },
                cache: true,
            }
        });
    });

    $('#outpicker,#inpicker').datetimepicker({
        format: 'HH:mm:ss',
        locale: 'en',
        maxDate: new Date(),
        icons: {
            time: 'fa fa-clock',
            date: "fa fa-calendar",
            up: "fa fa-arrow-up",
            down: "fa fa-arrow-down",
            previous: "fa fa-chevron-left",
            next: "fa fa-chevron-right",
            today: "fa fa-clock-o",
            clear: "fa fa-trash-o",
            close: 'fa fa-times',
        }
    });

    //Ajax call for fetch data
    function manualtime() {
        $('#manualTimeTableData').append(loading());
        $.ajax({
            url: APP_URL+'/manualtime/fetchData',
            type: 'GET',
            data: {page: requestPage, selfListFlag : selfListFlag},
            success: function (res) {
                if(res.data.data == 0){
                    $('#manualTimeTableData').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="manualTimeTable"><thead class="table-light"><tr>
                                <th>Employee Name</th>
                                <th>In Time</th>
                                <th>Out Time</th>
                                <th>Entry Date</th>
                                <th>status</th>
                                <th>Reason</th>
                                <th>Action</th>
                            </tr></thead><tbody class="table-border-bottom-0">`;

                    $.each(res.data.data, function (k, v) {
                        tc += '<tr>';
                        tc += '<td class="td-username">'+v.user+'</td>';
                        tc += '<td class="d-none td-manualId">'+v.id+'</td>';
                        tc += '<td class="td-intime">'+v.intime+'</td>';
                        tc += '<td class="td-outtime">'+v.outtime+'</td>';
                        tc += '<td class="td-entryDate">'+v.entryDate+'</td>';
                        tc += '<td class="td-status"><span class="badge '+v.statusClass+' rounded-pill">'+v.status+'</span></td>';
                        tc += '<td class="td-reason">'+ sliceText(v.reason, 60) +'</td>';
                        tc += '<td>';
                        if(res.data.permission.view == true){
                            tc +=`<label title="Show Manual Time" class="text-primary cursor-pointer showManualTimeDetails" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-file-url=${v.url}>
                                  <i class="bx bx-show me-1"></i></label>`;
                        }
                        tc += '</td></tr>';
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#manualTimeTableData').html(tc);
                    var prevLink = $('#manualTimeTable a.prev');
                    var nextLink = $('#manualTimeTable a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    //View Manual Time
    $(document).on('click' , '.showManualTimeDetails' , function(){
        $('.offcanvas').addClass('offcanvas-size-md');
        $('.offcanvas').removeClass('offcanvas-size-xl');
        let manualtimeManage = window.location.pathname == '/manualtime/manage' ? true : false;
        var username = $(this).closest('tr').find('.td-username').text();
        var reason = $(this).closest('tr').find('.td-reason').text();
        var intime = $(this).closest('tr').find('.td-intime').text();
        var outtime = $(this).closest('tr').find('.td-outtime').text();
        var status = $(this).closest('tr').find('.td-status').text();
        var entryDate = $(this).closest('tr').find('.td-entryDate').text();
        let manualId  = $(this).closest('tr').find('.td-manualId').text();
        var statusClass = status == 'Pending' ? 'bg-warning' : (status == 'Approved' ? 'bg-success' : 'bg-danger');
        $('.showDataTitle').empty();
        $("#showDataBody").empty();
        $('.showDataTitle').text('Manual Time Details');
        let htmlData = 
            `<tr> <th>Employee Name:</th> <td>${username}</td> </tr>
            <tr> <th>In Time:</th> <td>${intime}</td> </tr>
            <tr> <th>Out Time:</th> <td>${outtime}</td> </tr>
            <tr> <th>Entry Date:</th> <td>${entryDate}</td> </tr>
            <tr> <th>Status:</th> <td><span class="badge ${statusClass} rounded-pill">${status}</span></td> </tr>
            <tr> <th>Reason:</th> <td>${reason}</td> </tr>`
        ;

        if(manualtimeManage){
            if(status == "Pending"){
                htmlData = htmlData + `<tr> <th class='align-middle'>Action:</th> <td>
                    <button type='button' data-id='${manualId}' data-class='approve' class='btn btn-primary me-sm-3 me-1 mt-1 manualApproveBtn'>Approve</button>
                    <button type='button' data-id='${manualId}' data-class='reject' class='btn btn-danger me-sm-3 me-1 mt-1 ManualRejectBtn'>Reject</button> </td>
                </tr>`;
            }
        }
        $('#showDataBody').html(htmlData);
    });

    $(document).on('click' , '.editManualTimeDetails', function(){
        $('.modal-title').html('Edit Manual Time');
        var id = $(this).data('item-id');

        $.ajax({
            url: APP_URL+'/manualtime/' + id + '/edit',
            type: 'GET',
            data: { id: id },
            success: function (response) {
                $('form#new-manualtime-form').trigger("reset");
                $('#manualTimeUser').attr('disabled', false);

                $('#new-manualtime-form').attr('action', '/manualtime/' + id + '/update');
                $('#in-time').val(response.data.intime);
                $('#out-time').val(response.data.outtime);
                $('#reason').val(response.data.reason);

                $('#manualTimeUser').val(response.data.user_id);
                $('#manualTimeUser').append($('<option>', { value : response.user.id }).text(response.user.name));
                $("#manualTimeUser").val(response.user.id);
                $('#manualtimeModal').modal('show');
                $('#manualTimeUser').attr('disabled', true);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    $('#manualTimeUser').select2({
        minimumInputLength: 3,
        ajax: {
            dataType: 'json',
            delay: 250,
            url: APP_URL+'/search/users',
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.name,
                            id: item.id
                        }
                    })
                };
            },
            cache: true,
        }
    });

});