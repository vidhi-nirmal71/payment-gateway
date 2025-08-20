$(document).ready(function() {
    let urlPath = window.location.pathname;
    var currentSelectedSTAId = null;
    $('#client_id, #project_manager, #staId, #technology, #lms_lead').select2();

    if($('#assign_bucket').length > 0){
        $('#assign_bucket').select2();
    }

    $('#teamMember').select2({
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

    //on change validation remove
    setupSelect2Validation();

    // listen type and add fields
	$('#type').change(function() {
		var typeName = $('select[name=type]').val();
        if(typeName == projectFixCostId){
            $('.TypeFixedCostAppendedData').show();
            $('.deliveryDateFieldId').show();
        }else{
            $('.TypeFixedCostAppendedData').hide();
            $('.deliveryDateFieldId').hide();
        }
  	});

    var typeName = $('select[name=type]').val();
    if(typeName == projectFixCostId){
        $('.TypeFixedCostAppendedData').show();
        $('.deliveryDateFieldId').show();
    }else{
        $('.TypeFixedCostAppendedData').hide();
        $('.deliveryDateFieldId').hide();
    }

    $(document).on('click', '.AddClientButton', function(){
        var currentDate = new Date();
        var day = currentDate.getDate();
        var newDate;
        if (day > 15) {
            newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        } else {
            newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        }
        var year = newDate.getFullYear();
        var month = (newDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
        var formattedDate = year + '-' + month;
        $(document).find('#quarterStart').val(formattedDate);
    });

    //save client data
    $(document).on('click', '#saveClient', function(){
        $('#client-form').validate({
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
        }); 
        if ($('#client-form').valid()) {
            $('#client-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#client-form').validate().resetForm();
                    $('#clientModal').modal('hide');
                    enableSubmitBtn('#saveClient');
                    $('#client_id').append(`<option value='${response.id}' selected>${response.name}</option>`);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveClient');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var formId = 'client-form';
                            var errorElementId = field.replace(/\./g, '-');
                            var errorElement = $('#' + formId).find('#' + errorElementId + '-error'); // Find error element in the form
                            $(errorElement).text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //save Technology data
    $(document).on('click', '#saveTechnology', function(){
        $('#technology-form').validate({
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
        }); 
        if ($('#technology-form').valid()) {
            $('#technology-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#technology-form').validate().resetForm();
                    $('#technologyModal').modal('hide');
                    enableSubmitBtn('#saveTechnology');

                    if(response.success == false){
                        errorMessage(response.message);
                    }else{
                        // Add the new option to the select dropdown
                        var newOption = new Option(response.name, response.id, true, true);
                        $('#technology').append(newOption).trigger('change');
                        successMessage(response.message);
                    }
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveTechnology');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var formId = 'technology-form';
                            var errorElementId = field.replace(/\./g, '-');
                            var errorElement = $('#' + formId).find('#' + errorElementId + '-error'); // Find error element in the form
                            $(errorElement).text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('change', '#staId', function(){
        currentSelectedSTAId = $('#staId').val();
    });

    $(document).on('change','#teamMember', function(){
        var flag = null;
        if( urlPath != '/projects/create' ){
            flag = 'edit';
        }
        var values = $('#teamMember').val();
        var projectId = $('.projId').text();
        $.ajax({
            url: APP_URL + '/project/sta/check',
            type: 'POST',
            data: {values : values, projectId : projectId, flag : flag},
            success: function (res) {
                if(res.data && res.data.usersWithSTA.length != 0){
                    $('#staId').empty();
                    $('#staId').append($('<option>', {
                        text: 'Select STA'
                    }));
                    $.each(res.data.usersWithSTA, function(id, name) {
                        var option = $('<option>', {
                            value: id,
                            text: name
                        });
                    
                        // Check if the current user ID matches the selectedId
                        if (res.data.selectedId && id == res.data.selectedId || currentSelectedSTAId && id == currentSelectedSTAId) {
                            option.prop('selected', true);
                        }
                    
                        $('#staId').append(option);
                    });
                }else{
                    $('#staId').empty();
                    $('#staId').append($('<option>', {
                        text: 'Select STA'
                    }));
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    $(document).on('change', '#start_date', function(){
        let startDate = $('#start_date').val();
        if(startDate){
            let selectedDate = new Date(startDate);
            selectedDate = new Date(selectedDate.getTime() + ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#delivery_date').attr({'min': selectedDate});
        }else{
            $('#delivery_date').attr({'min': ''});
        }
    });

    $(document).on('change', '#delivery_date', function(){
        let deliveryDate = $('#delivery_date').val();
        if(deliveryDate){
            let selectedDate = new Date(deliveryDate);
            selectedDate = new Date(selectedDate.getTime() - ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#start_date').attr({'max': selectedDate});
        }else{
            $('#start_date').attr({'max': ''});
        }
    });

    $(document).on('click', '#downloadPCD', function(){
        var pcdProjectId = $(this).data('id');
        window.open('/project/pcd/open/' + pcdProjectId);
    });
});

// Validate create project form form
$(function() {
    $('#formProject').validate({
        ignore: ':hidden',
        rules:{
            name: {
                required: true,
            },
            client_id: {
                required: true,
            },
            project_manager: {
                required: true,
            },
            description: {
                required: true,
            },
            type: {
                required: true,
            },
            status: {
                required: true,
            },
            start_date: {
                required: true,
            },
            delivery_date: {
                required: true,
            },
            'team_members[]': {
                required: true,
            },
            'technology[]': {
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
            name: {
                required: 'Project Name is required',
            }, client_id: {
                required: 'Client is required',
            }, project_manager: {
                required: 'Project Manager is required',
            }, description: {
                required: 'Description is required',
            }, type: {
                required: 'Project Type is required',
            }, status: {
                required: 'Project Status is required',
            }, start_date: {
                required: 'Project Start Date is required',
            }, 'team_members[]': {
                required: 'Team Member is required',
            }, 'technology[]': {
                required: 'Technology is required',
            }, delivery_date: {
                required: 'Delivery Date is required',
            }, estimatedHours: {
                required: 'Estimated Hours is required',
            }, pcd: {
                required: 'PCD file is required',
            },
            
        },
        submitHandler: function(form) {
            if($('#formProject').valid()) {
                $('#saveProject').attr('disabled', true);
                $('#saveProject').addClass('sending');
            }
            form.submit();
        }
    });
    
});

