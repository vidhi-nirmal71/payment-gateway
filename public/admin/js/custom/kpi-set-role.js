$(document).ready(function() {
    var existingData = document.getElementById('existingData');
    Sortable.create(existingData, {
        handle: '.kpiRow',  // Use the kpiRow class as the drag handle
        animation: 150,     // Animation speed
        ghostClass: 'sortable-ghost',  // Class to apply to the placeholder
        onEnd: function (/**Event*/evt) {
            addHrForKpiCategory();
        }
    });

    // adding a new KPI row
    let kpiIndex = ($('.kpiRow').length) - 1;
    $('#addKpi').click(function() {
        $('.no-rec-found').hide();
        $('.formBtnDiv').show();
        let newRow = $('#kpiRowTemplate').html().replace(/_index_/g, kpiIndex);
        $('#existingData').append(newRow);
        kpiIndex++;
        hideShowSubmitBtn();
    });

    if($('.kpiRow').length == 1){
        $('.formBtnDiv').hide();
    }else{
        $('.formBtnDiv').show();
    }

    // remove kpi row
    $(document).on('click', '.remove-kpi-row', function(){
        $(this).closest('.kpiRow').remove();

        if($('.kpiRow').length == 1){
            $('.no-rec-found').show();
            $('.formBtnDiv').hide();
        }
        hideShowSubmitBtn();
    });

    function hideShowSubmitBtn(){
        if($('#existingData').find('.kpiRow').length > 0){
            $('.submit-btn').show();
        }else{
            $('.submit-btn').hide();
        }
        
    }

    // save category with description
    $(document).on('click', '#saveCategory', function(){
        $('#categotyForm').validate({
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
                    $(error).insertAfter($(element).parent());      // radio/checkbox
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
        }); 

        if($('#categotyForm').valid()) {
            $('#categotyForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#categotyForm').validate().resetForm();
                    $('#addCategoryModal').modal('hide');
                    $('.kpi-category').append('<option value="'+response.data.id+'">'+response.data.name+'</option>');
                    successMessage(response.message);

                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, "-");
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    }else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    // save kpi data role wise
    $(document).on('click', '#saveKpiData', function(){ 
        $('#kpiRoleWiseStore').validate({
            highlight: function(element, errorClass, validClass) {
                $(element).addClass(errorClass).removeClass(validClass);
                $(element).parent('div').addClass('input-error').removeClass(validClass);
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).removeClass(errorClass).addClass(validClass);
                $(element).parent('div').removeClass('input-error').addClass(validClass);
            },
            errorPlacement: function(error, element) {
                if ($(element).parent('.input-group').length) {
                    $(error).insertAfter($(element).parent()); // for radio/checkbox
                } else {
                    $(error).insertAfter($(element)); // default
                }
            }
        });

        // Function to add validation rules dynamically based on current fields
        function addDynamicValidation() {
            // Remove any existing rules first to avoid conflicts
            $('#kpiRoleWiseStore .kpi-category, #kpiRoleWiseStore .kpi-details').each(function() {
                $(this).rules('remove');
            });

            // Add validation rules for each dynamically generated field
            $('#kpiRoleWiseStore .kpiRow').each(function() {
                const index = $(this).index(); // Get the current row index
                $(this).find('.kpi-category').rules('add', {
                    required: true,
                    messages: {
                        required: "Category is required"
                    }
                });
                $(this).find('.kpi-details').rules('add', {
                    required: true,
                    messages: {
                        required: "KPI Detail are required",
                        minlength: "KPI Detail should be at least 10 characters"
                    }
                });
                $(this).find('.kpi-weightage').rules('add', {
                    required: true,
                    messages: {
                        required: "Weightage is required"
                    }
                });
            });
        }

        addDynamicValidation();

        if ($('#kpiRoleWiseStore').valid()) {

            let defaultWeightageSum = sumOfDefaultWeitage();
            if(defaultWeightageSum !== 100){
                errorMessage('Please make sure default weightage should be equal to 100.');
                return false;
            }

            $('#kpiRoleWiseStore').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    if(response.success){
                        successMessage(response.message);
                    }else{
                        errorMessage(response.message);
                    }
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, "-");
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    }else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    function addHrForKpiCategory() {
        $(document).find('hr').remove();
        $('.kpiRow').each(function(index) {
            let currentRow = $(this);
            let currentCategory = currentRow.find('.kpi-category').val();
            let nextRow = currentRow.next('.kpiRow');

            // Only insert <hr> if this is the last row or the next row has a different category
            if (nextRow.length > 0) {
                let nextCategory = nextRow.find('.kpi-category').val();
                if (currentCategory !== nextCategory) {
                    currentRow.next('hr').remove();
                    $('<hr>').insertAfter(currentRow);
                } else {
                    currentRow.next('hr').remove();
                }
            }
        });
    }
    addHrForKpiCategory();

    $(document).on('change', '.kpi-category', function() {
        addHrForKpiCategory();
    });

    $(document).on('keyup', '.kpi-weightage', function() {
        $('.totalweightage').text(sumOfDefaultWeitage());
    });

    function sumOfDefaultWeitage(){
        let sum = 0;
        $('.kpi-weightage').each(function() {
            let value = parseFloat($(this).val()) || 0;
            sum += value;
        });

        return sum;
    }
    $('.totalweightage').text(sumOfDefaultWeitage());


    $(document).on('click', '#previewKpiData', function() {
        let kpiData = {};

        $('#existingData .kpiRow').each(function() {
            let category = $(this).find('.kpi-category option:selected').text();
            let kpi = $(this).find('.kpi-details').val();
            let weightage = $(this).find('.kpi-weightage').val();

            if (category) {
                if (!kpiData[category]) {
                    kpiData[category] = [];
                }

                kpiData[category].push({ kpi: kpi, weightage: weightage });
            }
        });

        let tableHtml = `
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th style="border: 1px solid black;" class="ps-2">Category</th>
                        <th style="border: 1px solid black;" class="ps-2">KPI</th>
                        <th style="border: 1px solid black;" class="ps-2">Default Weightage</th>
                    </tr>
                </thead>
                <tbody>`;

        let categoryIndex = 1;
        $.each(kpiData, function(category, kpis) {

            kpis.forEach((item, index) => {
                let kpiPoint = `${categoryIndex}.${index + 1}`;
                if (index === 0) {
                    tableHtml += `<tr>
                                    <td style="border: 1px solid black;" rowspan="${kpis.length}" class="ps-2">${category}</td>
                                    <td style="border: 1px solid black;" class="ps-2">${kpiPoint} ${item.kpi}</td>
                                    <td style="border: 1px solid black;" class="ps-2">${item.weightage}</td>
                                </tr>`;
                } else {
                    tableHtml += `<tr>
                                    <td style="border: 1px solid black;" class="ps-2">${kpiPoint} ${item.kpi}</td>
                                    <td style="border: 1px solid black;" class="ps-2">${item.weightage}</td>
                                </tr>`;
                }
            });

            categoryIndex++;
        });

        tableHtml += `</tbody></table>`;

        $('#previewKpiModal').modal('show');
        $('#previewTableContainer').html(tableHtml);
    });
    
});