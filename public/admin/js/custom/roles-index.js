$(document).ready(function () {
    var page = 1;

    $(document).on('click', '.btnClick', function () {
        page = $(this).attr('data-url').split('=').pop();
        getRolesTableData();
    });

    function getRolesTableData() {
        $('#rolesTable').append(loading());
        $.ajax({
            url: APP_URL+'/roles',
            type: 'GET',
            data: { page: page },
            success: function (response) {
                $('#rolesTable').find('.loading-wrapper').remove();
                $('#rolesTable').html(response.data);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }
});