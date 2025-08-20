$(document).ready(function () {
    var tableFilterData = {
        'search': '',
        'status': '',
        'userName': '',
        'role': '',
    };
    $('.select2').select2();
    requestPage = 1;
    getUserTableData();

    //on change validation remove
    setupSelect2Validation();

    //Filter on Employee tab
    var tableFilterData = {};
	tableFilterData['requestPage'] = 1;

    $(document).on('change', '#activeswitch', function(){
        var activeswitchVal = $('#activeswitch').prop('checked');
        if (!activeswitchVal) {
            $('.inactiveReasonBlock').show();
        } else {
            $('.inactiveReasonBlock').hide();
        }
    });    
	$('#searchInput').on('keyup', function () {
		tableFilterData['requestPage'] = 1;
		getUserTableData();
  	});
  	$('#role').change(function() {
		tableFilterData['requestPage'] = 1;
		getUserTableData();
  	});
  	$('#status, #users').on('change', function () {
		tableFilterData['requestPage'] = 1;
		getUserTableData();
  	});
  	$(document).on('click', '.btnClick', function () {
		tableFilterData['requestPage'] = $(this).attr('data-page');
        getUserTableData();
  	});

    //Save/Update User
    $(document).on('click', '#saveUserForm', function(){
        $('#new-user-form').validate({
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

        if($('#new-user-form').valid()) {
            disableSubmitBtn('#saveUserForm');
            $('#new-user-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    getUserTableData();
                    $('#new-user-form').validate().resetForm();
                    getUserFormData()
                    enableSubmitBtn('#saveUserForm');
                    let newUserOption = `<option value="${response.data.id}" data-select2-id="new">${response.data.name}</option>`;
                    $('#users').append(newUserOption);
                    $('#userModal').modal('hide');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveUserForm');
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

    function getUserTableData() {
        var page = requestPage;
        tableFilterData['search'] = $('#searchInput').val() ?? null;
		tableFilterData['status'] = $('#status').val() ?? null;
		tableFilterData['userName'] = $('#users').val() ?? null;
		tableFilterData['role'] = $('select[name=role]').val() ?? null;
        $.ajax({
            url: APP_URL+'/user/fetchdata',
            type: 'GET',
            data: { tableFilterData : tableFilterData, page: tableFilterData['requestPage']  },
            success: function (res) {
                if(res.data.data == 0){
                    $('#userTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="uTable"><thead class="table-light"><tr>
                            <th>#</th>        
                            <th>Name</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th width="120px;">Joining Date</th>
                            <th width="100px;" title="Increment Month">Inc Month</th>
                            <th width="100px;">Active</th>
                            <th width="80px;">Action</th>
                        </tr></thead><tbody class="table-border-bottom-0">`;

                    let num = res.data.st;
                    var monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    $.each(res.data.data, function (k, v) {
                        var incrementMonth = v.increment_month;
                        var monthName = "-";
                        if (!isNaN(incrementMonth) && incrementMonth >= 1 && incrementMonth <= 12) {
                            monthName = monthNames[parseInt(incrementMonth)];
                        }

                        var userAvatarHtml = userAvatar(v.avatar, v.name,k);
                        var activeClass = v.activated == 'Active' ? 'bg-success' : 'bg-danger';
                        tc += '<tr>';
                        tc += '<td>'+num+'</td>';
                        tc += `<td><div class="d-flex justify-content-start align-items-center">
                                    <div class="avatar-wrapper"><div class="avatar me-2">${userAvatarHtml}</div></div>
                                    <div class="d-flex flex-column"><span class="emp_name text-truncate">${v.name}</span></div>
                                </div></td>`;
                        tc += '<td class="td-username">'+v.userName+'</td>';
                        tc += '<td class="d-none td-name">'+v.name+'</td>';
                        tc += '<td class="d-none td-shift">'+v.shift+'</td>';
                        tc += '<td class="td-email">'+v.email+'</td>';
                        tc += '<td class="td-joining_date text-center">'+v.joining_date+'</td>';
                        tc += '<td class="td-increment_month text-end">'+monthName+'</td>';
                        tc += '<td class="td-activated"><span class="badge rounded-pill  '+activeClass+'">'+v.activated+'</span></td>';
                        tc += '<td class="td-reason d-none">'+v.reason+'</td>';
                        tc += '<td class="td-ptaName d-none">'+v.ptaName+'</td>';
                        tc += '<td class="td-roleName d-none">'+v.role+'</td>';
                        tc += '<td class="text-center">';
                    
                        if(res.data.permission.view == true){
                            tc +=`<label title="Show Employee Details" class="text-primary cursor-pointer showEmployeeDetails" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-id=${v.id}>
                            <i class="bx bx-show me-1"></i></label>`;
                        }
                        if(res.data.permission.edit == true){
                            tc +=`<label title="Edit Employee" class="editUser cursor-pointer" aria-controls="offcanvasEnd" data-item-id="${ v.id }"
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
                    $('#userTable').html(tc);
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
    
    //Get Dropdown data on click
    $(document).on('click','.addNewUser', function(){
        getUserFormData();
    })

    function getUserFormData() {
        $.ajax({
            url: APP_URL+'/user/form',
            type: 'GET',
            data: {},
            success: function (response) {
                $('#new-user-form').attr('action', 'user/store');
                $('#userRole').empty();
                $('#userRole').append('<option value="" selected>Select User Role</option>');
                $.each(response.data.roles, function(index, role) {
                    $('#userRole').append(`<option value="${role.id}" name="userRole">${role.name}</option>`);
                });
                $('#pta').empty();
                $.each(response.data.ptaUsers, function(index, ptaUser) {
                    $('#pta').append(`<option value="${ptaUser.id}" name="pta[]">${ptaUser.name}</option>`);
                });
                $('#shiftId').empty();
                $('#shiftId').append('<option value="" selected disabled>Select Shift</option>');
                $.each(response.data.shiftData, function(index, shift) {
                    $('#shiftId').append(`<option value="${index}" name="shift">${shift}</option>`);
                });
                $('#passwordinputfield').show();
                $('#formTitle').text('Add New User');
                $('#new-user-form').validate().resetForm();
                $('.inactiveReasonBlock').hide();
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    //Show Employee offcanvas
    $(document).on('click', '.showEmployeeDetails', function () {
        var name = $(this).closest('tr').find('.td-name').text();
        var username = $(this).closest('tr').find('.td-username').text();
        var email = $(this).closest('tr').find('.td-email').text();
        var joiningDate = $(this).closest('tr').find('.td-joining_date').text();
        var incrementMonth = $(this).closest('tr').find('.td-increment_month').text();
        var activated = $(this).closest('tr').find('.td-activated').text();
        var reason = $(this).closest('tr').find('.td-reason').text();
        var ptaNames = $(this).closest('tr').find('.td-ptaName').text();
        var roleNames = $(this).closest('tr').find('.td-roleName').text();
        var shift = $(this).closest('tr').find('.td-shift').text();
        var activeClass = activated == 'Active' ? 'bg-success' : 'bg-danger';
    
        $('.showDataTitle').empty();
        $('#showDataBody').empty();
        $('.showDataTitle').text('Employee Details');
        $('#showDataBody').html(
            `<tr> <th>Name:</th> <td>${name}</td> </tr>
            <tr> <th>User Name:</th> <td>${username}</td> </tr>
            <tr> <th>Email:</th> <td>${email}</td> </tr>
            <tr> <th>PTA:</th> <td>${ptaNames}</td> </tr>
            <tr> <th>Role:</th> <td>${roleNames}</td> </tr>
            <tr> <th>Shift:</th> <td>${shift}</td> </tr>
            <tr> <th>Joining Date:</th> <td>${joiningDate}</td> </tr>
            <tr> <th>Increment Month:</th> <td>${incrementMonth}</td> </tr>
            <tr> <th>Activated:</th> <td><span class="badge rounded-pill ${activeClass}">${activated}</span></td> </tr>
            ${activated === 'Inactive' ? `<tr> <th>Reason:</th> <td>${reason}</td> </tr>` : ''}`
        );
    });

    //Add Details on Edit user form
    $(document).on('click','.editUser', function(){
        var id = $(this).data('item-user-id');
        $.ajax({
            url: APP_URL+'/user/' + id + '/edit',
            type: 'GET',
            data: { id: id },
            success: function (response) {
                $('#new-user-form').validate().resetForm();
                $('#new-user-form .error').removeClass('error');
                $('#new-user-form .error-message').empty();
                $('#validationMessages').empty();
                $('#formTitle').text('Edit User');
                $('#new-user-form').attr('action', '/user/' + id + '/update');
                $('#fullName').val(response.data.user.name);
                $('#email').val(response.data.user.email);
                $('#userName').val(response.data.user.username);
                $('#passwordinputfield').hide();
                $('#joiningDate').val(response.data.user.joining_date);
                $('#machine_punch_id').val(response.data.user.machine_punch_id);
                $('#machine_code_id').val(response.data.user.machine_code_id);
                if(response.data.user.activated !== 1){
                    $('#activeswitch').prop('checked', false);
                    $('#activeswitch').prop('disabled', true);
                    $('.inactiveReasonBlock').show();
                    $('#inActiveReason').val(response.data.user.reason);
                    $('#inActiveReason').prop('disabled', true);
                }else{
                    $('#activeswitch').prop('checked', true);
                    $('#activeswitch').prop('disabled', true);
                    $('.inactiveReasonBlock').hide();
                }
                if (response.data.roles.length > 0) {
                    $('#userRole').empty();
                    var roleIds = response.data.user.roles.map(role => role.id);
                    $.each(response.data.roles, function (index, role) {
                        var selectedAttribute = roleIds.includes(role.id) ? 'selected' : '';
                        $('#userRole').append($('<option>').text(role.name).val(role.id).prop('selected', selectedAttribute));
                    });
                }
                if (response.data.pta.length > 0) {
                    $('#pta').empty();
                    $.each(response.data.AllPtaUser, function (index, ptaUser) {
                        var selectedAttribute = response.data.pta.some(pta => pta.id === ptaUser.id) ? 'selected' : '';
                        $('#pta').append($('<option>').text(ptaUser.name).val(ptaUser.id).prop('selected', selectedAttribute));
                    });
                }else{
                    $('#pta').empty();
                    $.each(response.data.AllPtaUser, function (index, ptaUser) {
                        $('#pta').append($('<option>').text(ptaUser.name).val(ptaUser.id));
                    });
                }
                if (response.data.user.shift_id !== null) {
                    $('#shiftId').empty();
                    $.each(response.data.shiftData, function (index, shift) {
                        var selectedAttribute =  response.data.user.shift_id == index ? 'selected' : '';
                        $('#shiftId').append($('<option>').text(shift).val(index).prop('selected', selectedAttribute));
                    });
                }else{
                    $('#shiftId').empty();
                    $('#shiftId').append($('<option selected disabled>').text('Select Shift').val(''));
                    $.each(response.data.shiftData, function (index, shift) {
                        $('#shiftId').append($('<option>').text(shift).val(index));
                    });
                }
                if(response.data.incrementMonth != null){
                    $('#incrementMonth').val(response.data.incrementMonth).trigger('change');
                }
                $('#userModal').modal('show');
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    //Password hide show
    $(document).on('click', '#showPassword', function(){
        var passwordInput = $('#password');
        var icon = $('#showPassword');
        if (passwordInput.attr('type') === 'password') {
            passwordInput.attr('type', 'text');
            icon.removeClass('bx bx-hide').addClass('bx bx-show');
        } else {
            passwordInput.attr('type', 'password');
            icon.removeClass('bx bx-show').addClass('bx bx-hide');
        }
    });

    $(document).on('click', '#autoGeneratePassword' , function(){
        let password = generateRandomString(12);
        $('#password').val(password);
    });

    function generateRandomString(length)
    {
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz_-.()*&$#@!';
        const charactersLength = characters.length;
        let result = '';
        
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

});
