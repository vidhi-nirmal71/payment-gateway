@extends('admin.auth.master')

@section('head')
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/pages/page-auth.css" />
    <style>
        .modal-xl{
            max-width: 85% !important;
            height: 90% !important;
        }
        .modal-dialog, .modal-content, .pdf-container {
            height: 100%;
        }
        .modal-body {
            max-height: calc(100% - 80px);
        }
        .modal-header .common-close-button{
            display: none;
        }
        #agreePolicy, #agreeLabel{
            cursor: pointer;
        }
        #policyModal .modal-xl{
            max-width: 1350px !important;
        }
    </style>
@endsection

@section('content')
    <div class="modal fade show" id="policyModal" tabindex="-1" aria-hidden="false" style="display: block;" data-bs-backdrop="static">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Employee Policies</h5>
                    <button type="button" class="btn-close common-close-button" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-2">
                    <div class="pdf-container">
                        <iframe src="{{$filepath}}#zoom=115" width="100%" height="100%" style="border: none;"></iframe>
                    </div>
                </div>
                <form id="policyForm" class="" method="POST" action="{{ route('user.policy.store') }}" enctype="multipart/form-data">
                    @csrf
                    <input type="hidden" value="{{$filepath}}" name="name">
                    <div class="px-4">
                        <div class="form-check mt-3">
                            <input class="form-check-input" type="checkbox" id="agreePolicy" name="agreePolicy" value="1" required>
                            <label class="form-check-label" for="agreePolicy" id="agreeLabel">
                                I hereby acknowledge that I have read and fully understand the contents, requirements, and expectations of the <b>Employee Policy</b>.
                                I agree to abide by the guidelines as a condition of my employment and acknowledge that I am bound by this policy. 
                            </label>
                        </div>
                        <div class="error-message text-danger" id="agreePolicy-error"></div>
                    </div>
                </form>
                <div class="modal-footer">
                    <button type="button" id="policySubmit" class="btn btn-primary">Submit</button>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('script')
    <script src="{{ asset('admin') }}/js/jquery.form.min.js"></script>
    <script>
        $(document).ready(function () {
            $('#agreePolicy').change(function() {
                if ($(this).prop('checked')) {
                    $('#agreePolicy-error').text('');
                }
            });

            $(document).on('click', '#policySubmit', function() {
                var policyChecked = $('#agreePolicy').is(':checked');
                if(policyChecked) {
                    $('#agreePolicy-error').text('');
                    $('#policySubmit').attr('disabled', true);
                    $('#policySubmit').addClass('sending');
                    $('#policyForm').ajaxSubmit({
                        beforeSubmit: function () {
                            $('.error-message').text('');
                        },
                        success: function (response) {
                            $('#policySubmit').attr('disabled', false);
                            $('#policySubmit').removeClass('sending');
                            window.location.href = response.redirectRoute;
                        },
                        error: function (xhr) {
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
                }else{
                    $('#policySubmit').attr('disabled', false);
                    $('#policySubmit').removeClass('sending');
                    var message = 'Please confirm that you have read and agree to the Employee Policy to proceed.';
                    $('#agreePolicy-error').text(message);
                }
            });
        });
    </script>
@endsection