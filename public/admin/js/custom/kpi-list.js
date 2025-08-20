document.addEventListener('DOMContentLoaded', function() {
    var currentDate = new Date().toISOString().slice(0, 7);
    if(currentDate){
        document.getElementById('filterMonth').value = currentDate;
        document.getElementById('filterMonth').setAttribute('max', currentDate);
    }else{
        document.getElementById('filterMonth').setAttribute('max', '');
    }
});

$(document).ready(function() {
    var tableFilterData = {};
    var requestPage = 1;
    var resetFilterState = 0;

    $(document).on('change', '#kpiUserFilter, #kpiStatus, #quarterFilter, #filterMonth', function () {
        $('.reset-filters').show();
        getKpiDetailsTableData();
    });

    // request kpi to employee
    $('#requestKpi').on('click', function(){
        $('.error-kpi-exist').text('');
        $('#empName').select2({
            dropdownParent: $("#requestKpiModal .modal-body"),
            placeholder: "Select Employee",
            allowClear: true,
            minimumInputLength: 3,
            ajax: {
                dataType: 'json',
                delay: 250,
                url: APP_URL+'/kpi/search/users',
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

        $('#requestKpiModal').modal('show');
    });

    $(document).on('click', '#saveCategory', function(){
        $("#requestKpiForm").validate({
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
    
        if($("#requestKpiForm").valid()) {
            $("#requestKpiForm").ajaxSubmit({
                beforeSubmit: function () {
                    $(".error-message").text("");
                },
                success: function (response) {
                    if(response.status){
                        $('#requestKpiForm').validate().resetForm();
                        $("#requestKpiModal").modal("hide");
                        successMessage(response.message);
                        getKpiDetailsTableData();
                    }else{
                        $('.error-kpi-exist').show().text(response.message);
                    }
                    
                },
                error: function (xhr) {
                    console.log('xhr: ', xhr);
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, "-");
                            $("#" + fieldId + "-error").text(error[0]);
                        });
                    }else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click', '#resetKpiFilters', function () {
        resetFilterState = 1;
		$('#kpiStatus').val('');
		$('#quarterFilter').val('');
        $('#kpiUserFilter').val(null).trigger('change');

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const currentMonth = `${year}-${month}`;
        $('#filterMonth').val(currentMonth);

        resetFilterState = 0;
		getKpiDetailsTableData();
        $('.reset-filters').hide();
  	});

    getKpiDetailsTableData();

    function getKpiDetailsTableData() {
        if(resetFilterState == 0){
            tableFilterData['filter'] = $('#kpiUserFilter').val() ?? null;
            tableFilterData['status'] = $('#kpiStatus').val() ?? null;
            tableFilterData['quarter'] = $('#quarterFilter').val() ?? null;
            tableFilterData['month'] = $('#filterMonth').val() ?? null;
            $.ajax({
                url: APP_URL+'/kpi/fetch/fill/data',
                type: 'GET',
                data: { tableFilterData : tableFilterData, page: requestPage  },
                success: function (res) {
                    if(res.data.data.length == 0){
                        $('#kpiDetailsTable').html(tableNoData);
                    }else{
                        let tc = `<table class="table table-hover table-striped tablecontentcss" id="uTable"><thead class="table-light"><tr>
                                <th width="3%">#</th>        
                                <th width="10%">Employee Name</th>
                                <th width="12%">Moth & Year</th>
                                <th width="5%">Quarter</th>
                                <th width="12%">Meeting</th>
                                <th width="67%">Designation</th>
                                <th width="12%">Status</th>
                                <th width="8%" class="text-center">Action</th>
                            </tr></thead><tbody class="table-border-bottom-0">`;

                        let num = res.data.st;
                        let canDelete = res.data.permission.delete ? 'end' : 'center';
                        $.each(res.data.data, function (k, v) {
                            tc += '<tr>';
                            tc += '<td>'+num+'</td>';
                            tc += '<td class="td-employee">'+ v.name +'</td>';
                            tc += '<td class="td-monthYear">'+ (v.monthYear.split('-').slice(0, 2).join('-')) +'</td>';
                            tc += '<td class="td-role text-center">'+ v.quarter +'</td>';
                            tc += '<td class="td-role">'+ v.meeting +'</td>';
                            tc += '<td class="td-role">'+ v.role +'</td>';
                            tc += '<td class="td-status">'+ v.status +'</td>';
                            tc += `<td class="td-action text-${canDelete}" data-kpi-id=${v.id}>`;

                            if([2, 3, 4, 6].includes(v.status_key)){
                                tc += `<label title="View KPI" class="text-primary cursor-pointer viewKpi"> <i class="bx bx-show me-1"></i> </label>`;
                            }

                            if((v.status_key == 1 || v.status_key == 5) && v.is_self == true){
                                tc += `<label title="Fill your KPIs" class="text-info cursor-pointer selfFillKpi"> <i class='bx bx-checkbox'></i> </label> `;
                            }else if((v.status_key == 2 || v.status_key == 6) && v.is_self == false){
                                tc += `<label title="Submit KPIs for your team member" class="text-info cursor-pointer ptaFillKpi"> <i class='bx bx-chart'></i> </label> `;
                            }else if(v.status_key == 3 && v.is_self == false){
                                tc += `<label title="KPI in review" class="text-info cursor-pointer bothFilled"> <i class='bx bxs-chart' ></i> </label> `;
                            } else if(v.status_key == 4){
                                tc += `<label title="KPI Completed" class="text-info"> <i class='bx bx-lock-alt'></i> </label> `;
                                if(res.data.permission.pdfDownload){
                                    tc += `<label title="Download KPI PDF" class="text-success cursor-pointer ps-1 pe-1 downloadGeneratedPDF"> <i class='bx bx-download cursor'></i> </label>`;
                                }
                            }
                            if(res.data.permission.delete){
                                tc += `<label title="Delete KPI" class="text-danger cursor-pointer deleteKpi"> <i class="bx bx-trash me-1"></i> </label>`;
                            }

                            tc += '</td>';
                            tc += '</tr>';
                            num++;
                        });
                        tc += '</tbody>';
                        if(res.data.morePage){
                            tc += makePagination(res.data.button);
                        }
                        tc += '</table>';
                        $('#kpiDetailsTable').html(tc);
                        var prevLink = $('#uTable a.prev');
                        var nextLink = $('#uTable a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        }
    }

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        getKpiDetailsTableData();
    });

    $(document).on('click', '.selfFillKpi', function(){
        let dataId = $(this).closest('td').attr('data-kpi-id');
        let URL = APP_URL+'/kpi/self/fill/'+dataId;
        window.location.href = URL;
    });

    $(document).on('click', '.downloadGeneratedPDF', function(){
        let dataId = $(this).closest('td').attr('data-kpi-id');
        if (dataId) {
            let URL = APP_URL+'/kpi/download-pdf/'+dataId;
            window.open(URL, '_blank');
        }else{
            errorMessage('Something went wrong!');
        }
    });

    $(document).on('click', '.ptaFillKpi', function(){
        let kpiFilledId = $(this).closest('td').attr('data-kpi-id');
        let URL = APP_URL+'/kpi/review/'+kpiFilledId;
        window.location.href = URL;
    });

    $(document).on('click', '.bothFilled', function(){
        let kpiFilledId = $(this).closest('td').attr('data-kpi-id');
        let URL = APP_URL+'/kpi/review/'+kpiFilledId;
        window.location.href = URL;
    });

    $(document).on('click','.deleteKpi', function(){
        var kpiFilledId = $(this).closest('td').attr('data-kpi-id');
        alert('Alert!','Are you sure you want to delete this KPI?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url:  APP_URL+'/kpi/delete/'+ kpiFilledId,
                    type: 'DELETE',
                    success: function(response) {
                        if(response.status){
                            requestPage = 1;
                            getKpiDetailsTableData();
                            successMessage(response.message);
                        }else{
                            errorMessage(response.message);
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    $(document).on('click', '.viewKpi', function(){
        var kpiFilledId = $(this).closest('td').attr('data-kpi-id');
        $.ajax({
            url:  APP_URL+'/kpi/view/'+ kpiFilledId,
            type: 'get',
            success: function(response) {
                if(response.success){

                    tableContent = '';
                    tableContent += '<div>';
                    tableContent += '<b>Name:</b> '+response.data.userName+' &nbsp;&nbsp;&nbsp; <b>Month-Year:</b> '+response.data.fieldForMonth+' &nbsp;&nbsp;&nbsp; <b>Role:</b> '+response.data.role;
                    tableContent += '</div>';

                    tableContent += '<table class="table table-bordered table-responsive mt-2">';
                    tableContent += '<thead> <tr>';
                    tableContent += '<th width="260px">Category Name</th>';
                    tableContent += '<th>KPI Details</th>';
                    tableContent += '<th width="60px">Default Wt.</th>';
                    tableContent += '<th width="60px">Self Wt.</th>';
                    tableContent += '<th>Self Comment</th>';

                    if(response.data.showPtaData){
                        tableContent += '<th>PTA/AVP Wt.</th>';
                        tableContent += '<th>PTA/AVP Comment</th>';
                    }
                    tableContent += '</tr> </thead>';

                    tableContent += '<tbody>';
                    tableContent += response.data.tableRow
                    tableContent += '</tbody>';
                    tableContent += '</table>';


                    if(response.data.coreKpiExist){
                        tableContent += '<h3 class="mt-5 text-center">Core Team Member KPI</h3>';
                        tableContent += '<table class="table table-bordered table-responsive mt-1">';
                        tableContent += '<thead> <tr>';
                        tableContent += '<th width="260px">Category Name</th>';
                        tableContent += '<th width="80px">Default Wt.</th>';
                        tableContent += '<th width="60px">Self Wt.</th>';
                        tableContent += '<th>Self Comment</th>';

                        if(response.data.showPtaData){
                            tableContent += '<th width="80px">PTA/AVP Wt.</th>';
                            tableContent += '<th>PTA/AVP Comment</th>';
                        }
                        tableContent += '</tr> </thead>';

                        tableContent += '<tbody>';
                        tableContent += response.data.coreTableRow
                        tableContent += '</tbody>';
                        tableContent += '</table>';
                    }

                    // show modal with kpi details
                    $('#previewKpiModal').modal('show');
                    $('#previewTableContainer').html(tableContent);

                }else{
                    errorMessage(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    });

    $(document).on('change', '#empName, #kpiMonth', function(){
        $('.error-kpi-exist').hide();
    });

});