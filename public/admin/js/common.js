
// Enable/Disable submit button after click
function disableSubmitBtn(name){
    $(name).attr('disabled', true);
    $(name).addClass('sending');
}

function enableSubmitBtn(name){
    $(name).attr('disabled', false);
    $(name).removeClass('sending');
}

function setupSelect2Validation() {
    $(document).on('change', '.select2', function() {
        var form = $(this).closest('form');
        if(form.length > 0){
            $(this).on("select2:close", function (e) {  
                $(this).valid(); 
            });
        }
    });
}

function formValidationReset(formId){
    $(formId).validate().resetForm();
    $(formId).find('.is-invalid').removeClass("is-invalid");
    $(formId).find('.is-valid').removeClass("is-valid");
    $(formId).find('.invalid-feedback').remove();
    $(formId).find('.error').removeClass('error');
}

function setFocusOnFirstInput(modalId) {
    $(modalId).modal('show');

    // Set focus to the first input field inside the modal after it's fully shown
    $(modalId).on('shown.bs.modal', function () {
        const firstInput = document.querySelector(`${modalId} input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]):not([disabled]):not([readonly]), ${modalId} textarea:not([disabled]), ${modalId} select:not([disabled])`);
        const select2Id = $(firstInput).attr('id');

        if(modalId == '#userModal'){
            $('#userRole').select2('open');
            $('#userRole').select2('focus');
        }
        if (firstInput && firstInput.tagName.toLowerCase() === 'select') {
            // Check if it's a Select2 element
            if ($(firstInput).hasClass('select2-hidden-accessible')) {
                $('#' + select2Id).select2('open');
                $('#' + select2Id).select2('focus');
            } else {
                // If it's a regular select element, focus on it directly
                firstInput.focus();
            }
        } else if (firstInput) {
            if(select2Id == 'comment'){
                $('#comment').summernote('focus');
            }
            firstInput.focus();
        }
    });
}

// calculation of time (Footer sum of time)
function secondsToHHMMSS(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function secondsToHHMM(seconds) {
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
}

const tableNoData = `<div class="pb-4 pt-2"> <h6 class="font-20 mb-0 text-light text-center">No data found</h6> </div>`;

function makePagination(btn){
    var pagination = `<tfoot class="table-border-bottom-0"> <tr> <td colspan="100%"> <nav aria-label="Page navigation"> <ul class="pagination">`;
    $.each(btn, function (k, v) {
        pagination += '<li class="'+v.class+' page-item '+v.type+'"> <a class="page-link btnClick '+v.type+'" data-page="'+v.page+'" href="javascript:void(0);">'+v.page+'</a> </li>';
    });
    pagination += '</ul> </nav> </td> </tr> </tfoot>';
    return pagination;
}

// If the provided date is from current month or any future month/year → return true
// Additionally, if today is the 1st of the month and the provided date is from last month → return true
// In all other (past) cases → return false
function isCurrentOrFutureMonth(dateStr) {
    let date;

    // Handle dd-mm-yyyy
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1);
    }
    // Handle yyyy-mm-dd
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1);
    } else {
        console.error("Invalid date format");
        return false;
    }

    const now = new Date();
    const inputYear = date.getFullYear();
    const inputMonth = date.getMonth();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Case 1: Future month or current month
    if (
        inputYear > currentYear ||
        (inputYear === currentYear && inputMonth >= currentMonth)
    ) {
        return true;
    }

    // Case 2: Today is the 1st and input date is exactly last month
    if (
        now.getDate() === 1 &&
        inputYear === currentYear &&
        inputMonth === currentMonth - 1
    ) {
        return true;
    }

    // Case 3: It's January, check if input is December of previous year
    if (
        now.getDate() === 1 &&
        currentMonth === 0 && // January
        inputYear === currentYear - 1 &&
        inputMonth === 11 // December
    ) {
        return true;
    }

    return false;
}

//validate email of tagify
function validateTagifyEmails(tagify, errorSelector, required = false) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const $error = $(errorSelector);
    const emails = tagify.value.map(tag => tag.value);
    const input = tagify.DOM?.input?.value?.trim() || '';
    const invalid = emails.filter(email => !emailRegex.test(email));
    const showInputError = input && !emailRegex.test(input);

    if (required && emails.length === 0) {
        $error.text('At least one email is required.');
        return false;
    }

    if (invalid.length || showInputError) {
        $error.text('Invalid email(s): ' + [...invalid, ...(showInputError ? [input] : [])].join(', '));
        return false;
    }

    $error.text('');
    return true;
}

//initialize tagify for email inputs
function initTagify(selector, errorSelector, required = false) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const input = $(selector)[0];
    if (input && input._tagify) {
        return input._tagify;
    }

    const tagify = new Tagify(input, {
        validate: tag => emailRegex.test(tag.value),
        duplicates: false
    });

    const validate = () => validateTagifyEmails(tagify, errorSelector, required);

    tagify.on('add', validate);
    tagify.on('remove', validate);
    tagify.on('invalid', e => {
        $(errorSelector).text('Invalid email: ' + e.detail.data.value);
        validate();
    });
    tagify.DOM.input.addEventListener('blur', validate);

    return tagify;
}