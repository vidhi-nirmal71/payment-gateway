var screenHeight = $(window).height();
var seventyPercentHeight = 0.75 * screenHeight;
$('#user-container').css('max-height', seventyPercentHeight + 'px');
$('.card').css('min-height', (seventyPercentHeight+110) + 'px');

var copiedData = {};
    // 1 - Available
    // 2 - Occupied
    // 3 - Leave
    // 4 - Holiday
    // 5 - Support
    // 6 - In house

const ALLOCATION_STATUS = {
    available: 1,
    occupied: 2,
    leave: 3,
    holiday: 4,
    support: 5,
    in_house: 6,
};

var ptaAssigEmpAvailability = [];

$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    },
    beforeSend: function() {
        $('.card-body').append(loading());
    },
    complete: function() {
        $('#loading').hide();
        $('#main-container').show();
        if($(document).find('.today-col').length > 0){
            $('#resp-table').show();
        }
    }
});

$(document).tooltip({
    content: function() {
        return $(this).attr('data-title');
    }
});

$('#cbShowAvlTodayOnly').change(function() {
    search_employees();
});

$('#search').on('search keyup', function() {
    search_employees();
});

$('body').on('keyup', function(e) {
    if (e.which != 191) {
        return false;
    }
    if (!$('input').is(':focus')) {
        document.getElementById("search").focus();
    }
});

document.addEventListener('mousemove', e => {
    $('.user-slot').removeClass('opacity-low');

    var element = document.elementFromPoint(e.clientX, e.clientY);
    var classes = $(element).attr('class');
    if (classes == 'view-icon' || classes == 'paste-icon' || classes == 'copy-icon') {

        var parent = $(element).parent('.user-slot');
        var elDate = $(parent).attr('date');
        var elSlot = $(parent).attr('slot');

        $("[date='" + elDate + "'][slot='" + elSlot + "']").addClass('opacity-low');
    }

}, { passive: true })

function search_employees() {
    var keyword = $('#search').val().toLowerCase();
    var rows = $('#user-container').find('.user-row-container');
    var shoeAvailableOnly = $('#cbShowAvlTodayOnly').is(':checked')
    $.each(rows, function(index, val) {

        if (shoeAvailableOnly) {
            var sltCnt = $(val).find('.today-col.user-available, .today-col.in-house, .today-col.user-support').length;
            if (sltCnt >= 1) {
                $(val).removeClass('d-none');
            } else {
                $(val).addClass('d-none');
                return true;
            }
        } else {
            $(val).removeClass('d-none');
        }

        var userRow = $(val).find('.user-row-name');
        var userSlot = $(val).find('.user-slot');

        var name = userRow.data('name').toLowerCase();
        var technology = userRow.data('technology') ? userRow.data('technology').toLowerCase() : '';
        var name_tech = false;
        var project_search = false;

        if (name.includes(keyword) || technology.includes(keyword)) {
            name_tech = true;
        }

        $.each(userSlot, function(slotIndex, uSlot) {
            var t = $(uSlot).attr('task-details').toLowerCase();
            if (t.includes(keyword)) {
                project_search = true;
                return false;
            }
        });

        if (name_tech || project_search) {
            userRow.parent('.user-row-container').removeClass('d-none');
        } else {
            userRow.parent('.user-row-container').addClass('d-none');
        }

    })
}

