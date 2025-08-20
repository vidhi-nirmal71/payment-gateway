$(document).ready(function () {
    /*Below code for Activity log and pagination */
    requestPage = 1;
    var dateFilter = {};

    $(document).on('click', '.page-link', function () {
        let currentPage = $(this).parent().hasClass('active');
        if (!currentPage) {
            requestPage = $(this).attr('data-url').split('=').pop();
            activityLog();
        }
    });

    $(document).on ('click', '#filterReset', function(){
        $('#employeeFilter').val(null).trigger('change');
		$('#logFilter').val(null).trigger('change');
        $('#filterStartDate').datetimepicker('clear');
        $('#filterEndtDate').datetimepicker('clear');
        activityLog();
    });

    // Enable disable Activity filter button
    $('#filterStartDate, #filterEndtDate').on('input', function () {
        if( $('#filterStartDate').val() || $('#filterEndtDate').val()){
            enableSubmitBtn('#filterSearch');
        }else{
            $('#filterSearch').attr('disabled', true);
        }
    });

    $(document).on('change', '#logFilter', function() {
        requestPage = 1;
        activityLog();
    });

    $(document).on('change', '#employeeFilter' , function() {
        requestPage = 1;
        activityLog();
    });

    $(document).on("click", '#filterSearch', function() {
        disableSubmitBtn('#filterSearch');
        dateFilter['startDate'] = $('#filterStartDate').val();
        dateFilter['endDate'] = $('#filterEndtDate').val();
        activityLog(); 
    })
    
    function activityLog() {
        $('#activityTable').append(loading());
        let user = $('#employeeFilter').length ? $('#employeeFilter').val() : null;
        let log = $('#logFilter').length ? $('#logFilter').val() : null;

        $.ajax({
            url: APP_URL+'/activity/fetchData',
            type: 'GET',
            data: { page: requestPage , dateFilter: dateFilter, user : user, log:log},
            success: function (response) {
                $('#activityTable').find('.loading-wrapper').remove();
                $('#activityTable').html('');
                $('#activityTable').html(response.data);
                if($('#filterEndtDate').val() != '' || $('#filterStartDate').val() != ''){
                    enableSubmitBtn('#filterSearch');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    $(document).on('click','.userName' , function(){
        let id = $(this).closest('tr').find('.userId').text();
        let model = $(this).closest('tr').find('.userModel').text();
    
        $.ajax({
            url: '/activity/information',
            type: 'GET',
            data: { id: id , model: model},
            success: function (response) {
                if(response.success == false ){
                    errorMessage(response.message);
                }
                $('.showDataTitle').empty();
                $('#showDataBody').empty();
                $('.showDataTitle').text('User Details');
                $('.offcanvas').addClass('offcanvas-size-md');
                var  tableHtml = '';
                $.each(response.data, function (key, value) {
                    tableHtml += `<tr>
                            <th>${key}</th>
                            <td>${value}</td>
                            </tr>`;
                });
                $('#showDataBody').append(tableHtml);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    $(document).on('click','.subjectIdOffcanvas' , function(){
        let id = $(this).closest('tr').find('.subjectId').text();
        let model = $(this).closest('tr').find('.subjectModel').text();
        let activityId = $(this).closest('tr').find('.activityId').text();

        $('.showDataTitle').empty();
        $(document).find('.offcanvas #showDataBody').html('<h5>Loading...</h5>');
        $('.showDataTitle').text('Activity Details');
        $('.offcanvas').removeClass('offcanvas-size-md');
        $('.offcanvas').addClass('offcanvas-size-xl');

        $.ajax({
            url: '/activity/information',
            type: 'GET',
            data: { id: id , model: model, activityId: activityId},
            success: function (response) {
                $(document).find('.offcanvas #showDataBody').empty();
                var  tableHtml = '';
                $.each(response.data, function (key, value) {
                    tableHtml += `<tr>
                            <th>${key}</th>
                            <td>${value}</td>
                            </tr>`;
                });
                $(document).find('.offcanvas #showDataBody').append(tableHtml);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    activityLog();

    $('#filterStartDatepicker, #filterEndtDatepicker').datetimepicker({
        format: 'YYYY-MM-DD HH:mm:ss',
        locale: 'en',
        useCurrent: false,
        maxDate: new Date(),
        icons: {
            time: 'fa fa-clock',
            date: 'fa fa-calendar',
            up: 'fa fa-arrow-up',
            down: 'fa fa-arrow-down',
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-clock-o',
            clear: 'fa fa-trash-o',
            close: 'fa fa-times',
        }
    });

    $('#logFilter').select2({
        placeholder: 'Select Log Type',
        allowClear: true,
    });

    $('#employeeFilter').select2({
        placeholder: 'Select Employee',
        allowClear: true,
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

    //below functionality is for validations and save the Doc form 
    $(document).on('click', '#restoreLogs', function () {
        $('#restore-log-form').validate({
            rules: {
                attachment: {
                    required: true,
                    extension: "zip"
                }
            },
            messages: {
                attachment: { required: "Please upload zip file to restore activity logs.", extension: "The attachment must be a file of type: CSV" },
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

        if($('#restore-log-form').valid()) {
            disableSubmitBtn('#restoreLogs');
            $('#restore-log-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (res) {
                    if(res.success == true){
                        $('#restoreLogsModal').modal('hide');
                        activityLog();
                        successMessage(res.msg);
                    }else{
                        errorMessage(res.msg);
                    }
                    $('#restore-log-form').validate().resetForm();
                    enableSubmitBtn('#restoreLogs');
                },
                error: function (xhr) {
                    console.log('xhr: ', xhr);

                    enableSubmitBtn('#restoreLogs');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        let errorToShow = '';
                        $.each(errors, function (field, error) {
                            errorToShow = errorToShow+' '+'<p style="margin-bottom: 0;">'+error[0]+'</p>';
                        });
                        $('#attachment-error').html(errorToShow);
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

});