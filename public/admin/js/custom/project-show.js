$(document).ready(function () {

    //below functionality for comment link open comment tab
    var urlParams = new URLSearchParams(window.location.search);
    var tParam = urlParams.get('t');
    var idParam = urlParams.get('id');
    var pageParam = urlParams.get('page');
    var clientTimesheetParam = urlParams.get('ref');
    /* below functionality is for validations and submit the CR form and cr current date for add cr */
    var currentDate = new Date().toISOString().split('T')[0];
    //id for the new extra row(add more button rows id)
    var id = 1;
    //find the active page
    var activePage;
    var filterText = '';
    var timesheetType = null;
    var dateFilter = {};
    var naDateFilter = {};
    var nafilterText = '';
    var ctFilterText = '';
    var ctDateFilter = {};
    //Filter on Notice & Appreciation tab
    var tableFilterData = {
        'userName': '',
        'type' : '',
        'projects' : '',
    };
    var filterFormText = '';
    var dateFormFilter = {};

    //ajax call for all the tabs
    var requestPage = 1;
    const projectId = $('.project').data('item-project-id');
    const projectType = $('.project').data('item-project-type');
    const projectName = $('.projName').text();

    if(dashboardTabViewPermission == true){
        dashboard();

        // Utilization percentage half circle progress bar js
        $(".progresspercentage").each(function(){
            var $bar = $(this).find('.barpercentage');
            var $val = $(this).find('span.percentageNumber');
            var perc = parseInt( $val.text(), 10);
            $({p:0}).animate({p:perc}, {
            duration: 2000,
            easing: "swing",
            step: function(p) {
                    $bar.css({
                    transform: "rotate("+ (45+(p*1.8)) +"deg)",
                    });
                    $val.text(p|0);
                }
            });
        });

        // save widget settings
        if(widgetSetting){
            $(document).on('click', '#savewidgetSettings', function(){
                disableSubmitBtn('#savewidgetSettings');
                $('#widgetSetting').ajaxSubmit({
                    beforeSubmit: function () {
                        $('.error-message').text('');
                    },
                    success: function (response) {
                        if(response.color == 'red'){
                            errorMessage(response.message);
                        }else{
                            location.reload();
                            successMessage(response.message);
                        }
                        enableSubmitBtn('#savewidgetSettings');
                    },
                    error: function (xhr) {
                        enableSubmitBtn('#savewidgetSettings');
                    },
                });
            });
        }

        $(document).on('click', '#showAllWidget', function(){
            $('.widgetHide').removeClass('widgetHide').addClass('widgetShow');
            $('#showAllWidget').hide();
        });

        toggleWidgetVisibility();
        $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
            toggleWidgetVisibility();
        });

        $(document).on('change', '#timeSheetDataMonth', function(){
            var monthYear = $('#timeSheetDataMonth').val();
            if(monthYear){
                monthlyHoursTable(monthYear);
            }
        });

        $('input[type=radio][name=timesheetHoursData]').change(function() {
            if ($(this).val() == 'month') {
                $('#timeSheetDataMonth').show();
                var monthYear = $('#timeSheetDataMonth').val();
                monthlyHoursTable(monthYear);
            } else if($(this).val() == 'all') {
                monthlyHoursTable();
                $('#timeSheetDataMonth').hide();
            }
        });
    }

    // setTimeout(() => {
    //     crData();
    //     hours();
    // }, 500);

    // setTimeout(() => {
    //     documentData();
    //     escalationChannel();
    // }, 900);

    // setTimeout(() => {
    //     reminderData();
    //     task();
    // }, 1300);
    if(timesheetTabViewPermission == true){
        setTimeout(() => {
            getTimesheetTableData();
        }, 500);
    }
    if(naTabViewPermission == true){
        setTimeout(() => {
            // getNoticeTableData();
        }, 500);
        // setTimeout(function() { getNoticeModelFormData(); }, 750);
    }

    //comment link open the "tparam" comment tab 
    //comment link open particular comment functionality in the comment function
    if(commentTabViewPermission == true){
        if (tParam === 'cmt') {
            activeTab('#commenttab');
            // Activate the desired tab
            (commentCount > 0) && commentTabData();
            $('#navs-comments').addClass('active show');
        }else{
            commentTabData();
        }
    }

    function activeTab(tabId){
        // Deactivate all tabs
        $('.nav-link').removeClass('active');
        $('.tab-pane').removeClass('active show');
        $(tabId).addClass('active');
    }

    if(clientTimesheetParam){
        activeTab('#clientTimesheetTab');
        $('#tab-project-client-timesheet').addClass('active show');
        setTimeout(function() {
            $('.clientTimesheetFromButton').click();
        }, 500);
    }

    if(reminderTabViewPermission == true){
        if (tParam === 'reminder'){
            // Deactivate all tabs
            activeTab('#remindertab');
            reminderData();
            $('#tab-project-reminders').addClass('active show');
        }
        $('.reminderTimePicker').timepicker({showPeriodLabels: false,});
        $('.editreminderTimePicker').timepicker({showPeriodLabels: false,});
    }

    $('.tab-button').on('click', function() {
        const tabName = $(this).data('tab');
        switch (tabName) {
            case 'dashboard':
                if($('#hoursTable').children().length == 0  && $('#dashboardTable').children().length == 0 && $('#dashboardReminderTable').children().length == 0){
                dashboard();
                }
                break;
            case 'project-details':
                break;
            case 'cr':
                if( $('#cr-list-body').children().length == 0 ){
                    (crCount > 0) && crData();
                }
                break;
            case 'hours':
                if( $('#cr-hours-body').children().length == 0 ){
                    (hoursCount > 0) && hours();
                }
                break;
            case 'comment':
                if( $('#commentBtnData').children().length == 0 ){ 
                    (commentCount > 0) && commentTabData();
                }
                break;
            case 'documents':
                if( $('#document-list-body').length == 0 ){ 
                    (documentCount > 0) && documentData();
                }
                break;
            case 'ps':
                break;
            case 'escalation-channel':
                if( $('#channel-list-body').length == 0 ){
                    (escalationCount) && escalationChannel();
                }
                break;
            case 'reminder':
                if( $('#reminderTable').children().length == 0 ){
                    (reminderCount > 0) && reminderData();
                }
                break;
            case 'task':
                if($('#task-table-body').length == 0){
                    (taskCount > 0) && task();
                }
                break;
            case 'timesheet':
                if($('#pending-timesheet-table-body').length == 0){
                    (timesheetCount > 0) && getTimesheetTableData();
                }
                break;  
            case 'notices':
                if($('#notice-table-body').length == 0){
                    (noticeCount > 0) && getNoticeTableData();
                }
                break;
            case 'history':
                if($('#history').length == 0){
                    history();
                }
                break;
            case 'clienttimesheet':
                if($('#client-timesheet-table-body').length == 0){
                    fetchEmployeesForProject();
                    fetchClientTimesheetTaskForProject();
                    filterLabelChange();
                    getClientTimesheetTableData();
                }
                break;
        }
    });

    //on change validation remove
    setupSelect2Validation();

    // Pagination Functions
    var requestedTable = '';
    $(document).on('click', '.btnClick', function () {
        var activeLiClass = $('#projectTab .nav-item .nav-link.active').attr('id');
        requestPage = $(this).attr('data-page');
        requestedTable = $(this).parents('table').attr('id');
        if(activeLiClass == 'dashboardtab'){
            dashboard();
        }else if(activeLiClass == 'crtab'){
            crData();
        }else if(activeLiClass == 'hourstab'){
            hours();
        }else if(activeLiClass == 'commenttab'){
            commentTabData();
        }else if(activeLiClass == 'doctab'){
            documentData();
        }else if(activeLiClass == 'escalationtab'){
            escalationChannel();
        }else if(activeLiClass == 'remindertab'){
            reminderData();
        }else if(activeLiClass == 'timesheettab'){
            let activeTabName = $(this).closest('table').attr('id');
            getTimesheetTableData(activeTabName);
        }else if(activeLiClass == 'tasktab'){
            task();
        }else if(activeLiClass == 'noticesAppreciationTab'){
            getNoticeTableData();
        }else if(activeLiClass == 'historyTab'){
            history();
        }else if(activeLiClass == 'clientTimesheetTab' && requestedTable == 'clientTimesheetTable'){
            getClientTimesheetTableData();
        }else if(activeLiClass == 'clientTimesheetTab' && requestedTable == 'filterTSTable'){
            getFilterTimesheetTableData();
        }else if(activeLiClass == 'clientTimesheetTab' && requestedTable == 'filledClientTimesheetTable'){
            getFilledClientTimesheetTableData();
        }
    });

    function toggleWidgetVisibility() {
        if ($('#dashboardtab').hasClass('active') && $('.widgetHide').length > 0) {

            $('#showAllWidget').show();
        } else {
            $('#showAllWidget').hide();
        }
    }

    // Slack configeration
    $('#slackToggle').on('change', function () {
        const isChecked = $(this).is(':checked') ? 1 : 0;
        const projectId = $(this).data('project-id');

        if(isChecked == 0){
            if($('#slackAuthButton').length > 0){
                $('#slackAuthButton').hide();
            }
            if($('#slackDetails').length > 0){
                $('#slackDetails').hide();
            }

            $.ajax({
                url: APP_URL + "/slack/toggle",
                method: "POST",
                data: {
                    project_id: projectId,
                    enabled: 0
                },
                success: function (response) {
                    successMessage(response.message);
                },
                error: function () {
                    errorMessage("Failed to disable Slack integration.");
                }
            });
        }else{
            $('#slackAuthButton').show();
        }
    });

    if(historyTabViewPermission == true){
        //Ajax call for history tab
        function history(){
            $.ajax({
                url: APP_URL+'/' + projectId + '/history',
                type: "GET",
                data: { projectId: projectId, page: requestPage },
                success: function (res) {
                    if(res.data.data.length == 0){
                        $('#historyDetails').html(tableNoData);
                        $('#downloadBtn').hide();
                    }else{
                        $('#downloadBtn').show();
                        list = '';
                        $.each(res.data.data, function (key,value) {
                            list += '<ul>'
                            list += '<li>'+ '<a class="" title="click to view details">'+ value.userName + '</a>' + '<a class="historyActionDetails text-primary cursor-pointer" title="click to view details" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-model='+value.action_model+' data-id='+value.action_id+'> '+ value.action + '</a>' + ' and'+ (value.updated != null ? (' ' + value.updated) : ' ')+' in the '+ value.project +' project at '+ value.createdAt +'</li>';
                            list += '</ul>'
                        });
                        $('#historyDetails').html(list);
                        if (res.data.morePage) {
                            var pagination = '<ul class="pagination"  style="padding-bottom: 22px; padding-left: 15px;">';
                                $.each(res.data.button, function (k, v) {
                                    pagination += '<li class="'+v.class+' page-item '+v.type+'"> <a class="page-link btnClick '+v.type+'" data-page="'+v.page+'" href="javascript:void(0);">'+v.page+'</a> </li>';
                                });
                            pagination += '</ul>';
                            $('#historyDetails').append(pagination);
                        }
                        var prevLink = $('#historyDetails a.prev');
                        var nextLink = $('#historyDetails a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');

                        requestPage = 1;
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        }

        $(document).on('click','.historyActionDetails' , function(){
            var model = $(this).data('model');
            var id = $(this).data('id');
            var title = $(this).text();
            $(document).find('.offcanvas #showDataBody').html('<h5>Loading...</h5>');
            $('.offcanvas').removeClass('offcanvas-size-md');
            $('.offcanvas').addClass('offcanvas-size-xl');
            $.ajax({
                url: '/activity/information',
                type: 'GET',
                data: { encrypted_id: id , model: model},
                success: function (response) {
                    $('.showDataTitle, #showDataBody').empty();
                    $('.showDataTitle').text(title +' Details');
                    var  tableHtml = '';
                    $.each(response.data, function (key, value) {
                        tableHtml += `<tr> <th>${key}</th> <td>${value}</td> </tr>`;
                    });
                    $('#showDataBody').append(tableHtml);
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        });
    }

    //Ajax call for Dashboard tab
    var myChart, myHoursChart, mytypeChart;
    function createMonthlyHoursChart(res) {
        if (myChart) {
            myChart.destroy();
        }
        if(res.data.userTimesheetHours.data && res.data.userTimesheetHours.data.ProjectHours && res.data.userTimesheetHours.data.ProjectHours.length > 0) {
            var ctx = document.getElementById('monthlyHoursChart').getContext('2d');
            var labels = res.data.userTimesheetHours.data.ProjectHours.map(item => item.month);
            var data = res.data.userTimesheetHours.data.ProjectHours.map(item => {
                var timeParts = item.userhour;
                return timeParts;
            });

                var chartData = {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Monthwise Hours',
                            data: data,
                            backgroundColor: '#FF9F40',
                            borderColor: '#FF9F40',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 2,
                                }
                            }
                        }
                    }
                };
                if (myChart) {
                    myChart.destroy();
                }
                myChart = new Chart(ctx, chartData);
        }else{
            $('.monthWiseHoursChart').hide();
        }
    }

    function createBillableHoursChart(res) {
        if (myHoursChart) {
            myHoursChart.destroy();
        }
        if((res.data.billableHoursSum.billableWithOutFormat !== null || res.data.billableHoursSum.nonBillableWithOutFormat !== null) && res.data.billableHoursSum.billableWithOutFormat != 0 && res.data.billableHoursSum.nonBillableWithOutFormat != 0) {
            var ctx = document.getElementById('hoursChart').getContext('2d');
            var data = res.data.billableHoursSum;
            var dataArray = [data.nonBillableWithOutFormat, data.billableWithOutFormat];

                var charthoursData = {
                    type: 'pie',
                    data: {
                        labels: ['Non Billable','Billable'],
                        datasets: [{
                            label: 'Total Hours',
                            data: dataArray,
                            backgroundColor: ['#FF6384','#4BC0C0'],
                            borderWidth: 1,
                            hoverOffset: 4,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                            },
                            datalabels: {
                                color: '#FF3333',
                                formatter: function (value) {
                                    return value;
                                }
                            }
                        }
                    },
                };
                if (myHoursChart) {
                    myHoursChart.destroy();
                }
                myHoursChart = new Chart(ctx, charthoursData);
        }else{
            $('#hoursChart').hide();
            $('.billableAndNonBillableChart .chartHour').html(tableNoData);
        }
    }

    function createNonBillableTypeChartChart(res) {
        if (mytypeChart) {
            mytypeChart.destroy();
        }
        
        if (res.data.nonbillableTypeData && res.data.nonbillableTypeData.length > 0 && $('#nonBillableTypeChart').length > 0) {
            var ctx = document.getElementById('nonBillableTypeChart').getContext('2d');
            var nonbillableTypeData = res.data.nonbillableTypeData;

            var labels = [];
            var dataArray = [];

            nonbillableTypeData.forEach(function(item) {
                labels.push(item.name);
                let formattedTime = parseFloat(item.formatted_time).toFixed(2);
                dataArray.push(formattedTime);
            });

            var charthoursData = {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Total Hours',
                        data: dataArray,
                        backgroundColor: [
                            '#FF6384', '#4BC0C0', '#FFCE56', '#36A2EB', '#9966FF',
                            '#FF9F40', '#FFB3E6', '#C2C2C2', '#E57373'
                        ],
                        borderWidth: 1,
                        hoverOffset: 4,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                padding: 5,  // Reduces space between labels
                                font: {
                                    size: 10   // You can reduce the font size if necessary
                                }
                            }
                        },
                        datalabels: {
                            color: '#FF3333',
                            formatter: function (value, context) {
                                return parseFloat(value).toFixed(2);
                            }
                        }
                    },
                },
            };

            if (mytypeChart) {
                mytypeChart.destroy();
            }

            mytypeChart = new Chart(ctx, charthoursData);
        }
        else {
            $('.nonBillableTypeChart .chartHour').html(tableNoData);
        }
    }

    function generateTaskStatistics(res) {
        const color = ['#9966FF','#FFCD56','#36A2EB','#57c30c'];
        let taskText = '';

        // Convert taskStatus object to an array without losing the numerical keys
        const taskStatusArray = Object.entries(res.taskStatus).map(([key, value]) => ({ key, ...value }));

        // Sort taskStatusArray in descending order by percentage
        taskStatusArray.sort((a, b) => {
            const percentageA = (a.count / res.totalTaskSum) * 100;
            const percentageB = (b.count / res.totalTaskSum) * 100;
            return percentageB - percentageA;
        });

        // Generate progress bar HTML
        let progressBarHTML = '';
        taskStatusArray.forEach((status, key) => {
            const percentage = (status.count / res.totalTaskSum) * 100;
            const formattedPercentage = (percentage % 1 === 0) ? percentage.toFixed(0) : percentage.toFixed(2);
            progressBarHTML += `
                <div class="progress-bar cursor-pointer" style="width: ${formattedPercentage}%; background: ${color[status.key]};" role="progressbar" title="Task Status: ${status.statusName}, ${formattedPercentage}%, Count: ${status.count}">${formattedPercentage}%</div>
            `;
        });

        // Generate table rows HTML
        let tableRowsHTML = '';
        taskStatusArray.forEach((status, key) => {
            const percentage = (status.count / res.totalTaskSum) * 100;
            const formattedPercentage = (percentage % 1 === 0) ? percentage.toFixed(0) : percentage.toFixed(2);
            tableRowsHTML += `
                <tr>
                    <td><i class="bx bx-task" style="color: ${color[status.key]} ;"></i>${status.statusName}</td>
                    <td>${formattedPercentage}%</td>
                    <td>${status.count}</td>
                </tr>
            `;
        });

        // Generate the final HTML
        const html = `
            <h6 class="dashboard-widget-header mb-1">Task Statistics</h6>
            <div class="d-flex flex-column justify-content-md-between text-center">
                <div class="text-start">
                    <div class="progress mb-4 h-px-20"> ${progressBarHTML} </div>
                    <div>
                        <div class="d-flex flex-column table-responsive text-nowrap">
                            <table class="table table-hover table-striped tablecontentcss">
                                <thead> <th>Status</th> <th>Percentage</th> <th>Count</th> </thead>
                                <tbody> ${tableRowsHTML} </tbody>
                                <tfoot class="table-border-bottom-0">
                                    <tr> <td colspan="2">Total Tasks:</td> <td>${res.totalTaskSum}</td> </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    function dashboardTask(){
        $.ajax({
            url: APP_URL+'/' + projectId + '/taskdata',
            type: 'GET',
            data: { projectId: projectId},
            success: function (res) {
                const html = generateTaskStatistics(res.data);
                if($('#taskStatistics').length > 0){
                    document.getElementById('taskStatistics').innerHTML = html;
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    // project dashboard data show
    function dashboard() 
    {
        $('.dashboardtabPage').append(loading());
        $.ajax({
            url: APP_URL+'/' + projectId + '/data',
            type: 'GET',
            data: { projectId: projectId , type: projectType, page: requestPage, table: requestedTable},
            success: function (res) {
                $('.dashboardtabPage').find('.loading-wrapper').remove();
                dashboardTask();
                //Hours table
                if(res.data.hoursTable) {
                    if(res.data.hoursTable == 0) {
                        $('#hoursTable').html(tableNoData);
                    }else{
                        let hoursTable = `<table class="table table-hover table-striped tablecontentcss" id="dashboard_hours_table">
                                            <tbody id="dashboard-hours-body">`
                                            if(res.data.hoursTable.projectHours){
                                                hoursTable += `<tr>
                                                    <td><i class="bx bxs-info-circle text-muted cursor" title="Project Details"></i>Project Hours:</td>
                                                    <td class="text-end">${res.data.hoursTable.projectHours}</td></tr>`
                                            }
                                            hoursTable +=`<tr>
                                                    <td><i class="bx bxs-info-circle text-muted cursor" title="Project Details"></i>Total CR Hours:</td>
                                                    <td class="text-end">${res.data.hoursTable.totalProjectHours}</td></tr>`;
                                            hoursTable += '</tbody>';
                                            if(res.data.hoursTable.projectHours){
                                                hoursTable += `<tfoot class="table-border-bottom-0"><tr>
                                                        <td>Total Hours:</td>
                                                        <td class="text-end">${res.data.hoursTable.totalHours}</td></tr></tfoot>`
                                            }
                                            hoursTable += '</table>';
                            $('#hoursTable').html(hoursTable);
                    }
                }

                //Non-billable type data
                if (res.data.nonbillableTypeData) {
                    if (res.data.nonbillableTypeData.length === 0) {
                        $('#nonBillableTypeTable').html(tableNoData);
                    } else {
                        let totalMinutes = 0;

                        let nonbillableTypeDataTable = `<table class="table table-hover table-striped tablecontentcss" id="dashboard_hours_table">
                                                        <tbody id="dashboard-nonbillable-type-body">`;
                
                        res.data.nonbillableTypeData.forEach(function(item) {
                            nonbillableTypeDataTable += `<tr>
                                                            <td><i class="bx bxs-info-circle text-muted cursor" title="${item.name}"></i> ${item.name}:</td>
                                                            <td class="text-end">${item.formatted_time}</td>
                                                        </tr>`;
                
                            let [hours, minutes] = item.formatted_time.split('.').map(Number);
                            totalMinutes += (hours * 60) + minutes; // Add to total minutes
                        });
                
                        nonbillableTypeDataTable += `</tbody>`;

                        let totalHours = Math.floor(totalMinutes / 60);
                        let remainingMinutes = totalMinutes % 60;
                        let formattedTotalHours = totalHours + (remainingMinutes / 100);

                        nonbillableTypeDataTable += `<tfoot class="table-border-bottom-0">
                                                        <tr>
                                                            <td>Total Hours:</td>
                                                            <td class="text-end">${formattedTotalHours.toFixed(2)}</td> <!-- Display the sum in hours.minutes format -->
                                                        </tr>
                                                    </tfoot>`;

                        nonbillableTypeDataTable += `</table>`;
                        
                        $('#nonBillableTypeTable').html(nonbillableTypeDataTable);
                    }
                }          

                // Users monthly timesheet hours - table
                renderTimesheetTable(res.data.userMonthlyTimesheetHours);

                //userHours Chart for dedicated and T&M Project
                if(!projectType){
                    createMonthlyHoursChart(res);
                }

                createBillableHoursChart(res); //billable and non-billable hours chart
                createNonBillableTypeChartChart(res);

                // Total hours number show
                $('.totalProjectHoursH4').text(res.data.hoursTable.totalHours);

                //Project Hours Consumption Status Widget only for Fixed Cost projects
                if(res.data.hoursTable) {
                    if(res.data.hoursTable == 0) {
                        $('#consumptionPercentageFC').html(tableNoData);
                    }else{
                        let hoursTable = `<table class="table table-hover table-striped tablecontentcss" id="consumptionPercentageFC_table">
                                            <tbody id="dashboard-hours-body">`
                                            
                            hoursTable += `<tr>
                                <td><i class="bx bxs-info-circle text-muted cursor" title="Project Hours Consumption Status"></i>Total Assigned Hours:</td>
                                <td class="text-end">${res.data.hoursTable.totalHours}</td></tr>`
                            hoursTable +=`<tr>
                                    <td><i class="bx bxs-info-circle text-muted cursor" title="Project Hours Consumption Status"></i>Added Consumed Hours:</td>
                                    <td class="text-end">${res.data.hoursTable.totalConsumedHours}</td></tr>`
                            hoursTable += '</tbody>';
                            hoursTable += `<tfoot class="table-border-bottom-0"><tr>
                                                <td>Consumption Percentage:</td>`;
                            
                            if (res.data.hoursTable.consumptionPercentage > 100) {
                                hoursTable += `<td class="text-end text-danger">${res.data.hoursTable.consumptionPercentage}%</td></tr></tfoot>`;
                            } else {
                                hoursTable += `<td class="text-end">${res.data.hoursTable.consumptionPercentage}%</td></tr></tfoot>`;
                            }
                            
                            hoursTable += '</table>';
                                                    
                        $('#consumptionPercentageFC').html(hoursTable);
                    }
                }

                //Reminder table
                if(res.data.reminderTable){
                    if(res.data.reminderTable.data == 0){
                        $('#dashboardReminderTable').html(tableNoData);
                    }else{
                            let reminderTable = `<table class="table tablecontentcss table-hover table-striped" id="reminder_table"><thead><tr>
                                    <th style="width:7%;">#</th>
                                    <th style="width:54%;">title</th>
                                    <th style="width:15%;">Date</th>
                                    <th style="width:13%;">Time</th>
                                    <th style="width:11%;">Action</th>
                                    </tr></thead><tbody id="reminder-table-body">`;

                            let reminderTableNum = res.data.reminderTable.st;
                            $.each(res.data.reminderTable.data, function (k, v) {
                                reminderTable += '<tr>';
                                reminderTable += '<td>'+reminderTableNum+'</td>';
                                reminderTable += '<td class="td-title showReminder cursor-pointer text-primary" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">'+sliceText(v.title,60)+'</td>';
                                reminderTable += '<td class="td-fullTitle d-none">'+v.title+'</td>';
                                reminderTable += '<td class="td-date">'+v.date+'</td>';
                                reminderTable += '<td class="td-time">'+v.time+'</td>';
                                reminderTable += '<td class="td-note d-none">'+v.note+'</td>';
                                reminderTable += '<td class="td-createdBy d-none">'+v.createdBy+'</td>';
                                reminderTable += '<td class="text-center">';
                                reminderTable += `<label class="showReminder cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="${v.id}" data-item-project-id="${v.project_id}" title="Show Details">
                                        <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span></label>`;
                                reminderTable += '</td></tr>';
                                reminderTableNum++;
                            });
                            reminderTable += '</tbody>';
                            if(res.data.reminderTable.morePage){
                                reminderTable += makePagination(res.data.reminderTable.button);
                            }
                            reminderTable += '</table>';
                            $('#dashboardReminderTable').html(reminderTable);
                            var prevLink = $('#reminder_table a.prev');
                            var nextLink = $('#reminder_table a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }
                }

                //Cr Table
                if(projectType){
                    if(res.data.crTable){
                        if(res.data.crTable.data == 0){
                            $('#dashboardTable').html(tableNoData);
                        }else{
                            let crTable = `<table class="table table-hover table-striped tablecontentcss" id="crDashboardTable"><thead><tr class="text-left">
                                            <th>#</th>
                                            <th>Hours</th>
                                            <th>Title</th>
                                            </tr></thead><tbody id="dashboard-cr-body" class="text-left">`;

                            let crTableNum = res.data.crTable.st;
                            $.each(res.data.crTable.data, function (k, v) {
                                crTable += '<tr>';
                                crTable += '<td>'+crTableNum+'</td>';
                                crTable += '<td class="td-date">'+v.hours+'</td>';
                                crTable += '<td class="text-left">';
                                crTable += `<label class="showCR" data-bs-toggle="offcanvas" data-bs-target="#showData"aria-controls="offcanvasEnd" data-item-id="${ v.id }"data-item-project-id="${ v.project_id }" title="Show Details">
                                        <span class="text-primary text-decoration-underline cursor">${ sliceText(v.title,60) }</span></label>`;
                                crTable += '</td></tr>';
                                crTableNum++;
                            });
                            crTable += `<tr><td colspan="1">Total Hours:</td>
                                        <td colspan="2">${ res.data.crTable.totalHours }</td></tr>`;
                            crTable += '</tbody>';
                            if(res.data.crTable.morePage){
                                crTable += makePagination(res.data.crTable.button);
                            }
                            crTable += '</table>';
                            $('#dashboardTable').html(crTable);
                            var prevLink = $('#crDashboardTable a.prev');
                            var nextLink = $('#crDashboardTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                        }
                    }
                }

                // Dashboard notice and appriciation count
                if(res.data.totalAppreciationAndNotice) {
                    $('.totalAppreciationDasboard').text(res.data.totalAppreciationAndNotice.appreciation ?? 0);
                    $('.totalNoticeDasboard').text(res.data.totalAppreciationAndNotice.notice ?? 0);
                }

                requestPage = 1;
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    function monthlyHoursTable(monthYear = null)
    {
        $.ajax({
            url: APP_URL+'/'+projectId+'/timesheetData/monthYear',
            type: 'GET',
            data: { projectId: projectId, monthYear: monthYear },
            success: function (res) {
                renderTimesheetTable(res.data);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    // Users monthly timesheet hours - Set the value of the date month field to last month
    var currDate = new Date();
    currDate.setMonth(currDate.getMonth() - 1);
    var lastMonthFormatted = currDate.toISOString().slice(0,7);
    $('#timeSheetDataMonth').val(lastMonthFormatted);

    var currDate = new Date();
    var currentMonthFormatted = currDate.toISOString().slice(0,7);
    $('#timeSheetDataMonth').attr('max', currentMonthFormatted);

    function renderTimesheetTable(timesheetData) {
        if(timesheetData) {
            if(timesheetData == 0){
                $('#userHourTable').html(tableNoData);
            }else{
                var billHoursArray = [];
                var nonBillHoursArray = [];
                var totalHoursArray = [];
                let userHoursTable = `<table class="table table-hover table-striped tablecontentcss" id="userHour_table"> <thead style="position: sticky; top: 0; z-index: 1;"> <tr style="position: sticky !important; background: #f5f6fa;">
                    <th>Employee</th>
                    <th class="text-end">Bill</th>
                    <th class="text-end">Non-Billable</th>
                    <th class="text-end">Total</th>
                    </tr></thead><tbody id="userHour-table-body">`;
                $.each(timesheetData, function (k, v) {
                    var currentBillHours = secondsToHHMM(v.billable_hours);
                    var currentNonBillHours = secondsToHHMM(v.non_billable_hours);
                    userHoursTable += '<tr>';
                    userHoursTable += '<td class="td-name">'+v.name+'</td>';
                    userHoursTable += '<td class="td-b text-end">'+currentBillHours+'</td>';
                    userHoursTable += '<td class="td-nb text-end">'+ (currentNonBillHours == '0:00' ? '00:00' : currentNonBillHours) +'</td>';
                    let totalSumHours = sumHours([ currentBillHours, currentNonBillHours])
                    userHoursTable += '<td class="td-tt text-end">'+ totalSumHours +'</td>';
                    userHoursTable += '</tr>';
                    billHoursArray.push(currentBillHours);
                    nonBillHoursArray.push(currentNonBillHours);
                    totalHoursArray.push(totalSumHours);
                });
                userHoursTable += '<tr> <th>Total</th> <td class="text-end">'+sumHours(billHoursArray)+'</td> <td class="text-end">'+sumHours(nonBillHoursArray)+'</td> <td class="text-end">'+sumHours(totalHoursArray)+'</td> </tr>';
                userHoursTable += '</tbody></table>';
                $('#userHourTable').html(userHoursTable);
            }
        }
    }

    // Function to sum hh:mm formatted times
    function sumHours(hoursArray) {
        function timeToMinutes(time) {
            var parts = time.split(":");
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }

        function minutesToTime(minutes) {
            var hours = Math.floor(minutes / 60);
            var mins = minutes % 60;
            return hours.toString().padStart(2, '0') + ":" + mins.toString().padStart(2, '0');
        }

        var total_minutes = 0;
        for (var i = 0; i < hoursArray.length; i++) {
            total_minutes += timeToMinutes(hoursArray[i]);
        }

        return minutesToTime(total_minutes);
    }

    //timesheet filter user data
    $('#timesheetUserFilter, #timesheetType, #taskUserFilter, #taskStatusFilter, #technology, #clientTimesheetUserFilter, #clientTimesheetTaskFilter').select2();

    $('#proTaskFilter').select2({
        placeholder: "Select Task",
        allowClear: true,
        minimumInputLength: 3,
        ajax: {
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    projectId: projectId,
                    term: params.term 
                };
            },
            url: APP_URL+'/fetch/timesheet/task',
            processResults: function (data) {
                return {
                    results: $.map(data, function (key, value) {
                        let truncatedText = key.length > 30 ? key.substring(0, 30) + "..." : key;
                        return {
                            text: truncatedText,
                            id: value,
                            title: key
                        };
                    })
                };
            },
            cache: true,
        }
    }).on('select2:open', function() {
        setTimeout(() => {
            $('.select2-results__option').each(function() {
                $(this).attr('title', $(this).text());
            });
        }, 100);
    });

    $('#industry, #database').select2({width: '100%'});
    $('#country').select2({
        placeholder: "Select Country",
        allowClear: true,
        minimumInputLength: 2,
        width: '100%',
        ajax: {
            dataType: 'json',
            delay: 250,
            url: APP_URL+'/portfolio/countries',
            processResults: function (data) {
                return {
                    results: $.map(data, function (key, value) {
                        return {
                            text: key,
                            id: value,
                        }
                    })
                };
            },
            cache: true,
        }
    });

    $(document).on('click', '.dz-image img', function () {
        let fullImageUrl = $(this).closest(".dz-preview")[0].dataset.fullImageUrl;
        if (fullImageUrl) {
            var screenWidth = $(window).width();
            var screenHeight = $(window).height();

            $('#previewImage').css({
                'max-width': (screenWidth-100) + 'px',
                'max-height': (screenHeight-100) + 'px'
            });
            $("#previewImage").attr("src", fullImageUrl);
            $("#imagePreviewContainer").show();
        }
    });
    $('#closePreview, #imagePreviewOverlay').on('click', function () {
        $('#imagePreviewContainer').hide();
    });

    function checkURLStatus(inputId, statusDivId) {
        let url = document.getElementById(inputId).value.trim();

        if(url && inputId == 'figmaLink'){
            const figmaRegex = /^(https?:\/\/)?(www\.)?figma\.com\/file\/[a-zA-Z0-9]+\/?/;

            if (!figmaRegex.test(url)) {
                document.getElementById(statusDivId).innerHTML = `<span class="text-danger">Invalid Figma URL</span>`;
                return;
            }else{
                enableSubmitBtn('#savePortfolio');
            }
        }
        
        if (url && inputId != 'figmaLink') {
            fetch(`/check-url?url=${encodeURIComponent(url)}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'active') {
                    document.getElementById(statusDivId).innerHTML = `<span class="text-success">Active</span>`;
                } else {
                    document.getElementById(statusDivId).innerHTML = `<span class="text-danger">Inactive</span>`;
                }
            })
            .catch(error => {
                console.error("Error:", error);
                document.getElementById(statusDivId).innerHTML = `<span class="text-danger">Inactive</span>`;
            });
        }else{
            document.getElementById(statusDivId).innerHTML = `<span></span>`;
        }
    }
       
    
    // Check URL Status
    let productionUrl = $('#productionUrl');
    let stagingUrl = $('#stagingurl');

    if (productionUrl.length > 0) {
        $('#productionUrl').on('blur', function () {
            checkURLStatus('productionUrl', 'production_url-status');
        });
    }
    if (stagingUrl.length > 0) {
        $('#stagingurl').on('blur', function () {
            checkURLStatus('stagingurl', 'staging_url-status');
        });
    }

    // Timesheet index page filter dropdown change
    $('#durationFilter li').on('click', function(e){
        let selector = $(this).children();
        filterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');

        if(filterText == 'today' || filterText == 'week' || filterText == 'month'){
            $('#startDateBlock, #endDateBlock, #filterBlock').hide();
            getTimesheetTableData();
        }else if(filterText == 'date'){
            $('#startDateBlock, #endDateBlock, #filterBlock').show();
        }else if(filterText == 'all'){
            $('#startDateBlock, #endDateBlock, #filterBlock').hide();
            $('#filterStartDate, #filterEndtDate').val('');
            disableSubmitBtn('#filterSearch');
            dateFilter['startDate'] = $('#filterStartDate').val();
            dateFilter['endDate'] = $('#filterEndtDate').val();
            getTimesheetTableData();
            enableSubmitBtn('#filterSearch');
        }
    });

    $(document).on('click', '#resetDate', function(){
        timesheetAjaxProgress = true;
        filterText = '';
        $('#durationFilter .dropdown-item').removeClass('active');
        $('#timesheetType').val(null).trigger('change');
        $('#timesheetUserFilter').val(null).trigger('change');
        $('#proTaskFilter').val(null).trigger('change');
        $('#startDateBlock, #endDateBlock, #filterBlock').hide();
        $('#filterStartDate, #filterEndtDate').val("").removeAttr('min').removeAttr('max');
        dateFilter['startDate'] = $('#filterStartDate').val();
        dateFilter['endDate'] = $('#filterEndtDate').val();
        disableSubmitBtn('#filterSearch');
        setTimeout(function () {
            timesheetAjaxProgress = false;
            getTimesheetTableData();
        }, 80);
        enableSubmitBtn('#filterSearch');
    });

    //ajax call to fetch task based on project change in reject timesheet edit form
    $(document).on('change', '#editProjectName', function () {
        var projectId = $(this).val();
        $.ajax({
            url: APP_URL+'/timesheet',
            type: 'GET',
            data: { project: projectId },
            success: function (response) {
                document.getElementById('editProjectTask').disabled = false;
                $('#editProjectTask').empty();
                var data = response.data;
                var taskoption = '';
                taskoption += "<option value='' selected>" + 'Select Task' + "</option>";
                $.each(data, function(item) {
                    var val = data[item];
                    taskoption += "<option value='" + val.id + "'>" + val.title + "</option>";
                });
                $('#editProjectTask').html(taskoption);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    // Set min date for filter start date
    $(document).on('change', '#filterStartDate', function(){
        let startDate = $('#filterStartDate').val();
        if(startDate){
            $('#filterEndtDate').attr({'min': startDate});
        } else {
            $('#filterEndtDate').attr({'min': ''});
        }
    });

    // Set max date for filter end date
    $(document).on('change', '#filterEndtDate', function(){
        let endDate = $('#filterEndtDate').val();
        if(endDate){
            $('#filterStartDate').attr({'max': endDate});
        } else {
            $('#filterStartDate').attr({'max': ''});
        }
    });

    // Enable disable Timesheet filter button
    $('.date-input').on('change', function(e){
        if( $('#filterStartDate').val() || $('#filterEndtDate').val()){
            enableSubmitBtn('#filterSearch');
        }else{
            $('#filterSearch').attr('disabled', true);
        }
    });

    $('#filterSearch').on('click', function(){
        disableSubmitBtn('#filterSearch');
        dateFilter['startDate'] = $('#filterStartDate').val();
        dateFilter['endDate'] = $('#filterEndtDate').val();
        getTimesheetTableData();
        enableSubmitBtn('#filterSearch');
    });

    $('#timesheetUserFilter, #projectFilter, #timesheetType, #proTaskFilter').on('change', function(){
        getTimesheetTableData();
    });

    $('#taskUserFilter, #taskStatusFilter').on('change', function(){
        task();
    });

    $('#resetTaskDate').on('click', function(){
        taskAjaxProgress = true;
        $('#taskStatusFilter').val(null).trigger('change');
        $('#taskUserFilter').val(null).trigger('change');
        setTimeout(function () {
            taskAjaxProgress = false;
            task();
        }, 80);
    });

    $('#resetAnDate').on('click', function(){
        noticeAjaxProgress = true;
        $('#noticeUserFilter').val(null).trigger('change');
        $('#noticeType').val(null).trigger('change');
        $('#naStartDateBlock, #naEndDateBlock, #naFilterBlock').hide();
        $('#naFilterStartDate, #naFilterEndtDate').val("").removeAttr('min').removeAttr('max');
        naDateFilter['startDate'] = $('#filterStartDate').val();
        naDateFilter['endDate'] = $('#filterEndtDate').val();
        nafilterText = '';
        $('#naDurationFilter .dropdown-item').removeClass('active');
        disableSubmitBtn('#naFilterSearch');
        setTimeout(function () {
            noticeAjaxProgress = false;
            getNoticeTableData();
        }, 80);
        enableSubmitBtn('#naFilterSearch');
    });

    //Ajax call for datatable comment
    var commentAjaxProgress = false;
    function commentTabData() {
        if (!commentAjaxProgress) {
            let option = 'newest';
            var selectedOption = $('#sortingFilter').val();
            if (selectedOption == 'Newest first') {
                option = 'newest';
            } else if (selectedOption == 'Oldest first') {
                option = 'oldest';
            }

            if($('#commentBtnData').find('h6').length){
                $('#commentBtnData h6').html('&nbsp;');
            }

            $('#commentBtnData').append(loading());
            var fromCopyToClipboard = false;
            requestPage = $('#viewMoreComment').length ? $('#viewMoreComment').attr('data-url') : 1;
            if(pageParam){
                fromCopyToClipboard = true;
                pageParam = null;
            }

            $.ajax({
                url: APP_URL+"/" + projectId + "/data/comment",
                type: "GET",
                data: { projectId: projectId, page: requestPage, option: option, copyClip: fromCopyToClipboard },
                success: function (res) {
                    commentCount = res.count;
                    $('#commenttab').text('Comments (' + res.count + ')');
                    $('#commentBtnData').find('.loading-wrapper').remove();

                    if(($.inArray($('#sortingFilter').val(), ['Newest first', 'Oldest first']) !== -1 && requestPage == 1) || (newCommentAdd == true)){
                        $('#commentBtnData').html('');
                        newCommentAdd = false;
                    }
                    $('.commentButtonPage').remove();
                    if(res.count == 0){
                        $('#commentBtnData').html(tableNoData);
                    }else{
                        requestPage == 1 ? $('#commentBtnData').html('') : '';
                        var tc = '';
                        $.each(res.data.data, function (k, v) {
                            tc += '<div class="buttonComment" data-page="'+ (res.data.nextPage != null ? res.data.currentPage : "") +'"></div>';
                            tc += '<div class="copyCommentBlock">';
                            tc += '<button type="button" class="accordion-button collapsed cmtbutton" id="'+v.id+'"';
                            tc += '<button type="button" class="accordion-button collapsed cmtbutton" id="'+v.id+'" data-bs-toggle="collapse" data-bs-target="#commentButton-'+v.id+'-collapse" aria-expanded="false" aria-controls="commentButton-'+v.id+'-collapse" data-timestamp="'+v.created_at+'">';
                            tc += '<span class="text-primary rounded-pill">'+v.userName+'</span> <span class="fw-semibold">'+ (v.title == null ? '' : ' - '+v.title ) +'</span> </button>';
                            let isPrivate = '';
                            if(v.is_private == 1){
                                isPrivate = '<span class="pe-2" title="This is private comment"><i class="bx bx-lock-alt"></i></span>';
                            }
                            tc += '<span class="copySpan">'+ isPrivate + v.createdAt +'<a href="javascript::void(0)" title="Copy Link" class="bx bx-link commentLink" style="margin-left: 5px;" data-item-id="'+v.id+'"></a> </span> </div>';
                            tc += '<div id="commentButton-'+v.id+'-collapse" class="collapse commentList mx-4" data-bs-parent="#commentList"> <p class="text-md-start commentData">'+v.comment+'</p> </div>';
                            tc += '<div id="commentButton-{idParam}-collapse" class="collapse commentList show" data-bs-parent="#commentList"></div></div>';
                        });
                        if(res.data.nextPage){
                            tc += '<div class="mt-3 ml-1 commentButtonPage"> <div id="viewMoreComment" class="btnClick text-center fw-bold cursor-pointer p-lg-2" data-url="'+res.data.nextPageNo+'">View More</div> </div>';
                        }

                        $('#commentBtnData').append(tc);
                        if ($('#collapseFilter').val() === 'Uncollapse all') {
                            $('.collapse').collapse('show');
                        }else if ($('#collapseFilter').val() === "Smart Collapse") {
                            // Uncollapse first comments
                            $('.collapse:not(:first)').collapse('hide');
                            $('.collapse:first').collapse('show');
                        }
                        // Open the comment using the collapse method
                        if (idParam) {
                            $('#commentButton-' + idParam + '-collapse').addClass('show');
                        }
                    }
                    requestPage = 1;
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
            commentAjaxProgress = false;
            
        }
    }

    // Sorting filter for comment
    $('#sortingFilter').on('change', function () {
        commentTabData();
    });

    // Collapse filter for comment
    $(document).on('change', '#collapseFilter', function () {
        var statusFilter = $(this).val();

        if (statusFilter === 'Uncollapse all') {
            // Uncollapse all comments
            $('.collapse').collapse('show');
        } else if (statusFilter === "Smart Collapse") {
            // Uncollapse first comments
            $('.collapse:not(:first)').collapse('hide');
            $('.collapse:first').collapse('show');
        } else {
            // Collapse all comments
            $('.collapse').collapse('hide');
        }
    });

    // Single link copy in comment tab
    $(document).on('click', '.commentLink', function (event) {
        event.preventDefault();
        activePage = $('#viewMoreComment').length ? $('#viewMoreComment').attr('data-url') : $('.buttonComment').last().data('page');
        var commentId = $(this).data('item-id');
        var url = window.location.href.split('?')[0] + '?t=' + 'cmt' + '&id=' + commentId + '&page=' + activePage;
        try {
            if(copyToClipboard(url)){
                successMessage('Link copied');
            }else{
                errorMessage('Something went wrong');
            }
        } catch(error) {
            console.error(error);
        }
        
    });

    //Ajax call for CR tab
    function crData() {
        $('#crTable').append(loading());
        $.ajax({
            url: APP_URL+'/'+projectId+'/data/cr',
            type: 'GET',
            data: { projectId: projectId, page: requestPage },
            success: function (res) {
                $('#crtab').text('CR (' + res.count + ')');
                if(res.count == 0){
                    $('#crTable').html(tableNoData);
                }else{
                    let tc = ` <table class="table tablecontentcss table-hover table-striped" id="cr_data"><thead><tr>
                                <th style="width:5%;">#</th>
                                <th style="width:48%;">Title</th>
                                <th style="width:15%;" class="text-center">APPROVED By</th>
                                <th style="width:15%;" class="text-center">Uploaded By</th>
                                <th style="width:10%;" class="text-center">Uploaded At</th>
                                <th class="text-end" style="width:8%;">Hours</th>
                                <th class="text-center" style="width:10%;">Action</th>
                               </tr></thead><tbody id="cr-list-body">`;

                    let num = res.data.st;
                    $.each(res.data.data, function (k, v) {
                        tc += '<tr>';
                        tc += '<td>'+num+'</td>';
                        tc += `<td class="td-title showCR text-primary cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="${v.id}" data-item-project-id="${v.project_id}" title="Show Details">${sliceText(v.title,60)}</td>`;
                        tc += '<td class="td-approved_by text-center">'+v.approved_by+'</td>';
                        tc += '<td class="td-userName text-center">'+v.userName+'</td>';
                        tc += '<td class="td-createdAt text-center" title="'+v.createdAtTime+'">'+v.createdAt+'</td>';
                        tc += '<td class="td-hours text-end">'+v.hours+'</td>';
                        tc += '<td class="text-center">';
                        if(res.data.permission.edit == true && $('.addCrBtn').length){
                            tc += '<label onclick="setFocusOnFirstInput(\'#editCRModal\')" class="editCR cursor-pointer" title="Edit CR"  data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'">';
                            tc += '<span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>';
                        }
                        tc += `<label class="showCR" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="${v.id}" data-item-project-id="${v.project_id}" title="Show Details">
                                <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span></label>`;
                        tc += '</td></tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#crTable').html(tc);
                    var prevLink = $('#cr_data a.prev');
                    var nextLink = $('#cr_data a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
                requestPage = 1;
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
            
        });
    }

    //Ajax call for Task tab
    var taskAjaxProgress = false;
    function task() {
        if (!taskAjaxProgress) {
            taskAjaxProgress = true;
            if( $('#taskTable').find('h6').length ){
                $('#taskTable h6').html('&nbsp;');
            }
            $('#taskTable').append(loading());

            let filterEncryTaskEmp = $('#taskUserFilter').length ? $('#taskUserFilter').val() : null;
            let filterTaskStatus = $('#taskStatusFilter').length ? $('#taskStatusFilter').val() : null;

            if(filterEncryTaskEmp != '' || filterTaskStatus != ''){
                $('#resetTaskBlock').show();
            }else{
                $('#resetTaskBlock').hide();
            }

            $.ajax({
                url: APP_URL+'/' + projectId + '/data/project-task',
                type: "GET",
                data: { projectId: projectId, 
                        page: requestPage,
                        filterEncryTaskEmp: filterEncryTaskEmp,
                        filterTaskStatus: filterTaskStatus,
                    },
                success: function (res) {
                    $('#tasktab').text('Tasks (' + res.count + ')');
                    if(res.count == 0){
                        $('#taskTable').html(tableNoData);
                    }else{
                        let tc = `<table class="table table-hover tablecontentcss table-striped" id="task_table"> <thead> <tr>`;
                        
                            tc += '<th style="width:%;" class="d-flex">';

                            // if(res.data.permission.edit == true && $('.addNewTask').length){
                                tc += `<span width="" id="checkAllCompleted" style="padding-left: 5px; padding-right: 5px; display:none;">
                                            <span class="form-check"> <input class="form-check-input" type="checkbox" value="" id="selectAllCompleted"> <label class="form-check-label" for="selectAllCompleted"></label> </span>
                                        </span>`;
                            // }
                            tc += 'title</th>';
                            tc += ` <th style="width:39%;">Details</th>
                                    <th style="width:10%;">Created By</th>
                                    <th style="width:10%;">Created At</th>
                                    <th style="width:10%;">Due Date</th>
                                    <th style="width:10%;">Status</th>
                                    <th style="width:13%;">Action</th>
                                    </tr> </thead> <tbody id="task-table-body">`;

                        let num = res.data.st;
                        $.each(res.data.data, function (k, v) {
                            tc += '<tr>';
                            tc += '<td class="cursor-pointer text-primary d-flex titleHeader">';
                            if((v.selfOwner == true || res.data.permission.edit_project == true) && res.data.permission.edit == true && $('.addNewTask').length && v.status != 'Completed'){
                                tc += '<span class="checkMarkComp"> <div class="form-check"> <input class="form-check-input completedCheck" type="checkbox" value="'+v.id+'" id="pending-'+k+'"> <label class="form-check-label" for="pending-'+k+'"></label> </div> </span>';
                            }
                            tc += '<span class="td-title showTask '+ (v.dueTask == true ? "text-danger" : "") +'" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'" title="Show Details">'+sliceText(v.title, 60)+'</span></td>';
                            tc += '<td class="">'+ v.detail +'</td>';
                            tc += '<td class="td-task-createdBy">'+v.createdBy+'</td>';
                            tc += '<td class="td-task-createdAt">'+v.createdAt+'</td>';
                            tc += '<td class="td-dueDate">'+v.dueDate+'</td>';
                            tc += '<td class="td-status">'+v.status+'</td>';
                            tc += '<td class="td-fullTitle d-none">'+v.title+'</td>';
                            tc += '<td class="d-none td-details">'+v.fullDetail+'</td>';
                            tc += '<td>';
                            if((v.selfOwner == true || res.data.permission.edit_project == true) && res.data.permission.edit == true && $('.addNewTask').length ){
                                tc += '<label onclick="setFocusOnFirstInput(\'#editTaskModal\')" class="editTask cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'">';
                                tc += '<span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>';
                            }

                            tc += '<label class="showTask cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'" title="Show Details">';
                            tc += '<span class="text-primary cursor"><i class="bx bx-show me-1"></i></span></label>';

                            if((v.selfOwner == true || res.data.permission.edit_project == true) && res.data.permission.delete == true && $('.addNewTask').length){
                                tc += '<label class="deleteTask cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'">';
                                tc += '<span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                            }

                            tc += '</td></tr>';
                            num++;
                        });
                        tc += '</tbody>';
                        if(res.data.morePage){
                            tc += makePagination(res.data.button);
                        }

                        if(res.data.permission.edit == true && $('.addNewTask').length ){
                            tc += `<tfoot class="app-rej-sel-btn-footer" style="display: none;"> <tr><td colspan="7"> <div>
                                        <a href="javascript:;" class="btn btn-sm btn-label-success" data-action="completed" id="completedSelected">Complete Selected Tasks</a>
                                    </div> </td></tfoot> </tr>`;
                        }
                        
                        tc += '</table>';
                        $('#taskTable').html(tc);
                        var prevLink = $('#task_table a.prev');
                        var nextLink = $('#task_table a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');

                        if($('.completedCheck').length){
                            $('#checkAllCompleted').show();
                            $('.titleHeader').each(function() {
                                if (!$(this).find('span.checkMarkComp').length) {
                                    $(this).addClass('ps5');
                                }
                            });
                        }
                    }
                    requestPage = 1;
                    taskAjaxProgress = false;
                },
                error: function (xhr, status, error) {
                    taskAjaxProgress = false;
                    console.log(error);
                },
            });
        }
    }

    $(document).on('click','.addNewTask',function (){
        $('.modal-title').html('Add Task');
    });

    $(document).on('click','.reminderbtn',function (){
        $('.modal-title').html('Add Reminder');
    });

    $(document).on('click','.addNewDocument',function (){
        $('.modal-title').html('Add Your Document');
    });

    $(document).on('change', '.taskStatus' , function(){
        var statusValue = $(this).is(':checked') ? 1 : 0;
        var id = $(this).data('item-id');
        var projectId = $(this).data('item-project-id');
        $.ajax({
            url: APP_URL+'/' + projectId + '/project-task/' + id + '/update/status',
            type: 'POST',
            data: { statusValue :statusValue},
            success: function (response) {
                successMessage(response.message);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    // Edit and Update Task pop open and get data
    $(document).on('click', '.editTask', function () {
        $('#edit-task-form').validate({
            rules:{
                edit_task_title: { minlength: 2, maxlength: 190 },
                edit_task_details: { minlength: 2, maxlength: 65530 }
            },
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
            messages: {
                edit_task_title: { required: 'The title field is required'},
                edit_task_status: { required: 'The status field is required'},
                edit_task_projectname: { required: 'The Project field is required' },
                edit_task_details: { required: 'The Details field is required' },
            },
        });

        $('#edit-task-form').validate().resetForm();
        $('#edit-task-form .error').removeClass('error');
        $('#validationMessages').empty();

        var id = $(this).data('item-id');
        var projectId = $(this).data('item-project-id');
        $.ajax({
            url: APP_URL+'/' + projectId + '/project-task/' + id + '/edit',
            type: 'GET',
            data: { id: id },
            success: function (response) {
                $('.modal-title').html('Edit Task');
                $('#edit_task_title').val(response.data.title);
                $('#task_id').val(response.data.id);
                $('#edit_task_details').val(response.data.details);
                $('#edit_due_date').val(response.data.due_date);
                $(".status option[value='"+response.data.status +"']"
                ).prop("selected", true);
                $('#editTaskModal').modal('show');
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
        $('#saveEditTask').click(function () {
            $('#edit-task-form').validate({
                rules:{
                    edit_task_title: { minlength: 3, maxlength: 50 } 
                },
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
                messages: {
                    edit_task_title: { required: 'The title field is required',
                    }, edit_task_projectname: { required: 'The Project field is required',
                    }, edit_task_details: { required: 'The Details field is required', },
                },
            });
        
            if($('#edit-task-form').valid()) {
                disableSubmitBtn('#saveEditTask');
                $('#edit-task-form').ajaxSubmit({
                    beforeSubmit: function () {
                        $('.error-message').text('');
                    },
                    success: function (response) {
                        setTimeout(function () {
                            $('#editTaskModal').modal('hide');
                        }, 50);
                        task();
                        dashboardTask();
                        enableSubmitBtn('#saveEditTask');
                        successMessage(response.message);
                    },
                    error: function (xhr) {
                        enableSubmitBtn('#saveEditTask');
                        if (xhr.status === 422) {
                            var errors = xhr.responseJSON.errors;
                            $.each(errors, function (field, error) {
                                var fieldElement = $("[id='" + field + "']");
                                fieldElement.next('div').text(error[0]);
                            });
                        } else {
                            console.log(xhr);
                        }
                    },
                });
            }
        });
    });

    //view task details page
    $(document).on('click', '.showTask', function () {
        let title = $(this).closest('tr').find('.td-fullTitle').text();
        let description = $(this).closest('tr').find('.td-details').html();
        let status = $(this).closest('tr').find('.td-status').text();
        let createdBy = $(this).closest('tr').find('.td-task-createdBy').text();
        let createdAt = $(this).closest('tr').find('.td-task-createdAt').text();
        let dueDate = $(this).closest('tr').find('.td-dueDate').text();
        $('.showDataTitle').empty();
        $(document).find('.offcanvas #showDataBody').empty();
        $('.showDataTitle').text('Task Details');
        $(document).find('.offcanvas #showDataBody').html(
            `<tr> <th>Created By:</th> <td>${createdBy}</td> </tr>
            <tr> <th>Created At:</th> <td>${createdAt}</td> </tr>
            <tr> <th>Project:</th> <td>${projectName}</td> </tr>
            <tr> <th>Title:</th> <td>${title}</td> </tr>
            <tr> <th>Status:</th> <td>${status}</td> </tr>
            <tr> <th>Due Date:</th> <td>${dueDate}</td> </tr>
            <tr> <th>Details:</th> <td>${description}</td> </tr>`
        );
    });

    //delete task
    $(document).on('click', '.deleteTask', function () {
        var id = $(this).data('item-id');
        var projectId = $(this).data('item-project-id');
        alert('Alert!','Are you sure you want to delete this data?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/' + projectId + '/project-task/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        if(response.status == 'error'){
                            errorMessage(response.message);    
                        }else{
                            task();
                            dashboardTask();
                            successMessage(response.message);
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    //view cr details popup in CR tab
    $(document).on('click', '.showCR', function () {
        $('.offcanvas ').addClass('offcanvas-size-xxl');
        $(document).find('.offcanvas #showDataBody').html('<h5>Loading...</h5>');
        var id = $(this).data('item-id');
        var projectId = $(this).data('item-project-id');
        $.ajax({
            url: APP_URL+'/' + projectId + '/project-cr/' + id + '/show',
            type: 'GET',
            data: { id: id },
            success: function (response) {
                $('.showDataTitle').empty();
                $(document).find('.offcanvas #showDataBody').empty();
                $('.showDataTitle').text('Change Request Details');
                $(document).find('.offcanvas #showDataBody').append(
                    `<tr> <th>Uploaded By:</th> <td>${response.crdata.user.name}</td> </tr>
                    <tr> <th>Project:</th> <td>${projectName}</td> </tr>
                    <tr> <th>Title:</th> <td>${response.crdata.title}</td> </tr>
                    <tr> <th>Approved By:</th> <td>${response.crdata.approved_by}</td> </tr>
                    <tr> <th>Approved Date:</th> <td>${response.crdata.approved_date.slice(0, 10)}</td> </tr>
                    <tr> <th>Hours:</th> <td>${response.crdata.hours}</td> </tr>
                    <tr> <th>Note:</th> <td>${response.crdata.note !== null ? response.crdata.note : ''}</td> </tr>`
                );
                $(document).find('.offcanvas #showDataBody').append( `<tr> <th class="text-muted">Approval Attachment:</th> </tr>` );
                // Append rows for approvalData

                $(document).find('.offcanvas #showDataBody').append(attachmentRow(response.approvalData));
                $(document).find('.offcanvas #showDataBody').append( `<tr> <th class="text-muted">Attachment:</th> </tr>` );
                // Append rows for crFile
                $.each(response.crFile, function (index, item) {
                    $(document).find('.offcanvas #showDataBody').append(attachmentRow(item));
                });
                $('[data-bs-toggle="tooltip"]').tooltip();
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    // Edit CR pop open and get data
    $(document).on('click', '.editCR', function () {
        var id = $(this).data('item-id');
        var projectId = $(this).data('item-project-id');

        $.ajax({
            url: APP_URL+'/' + projectId + '/project-cr/' + id + '/edit',
            type: 'GET',
            data: { id: id },
            success: function (response) {
                $('.modal-title').html('Edit Change Request');
                $('#itemIdInput').val(response.crdata.id);
                $('#hours').val(response.crdata.hours);
                var note = response.crdata.note;
                if (note !== null) {
                    note = note.slice(0, 100);
                    $('#note').val(note);
                }
                $('#edit-cr-form #crtitle').val(response.crdata.title);
                $('#edit-cr-form #approvedDate').val( response.crdata.approved_date.slice(0, 10) );
                $('#edit-cr-form #deliveryDate').val( response.projectDeliveryDate.slice(0, 10) );
                $('#edit-cr-form #approved_by').val(response.crdata.approved_by);
                $('#appfileId').val(response.approvalData.id);

                $('#edit-cr-form .appNote').val(response.approvalData.note);
                $('#appfile').text('Selected file: '+response.approvalData.original_name);
                $('#edit-cr-form #appFileId').val(response.approvalData.id);
                $('#edit-cr-form #appshowtoclient').prop('checked', response.approvalData.show_to_client );
                /*cr attachment data */
                var crFile = response.crFile;
                if (crFile.length > 0) {
                    $('#edit-new-row').empty();
                    crFile.forEach(function (data) {
                        $('#edit-new-row').append(EditCrRow(id, data));
                    });
                } else {
                    console.error('No files found in the crFile array.');
                }
                // Show the modal
                $('#editCRModal').modal('show');
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    $(document).on('click', '#saveEditCR', function () {
        $.validator.addMethod("twoDecimal", function(value, element) {
            return /^(\d+(\.\d{0,2})?)?$/.test(value);
        }, "Maximum two digits allowed after the decimal point.");

        $('#edit-cr-form').validate({
            rules:{
                hours: { number: true, twoDecimal: true },
                approved_date: { date: true },
                title: { minlength: 3, maxlength: 50 } 
            },
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
            messages: {
                hours: { required: 'The Hours field is required' },
                title: { required: 'The Title field is required' },
                approved_by: { required: 'The Approved By field is required' },
                approved_date: { required: 'The Approved date field is required' },
                'approval_attachment[attachment_note]': { required: 'This field is required' },
                'approval_attachment[file]': { required: 'This field is required' },
                'cr_attachment[0][file]': { required: 'This field is required' },
                'cr_attachment[0][attachment_note]': { required: 'This field is required' }
            },
        }); 
    
        if($('#edit-cr-form').valid()) {
            disableSubmitBtn('#saveEditCR');
            $('#edit-cr-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#editCRModal').modal('hide');
                    crData();
                    dashboard();
                    enableSubmitBtn('#saveEditCR');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveEditCR');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldElement = $("[id='" + field + "']");
                            fieldElement.next('div').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }    
    });

    //function of Document tab
    var documentAjaxProgress = false;
    function documentData() {
        if (!documentAjaxProgress) {
            documentAjaxProgress = true;
            $('#docTable').append(loading());
            if($('#documentBtnData').find('h6').length){
                $('#documentBtnData h6').html('&nbsp;');
            }

            $.ajax({
                url: APP_URL+'/' + projectId + '/data/doc',
                type: 'GET',
                data: { projectId: projectId, page: requestPage },
                success: function (res) {
                    $('#doctab').text('Documents (' + res.count + ')');
                    $('#docTable').html(res.data);
                    if(res.count == 0){
                        $('#docTable').html(tableNoData);
                    }else{
                        let editPermission = res.data.editPermission;
                        let deletePermission = res.data.deletePermission;
                        let tc = `<table class="table table-hover table-striped tablecontentcss" id="doc_data"><thead><tr>
                                <th style="width:5%;">#</th>
                                <th style="width:30%;">Alias</th>
                                <th style="width:25%;">Attachment Name</th>
                                <th style="width:10%;" class="text-center">Uploaded At</th>
                                <th style="width:15%;" class="text-center">Type</th>
                                <th style="width:10%;" class="text-center">Action</th>
                                </tr></thead><tbody id="document-list-body" class="table-border-bottom-0">`;

                        let num = res.data.st;
                        $.each(res.data.data, function (k, v) {
                            tc += '<tr>';
                            tc += '<td>'+num+'</td>';
                            tc += `<td><span title="${v.note}">${sliceText(v.note,60)}</span> <span class="showCR cursor-pointer text-primary" data-bs-toggle="offcanvas" data-bs-target="#showData"aria-controls="offcanvasEnd" data-item-id="${v.crId}" data-item-project-id="${v.projectId}" title="Show CR Details"> ${v.crName !== null ? '(' + sliceText(v.crName, 30) + ')' : ''}</span></td>`;
                            tc += `<td class="text-primary openDoc cursor" title="Open file" data-check-attachment="${v.doctype}" data-doc-id="${v.document_id}">${v.doc}</td>`;
                            tc += '<td class="text-center" title="'+v.createdAtTime+'">'+v.createdAt+'</td>';
                            tc += '<td class="text-center">'+v.Enumtype+'</td>';
                            tc += '<td class="text-center">';
                            tc += `<label title="Open file"><span class="text-primary openDoc" data-check-attachment="${v.doctype}" data-doc-id="${v.document_id}">
                                    <i class="fa-solid fa-up-right-from-square cursor"></i></span></label>`;
                            if(editPermission == true && v.canEdit){
                                tc += `<label class="editDoc cursor-pointer ps-2" title="Edit Document" data-item-id="${v.document_id}">
                                        <span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span>
                                       </label>`;
                            }
                            if(deletePermission == true && v.canDelete){
                                tc += `<label title="Delete Document" class="deleteDocument cursor-pointer" data-item-id="${v.document_id}">
                                        <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span>
                                       </label>`;
                            }
                            tc += '</td></tr>';
                            num++;
                        });
                        tc += '</tbody>';
                        if(res.data.morePage){
                            tc += makePagination(res.data.button);
                        }
                        tc += '</table>';
                        $('#docTable').html(tc);
                        var prevLink = $('#doc_data a.prev');
                        var nextLink = $('#doc_data a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }
                    requestPage = 1;
                    documentAjaxProgress = false;
                },
                error: function (xhr, status, error) {
                    documentAjaxProgress = false;
                    console.log(error);
                },
            });
        }
    }

    // Edit Document pop open and get data
    $(document).on('click', '.editDoc', function () {
        var docId = $(this).data('item-id');

        $.ajax({
            url: APP_URL+'/document/' + docId + '/edit',
            type: 'GET',
            data: { id: docId },
            success: function (res) {
                if(res.status =='success'){
                    $('#editDocPopup').html('');
                    $('#editDocPopup').html(res.data);
                    $('#editDocumentModal').modal('show');
                }else{
                    errorMessage(res.message);
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    //ajax call delete document
    $(document).on('click','.deleteDocument', function(){
        var id = $(this).data('item-id');
        alert('Alert!','Are you sure you want to delete this document?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/document/' + id + '/delete',
                    type: 'DELETE',
                    success: function(res) {
                        if(res){
                            successMessage(res.message);
                            documentData();
                        }else{
                            errorMessage(res.message);
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    //function of channel tab
    var descalationAjaxProgress = false;
    function escalationChannel() {
        if (!descalationAjaxProgress) {
            descalationAjaxProgress = true;
            if( $('#escalationChannelTable').find('h6').length ){
                $('#escalationChannelTable h6').html('&nbsp;');
            }
            $('#escalationChannelTable').append(loading());
            $.ajax({
                url: APP_URL+'/' + projectId + '/data/channel',
                type: 'GET',
                data: { projectId: projectId ,page: requestPage},
                success: function (res) {
                    $('#escalationtab').text('Escalation Channel (' + res.count + ')');
                    if(res.count == 0){
                        $('#escalationChannelTable').html(tableNoData);
                    }else{
                        let tc = `<table class="table table-hover table-striped tablecontentcss" id="channel_table"><thead><tr>
                                <th style="width:5%;">#</th>
                                <th style="width:55%;">title</th>
                                <th style="width:30%;">details</th>
                                <th style="width:10%;">Action</th>
                            </tr> </thead><tbody id="channel-list-body">`;

                        let num = res.data.st;
                        $.each(res.data.data, function (k, v) {
                            const truncatedDetail = sliceText(v.fullDetail, 60);
                            tc += '<tr>';
                            tc += '<td>'+num+'</td>';
                            tc += '<td>'+v.title+'</td>';
                            tc += '<td>'+truncatedDetail+'</td>';

                            if(res.data.permission.edit == true){
                                tc += '<td>';
                                tc += '<label class="editChannel cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'">';
                                tc += '<span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>';
                            }
                            tc += '</tr>';
                            num++;
                        });
                        tc += '</tbody>';
                        if(res.data.morePage){
                            tc += makePagination(res.data.button);
                        }
                        tc += '</table>';
                        $('#escalationChannelTable').html(tc);
                        var prevLink = $('#channel_table a.prev');
                        var nextLink = $('#channel_table a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }
                    requestPage = 1;
                    descalationAjaxProgress = false;
                },
                error: function (xhr, status, error) {
                    descalationAjaxProgress = false;
                    console.log(error);
                },
            });
        }
    }

    //edit channel popup
    $(document).on('click', '.editChannel', function () {
        $('#edit-escalation-form').validate().resetForm();
        $('#edit-escalation-form .error').removeClass('error');
        $('#validationMessages').empty();

        var id = $(this).data('item-id');
        var projectId = $(this).data('item-project-id');
        $.ajax({
            url: APP_URL+'/' + projectId + '/project-channel/' + id + '/edit',
            type: 'GET',
            data: { id: id, project_id: projectId },
            success: function (response) {
                $('.title').val(response.channelData.title);
                $('#editId').val(response.channelData.id);
                $('.details').val(response.channelData.details);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
        // Show the modal
        $('#EditEscalationModal').modal('show');
    });
    
    //save edit channel popup
    $(document).on('click', '#saveEditChannel', function () {
        $('#edit-escalation-form').validate({
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
    
            messages: {
                title: { required: 'title field is required' },
                details: { required: 'details field is required' },
                status: { required: 'status field is required' }
            },
        });

        if( $('#edit-escalation-form').valid() ) {
            disableSubmitBtn('#saveEditChannel');
            $('#edit-escalation-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    setTimeout(function () {
                        $('#EditEscalationModal').modal('hide');
                    }, 250);
                    enableSubmitBtn('#saveEditChannel');
                    escalationChannel();
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveEditChannel');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldElement = $("[id='" + field + "']");
                            fieldElement.next('div').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //function of reminder tab
    var reminderAjaxProgress = false;
    function reminderData() {
        if (!reminderAjaxProgress) {
            reminderAjaxProgress = true;
            if( $('#reminderTable').find('h6').length ){
                $('#reminderTable h6').html('&nbsp;');
            }
            $('#reminderTable').append(loading());
            $.ajax({
                url: APP_URL+'/' + projectId + '/data/reminder',
                type: 'GET',
                data: { projectId: projectId, page: requestPage },
                success: function (res) {
                    $('#remindertab').text('Reminders (' + res.count + ')');

                    if(res.count == 0){
                        $('#reminderTable').html(tableNoData);
                    }else{
                        let tc = `<table class="table table-hover tablecontentcss table-striped" id="reminder_table"> <thead> <tr>
                                        <th style="width:5%;">#</th>
                                        <th style="width:41%;">title</th>
                                        <th style="width:15%;">Created By</th>
                                        <th style="width:15%;">Date</th>
                                        <th style="width:13%;">Time</th>
                                        <th style="width:11%;">Action</th>
                                    </tr> </thead> <tbody id="reminder-table-body">`;

                        let num = res.data.st;
                        $.each(res.data.data, function (k, v) {
                            tc += '<tr id="row-'+v.row+'">';
                            tc += '<td>'+num+'</td>';
                            tc += '<td class="td-title showReminder cursor-pointer text-primary" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">'+sliceText(v.title, 60)+'</td>';
                            tc += '<td class="td-createdBy">'+v.createdBy+'</td>';
                            tc += '<td class="td-fullTitle d-none">'+v.title+'</td>';
                            tc += '<td class="td-note d-none">'+(v.note !== null ? v.note : '-' )+'</td>';
                            tc += '<td class="td-date">'+v.date+'</td>';
                            tc += '<td class="td-time">'+v.time+'</td>';
                            tc += '<td>';
                            if(res.data.permission.edit == true && $('.reminderbtn').length){
                                tc += '<label onclick="setFocusOnFirstInput(\'#reminderEditModal\')" class="editReminderTable cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'"> <span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>';
                            }
                            
                            if(res.data.permission.view == true){
                                tc += '<label class="showReminder cursor-pointer clickOnRmnr" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">';
                                tc += '<span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>'
                            }

                            tc += '</td></tr>';
                            num++;
                        });
                        tc += '</tbody>';
                        if(res.data.morePage){
                            tc += makePagination(res.data.button);
                        }
                        tc += '</table>';
                        $('#reminderTable').html(tc);
                        var prevLink = $('#reminder_table a.prev');
                        var nextLink = $('#reminder_table a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }

                    requestPage = 1;
                    reminderAjaxProgress = false;

                    let idNeedToClick = localStorage.getItem('dashReminderClick');
                    if(idNeedToClick){
                        $('#'+idNeedToClick).find('.clickOnRmnr').click();
                        localStorage.removeItem('dashReminderClick');
                    }
                },
                error: function (xhr, status, error) {
                    reminderAjaxProgress = false;
                    console.log(error);
                },
            });
        }
    }

    //edit popup data
    $(document).on('click', '.editNA', function () {
        $('#validationMessages').empty();
        $('.modal-title').html('Edit Notice & Appreciation');
        formValidationReset('#new-notice-form');

        var id = $(this).data('item-id');
        var docId = $(this).data('doc-id');
        var projectId = $(this).data('item-project-id');
        $.ajax({
            url: APP_URL+'/notice-appreciation/' + id + '/edit',
            type: 'GET',
            data: { id: id,projectId :projectId},
            success: function (res) {
                $('#new-notice-form').attr('action', '/notice-appreciation/' + id + '/update');
                $('#noticeAndAppDescription').val(res.noticeAndAppData.description);
                if (res.noticeAndAppData.type == 1) {
                    $('#appreciation').prop('checked', true);
                } else if (res.noticeAndAppData.type == 2) {
                    $('#notice').prop('checked', true);
                }

                var option = new Option(res.noticeAndAppData.user.name,res.empId, true, true);
                $('#noticeEmp').html(option).prop('disabled', true);

                if(res.noticeAndAppData.document_id != null){
                    $('.selectedFileDiv').show();
                    $('#uploadedFileName')
                    .data('doc-id', docId)
                    .text(res.noticeAndAppData.documents.original_name);
                }else{
                    $('.selectedFileDiv').hide();
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
        // Show the modal
        $('#noticeModal').modal('show');
    });

    //edit reminder popup data
    $(document).on('click', '.editReminderTable', function () {
        $('#edit-reminder-form').validate().resetForm();
        $('#edit-reminder-form .error').removeClass('error');
        $('#validationMessages').empty();

        $('.added-reminder-row-for-count').remove();
        var id = $(this).data('item-id');
        var projectId = $(this).data('item-project-id');
        $.ajax({
            url: APP_URL+'/' + projectId + '/project-reminder/' + id + '/edit',
            type: 'GET',
            data: { id: id, project_id: projectId },
            success: function (response) {
                $('.modal-title').html('Edit Reminder');
                $('.reminder_title').val(response.reminderData.title);
                $('.reminder_note').val(response.reminderData.note);
                $('#reminderEditID').val(response.reminderData.id);
                $('.editreminderTimePicker').timepicker({showPeriodLabels: false,});
                // Split the reminder datetime into date and time
                var [date, time] = response.reminderData.reminder.split(' ');
                // Set the date and time values
                $('.reminder_date').val(date);
                $('.editreminderTimePicker').val(time);
               
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
        // Show the modal
        $('#reminderEditModal').modal('show');
    });

    //save edited reminder data
    $(document).on('click', '#saveEditReminder', function () {
        $('#edit-reminder-form').validate({
            rules:{
                old_reminder_date: { date: true }, 
                old_reminder_title: { minlength: 3, maxlength: 50 },
                old_reminder_note: { minlength: 2, maxlength: 65530 }
            },
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
            messages: {
                old_reminder_title: { required: 'The title field is required' },
                old_reminder_date: { required: 'The Date field is required' },
                old_approved_date: { required: 'The Approved date field is required' }
            },
        }); 

        if($('#edit-reminder-form').valid()) {
            disableSubmitBtn('#saveEditReminder');
            $('#edit-reminder-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    setTimeout(function () {
                        $('.added-reminder-row-for-count').remove();
                        $('#reminderEditModal').modal('hide');
                    }, 250);
                    reminderData();
                    dashboard();
                    enableSubmitBtn('#saveEditReminder');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveEditReminder');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //view reminder details page
    $(document).on('click', '.showReminder', function () {
        var title = $(this).closest('tr').find('.td-fullTitle').text();
        var note = $(this).closest('tr').find('.td-note').html();
        var date = $(this).closest('tr').find('.td-date').text();
        var time = $(this).closest('tr').find('.td-time').text();
        var createdBy = $(this).closest('tr').find('.td-createdBy').text();
        $('.showDataTitle').empty();
        $(document).find('.offcanvas #showDataBody').empty();
        $('.showDataTitle').text('Reminder Details');
        $(document).find('.offcanvas #showDataBody').html(
            `<tr> <th>Created By:</th> <td>${createdBy}</td> </tr>
            <tr> <th>Project:</th> <td>${projectName}</td> </tr>
            <tr> <th>Title:</th> <td>${title}</td> </tr>
            <tr> <th>Note:</th> <td>${note}</td> </tr>
            <tr> <th>Date:</th> <td>${date}</td> </tr>
            <tr> <th>Hours:</th> <td>${time}</td> </tr>`
        );
        $('[data-bs-toggle="tooltip"]').tooltip();
    });

    $(document).on('click' , '.addCrBtn', function(){
        $('.modal-title').html('Add Change Request');
        $('.newAddedRow').remove();
        // Set the value of the date input field
        document.getElementById('approved_date').value = currentDate;
    });

    $(document).on('click' , '.editCR', function(){
        $('.newAddedRow').remove();
    });

    //save add cr form
    $(document).on('click', '#saveCR', function () {
        $.validator.addMethod("twoDecimal", function(value, element) {
            return /^(\d+(\.\d{0,2})?)?$/.test(value);
        }, "Maximum two digits allowed after the decimal point.");

        $('#new-cr-form').validate({
            rules:{
                hours: { number: true, twoDecimal: true },
                approved_date: { date: true },
                title: { minlength: 3, maxlength: 190 }
            },
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
                } else {
                    $(error).insertAfter($(element));
                }
            },
            messages: {
                hours: { required: 'The Hours field is required' },
                title: { required: 'The Title field is required' },
                approved_by: { required: 'The Approved By field is required' },
                approved_date: { required: 'The Approved date field is required' },
                delivery_date: { required: 'The Delivery date field is required'},
                'approval_attachment[attachment_note]': { required: 'This field is required' },
                'approval_attachment[file]': { required: 'This field is required' },
                'cr_attachment[0][file]': { required: 'This field is required' },
                'cr_attachment[0][attachment_note]': { required: 'This field is required' }
            },
        }); 
    
        if($('#new-cr-form').valid()) {
            disableSubmitBtn('#saveCR');
            $('#new-cr-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-cr-form').validate().resetForm();
                    document.getElementById('approved_date').value = currentDate;
                    $('.newAddedRow').remove();
                    $('#largeModal').modal('hide');
                    crData();
                    dashboard();
                    $('#decTabDeliveryDate').text(response.deliveryDate);
                    documentData();
                    enableSubmitBtn('#saveCR');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveCR');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //save add task form
    $(document).on('click', '#saveTask', function () {
        $('#new-task-form').validate({
            rules:{
                task_title: { minlength: 2, maxlength: 190 },
                task_details: { minlength: 2, maxlength: 65530 }
            },
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
            messages: {
                task_title: { required: 'The title field is required' },
                task_status: { required: 'The status field is required' },
                task_projectname: { required: 'The Project field is required' },
                task_time: { required: 'The Time field is required' },
                task_details: { required: 'The Details field is required' }
            },
        });

        if($('#new-task-form').valid()) {
            disableSubmitBtn('#saveTask');
            $('#new-task-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-task-form').validate().resetForm();
                    $('#taskModal').modal('hide');
                    task();
                    dashboardTask();
                    $('.select2').trigger('change');
                    enableSubmitBtn('#saveTask');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveTask');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldElement = $("[id='" + field + "']");
                            fieldElement.next('div').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });


    //save reminder formData
    $(document).on('click', '#saveReminder, #saveAndAddmoreReminder', function () {
        var clickedButtonId = $(this).attr('id');
        $('#new-reminder-form').validate({
            rules:{
                reminder_title: { minlength: 2, maxlength: 190 },
                reminder_date: { date: true },
                reminder_hours: { required: true },
                reminder_note: { minlength: 2, maxlength: 65530 }
            },

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

            messages: {
                reminder_title: { required: 'The title field is required' },
                reminder_date: { required: 'The Date field is required' },
                reminder_note: { required: 'The Note field is required' },
                approved_date: { required: 'The Approved date field is required' },
                note: { required: 'The note field is required' }
            },
        });

        if ($('#new-reminder-form').valid()) {
            disableSubmitBtn('#saveReminder');
            $('#new-reminder-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-reminder-form').validate().resetForm();
                    $('.added-reminder-row-for-count').remove();
                    $('.newReminderRow').remove();
                    if (clickedButtonId == 'saveReminder') {
                        $('#reminderModal').modal('hide');
                    }
                    $('#decTabDeliveryDate').text(response.deliveryDate);
                    reminderData();
                    dashboard();
                    enableSubmitBtn('#saveReminder');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveReminder');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldElement = $("[id='" + field + "']");
                            fieldElement.next('div').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                        errorMessage(message);
                    }
                },
            });
        }
    });

    $(document).on('click', '.addNewComment', function(){
        $('.modal-title').html('Add Comment');
        $('#comment').summernote({
            height: 200,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'clear']],
                ['para', ['ul', 'ol']],
                ['color', ['color']],
                ['view', ['codeview']]
            ],
            callbacks: {
                onChange: function(contents, $editable) {
                    if(!$('#comment').summernote('isEmpty')){
                        $('#comment-error').hide()
                    }
                },
                // callback for pasting text only (no formatting)
                onPaste: function (e) {
                    var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                    e.preventDefault();
                    bufferText = bufferText.replace(/\r?\n/g, '<br>');
                    document.execCommand('insertHtml', false, bufferText);
                }
            }
        });

        $.validator.addMethod('summerNoteRequiredComment', function (value, element) {
            return !$(element).summernote('isEmpty');
        }, 'Description field is required');

        $('#new-comment-form').validate({
            ignore: [],
            rules:{
                title: { required: true, minlength: 2, maxlength: 190 },
                comment: { summerNoteRequiredComment: true, minlength: 2, maxlength: 65530 }
            },
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
                    $(error).insertAfter($(element).parent()); // radio/checkbox
                } else if(element.attr('name') == 'comment') {
                    $(error).insertAfter($(element).parents('.comment-description').find('#comment-error')); // for description error message
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element)); // default
                }
            },
            messages: {
                title: { required: 'Comment title is required field' }, 
                comment: { required: 'Comment description is required field' }
            },
        });

        $('#comment').summernote('reset');
        $('#new-comment-form').validate().resetForm();
        $('#comment-error').text('');
    });

    //below functionality is for validations and save the CR form
    var newCommentAdd = false;
    $(document).on('click', '#saveComment', function () {
        if($('#new-comment-form').valid()) {
            $('#new-comment-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-comment-form').validate().resetForm();
                    $('#commentmodal').modal('hide');
                    newCommentAdd = true;
                    commentTabData();
                    enableSubmitBtn('#saveComment');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveComment');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, "-");
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //below functionality is for validations and save the Escalation form
    $(document).on('click', '#saveEsc', function () {
        $('#new-escalation-form').validate({
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
            messages: {
                title: { required: 'title field is required' },
                details: { required: 'details field is required' },
                status: { required: 'status field is required' }
            },
        });
        if($('#new-escalation-form').valid()) {
            disableSubmitBtn('#saveEsc');
            $('#new-escalation-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-escalation-form').validate().resetForm();
                    $('#EscalationModal').modal('hide');
                    escalationChannel();
                    enableSubmitBtn('#saveEsc');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveEsc');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldElement = $("[id='" + field + "']");
                            fieldElement.next('div').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }

    });

    //below functionality is for validations and save the Doc form 
    $(document).on('click', '#saveDoc', function () {
        $('#new-doc-form').validate({
            rules: {
                'attachment[][attachment_note]': {
                  required: true,
                  minlength: 3,
                  maxlength: 190,
                }
            },

            highlight: function(element, errorClass, validClass) {
                $(element).addClass(errorClass).removeClass(validClass);
                $(element).parent('div').addClass('input-error').removeClass(validClass);
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).removeClass(errorClass).addClass(validClass);
                $(element).parent('div').removeClass('input-error').addClass(validClass);
            },
            errorPlacement: function (error, element) {
                if (element.attr('name') === 'attachment[1][type]') {
                    error.appendTo($('.error-message'));
                }else if ($(element).parent('.input-group').length) {
                    $(error).insertAfter($(element).parent());      // radio/checkbox
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
        }); 
    
        if($('#new-doc-form').valid()) {
            disableSubmitBtn('#saveDoc');
            $('#new-doc-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-doc-form').validate().resetForm();
                    $('#added-new-document').html('');
                    $('#new-doc-form').find('.changeType').attr('name', `attachment[0][file]`);
                    $('#new-doc-form').find('.changeType').attr('type', `file`);
                    $('#new-doc-form').find('.attachmentLabel').html('Attachment file'+' <span class="text-danger">*</span>');
                    $('#documentModal').modal('hide');
                    documentData();
                    enableSubmitBtn('#saveDoc');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveDoc');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    // Validation for document edit
    $(document).on('click', '#updateDoc', function (e) {
        e.preventDefault();
        $.validator.addMethod('checkUrlOrFileRequired', function (value, element) {
            if($(element).attr('type') == 'file'){
                if($('#uploadedDocumentId').length > 0){
                    return true;
                }else{
                    if($("#updateDocForm input[name='attachment[0][file]']").val() == ''){
                        return false;
                    }
                }
            }else{
                if($(document).find('#updateDocForm input[name="attachment[0][url]"]').val() == ''){
                    return false;
                }
            }
            return true;
        }, 'This field is required.');

        $('#updateDocForm').validate({
            ignore: ":hidden",
            rules: {
                attachmentType:{
                    required: true,
                },
                note: {
                    required: true,
                    minlength: 3,
                    maxlength: 190,
                },
                'attachment[0][url]':{
                    checkUrlOrFileRequired: true,
                },
                'attachment[0][file]':{
                    checkUrlOrFileRequired: true,
                },
            },
            highlight: function(element, errorClass, validClass) {
                $(element).addClass(errorClass).removeClass(validClass);
                $(element).parent('div').addClass('input-error').removeClass(validClass);
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).removeClass(errorClass).addClass(validClass);
                $(element).parent('div').removeClass('input-error').addClass(validClass);
            },
            errorPlacement: function (error, element) {
                if (element.attr('name') === 'attachment[0][type]') {
                    error.appendTo($('.error-message'));
                }else if ($(element).parent('.input-group').length) {
                    $(error).insertAfter($(element).parent());      // radio/checkbox
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
        });

        if ($('#updateDocForm').valid()) {
            $('#updateDocForm').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#updateDocForm').validate().resetForm();
                    $('#editDocumentModal').modal('hide');
                    documentData();
                    successMessage(response.message);
                },
                error: function (xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, "-");
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //below functionality is for validations and save the Doc form 
    $(document).on('click', '#saveImportedTask', function () {
        $('#import-task-form').validate({
            rules: {
                attachment: {
                  required: true,
                  extension: "csv"
                }
            },
            messages: {
                attachment: { required: "Please upload CSV file to import task.", extension: "The attachment must be a file of type: CSV" },
            },
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
    
        if($('#import-task-form').valid()) {
            disableSubmitBtn('#saveImportedTask');
            $('#import-task-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#import-task-form').validate().resetForm();
                    $('#taskImportModal').modal('hide');
                    task();
                    dashboardTask();
                    enableSubmitBtn('#saveImportedTask');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveImportedTask');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        let errorToShow = '';
                        $.each(errors, function (field, error) {
                            errorToShow = errorToShow+' '+'<p style="margin-bottom: 0;">'+error[0]+'</p>';
                        });
                        $('#attachment-error').html(errorToShow);
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //dashboard table attachment row
    function attachmentRow(item) {
        var newRow = $(
            `<tr>
                <th>File Name:</th>
                <td>
                    <a title="Click to download '${ item.original_name }'" data-doc-id="${item.documentId}" class="text-decoration-underline cursor-pointer text-primary downloadDoc">${item.original_name}</a>
                    <label data-bs-toggle="tooltip" data-bs-offset="0,4" data-bs-placement="top" data-bs-html="true" data-bs-original-title="<i class='bx bx-bell bx-xs' ></i> <span>${item.note}</span>">
                        <span class="text-muted font-bold"><i class='bx bxs-info-circle'></i></span>
                    </label>
                </td>
            </tr>
            <tr>
                <th>File Show to client:</th>
                <td>${item.show_to_client === 0 ? "No" : "Yes"}</td>
            </tr>`
        );
        return newRow;
    }

    // Edit Cr Row
    function EditCrRow(id, data) {
        var newRow = $(
            '<div class="row editRow">' +
                '<div class="mb-3 col-sm-12 col-md-4">' +
                    '<input class="form-control" type="hidden" name="editId" value="'+ id +'" required>' +
                    '<label class="form-label">Name <span class="text-danger">*</span></label>' +
                    '<input class="form-control" type="text" name="old_cr_attachment['+data.id+'][attachment_note]" placeholder="Enter Name" value="'+data.note+'" id="old_cr_attachment.'+data.id+'.attachment_note" required>' +
                    '<div class="error-message text-danger" id="edit-old_cr_attachment-'+ data.id +'-attachment_note-error"></div> '+"</div>" +
                    '<input type="hidden" name="old_cr_attachment['+data.id+'][file_id]" value="'+data.id+'">'+
                '<div class="mb-3 col-sm-12 col-md-5">' +
                    '<label class="form-label">Attachments <span class="text-danger">*</span></label>' +
                    '<input class="form-control" type="file" name="old_cr_attachment['+data.id+'][file]" value="" id="old_cr_attachment.'+data.id+'.file">'+
                    '<label class="form-label text-muted pl-3">Selected File: '+data.original_name+"</label>" +
                    '<div class="error-message text-danger" id="edit-old_cr_attachment-'+data.id+'-file-error"></div> ' +"</div>" +
                // '<div class="col-sm-12 col-md-3 form-checkbox" style="margin-top: 2.3rem;">' +
                //     '<input class="form-check-input" type="checkbox" value="1" id="old_cr_attachment['+data.id+'][show_to_client]" name="old_cr_attachment['+data.id+'][show_to_client]" '+(data.show_to_client ? "checked" : "") + ">" +
                //     '<label class="form-label" for="old_cr_attachment['+data.id+'][show_to_client]" >&nbsp;Show To Client</label>' +
                // "</div>" +
                '<div class="mt-2 col-sm-12 col-md-1">' +
                "<label>&nbsp;</label>" +
                "</div>" +
            "</div>"
        );
        return newRow;
    }

    //below functionality is for new row in the cr form -- Append row for add more CR ATTACHMENTS
    function createNewRow() {
        var currentId = id;
        var newRow = $(
            `<div class="row newAddedRow">
                <div class="mb-3 col-sm-12 col-md-4">
                    <label class="form-label">Name</label>
                    <input class="form-control" type="text" name="cr_attachment[${currentId}][attachment_note]" placeholder="Enter Name" required>
                    <div class="error-message text-danger" id="cr_attachment.${currentId}.attachment_note"></div>
                    <div class="edit-error-message text-danger" id="cr_attachment-${currentId}-attachment_note-error"></div>
                    <input type="hidden" name="cr_attachment[${currentId}][file_id]" value="">
                </div>
                <div class="mb-3 col-sm-12 col-md-5">
                    <label class="form-label">Attachments</label>
                    <input class="form-control" type="file" name="cr_attachment[${currentId}][file]" required>
                    <div class="error-message text-danger" id="cr_attachment.${currentId}.file"></div>
                    <div class="error-message text-danger" id="cr_attachment-${currentId}-file-error"></div>
                    <div class="error-message text-danger" id="edit-cr_attachment-${currentId}-file-error"></div>
                </div>
                <div class="col-sm-12 col-md-3 form-checkbox" style="margin-top: 2.3rem;">
                    
                    <div>
                        <button type="button" class="float-start btn p-0 ps-2 remove-new-attachment"><i class="text-danger bx bx-trash me-2"></i></button>
                    </div>
                </div>
            </div>`
        );
        // <div class="float-start">
        //     <input class="form-check-input" type="checkbox" value="1" id="cr_attachment[${currentId}][show_to_client]" name="cr_attachment[${currentId}][show_to_client]">
        //     <label class="form-label" for="cr_attachment[${currentId}][show_to_client]">Show To Client</label>
        // </div>

        id++;
        return newRow;
    }

    //new row add and set the limits of the "add more" button
    $(document).on('click', '.add-new-attachment', function () {
        var totalRows = $(this).closest('.row').find('#added-new-row .row').length;
        if (totalRows < 5) {
            $('#added-new-row').append(createNewRow());
        } else {
            $('.cancelButton').hide();
            alert('Alert!','Maximum limit of 5 rows reached.','text-danger');

        }
    });

    //new row add and set the limits of the "add more" button in edit CR
    $(document).on('click', '.add-new-edit-attachment', function () {
        var parentRow = $(this).closest('.row');
        var totalRows = parentRow.find('.newAddedRow').length;
        if (totalRows < 5) {
            $('#edit-new-row').append(createNewRow());
        } else {
            $('.cancelButton').hide();
            alert('Alert!','Maximum limit of 5 rows reached.','text-danger');
        }
    });

    //below functionality is removing the row
    $(document).on('click', '.remove-new-attachment', function () {
        $(this).closest('.row').remove();
    });

    /*below functionality is for add new row on Addmore btn clickevent in the document form*/
    function createNewDocRow() {
        var currentId = id;
        var newRow = `
            <div class="newAdded mb-2">
                <span class="currentId" style="display:none;" data-current-id="${currentId}"></span>
                <div class="col-sm-12 col-md-12 d-flex align-items-center">
                    <label for="document_${currentId}_attachment_file" class="form-label">Attachment <span class="text-danger">*</span></label>
                    <div class="d-flex justify-content-evenly ms-3">
                        <div class="form-check">
                            <input name="attachment[${currentId}][type]" class="form-check-input cursor-pointer attachmentType" type="radio" value="1" id="document_${currentId}_attachment_file" checked>
                            <label class="form-check-label cursor-pointer" for="document_${currentId}_attachment_file">Physical</label>
                        </div>
                        <div class="form-check cursor-pointer" style="margin-left: 1rem;">
                            <input name="attachment[${currentId}][type]" class="form-check-input cursor-pointer attachmentType" type="radio" value="2" id="document_${currentId}_attachment_link">
                            <label class="form-check-label cursor-pointer" for="document_${currentId}_attachment_link">Online</label>
                        </div>
                    </div>
                    <div class="error-message text-danger" id="attachment-${currentId}-file-error"></div>
                    <div class="ms-auto">
                        <button type="button" class="btn remove-new-document"><i class="text-danger bx bx-trash"></i></button>
                    </div>
                </div>
                <div class="row newaddedrow">
                    <div class="mb-3 col-sm-12 col-md-4">
                        <label class="form-label">Alias <span class="text-danger">*</span></label>
                        <input class="form-control" type="text" name="attachment[${currentId}][attachment_note]" placeholder="Enter Alias" required>
                        <div class="error-message text-danger" id="attachment-${currentId}-attachment_note-error"></div>
                    </div>
                    <div class="mb-3 col-sm-12 col-md-5">
                        <label class="form-label attachmentLabel">Attachment file <span class="text-danger">*</span></label>
                        <input class="form-control changeType" type="file" name="attachment[${currentId}][file]" required>
                        <div class="error-message text-danger" id="attachment-${currentId}-file-error"></div>
                    </div>
                    
                </div>
            </div>`;
            // <div class="col-sm-12 col-md-3 form-checkbox" style="margin-top: 2.3rem;">
            //     <input class="form-check-input" type="checkbox" value="1" id="attachment${currentId}" name="attachment[${currentId}][show_to_client]">
            //     <label class="form-label" for="attachment${currentId}">Show To Client</label>
            // </div>
        id++;
        return newRow;
    }

    //add new document row and set the limits of the "add more" button
    $(document).on('click', '.add-new-document', function () {
        var totalRows = $('#added-new-document .newAdded ').length;
        if (totalRows < 5) {
            $('#added-new-document').append(createNewDocRow());
        } else {
            $('.cancelButton').hide();
            alert('Alert!','Maximum limit of 5 rows reached.','text-danger');
        }
    });

    //below functionality is removing the row from document form
    $(document).on('click', '.remove-new-document', function () {
        $(this).closest('.newAdded').remove();
    });

    // TEMPORARY HIDDEN WILL CHANGE LATER
    // Below functionality is for showing project users details
    // $(document).on('click', '.projectUserDetails', function () {
    //     var fullname = $(this).data('fullname');
    //     var email = $(this).data('email');
    //     var designation = $(this).data('designation');
    //     var newSrc = $(this).data('profileimg');

    //     $('#fullname').text('Name: ' + fullname);
    //     $('#email').text('Email: ' + email);
    //     $('#designation').text('Designation: ' + designation);
    //     $('#channelUserImage').attr('src', newSrc);

    //     // Show the modal
    //     $('#ProjectUserDetailsModal').modal('show');
    // });

    //save add timesheet form
    var availTimeTotal = 0;
    $(document).on('click', '#saveTimesheet', function () {
        // validate total entry time should not exceeds the available time
        if(!totalTimeValidate()){
            return false;
        }

        if($('#new-timesheet-form').valid()) {
            disableSubmitBtn('#saveTimesheet');
            $('#new-timesheet-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text("");
                },
                success: function (response) {
                    if(response.status == 'error'){
                        $('.billable-error').remove();
                        $.each(response.timesheetWithError, function(index, value) {
                            if (value.hasOwnProperty('availTime')) { // time entry
                                $('#appendMainBlock_'+index).prepend('<p class="text-danger billable-error fw-semibold">Billable hours cannot be submitted in this project as there are only '+ value.availTime +' hours available.</p>');
                            }
                            if (value.hasOwnProperty('project')) { // project
                                $('#project-error_'+index).text(value.project);
                            }
                            if (value.hasOwnProperty('projectTask')) { // project task
                                $('#projectTask-error_'+index).text(value.projectTask);
                            }
                            if (value.hasOwnProperty('times')) { // project billing type radio button
                                $('#time-error_'+index).text(value.times);
                            }
                            if (value.hasOwnProperty('is_billable')) { // project billing type radio button
                                $('#is_billable-error_'+index).text(value.is_billable);
                            }
                            if (value.hasOwnProperty('description')) { // description
                                $('#description-error_'+index).text(value.description);
                            }
                        });

                        $('#AppToast').toast({ autohide: false });
                        errorMessage('Correct the error on the timesheets and resubmit them.');
                    }else{
                        $('#new-timesheet-form').validate().resetForm();
                        $('.nonBillableTypeOption').empty();
                        $('#timesheetModal').modal("hide");
                        $('.select2').trigger('change');
                        getTimesheetTableData();
                        $('#timesheettab').text('Timesheet (' + response.count + ')');
                        successMessage(response.message);
                    }
                    enableSubmitBtn('#saveTimesheet');
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveTimesheet');
                    if (xhr.status === 422) {
                        if(xhr.responseJSON.status == 'error' && xhr.responseJSON.message){
                            errorMessage(xhr.responseJSON.message);
                        }else{
                            var errors = xhr.responseJSON.errors;
                            var errorMsgs = '';
                            $.each(errors, function (field, error) {
                                var errorMsg = error.join(' ');
                                $('#extraTimeEntryError').text(errorMsg);
                            });
                        }
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click', '#updateTimesheet', function () {
        $.validator.addMethod('summerNoteRequired', function (value, element) {
            var content = $(element).summernote('code').trim();
            var isEmpty = content === '' || content === '<p><br></p>' || content === '<br>' || content === '<div><br></div>' || content.replace(/<[^>]*>/g, '').trim() === '';
            
            if(isEmpty){
                return false;
            }
            return true;
        }, 'Description field is required');

        $('#edit-timesheet-form').validate({
            ignore: [],
            rules:{
                editProjectName: { required: true },
                editProjectTask: { required: true },
                editDescription: { summerNoteRequired: true }
            },
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
                } else if(element.attr('name') == 'editDescription') {
                    $(error).insertBefore($('#editDescription-error')); // for description error message
                } else if ($(element).hasClass('select2-hidden-accessible')) {
                    $(error).insertAfter($(element).next('span'));  // select2
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
            messages: {
                editProjectName: { required: 'Project field is required' },
                editProjectTask: { required: 'The Task field is required' },
                editDescription: { required: 'The Description field is required' }
            },
        }); 

        if($('#edit-timesheet-form').valid()) {
            disableSubmitBtn('#updateTimesheet');
            $('#edit-timesheet-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text("");
                },
                success: function (response) {
                    $('#edit-timesheet-form').validate().resetForm();
                    $('.nonBillableTypeOption').empty();
                    $('#editTimesheetModal').modal("hide");
                    getTimesheetTableData();
                    enableSubmitBtn('#updateTimesheet');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    console.log('error');
                    enableSubmitBtn('#updateTimesheet');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, "-");
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click', '.timesheetFromButton', function(){
        $.ajax({
            url: APP_URL+'/timesheet/create',
            type: 'GET',
            data: { onlyForm: true, projectId: projectId, },
            success: function (response) {
                if(response.data){
                    $('.modal-title').html('Add Timesheet');
                    $('#project-timesheet-model').html(response.data);
                    $('.add-new-timesheet').remove();
                    $('#description_0').summernote({
                        height: 200,
                        toolbar: [
                            ['style', ['style']],
                            ['font', ['bold', 'italic', 'underline', 'clear']],
                            ['para', ['ul', 'ol']],
                            ['color', ['color']],
                            ['view', ['codeview']]
                        ],
                        callbacks: {
                            onChange: function(contents, $editable) {
                                if(!$('#description').summernote('isEmpty')){
                                    $('#description-error').hide()
                                }
                            },
                            // callback for pasting text only (no formatting)
                            onPaste: function (e) {
                                var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                                e.preventDefault();
                                bufferText = bufferText.replace(/\r?\n/g, '<br>');
                                document.execCommand('insertHtml', false, bufferText);
                            }
                        }
                    });

                    $('#projectTask_0').select2({
                        dropdownParent: $("#timesheetModal .modal-body"), 
                    });

                    // if client is ips internal then direct render Non Billing Type dropdown as select2
                    if($('#billableOption_0').length == 0){
                        $('#nonBillingValue_0').select2({
                            dropdownParent: $("#timesheetModal .modal-body"), 
                        });
                    }

                    availTimeTotal = $(document).find('.abbHours').text();
                    totalTimeValidate();

                    initializeTimepicker($('#EntryHrs_0'), setTimeHrs, setTimeHH, setTimeMM);    // initialize timepicker and min-max select time change
                    // timeEntryTimePickerChange();
                    $('#timesheetModal').modal('show');

                    $.validator.addMethod('notGreaterThanAvailableTime', function(value, element) {
                        let currentTimeArray = value.split(':');
                        let currentTimeMinutes = parseInt(currentTimeArray[0]) * 60 + parseInt(currentTimeArray[1]);
                        let  availableTimeMax = setTimeHrs.split(':');
                        let availableTimeMinutes = parseInt(availableTimeMax[0]) * 60 + parseInt(availableTimeMax[1]);
                        return (currentTimeMinutes <= availableTimeMinutes);
                    }, 'Time entry should not exceed ' + setTimeHrs+' hours.');
            
                    $.validator.addMethod('summerNoteRequired', function (value, element) {
                        return !$(element).summernote('isEmpty');
                    }, 'Description field is required');
            
                    $.validator.addMethod('isZeroTime', function (value, element) {
                        return value == '00:00' ? false : true;
                    }, 'Enter valid time entry');
            
                    $('#new-timesheet-form').validate({
                        ignore: [],
                        rules:{
                            'project[]': { required: true },
                            'projectTask[]': { required: true },
                            'time[]': { isZeroTime: true, notGreaterThanAvailableTime : true, required: true },
                            'description[]': { summerNoteRequired: true },
                            'nonBillingValue[]': { required: true }
                        },
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
                                $(error).insertAfter($(element).parent()); // radio/checkbox
                            } else if(element.attr('name') == 'description[]') {
                                $(error).insertBefore($(element).parents('.timesheet-block').find('.description-error')); // for description error message                
                            } else if ($(element).hasClass('select2-hidden-accessible')) {
                                $(error).insertAfter($(element).next('span'));  // select2
                            } else {
                                $(error).insertAfter($(element)); // default
                            }
                        },
                        messages: {
                            'project[]': { required: 'Project field is required' },
                            'projectTask[]': { required: 'Task field is required' },
                            'time[]': { required: 'Time field is required' },
                            'description[]': { required: 'Description field is required' }
                        },
                    });

                }else{
                    errorMessage('Something went wrong!');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    function initializeTimepicker(element, setTimeHrs, setTimeHH, setTimeMM) {
        $(element).timepicker({
            showPeriodLabels: false,
        });
        $(element).timepicker('setTime', setTimeHrs);
        $(element).timepicker('option', {
            maxTime: { hour: setTimeHH, minute: setTimeMM }
        });
        $('#extraTimeEntryError').text('');
    }
    
    function totalTimeValidate(){
        var totalFilledTime = 0;
        $('.EntryHrs').each(function(index, element) {
            var inputValue = $(element).val();
            if(isNaN(inputValue)){
                let  timeValue = inputValue.split(':');
                totalFilledTime += parseInt(timeValue[0]) * 60 + parseInt(timeValue[1]);
            }
        });
        
        let  avaiTimeValue = availTimeTotal.split(':');
        avaiTimeValue = parseInt(avaiTimeValue[0]) * 60 + parseInt(avaiTimeValue[1]);
        if(avaiTimeValue < totalFilledTime){
            $('#extraTimeEntryError').text('Your current total time entry is exceeds the available time.');
            return false;
        }else{
            $('#extraTimeEntryError').text('');
            return true;
        }
    }

    $(document).on('change', '.EntryHrs', function(){
        totalTimeValidate();
    })

    // function timeEntryTimePickerChange(){
    //     $('.EntryHrs').timepicker({showPeriodLabels: false,});
    //     var HHMM=$('.timeSlo').find(':selected').attr('data-timediff');
    //     if(HHMM != undefined){
    //         var HHMMArray=HHMM.split(':');
    //         $('.EntryHrs').timepicker('setTime',HHMM);
    //         $('.EntryHrs').timepicker('option', { maxTime: { hour: HHMMArray[0], minute: HHMMArray[1]} });
    //     }

    //     $(document).on('change','.timeSlot',function(){
    //         $('.EntryHrs').timepicker({showPeriodLabels: false,});
    //         var HHMM=$(this).find(':selected').attr('data-timediff');
    //         if(HHMM != undefined){          
    //             var HHMMArray=HHMM.split(":");               
    //             $('.EntryHrs').timepicker('setTime',HHMM);
    //             $('.EntryHrs').timepicker('option', { maxTime: { hour: HHMMArray[0], minute: HHMMArray[1]} });
    //         }
    //         $('#availableTime').val(HHMM);
    //     });

    //     $('.timeSlot').trigger('change');
    // }


    //notice and appreciation filter data
    $('#noticeUserFilter, #noticeType').select2();

    //N&A filter
    $('#noticeUserFilter, #noticeType').on('change', function(){
        getNoticeTableData();
    });

    $('#naFilterSearch').on('click', function(){
        disableSubmitBtn('#naFilterSearch');
        naDateFilter['startDate'] = $('#naFilterStartDate').val();
        naDateFilter['endDate'] = $('#naFilterEndtDate').val();
        getNoticeTableData();
    });

    // N&A index page filter dropdown change
    $('#naDurationFilter li').on('click', function(e){
        let selector = $(this).children();
        nafilterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');

        if(nafilterText == 'today' || nafilterText == 'week' || nafilterText == 'month'){
            $('#naStartDateBlock').hide();
            $('#naEndDateBlock').hide();
            $('#naFilterBlock').hide();
            getNoticeTableData();
        }else if(nafilterText == 'date'){
            $('#naStartDateBlock').show();
            $('#naEndDateBlock').show();
            $('#naFilterBlock').show();
        }
    });

    // Set min date for filter start date
    $(document).on('change', '#naFilterStartDate', function(){
        let startDate = $('#naFilterStartDate').val();
        if(startDate){
            let selectedDate = new Date(startDate);
            selectedDate = new Date(selectedDate.getTime() + ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#naFilterEndtDate').attr({'min': selectedDate});
        }else{
            $('#naFilterEndtDate').attr({'min': ''});
        }
    });

    // Set max date for filter end date
    $(document).on('change', '#naFilterEndtDate', function(){
        let endDate = $('#naFilterEndtDate').val();
        if(endDate){
            let selectedDate = new Date(endDate);
            selectedDate = new Date(selectedDate.getTime() - ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#naFilterStartDate').attr({'max': selectedDate});
        }else{
            $('#naFilterStartDate').attr({'max': ''});
        }
    });

    // Enable disable Timesheet filter button
    $('.date-input').on('change', function(e){
        if( $('#naFilterStartDate').val() || $('#naFilterEndtDate').val()){
            enableSubmitBtn('#naFilterSearch');
        }else{
            $('#naFilterSearch').attr('disabled', true);
        }
    });

    $('#naFilterSearch').on('click', function(){
        disableSubmitBtn('#naFilterSearch');
        naDateFilter['startDate'] = $('#naFilterStartDate').val();
        naDateFilter['endDate'] = $('#naFilterEndtDate').val();
        getNoticeTableData();
    });

    //ajax call of timesheet Tab
    var timesheetAjaxProgress = false;
    var approvePermission = false;
    function getTimesheetTableData(activeTabName = null)
    {
        if (!timesheetAjaxProgress) {
            timesheetAjaxProgress = true;
            // if( $('#timesheetPendingTableData').find('h6').length ){
            //     $('#timesheetPendingTableData h6').html('&nbsp;');
            // }
            let filterEncryptedEmp = $('#timesheetUserFilter').length ? $('#timesheetUserFilter').val() : null;
            let filterTimesheetType = $('#timesheetType').length ? $('#timesheetType').val() : null;
            let filterProjectTask = $('#proTaskFilter').length ? $('#proTaskFilter').val() : null;

            if(filterEncryptedEmp != '' || filterTimesheetType != '' || filterProjectTask != '' || filterText == 'today' || filterText == 'week' || filterText == 'month' || filterText == 'date' || filterText == 'all'){
                $('#resetBlock').show();
            }else{
                $('#resetBlock').hide();
            }
            

            // Adding loader to timesheet list table
            $('#timesheetPendingTableData, #timesheetApprovedTableData, #timesheetRejectedTableData').append(loading());

            $.ajax({
                url: APP_URL+'/timesheet/fetchData',
                type: "GET",
                data: {
                    page: requestPage,
                    filterText: filterText,
                    dateFilter: dateFilter,
                    filterEncryptedEmp: filterEncryptedEmp,
                    project: projectId,
                    statusName: activeTabName,
                    timesheetType: filterTimesheetType,
                    task : filterProjectTask,
                },
                success: function (res) {
                    approvePermission = res.approvePermission;
                    var opentimesheetDetails = $('#activeswitch').is(':checked') == true ? 'display: contents' : 'display: none;';

                    if(res.pendingData.timesheetHours){
                        $('.ttHours').text(res.pendingData.timesheetHours.project_total_hrs);
                        $('.tbHours').text(res.pendingData.timesheetHours.billable_hours);
                        $('.tnbHours').text(res.pendingData.timesheetHours.non_billable_hours);
                        $('#timesheetHours').removeClass('d-none');
                    }

                    if(activeTabName == null || activeTabName == 'pendingTimesheetTable') {
                        if(res.pendingData.total == 0){
                            $('#timesheetPendingTableData').html(tableNoData);
                            $('#pendingTimesheetCount').text('(0)');
                        }else{
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="pendingTimesheetTable"> <thead> <tr>`;
                            if(approvePermission == true){
                                tc += `<th width="" id="checkAllPending">
                                            <div class="form-check"> <input class="form-check-input" type="checkbox" value="" id="selectAllPending"> <label class="form-check-label" for="selectAllPending"></label> </div>
                                        </th>`;
                            }

                            tc += `<th width="18%">Project</th>
                                    <th width="7%">Type</th>
                                    <th width="30%">Task</th>
                                    <th width="15%">Employee</th>
                                    <th width="10%">Date</th>
                                    <th width="10%">Time</th>
                                    <th width="10%">Action</th>
                                </tr> </thead> <tbody id="pending-timesheet-table-body">`;

                            let totalTimeInSeconds = 0;
                            let num = res.pendingData.st;

                            $.each(res.pendingData.data, function (k, v) {
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');

                                tc += '<tr class="pendingEntry">';
                                if(approvePermission == true){
                                    tc += '<td class=""> <div class="form-check"> <input class="form-check-input pendingCheck" type="checkbox" value="'+v.id+'" id="pending-'+k+'"> <label class="form-check-label" for="pending-'+k+'"></label> </div> </td>';
                                }
                                tc += '<td class="td-project-name showTimesheet cursor-pointer text-primary" title="Show Timesheet" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'">'+v.project+'</td>';
                                tc += '<td class="" title="'+(v.billable == 1 ? 'Billable' : 'Non-Billable')+'">'+ (v.billable == 1 ? 'B' : 'NB') +'</td>';
                                tc += '<td class="tblDiscription text-wrap">' + sliceText(v.task, 60) + '</br> <span class="tblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-employee">'+v.emp+'</td>';
                                tc += '<td class="td-date">'+v.date+'</td>';
                                tc += '<td class="td-time">'+v.time+'</td>';
                                tc += '<td class="d-none td-title">'+v.task+'</td>';
                                tc += '<td class="d-none td-billable">'+v.billable+'</td>';
                                tc += '<td class="d-none td-billableType">'+v.billableType+'</td>';
                                tc += '<td class="d-none td-description">'+sanitizedString+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '<td>';
                                tc += '<label title="Show Timesheet" class="showTimesheet cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>';

                                if((res.pendingData.permission.delete == true || v.deletePermission == true) && $('.timesheetFromButton').length){
                                    tc += '<label title="Delete Timesheet" class="deleteTimesheet cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                                }
                                tc += '</td></tr>';
                                const timeParts = v.time.split(":");
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                const seconds = parseInt(timeParts[2], 10);
                                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                                totalTimeInSeconds += totalSeconds;
                                num++;
                            });

                            tc += '</tbody>';
                            const formattedTotalTime = secondsToHHMMSS(totalTimeInSeconds);
                            if(res.pendingData.morePage) { tc += makePagination(res.pendingData.button); }

                            tc += `<tfoot> <tr>`;

                            if(approvePermission == true){
                                tc += `<td colspan="5"> <div class="app-rej-sel-btn" style="display: none;">
                                            <a href="javascript:;" class="btn btn-sm btn-label-success" data-action="approve" id="approveSelected">Approve Selected</a>
                                            <a href="javascript:;" class="btn btn-sm btn-label-danger ms-1" data-action="reject" id="rejectSelected">Reject Selected</a>
                                        </div> </td>`;
                            }else{
                                tc += `<td colspan="4"></td>`;
                            }             
                            tc += `<td class="text-end"><b>Total :</b></td>
                                        <td><b>${formattedTotalTime}</b></td>
                                        <td></td>
                                    </tr> </tfoot> </table>`;
                            $('#timesheetPendingTableData').html(tc);
                            var prevLink = $('#pendingTimesheetTable a.prev');
                            var nextLink = $('#pendingTimesheetTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');

                            $('#pendingTimesheetCount').text('('+res.pendingData.total+')');
                        }
                    }

                    if(activeTabName == null || activeTabName == 'approvedTimesheetTable') {
                        if(res.approvedData.total == 0){
                            $('#timesheetApprovedTableData').html(tableNoData);
                            $('#approvedTimesheetCount').text('(0)');
                        }else{
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="approvedTimesheetTable"> <thead> <tr>
                                            <th width="18%">Project</th>
                                            <th width="7%">Type</th>
                                            <th width="30%">Task</th>
                                            <th width="15%">Employee</th>
                                            <th width="10%">Date</th>
                                            <th width="10%">Time</th>
                                            <th width="10%">Action</th>
                                        </tr> </thead> <tbody id="pending-timesheet-table-body">`;

                            let totalTimeInSeconds = 0;
                            let num = res.approvedData.st;

                            $.each(res.approvedData.data, function (k, v) {
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                tc += '<tr>';
                                tc += '<td class="td-project-name showTimesheet cursor-pointer text-primary" title="Show Timesheet" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'">'+v.project+'</td>';
                                tc += '<td class="" title="'+(v.billable == 1 ? 'Billable' : 'Non-Billable')+'">'+ (v.billable == 1 ? 'B' : 'NB') +'</td>';
                                tc += '<td class="tblDiscription text-wrap">' + sliceText(v.task, 60) + '</br> <span class="tblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-employee">'+v.emp+'</td>';
                                tc += '<td class="td-date">'+v.date+'</td>';
                                tc += '<td class="td-time">'+v.time+'</td>';
                                tc += '<td class="d-none td-title">'+v.task+'</td>';
                                tc += '<td class="d-none td-billable">'+v.billable+'</td>';
                                tc += '<td class="d-none td-billableType">'+v.billableType+'</td>';
                                tc += '<td class="d-none td-description">'+sanitizedString+'</td>';
                                tc += '<td class="d-none td-approveRejectBy">'+v.approveRejectBy+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '<td class="d-none td-status">Approved</td>';
                                tc += '<td>';
                                tc += '<label title="Show Timesheet" class="showTimesheet cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>';

                                if((res.approvedData.permission.delete == true || v.deletePermission == true) && $('.timesheetFromButton').length){
                                    tc += '<label title="Delete Timesheet" class="deleteTimesheet cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                                }
                                tc += '</td></tr>';
                                const timeParts = v.time.split(":");
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                const seconds = parseInt(timeParts[2], 10);
                                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                                totalTimeInSeconds += totalSeconds;
                                num++;
                            });

                            tc += '</tbody>';
                            const formattedTotalTime = secondsToHHMMSS(totalTimeInSeconds);
                            if(res.approvedData.morePage) { tc += makePagination(res.approvedData.button); }

                            tc += `<tfoot>
                                        <tr>
                                            <td colspan="4"></td>
                                            <td class="text-end"><b>Total :</b></td>
                                            <td><b>${formattedTotalTime}</b></td>
                                            <td></td>
                                        </tr>
                                    </tfoot>`;
                            tc += '</table>';
                            $('#timesheetApprovedTableData').html(tc);
                            var prevLink = $('#approvedTimesheetTable a.prev');
                            var nextLink = $('#approvedTimesheetTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                            $('#approvedTimesheetCount').text('('+res.approvedData.total+')');
                        }
                    }

                    if(activeTabName == null || activeTabName == 'rejectedTimesheetTable') {
                        if(res.rejectedData.total == 0){
                            $('#timesheetRejectedTableData').html(tableNoData);
                            $('#rejectedTimesheetCount').text('(0)');
                        }else{
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="rejectedTimesheetTable"> <thead> <tr>
                                            <th width="18%">Project</th>
                                            <th width="7%">Type</th>
                                            <th width="30%">Task</th>
                                            <th width="15%">Employee</th>
                                            <th width="10%">Date</th>
                                            <th width="10%">Time</th>
                                            <th width="10%">Action</th>
                                        </tr> </thead> <tbody id="rejected-timesheet-table-body">`;

                            let totalTimeInSeconds = 0;
                            let num = res.rejectedData.st;

                            $.each(res.rejectedData.data, function (k, v) {
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                tc += '<tr>';
                                tc += '<td class="td-project-name showTimesheet cursor-pointer text-primary" title="Show Timesheet" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'">'+v.project+'</td>';
                                tc += '<td class="" title="'+(v.billable == 1 ? 'Billable' : 'Non-Billable')+'">'+ (v.billable == 1 ? 'B' : 'NB') +'</td>';
                                tc += '<td class="tblDiscription text-wrap">' + sliceText(v.task, 60) + '</br> <span class="tblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-employee">'+v.emp+'</td>';
                                tc += '<td class="td-date">'+v.date+'</td>';
                                tc += '<td class="td-time">'+v.time+'</td>';
                                tc += '<td class="d-none td-title">'+v.task+'</td>';
                                tc += '<td class="d-none td-billable">'+v.billable+'</td>';
                                tc += '<td class="d-none td-billableType">'+v.billableType+'</td>';
                                tc += '<td class="d-none td-description">'+sanitizedString+'</td>';
                                tc += '<td class="d-none td-approveRejectBy">'+v.approveRejectBy+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '<td class="d-none td-status">Rejected</td>';
                                tc += '<td>';
                                tc += '<label title="Show Timesheet" class="showTimesheet cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>';

                                tc +=`<label title="Edit Timesheet" class="text-info cursor-pointer editTimesheet" data-item-id="${v.id}"> <i class="bx bx-edit-alt me-1"></i></label>`;

                                if((res.rejectedData.permission.delete == true || v.deletePermission == true) && $('.timesheetFromButton').length){
                                    tc += '<label title="Delete Timesheet" class="deleteTimesheet cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'"> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                                }
                                tc += '</td></tr>';
                                const timeParts = v.time.split(":");
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                const seconds = parseInt(timeParts[2], 10);
                                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                                totalTimeInSeconds += totalSeconds;
                                num++;
                            });

                            tc += '</tbody>';
                            const formattedTotalTime = secondsToHHMMSS(totalTimeInSeconds);
                            if(res.rejectedData.morePage) { tc += makePagination(res.rejectedData.button); }

                            tc += `<tfoot>
                                        <tr>
                                            <td colspan="4"></td>
                                            <td class="text-end"><b>Total :</b></td>
                                            <td><b>${formattedTotalTime}</b></td>
                                            <td></td>
                                        </tr>
                                    </tfoot>`;
                            tc += '</table>';
                            $('#timesheetRejectedTableData').html(tc);
                            var prevLink = $('#rejectedTimesheetTable a.prev');
                            var nextLink = $('#rejectedTimesheetTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                            $('#rejectedTimesheetCount').text('('+res.rejectedData.total+')');

                        }
                    }

                    $('#timesheetPendingTableData #loading, #timesheetApprovedTableData #loading, #timesheetRejectedTableData #loading').remove();
                    requestPage = 1;
                    timesheetAjaxProgress = false;


                    // Timesheet tab total count
                    // $('#timesheettab').text('Timesheet (' + res.pendingData.total + ')');
                },
                error: function (xhr, status, error) {
                    timesheetAjaxProgress = false;
                    console.log(error);
                },
            });
        }
    }

    $(document).on('click', '.editTimesheet', function(){
        var editEntryId = $(this).closest('label').data('item-id');
        $.ajax({
            url: APP_URL+'/timesheet/' + editEntryId + '/edit',
            type: 'GET',
            data: { editEntryId: editEntryId},
            success: function (res) {
                if(res.data){
                    $('.modal-title').html('Edit Timesheet');
                    $('#edit-timesheet-model').html(res.data);
                    $('#editTimesheetModal #editDescription').summernote({
                        height: 200,
                        toolbar: [
                            ['style', ['style']],
                            ['font', ['bold', 'italic', 'underline', 'clear']],
                            ['para', ['ul', 'ol']],
                            ['color', ['color']],
                            ['view', ['codeview']]
                        ],
                        callbacks: {
                            onChange: function(contents, $editable) {
                                if(!$('#editTimesheetModal #editDescription').summernote('isEmpty')){
                                    $('#editTimesheetModal #editDescription-error').hide()
                                }
                            },
                            // callback for pasting text only (no formatting)
                            onPaste: function (e) {
                                var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                                e.preventDefault();
                                bufferText = bufferText.replace(/\r?\n/g, '<br>');
                                document.execCommand('insertHtml', false, bufferText);
                            }
                        }
                    }).summernote('code', res.summernote);
                
                    $('#editTimesheetModal #editProjectTask, #editTimesheetModal #nonBillingValue, #editTimesheetModal #editProjectName').select2({
                        dropdownParent: $("#editTimesheetModal .modal-body"), 
                    });
                
                    // timeEntryTimePickerChange();    // initialize timepicker and min-max select time change
                    $('#editTimesheetModal').modal('show');

                }else{
                    errorMessage('Something went wrong!');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    $(document).on('change', '.editTimesheetType', function (){
        var selectedOption = $(this).val();
        if(selectedOption == 0){
            $(document).find('#edit-timesheet-model .nonBillableTypeOption').show();
        }else{
            $(document).find('#edit-timesheet-model .nonBillableTypeOption').hide();
        }
    });

    $(document).on('click', '#approveSelected, #rejectSelected', function(){
        var actionName = $(this).data('action');
        var entryIds = $('.pendingCheck:checked').map(function() {
            return $(this).val();
        }).get();

        let confirmText = 'Are you sure you want to '+$(this).text()+'?';
        alert('Alert!', confirmText, 'text-danger')
            .then(function(result) {
                if (result) {
                    timeheetApproveReject(actionName, entryIds);
                }
        });
    });

    function timeheetApproveReject(actionName, entryIds){
        var tdParent = $('.timesheet-approve-btn').closest("td");
        $("button", tdParent).prop("disabled", true);
        $.ajax({
            url: APP_URL+'/timesheet/approve/reject',
            type: 'POST',
            data: { actionName: actionName, entryIds: entryIds },
            success: function (response) {
                if(response.status == 'success'){
                    getTimesheetTableData();
                    successMessage(response.message);
                    $('.offcanvas').toggleClass('is-open');
                    $('.offcanvas .btn-close').click()
                }else{
                    errorMessage(response.message);
                    var tdParent = $('.timesheet-approve-btn').closest("td");
                    $("button", tdParent).prop("disabled", false);
                }
            },
            error: function (xhr, status, error) {
                console.log(error,xhr);
            },
        });
    }

    // Click event for individual checkboxes for timesheet pending entry
    $(document).on("click", ".pendingCheck", function() {
        var allChecked = $('.pendingCheck:checked').length === $('.pendingCheck').length;
        $('#selectAllPending').prop('checked', allChecked);
        showTimesheetApproveReject();
    });

    // Click event for "Select All" checkbox for timesheet pending entry
    $(document).on("click", "#selectAllPending", function() {
        var isChecked = $(this).prop('checked');
        $('.pendingCheck').prop('checked', isChecked);
        showTimesheetApproveReject();
    });

    function showTimesheetApproveReject(){
        if($('.pendingCheck:checked').length > 0){
            $('.app-rej-sel-btn').show();
        }else{
            $('.app-rej-sel-btn').hide();
        }
    }

    // Click event for individual checkboxes for Task pending entry
    $(document).on("click", ".completedCheck", function() {
        var allChecked = $('.completedCheck:checked').length === $('.completedCheck').length;
        $('#selectAllCompleted').prop('checked', allChecked);
        showTaskApproveReject();
    });

    // Click event for "Select All" checkbox for Task pending entry
    $(document).on("click", "#selectAllCompleted", function() {
        var isChecked = $(this).prop('checked');
        $('.completedCheck').prop('checked', isChecked);
        showTaskApproveReject();
    });

    function showTaskApproveReject(){
        if($('.completedCheck:checked').length > 0){
            $('.app-rej-sel-btn-footer').show();
        }else{
            $('.app-rej-sel-btn-footer').hide();
        }
    }

    $(document).on('click', '#completedSelected', function(){
        var actionName = $(this).data('action');
        var entryIds = $('.completedCheck:checked').map(function() {
            return $(this).val();
        }).get();

        let confirmText = 'Are you sure you want to '+$(this).text()+'?';
        alert('Alert!', confirmText, 'text-danger')
            .then(function(result) {
                if (result) {
                    taskCompleted(actionName, entryIds);
                }
        });
    });

    function taskCompleted(actionName, entryIds){
        $.ajax({
            url: APP_URL+'/task/completed',
            type: 'POST',
            data: { actionName: actionName, entryIds: entryIds },
            success: function (response) {
                if(response.status == 'success'){
                    task();
                    successMessage(response.message);
                }else{
                    errorMessage(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.log(error,xhr);
            },
        });
    }

    // ajax call for notice and appreciation Table data
    var noticeAjaxProgress = false;
    function getNoticeTableData() {
        if (!noticeAjaxProgress) {
            noticeAjaxProgress = true;
            if( $('#noticeTableData').find('h6').length ){
                $('#noticeTableData h6').html('&nbsp;');
            }
            $('#noticeTableData').append(loading());
            tableFilterData['userName'] = $('#noticeUserFilter').length ? $('#noticeUserFilter').val() : null;
            tableFilterData['type'] = $('#noticeType').length ? $('#noticeType').val() : null;
            tableFilterData['projects'] = projectId ? projectId : null;

            if(tableFilterData['userName'] != '' || tableFilterData['type'] != '' || nafilterText != ''){
                $('#resetAnBlock').show();
            }else{
                $('#resetAnBlock').hide();
            }

            $.ajax({
                url: APP_URL+'/notice-appreciation',
                type: 'GET',
                data: { page: requestPage,
                        tableFilterData: tableFilterData,
                        filterText: nafilterText,
                        dateFilter: naDateFilter
                        },
                success: function (res) {

                    // Update Notice and Apprication count in dashboard
                    if(res.noticeAndAppriciationCount){
                        $('.totalAppreciationDasboard').text(res.noticeAndAppriciationCount.appreciation ?? 0);
                        $('.totalNoticeDasboard').text(res.noticeAndAppriciationCount.notice ?? 0);
                    }

                    $('#noticesAppreciationTab').text("A&N (" + res.count + ")");
                    if(res.count == 0){
                        $('#noticeTableData').html(tableNoData);
                    }else{
                        let tc = `<table class="table tablecontentcss table-hover table-striped" id="noticeTable"><thead class="table-light"><tr>
                                <th style="width:5%;">No</th>
                                <th style="width:15%;">Employee</th>
                                <th style="width:15%;">Type</th>
                                <th style="width:45%;">Project</th>
                                <th style="width:15%;">Created At</th>
                                <th style="width:10%;">Action</th>
                                </tr></thead><tbody class="table-border-bottom-0" id="notice-table-body">`;

                        let num = res.data.st;
                        $.each(res.data.data, function (k, v) {
                            tc += '<tr>';
                            tc += '<td>'+num+'</td>';
                            tc += '<td class="td-employee-name">'+v.userName+'</td>';
                            tc += '<td class="d-none td-delete-permission">'+res.data.permission.delete+'</td>';
                            tc += '<td class="td-type"><span class="badge rounded-pill '+v.typeColor+'">'+v.type+'</span></td>';
                            tc += '<td class="td-project-name showNotices cursor-pointer text-primary" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'" title="Show Details" data-file-url="'+v.url+'">'+v.projectName+'</td>';
                            tc += '<td class="d-none td-description">'+v.fullDetail+'</td>';
                            tc += '<td class="d-none td-file">'+v.fileName+'</td>';
                            tc += '<td class="td-createdAt" title="'+v.createdAtTime+'">'+v.createdAt+'</td>';
                            tc += '<td class="d-none td-createdBy">'+v.cretedBy+'</td>';
                            tc += '<td>';
                            tc += '<label class="showNotices cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'" title="Show Details" data-file-url="'+v.url+'" data-doc-id="'+v.document_id+'">';
                            tc += '<span class="text-primary cursor"><i class="bx bx-show me-1"></i></span></label>';

                            if(res.data.permission.edit == true){
                                tc += '<label class="editNA cursor-pointer" title="Edit N&A" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'" data-doc-id="'+v.document_id+'">';
                                tc += '<span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>';
                            }

                            if(res.data.permission.delete == true && $('.noticeModalButton').length){
                                tc += '<label class="deleteNotice cursor-pointer" title="Delete N&A" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'">';
                                tc += '<span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                            }

                            tc += '</td></tr>';
                            num++;
                        });
                        tc += '</tbody>';
                        if(res.data.morePage){
                            tc += makePagination(res.data.button);
                        }
                        tc += '</table>';
                        $('#noticeTableData').html(tc);
                        var prevLink = $('#noticeTable a.prev');
                        var nextLink = $('#noticeTable a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }
                    requestPage = 1;
                    noticeAjaxProgress = false;
                    enableSubmitBtn('#naFilterSearch');
                },
                error: function (xhr, status, error) {
                    enableSubmitBtn('#naFilterSearch');
                    noticeAjaxProgress = false;
                    console.log(error);
                },
            });
        }
    }

    //view timesheet details page
    $(document).on('click', '.showTimesheet', function () {
        var checkClass = $(this).closest('tr').hasClass('pendingEntry');
        var projectName = $(this).closest('tr').find('.td-project-name').text();
        var task = $(this).closest('tr').find('.td-title').text();
        var description = $(this).closest('tr').find('.td-description').html();
        var billableType = $(this).closest('tr').find('.td-billableType').text();
        var time = $(this).closest('tr').find('.td-time').text();
        var billable = $(this).closest('tr').find('.td-billable').text();
        var date = $(this).closest('tr').find('.td-date').text().split(" ")[0];
        var status = $(this).closest('tr').find('.td-status').text();
        var approveRejectBy = $(this).closest('tr').find('.td-approveRejectBy').text();
        var employee = $(this).closest('tr').find('.td-employee').text();
        let billableValue = billable == 1 ? 'Yes' : 'No';
        $('.showDataTitle').empty();
        $(document).find('.offcanvas #showDataBody').empty();
        $('.showDataTitle').text('Timesheet Details');
        var html = `<tr> <th>Employee: </th> <td>${employee}</td> </tr>
                    <tr> <th>Project:</th> <td>${projectName}</td> </tr>
                    <tr> <th>Task:</th> <td>${task}</td> </tr>
                    <tr> <th>Description:</th> <td>${description}</td> </tr>
                    <tr> <th>Date:</th> <td>${date}</td> </tr>
                    <tr> <th>Time:</th> <td>${time}</td> </tr>
                    <tr> <th>Billable:</th> <td>${billableValue}</td> </tr>`;
        if(status){
            html += `<tr> <th>${status} By: </th> <td>${approveRejectBy}</td> </tr>`;
        }

        if (billableValue == "No") {
            html += `<tr> <th>Non Billable Type:</th> <td>${billableType}</td> </tr>`;
        }

        if(checkClass){
            if($(this).hasClass('td-project-name')){
                var entryId = $(this).data('item-id');
            }else{
                var entryId = $(this).closest('label').data('item-id');
            }
            if(entryId && approvePermission == true){
                html += `<tr> <th class='align-middle'>Action:</th> <td>
                            <button type='button' data-id='${entryId}' data-class='approve' class='btn btn-success me-sm-3 me-1 mt-1 timesheet-approve-btn'>Approve</button>
                            <button type='button' data-id='${entryId}' data-class='reject' class='btn btn-danger me-sm-3 me-1 mt-1 timesheet-reject-btn'>Reject</button> </td>
                        </tr>`
            }
        }
        $(document).find('.offcanvas #showDataBody').append(html);
    });

    $(document).on('click', '.timesheet-approve-btn, .timesheet-reject-btn', function(){
        var actionName = $(this).data('class');
        var entryIds = [$(this).data('id')];

        let confirmText = 'Are you sure you want to '+actionName+'?';
        alert('Alert!', confirmText, 'text-danger')
            .then(function(result) {
                if (result) {
                    timeheetApproveReject(actionName, entryIds);
                }
        });
    });

    //ajax call delete timesheet
    $(document).on('click','.deleteTimesheet', function(){
        var id = $(this).data('item-id');
        alert('Alert!','Are you sure you want to delete this data?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/timesheet/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        getTimesheetTableData();
                        dashboard();
                        $('#timesheettab').text('Timesheet (' + response.count + ')');
                        successMessage(response.message);
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    $('#manageAttachment').show();

    //add form element on the project notice modal
    $(document).on('click','.noticeModalButton', function(){
        $('.modal-title').html('Add Notice & Appreciation');
        $('#new-notice-form').attr('action', '/notice-appreciation/store');
        $('#new-notice-form .error').removeClass('error');
        $('#validationMessages').empty();
        $('#noticeAndAppDescription').val('');
        $('.selectedFileDiv').val('').hide();

        $('#noticeEmp').prop('disabled', false);
        $('#noticeEmp').val('').trigger('change');
        $('#noticeEmp').html('<option value="">Select Employee</option>');
        $('#noticeEmp').select2({
            dropdownParent: $('#noticeModal .modal-body'),
        });
        $('#appreciation').prop('checked', true);

        var project = $('#projectName').val();
        if(project){
            $('#manageAttachment').show();
            $.ajax({
                url: APP_URL+'/notice-appreciation/user/list',
                type: 'GET',
                data: {project: projectId},
                success: function (response) {
                    $.each(response, function (index, item) {
                        $('#noticeEmp').append('<option value="' + index + '">' + item + '</option>');
                    });
                    $('#noticeEmp').select2({
                        dropdownParent: $('#noticeModal .modal-body'),
                        
                    }).trigger('change');
                },
                error: function (xhr, status, error) {
                    console.log(error,xhr);
                },
            });
        }
    });

    // function getNoticeModelFormData(){
    //     $.ajax({
    //         url: APP_URL+'/notice-appreciation/fetch/formData',
    //         type: 'GET',
    //         data: {page: requestPage, project: projectId},
    //         success: function (response) {
    //             $('#new-notice-form').html(response.data);
    //         },
    //         error: function (xhr, status, error) {
    //             console.log(error,xhr);
    //         },
    //     });
    // }

    //ajax call delete Notices
    $(document).on('click','.deleteNotice', function(){
        var id = $(this).data("item-id");
        alert('Alert!','Are you sure you want to delete this data?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url:  APP_URL+'/notice-appreciation/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        $('.offcanvas').toggleClass('is-open');
                        $('.offcanvas .btn-close').click();
                        getNoticeTableData();
                        $('#toastContent').text(response.message);
                        $('.toast').addClass('bg-success');
                        $('#AppToast').toast('show'); 
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    // Timesheet dropdown if non-billable
    // $(document).on('change', '.timesheetType', function () {
    //     var selectedOption = $(this).val();
    //     if (selectedOption == 0) {
    //         $.ajax({
    //             url: APP_URL+'/timesheet/fetchNonBillingTypeData',
    //             type: 'GET',
    //             data: { },
    //             success: function (response) {
    //                 $('.nonBillableTypeOption').empty();
    //                 let optionsHTML = '';
    //                 response.data.forEach(function (item) {
    //                   optionsHTML += `<option value="${item.id}">${item.name}</option>`;
    //                 });
    //                 // Append the optionsHTML to the select element
    //                 $('.nonBillableTypeOption').append(`
    //                     <label for="nonBillingValue" class="form-label">Select Non Billing Type</label>
    //                     <select class="form-select" name="nonBillingValue[]" id="nonBillingValue-0" required>
    //                         <option value="" disabled selected>Select</option>
    //                         ${optionsHTML}
    //                     </select>
    //                     <div class="error-message text-danger" id="-error"></div>
    //                 `);
    //               }, 
    //             error: function (xhr, status, error) {
    //                 console.log(error);
    //             },
    //         });
    //     }else{
    //         $('.nonBillableTypeOption').empty(); 
    //     }
    // });

    // Timesheet dropdown append if PROJECT BILLING TYPE is non-billable
    $(document).on('change', '.timesheetType', function (){
        var selectedOption = $(this).val();
        var nonBillableTypeOption = $(this).closest('.timesheet-block').find('.nonBillableTypeOption');
        selectedOption == 0 ? $(nonBillableTypeOption).show() : $(nonBillableTypeOption).hide();

        $('.nonBillingValue:last').select2({
            dropdownParent: $('#project-timesheet-model.modal-body'),
        });
    });

    $('#fillTimeTimesheet').timepicker({showPeriodLabels: false,});

    $(document).on('click','#saveNoticeAppr' ,function () {
        $('#new-notice-form').validate({
            rules: {
                notice_emp: {
                    required: true,
                },
                description: {
                    required: true,
                }
            },
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
            messages: {
                notice_emp: { required: 'Employee name is required' },
                description: { required: 'The Description field is required' }
            },
        }); 
    
        if($('#new-notice-form').valid()) {
            disableSubmitBtn('#saveNoticeAppr');
            $('#new-notice-form').append('<input type="hidden" name="project_tab" value="true">');

            $('#new-notice-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-notice-form').validate().resetForm();
                    $('#noticeEmp').prop('disabled', false);
                    $('#noticeEmp').val('').trigger('change');
                    $('#noticeAndAppDescription').val('');
                    $('#noticeEmp').html('<option value="">Select Employee</option>');

                    $('#noticeModal').modal('hide');
                    $('.select2').trigger('change');
                    getNoticeTableData();
                    documentData();
                    enableSubmitBtn('#saveNoticeAppr');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveNoticeAppr');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    $(document).on('click', '.showNotices', function () {
        var id =  $(this).data("item-id");
        var projectid =  $(this).data("item-project-id");
        var deletePermission = $(this).closest('tr').find('.td-delete-permission').text();
        var projectName = $(this).closest('tr').find('.td-project-name').text();
        var TypeName = $(this).closest('tr').find('.td-type').text();
        var typeClass =  TypeName == 'Appreciation' ? 'bg-success' : 'bg-danger';
        var employeeName = $(this).closest('tr').find('.td-employee-name').text();
        var description = $(this).closest('tr').find('.td-description').text();
        var file = $(this).closest('tr').find('.td-file').text();
        var fileUrl = $(this).data("file-url");
        var docId = $(this).data("doc-id");
        var downloadIcon = fileUrl ? `<span class='cursor-pointer openDoc text-info mx-1'' title='Click To Open File' data-doc-id='${docId}'> <i class='fa-solid fa-up-right-from-square cursor'></i></span><span class='cursor-pointer downloadDoc' style='color:blue;' title='Click To Download File' data-doc-id='${docId}'> <i class='bx bx-download cursor'></i></span>` : '' ;
        var createdAt = $(this).closest('tr').find('.td-createdAt').text();
        var createdBy = $(this).closest('tr').find('.td-createdBy').text();

        $('.showDataTitle').empty();
        $(document).find('.offcanvas #showDataBody').empty();
        $('.showDataTitle').text(TypeName+' Details');
        $(document).find('.offcanvas #showDataBody').html(
            `<tr> <th>Employee:</th> <td>${employeeName}</td> </tr>
            <tr> <th>Project:</th> <td>${projectName}</td> </tr>
            <tr> <th>Description:</th> <td>${description}</td> </tr>
            <tr> <th>Created At:</th> <td>${createdAt}</td> </tr>
            <tr> <th>Created By:</th> <td>${createdBy}</td> </tr>
            <tr> <th>Type:</th> <td><span class="badge rounded-pill ${typeClass}">${TypeName}</span></td> </tr>
            ${file !== '-' ? `<tr> <th>File:</th> <td>${file}${downloadIcon}</td> </tr>` : ''}
            ${deletePermission == 'true' && $('.noticeModalButton').length ? `<tr><th class="align-middle">Action:</th><td><button type='button' data-item-id='${id}' data-item-project-id='${projectid}' class='btn btn-danger me-sm-3 me-1 mt-1 deleteNotice'>Delete</button></td></tr>` : ''}`
            );
    });

    //Open download file
    $(document).on('click', '.openDoc', function () {
        var docId = $(this).data('doc-id');
        window.open('/project/file/open/' + docId);
    });

    //download file
    $(document).on('click', '.downloadDoc', function () {
        var docId = $(this).data('doc-id');
        window.open('/project/file/download/' + docId);
    });

    //Download Task Template
    $(document).on('click', '.importTask', function(){
        window.open('/task/file/download/');
    });

    $(document).on('change', '.attachmentType', function (){
        var selectedOption = $(this).val();
        var attachmentRow = $(this).closest('.newAdded').find('.changeType');
        var currentId = $(this).closest('.newAdded').find('.currentId').data('current-id');
        var attachmentRowLabel = $(this).closest('.newAdded').find('.attachmentLabel');

        if (selectedOption == 1 || selectedOption == 2) {
            var attachmentInputType = (selectedOption == 1) ? 'file' : 'url';
            var newName = `attachment[${currentId}][${attachmentInputType}]`;
            attachmentRow.attr('name', newName);
            attachmentRow.attr('type', attachmentInputType);
            attachmentRowLabel.html('Attachment ' + attachmentInputType + '<span class="text-danger">*</span>');
        }else{
            attachmentRow.empty(); 
        }
    });

    //save hours
    $(document).on('click', '#saveHours', function () {
        $('#new-hours-form').validate({
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
            messages: {
                description: { required: 'description field is required'},
                hours: { required: 'hours field is required' }
            },
        });

        if( $('#new-hours-form').valid() ) {
            disableSubmitBtn('#saveHours');
            $('#new-hours-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#HoursModal').modal('hide');
                    $('#new-hours-form').validate().resetForm();
                    hours();
                    dashboard();
                    enableSubmitBtn('#saveHours');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveHours');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, "-");
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    } else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //Ajax call for Hours tab
    function hours() {
        if( $('#projhoursTable').find('h6').length ){
            $('#projhoursTable h6').html('&nbsp;');
        }
        $('#projhoursTable').append(loading());
        var projId = $(document).find('.projId').text();

        $.ajax({
            url: APP_URL+'/' + projectId + '/data/projecthours',
            type: "GET",
            data: { projectId: projectId, page: requestPage },
            success: function (res) {
                hoursCount = res.count;
                $('#hourstab').text('Hours (' + res.count + ')');
                $('#new-hours-form').attr('action', APP_URL +'/' + projId +'/hours/store');
                $('.formTitle').text('Add Hours');
                if(res.count == 0){
                    $('#projhoursTable').html(tableNoData);
                }else{
                    let tc = `<table class="table table-hover table-striped tablecontentcss" id="hour_table_data"><thead><tr>
                            <th style="width:5%;">#</th>
                            <th style="width:15;">Title</th>
                            <th style="width:35%;">Description</th>
                            <th style="width:12%;" class="text-center">Uploaded By</th>
                            <th class="text-end" style="width:5%;">Hours</th>
                            <th class="text-end" style="width:17;">Month And Year</th>
                            <th class="text-center" style="width:10%;">Action</th></tr></thead><tbody id="cr-hours-body">`;

                    let num = res.data.st;
                    $.each(res.data.data, function (k, v) {
                        tc += '<tr>';
                        tc += '<td>'+num+'</td>';
                        tc += '<td class="showHours cursor-pointer text-primary" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">'+(v.title !== null ? sliceText(v.title, 60) : '-' )+'</td>';
                        tc += '<td class="">'+(v.description !== null ? sliceText(v.description, 60) : '-' )+'</td>';
                        tc += `<td class="td-description d-none">${ v.description ?? '-'}</td>
                                <td class="td-title d-none">${ v.title ?? '-'}</td>
                                <td class="td-createdAt d-none">${ v.createdAt ?? '-'}</td>
                                <td class="td-uploadedBy text-center">${ v.userName }</td>
                                <td class="td-hours text-end">${ v.hours }</td>
                                <td class="td-monthYear text-end cursor-pointer" title="${ v.month_year_name}">${ v.month_year.substring(0, 7)}</td>
                                <td class="text-center">`;
                        if(res.data.permission.edit == true){
                            tc += `<label class="editHours cursor-pointer" title="Edit Data" data-item-id="${v.id}" data-item-project-id="${v.project_id}">
                                <span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>`;
                        }
                        if(res.data.permission.view == true){
                            tc += `<label class="showHours cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">
                                <span class="text-primary cursor"><i class="bx bx-show me-1"></i></span></label>`;
                        }
                        if(res.data.permission.delete == true){
                            tc += `<label class="deleteHours cursor-pointer" data-item-id="${v.id}" data-item-project-id="${v.project_id}">
                                        <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span></label>`;
                        }
                        tc += '</td></tr>';
                        num++;
                    });
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#projhoursTable').html(tc);
                    var prevLink = $('#hour_table_data a.prev');
                    var nextLink = $('#hour_table_data a.next');
                    prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                    nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
                requestPage = 1;
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    //show off-canvas of hours tab
    $(document).on('click', '.showHours', function () {
        var monthYear = $(this).closest('tr').find('.td-monthYear').text();
        var hours = $(this).closest('tr').find('.td-hours').text();
        var title = $(this).closest('tr').find('.td-title').text();
        var description = $(this).closest('tr').find('.td-description').text();
        var uploadedBy = $(this).closest('tr').find('.td-uploadedBy').text();
        var createdAt = $(this).closest('tr').find('.td-createdAt').text();

        $('.showDataTitle').empty();
        $(document).find('.offcanvas #showDataBody').empty();
        $('.showDataTitle').text('Project Hours Details');
        $(document).find('.offcanvas #showDataBody').html(
            `<tr> <th>Project:</th> <td>${projectName}</td> </tr>
            <tr> <th>Title:</th> <td>${title}</td> </tr>
            <tr> <th>Hours:</th> <td>${hours}</td> </tr>
            <tr> <th>Month And Year:</th> <td>${monthYear}</td> </tr>
            <tr> <th>Uploaded By:</th> <td>${uploadedBy}</td> </tr>
            <tr> <th>Created At:</th> <td>${createdAt}</td> </tr>
            <tr> <th>Description:</th> <td>${description}</td> </tr>`
        );
    });

    // Edit Project Hours pop open and get data
    $(document).on('click', '.editHours', function () {
        var id = $(this).data('item-id');
        var projectId = $(this).data('item-project-id');
        $.ajax({
            url: APP_URL+'/' + projectId + '/project-hours/' + id + '/edit',
            type: 'GET',
            data: { id: id },
            success: function (response) {
                $('#new-hours-form').validate().resetForm();
                $('#new-hours-form .error').removeClass('error');
                $('#new-hours-form .error-message').empty();
                $('#validationMessages').empty();
                $('.formTitle').text('Edit Change Hours Request');
                $('#new-hours-form').attr('action', APP_URL+'/' +projectId +'/project-hours/'+ id +'/update');
                const monthYearValue = response.data.month_year.substring(0, 7);
                $('.projectHoursfield').val(response.data.hours);
                $('.projectMonthYearField').val(monthYearValue);
                $('.projectTitleField').val(response.data.title);
                $('.projectHoursDescField').val(response.data.description);
                $('#HoursModal').modal('show');
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });

    //delete hours
    $(document).on('click', '.deleteHours', function () {
        var id = $(this).data('item-id');
        var projectId = $(this).data('item-project-id');
        alert('Alert!','Are you sure you want to delete this data?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL + '/' + projectId + '/project-hours/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        hours();
                        dashboard();
                        successMessage(response.message);
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    $(document).on('click', '.addhoursBtn' , function(){
        $('#new-hours-form').validate().resetForm();
        $('#new-hours-form .error').removeClass('error');
        $('#new-hours-form .error-message').empty();
        $('#validationMessages').empty();
        $('#new-hours-form').attr('action', APP_URL +'/' + projectId +'/hours/store');
        $('.formTitle').text('Add Hours');
    });

    $(document).on('click', '#leaveListBtn', function(){
        userList = jQuery.parseJSON(onLeaveUserList);
        if(userList.length){
            $('.showDataTitle').empty();
            $(document).find('.offcanvas #showDataBody').empty();
            $('#offcanvasEndLabel').text('Team members on leave in next 7 days');
            $.each(userList, function(key, value) {
                $(document).find('.offcanvas #showDataBody').append( `<tr> <td>${value}</td> </tr>` );
            });
            $('#showData').show();
        }
    });

    // portfolio textarea summer note
    $('.portfolio-summer-note').summernote({
        height: 190,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['ul', 'ol']],
            ['color', ['color']],
            ['view', ['codeview']]
        ],
        callbacks: {
            onChange: function(contents, $editable) {
                if(!$(this).summernote('isEmpty')){
                    var currId = $(this).attr('id');
                    $('#' + currId + '-error').hide()
                }
            },
            // callback for pasting text only (no formatting)
            onPaste: function (e) {
                var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                e.preventDefault();
                bufferText = bufferText.replace(/\r?\n/g, '<br>');
                document.execCommand('insertHtml', false, bufferText);
            }
        }
    });

    //save portfolio form
    $(document).on('click', '#savePortfolio', function () {
        var uploadedFiles = $("#dZUploadOffer").find(".dz-success-mark");

        $.validator.addMethod('summerNoteRequired', function (value, element) {
            var content = $(element).summernote('code').trim();
            var isEmpty = content === '' || content === '<p><br></p>' || content === '<br>' || content === '<div><br></div>' || content.replace(/<[^>]*>/g, '').trim() === '';
            
            if(isEmpty){
                return false;
            }
            return true;
        }, 'Description field is required');
        $.validator.addMethod('summerNoteRequiredTask', function (value, element) {
            var content = $(element).summernote('code').trim();
            var isEmpty = content === '' || content === '<p><br></p>' || content === '<br>' || content === '<div><br></div>' || content.replace(/<[^>]*>/g, '').trim() === '';
            
            if(isEmpty){
                return false;
            }
            return true;
        }, 'Challenging Task field is required');
        $.validator.addMethod('summerNoteRequiredList', function (value, element) {
            var content = $(element).summernote('code').trim();
            var isEmpty = content === '' || content === '<p><br></p>' || content === '<br>' || content === '<div><br></div>' || content.replace(/<[^>]*>/g, '').trim() === '';
            
            if(isEmpty){
                return false;
            }
            return true;
        }, 'Feature Module List field is required');

        $('#project-portfolio-form').validate({
           ignore: [],
            rules:{
                project_title: {
                    required: true,
                },description: { 
                    summerNoteRequired: true 
                },keywords: {
                    required: true,
                },'technology[]': {
                    required: true,
                },dev_hours: {
                    required: true,
                },client: {
                    required: true,
                },developer: {
                    required: true,
                },team_lead: {
                    required: true,
                },bde: {
                    required: true,
                },industry: {
                    required: true,
                },country: {
                    required: true,
                },platform_type: {
                    required: true,
                },challenging_task: {
                    summerNoteRequiredTask: true,
                },feature_module_list: {
                    summerNoteRequiredList: true,
                },'database[]': {
                    required: true,
                }
            },
            highlight: function(element, errorClass, validClass) {
                $(element).addClass(errorClass).removeClass(validClass);
                $(element).parent('div').addClass('input-error').removeClass(validClass);
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).removeClass(errorClass).addClass(validClass);
                $(element).parent('div').removeClass('input-error').addClass(validClass);
            },
            errorPlacement: function (error, element) {
                if (element.attr("name") == "dropzoneFiles") {
                    $("#dZUploadImg-error").html(error);
                }else if(element.attr('name') == 'description') {
                    $(error).insertBefore($('#description-error')); // for description error message
                }else if(element.attr('name') == 'challenging_task') {
                    $(error).insertBefore($('#challenging_task-error')); // for challenging_task error message
                }else if(element.attr('name') == 'feature_module_list') {
                    $(error).insertBefore($('#feature_module_list-error')); // for feature_module_list error message
                }else if(element.attr('name') == 'database[]') {
                    $(error).insertBefore($('#database-error')); // for database error message
                }else if(element.attr('name') == 'technology[]') {
                    $(error).insertBefore($('#technology-error')); // for technology error message
                }else if(element.attr('name') == 'country') {
                    $(error).insertBefore($('#country-error')); // for country error message
                }else if(element.attr('name') == 'industry') {
                    $(error).insertBefore($('#industry-error')); // for industry error message
                } else if ($(element).parent('.input-group').length) {
                    $(error).insertAfter($(element).parent());      // radio/checkbox
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
            messages: {
                project_title: {
                    required: 'Project Title field is required',
                },
                description: {
                    summerNoteRequired: 'Description field is required',
                },keywords: {
                    required: 'Keywords field is required',
                },
                'technology[]': {
                    required: 'Technology field is required',
                },dev_hours: {
                    required: 'Development Hours field is required',
                },
                client: {
                    required: 'Client field is required',
                },developer: {
                    required: 'Developer field is required',
                },
                team_lead: {
                    required: 'Team Lead field is required',
                },bde: {
                    required: 'Sales Team Member field is required',
                },
                industry: {
                    required: 'Industry field is required',
                },country: {
                    required: 'Country field is required',
                },platform_type: {
                    required: 'Platform Type field is required',
                }, challenging_task: {
                    required: 'Challenging Task field is required',
                },feature_module_list: {
                    required: 'Feature Module List field is required',
                }, 'database[]': {
                    required: 'Database field is required',
                }
            },
        });

        if (uploadedFiles.length === 0) {
            $('.dropZoneErrorMessage').show();
        }else{
            $('.dropZoneErrorMessage').hide();
            if($('#project-portfolio-form').valid()) {
                disableSubmitBtn('#savePortfolio');
                $('#project-portfolio-form').ajaxSubmit({
                    beforeSubmit: function () {
                        $('.error-message').text('');
                    },
                    success: function (response) {
                        $('#project-portfolio-form').validate();
                        // $('.select2').trigger('change');
                        enableSubmitBtn('#savePortfolio');
                        successMessage(response.message);
                    },
                    error: function (xhr) {
                        enableSubmitBtn('#savePortfolio');
                        if (xhr.status === 422) {
                            var errors = xhr.responseJSON.errors;
                            $.each(errors, function (field, error) {
                                var fieldElement = $("[id='" + field + "']");
                                fieldElement.next('div').text(error[0]);
                            });
                        } else {
                            console.log(xhr);
                        }
                    },
                });
            }
        }
    });


    // productiveness tab
    $('#productEmpFilter').select2();
    $('#productEmpFilter, #productEmpFilterMonth').on('change', function(){
        getProductTableData();
    });

    // ajax call for productiveness Table data
    var productAjaxProgress = false;
    function getProductTableData() {
        if (!productAjaxProgress) {
            productAjaxProgress = true;
            if( $('#productTableData').find('h6').length ){
                $('#productTableData h6').html('&nbsp;');
            }
            // $('#productTableData').append(loading());
            var employee = $('#productEmpFilter').length ? $('#productEmpFilter').val() : null;
            var filterMonth = $('#productEmpFilterMonth').length ? $('#productEmpFilterMonth').val() : null;

            $.ajax({
                url: APP_URL+'/productivity/get-data',
                type: 'GET',
                data: {
                    employee: employee,
                    filterMonth: filterMonth,
                    projectId: projectId,
                },
                success: function (res) {
                    if(res.data.length != 0){
                        var sortedYears = Object.keys(res.data).sort(function(a, b) {
                            return b - a;
                        });
                        var allAccordionData = '';
                        var count = 0;
                        $.each(sortedYears, function(index, year) {
                            var months = res.data[year];
                            var yearAccordion = `<div class="accordion product stick-top accordion-bordered course-content-fixed">
                                    <div class="accordion-item shadow-none border mb-4 ${count == 0 ? 'active' : ''}">
                                        <h2 class="accordion-header main-header" id="heading-year-${year}">
                                            <button class="accordion-button product bg-label-primary rounded-0 ${count != 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-year-${year}" aria-expanded="false" aria-controls="collapse-year-${year}">
                                                ${year}
                                            </button>
                                        </h2>
                                        <div id="collapse-year-${year}" class="accordion-collapse collapse ${count == 0 ? 'show' : ''}" aria-labelledby="heading-year-${year}">
                                            <div class="accordion-body py-3 border-top">
                                                <div class="accordion stick-top accordion-bordered course-content-fixed" id="accordion-month-${year}"> `;

                            var sortedMonths = Object.keys(months).sort(function(a, b) {
                                return b - a;
                            });

                            var totalTest = sortedMonths.length

                            $.each(sortedMonths, function(index, month) {

                                var details = months[month];
                                let firstKey = Object.keys(details)[0];
                                const currentMonthHeader = details[firstKey].currDate;
                                var monthAccordion = `<div class="accordion-item shadow-none border mb-0 ${totalTest != (index+1) ? 'mb-3' : ''}">
                                        <h2 class="accordion-header" id="heading-month-${year}-${month}">
                                            <button class="accordion-button product bg-label-secondary rounded-0 ${count != 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-month-${year}-${month}" aria-expanded="false" aria-controls="collapse-month-${year}-${month}">${currentMonthHeader}</button>
                                        </h2>
                                        <div id="collapse-month-${year}-${month}" class="accordion-collapse collapse ${count == 0 ? 'show' : ''}" aria-labelledby="heading-month-${year}-${month}" data-bs-parent="#accordion-month-${year}">
                                            <div class="accordion-body py-3 border-top">
                                                <table class="table table-hover table-striped">
                                                    <thead class="table-light">
                                                        <tr>
                                                            <th>Employee</th>
                                                            <th>Total Experience</th>
                                                            <th>Month</th>
                                                            <th>Billable Hours</th>
                                                            <th>Non-Billable Hours</th>
                                                            <th>Float Factor</th>
                                                            <th>Derived Hours</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                `;

                                $.each(details, function(key, entry) {
                                    monthAccordion += `
                                        <tr>
                                            <td>${entry.name}</td>
                                            <td>${entry.exprience}</td>
                                            <td>${entry.currDate}</td>
                                            <td>${entry.billable_hrs}</td>
                                            <td>${entry.non_billable_hrs}</td>
                                            <td>${entry.gridFloat}</td>
                                            <td>${entry.factor_hrs}</td>
                                        </tr>
                                    `;
                                });

                                monthAccordion += `</tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                `;

                                yearAccordion += monthAccordion;
                                count++;
                            });

                            yearAccordion += `</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                            allAccordionData += yearAccordion;
                        });
                        $('#accordion-container').html(allAccordionData);
                    }else{
                        $('#accordion-container').html('<h6 class="font-20 mb-0 text-light text-center pb-5">No data found</h6>');
                    }
                    productAjaxProgress = false;
                },
                error: function (xhr, status, error) {
                    productAjaxProgress = false;
                },
            });
        }
    }

    let platformTypeExist = document.getElementById('platformType');
    if(platformTypeExist){
        toggleUrlFields();
    }

    function toggleUrlFields() {
        var platformType = $('#platformType').val();
        $('.webAppDiv').hide();
        $('.mobileAppDiv').hide();

        if (platformType == '1') {
            $('.webAppDiv').show();
        } else if (platformType == '2') {
            $('.mobileAppDiv').show();
        } else if (platformType == '3') {
            $('.webAppDiv').show();
            $('.mobileAppDiv').show();
        }
    }

    $('#platformType').on('change', toggleUrlFields);

    $(document).on('click', '.editApproveCheck', function() {
        let $this = $(this);
        let checkedValue = $this.prop('checked');
        let portfolioId = $('.portfolio_edit_id').val();
        let projectName = $('.portfolio_project_name').text();
        let message = checkedValue ? ('Are you sure you want to approve the '+projectName+' project portfolio status?') : 'Are you sure you want to revoke the approval of the '+projectName+' project portfolio status?';

        alert('Alert!', message, 'text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+"/portfolio/approve",
                    type: "POST",
                    data: { switchValue: checkedValue, portfolioId: portfolioId },
                    success: function (response) {
                        if(response.success == true){
                            getportfolioTableData();
                            successMessage(response.message);
                        }else{
                            errorMessage(response.message); 
                            $this.prop('checked', !checkedValue);
                        }
                    },
                    error: function (xhr, status, response) {
                        // errorMessage(response.message);
                    },
                });
            }else{
                $this.prop('checked', !checkedValue);
            }
        });
    });


    //Client Timesheet functionalities

    //Fetch filter timesheet for client timesheet form
    var filterTimesheetAjaxProgress = false;
    function getFilterTimesheetTableData() {
        if (!filterTimesheetAjaxProgress) {
            if(filterFormText != 'today'){
                $('#resetCtFormBlock').show();
            }else{
                $('#resetCtFormBlock').hide();
            }

            if(filterFormText != ''){
                filterTimesheetAjaxProgress = true;

                $('#timesheetTable').append(loading());   // Adding loader to timesheet list table
                
                $.ajax({
                    url: APP_URL+'/project-client-timesheet/timesheet/data',
                    type: "GET",
                    data: {
                        page: requestPage,
                        project: projectId,
                        filter: filterFormText,
                        dateFilter: dateFormFilter,
                    },
                    success: function (res) {
                        var opentimesheetDetails = $('#dataActiveswitch').is(':checked') == true ? 'display: contents' : 'display: none;';
    
                        if(res.data && res.data?.data.length > 0){
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="filterTSTable"> <thead> <tr>
                                        <th width="220px">Project</th>
                                        <th width="50px">Type</th>
                                        <th>Task</th>
                                        <th width="200px">Employee</th>
                                        <th width="80px" class="text-center">Date</th>
                                        <th width="60px" class="text-center">Time</th>
                                        <th width="60px" class="text-center">Action</th>
                                        </tr> </thead> <tbody id="pending-timesheet-table-body">`;
    
                            let totalTimeInSeconds = 0;
                            let num = res.data.st;
    
                            $.each(res.data.data, function (k, v) {
                                tc += '<tr>';
                                tc += '<td class="td-project-name" title="'+v.project+'" data-item-id="'+v.id+'" data-item-project-id="'+v.projectId+'">'+  sliceText(v.project, 30) +'</td>';
                                tc += '<td class="" title="'+(v.billable == 1 ? 'Billable' : 'Non-Billable')+'">'+ (v.billable == 1 ? 'B' : 'NB') +'</td>';
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                tc += '<td class="tblDiscription text-wrap" title="'+v.task+'">' + sliceText(v.task, 30) + '</br> <span class="formTblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-employee">'+v.emp+'</td>';
                                tc += '<td class="td-date text-center">'+v.date+'</td>';
                                tc += '<td class="td-time text-center">'+v.time+'</td>';
                                tc += '<td class="d-none td-title">'+v.task+'</td>';
                                tc += '<td class="d-none td-billable">'+v.billable+'</td>';
                                tc += '<td class="d-none td-billableType">'+v.billableType+'</td>';
                                tc += '<td class="d-none td-description">'+sanitizedString+'</td>';
                                tc += '<td class="d-none td-approveRejectBy">'+v.approveRejectBy+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '<td class="d-none td-status">Approved</td>';
                                tc += '<td class="text-center">';
                                tc += '<label title="Copy Timesheet Details" class="copyTimesheetDetails cursor-pointer" data-id-data-emp="'+ v.dataIdEmp +'" data-task="'+v.task +'" data-details="'+ escapeHtml(v.description) +'"> <span class="text-primary cursor"><i class="bx bx-copy me-1"></i></span> </label>';
                                tc += '</td></tr>';
                                const timeParts = v.time.split(":");
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                const seconds = parseInt(timeParts[2], 10);
                                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                                totalTimeInSeconds += totalSeconds;
                                num++;
                            });
    
                            tc += '</tbody>';
                            const formattedTotalTime = secondsToHHMMSS(totalTimeInSeconds);
                            if(res.data.morePage) { tc += makePagination(res.data.button); }
                            tc += '</table>';
                            $('#timesheetTable').html(tc);
                            var prevLink = $('#filterTSTable a.prev');
                            var nextLink = $('#filterTSTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                            $('#timesheetTable #loading').remove();
                            $('#detailTimesheetSwitchDiv').show();
                        }else{
                            $('#timesheetTable #loading').remove();
                            $('#detailTimesheetSwitchDiv').hide();
                            $('#timesheetTable').html('<h6 class="font-20 mb-0 text-light text-center pb-5">No data found</h6>');
                        }
    
                        requestPage = 1;
                        filterTimesheetAjaxProgress = false;
                    },
                    error: function (xhr, status, error) {
                        filterTimesheetAjaxProgress = false;
                        console.log(error);
                    },
                });
            }
            
        }
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    //Fetch Filled Client Timesheet for client timesheet form
    var filledClientTimesheetAjaxProgress = false;
    function getFilledClientTimesheetTableData() {
        if (!filledClientTimesheetAjaxProgress) {
            if(filterFormText != 'today'){
                $('#resetCtFormBlock').show();
            }else{
                $('#resetCtFormBlock').hide();
            }
            if(filterFormText != ''){
                filledClientTimesheetAjaxProgress = true;
                $('#filledClientTimesheetTable').append(loading());     // Adding loader to timesheet list table

                $.ajax({
                    url: APP_URL+'/project-client-timesheet/fetch',
                    type: "GET",
                    data: {
                        page: requestPage,
                        isForm: true,
                        project:projectId,
                        filter: filterFormText,
                        dateFilter: dateFormFilter,
                    },
                    success: function (res) {
                        var opentimesheetDetails = $('#ctFormDataActiveswitch').is(':checked') == true ? 'display: contents' : 'display: none;';
                        if(res.data && res.data?.data.length > 0){
                            let tc = `<table class="table tablecontentcss table-hover table-striped" id="filledClientTimesheetTable"> <thead> <tr>
                                        <th width="220px">Project</th>
                                        <th>Task</th>
                                        <th width="180px">Name</th>
                                        <th width="110px">Date</th>
                                        <th width="70px">Time</th>
                                        </tr> </thead> <tbody id="client-timesheet-table-body">`;
    
                            let totalTimeInSeconds = 0;
                            let num = res.data.st;
    
                            $.each(res.data.data, function (k, v) {
                                var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                                sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                                
                                tc += '<tr>';
                                tc += '<td class="td-projectName">'+ sliceText(v.project_name, 30) +'</td>';
                                tc += '<td class="tblDiscription text-wrap" title="'+v.task+'">' + sliceText(v.task, 80) + '</br> <span class="formCTTblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                                tc += '<td class="td-name">'+ sliceText(v.aliasName, 60) +'</td>';
                                tc += '<td class="td-date">'+v.date+'</td>';
                                tc += '<td class="td-time">'+v.time+'</td>';
                                tc += '<td class="d-none td-task">'+v.task+'</td>';
                                tc += '<td class="d-none td-projectName">'+v.project_name+'</td>';
                                tc += '<td class="d-none td-description">'+v.description+'</td>';
                                tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                                tc += '</tr>';
                                const timeParts = v.time.split(":");
                                const hours = parseInt(timeParts[0], 10);
                                const minutes = parseInt(timeParts[1], 10);
                                const seconds = parseInt(timeParts[2], 10);
                                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                                totalTimeInSeconds += totalSeconds;
                                num++;
                            });
    
                            tc += '</tbody>';
                            const formattedTotalTime = secondsToHHMMSS(totalTimeInSeconds);
                            if(res.data.morePage) { tc += makePagination(res.data.button); }
                            tc += '</table>';
                            $('#filledClientTimesheetTable').html(tc);
                            var prevLink = $('#filledClientTimesheetTable a.prev');
                            var nextLink = $('#filledClientTimesheetTable a.next');
                            prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                            nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                            $('#filledClientTimesheetTable #loading').remove();
                            $('#detailFilledCTTimesheetSwitchDiv').show();
                        }else{
                            $('#filledClientTimesheetTable #loading').remove();
                            $('#detailFilledCTTimesheetSwitchDiv').hide();
                            $('#filledClientTimesheetTable').html('<h6 class="font-20 mb-0 text-light text-center pb-5">No data found</h6>');
                        }
    
                        requestPage = 1;
                        filledClientTimesheetAjaxProgress = false;
                    },
                    error: function (xhr, status, error) {
                        filledClientTimesheetAjaxProgress = false;
                        console.log(error);
                    },
                });
            }
        }
    }

    //Fetch client timesheet table data
    var clientTimesheetAjaxProgress = false;
    function getClientTimesheetTableData() {
        if (!clientTimesheetAjaxProgress) {
            clientTimesheetAjaxProgress = true;

            // let ctStartDate = $('#filterCtStartDate').val() ?? null;
            // let ctEndDate = $('#filterCtEndtDate').val() ?? null;
            let filterEmp = $('#clientTimesheetUserFilter').length ? $('#clientTimesheetUserFilter').val() : null;
            let filterTask = $('#clientTimesheetTaskFilter').length ? $('#clientTimesheetTaskFilter').val() : null;

            if(ctFilterText != 'this_month' || filterEmp || filterTask){
                $('#resetCtBlock').show();
            }else{
                $('#resetCtBlock').hide();
            }
            // Adding loader to timesheet list table
            $('#cTTable').append(loading());

            $.ajax({
                url: APP_URL+'/project-client-timesheet/fetch',
                type: "GET",
                data: {
                    page: requestPage,
                    project: projectId,
                    filterEmp: filterEmp,
                    filter: ctFilterText,
                    dateFilter: ctDateFilter,
                    task: filterTask,
                },
                success: function (res) {
                    $('#clientTimesheetTab').text('Client Timesheet (' + res.count + ')');
                    $('#filterCtData').removeClass('sending');
                    var opentimesheetDetails = $('#ctDataActiveswitch').is(':checked') == true ? 'display: contents' : 'display: none;';
                    if(res.data && res.data?.data.length > 0){
                        $('.ctTotalHours').text(res.data.totalTime);
                        let tc = `<table class="table tablecontentcss table-hover table-striped" id="clientTimesheetTable"> <thead> <tr>
                                <th width="180px">Project</th>
                                <th>Task</th>
                                <th width="180px">Name</th>
                                <th width="180px">Filled By</th>
                                <th width="110px">Date</th>
                                <th width="90px">Time</th>
                                <th width="100px" class="text-center">Action</th>
                                </tr> </thead> <tbody id="client-timesheet-table-body">`;

                        let totalTimeInSeconds = 0;
                        let num = res.data.st;

                        $.each(res.data.data, function (k, v) {
                            var sanitizedString = v.description.replace(/^\s*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\s*$/gim, '');
                            sanitizedString = sanitizedString.replace(/<script\b[^>]*>(.*?)<\/script>|<script\b[^>]*>/gi, '');
                            
                            tc += '<tr>';
                            tc += '<td class="showclientTimesheet cursor-pointer text-primary" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="'+ v.project_name +'">'+ sliceText(v.project_name, 30) +'</td>';
                            tc += '<td class="ctTblDiscription text-wrap" title="'+v.task+'"><span>' + sliceText(v.task, 70) + '</span></br> <span class="ctTblDetailDesc fs14" style="'+opentimesheetDetails+'">' + sanitizedString + '</span></td>';
                            tc += '<td class="td-name">' + sliceText(v.aliasName, 60) + '</td>';
                            tc += '<td class="td-filledBy">' + v.createdBy + '</td>';
                            tc += '<td class="td-date">'+v.date+'</td>';
                            tc += '<td class="td-time">'+v.time+'</td>';
                            tc += '<td class="d-none td-task">'+v.task+'</td>';
                            tc += '<td class="d-none td-projectName">'+v.project_name+'</td>';
                            tc += '<td class="d-none td-description">'+v.description+'</td>';
                            tc += '<td class="d-none td-filled_at">'+v.filled_at+'</td>';
                            tc += '<td class="text-end">';

                            if (v.is_escalated == 1) {
                                tc += '<label title="Escalated Timesheet"><span class="text-danger"><i class="bx bxs-flag-alt me-1"></i></span></label>';
                            }

                            tc += '<label class="showclientTimesheet cursor-pointer clickOnRmnr" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">';
                            tc += '<span class="text-primary cursor"><i class="bx bx-show me-1"></i></span> </label>'
                            if(v.canDelete){    
                                tc += '<label onclick="setFocusOnFirstInput(\'#clientTimesheetModal\')" class="editClientTimesheetRecord cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'"> <span class="text-info cursor"><i class="bx bx-edit-alt me-1"></i></span></label>';
                                tc += '<label class="deleteClientTimesheet cursor-pointer" data-item-id="'+v.id+'" data-item-project-id="'+v.project_id+'">';
                                tc += '<span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                            }

                            tc += '</td></tr>';
                            const timeParts = v.time.split(":");
                            const hours = parseInt(timeParts[0], 10);
                            const minutes = parseInt(timeParts[1], 10);
                            const seconds = parseInt(timeParts[2], 10);
                            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                            totalTimeInSeconds += totalSeconds;
                            num++;
                        });

                        tc += '</tbody>';
                        const formattedTotalTime = secondsToHHMMSS(totalTimeInSeconds);
                        if(res.data.morePage) { tc += makePagination(res.data.button); }
                        tc += '</table>';
                        $('#cTTable').html(tc);
                        var prevLink = $('#clientTimesheetTable a.prev');
                        var nextLink = $('#clientTimesheetTable a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                        $('#cTTable #loading').remove();
                        $('#detailTimesheetSwitchDiv').show();
                        $('.exportPdfCsvDiv').show();
                    }else{
                        $('.ctTotalHours').text(0);
                        $('.exportPdfCsvDiv').hide();
                        $('#cTTable #loading').remove();
                        $('#detailTimesheetSwitchDiv').hide();
                        $('#cTTable').html('<h6 class="font-20 mb-0 text-light text-center pb-5">No data found</h6>');
                    }

                    requestPage = 1;
                    clientTimesheetAjaxProgress = false;
                },
                error: function (xhr, status, error) {
                    clientTimesheetAjaxProgress = false;
                    console.log(error);
                },
            });
        }
    }



    function isValidDate(dateString) {
        // Checks YYYY-MM-DD format and if it's a valid date
        const date = new Date(dateString);
        return (
            /^\d{4}-\d{2}-\d{2}$/.test(dateString) &&
            date instanceof Date &&
            !isNaN(date.getTime())
        );
    }

    // Show timesheet description below task
    $(document).on('change', '#activeswitch', function() {
        if ($(this).is(':checked')) {
            $('.tblDetailDesc').show();
        } else {
            $('.tblDetailDesc').hide();
        }
    });

    $(document).on('change', '#ctDataActiveswitch, #dataActiveswitch, #ctFormDataActiveswitch', function() {
        let targetClass = $(this).data('target'); // Get target class from data attribute
        if ($(this).is(':checked')) {
            $(targetClass).show();
        } else {
            $(targetClass).hide();
        }
    });

    $(document).on("click", ".copyTimesheetDetails", function() {
        var description = $(this).data("details").trim();
        var task = $(this).data("task").trim();
        var empId = $(this).data("idDataEmp");
        var existingContent = $('#ct_description').summernote('code').trim();
        var existingTask = $('#ctTask').val().trim();

        var formattedContent;
        if(existingContent != '<div><br></div>'){
            formattedContent = existingContent + '<br>' + description;
        }else{
            formattedContent = description;
        }
        
        $('#ct_description').summernote('code', formattedContent);
        if (existingTask === '') {
            $('#ctTask').val(task);
        }

        // Find the encrypted value in the dropdown using the plain ID
        var encryptedVal = $('#teamCtData option').filter(function () {
            return $(this).data('id-data') == empId;
        }).val();

        if (encryptedVal) {
            $('#teamCtData').val(encryptedVal).trigger('change');
        }
    });

    //Add Client Timesheet
    $(document).on('click', '.clientTimesheetFromButton', function() {
        payload = {projectId: projectId};
        fetchClientTimesheetCreateEditForm(payload, 'Add Client Timesheet')
    });

    //Edit Client TImesheet Details
    $(document).on('click', '.editClientTimesheetRecord', function(){
        $('.hoursMessage').remove();
        var editEntryId = $(this).closest('label').data('item-id');
        payload = {editId : editEntryId, projectId: projectId};
        fetchClientTimesheetCreateEditForm(payload, 'Edit Client Timesheet')
    });

    //Common function for the create and edit form of client timesheet
    function fetchClientTimesheetCreateEditForm(payload, title){
        $.ajax({
            url: APP_URL+'/project-client-timesheet/create-edit',
            type: 'GET',
            data: payload,
            success: function (response) {
                if(response.data){
                    $('.modal-title').html(title);
                    $('#client-timesheet-body').html(response.data);
                    $('#ct_description').summernote({
                        height: 200,
                        toolbar: [
                            ['style', ['style']],
                            ['font', ['bold', 'italic', 'underline', 'clear']],
                            ['para', ['ul', 'ol']],
                            ['color', ['color']],
                            ['view', ['codeview']]
                        ],
                        callbacks: {
                            onChange: function(contents, $editable) {
                                if(!$('#description').summernote('isEmpty')){
                                    $('#description-error').hide()
                                }
                            },
                            // callback for pasting text only (no formatting)
                            onPaste: function (e) {
                                var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                                e.preventDefault();
                                bufferText = bufferText.replace(/\r?\n/g, '<br>');
                                document.execCommand('insertHtml', false, bufferText);
                            }
                        }
                    });
                    filterCtFormLabelChange();
                    $('#teamCtData').select2({
                        width: '100%',
                        dropdownParent: $('#clientTimesheetModal .modal-body')
                    });

                    var ctTime = response.formData?.time ?? '00:00';
                    initializeTimepicker($('#TimesheetEntryHrs'), ctTime, 23, 55);

                    $('#ctProjectName').val(projectName);
                    $('#crProjectId').val(projectId);
                   
                    if(response.formData.length != 0){
                        $('#crEditId').val(response.formData.id);
                        $('#ctTask').val(response.formData.task);
                        $('#ctDate').val(response.formData.date);
                        $('#ct_description').summernote('code', response.formData.description);
                    }else{
                        $('#ctDate').val(currentDate);
                    }
                    getFilterTimesheetTableData();
                    getFilledClientTimesheetTableData();

                    if(! isCurrentOrFutureMonth($('#ctDate').val())){
                        const message = 'This is a past month\'s record - make sure hours are managed in the "Hours" tab.';
                        $('#appendMainBlock').prepend(`<p class="text-danger hoursMessage">${message}</p>`);
                    }
                }else{
                    errorMessage('Something went wrong!');
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    // Save Client Timesheet
    $(document).on('click', '#saveClientTimesheet', function() {
        $.validator.addMethod('summerNoteRequired', function (value, element) {
            var content = $(element).summernote('code').trim();
            var isEmpty = content === '' || content === '<p><br></p>' || content === '<br>' || content === '<div><br></div>' || content.replace(/<[^>]*>/g, '').trim() === '';
            
            if(isEmpty){
                return false;
            }
            return true;
        }, 'Description field is required');

        $.validator.addMethod('nonZeroTime', function(value, element) {
            return value !== '00:00';
        }, 'Time entry cannot be 00:00');        

        let rules = {
            projectName: { required: true },
            task: { required: true, maxlength: 255 },
            time: { required: true, nonZeroTime: true},
            description: { summerNoteRequired: true },
        };
    
        if ($('#teamCtData').length > 0) {
            rules['teamCtData'] = { required: true };
        }

        $('#new-client-timesheet-form').validate({
            ignore: [],
            rules: rules,
            
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
                }else if(element.attr('name') == 'description') {
                    $(error).insertBefore($('#ct_description-error')); // for description error message
                } else if (element.attr('name') === 'teamCtData') {
                    $('#teamCtData-error').html(error);
                } else {
                    $(error).insertAfter($(element));               // default
                }
            },
            messages: {
                projectName: { required: 'The Project field is required' },
                task: { required: 'The Task field is required', maxlength: 'The task must not be greater than 255 characters.' },
                time: { required: 'The Time field is required', nonZeroTime: 'Please enter a valid time (not 00:00)' },
                description: { required: 'The Description field is required'},
                teamCtData: { required: 'The Employee field is required' },
                time: { nonZeroTime: 'Please enter a valid time (not 00:00)'},
            },
        });

        if($('#new-client-timesheet-form').valid()) {
            disableSubmitBtn('#saveClientTimesheet');
            $('#new-client-timesheet-form').ajaxSubmit({
                beforeSubmit: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#new-client-timesheet-form').validate().resetForm();
                    $('#clientTimesheetModal').modal('hide');
                    getClientTimesheetTableData();
                    fetchClientTimesheetTaskForProject();
                    enableSubmitBtn('#saveClientTimesheet');
                    successMessage(response.message);
                },
                error: function (xhr) {
                    enableSubmitBtn('#saveClientForm');
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;

                        $.each(errors, function (field, error) {
                            var fieldId = field.replace(/\./g, '-');
                            $('#' + fieldId + '-error').text(error[0]);
                        });
                    }else {
                        console.log(xhr);
                    }
                },
            });
        }
    });

    //Show Client Timesheet in offcanvas
    $(document).on('click', '.showclientTimesheet', function() {
        var showDataBody = $(document).find('#showData').find('#showDataBody');
        var html = '';
        var offcanvasEndLabel = $(document).find('#showData').find('#offcanvasEndLabel');
        $(offcanvasEndLabel).empty();
        $(showDataBody).empty();

        var projectName = $(this).closest('tr').find('.td-projectName').text();
        var name = $(this).closest('tr').find('.td-name').text();
        var task = $(this).closest('tr').find('.td-task').text();
        var description = $(this).closest('tr').find('.td-description').html();
        var time = $(this).closest('tr').find('.td-time').text();
        var date = $(this).closest('tr').find('.td-date').text();
        var filledAt = $(this).closest('tr').find('.td-filled_at').text();
        var filledBy = $(this).closest('tr').find('.td-filledBy').text();

        $(offcanvasEndLabel).text('Client Timesheet Details');
        html += `<tr> <th>Project: </th> <td>${projectName}</td> </tr>
            <tr> <th>Task: </th> <td>${task}</td> </tr>
            <tr> <th>Name: </th> <td>${name}</td> </tr>
            <tr> <th>Date: </th> <td>${date}</td> </tr>
            <tr> <th>Time: </th> <td>${time}</td> </tr>
            <tr> <th>Filled By: </th> <td>${filledBy}</td> </tr>
            <tr> <th>Filled At: </th> <td>${filledAt}</td> </tr>
            <tr> <th>Description: </th> <td>${description}</td> </tr>`;
        $(showDataBody).html(html);
        $(showDataBody).show();
    });

    //Delete Client Timesheet
    $(document).on('click','.deleteClientTimesheet', function(){
        var id = $(this).data('item-id');
        var date = $(this).closest('tr').find('.td-date').text();
        var message = 'Are you sure you want to delete this data?';
        if(!isCurrentOrFutureMonth(date)){
            message += '<br> This is a past month\'s record - make sure hours are managed in "Hours" Tab.';
        }

        alert('Alert!', message, 'text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/project-client-timesheet/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        getClientTimesheetTableData();
                        successMessage(response.message);
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    // Store/Update the aliasname
    $(document).on('click', '#saveCTSetting', function() {
        let form = $('#aliasForm');
        if (form.length === 0) {
            errorMessage("Form not found!");
            return;
        }

        let url = form.attr('action');
        let formData = form.serialize();
        $.ajax({
            type: 'POST',
            url: url,
            data: formData,
            success: function (response) {
                successMessage(response.message);
                getClientTimesheetTableData();
                fetchEmployeesForProject();
            },
            error: function (xhr, status, error) {
                errorMessage('Error updating alias:', xhr.responseText);
            }
        });
    });

    //Download the pdf or doc
    // CSV Download
    $("#downloadCTCsv").click(function (e) {
        e.preventDefault();
        downloadFile('xlsx');
    });

    // PDF Download
    $("#downloadCTPdf").click(function (e) {
        e.preventDefault();
        downloadFile('pdf');
    });

    function downloadFile(type) {
        // let ctStartDate = $('#filterCtStartDate').val() ?? null;
        // let ctEndDate = $('#filterCtEndtDate').val() ?? null;
        let filterEmp = $('#clientTimesheetUserFilter').length ? $('#clientTimesheetUserFilter').val() : null;
        let filterTask = $('#clientTimesheetTaskFilter').length ? $('#clientTimesheetTaskFilter').val() : null;

        $.ajax({
            url: APP_URL+ "/project-client-timesheet/export",
            type: "GET",
            data: { fileType: type,
                    project: projectId,
                    filterEmp: filterEmp,
                    filter: ctFilterText,
                    dateFilter: ctDateFilter,
                    task: filterTask,
                },
            success: function (response) {
                if (response.success) {
                    const fileExtension = (type === 'xlsx') ? 'xlsx' : 'pdf';
                    let link = document.createElement('a');
                    link.href = response.file_url;
                    link.download = `${response.filename}.${fileExtension}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    errorMessage("Error: Unable to generate file.");
                }
            },
            error: function () {
                errorMessage("Something went wrong. Please try again.");
            }
        });
    }

    // Set min date for filter start date
    $(document).on('change', '#filterCtStartDate', function(){
        let startDate = $('#filterCtStartDate').val();
        if(startDate){
            // let selectedDate = new Date(startDate);
            // selectedDate = new Date(selectedDate.getTime() + ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#filterCtEndtDate').attr({'min': startDate});
        }else{
            $('#filterCtEndtDate').attr({'min': ''});
        }
    });

    // Set max date for filter end date
    $(document).on('change', '#filterCtEndtDate', function(){
        let endDate = $('#filterCtEndtDate').val();
        if(endDate){
            let selectedDate = new Date(endDate);
            selectedDate = new Date(selectedDate.getTime() - ( 60 * 60 * 24 * 1000)).toISOString().slice(0, 10);
            $('#filterCtStartDate').attr({'max': selectedDate});
        }else{
            $('#filterCtStartDate').attr({'max': ''});
        }
    });

    // Enable disable Timesheet filter button
    $('.date-input').on('change', function(e){
        if( $('#filterCtStartDate').val() || $('#filterCtEndtDate').val()){
            enableSubmitBtn('#filterCtData');
        }else{
            $('#filterCtData').attr('disabled', true);
        }
    });

    $(document).on('click', '#filterCtData', function() {
        getClientTimesheetTableData();
    });

    $(document).on('change', '#clientTimesheetUserFilter , #clientTimesheetTaskFilter', function() {
        getClientTimesheetTableData();
    });

    $(document).on('click', '#resetCtAll', function() {
        $('#clientTimesheetUserFilter').val(null).trigger('change.select2');
        $('#clientTimesheetTaskFilter').val(null).trigger('change.select2');
        $('#filterStartDateCt').val("").attr({'max': ''});
        $('#filterEndtDateCt').val("").attr({'min': ''});
        $('#filterCtData').attr('disabled', true);
        $('#filterCtData').attr('disabled', true);
        let selector = $('#durationCtFilter .dropdown-item[data-id="this_month"]');
        filterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        hideFilterDatesBlock();
        filterLabelChange();
        requestPage = 1;
        setTimeout(() => {
            getClientTimesheetTableData();
        }, 100);
    });

    $(document).on('keyup', '.alias-input', function() {
        var $input = $(this);
        const aliasName = $input.val().trim().toLowerCase();
        const actualName = $input.data('name').trim().toLowerCase();
        var $icon = $input.closest('tr').find('.renamedIcon');
        setTimeout(() => {
            if (aliasName !== '' && aliasName !== actualName) {
                $icon.show();
            } else {
                $icon.hide();
            }
        }, 600);
    });

    function fetchEmployeesForProject() {
        $.ajax({
            url: APP_URL + '/fetch/client-timesheet/user',
            type: 'GET',
            data: {project_id: projectId},
            success: function (res) {
                if (res.length == 0) {  
                    $('#clientTimesheetUserFilter').html('');
                    $('#clientTimesheetUserFilter').append('<option value="">No Employee Found</option>');              
                }else{
                    $('#clientTimesheetUserFilter').empty();
                    $('#clientTimesheetUserFilter').append('<option value="">Select Employee</option>');

                    $.each(res, function (key, value) {
                        var ctname = value.alias_name ? value.alias_name + ' (' + value.name + ')' : value.name;
                        $('#clientTimesheetUserFilter').append(
                            $('<option>', {
                                value: key,
                                text: ctname
                            })
                        );
                    });
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    }

    function fetchClientTimesheetTaskForProject() {
        $.ajax({
            url: APP_URL + '/fetch/client-timesheet/project/task',
            type: 'GET',
            data: {project_id: projectId},
            success: function (res) {
                if (res.task.length == 0) {  
                    $('#clientTimesheetTaskFilter').html('');
                    $('#clientTimesheetTaskFilter').append('<option value="">No Task Found</option>');              
                }else{
                    $('#clientTimesheetTaskFilter').empty();
                    $('#clientTimesheetTaskFilter').append('<option value="">Select Task</option>');

                    $.each(res.task, function (key, value) {
                        $('#clientTimesheetTaskFilter').append(
                            $('<option>', {
                                value: value,
                                text: value
                            })
                        );
                    });
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    }

    // Duration filter dropdown change
    $('#durationCtFilter li').on('click', function(){
        let selector = $(this).children();
        ctFilterText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        filterLabelChange();
        
        if(ctFilterText != 'date'){
            hideFilterDatesBlock();
            getClientTimesheetTableData();
        }else if(ctFilterText == 'date'){
            showFilterDatesBlock();
        }
    });

    function filterLabelChange(){
        let filterSelector = $('.dropdown-menu .dropdown-item.active');
        ctFilterText = $(filterSelector).attr('data-id');
        let activeText = $(filterSelector).text().trim();
        $('#filter-ct-text').text(activeText);
    }

    function hideFilterDatesBlock(){
        $('#startDateCtBlock').hide();
        $('#endDateCtBlock').hide();
        $('#filterCtBlock').hide();
    }

    function showFilterDatesBlock(){
        $('#startDateCtBlock').show();
        $('#endDateCtBlock').show();
        $('#filterCtBlock').show();
    }

    // Set min date for filter end date
    $(document).on('change', '#filterStartDateCt', function () {
        let startDate = $('#filterStartDateCt').val();
        $('#filterEndtDateCt').attr('min', startDate || '');
    });

    // Set max date for filter start date
    $(document).on('change', '#filterEndtDateCt', function () {
        let endDate = $('#filterEndtDateCt').val();
        $('#filterStartDateCt').attr('max', endDate || '');
    });

    // Enable disable Timesheet filter button
    $('.date-input').on('change', function(e){
        if( $('#filterStartDateCt').val() && $('#filterEndtDateCt').val()){
            enableSubmitBtn('#filterCtData');
        }else{
            $('#filterCtData').attr('disabled', true);
        }
    });

    $('#filterCtData').on('click', function(){
        disableSubmitBtn('#filterCtData');
        ctDateFilter['startDate'] = $('#filterStartDateCt').val();
        ctDateFilter['endDate'] = $('#filterEndtDateCt').val();
        getClientTimesheetTableData();
    });

    // Duration Form filter dropdown change
    $(document).on('click', '#durationFormFilter li', function(){
        let selector = $(this).children();
        filterFormText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        filterCtFormLabelChange();

        if(filterFormText != 'date'){
            hideCtFormFilterDatesBlock();
            getFilterTimesheetTableData();
            getFilledClientTimesheetTableData();
        }else if(filterFormText == 'date'){
            showCtFormFilterDatesBlock();
        }
    });

    function filterCtFormLabelChange(){
        let filterSelector = $('#durationFormFilter .dropdown-item.active');
        filterFormText = $(filterSelector).attr('data-id');
        let activeText = $(filterSelector).text().trim();
        $('#filter-ct-form-text').text(activeText);
    }

    function hideCtFormFilterDatesBlock(){
        $('#startDateCtFormBlock').hide();
        $('#endDateCtFormBlock').hide();
        $('#filterCtFormBlock').hide();
    }

    function showCtFormFilterDatesBlock(){
        $('#startDateCtFormBlock').show();
        $('#endDateCtFormBlock').show();
        $('#filterCtFormBlock').show();
    }

    // Set min date for filter end date
    $(document).on('change', '#filterFormStartDateCt', function () {
        let startDate = $('#filterFormStartDateCt').val();
        $('#filterFormEndtDateCt').attr('min', startDate || '');
    });

    // Set max date for filter start date
    $(document).on('change', '#filterFormEndtDateCt', function () {
        let endDate = $('#filterFormEndtDateCt').val();
        $('#filterFormStartDateCt').attr('max', endDate || '');
    });

    // Enable disable Timesheet filter button
    $(document).on('change','.form-date-input', function(e){
        if( $('#filterFormStartDateCt').val() && $('#filterFormEndtDateCt').val()){
            enableSubmitBtn('#filterCtFormData');
        }else{
            $('#filterCtFormData').attr('disabled', true);
        }
    });

    $(document).on('click','#filterCtFormData', function(){
        disableSubmitBtn('#filterCtFormData');
        dateFormFilter['startDate'] = $('#filterFormStartDateCt').val();
        dateFormFilter['endDate'] = $('#filterFormEndtDateCt').val();
        setTimeout(() => {
            getFilterTimesheetTableData();
            getFilledClientTimesheetTableData();
        }, 100);
        $('#filterCtFormData').removeClass('sending');
    });

    $(document).on('click', '#resetCtFormAll', function() {
        $('#filterFormStartDateCt').val("").attr({'max': ''});
        $('#filterFormEndtDateCt').val("").attr({'min': ''});
        $('#filterCtFormData').attr('disabled', true);
        let selector = $('#durationFormFilter .dropdown-item[data-id="today"]');
        filterFormText = selector.attr('data-id');
        $('.dropdown-item').removeClass('active');
        selector.addClass('active');
        hideCtFormFilterDatesBlock();
        filterCtFormLabelChange();
        requestPage = 1;
        setTimeout(() => {
            getFilterTimesheetTableData();
            getFilledClientTimesheetTableData();
        }, 100);
    });

    $(document).on('change', '#ctDate', function () {
        if(! isCurrentOrFutureMonth($('#ctDate').val())){
            $('.hoursMessage').remove();
            const message = 'This is a past month\'s record - make sure hours are managed in the "Hours" tab.';
            $('#appendMainBlock').prepend(`<p class="text-danger hoursMessage">${message}</p>`);
        }else{
            $('.hoursMessage').remove();
        }
    });

});