function render_employees(obj) {
    var employees = obj.data.employee_data;
    var total_employees = employees.length;
    var ptaRoleId = obj.data.ptaRoleId;
    var avpRoleId = obj.data.avpRoleId
    $('#ptaRoleId').val(ptaRoleId);
    $('#avpRoleId').val(avpRoleId);
    $('#user-container').html('');

    for (var i = 0; i < total_employees; i++) {

        if(obj.data.employee_data[i].role_id != obj.data.ptaRoleId && obj.data.employee_data[i].role_id != obj.data.avpRoleId){
            $('<div>', { id: "user-id-" + obj.data.employee_data[i].user_id, class: 'user-row-container' }).appendTo('#user-container');
        }

        if(obj.data.employee_data[i].role_id == obj.data.ptaRoleId ||  obj.data.employee_data[i].role_id == obj.data.avpRoleId){
            var ptaDetails = {
                id: obj.data.employee_data[i].user_id,
                name: obj.data.employee_data[i].name,
                availability: 0,
            };
            ptaAssigEmpAvailability[ptaDetails.id] = ptaDetails;
        }

        let pta_id = obj.data.employee_data[i].pta ? Object.keys(obj.data.employee_data[i].pta).join(', ') : '';
        let pta_name = obj.data.employee_data[i].pta ? Object.values(obj.data.employee_data[i].pta).join(', ') : '';

        $('<div>', {
            class: 'user-row-name',
            text: obj.data.employee_data[i].name +' - ' + (obj.data.employee_data[i].role_name ? obj.data.employee_data[i].role_name.substring(0,3) : ''),
            'data-name': obj.data.employee_data[i].name,
            'data-user-id': obj.data.employee_data[i].user_id,
            'data-experience': obj.data.employee_data[i].experience,
            'data-technology': obj.data.employee_data[i].technology,
            'data-designations': obj.data.employee_data[i].role_name,
            'data-pta': pta_name,
            'data-pta-id': pta_id,
            'data-RoleId': obj.data.employee_data[i].role_id,
        }).appendTo("#user-id-" + obj.data.employee_data[i].user_id);

        render_employee_row(obj.data.employee_data[i].user_id, obj.data.employee_data[i], obj.data.employee_data[i].role_id, ptaRoleId, avpRoleId);
    }
}

function create_table_for_pta_assigned_employee_availability()
{
    if($(document).find('.today-col').length > 0){
        $('.today-col').each(function() {
            var statusId = $(this).attr('status-id');
            if(statusId == '1'){
                let parentNameDiv = $(this).parent('.user-row-container');
                let ptaIds = $(parentNameDiv).children('.user-row-name').attr("data-pta-id");
                if(ptaIds){
                    let ptaIdsArray = ptaIds.split(',').map(id => id.trim());
                    ptaIdsArray.forEach(currentPtaId => {
                        if (ptaAssigEmpAvailability.hasOwnProperty(currentPtaId)) {
                            ptaAssigEmpAvailability[currentPtaId].availability += 0.5;
                        }
                    });
                }
            }
        });
        $('#resp-table-body').html('');
        ptaAssigEmpAvailability.forEach(avaData => {
            let empAvailabilityData = `<div class="resp-table-row">
                <div class="table-body-cell pta-name-avail">${avaData.name}</div>
                <div class="table-body-cell availability-count">${avaData.availability}</div>
            </div>`;
            $('#resp-table-body').append(empAvailabilityData);
        });
    }else{
        $(document).find('#resp-table').hide();
    }
}

function render_employee_row(user_id, obj, designations_id, ptaRoleId, avpRoleId) {
    var employee_details = obj.emp_details;
    var total_slots = employee_details.length;

    var today = new Date();
    let todayDate = formatToTwoDigit(today.getDate());
    let currentMonth = formatToTwoDigit(today.getMonth() + 1);
    let currentYear = today.getFullYear();
    let todayString = currentYear + "-" + currentMonth + "-" + todayDate;

    for (var i = 0; i < total_slots; i++) {
        var slot_id = user_id + "-" + obj.emp_details[i].employee_slot_date + "-" + obj.emp_details[i].employee_slot;
        var todayClass = '';
        if (todayString == employee_details[i].employee_slot_date) {
            todayClass = ' today-col';
        }

        $('<div>', {
            id: slot_id,
            class: get_user_status_class(employee_details[i], designations_id, ptaRoleId, avpRoleId) + todayClass,
        }).appendTo('#user-id-' + user_id);
        $('#' + slot_id).attr('user-id', user_id);
        $('#' + slot_id).attr('date', obj.emp_details[i].employee_slot_date);
        $('#' + slot_id).attr('slot', obj.emp_details[i].employee_slot);
        $('#' + slot_id).attr('status', obj.emp_details[i].employee_status);
        $('#' + slot_id).attr('status-id', obj.emp_details[i].status_id);
        $('#' + slot_id).attr('user-fullname', obj.name);

        if (obj.emp_details[i].status_id != ALLOCATION_STATUS.leave) {
            $('#' + slot_id).attr('task-details', obj.emp_details[i].task_details);
        } else {
            $('#' + slot_id).attr('task-details', '');
        }


        if (obj.emp_details[i].holiday_status == 'No') {
            var tooltip = create_tooltip_content(obj.emp_details[i]);

            $('<span>', { class: 'view-icon', title: 'Menu', 'data-title' : tooltip }).appendTo('#' + slot_id);
            $('<span>', { class: "paste-icon", title: 'Click to Paste' }).appendTo('#' + slot_id);

            if (obj.emp_details[i].status_id != ALLOCATION_STATUS.available) {
                $('<span>', { class: "copy-icon", title: 'Click to Copy' }).appendTo('#' + slot_id);
            }
        }

    }
}

