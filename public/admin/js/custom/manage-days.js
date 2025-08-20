$(document).ready(function() {
    var id = 1;
    // var currentYear = new Date().getFullYear(); // Get the current year
    getSaturday();

    $('.workingSaturday').focus();
    $('.holidayDates').focus();

    let activeTabStorage = localStorage.getItem('active-tab-manage-days');
    if(activeTabStorage == 'holiday'){
        $('#holidays').click();
        getHoliday();
        localStorage.removeItem('active-tab-manage-days');
    }else if(activeTabStorage == 'saturday'){
        $('#WorkingSat').click();
        localStorage.removeItem('active-tab-manage-days');
    }

    $(document).on('click','#WorkingSat', function(){
        $('.workingSaturday').focus();
    });
    $(document).on('click','#holidays', function(){
        $('.holidayDates').focus();
    });

    $(document).on('change', '.workingSaturday', function(){
        var lastInputValue = $(this).closest('.row .newAddedSaturdayRows').find('.workingSaturday').last().val();
        var newRowDivLength = $('.newAddedSaturdayRows').children().length;
        if(lastInputValue || newRowDivLength == 0){
            $('.newAddedSaturdayRows').append( createNewSaturdayRow());
        }
    });

    $(document).on('change', '.holidayDates', function(){
        var lastInputValue = $(this).closest('.row .newAddedHolidayRows').find('.holidayDates').last().val();
        var newRowDivLength = $('.newAddedHolidayRows').children().length;
        if(lastInputValue || newRowDivLength == 0){
            $('.newAddedHolidayRows').append(createNewHolidayRow());
        }
    });

    $(document).on('click','.delete', function(){
        $(this).closest('.row').remove();
    })

    $(document).on('click', '#addSaturdayBtn', function(){
        $('#workingSaturdayTable').hide();
        $('#workingSaturdayEdit').show();
    });

    $(document).on('click', '#addHolidayBtn', function(){
        $('#holidayTable').hide();
        $('#HolidaysEdit').show();
    });

    function createNewSaturdayRow() {
        var currentSaturdayId = id;
        var workingSaturdayRow = `<div class="row">
                                    <div class="col-sm-12 col-md-4 col-lg-3 mb-4">
                                        <label for="saturday" class="form-label">Date</label>
                                        <input type="date" placeholder="DD/MM/YYYY" name="saturday[${currentSaturdayId}][date]" class="form-control workingSaturday" autofocus>
                                        <div class="text-sm text-end" style="font-size: 13px;"><i class='bx bxs-info-circle'></i>Click on the icon to open picker</div>
                                    </div>
                                    <div class="col-md-3 col-12 mb-3 form-check form-switch mt-4">
                                        <div class="px-3 float-start">
                                            <input class="form-check-input mt-3" type="checkbox" id="isWorking-${currentSaturdayId}" name="saturday[${currentSaturdayId}][isWorking]">
                                            <label class="form-check-label mt-3" for="isWorking-${currentSaturdayId}">Is Working</label>
                                        </div>
                                        <div class="deleteSaturday float-start">
                                            <label class="delete cursor-pointer mt-3"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>
                                        </div>
                                    </div>
                                </div>`;
                              id++;
        return workingSaturdayRow;
    }

    function createNewHolidayRow() {
        var currentHolidayId = id;
        var holidayRow = `<div class="row">
                                <div class="col-sm-12 col-md-4 col-lg-3 mb-4">
                                    <label for="holiday" class="form-label">Date</label>
                                    <input type="date" placeholder="DD/MM/YYYY" name="holiday[${currentHolidayId}][date]" class="form-control holidayDates" autofocus>
                                    <div class="text-sm text-end" style="font-size: 13px;"><i class='bx bxs-info-circle'></i>Click on the icon to open picker</div>
                                </div>
                                <div class="col-md-5 col-12 mb-4">
                                    <label for="name" class="form-label">Name</label>
                                    <input type="text" class="form-control" id="name" placeholder="Name" name="holiday[${currentHolidayId}][name]">
                                </div>
                                <div class="col-md-3 col-12 mb-4 mt-4">
                                    <label class="delete cursor-pointer mt-3">
                                        <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span>
                                    </label>
                                </div>
                            </div>`;
                        id++;
        return holidayRow;
    }

    // Save Saturday Details
    $(document).on('click','#saveWorkingSaturday' ,function () {
        $('#workingSaturdayForm').validate({
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
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        }); 
    
        if($('#workingSaturdayForm').valid()) {
            disableSubmitBtn('#saveWorkingSaturday');
            $('#workingSaturdayForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    localStorage.setItem('active-tab-manage-days', 'saturday');
                    enableSubmitBtn('#saveWorkingSaturday');
                    successMessage(response.message);
                    $('#workingSaturdayTable').show();
                    $('#workingSaturdayEdit').hide();
                    location.reload(true);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveWorkingSaturday');
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

    // Save Holiday Details
    $(document).on('click','#saveHolidays' ,function () {
        $('#holidayForm').validate({
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
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));
                }
            },
        }); 
    
        if($('#holidayForm').valid()) {
            disableSubmitBtn('#saveHolidays');
            $('#holidayForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    localStorage.setItem('active-tab-manage-days', 'holiday');
                    enableSubmitBtn('#saveHolidays');
                    successMessage(response.message);
                    $('#holidayTable').show();
                    $('#HolidaysEdit').hide();
                    location.reload(true);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveHolidays');
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

    $('#addHolidayBtn, #addSaturdayBtn').on('click', function () {
        fetchData();
    });

    $('#tableSaturdayYear').on('change', function () {
        getSaturday();
    });

    $('#tableHolidayYear').on('change', function () {
        getHoliday();
    });

    $('.tab-btn-data ').on('click', function () {
        var activeTab = $('.satHolidayTabs .nav-link.active').attr('id');
        activeTab === 'WorkingSat' ? getSaturday() : getHoliday();
    });

    $('#selectedHolidaysYear , #selectedSaturdayYear').on('click', function () {
        var activeTab = $('.satHolidayTabs .nav-link.active').attr('id');
        var selectedYear = activeTab === 'WorkingSat' ? $('#selectedSaturdayYear').val() : $('#selectedHolidaysYear').val();
        var activeInput = activeTab === 'WorkingSat' ? '#selectedYearOfSaturday' : '#selectedYearOfHoliday';
        $(activeInput).val(selectedYear);
        fetchData();
    });

    function getSaturday(){
        var selectedYear = $('#tableSaturdayYear').val();

        $.ajax({
            url: APP_URL + '/managedays/fetch',
            type: 'GET',
            data: { name: 'WorkingSat' , year: selectedYear},
            success: function(response) {
                let tableBody = $('#saturdayTableBody');
                tableBody.empty();
                response.data.forEach(function(saturday, index) {
                    let row = $('<tr>');
                    row.append('<td>' + (index + 1) + '</td>');
                    row.append('<td>' + saturday.working_date + '</td>');
                    row.append('<td>' + (saturday.is_event_day == 1 ? 'Event' : 'Working') + '</td>');
                    tableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    function getHoliday(){
        var selectedYear = $('#tableHolidayYear').val();

        $.ajax({
            url: APP_URL + '/managedays/fetch',
            type: 'GET',
            data: { name: 'holiday' , year: selectedYear},
            success: function(response) {
                let tableBody = $('#holidayTableBody');
                tableBody.empty();
                response.data.forEach(function(holiday, index) {
                    let row = $('<tr>');
                    row.append('<td>' + (index + 1) + '</td>');
                    row.append('<td>' + holiday.holiday_name + '</td>');
                    row.append('<td>' + holiday.holiday_date + '</td>');
                    let holidayDate = new Date(holiday.holiday_date);
                    let dayOfWeek = holidayDate.toLocaleString('en-US', { weekday: 'long' });
                    row.append('<td>' + dayOfWeek + '</td>');
                    tableBody.append(row);
                });
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    function fetchData() {
        var activeTab = $('.satHolidayTabs .nav-link.active').attr('id');
        var selectedYear = activeTab === 'WorkingSat' ? $('#selectedSaturdayYear').val() : $('#selectedHolidaysYear').val();
        var activeType = activeTab === 'WorkingSat' ? 'saturday' : 'holiday';

        $.ajax({
            url: APP_URL + '/managedays/fetch',
            type: 'GET',
            data: { name: activeTab , year: selectedYear},
            success: function (res) {
                renderDays(res.data, activeType);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    function renderDays(data, type) {
        var container = type === 'saturday' ? '.saturdayEditList' : '.holidayEditList';
        $(container).empty();
    
        if (data && data.length > 0) {
            data.forEach(item => {
                let dynamicHTML = `
                    <div class="row">
                        <div class="col-sm-12 col-md-4 col-lg-3 mb-4">
                            <label for="${type}-${item.id}" class="form-label">Date</label>
                            <input type="date" 
                                   id="${type}-${item.id}" 
                                   placeholder="DD/MM/YYYY" 
                                   name="${type}[${item.id}][date]" 
                                   value="${type === 'saturday' ? item.working_date : item.holiday_date}" 
                                   class="form-control ${type === 'saturday' ? 'workingSaturday' : 'holidayDates'}" 
                                   autofocus>
                            <div class="text-sm text-end" style="font-size: 13px;">
                                <i class='bx bxs-info-circle'></i>Click on the icon to open picker
                            </div>
                        </div>
                        ${type === 'saturday' ? `
                            <div class="col-sm-6 col-md-4 col-lg-3 form-check form-switch mt-4 mb-4">
                                <div class="px-3 float-start ${item.is_event_day}">
                                    <input class="form-check-input mt-3" 
                                    id="isWorking-${item.id}" 
                                    type="checkbox" 
                                           name="${type}[${item.id}][isWorking]" 
                                           value="0" 
                                           ${item.is_event_day == 0 ? 'checked' : ''}>
                                    <label class="form-check-label mt-3" for="isWorking-${item.id}">Is Working</label>
                                </div>
                                <div class="deleteSaturday float-start">
                                    <label class="delete cursor-pointer mt-3">
                                        <span class="text-danger cursor">
                                            <i class="bx bx-trash me-1"></i>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        ` : `
                            <div class="col-md-5 col-12 mb-4">
                                <label for="name-${item.id}" class="form-label">Name</label>
                                <input type="text" 
                                       class="form-control" 
                                       id="name-${item.id}" 
                                       placeholder="Name" 
                                       name="${type}[${item.id}][name]" 
                                       value="${item.holiday_name}">
                            </div>
                            <div class="col-sm-1 col-md-1 col-lg-1 mt-4">
                                <label class="delete cursor-pointer mt-3">
                                    <span class="text-danger cursor">
                                        <i class="bx bx-trash me-1"></i>
                                    </span>
                                </label>
                            </div>
                        `}
                    </div>`;
                $(container).append(dynamicHTML);
            });
        } else {
            $(container).empty();
            $(container).append('');
        }
    }    
  });