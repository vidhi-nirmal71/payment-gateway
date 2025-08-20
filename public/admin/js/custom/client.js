$(document).ready(function () {
    var tableFilterData = {
        'search': '',
        'status': '',
        'userName': '',
    };
    $('.select2').select2();
    var requestPage = 1;
    var resetFilterState = 0;
    getClientTableData();

    //on change validation remove
    setupSelect2Validation();

    //Filter on Employee tab
    var tableFilterData = {};
	tableFilterData['requestPage'] = 1; 

    $('#searchInput').on('keyup', function () {
		tableFilterData['requestPage'] = 1;
        $('.reset-filters').show();
		getClientTableData();
  	});

  	$('#status, #users, #timesheet, #hasBucket').on('change', function () {
		tableFilterData['requestPage'] = 1;
        $('.reset-filters').show();
		getClientTableData();
  	});

  	$(document).on('click', '.btnClick', function () {
		tableFilterData['requestPage'] = $(this).attr('data-page');
        getClientTableData();
  	});

    $(document).on('click', '#resetClientFilters', function () {
        resetFilterState = 1;
        $('#searchInput').val('');
        $('#status').val('2').trigger('change');
        $('#timesheet').val(null).trigger('change');
        $('#hasBucket').val(null).trigger('change');

        $('.reset-filters').hide();
        resetFilterState = 0;
        getClientTableData();
    });

    // Save client form
    $(document).on('click', '#saveClientForm', function(){
        $('#new-client-form').validate({
            rules: {
                first_name: {
                    required: true,
                },
                last_name: {
                    // required: true,
                },
                email: {
                    email: true,
                },
                password: {
                    required: false,
                    minlength: 6
                },
                quarterStart: {
                    required: true,
                },
                date_format: {
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
                first_name: {
                    required: 'First name is required',
                },
                quarterStart: {
                    required: 'Quarter start is required',
                },
                email: {
                    required: "Email is required",
                    email: "Enter a valid email address"
                },
                password: {
                    required: "Password is required",
                    minlength: "Password must be at least 6 characters"
                },
                date_format: {
                    required: "Date format is required",
                }
            },
        });

        if($('#new-client-form').valid()) {
            disableSubmitBtn('#saveClientForm');
            $('#new-client-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    getClientTableData();
                    $('#new-client-form').validate().resetForm();
                    enableSubmitBtn('#saveClientForm');
                    $('#clientModal').modal('hide');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveClientForm');
                    console.log('xhr: ', xhr);
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;

                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    }else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

        // Save client form
    $(document).on('click', '#saveEditClientForm', function(){
        $('#edit-client-form').validate({
            rules: {
                first_name: {
                    required: true,
                },
                last_name: {
                    // required: true,
                },
                email: {
                    email: true,
                },
                password: {
                    required: function () {
                        return $('#editClientModal').find('#clientId').val() == '';
                    },
                    minlength: 6
                },
                quarterStart: {
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
                first_name: {
                    required: 'First name is required',
                },
                quarterStart: {
                    required: 'Quarter start is required',
                },
                email: {
                    required: "Email is required",
                    email: "Enter a valid email address"
                },
                password: {
                    required: "Password is required",
                    minlength: "Password must be at least 6 characters"
                }
            },
        });

        if($('#edit-client-form').valid()) {
            disableSubmitBtn('#saveEditClientForm');
            $('#edit-client-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    getClientTableData();
                    $('#edit-client-form').validate().resetForm();
                    enableSubmitBtn('#saveEditClientForm');
                    $('#editClientModal').modal('hide');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveEditClientForm');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;

                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    }else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    // fnc to get client list
    function getClientTableData() {
        if(resetFilterState == 0){
            tableFilterData['search'] = $('#searchInput').val() ?? null;
            tableFilterData['status'] = $('#status').val() ?? null;
            tableFilterData['timesheet'] = $('#timesheet').val() ?? null;
            tableFilterData['hasBucket'] = $('#hasBucket').val() ?? null;

            if(tableFilterData['search'] == '' && tableFilterData['status'] == '2' && tableFilterData['timesheet'] == '' && tableFilterData['hasBucket'] == ''){
                $('.reset-filters').hide();
            }

            $.ajax({
                url: APP_URL+'/clients/fetchdata',
                type: 'GET',
                data: { tableFilterData : tableFilterData, page: tableFilterData['requestPage']  },
                success: function (res) {
                    if(res.data.data == 0){
                        $('#clientTable').html(tableNoData);
                    }else{
                        let tc = `<table class="table table-hover table-striped tablecontentcss" id="uTable"><thead class="table-light"><tr>
                                <th style="width:5%;">#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>User Name</th>
                                <th>Email</th>
                                <th class="d-none">Created Date</th>
                                <th style="width:6%;">Timesheet</th>
                                <th style="width:6%;">Bucket</th>
                                <th style="width:6%;">Status</th>
                                <th style="width:5%;">Action</th>
                            </tr></thead><tbody class="table-border-bottom-0">`;

                        let num = res.data.st;
                        $.each(res.data.data, function (k, v) {
                            var activeClass = v.status == 'Active' ? 'bg-success' : 'bg-danger';
                            var activeClassTimesheet = v.ct == 'Yes' ? 'bg-success' : 'bg-danger';
                            var activeClassBucket = v.hasBucket == 'Yes' ? 'bg-success' : 'bg-danger';

                            tc += '<tr data-id="'+v.id+'">';
                            tc += '<td>'+num+'</td>';
                            tc += '<td class="td-fName">'+(v.fName ? v.fName : '-')+'</td>';
                            tc += '<td class="td-lName">'+(v.lName ? v.lName : '-')+'</td>';
                            tc += '<td class="td-un">'+v.un+'</td>';
                            tc += '<td class="td-email">'+(v.email ? v.email : '-')+'</td>';
                            tc += '<td class="td-client-timesheet text-center"><span class="badge rounded-pill '+activeClassTimesheet+'">'+(v.ct ? v.ct : '-')+'</span></td>';
                            tc += '<td class="td-created_date d-none">'+v.created_at+'</td>';
                            tc += '<td class="td-quarter_start d-none">'+v.qs+'</td>';
                            tc += '<td class="td-date_format d-none">'+v.dateFormat+'</td>';
                            tc += '<td class="td-has_bucket"><span class="badge rounded-pill '+activeClassBucket+'">'+v.hasBucket+'</span></td>'; 
                            tc += '<td class="td-activated"><span class="badge rounded-pill '+activeClass+'">'+v.status+'</span></td>';
                            tc += '<td class="text-center">';
                        
                            if(res.data.permission.view == true){
                                tc +=`<a title="Show Client Details" class="text-primary cursor-pointer" id="showClientDetails" href="${APP_URL}/client/details/${v.id}">
                                <i class="bx bx-show me-1"></i></a>`;
                            }
                            if(res.data.permission.edit == true){
                                tc +=`<label title="Edit Client" class="editClient cursor-pointer" aria-controls="offcanvasEnd" data-item-id="${ v.id }"
                                data-item-user-id="${ v.id }"> <span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>`;
                            }
                            tc += '</td></tr>';
                            num++;
                        });
                        tc += '</tbody>';
                        if(res.data.morePage){
                            tc += makePagination(res.data.button);
                        }
                        tc += '</table>';
                        $('#clientTable').html(tc);
                        var prevLink = $('#uTable a.prev');
                        var nextLink = $('#uTable a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        }
    }

    // Add new client
    $(document).on('click','.addNewClient', function(){
        $('#clientModal').modal('show');
        passwordReset('.addNewClient');
        setDate();
    });

    function passwordReset(selector = ''){
        const passwordField = $(selector).find('#password');
        const toggleIcon = $(selector).find('.showhidePassword i');
        passwordField.attr('type', 'password');
        toggleIcon.removeClass('bx-hide').addClass('bx-show');
    }

    function setDate(){
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
    }

    // Edit client icon click
    $(document).on('click','.editClient', function(){
        passwordReset();
        var clientId = $(this).data('item-id');
        $.ajax({
            url: APP_URL+'/client/'+clientId,
            type: 'GET',
            data: {},
            success: function (res) {
                if(res.success){
                    $('#edit-client-form').validate().resetForm();
                    $('#editFirstName').val(res.data.first_name);
                    $('#editLastName').val(res.data.last_name);
                    $('#editEmail').val(res.data.email);
                    $('#editUserName').text(res.data.user_name);
                    $('#editPassword').val(res.data.secret_key);
                    $('#editClientId').val(res.data.encId);
                    $('#editCreatedAtDate').text(res.data.createdAt);
                    if(res.data.status == 1){
                        $('#editActiveswitch').prop('checked', true);
                    }else{
                        $('#editActiveswitch').prop('checked', false);
                    }
                    if(res.data.client_timesheet == 1){
                        $('#editClientTimesheet').prop('checked', true);
                    }else{
                        $('#editClientTimesheet').prop('checked', false);
                    }
                    $('#editClientModal').modal('show');
                    $(document).find('#editQuarterStart').val(res.data.quarterStartMonth);

                    $('#dateFormat option').each(function () {
                        if ($(this).val() == res.data.date_format_id) {
                            $(this).prop('selected', true);
                        }
                    });
                    $('#dateFormat').trigger('change');
                }else{
                    errorMessage(res.message);
                }
                
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    //Show client details
    $(document).on('click', '#showClientDetails', function () {
        var fName = $(this).closest('tr').find('.td-fName').text();
        var lName = $(this).closest('tr').find('.td-lName').text();
        var uN = $(this).closest('tr').find('.td-un').text();
        var email = $(this).closest('tr').find('.td-email').text();
        var createAt = $(this).closest('tr').find('.td-created_date').text();
        var quarterStart = $(this).closest('tr').find('.td-quarter_start').text();
        var clientTimesheet = $(this).closest('tr').find('.td-client-timesheet').text();
        var activated = $(this).closest('tr').find('.td-activated').text();
        var activeClass = activated == 'Active' ? 'bg-success' : 'bg-danger';
        var dateFormat = $(this).closest('tr').find('.td-date_format').text();
    
        $('.showDataTitle').empty();
        $('#showDataBody').empty();
        $('.showDataTitle').text('Client Details');
        $('#showDataBody').html(
            `<tr> <th>First Name:</th> <td>${fName}</td> </tr>
                <tr> <th>Last Name:</th> <td>${lName}</td> </tr>
                <tr> <th>User Name:</th> <td>${uN}</td> </tr>
                <tr> <th>Email:</th> <td>${email}</td> </tr>
                <tr> <th>Timesheet:</th> <td>${clientTimesheet}</td> </tr>
                <tr> <th>Created At:</th> <td>${createAt}</td> </tr>
                <tr> <th>Quarter Start:</th> <td>${quarterStart}</td> </tr>
                <tr> <th>Date Format:</th> <td>${dateFormat}</td> </tr>
                <tr> <th>Activated:</th> <td><span class="badge rounded-pill ${activeClass}">${activated}</span></td> </tr>`
        );
    });
    
    //Generate Password
    function generatePassword(formId) {
        const length = 14;
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const special = "!@#$%^&*()_+{}[]:;<>,.?~\\/-=";
        const allChars = lowercase + uppercase + numbers + special;

        let password = '';
        
        // Ensure each required character type is included at least once
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += special.charAt(Math.floor(Math.random() * special.length));

        // Fill the rest with random characters
        for (let i = password.length; i < length; ++i) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        // Shuffle the password to prevent predictable order
        password = password.split('').sort(() => 0.5 - Math.random()).join('');

        // Set the password value in the form
        $(formId).find('[name="password"]').val(password);
    }
        
    // Toggle Password visibility
    function togglePassword(formId) {
        const passwordField = $(formId).find('[name="password"]');
        const toggleIcon = $(formId).find('.showhidePassword i');
        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            toggleIcon.removeClass('bx-show').addClass('bx-hide');
        } else {
            passwordField.attr('type', 'password');
            toggleIcon.removeClass('bx-hide').addClass('bx-show');
        }
    }
        
    // Copy Password to clipboard
    function copyPassword(formId) {
        const passwordField = $(formId).find('[name="password"]');
        const password = passwordField.val();
        if(password != ''){
            if(copyToClipboard(password)){
                const copyIcon = $(formId).find('.copyPassword i');
                copyIcon.removeClass('bx-copy').addClass('bx-check');
                successMessage('Password Copied!');
        
                setTimeout(function () {
                    copyIcon.removeClass('bx-check').addClass('bx-copy');
                }, 1000);
            }else{
                errorMessage('Something went wrong');
            }
        }else{
            errorMessage('Please Enter Password!');
        }
    }
    
    $(document).on('click', '.generatePassword', function() {
        let formId = '#' + $(this).closest('form').attr('id');
        generatePassword(formId);
    });

    $(document).on('click', '.showhidePassword', function() {
        let formId = '#' + $(this).closest('form').attr('id');
        togglePassword(formId);
    });

    $(document).on('click', '.copyPassword', function() {
        let formId = '#' + $(this).closest('form').attr('id');
        copyPassword(formId);
    });

});