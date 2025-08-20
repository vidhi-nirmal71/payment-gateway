$(document).ready(function () {
    $('#layout-menu a').on('click', function(event) {
        if(profileEmpty == '1'){
            event.preventDefault();
            errorMessage('Please fill in your profile before proceeding further.');
        }
    });

    if(profileEmpty == '1'){
        $('#profileFillAlert').modal('show');
    }

    $('#priTech1, #priTech2, #before_ips_exp_month, #before_ips_exp_month').select2();

    $('#intermediateTech').select2({
        placeholder: "Select Technology"
    });

    $('#database').select2({
        placeholder: "Select database that you worked upon"
    });

    var priTech1Sel = $('#priTech1').val();
    var priTech2Sel = $('#priTech2').val();
    if(priTech2Sel){
        $('#priTech1 option[value="'+priTech2Sel+'"]').remove();
        $('#intermediateTech option[value="'+priTech2Sel+'"]').remove();
    }
    if(priTech1Sel){
        $('#priTech2 option[value="'+priTech1Sel+'"]').remove();
        $('#intermediateTech option[value="'+priTech1Sel+'"]').remove();
    }
    var selectedOptions = $('#intermediateTech').val();
    selectedOptions.forEach(function(value) {
        $('#priTech1 option[value="'+value+'"]').remove();
        $('#priTech2 option[value="'+value+'"]').remove();
    });

    $('#priTech1, #priTech2').on('select2:select', function (e) {
        var currentChange = $(this)
        removeOption(currentChange);
        removeOptionFromIntermediateTech();
    });

    $('#intermediateTech').on('change', function (e) {
        removeOptionFromPrimaryTech('#priTech1');
        removeOptionFromPrimaryTech('#priTech2');
    }); 

    function removeOptionFromPrimaryTech(priTech){
        var selectedOptions = $('#intermediateTech').val();
        var selectedVal = $(priTech).val();
        $(priTech).empty();
        $(priTech).append('<option value="">Select Technology</option>');
        var optionTech = {...technology};

        var priTech1Val = $('#priTech1').val();
        var priTech2Val = $('#priTech2').val();

        if(priTech == '#priTech1' && priTech2Val){
            delete optionTech[priTech2Val];
        }else if(priTech == '#priTech2' && priTech1Val){
            delete optionTech[priTech1Val];
        }

        selectedOptions.forEach(function(value) {
            delete optionTech[value];
        });

        $.each(optionTech, function(key, value) {
            $(priTech).append('<option value="' + key + '">' + value + '</option>');
        });
        if(selectedVal){
            $(priTech).val(selectedVal).change();
        }
    }

    function removeOptionFromIntermediateTech(){
        var priTech1Selected = $('#priTech1').val();
        var priTech2Selected = $('#priTech2').val();
        var selectedOptions = $('#intermediateTech').val();

        var optionTech = {...technology};
        if(priTech1Selected){
            delete optionTech[priTech1Selected];
        }
        if(priTech2Selected){
            delete optionTech[priTech2Selected];
        }

        $('#intermediateTech').empty();
        $.each(optionTech, function(key, value) {
            var selected = (selectedOptions.indexOf(key) !== -1) ? 'selected' : '';
            $('#intermediateTech').append('<option value="' + key + '" ' + selected + '>' + value + '</option>');
        });
    }

    function removeOption(currentChange){
        var selectedVal = $(currentChange).val();
        var currentSelector = '#'+$(currentChange).attr('id');
        var ids = ['#priTech1', '#priTech2'];

        let needToRemove = $(currentSelector).val();
        var optionTech = {...technology};
        if(currentSelector){
            delete optionTech[needToRemove];
        }

        ids.forEach(function(loopID) {
            if (loopID != currentSelector) {
                var selectedOption = $(loopID).val();
                $(loopID).empty();
                $(loopID).append('<option value="">Select Technology</option>');

                var interSelectedTech = $('#intermediateTech').val();

                $.each(optionTech, function(key, value) {
                    if ($.inArray(key, interSelectedTech) === -1) {
                        $(loopID).append('<option value="' + key + '">' + value + '</option>');
                    }
                });

                if(selectedOption){
                    $(loopID).val(selectedOption).change();
                }
            }
        });


        var priTech1Val = $('#priTech1').val();
        var priTech2Val = $('#priTech2').val();
        if(priTech1Val){
            $('#intermediateTech').find('option[value="'+priTech1Val+'"]').remove();
        }
        if(priTech2Val){
            $('#intermediateTech').find('option[value="'+priTech2Val+'"]').remove();
        }

        if(currentSelector == '#intermediateTech'){
            selectedVal.forEach(function(currentId){
                if(currentId){
                    ids.forEach(function(id) {
                        if (id != currentSelector) {
                            $(id).find('option[value="'+currentId+'"]').remove();
                        }
                    });
                }
            });
        }else{
            ids.forEach(function(currentId) {
                if (currentId != currentSelector && selectedVal) {
                    $(currentId).find('option[value="'+selectedVal+'"]').remove();
                }
            });
        }
    }

    //Save User Profile
    $(document).on('click', '#saveProfileInfo', function(){
        $('#profileForm').validate({
            rules: {
                primary_tech1: {
                    required: true,
                }, before_ips_exp_year: {
                    required: true,
                }, before_ips_exp_month: {
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
                primary_tech1:{
                    required: 'Primary technology 1 is required field.'
                }, before_ips_exp_year:{
                    required: 'Year is required.'
                }, before_ips_exp_month:{
                    required: 'Month is required.'
                },
            }
        }); 

        if($('#profileForm').valid()) {
            disableSubmitBtn('#saveProfileInfo');
            $('#profileForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    profileEmpty = '0';
                    enableSubmitBtn('#saveProfileInfo');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveProfileInfo');
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

    //Show the selected image in the image container
    // $('#imageUpload').on('change', function(){
    //     let file = this.files[0];
    //     if (file) {
    //         let reader = new FileReader(); 
    //         reader.onload = (e) => {
    //             $('#imageUploadedAvatar').attr('src', e.target.result);
    //         }
    //         reader.readAsDataURL(file);
    //     }
    // });

    // $(document).on('click', '#autoGeneratePassword' , function(){
    //     let password = generateRandomString(12);
    //     $('#password').val(password);
    // });

    // random password generate for new password field
    // function generateRandomString(length) {
    //     const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz_-.()*&$#@!';
    //     const charactersLength = characters.length;
    //     let result = '';        
    //     for ( let i = 0; i < length; i++ ) {
    //         result += characters.charAt(Math.floor(Math.random() * charactersLength));
    //     }
    //     return result;
    // }

    //Password hide show
    // $(document).on('click', '#showPassword', function(){
    //     var passwordInput = $('#password');
    //     var icon = $('#showPassword');
    //     if (passwordInput.attr('type') === 'password') {
    //         passwordInput.attr('type', 'text');
    //         icon.removeClass('bx bx-hide').addClass('bx bx-show');
    //     } else {
    //         passwordInput.attr('type', 'password');
    //         icon.removeClass('bx bx-show').addClass('bx bx-hide');
    //     }
    // });

    // Update password form submit
    // $(document).on('click', '#changePasswordBtn', function(){
    //     $('#passwordChange').validate({
    //         rules: {
    //             old_password: {
    //                 required: true,
    //             },
    //             password: {
    //                 required: true,
    //                 minlength: 5,
    //             },
    //             password_confirmation: {
    //                 required: true,
    //                 equalTo: "#password"
    //             }
    //         },
    //         highlight: function(element, errorClass, validClass) {
    //             $(element).addClass(errorClass).removeClass(validClass);
    //             $(element).parent('div').addClass('input-error').removeClass(validClass);
    //         },
    //         unhighlight: function(element, errorClass, validClass) {
    //             $(element).removeClass(errorClass).addClass(validClass);
    //             $(element).parent('div').removeClass('input-error').addClass(validClass);
    //         },
    //         errorPlacement: function (error, element) {
    //             if ($(element).parent('.input-group').length) {
    //                 $(error).insertAfter($(element).parent());      // radio/checkbox
    //             } else if ($(element).hasClass('select2-hidden-accessible')) {
    //                 $(error).insertAfter($(element).next('span'));  // select2
    //             } else {
    //                 $(error).insertAfter($(element));               // default
    //             }
    //         },
    //         messages: {
    //             old_password:{
    //                 required: 'Old password is required field.'
    //             }, password:{
    //                 required: 'New password is required field.'
    //             }, password_confirmation:{
    //                 required: 'Confirm password is required field.',
    //                 equalTo: 'Please enter the same password again.'
    //             },
    //         }
    //     }); 

    //     if($('#passwordChange').valid()) {
    //         disableSubmitBtn('#changePasswordBtn');
    //         $('#passwordChange').ajaxSubmit({
    //             beforeSubmit: function () {
    //                 $('.error-message').text('');
    //             },
    //             success: function (res) {
    //                 if(res.success == true){
    //                     $('#passwordChange').validate().resetForm();
    //                     enableSubmitBtn('#changePasswordBtn');
    //                     successMessage(res.message);
    //                     $('#old_password').val('');
    //                     $('#password').val('');
    //                     $('#password_confirmation').val(''); 
    //                 }else{
    //                     $('#old-password-error').text(res.message);
    //                     enableSubmitBtn('#changePasswordBtn');
    //                 }
                    
    //             },
    //             error: function (xhr) {
    //                 enableSubmitBtn('#changePasswordBtn');
    //                 if (xhr.status === 422) {
    //                     var errors = xhr.responseJSON.errors;

    //                     $.each(errors, function (field, error) {
    //                         var fieldId = field.replace(/\./g, '-');
    //                         $('#' + fieldId + '-error').text(error[0]);
    //                     });
    //                 }else {
    //                     // console.log(xhr);
    //                 }
    //             },
    //         });
    //     }
    // });

});