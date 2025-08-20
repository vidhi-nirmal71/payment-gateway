$(document).ready(function() {
    calculateTotalWeightage();
    calculateTotalWeightageForCore();

    function calculateTotalWeightage() {
        var total = 0;
        $('.user_weightage').each(function() {
            var weightage = parseFloat($(this).val()) || 0;
            total += weightage;
        });
        if (total % 1 === 0) {
            $('.totalweightage').text(total.toFixed(0)); // No decimal places
        } else {
            $('.totalweightage').text(total.toFixed(1)); // One decimal place
        }
    }

    $('.user_weightage').on('input', function() {
        var defaultValue = parseFloat($(this).data('def'));
        var enteredValue = parseFloat($(this).val());
    
        // Validation for entered value
        if (isNaN(enteredValue) || enteredValue < 0) {
            $(this).val(0);
            errorMessage('Please enter a valid weightage of at least 0 for all KPIs.');
        } else if (enteredValue > defaultValue) {
            errorMessage('Entered value exceeds the allowed weightage. Resetting to default.');
            $(this).val(defaultValue);
        }
    
        calculateTotalWeightage();
    });

    // Core KPI
    $('.core_self_weightage').on('input', function() {
        var defaultValue = parseFloat($(this).data('def'));
        var enteredValue = parseFloat($(this).val());
    
        // Validation for entered value
        if (isNaN(enteredValue) || enteredValue < 0) {
            $(this).val(0);
            errorMessage('Please enter a valid weightage of at least 0 for all KPIs.');
        } else if (enteredValue > defaultValue) {
            errorMessage('Entered value exceeds the allowed weightage. Resetting to default.');
            $(this).val(defaultValue);
        }
    
        calculateTotalWeightageForCore();
    });

    function calculateTotalWeightageForCore() {
        var total = 0;
        $('.core_self_weightage').each(function() {
            var weightage = parseFloat($(this).val()) || 0;
            total += weightage;
        });
        if (total % 1 === 0) {
            $('.coreTotalWeightage').text(total.toFixed(0)); // No decimal places
        } else {
            $('.coreTotalWeightage').text(total.toFixed(1)); // One decimal place
        }
    }

    $('.user_weightage, .core_self_weightage').on('keypress', function(e) {
        // Allow digits, decimal point, and control keys (like backspace)
        if ((e.which < 48 || e.which > 57) && e.which !== 46 && e.which !== 8) {
            e.preventDefault();
        }
    
        // Allow only one decimal point
        if (e.which === 46 && $(this).val().indexOf('.') !== -1) {
            e.preventDefault();
        }
    });

    $('#saveFilledKpi').on('click', function(e) {
        e.preventDefault();
        if(validateKpis()){
            alert('Alert!', 'After submitting your KPI, you will not be able to change it again. Are you sure you want to submit it?', 'text-danger')
            .then(function(result) {
                if(result){
                    $('#draftKpi').val(false);
                    submitKpiForm();
                }
            });
        }
    });

    $('#saveReviewKpi').on('click', function(e){
        e.preventDefault();
        if(validateKpis()){
            alert('Alert!', 'After submitting this KPI, you will not be able to change it again. Are you sure you want to submit it?', 'text-danger')
            .then(function(result) {
                if(result){
                    $('#saveReviewKpi').attr('disabled', true).addClass('sending');
                    submitKpiForm();
                }
            });
        }
    });

    $('#draftFilledKpi').on('click', function(e){
        var checkOneValue = checkInpurtDraftValidation();
        if(checkOneValue){
            $('#draftKpi').val(true);
            submitKpiForm();
        }else{
            errorMessage('At least one value is required to save as draft.');
        }
    });

    $('#draftPtaFilledKpi').on('click', function(e){
        var checkOneValue = checkInpurtDraftValidation();
        if(checkOneValue){
            $('#ptaDraftKpi').val(true);
            submitKpiForm();
        }else{
            errorMessage('At least one value is required to save as draft.');
        }
    });

    function checkInpurtDraftValidation(){
        let checkOneValue = false
        $('.user_weightage').each(function() {
            let currentVal = parseFloat($(this).val());
            if (currentVal >= 0){
                checkOneValue = true;
            }
        });
        $('.user_comment').each(function() {
            let currentVal = $(this).val();
            if (currentVal){
                checkOneValue = true;
            }
        });
        $('.core_self_weightage').each(function() {
            let currentVal = parseFloat($(this).val());
            if (currentVal >= 0){
                checkOneValue = true;
            }
        });
        $('.core_self_comment').each(function() {
            let currentVal = $(this).val();
            if (currentVal){
                checkOneValue = true;
            }
        });
        return checkOneValue;
    }

    function submitKpiForm(){
        $('#kpiSelfFillStore').ajaxSubmit({
            beforeSubmit: function() {
                $('.error-message').text('');
            },
            success: function(response) {
                if(response.success){
                    successMessage(response.message);
                    document.location.href = '/kpi/list';
                }else{
                    errorMessage(response.message);
                }
            },
            error: function(xhr) {
                console.log(xhr);
            }
        });
    }


    function validateKpis(){
        var totalWeightage = 0;
        var hasNonZeroValue = false;
    
        $('.user_weightage').each(function() {
            let currentVal = parseFloat($(this).val());
            if (isNaN(currentVal) || currentVal < 0) {
                hasNonZeroValue = true; // Handle empty or invalid inputs
            } else {
                totalWeightage += currentVal;
            }
        });
    
        // Validation for total weightage
        if (totalWeightage > 100) {
            errorMessage('The total weightage cannot exceed 100. Please adjust your inputs.');
        } else if (totalWeightage === 0) {
            errorMessage('The total weightage must be greater than 0. Please enter at least one value.');
        } else if (hasNonZeroValue) {
            errorMessage('Enter values in all inputs except where there is no value. You can add 0 where there is no value.');
        } else {
            return true;
        }

        // core kpi submit validation
        if($('#coreKpiExist').length > 0){
            var totalWeightage = 0;
            var hasNonZeroValue = false;
        
            $('.core_self_weightage').each(function() {
                let currentVal = parseFloat($(this).val());
                if (isNaN(currentVal) || currentVal < 0) {
                    hasNonZeroValue = true; // Handle empty or invalid inputs
                } else {
                    totalWeightage += currentVal;
                }
            });
        
            // Validation for total weightage
            if (totalWeightage > 80) {
                errorMessage('The total weightage of core KPI cannot exceed 80. Please adjust your inputs.');
            } else if (totalWeightage === 0) {
                errorMessage('The total weightage of core KPI must be greater than 0. Please enter at least one value.');
            } else if (hasNonZeroValue) {
                errorMessage('Enter values in all inputs except where there is no value. You can add 0 where there is no value.');
            } else {
                return true;
            }
            return false;
        }

        return false;
    }

    
});