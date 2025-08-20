$(document).ready(function() {
    $('.main-header .accordion-button').on('click', function() {
        var currentSeletcor = $(this).attr('data-bs-target');
        var checkClassExist = $(currentSeletcor).closest('.accordion-item');

        if($(checkClassExist).find('.accordion-item').length > 0){
            $(checkClassExist).find('.main-content').toggleClass('d-none')

            setTimeout(function(){
                $(checkClassExist).find(currentSeletcor).removeClass('collapse');
            }, 50);

            $(checkClassExist).find(currentSeletcor).removeClass('collapse');
            if(! $(checkClassExist).find('.accordion-item').find('.accordion-button').hasClass('collapsed')){
                $(checkClassExist).find('.accordion-item').find('.accordion-button').click()
            }
        }
    });

    $(document).on('click', '.emp_name', function(){
        let empId = $(this).attr('data-id');
        if(empId){
            $.ajax({
                url: APP_URL+'/employee/details',
                type: 'GET',
                data: { empId: empId },
                success: function (res) {
                    $('#userInfoModel').find('#empName').html(res.name);
                    $('#userInfoModel').find('#empRole').html(res.role);
                    $('#userInfoModel').find('#empTech').html(res.technology);
                    $('#userInfoModel').find('#empExp').text(res.experience);

                    const ptaRaw = res.pta ?? '';
                    const ptaNames = ptaRaw.split(',').map(entry => entry.split('=>')[1]?.trim()).filter(Boolean).join(', ');

                    $('#userInfoModel').modal('show');
                    $('#userInfoModel').find('#empPta').html(ptaNames);
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        }
    });

});