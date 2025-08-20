function showToast(selectedType, message) {
    const AppToast = document.querySelector('#AppToast');
    $('#toastContent').html(message);
    AppToast.classList.add(selectedType);
    DOMTokenList.prototype.add.apply(AppToast.classList, ['top-0', 'end-0']);
    toastPlacement = new bootstrap.Toast(AppToast);
    toastPlacement.show();
}
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

$('body').on('click', '.user-workspace .logoutBtn', function() {
    let text = 'Are you sure you want to logout?';
    var conformThis = $(this);
    alert('Alert!',text,'text-danger')
        .then(function(result) {
            if (result) {
                window.location = conformThis.data('href');     
            }
    });
})

function copyToClipboard(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy);
        return true;
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        textArea.style.left = '-1000px';

        // Detect open modal (assuming Bootstrap modals)
        const openModal = document.querySelector('.modal.show');
        const parentElement = openModal ? openModal : document.body;

        parentElement.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            return successful;
        } catch (err) {
            return false;
        } finally {
            textArea.remove();
        }
    }
}

function successMessage(message) {
    $('#toastContent').text('');
    $('.toast').removeClass('bg-danger');
    $('.toast').addClass('bg-success');
    $('#toastContent').html(message);
    $('#AppToast').toast('show');
}

function errorMessage(message) {
    $('#toastContent').text('');
    $('.toast').removeClass('bg-success');
    $('.toast').addClass('bg-danger');
    $('#toastContent').html(message);
    $('#AppToast').toast('show');
}
// Alert JS
function alert(heading, message ,headingColorClass) {
    $('.alertHeading').addClass(headingColorClass).html(heading);
    $('.alertText').html(message);
    $('.custom-popup').show();
    return new Promise(function(resolve) {
        $(document).on('click','.cancelButton',function() {
            $('.custom-popup').hide();
            $('.alertHeading').removeClass(headingColorClass).html('');
            $('.alertText').html('');
            resolve(false);
        });

        $(document).on('click','.okButton', function() {
            $('.custom-popup').hide();
            $('.alertHeading').removeClass(headingColorClass).html('');
            $('.alertText').html('');
            resolve(true);
        });
    });
}
//Reset and Close modal/form
$(document).on('click', '.common-close-button', function() {
    var modal = $(this).closest('.modal');
    if(modal.find('form').length > 0){
        modal.find('form')[0].reset();
    }
    modal.modal('hide');
});

//User Avatar or name icon function
function userAvatar(avatar, name,key) {
    // color name icon
    var bgColors = ["bg-label-primary", "bg-label-success", "bg-label-info", "bg-label-warning", "bg-label-danger"];
    var bgColorClass = bgColors[key % bgColors.length];
    // Image or Name Icon
    if(avatar){
        var avatar  = isValidURL(avatar) ? avatar : APP_URL+'/storage/profile-images/'+avatar;
        var userAvatar = '<img src="' + avatar + '" alt="Avatar" class="rounded-circle">';
    }else{
        var userAvatar = '<span class="avatar-initial rounded-circle ' + bgColorClass + '">' + name.match(/\b\w/g).join("") + '</span>';
    }
    
    return userAvatar;
}

function isValidURL(urlString) {
    try {
        // Creating a URL object will throw an exception if the string is not a valid URL
        new URL(urlString);
        return true;
    } catch (error) {
        return false;
    }
}

// This function remove more text then provided character limit and add ... in end
function sliceText(text, character) 
{
    return  text !== null ?  (text.length > character ? text.substring(0, character) + '...' : text ) : '';
}

function loading()
{
    if($('#loading').length == 0){
        return `<div class="loading-wrapper mb-1" id="loading"> <h6 class="font-20 mb-0 text-center">Loading...</h6> </div>`
    }
}

(function () {
    window.onpageshow = function(event) {
        if (event.persisted) {
            window.location.reload();
        }
    };
})();

// Force reload page if user click back or forward navigation - next previous - page reload
window.addEventListener('pageshow', function(event) {
    if (event.persisted || (performance.getEntriesByType("navigation")[0]?.type === "back_forward")) {
        location.reload(true);
    }
});