function create_tooltip_content(emp_details) {
    var tooltip = "<b>Status:</b>  " + emp_details.employee_status;
    if (emp_details.status_id == ALLOCATION_STATUS.occupied || emp_details.status_id == ALLOCATION_STATUS.support || emp_details.status_id == ALLOCATION_STATUS.in_house) {
        tooltip += "<br><b>Project:</b> " + emp_details.task_details;
    }
    return tooltip;
}

function get_user_status_class(obj, designations_id, ptaRoleId, avpRoleId) {
    if (obj.holiday_status == "Yes") {
        return 'user-slot user-how';
    }

    var classname = "user-slot";

    if((designations_id != ptaRoleId && designations_id != avpRoleId) ) {
        if (obj.employee_status == "Available") {
            classname += " user-available";
        } else if (obj.employee_status == "Occupied") {
            classname += " user-occupied";
        } else if (obj.employee_status == "Leave") {
            classname += " user-leave";
        } else if (obj.employee_status == "Support") {
            classname += " user-support";
        } else if (obj.employee_status == "In-house") {
            classname += " in-house";
        } else if (obj.employee_status == "HoW") { //To Do
            classname += " user-how";
        }
    }
    return classname;
}

function update_employee_row(obj) {
    if (obj.length) {
        var avpRoleId = $('#avpRoleId').val();
        var ptaRoleId = $('#ptaRoleId').val();

        for (var i = 0; i < obj.length; i++) {
            var slot_id = obj[i].id + '-' + obj[i].emp_details.employee_slot_date + '-' + obj[i].emp_details.employee_slot;

            var today = new Date();
            let todayDate = formatToTwoDigit(today.getDate());
            let currentMonth = formatToTwoDigit(today.getMonth() + 1);
            let currentYear = today.getFullYear();
            let todayString = currentYear + "-" + currentMonth + "-" + todayDate;
            var todayClass = '';
            if (todayString == obj[i].emp_details.employee_slot_date) {
                todayClass = ' today-col';
            }

            var element = $('#' + slot_id);
            var className = get_user_status_class(obj[i].emp_details, obj[i].role_id, ptaRoleId, avpRoleId) + todayClass;
            element.removeAttr('class').addClass(className);
            element.attr('user-id', obj[i].id);
            element.attr('date', obj[i].emp_details.employee_slot_date);
            element.attr('slot', obj[i].emp_details.employee_slot);
            element.attr('status', obj[i].emp_details.employee_status);
            element.attr('status-id', obj[i].emp_details.status_id);
            element.attr('task-details', obj[i].emp_details.task_details);
            element.attr('user-fullname', obj[i].name);

            var tooltip = create_tooltip_content(obj[i].emp_details);

            element.find('.view-icon').attr('data-title', tooltip);
        }
    }
}


function render_date_header_row(dates_header) {
    if (dates_header.length) {

        today = new Date();
        let todayDate = formatToTwoDigit(today.getDate());
        let currentMonth = formatToTwoDigit(today.getMonth() + 1);
        let todayString = todayDate + "-" + currentMonth;
        var $header_row_1 = $("#header-row-1-content");
        var $header_row_2 = $("#header-row-2-content");

        var dates_el = '';
        var dates_el_2 = '';

        for (var i = 0; i < dates_header.length; i++) {
            var todayClass = '';
            if (dates_header[i] == todayString) {
                todayClass = 'today-col';
            }

            dates_el += '<div class="header-date ' + todayClass + '">' + dates_header[i] + '</div>';
            dates_el_2 += '<div class="header-slot ' + todayClass + '">1st</div><div class="header-slot ' + todayClass + '">2nd</div>';
        }

        $header_row_1.html(dates_el);
        $header_row_2.html(dates_el_2);
    }
}

