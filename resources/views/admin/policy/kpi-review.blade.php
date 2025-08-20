@extends('admin.auth.master')

@section('head')
    <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/pages/page-auth.css" />
    <style>
        #agreeKpi, #agreeLabel{
            cursor: pointer;
        }
        .modal-header .common-close-button{
            display: none;
        }
    </style>
@endsection

@section('content')
    <div class="modal fade show" id="kpiPreviewModal" tabindex="-1" aria-hidden="false" style="display: block;" data-bs-backdrop="static">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ $roleName }} - KPI List</h5>
                    <button type="button" class="btn-close common-close-button" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-2">
                    <div class="pdf-container">
                        @if(isset($kpiData))
                            <table border="1" style="border-collapse: collapse; width: 100%;">
                                <thead>
                                    <tr>
                                        <th style="border: 1px solid black;" class="ps-2">Category</th>
                                        <th style="border: 1px solid black;" class="ps-2">KPI</th>
                                        <th style="border: 1px solid black;" class="ps-2">Default Weightage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                @php
                                    $previousCategory = null;
                                    $categoryRowSpan = [];
                                    foreach ($kpiData as $kpi) {
                                        $category = $kpi->category->name;
                                        $categoryRowSpan[$category] = ($categoryRowSpan[$category] ?? 0) + 1;
                                    }
                                @endphp

                                @foreach($kpiData as $kpi)
                                <tr>
                                    @if ($kpi->category->name !== $previousCategory)
                                        <td style="border: 1px solid black;" class="ps-2" rowspan="{{ $categoryRowSpan[$kpi->category->name] }}">
                                            {{ $kpi->category->name }}
                                        </td>
                                        @php
                                            $previousCategory = $kpi->category->name;
                                        @endphp
                                    @endif
                                    <td style="border: 1px solid black;" class="ps-2">{{ $kpi->kpi_details }}</td>
                                    <td style="border: 1px solid black;" class="ps-2">{{ $kpi->default_weightage }}</td>
                                </tr>
                                @endforeach
                                </tbody>
                            </table>
                        @endif              
                    </div>
                </div>
                <form id="kpiForm" class="" method="POST" action="{{ route('user.kpi.store') }}" enctype="multipart/form-data">
                    @csrf
                    <div class="px-4">
                        <div class="form-check mt-3">
                            <input class="form-check-input" type="checkbox" id="agreeKpi" name="agreeKpi" value="1" required>
                            <label class="form-check-label" for="agreeKpi" id="agreeLabel">
                                I hereby acknowledge that I have reviewed, understand, and agree to the terms outlined in the <b>KPI List</b>. 
                                I commit to achieving the specified goals and objectives as part of my employment responsibilities and agree to uphold these standards as outlined within this policy.
                            </label>
                        </div>
                        <div class="error-message text-danger" id="agreeKpi-error"></div>
                    </div>
                </form>
                <div class="modal-footer">
                    <button type="button" id="kpiSubmit" class="btn btn-primary">Submit</button>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('script')
    <script src="{{ asset('admin') }}/js/jquery.form.min.js"></script>
    <script>
        $(document).ready(function () {
            $('#agreeKpi').change(function() {
                if ($(this).prop('checked')) {
                    $('#agreeKpi-error').text('');
                }
            });

            $(document).on('click', '#kpiSubmit', function() {
                var kpiChecked = $('#agreeKpi').is(':checked');
                if(kpiChecked) {
                    $('#agreeKpi-error').text('');
                    $('#kpiSubmit').attr('disabled', true);
                    $('#kpiSubmit').addClass('sending');
                    $('#kpiForm').ajaxSubmit({
                        beforeSubmit: function () {
                            $('.error-message').text('');
                        },
                        success: function (response) {
                            $('#kpiSubmit').attr('disabled', false);
                            $('#kpiSubmit').removeClass('sending');
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
                    $('#kpiSubmit').attr('disabled', false);
                    $('#kpiSubmit').removeClass('sending');
                    var message = 'Please confirm that you have read and agree to the KPI List to proceed.';
                    $('#agreeKpi-error').text(message);
                }
            });
        });
    </script>
@endsection