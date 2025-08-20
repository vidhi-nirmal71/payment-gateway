document.addEventListener('DOMContentLoaded', function() {
    setHeight();
    var currentDate = new Date().toISOString().slice(0, 7);
    if(currentDate){
        document.getElementById('filterMonth').value = currentDate;
        document.getElementById('filterMonth').setAttribute('max', currentDate);
    }else{
        document.getElementById('filterMonth').setAttribute('max', '');
    }
});

function setHeight() {
    var screenHeight = $(window).height();
    var seventyPercentHeight = 0.75 * screenHeight;
    $('.table-responsive').css('max-height', seventyPercentHeight + 'px');
    $('.card').css('min-height', (seventyPercentHeight+120) + 'px');
}

$(document).tooltip({
    content: function() {
        return $(this).attr('data-title');
    }
});

$(document).ready(function() {
    
    loadProjectFactorTable();

    $("#projectFilter").select2({
        placeholder: "Select Project",
        allowClear: true,
        minimumInputLength: 2,
        ajax: {
            dataType: 'json',
            delay: 250,
            url: APP_URL+'/project/search',
            data: function (params) {
                return {
                    term: params.term,
                    project_type: $('#projectTypeFilter').val(),
                };
            },
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
            cache: false,
        }
    });

    $(document).on('change', '#filterMonth, #projectFilter', function(){
        loadProjectFactorTable();
    });

    function loadProjectFactorTable(){
        // $('#factorProjectReport').append(loading());

        let monthYear = $('#filterMonth').val();
        let project = $('#projectFilter').val();
        
        $.ajax({
            url: APP_URL+'/report/fetch/factor',
            type: 'GET',
            data: { monthYear : monthYear, project: project },
            success: function (res) {
                if(res.data.length == 0){
                    $('#factorProjectReport').html(tableNoData);
                }else{
                    let tc = renderTableHeader();
                    tc += renderTableData(res.data);
                    $('#factorProjectReport').html(tc);
                    $('[data-toggle="tooltip"]').tooltip();
                }

            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }


    function renderTableHeader(){
        return `<table class="table table-bordered" id="uTable"><thead class="table-light"><tr>
            <th class="sticky-top" title="Employee Name" data-toggle="tooltip">Employee Name</th>
            <th class="text-center sticky-top" title="Experience Total" data-toggle="tooltip">Exp</th>
            <th class="text-center sticky-top" title="Factor" data-toggle="tooltip">F</th>
            <th class="sticky-top" title="Projects" data-toggle="tooltip">Projects</th>
            <th class="sticky-top" title="Billable Hours" data-toggle="tooltip">B</th>
            <th class="sticky-top" title="Non-billable Hours" data-toggle="tooltip">NB</th>
            <th class="sticky-top" title="Total Hours" data-toggle="tooltip">TH</th>
            <th class="text-center sticky-top" title="Factor Hours" data-toggle="tooltip">FH</th>
            <th class="text-center sticky-top" title="Max Hours" data-toggle="tooltip">MH</th>
            <th class="text-center sticky-top" title="Delta Hours" data-toggle="tooltip">DH <i class='bx bx-up-arrow'></i></th>
            <th class="text-center sticky-top" title="Optimum Hours" data-toggle="tooltip">OPH</th>
            <th class="text-center sticky-top" title="Delta Hours 2" data-toggle="tooltip">DH2 <i class='bx bx-up-arrow'></i></th>

        </tr></thead><tbody class="table-border-bottom-0">`;
    }

    function renderTableData(res) {
        let tc = '';
        $.each(res, function (k, v) {
            let totalProjectLen = Object.keys(v.projects).length;
            let totalProjects = totalProjectLen > 1 ? totalProjectLen + 1 : totalProjectLen; // +1 for the total row
            let currentClass = '';

            if(v.delta_seconds < 0){
                currentClass = 'text-danger';
                deltaHours = '-' + convertSecondsToHHMM(Math.abs(v.delta_seconds));
            }else if(v.delta_seconds > 0){
                currentClass = 'text-success';
                deltaHours = convertSecondsToHHMM(v.delta_seconds);
            }else{
                deltaHours = '-' + convertSecondsToHHMM(Math.abs(v.delta_seconds));
            }

            $.each(v.projects, function (id, val) {
                tc += '<tr class="'+ (id === Object.keys(v.projects)[0] ? 'firstRaw' : '')+'">';

                if (id === Object.keys(v.projects)[0]) {
                    tc += `<td rowspan="${totalProjects}" class="${currentClass}">${v.user_name}</td>`;
                    tc += `<td class="text-center" rowspan="${totalProjects}">${v.exp}</td>`;
                    tc += `<td class="text-center" rowspan="${totalProjects}">${v.factor}</td>`;
                }

                let billableHrs = (+val.billable_hrs);
                let nonBillableHrs = (+val.non_billable_hrs);
                tc += `<td>${val.project_name}</td>`;
                tc += `<td>${convertSecondsToHHMM(billableHrs)}</td>`;
                tc += `<td>${convertSecondsToHHMM(nonBillableHrs)}</td>`;
                tc += `<td>${convertSecondsToHHMM(billableHrs + nonBillableHrs)}</td>`;

                if (id === Object.keys(v.projects)[0]) {
                    tc += `<td rowspan="${totalProjects}" class="text-center">${convertSecondsToHHMM(v.factor_hrs_seconds)}</td>`;
                    tc += `<td rowspan="${totalProjects}" class="text-center">${decimalToTime(v.max_hrs)}</td>`;
                    tc += `<td rowspan="${totalProjects}" class="text-center ${currentClass}">${deltaHours}</td>`;
                    tc += `<td rowspan="${totalProjects}" class="text-center ${currentClass}">${convertSecondsToHHMM(v.optimum_seconds)}</td>`;
                    tc += `<td rowspan="${totalProjects}" class="text-center ${currentClass}">${convertSecondsToHHMM(v.delta_seconds_2)}</td>`;
                }

                tc += '</tr>';
            });

            if(totalProjects > 1){
                tc += '<tr>';
                tc += `<td class="totalBg">Total Hours</td>`;
                tc += `<td class="totalBg">${convertSecondsToHHMM(v.billable_total)}</td>`;
                tc += `<td class="totalBg">${convertSecondsToHHMM(v.nonBillable_total)}</td>`;
                tc += `<td class="totalBg">${convertSecondsToHHMM(v.billable_total + v.nonBillable_total)}</td>`;
                tc += '</tr>';
            }
        });

        tc += '</tbody>';
        tc += '</table>';
        return tc;
    }

    function convertSecondsToHHMM(seconds) {
        if(seconds <= 0){
            return '00:00';
        }
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
    
        return `${hours}:${minutes}`;
    }

    function convertSecondsToDecimalHours(seconds){
        if(seconds){
            var hours = seconds / 3600;
            return hours.toFixed(2);
        }

        return 0;
    }

    function decimalToTime(decimalHours) {

        var hours = Math.floor(decimalHours);
        var minutes = (decimalHours % 1) * 60;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }

        return `${hours.toString().padStart(2, '0')}:${Math.floor(minutes).toString().padStart(2, '0')}`;
    }

});