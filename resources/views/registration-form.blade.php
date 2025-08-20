<!DOCTYPE html>
<html lang="en" class="light-style layout-navbar-fixed layout-compact layout-menu-fixed">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Registration | Workspace</title>
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/core.css?v=0.026" class="template-customizer-core-css" />
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/theme-default.css?v=0.1" class="template-customizer-theme-css" />
    <link rel="stylesheet" href="{{ asset('admin/css/demo.css?v=0.05') }}">
    <link rel="stylesheet" href="{{ asset('admin/css/perfect-scrollbar.css') }}">  
</head>

<body>
    <div class="layout-wrapper layout-content-navbar">
        <div class="layout-container">
            <div class="col-12">
                <div class="content-wrapper">
                    <div class="container-xxl flex-grow-1 container-p-y">
                        <h4 class="py-3 mb-4">Registration For Workspace</h4>
                        <div class="row">
                            <div class="col-12">
                                <div class="card mb-4">
                                    <h5 class="card-header">Create Your Account</h5>
                                    <div class="card-body">
                                        <form action="{{ route('user.register.store') }}" method="POST" id="userRegistration" enctype="multipart/form-data">
                                            @csrf
                                            <div class="row mb-3">
                                                <div class="col-md-6">
                                                    <label class="form-label">First Name <span class="text-danger">*</span></label>
                                                    <input type="text" class="form-control" name="first_name" value="{{ old('first_name') }}" required>
                                                    <div class="text-danger">@error('first_name') {{ $message }} @enderror</div>
                                                </div>
                                                <div class="col-md-6">
                                                    <label class="form-label">Last Name <span class="text-danger">*</span></label>
                                                    <input type="text" class="form-control" name="last_name" value="{{ old('last_name') }}" required>
                                                    <div class="text-danger">@error('last_name') {{ $message }} @enderror</div>
                                                </div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-6">
                                                    <label class="form-label">Email Address <span class="text-danger">*</span></label>
                                                    <input type="email" class="form-control" name="email" value="{{ old('email') }}" required>
                                                    <div class="text-danger">@error('email') {{ $message }} @enderror</div>
                                                </div>
                                                <div class="col-md-6">
                                                    <label class="form-label">Phone Number</label>
                                                    <input type="text" class="form-control" name="phone" value="{{ old('phone') }}">
                                                    <div class="text-danger">@error('phone') {{ $message }} @enderror</div>
                                                </div>
                                            </div>
                                            <div class="row mb-3">
                                                <div class="col-md-6">
                                                    <label class="form-label">Password <span class="text-danger">*</span></label>
                                                    <input type="password" class="form-control" name="password" required>
                                                    <div class="text-danger">@error('password') {{ $message }} @enderror</div>
                                                </div>
                                                <div class="col-md-6">
                                                    <label class="form-label">Confirm Password <span class="text-danger">*</span></label>
                                                    <input type="password" class="form-control" name="password_confirmation" required>
                                                </div>
                                            </div>
                                            <div class="pt-3">
                                                <button type="submit" class="btn btn-primary">Register</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

<script src="{{ asset('admin') }}/js/jquery.min.js"></script>
<script src="{{ asset('admin') }}/js/jquery.validate.min.js?v=0.1"></script>
<script>
$(document).ready(function() {
    $('#userRegistration').validate({
        rules: {
            first_name: {
                required: true,
                minlength: 2
            },
            last_name: {
                required: true,
                minlength: 2
            },
            email: {
                required: true,
                email: true
            },
            phone: {
                digits: true,
                minlength: 10,
                maxlength: 15
            },
            password: {
                required: true,
                minlength: 8
            },
            password_confirmation: {
                required: true,
                equalTo: "#userRegistration input[name='password']"
            }
        },
        messages: {
            first_name: {
                required: "Please enter your first name",
                minlength: "First name must be at least 2 characters long"
            },
            last_name: {
                required: "Please enter your last name",
                minlength: "Last name must be at least 2 characters long"
            },
            email: {
                required: "Please enter your email address",
                email: "Please enter a valid email address"
            },
            phone: {
                digits: "Please enter a valid phone number",
                minlength: "Phone number must be at least 10 digits",
                maxlength: "Phone number cannot exceed 15 digits"
            },
            password: {
                required: "Please provide a password",
                minlength: "Password must be at least 8 characters long"
            },
            password_confirmation: {
                required: "Please confirm your password",
                equalTo: "Passwords do not match"
            }
        },
        errorElement: 'div',
        errorPlacement: function(error, element) {
            error.addClass('text-danger');
            error.insertAfter(element);
        },
        highlight: function(element) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function(element) {
            $(element).removeClass('is-invalid');
        }
    });

    $('#submitRegistration').click(function(e) {
        e.preventDefault();
        if ($('#userRegistration').valid()) {
            $('#userRegistration').submit();
        }
    });

});
</script>

</html>
