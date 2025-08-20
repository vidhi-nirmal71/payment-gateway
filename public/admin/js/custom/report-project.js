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
    loadProjectTable();

    $(document).on('change', '#filterMonth', function(){
        $('#aboveHundredHours h6').text('');
        $('#hundredHoursOrBelow h6').text('');
        $('#aboveHundredHours').append(loading());
        $('#hundredHoursOrBelow').append(loading());
        loadProjectTable();
    });

    function loadProjectTable(){
        let monthYear = $('#filterMonth').val();
        $.ajax({
            url: APP_URL+'/report/get-project/'+monthYear,
            type: 'GET',
            data: { monthYear : monthYear },
            success: function (res) {

                // Table 1
                if(res.data.moreThanHundred == 0){
                    $('#aboveHundredHours').html(tableNoData);
                }else{
                    let tc = renderTableHeader();
                    tc += renderTableData(res.data.moreThanHundred);
                    $('#aboveHundredHours').html(tc);
                }

                // Table 2
                if(res.data.lessThanOrHundred == 0){
                    $('#hundredHoursOrBelow').html(tableNoData);
                }else{
                    let tc = renderTableHeader();
                    tc += renderTableData(res.data.lessThanOrHundred);
                    $('#hundredHoursOrBelow').html(tc);
                }

                $('.resources').tooltip();
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    function calculatePercentages(hours, totalHrs){
        
        return hours ? (((hours / totalHrs * 100).toFixed(2))) : 0;
    }

    function convertSecondsToDecimalTime(hours){
        return (hours ? (hours / 3600).toFixed(2) : 0);
    }

    function renderTableHeader(){
        return `<table class="table table-hover table-striped tablecontentcss" id="uTable"><thead class="table-light"><tr>
            <th>#</th>
            <th>Project Name</th>
            <th class="text-end">Resources</th>
            <th class="text-end">Total Hours</th>
            <th class="text-end">Billable Hours</th>
            <th class="text-end">Non-billable Hours</th>
            <th class="text-end">Billable %</th>
            <th class="text-end">Non-billable %</th>
            <th class="text-center">Project Manager</th>
            <th class="text-center">Project Status</th>
        </tr></thead><tbody class="table-border-bottom-0">`;
    }

    function renderTableData(response) {
        let tc = '';
        let num = 1;

        response.forEach(item => {
            item.resourceName = item.resource.map(resourceItem => resourceItem.pta ? `${resourceItem.name} - ${resourceItem.pta}` : resourceItem.name).join(', ');
            item.totalHours = convertSecondsToDecimalTime(item.totalHrs);
            item.billableHrs = convertSecondsToDecimalTime(item.billable_hrs);
            item.nonBillableHrs = convertSecondsToDecimalTime(item.non_billable_hrs);
            item.billablePercentage = calculatePercentages(item.billableHrs, item.totalHours);
            item.nonBillablePercentage = calculatePercentages(item.nonBillableHrs, item.totalHours);
        });
    
        response.sort((a, b) => b.billablePercentage - a.billablePercentage);
    
        $.each(response, function (k, v) {
            tc += '<tr>';
            tc += '<td>' + num + '</td>';
            tc += '<td>' + v.name + '</td>';
            tc += `<td class="text-end resources" data-placement="right" data-container="body" title="${v.resourceName}">${v.resouce_count}</td>`;
            tc += '<td class="text-end">' + decimalToHoursAndMinutes(v.totalHours) + '</td>'; 
            tc += '<td class="text-end">' + decimalToHoursAndMinutes(v.billableHrs) + '</td>';
            tc += '<td class="text-end">' + decimalToHoursAndMinutes(v.nonBillableHrs) + '</td>';
            tc += '<td class="text-end">' + v.billablePercentage + '%</td>';
            tc += '<td class="text-end">' + v.nonBillablePercentage + '%</td>';
            tc += '<td class="text-center">' + v.pm + '</td>';
            tc += '<td class="text-center">' + v.status + '</td>';
            tc += '</tr>';
            num++;
        });
    
        tc += '</tbody>';
        tc += '</table>';
        return tc;
    }

    function decimalToHoursAndMinutes(decimalHours) {
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}`;
    }
});