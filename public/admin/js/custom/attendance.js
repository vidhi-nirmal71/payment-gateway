$('#outpicker,#inpicker').datetimepicker({
    format: 'YYYY-MM-DD HH:mm:ss',
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

function approveDetail(approveDate, approved_by, reason){
    $('.showDataTitle').text('Approved Details');
    let html = '';
    html = `<tr> <th>Approved By:</th> <td>${approved_by}</td> </tr>
            <tr> <th>Approved Date:</th> <td>${approveDate}</td> </tr>
            <tr> <th>Reason:</th> <td>${reason}</td> </tr>`;
    $('#showDataBody').html(html);
    $('.offcanvas ').addClass('offcanvas-size-md');
}

// below code is for punch issue, it will get date from url and change calender date
var punchIssueDate = '';
let url = window.location.href;
let urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('date')) {
    punchIssueDate = urlParams.get('date');
    urlParams.delete('date');
    let newUrl = window.location.pathname;
    window.history.replaceState(null, null, newUrl);
}


$(function () {
    $("#employeeFilter").select2({
        placeholder: "Select Employee",
        allowClear: true,
        minimumInputLength: 3,
        ajax: {
            dataType: 'json',
            delay: 250,
            url: APP_URL+'/attendance/userList',
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

    $('#dateFilterChange').datetimepicker({
        format: 'YYYY-MM-DD',
        defaultDate: punchIssueDate ? punchIssueDate : new Date(),
        maxDate: new Date(),
        showTodayButton: true,
        icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-arrow-up",
            down: "fa fa-arrow-down",
            previous: "fa fa-chevron-left",
            next: "fa fa-chevron-right",
            today: "fa fa-clock-o",
            clear: "fa fa-trash-o",
            close: 'fa fa-remove'
        }
    });
    getAttendanceData();

    $('#employeeFilter').change(function() { getAttendanceData(); });

    $('#dateFilterChange').on('change.datetimepicker', ({date, oldDate}) => {
        date ? getAttendanceData() : '';
    })

    function cleanTimeString(timeString) {
        return timeString.split(" ")[0] + " " + timeString.split(" ")[1];
    }

    function getTimeDifference(startTime, endTime) {
        var start = new Date(startTime);
        var end = new Date(endTime);
        var diff = (end - start) / 1000;

        if (diff > 0) {
            var hours = Math.floor(diff / 3600);
            var minutes = Math.floor((diff % 3600) / 60);
            var seconds = Math.floor(diff % 60);
            return { hours, minutes, seconds };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
    }

    function getAttendanceData(){
        let empID = $('#employeeFilter').val();
        let date = $('#dateFilter').val();
        
        $.ajax({
            url: APP_URL+"/attendance/get",
            type: "GET",
            data: { empID: empID, date: date },
            success: function (res) {
                $('.attWorkingHours').html('Working Hour: <span class="workingHrs fw-medium">00:00</span>');
                $('.attPendingHours').html('Remaining Hours: <span class="pendingHrs fw-medium">00:00</span>');
                $('.attExitHours').html('Safe Time: <span class="safeTime fw-medium">00:00</span>');
                $('.attBreakHours').html('Total Break: <span class="brakeTakeHrs fw-medium">00:00</span>');
                $('.attTotalHours').html('Total Hour: <span class="totalHours fw-medium">00:00</span>');
                if(res.success == true){

                    if(res.attendanceTable.total == 0){
                        $('#attendanceTable').html(tableNoData);
                    }else{
                        var totalBreakTime = { hours: 0, minutes: 0, seconds: 0 };
                        var previousOutTime = null;
                        let tc = `<table class="table table-hover table-striped tablecontentcss">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>In Time</th>
                                            <th>Out Time</th>
                                            <th>Working Hours</th>
                                            <th>Status</th>
                                            <th>Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody class="table-border-bottom-0">`;

                        $.each(res.attendanceTable.punchTable, function (k, v) {
                            tc += '<tr class="parentTr" data-id="'+v.pId+'">';
                            tc += '<td class="attendance-date">'+v.attendanceDate+'</td>';
                            tc += '<td class="in-time">'+v.inTime+'</td>';
                            tc += '<td class="out-time">'+v.outTime+'</td>';
                            tc += '<td class="working-hours">'+v.workingHours+'</td>';
                            tc += '<td class="status">'+v.status+'</td>';
                            tc += '<td class="edit">';
                            if(v.edit){
                                tc += '<span class="error"> <a href="javascript:void(0)" title="Edit Punch Details" class="text-info editPunchDetails" data-id="'+v.id+'"> <i class="bx bx-edit-alt me-1"></i> </a> </span>';
                            }
                            tc += '</td></tr>';

                            if (previousOutTime && v.inTime) {
                                var cleanPreviousOutTime = cleanTimeString(previousOutTime);
                                var cleanInTime = cleanTimeString(v.inTime);
                                var breakTime = getTimeDifference(cleanPreviousOutTime, cleanInTime);

                                totalBreakTime.hours += breakTime.hours;
                                totalBreakTime.minutes += breakTime.minutes;
                                totalBreakTime.seconds += breakTime.seconds;
                            }

                            if (v.outTime) {
                                previousOutTime = v.outTime;
                            }
                        });
                        tc += '</tbody></table>';
                        $('#attendanceTable').html(tc);

                        if(res.data.EmployeeTotalPunchArr != '00:00'){
                            $('.attWorkingHours').html('Working Hour: <span class="fw-medium '+(res.data.EmployeeWorkingHourSec < 30600 ? 'text-danger' : 'text-success')+'">'+res.data.EmployeeWorkingPunchArr+'</span>');
                            $('.attTotalHours').html('Total Hour: <span class=" fw-medium btms '+(res.data.EmployeeTotalSec < 34200 ? 'text-danger' : 'text-success')+'">'+res.data.EmployeeTotalPunchArr+'</span>');
                            $('.safeTime').text(res.data.safeTime);   // Exit time - safe time
                            $('.pendingHrs').text(res.data.EmployeeWorkingHourSec < 30600 ? res.data.remainingTime : '00:00');   // remaining time

                            if (totalBreakTime.seconds >= 60) {
                                totalBreakTime.minutes += Math.floor(totalBreakTime.seconds / 60);
                                totalBreakTime.seconds = totalBreakTime.seconds % 60;
                            }

                            if (totalBreakTime.minutes >= 60) {
                                totalBreakTime.hours += Math.floor(totalBreakTime.minutes / 60);
                                totalBreakTime.minutes = totalBreakTime.minutes % 60;
                            }
                            
                            if(totalBreakTime.hours > 8){
                                $('.brakeTakeHrs').text('N/A');
                                $('#punchIssueError').show().text('There is a problem with your punch data, please contact HR.');
                            }else{
                                $('.brakeTakeHrs').text((totalBreakTime.hours == 0 ? '00' : (totalBreakTime.hours < 10 ? '0'+totalBreakTime.hours : totalBreakTime.hours)) + ':' + (totalBreakTime.minutes == 0 ? '00' : (totalBreakTime.minutes < 10 ? '0'+totalBreakTime.minutes : totalBreakTime.minutes)));   // total break time show
                            }
                        }
                    }
                    $('.att-divider').css('display','block');
                }
            },
            error: function (xhr, status, error) {
                console.log(error,xhr);
            },
        });

        $.ajax({
            url: APP_URL+"/attendance/widget/data",
            type: "GET",
            data: { empID: empID, date: date },
            success: function (res) {
                $('#in-office').text(res.tio);
                $('#shortDays').text(res.sd);
                $('#timesheetNotFilled').text(res.tnf);
                $('#billTotal').text(res.bt);
                $('#nonbillTotal').text(res.nbt);
                $('#clienttimesheetTotal').text(res.ctt);

                //Birthday and Workanniversary
                let birthdayData = '.birthdayData';
                let workAnniversaryData = '.workAnniversaryData';

                let userWishes = res.userWishes ?? {};
                let birthdayList = userWishes.birthdayList ?? [];
                let anniversaryList = userWishes.anniversaryList ?? [];

                appendDataToCard(birthdayData , birthdayList, 3 , '.birthDayLeaveCount');
                appendDataToCard(workAnniversaryData , anniversaryList, 3 , '.workAnniversaryLeaveCount');

                if(birthdayList == 0){
                    $('#birthDayBox').hide();
                }else{
                    $('#birthDayBox').show();
                }

                if(anniversaryList == 0){
                    $('#workAnniversaryBox').hide();
                }else{
                    $('#workAnniversaryBox').show();
                }

                $(document).on('click', '.show-btn', function() {
                    const button = $(this);
                    const parentDiv = button.closest('.main-content');
                    const label = parentDiv.find('.label').text();
                    const flag = '.' + parentDiv.find('#flag').attr('class');
                    let optionsHTML = '';

                    $('.showDataTitle').empty();
                    $('#showDataBody').empty();
                    if (birthdayData === flag) {
                        optionsHTML = moreDetailHtml(birthdayList);
                    }if (workAnniversaryData === flag) {
                        optionsHTML = moreDetailHtml(anniversaryList);
                    }
                    $('.showDataTitle').text(label);
                    $('#showDataBody').html(optionsHTML);
                });
            },
            error: function (xhr, status, error) {
                console.log(error,xhr);
            },
        });
    }

    //after ajax call generic html data
    function appendDataToCard(cardSelector, data, maxItems, btnCount){
        const card = $(cardSelector);
        const parentDiv = card.closest('div');
        const btn = parentDiv.find('.show-btn');

        if (data.length > 0) {
            let optionsHTML = '';
            let remaining = 0;
            data.slice(0, maxItems).forEach(function (item) {
                optionsHTML += `<li class="menu-item" style="color:#ffab00;">${item}</li>`;
            });
            if (data.length > maxItems) {
                remaining = data.length - maxItems;
                btn.show();
                $(btnCount).html(remaining);
            } else {
                btn.hide();
            }
            card.html(optionsHTML);
        } else {
            btn.hide();
            card.html(`<li class="menu-item mb-3 text-muted" style="font-weight: 700; font-size: 21px;">No Data found</li>`);
        }
    }

    //after clicking show more html data
    function moreDetailHtml(data) {
        let optionsHTML = '';

        if(data.length > 0){
            data.forEach(function (item) {
                optionsHTML += `<li class="1menu-item" >${item}</li>`;
            });

            return optionsHTML;
        }else{
            return `<tr> <th></th> <td>No Data Found</td> </tr>`
        }
    }

    var punchId = null;
    $(document).on('click', '.editPunchDetails', function() {
        punchId = $(this).data("id");
        $.ajax({
            url: APP_URL+"/attendance/punch/edit/"+punchId,
            type: "GET",
            data: { punchId: punchId },
            success: function (response) {
                if(response.data){
                    $('#punchEdit').validate().resetForm();
                    $('#punchEdit').find('.error').removeClass('error');
                    $('#attendanceDate').val(response.data.AttendanceDate);
                    if(response.data.InTime == '0000-00-00 00:00:00' || response.data.InTime == null){
                        $('#in-time').val(response.data.OutTime);
                        $('#out-time').val(response.data.OutTime);
                    }else if(response.data.OutTime == '0000-00-00 00:00:00' || response.data.OutTime ==  null){
                        $('#in-time').val(response.data.InTime);
                        $('#out-time').val(response.data.InTime);
                    }
                    if(response.data.InTime == '0000-00-00 00:00:00' || response.data.InTime == null){
                        $('#in-time').prop('readonly', false);
                    }else{
                        $('#in-time').prop('readonly', true);
                    }
                    if(response.data.OutTime == '0000-00-00 00:00:00' || response.data.OutTime == null){
                        $('#out-time').prop('readonly', false);
                    }else{
                        $('#out-time').prop('readonly', true);
                    }
                    $("#editPuchModal").modal("show");
                }else{
                    errorMessage('Something went wrong!');
                }
            },
            error: function (xhr, status, error) {
                errorMessage('Something went wrong!' + error);
            },
        });
    });

    // date and time validation for in-time and out-time
    $.validator.addMethod("compareTimes", function(value, element, params) {
        var inTime = new Date($('#in-time').val());
        var outTime = new Date($('#out-time').val());
        return outTime >= inTime;
    }, "Out time must be greater than or equal to in time");

    // Edit puch error validation
    $('#punchEdit').validate({
        ignore: ":hidden",
        rules:{
            'inTime': { required: true },
            'outTime': { required: true, compareTimes: $("#in-time").val()},
            'reason': { required: true }
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
        messages: {
            inTime: { required: 'In time is required field', },
            outTime: { required: 'Out time is required field', compareTimes: "Out time must be greater than or equal to in time" },
            reason: { required: 'Reason is required field', },
        },
    });

    $('#updatePunchRecord').click(function () {
        if($('#punchEdit').valid()) {
            $('#punchEdit').append('<input type="hidden" name="punchId" value="'+punchId+'" /> ');
            disableSubmitBtn('#updatePunchRecord');
            $('#punchEdit').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    enableSubmitBtn('#updatePunchRecord');
                    if(response.status == true){
                        $('#punchEdit').validate().resetForm();
                        $('#editPuchModal').modal('hide');
                        getAttendanceData();
                        successMessage(response.message);
                    }else{
                        errorMessage(response.message);
                    }
                },
                error: function (xhr) {
                    enableSubmitBtn('#updatePunchRecord');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        errorMessage(xhr.responseText);
                    }
                },
            });
        }

    });
});