$(document).ready(function () {
    $(document).on('click', '.hideColumn', function () {
        var designation = $(this).attr('data-role-id') + '-block';
        if($(this).is(":checked")){
            $('.'+designation).hide();
        }else{
            $('.'+designation).show();
        }
    });

    $(document).on('click', '.moduleName', function(){
        var iTag = $(this).find('i');
        var className = $(iTag).attr('class');

        var module = $(this).attr('data-class');
        if(className == 'bx bx-chevron-down'){
            $('.'+module+'-permission').hide();
            $(iTag).removeClass('bx bx-chevron-down');
            $(iTag).addClass('bx bx-chevron-right');
        }else{
            $('.'+module+'-permission').show();
            $(iTag).removeClass('bx bx-chevron-right');
            $(iTag).addClass('bx bx-chevron-down');
        }
    });

    $('#rolesTable .check-all').click(function() {
        var modueId = $(this).attr('data-module-id');
        var roleId = $(this).attr('data-role-id');
        var className = modueId+'-'+roleId;
        $('#rolesTable').find('.'+className).prop('checked', this.checked);
    });

    $('#rolesTable .permission').click(function() {
        var modueId = $(this).attr('data-module-id');
        var roleId = $(this).attr('data-role-id');
        var className = modueId+'-'+roleId;
        $('#rolesTable').find('.'+className+'-parent').prop('checked', $('#rolesTable').find('.'+className+':checked').length == $('#rolesTable').find('.'+className).length)
    });

    $('#rolesTable .check-all').each(function() {
        var modueId = $(this).attr('data-module-id');
        var roleId = $(this).attr('data-role-id');
        var className = modueId+'-'+roleId;

        let lengthAllChild = $('#rolesTable').find('.'+className).length;
        if(lengthAllChild){
            let check = $('#rolesTable').find('.'+className+':checked').length == lengthAllChild;
            $('#rolesTable').find('.'+className+'-parent').prop('checked', check);
        }
    });

    $(document).on('click', '.permission', function() {
        var permissionId = $(this).attr('data-permission-id');
        var roleId = $(this).attr('data-role-id');
        var moduleId = null;
        var isChecked = $(this).prop('checked');
        getRolesTableData(permissionId, roleId, moduleId, isChecked);
    });

    $(document).on('click', '.check-all', function() {
        var permissionId = null;
        var roleId = $(this).attr('data-role-id');
        var moduleId = $(this).attr('data-module-id');
        var isChecked = $(this).prop('checked');
        getRolesTableData(permissionId, roleId, moduleId, isChecked);
    });

    function getRolesTableData(permissionId, roleId, moduleId, isChecked) {
        $('#rolesTable').append(loading());
        $.ajax({
            url: APP_URL+'/manage/role/permission',
            type: 'POST',
            data: { permissionId: permissionId, roleId: roleId, moduleId: moduleId, isChecked: isChecked },
            success: function (response) {
                $('#rolesTable').find('.loading-wrapper').remove();
                successMessage('Permission saved successfully!');
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    $( "#sortable" ).sortable();

    $("#saveRoleOrder").click(function() {
        var sortedIDs = $("#sortable").sortable("toArray", { attribute: "data-id" });
        $.ajax({
            url: '/update-roles-order',
            method: 'POST',
            data: {
                order: sortedIDs,
                _token: $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                $('#sortDesignationModal').modal('hide');
                successMessage('Role order updated successfully!');
                $('#roleCard').append(loading());
                location.reload();
            },
            error: function(xhr) {
                errorMessage('An error occurred while updating the order.');
            }
        });
    });

    $('#role-table td').hover(function() {
        let colIndex = $(this).index() + 1;
        highlightColumn(colIndex);
    }, function() {
        removeHighlight();
    });

    function highlightColumn(index) {
        $('#role-table td:nth-child(' + index + '), #role-table th:nth-child(' + index + ')').addClass('highlight');
    }

    function removeHighlight() {
        $('#role-table td, #role-table th').removeClass('highlight');
    }

});