function formatToTwoDigit(dd) {
    if (dd < 10) dd = '0' + dd;

    return dd;
}

$("body").on('click', '.copy-icon', function() {

    var slotToCopy = $(this).parent('.user-slot');
    //var status = slotToCopy.attr('status-id');

    copyData(slotToCopy);

})

$("body").on('click', '.paste-icon', function() {
    if (copiedData.status == '' || copiedData.task == '') {
        errorMessage("Can't copy slot. Please update manually.");
        return false;
    }

    var slotEl = $(this).parent('.user-slot');
    var resource_id = slotEl.attr('user-id');
    var date = slotEl.attr('date');
    var slot = (slotEl.attr('slot') == "First" ? 1 : 2);

    var data = {
        resource_id: resource_id,
        end_date: date,
        start_date: date,
        end_slot: slot,
        start_slot: slot,
        status: copiedData.status,
        task: copiedData.task,
        action: "edit"
    }

    pasteData(data);
})

$(document).on('click', '.view-icon', function() {
    $('#formAddResourceAllocation').find('.cal-has-error').remove();
    var rad = $(this).parent('.user-slot');
    var status_id = rad.attr('status-id');

    if (rad.hasClass('user-how')) {
        return false;
    }

    if (status_id == 1) {
        showAddResourcePopup(rad);
    } else {
        editResourceAllocationDialog(rad)
    }
});

function saveSlot(data, submitType = 'form') {
    let startDate = $('[name="start_date"]').val();
    let endDate = $('[name="end_date"]').val();

    if (startDate && endDate && endDate < startDate) {
        $(".cal-has-error").remove();
        $('[name="end_date"]').after("<span class='cal-has-error'>End date must be equal to or greater than start date.</span>");
        return;
    }
    $.ajax({
        url: '/ras/save-allocation',
        type: "post",
        data: data,
        beforeSend: function() {
            $(".cal-has-error").remove();
        },
        success: function(resp) {
            $('#addResourceAllocationDialog').modal('hide');
            successMessage('Slot data added successfully!');
            if (resp.status && resp.data.updated_data) {
                update_employee_row(resp.data.updated_data);
            }
        },
        error: function(resp) {
            var jsonResp = resp.responseJSON;
            if (!jsonResp.status && resp.status == 400) {
                if (submitType == 'form') {
                    $.each(jsonResp.data.errors, function(index, val) {
                        $("#formAddResourceAllocation").find('[name="' + index + '"]').after("<span class='cal-has-error'>" + val[0] + "</span>");
                    })
                }

                if (submitType == 'paste') {
                    errorMessage("Can't copy slot. Please update manually.");
                }
            }
        }
    })
}

function showAddResourcePopup(el) {
    var resource_id = el.attr('user-id');
    var date = el.attr('date');
    var slot = (el.attr('slot') == "First") ? 1 : 2;
    var status_id = el.attr('status-id');
    var fullname = el.attr('user-fullname');

    $("#formAddResourceAllocation").find("#fra_resource_id").val(resource_id);
    $("#formAddResourceAllocation").find("#start_date").val(date);
    $("#formAddResourceAllocation").find("#end_date").val(date);
    $("#formAddResourceAllocation").find("#fra_task_detail").val('');
    $("#formAddResourceAllocation").find("input[name=start_slot][value=" + slot + "]").prop('checked', 'checked');
    $("#formAddResourceAllocation").find("input[name=end_slot][value=" + slot + "]").prop('checked', 'checked');
    $("#formAddResourceAllocation").find("#ddStatus").val(status_id);
    $("#formAddResourceAllocation").find('#fre_emp_name').val(fullname);

    endDateValidation(date);
    $('#addResourceAllocationDialog').modal('show');
}

$("#btnSaveResourceAllocation").click(function() {
    var data = $("#formAddResourceAllocation").serialize();
    saveSlot(data, 'form');
});

// Set min date for filter start date
$(document).on('input change', '#start_date', function(){
    let startDate = $('#start_date').val();
    endDateValidation(startDate);
});

