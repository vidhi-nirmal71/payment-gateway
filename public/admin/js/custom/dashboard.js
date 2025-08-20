/*Below code for dashbord data and pagination */
$(document).ready(function () {

    requestPage = 1;
    $(document).on("click", ".page-link", function () {
        let currentPage = $(this).parent().hasClass("active");
        if (!currentPage) {
            requestPage = $(this).attr("data-url").split("=").pop();
            ReminderForToday();
        }
    });

    projectDetails();
    leaveDetails();
    genericDetails();
    latestAnnouncement();
    ReminderForToday();

    function ReminderForToday() {
        $.ajax({
            url: APP_URL+"/home/reminder",
            type: "GET",
            data: { page: requestPage },
            success: function (response) {
                let optionsHTML = '';
                if (response.data.length > 0) {
                    response.data.forEach(function (item) {
                        const time = item.reminder.split(' ')[1];
                        optionsHTML += `<li><a href="javascript:;" data-id="${item.encryptedId}" id="row-${item.rawNo}" class="items ps-1 pe-1 dashReminder">${item.title} - ${time}</a></li>`;
                    });
                }else{
                    optionsHTML += tableNoData;
                }
                $("#reminders").html(optionsHTML);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    $(document).on('click', '.dashReminder', function(){
        let rowClicked = $(this).attr('id');
        let clickedId = $(this).attr('data-id');
        localStorage.setItem('dashReminderClick', rowClicked);
        window.open('/projects/'+clickedId+'/?t=reminder', '_self');
    });

    function projectDetails() {
        $.ajax({
            url: APP_URL+"/home/project/details",
            type: "GET",
            success: function (response) {
                if (response.data.assignedProject !== 0) {
                    $('#assignedProject').attr('href', '/projects');
                }
                if (response.data.projectsOverdueCount !== 0) {
                    $('#projectsOverdueCount').attr('href', '/projects?data=overdue');
                }
                $("#assignedProject").html(response.data.assignedProject);
                $("#projectsOverdueCount").html(response.data.projectsOverdueCount);
                $("#billableHours").html(response.data.billableHours);
                $("#nonBillableHoursCount").html(response.data.nonBillableHoursCount);
                let optionsHTML = '';
                if (response.data.overdueProjectList.length > 0) {
                    response.data.overdueProjectList.forEach(function (item) {
                        optionsHTML += `<li><a href="projects/${item.encryptedId}/?t=details" class="items ps-1 pe-1">${item.name}</a></li>`;
                    });
                }else{
                    optionsHTML += tableNoData;
                }
                $("#overdueProjects").html(optionsHTML);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    function leaveDetails() {
        $.ajax({
            url: APP_URL+"/home/leave/details",
            type: "GET",
            success: function (response) {
                if($('#personalLeave').length){
                    $('#personalLeave').text(response.data.personalLeaveTaken+'/'+response.data.personalLeavesTotal);
                    $('#unpaidLeave').text(response.data.unpaidLeaveTaken+'/'+response.data.unpaidLeavesTotal);
                    $('#takenLeave').text(response.data.unpaidLeaveTaken + response.data.personalLeaveTaken);
                }else if($('#apprenticeLeave').length){
                    $('#apprenticeLeave').text(response.data.apprenticeLeaveTaken+'/'+response.data.apprenticeLeavesTotal);
                    $('#takenLeave').text(response.data.apprenticeLeaveTaken);
                }
                $('#hocLeave').text(response.data.hocLeaveTaken);
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    function genericDetails(){
        $.ajax({
            url: APP_URL+"/home/generic/details",
            type: "GET",
            success: function (response) {
                let leaveToday = '.onlyThreeUserLiofLeave';
                let leaveForWeek = '.liOfFiveLeave';
                $("#totalAppreciation").html(response.data.totalAppreciation ?? 'No Data Found');
                $("#totalNotice").html(response.data.totalNotice ?? 'No Data Found');

                $('#earlyDay').text(response.data.earlyDay);
                $('#pendingTimesheetData').text(response.data.pendingTimesheet);
                appendDataToCard(leaveToday , response.data.teamMemberOnLeaveToday, 3 , '.todayLeaveCount');

                uniqueTeamMembers = $.grep(response.data.teamMemberOnLeaveForWeek, (member, index) => index === $.inArray(member.title, $.map(response.data.teamMemberOnLeaveForWeek, obj => obj.title)));
                response.data.uniqueTeamMembers = uniqueTeamMembers;
                appendDataToCard(leaveForWeek , response.data.uniqueTeamMembers, 3 , '.liOfFiveLeaveCount');

                $(document).on('click', '.show-btn', function() {
                        const button = $(this);
                        const parentDiv = button.closest('.main-content');
                        const label = parentDiv.find('.label').text();
                        const flag = '.' + parentDiv.find('#flag').attr('class');
                        let optionsHTML = '';
                        
                        $('.showDataTitle').empty();
                        $('#showDataBody').empty();
                        if (leaveToday === flag) {
                            optionsHTML = moreDetailHtml(response.data.teamMemberOnLeaveToday);
                        }if (leaveForWeek === flag) {
                            optionsHTML = moreDetailHtml(response.data.teamMemberOnLeaveForWeek);
                        }
                        $('.showDataTitle').text(label);
                        $('#showDataBody').html(optionsHTML);
                });
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    function latestAnnouncement() {
        $.ajax({
            url: APP_URL+"/home/announcement/details",
            type: "GET",
            success: function (res) {
                // Latest Announcement table
                    let optionsHTML = '';
                    $('#latestAnnouncement').empty();
                    if(res.data.latestAnnouncement !== null){
                        res.data.latestAnnouncement.forEach(function (item) {
                            optionsHTML += `<li><a href="javascript:;" class="items wordFormate ps-1 pe-1 dashAnnounc" id="row-${item.id}">${item.title}</a></li>`;
                        });
                    }else{
                        optionsHTML = tableNoData;
                    }
                    $('#latestAnnouncement').html(optionsHTML);

                // Internal Links Data
                $('#internalLinksList').empty();
                let internalLinksHTML = '';

                if (res.data.internalLinks && Object.keys(res.data.internalLinks).length > 0) {
                    Object.keys(res.data.internalLinks).forEach(function (key) {
                        const item = res.data.internalLinks[key];
                        const shortName = item.short_name ? ` (${item.short_name})` : '';
                        internalLinksHTML += `<li>
                            <a href="${item.url}" target="_blank" class="items wordFormate ps-1 pe-1 dashLink">
                                ${item.name}${shortName}
                            </a>
                        </li>`;
                    });
                } else {
                    internalLinksHTML = tableNoData;
                }
                
                $('#internalLinksList').html(internalLinksHTML);

                // Latest Announcement Blog table
                if(res.data.latestBlogs) {
                    if(res.data.latestBlogs.data == 0){
                        $('#dashboardLatestBlogTable').html(tableNoData);
                    }else{
                            let latestBlogsTable = `<table class="table table-hover tablecontentcss table-striped" id="latestBlogs_table"><thead><tr>
                                    <th>Publisher Name</th>
                                    <th>Title</th>
                                    </tr></thead><tbody id="latestBlogs-table-body">`;
                            let latestBlogsNum = res.data.latestBlogs.st;
                            $.each(res.data.latestBlogs.data, function (k, v) {
                                latestBlogsTable += '<tr>';
                                latestBlogsTable += '<td class="td-date">'+v.name+'</td>';
                                latestBlogsTable += '<td class="td-time text-decoration-underline cursor"><a href="javascript:;" id="row-'+v.row+'" class="dashAnnounc" style="font-size: 15px;">'+v.title+'</a></td>';
                                latestBlogsTable += '</tr>';
                                latestBlogsNum++;
                        });
                        latestBlogsTable += '</tbody></table>';
                        $('#dashboardLatestBlogTable').html(latestBlogsTable);
                    }
                }
                // Latest Announcement Reward table
                if(res.data.latestReward) {
                    if(res.data.latestReward.data == 0){
                        $('#dashboardLatestRewardTable').html(tableNoData);
                    }else{
                            let latestRewardTable = `<table class="table ttable-hover table-striped tablecontentcss" id="latestReward_table"><thead><tr>
                                    <th>Publisher Name</th>
                                    <th>Title</th>
                                    </tr></thead><tbody id="latestReward-table-body">`;
                            let latestRewardNum = res.data.latestReward.st;
                            $.each(res.data.latestReward.data, function (k, v) {
                                latestRewardTable += '<tr>';
                                latestRewardTable += '<td class="td-date">'+v.name+'</td>';
                                latestRewardTable += '<td class="td-time text-decoration-underline cursor"><a href="javascript:;" id="row-'+v.row+'" class="dashAnnounc" style="font-size: 15px;">'+v.title+'</a></td>';
                                latestRewardTable += '</tr>';
                                latestRewardNum++;
                        });
                        latestRewardTable += '</tbody></table>';
                        $('#dashboardLatestRewardTable').html(latestRewardTable);
                    }
                }
                // Latest Announcement Certification table
                if(res.data.latestCertification && $('#dashboardLatestCertificationTable').length > 0) {
                    if(res.data.latestCertification.data == 0){
                        $('#dashboardLatestCertificationTable').html(tableNoData);
                    }else{
                            let latestCertificationTable = `<table class="table ttable-hover table-striped tablecontentcss" id="latestCertification_table"><thead><tr>
                                    <th>Publisher Name</th>
                                    <th>Title</th>
                                    </tr></thead><tbody id="latestCertification-table-body">`;
                            let latestCertificationNum = res.data.latestCertification.st;
                            $.each(res.data.latestCertification.data, function (k, v) {
                                latestCertificationTable += '<tr>';
                                latestCertificationTable += '<td class="td-date">'+v.name+'</td>';
                                latestCertificationTable += '<td class="td-time text-decoration-underline cursor"><a href="javascript:;" class="dashAnnounc" id="row-'+v.row+'" style="font-size: 15px;">'+v.title+'</a></td>';
                                latestCertificationTable += '</tr>';
                                latestCertificationNum++;
                        });
                        latestCertificationTable += '</tbody></table>';
                        $('#dashboardLatestCertificationTable').html(latestCertificationTable);
                    }
                }

                // Spotlight Request List
                if (res.data.spotlight && $('#spotlightRequestList').length > 0) {
                    $('#spotlightRequestList').empty();
                    if (res.data.spotlight.length === 0) {
                        $('#spotlightRequestList').html(tableNoData);
                    }
                    const baseUrl = res.data.ips_hub_url;
                    res.data.spotlight.forEach(function (item) {
                        const url = `${baseUrl}spotlights/approval/${item.spotlight_id}`;
                        const listItem = `
                            <li>
                                <a href="${url}" target="_blank" class="items wordFormate ps-1 pe-1 dashLink">
                                    ${item.title}
                                </a>
                            </li>`;
                        $('#spotlightRequestList').append(listItem);
                    });
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    }

    $(document).on('click', '.dashAnnounc', function(){
        let rowClicked = $(this).attr('id');
        localStorage.setItem('dashAnnounClick', rowClicked);
        window.open('/announcement', '_self');
    })

    //after ajax call generic html data
    function appendDataToCard(cardSelector, data, maxItems, btnCount){
        const card = $(cardSelector);
        const parentDiv = card.closest('div');
        const btn = parentDiv.find('.show-btn');

        if (data.length > 0) {
            let optionsHTML = '';
            let remaining = 0;
            data.slice(0, maxItems).forEach(function (item) {
                optionsHTML += `<li class="menu-item" style="color:#ffab00;">${item.title}</li>`;
            });
            if (data.length > maxItems) {
                remaining = data.length - maxItems;
                btn.show();
                $(btnCount).html(remaining);
            } else {
                btn.hide();
            }
            card.html(optionsHTML);
        } else {
            btn.hide();
            card.html(`<li class="menu-item mb-3 text-muted" style="font-weight: 700; font-size: 21px;">No Data found</li>`);
        }
    }

    //after clicking show more html data
    function moreDetailHtml(data) {
        var dateList = [];
        let optionsHTML = '';

        if(data.length > 0){
            data.forEach(function (item) {

                if($.inArray(item.start, dateList) == -1) {
                    dateList.push(item.start);
                    if(dateList.length !== 0){
                        optionsHTML += '</ul>';
                    }
                    optionsHTML += `<span class="pt-4 fw-bold">${item.start}</span>`;
                    optionsHTML += '<ul>';
                }

                optionsHTML += `<li class="1menu-item" >${item.title}</li>`;
            });

            return optionsHTML;
        }else{
            return `<tr> <th></th> <td>No Data Found</td> </tr>`
        }
    }
});

$(document).ajaxStop(function() {
    $('.scrollable-list ol li').css('margin-left', '30px');
});