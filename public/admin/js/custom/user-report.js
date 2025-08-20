$(function () {
    function showShimmer() {
        document.querySelectorAll('.shimmer-line').forEach(line => {
            line.classList.add('showAnimation');
        });
        document.querySelectorAll('.content-data').forEach(content => {
            content.classList.remove('showAnimation');
        });
    }

    function hideShimmer() {
        document.querySelectorAll('.shimmer-line').forEach(line => {
            line.classList.remove('showAnimation');
        });
        document.querySelectorAll('.content-data').forEach(content => {
            content.classList.add('showAnimation');
        });
    }

    //Remove/Add shimmer effect
    var empId = $('#employeeFilter').val();
    if(empId){
        hideShimmer();
        getAttendanceData();
    } else {
        showShimmer();
    }

    $("#employeeFilter").select2({
        placeholder: "Select Employee",
        allowClear: true,
        minimumInputLength: 3,
        ajax: {
            dataType: 'json',
            delay: 250,
            url: APP_URL+'/user/report/search/users',
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

    $('#employeeFilter , #tableinterviewYear').change(function() {
        if($('#employeeFilter').val()){
            hideShimmer();
            getAttendanceData();
        } else {
            showShimmer();
        }
    });

    function getAttendanceData(){
        $.ajax({
            url: APP_URL+'/report/getUserReport',
            type: "POST",
            data: { empId: $('#employeeFilter').val(), year: $('#tableinterviewYear').val()},
            success: function (res) {
                if(res.success == true){
                    // Billable Percentage With Total Hours
                    $("#billablePercentageWithTotalHrs path.circle").attr("stroke-dasharray", res.data.ratio.billablePercentageWithTotalHours+', 100');
                    $("#billablePercentageWithTotalHrs text.percentages").attr("x", ( res.data.ratio.billablePercentageWithTotalHours >= 100 ? 8 : (res.data.ratio.billablePercentageWithTotalHours < 10 ? 13 : 11) ));
                    $("#billablePercentageWithTotalHrs text").text( res.data.ratio.billablePercentageWithTotalHours+'%' );

                    // Non-billable Percentage With Total Hours
                    $("#nonBillablePercentageWithTotalHrs path.circle").attr("stroke-dasharray", res.data.ratio.nonBillablePercentageWithTotalHours+', 100');
                    $("#nonBillablePercentageWithTotalHrs text.percentages").attr("x", ( res.data.ratio.nonBillablePercentageWithTotalHours >= 100 ? 8 : (res.data.ratio.nonBillablePercentageWithTotalHours < 10 ? 13 : 11) ));
                    $("#nonBillablePercentageWithTotalHrs text").text( res.data.ratio.nonBillablePercentageWithTotalHours+'%' );
                    

                    $('.totalAppreciations').text(res.data.appriciationNoticeCount.appreciation ?? 0);
                    $('.totalNoticeCount').text(res.data.appriciationNoticeCount.notice ?? 0)
                    $('.earlyDayLeavingCount').text(res.data.earlyLeavingCount.count ?? 0);
                    $('.totalTakenLeaves').text(res.data.leaveTypes.totalTakenLeaves ?? 0);

                    $('.totalProjectWorked').text(Object.keys(res.data.workedProject).length ?? 0);

                    $('.totalWorkExperience').text(res.data.totalExperince ?? 0);

                    $('.totalOverdueProject').text(res.data.overdueProCount ?? 0);

                    $('.plannedLeaveCount').text(res.data.leaveTypes.plannedLeaveCount ?? 0);
                    $('.unplannedLeaveCount').text(res.data.leaveTypes.unplannedLeaveCount ?? 0);
                    
                    $('.plannedLeaveBar').text(Math.round(res.data.leaveTypes.plannedLeavePercentage)+'%');
                    $('.unplannedLeaveBar').text(Math.round(res.data.leaveTypes.unPlannedLeavePercentage)+'%');
                    if(res.data.leaveTypes.plannedLeavePercentage == '100'){
                        $('.plannedLeaveBar').addClass('hundredPercentBar');
                    }else if(res.data.leaveTypes.unPlannedLeavePercentage == '100'){
                        $('.unplannedLeaveBar').addClass('hundredPercentBar');
                    }

                    $('.plannedLeaveBar').width(res.data.leaveTypes.plannedLeavePercentage+'%');
                    $('.unplannedLeaveBar').width(res.data.leaveTypes.unPlannedLeavePercentage+'%');

                    $('.plannedLeaveBar'). prop('title', 'Planned Leave '+res.data.leaveTypes.plannedLeavePercentage+'%, '+res.data.leaveTypes.plannedLeaveCount);
                    $('.unplannedLeaveBar'). prop('title', 'Unplanned Leave '+res.data.leaveTypes.unPlannedLeavePercentage+'%, '+res.data.leaveTypes.unplannedLeaveCount);

                    if (res.data.avp && res.data.avp.length > 0) {
                        $('#avpName').empty();
                        res.data.avp.forEach(function(name) {
                            $('#avpName').append('<p class="mt-2" style="text-align: center; margin: 0;"><b>' + name + '</b></p>');
                        });
                    }else {
                        $('#avpName').empty();
                        $('#avpName').append('<h6 class="font-20 mb-0 mt-2 text-light text-center">No data found</h6>');
                    }

                    $('#userWithIps').text(res.data.userWithIps);

                    if(res.data.allAppriciationNotice.length == 0){
                        $('#appreciationAndNoticeTable').html(tableNoData);
                    }else{
                        let noticeTable = `<table class="table table-hover table-striped tablecontentcss" id="appreciationAndNoticeTable1111">
                                                <thead>
                                                    <tr class="text-left">
                                                        <th class="sticky-top">#</th>
                                                        <th class="sticky-top">Project</th>
                                                        <th class="sticky-top">Type</th>
                                                        <th class="sticky-top">Action</th>
                                                    </tr></thead><tbody id="apprNoticeTableBody" class="text-left">`;

                        let noticeTableNum = 1;
                        $.each(res.data.allAppriciationNotice, function (k, v) {
                            noticeTable += '<tr>';
                            noticeTable += '<td>'+noticeTableNum+'</td>';
                            noticeTable += '<td class="td-project-name">'+ v.projectName +'</td>';
                            noticeTable += '<td> <span class="badge rounded-pill td-type '+v.typeColor+'">'+v.type+'</span></td>';
                            noticeTable +='<td class="d-none td-employee-name">'+v.userName+'</td>';
                            noticeTable +='<td class="d-none td-sub-type">'+v.subType+'</td>';
                            noticeTable +='<td class="d-none td-description">'+v.description+'</td>';
                            noticeTable +='<td class="d-none td-file">'+v.fileName+'</td>';
                            noticeTable +='<td class="d-none file-url">'+v.url+'</td>';
                            noticeTable +='<td class="d-none td-createdAt">'+v.createdAt+'</td>';

                            noticeTable += '<td class="text-left">';
                            noticeTable += `<label class="cursor-pointer showAppreciationNotice" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">
                                                <span class="text-primary"> <i class="bx bx-show me-1"></i> </span></label>`;
                            noticeTable += '</td></tr>';
                            noticeTableNum++;
                        });

                        noticeTable += '</table>';
                        $('#appreciationAndNoticeTable').html(noticeTable);
                    }

                    // On clicking notice or appreciation, the canvas will open with detailed information.
                    $('.showAppreciationNotice').on('click', function(){
                        let projectName = $(this).closest('tr').find('.td-project-name').text();
                        let TypeName = $(this).closest('tr').find('.td-type').text();
                        let typeClass =  TypeName == 'Appreciation' ? 'bg-label-success' : 'bg-label-danger';

                        var subTypeName = $(this).closest('tr').find('.td-sub-type').text();
                        let employeeName = $(this).closest('tr').find('.td-employee-name').text();
                        let description = $(this).closest('tr').find('.td-description').text();
                        let file = $(this).closest('tr').find('.td-file').text();
                        let fileUrl = $(this).closest('tr').find('.file-url').text();
                        let downloadIcon = fileUrl ? `<span class='cursor-pointer openDoc text-info mx-1'' title='Click To Open File' data-file-url='${fileUrl}'> <i class='fa-solid fa-up-right-from-square cursor'></i></span><span class='cursor-pointer downloadDoc' style='color:blue;' title='Click To Download File' data-file-url='${fileUrl}'> <i class='bx bx-download cursor'></i></span>` : '' ;
                        let createdAt = $(this).closest('tr').find('.td-createdAt').text();

                        $('.showDataTitle').empty();
                        $('#showDataBody').empty();
                        $('.showDataTitle').text('Notices and Appreciation Details');
                        $('#showDataBody').html(
                            `<tr> <th>Project:</th> <td>${projectName}</td> </tr>
                            <tr> <th>Employee:</th> <td>${employeeName}</td> </tr>
                            <tr> <th>Description:</th> <td>${description}</td> </tr>
                            <tr> <th>Created At:</th> <td>${createdAt}</td> </tr>
                            <tr> <th>Type:</th> <td><span class="badge rounded-pill ${typeClass}">${TypeName}</span></td> </tr>
                            ${subTypeName !== '-' ? `<tr> <th>Sub Type:</th> <td>${subTypeName}</td> </tr>` : ''}
                            ${file !== '-' ? `<tr> <th>File:</th> <td>${file}${downloadIcon}</td> </tr>` : ''}`
                            );
                    });

                    if(res.data.interviewDetails.length == 0){
                        $('#InterviewDetails').html(tableNoData);
                    }else{
                        let interviewTable = `<table class="table table-hover table-striped tablecontentcss" id="InterviewDetailsTable">
                                                    <thead>
                                                        <tr class="text-left">
                                                            <th class="sticky-top" style="width: 5%;">#</th>
                                                            <th class="sticky-top" style="width: 45%;">Title</th>
                                                            <th class="sticky-top" style="width: 40%;">Technologies</th>
                                                            <th class="sticky-top" style="width: 10%;">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="interviewBody" class="text-left">`;

                    
                        let interviewTableNum = 1;
                        $.each(res.data.interviewDetails, function (k, v) {
                            interviewTable += '<tr>';
                            interviewTable += '<td>' + interviewTableNum + '</td>';
                            interviewTable += '<td class="td-title">' + v.title + '</td>';
                            interviewTable += '<td class="td-technologies">' + v.technologies + '</td>';
                    
                            // New hidden columns from the object
                            interviewTable += '<td class="d-none td-id">' + (v.id ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-user_id">' + (v.user_id ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-lead_id">' + (v.lead_id ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-updated_at">' + (v.updated_at ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-deleted_at">' + (v.deleted_at ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-schedule_on">' + (v.schedule_on ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-exp_year">' + (v.exp_year ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-exp_month">' + (v.exp_month ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-interviewers">' + (v.interviewers ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-channel">' + (v.channel ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-link_detail">' + (v.link_detail ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-other_notes">' + (v.other_notes ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-job_desc">' + (v.job_desc ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-is_verified_by_ptc">' + (v.is_verified_by_ptc ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-resume">' + (v.resume ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-is_ad_hoc">' + (v.is_ad_hoc ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-feedback">' + (v.feedback ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-record_link">' + (v.record_link ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-status">' + (v.status ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-sales_user_id">' + (v.sales_user_id ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-exp_start_date">' + (v.exp_start_date ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-is_schedule_mail_sent">' + (v.is_schedule_mail_sent ?? '-') + '</td>';
                            interviewTable += '<td class="d-none td-created_by">' + (v.created_by ?? '-') + '</td>';
                    
                            // Action column
                            interviewTable += '<td class="text-left">';
                            interviewTable += `<label class="cursor-pointer showInterviewData" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="offcanvasEnd" title="Show Details">
                                                <span class="text-primary"> <i class="bx bx-show me-1"></i> </span>
                                            </label>`;
                            interviewTable += '</td></tr>';
                            interviewTableNum++;
                        });
                    
                        interviewTable += '</tbody></table>';
                        $('#InterviewDetails').html(interviewTable);
                    }

                    // On clicking interview details, the canvas will open with detailed information.
                    $('.showInterviewData').on('click', function () {
                        let row = $(this).closest('tr');
                    
                        let title = row.find('.td-title').text() || '-';
                        let technologies = row.find('.td-technologies').text() || '-';
                        let user_id = row.find('.td-user_id').text() || '-';
                        let lead_id = row.find('.td-lead_id').text() || '-';
                        let sales_user_id = row.find('.td-sales_user_id').text() || '-';
                        let channel = row.find('.td-channel').text() || '-';
                        let schedule_on = row.find('.td-schedule_on').text() || '-';
                        let exp_year = row.find('.td-exp_year').text() || '-';
                        let exp_month = row.find('.td-exp_month').text() || '-';
                        let interviewers = row.find('.td-interviewers').text() || '-';
                        let link_detail = row.find('.td-link_detail').text() || '-';
                        let other_notes = row.find('.td-other_notes').text() || '-';
                        let job_desc = row.find('.td-job_desc').text() || '-';
                        let is_verified_by_ptc = row.find('.td-is_verified_by_ptc').text() || '-';
                        let resume = row.find('.td-resume').text() || '-';
                        let is_ad_hoc = row.find('.td-is_ad_hoc').text() || '-';
                        let feedback = row.find('.td-feedback').text() || '-';
                        let record_link = row.find('.td-record_link').text() || '-';
                        let status = row.find('.td-status').text() || '-';
                        let exp_start_date = row.find('.td-exp_start_date').text() || '-';
                        let created_at = row.find('.td-created_at').text() || '-';
                        let created_by = row.find('.td-created_by').text() || '-';
                        let is_schedule_mail_sent = row.find('.td-is_schedule_mail_sent').text() == 0 ? 'No' : 'Yes';
                    
                        $('.showDataTitle').text('Interview Details');
                        $('#showDataBody').empty();
                    
                        $('#showDataBody').html(
                            `<tr><th>Title:</th><td>${title}</td></tr>
                            <tr><th>Technologies:</th><td>${technologies}</td></tr>
                            <tr><th>User:</th><td>${user_id}</td></tr>
                            <tr><th>Lead:</th><td>${lead_id}</td></tr>
                            <tr><th>Channel:</th><td>${channel}</td></tr>
                            <tr><th>Schedule On:</th><td>${schedule_on}</td></tr>
                            <tr><th>Experience Year:</th><td>${exp_year}</td></tr>
                            <tr><th>Experience Months:</th><td>${exp_month}</td></tr>
                            <tr><th>Interviewers:</th><td>${interviewers}</td></tr>
                            <tr><th>Link Detail:</th><td>${link_detail}</td></tr>
                            <tr><th>Other Notes:</th><td>${other_notes}</td></tr>
                            <tr><th>Job Description:</th><td>${job_desc}</td></tr>
                            <tr><th>Verified by PTC:</th><td>${is_verified_by_ptc}</td></tr>
                            <tr><th>Resume:</th><td>${resume}</td></tr>
                            <tr><th>Is Ad Hoc:</th><td>${is_ad_hoc}</td></tr>
                            <tr><th>Feedback:</th><td>${feedback}</td></tr>
                            <tr><th>Record Link:</th><td>${record_link}</td></tr>
                            <tr><th>Sales User:</th><td>${sales_user_id}</td></tr>
                            <tr><th>Status:</th><td>${status}</td></tr>
                            <tr><th>Experience Start Date:</th><td>${exp_start_date}</td></tr>
                            <tr><th>Created At:</th><td>${created_at}</td></tr>
                            <tr><th>Schedule Mail Sent:</th><td>${is_schedule_mail_sent}</td></tr>
                            <tr><th>Created By:</th><td>${created_by}</td></tr>`
                        );
                    });

                    // Leave details category wise
                    if(res.data.leaveDetails) {
                        let hoursTable = '<table class="table table-hover table-striped tablecontentcss" id="leaveDetails_table"> ';
                            hoursTable += '<thead> <tr> <th>Category</th> <th>Total</th> <th>Taken</th> </tr> </thead> <tbody id="leaveDetailsBody">';
                        if(res.data.leaveDetails.isITA == true){
                            hoursTable += `<tr>
                                                <td>Apprentice leave</td>
                                                <td class="text-end">${res.data.leaveDetails['Apprentice leave'].totalLeaves ?? 0}</td>
                                                <td class="text-end">${res.data.leaveDetails['Apprentice leave'].takenLeaves ?? 0}</td>
                                            </tr>`
                        }else{
                            hoursTable += `<tr>
                                                <td>Personal leave</td>
                                                <td class="text-end">${res.data.leaveDetails['Personal'].totalLeaves ?? 0}</td>
                                                <td class="text-end">${res.data.leaveDetails['Personal'].takenLeaves ?? 0}</td>
                                            </tr>
                                            <tr>
                                                <td>Unpaid leave</td>
                                                <td class="text-end">${res.data.leaveDetails['Unpaid'].totalLeaves ?? 0}</td>
                                                <td class="text-end">${res.data.leaveDetails['Unpaid'].takenLeaves ?? 0}</td>
                                            </tr>
                                            <tr>
                                                <td>Appreciation Leave (C-Off)</td>
                                                <td class="text-end">${res.data.leaveDetails['Appreciation Leave (C-Off)'].totalLeaves ?? 0}</td>
                                                <td class="text-end">${res.data.leaveDetails['Appreciation Leave (C-Off)'].takenLeaves ?? 0}</td>
                                            </tr>`
                        }
                        hoursTable += '</table>';
                        $('#leaveDetailsCategoryWiseTable').html(hoursTable);
                    }

                    // List of worked projects and count of worked projects
                    if(Object.keys(res.data.workedProject).length > 0){
                        let projectList  = '<table class="table table-hover table-striped tablecontentcss" id="projectWorkedTable"><thead><tr><th class="sticky-top">Project Name</th></tr></thead><tbody id="projectWorkedBody">';
                        $.each(res.data.workedProject, function (k, v) {
                            const overdueClass = v.overdue ? 'text-danger' : '';
                            projectList += '<tr> <td> <a href="'+APP_URL+'/projects/'+v.id+'" target="_blank" class="project-name-link ' + overdueClass + '">'+v.name+'</a> </td></tr>';
                        });
                        projectList += '</tbody> </table>';
                        $('#projectWorkedOnTable').html(projectList);
                    }else{
                        $('#projectWorkedOnTable').html(tableNoData);
                    }

                    // Billable percentage with total hours
                    $('#billablePercentageWithTotalHours').text(Math.round(res.data.ratio.billablePercentageWithTotalHours)+'%' ?? '0%');

                    // Non-billable percentage with total hours
                    $('#nonbillablePercentageWithTotalHours').text(Math.round(res.data.ratio.nonBillablePercentageWithTotalHours)+'%' ?? '0%');

                    // Billable to non-billable ratio
                    $('#billableToNonbillableRatio').text(res.data.ratio.billableToNonbillableRatio);

                    // Hours details table
                    let hoursDetailTable = '<table class="table table-hover table-striped tablecontentcss" id="projectHrsDetails_table">';
                        hoursDetailTable += '<thead> <tr> <th>Category</th> <th>Total</th> </tr> </thead> <tbody id="hrsDetailsBody">';
                        hoursDetailTable += `<tr> <td>Billable Hours</td> <td class="text-end">${res.data.ratio.totalBillableHrs ?? 0}</td> </tr>
                                            <tr> <td>Non-billable Hours</td> <td class="text-end">${res.data.ratio.totalNonBillableHrs ?? 0}</td> </tr>
                                            <tr> <td>Total Hours</td> <td class="text-end">${res.data.ratio.totalConsumedHours ?? 0}</td> </tr>`
                        hoursDetailTable += '</table>';
                    $('#projectHoursDetailsTable').html(hoursDetailTable);


                }
            },
            error: function (xhr, status, error) {
                errorMessage('Something went wrong! <br>' + error);
            },
        });
    }
});