function endDateValidation(date) {
    if(date){
        $('.ras_end_date').attr({'min': date});
    }else{
        $('.ras_end_date').attr({'min': ''});
    }
}

function editResourceAllocationDialog(rad) {

    var date = rad.attr('date');
    var fullname = rad.attr('user-fullname');
    var user_id = rad.attr('user-id');
    var slot = rad.attr('slot');
    var task_details = rad.attr('task-details');
    var status = rad.attr('status-id');

    $("#formEditResourceAllocation").find("#fra_resource_id").val(user_id);
    $("#formEditResourceAllocation").find('#fre_date').val(date);
    $("#formEditResourceAllocation").find('#fre_emp_name').val(fullname);
    $("#formEditResourceAllocation").find('#fre_slot').val(slot);
    $("#formEditResourceAllocation").find('#fre_status').val(status);
    $("#formEditResourceAllocation").find('#fre_task_detail').val(task_details);
    $("#formEditResourceAllocation").find('#fra_ip_date').val(date);
    $("#formEditResourceAllocation").find('#fra_ip_slot').val((slot == "First") ? 1 : 2);

    if (status == 3 || status == 1) {
        $("#formEditResourceAllocation").find("#fre_task_detail").prop("readonly", true).prop("disabled", true);
    } else {
        $("#formEditResourceAllocation").find("#fre_task_detail").prop("readonly", false).prop("disabled", false);
    }

    endDateValidation(date);
    $('#editResourceAllocationDialog').modal('show');
}

$("#btnUpdateResourceAllocation").click(function() {
    $("#formEditResourceAllocation").ajaxSubmit({
        beforeSend: function() {
            $(".cal-has-error").remove();
        },
        success: function(resp) {
            $('#editResourceAllocationDialog').modal('hide');
            successMessage('Slot data updated successfully!');
            if (resp.status && resp.data.updated_data) {
                update_employee_row(resp.data.updated_data);
            }
        },
        error: function(resp) {
            var jsonResp = resp.responseJSON;

            if (!jsonResp.status) {
                $.each(jsonResp.data.errors, function(index, val) {
                    $("#formEditResourceAllocation").find('[name="' + index + '"]').after("<span class='cal-has-error'>" + val[0] + "</span>");
                })
            }
        }
    });
});

function copyData(slotToCopy) {

    var resource_id = slotToCopy.attr('user-id');
    var date = slotToCopy.attr('date');
    var slot = (slotToCopy.attr('slot') == "First" ? 1 : 2);
    var status = slotToCopy.attr('status-id');
    var task = slotToCopy.attr('task-details');
    copiedData = {
        resource_id,
        date,
        slot,
        status,
        task
    }
}

function pasteData(data) {
    saveSlot(data, 'paste');
}

$("body").on('click', '.user-row-name', function() {
    var name = $(this).data('name');
    var experience = $(this).data('experience');
    var technology = $(this).data('technology');
    var designations = $(this).data('designations');
    var pta_name = $(this).data('pta');

    $('#userInfoModel').find('#empName').html(name);
    $('#userInfoModel').find('#empRole').html(designations);
    $('#userInfoModel').find('#empTech').html(technology);
    $('#userInfoModel').find('#empExp').text(experience);
    if (pta_name == '') {
        $('#userInfoModel').modal('hide');
    } else {
        $('#userInfoModel').modal('show');
        $('#userInfoModel').find('#empPta').html(pta_name);
    }
});

function closeDialog(element) {
    $(element).dialog("close");
}

$("#fre_status").change(function() {
    var selectedVal = $(this).val();
    if (selectedVal == 1 || selectedVal == 3) {
        $("#fre_task_detail").val('').prop("readonly", true).prop("disabled", true);
    } else {
        $("#fre_task_detail").prop("readonly", false).prop("disabled", false);
    }
});

$('#ddStatus').change(function() {
    var selectedVal = $(this).val();
    if (selectedVal == 1 || selectedVal == 3) {
        $('#fra_task_detail').val('').prop('readonly', true).prop('disabled', true);
    } else {
        $('#fra_task_detail').prop('readonly', false).prop('disabled', false);
    }
});

$(document).on('click', '#showAvailability', function(){
    if($('#ptaAvailabilityModel').length > 0){
        $('#ptaAvailabilityModel').modal('show');
    }
});