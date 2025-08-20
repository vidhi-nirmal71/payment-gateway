$(document).ready(function () {
    let requestPage = 1;
    let urlPath = window.location.pathname;
    let id = urlPath.split("/").pop();
    getportfolioLogTableData();

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        getportfolioLogTableData();
    });

    $('#searchLogInput').on('keyup', function () {
		requestPage = 1;
		getportfolioLogTableData();
  	});

    function getportfolioLogTableData() {
        var searchData = $('#searchLogInput').val() ?? null;
        $('#portfolioLogTable').append(loading());
        $.ajax({
            url: APP_URL+'/portfolio/link/log/fetch',
            type: 'GET',
            data: { page: requestPage, id: id, search : searchData},
            success: function (res) {
                $('#portfolioLogTable').find('.loading-wrapper').remove(); // Remove loading message

                if(res.count == 0){
                    $('#portfolioLogTable').html(tableNoData);
                }else{
                    let tc = `<table class="table tablecontentcss table-hover table-striped" id="portfolioLogTableRecord"><thead class="table-light"><tr>
                            <th style="width:5%;">No</th>
                            <th style="width:20%;">Project Name</th>
                            <th style="width:20%;">Email</th>
                            <th style="width:15%;">IP Address</th>
                            <th style="width:20%;">User Agent</th>
                            <th style="width:5%;" title="Link Open Count">Count</th>
                            <th style="width:15%;">Action</th>
                            </tr></thead><tbody class="table-border-bottom-0" id="notice-table-body">`;

                    let num = res.data.st;
                    $.each(res.data.data, function (k, v) {
                        let userAgentShort = v.user_agent.length > 30 ? v.user_agent.substring(0, 30) + '...' : v.user_agent;
                        let actionFormatted = v.action.charAt(0).toUpperCase() + v.action.slice(1);

                        tc += '<tr>';
                        tc += '<td>'+num+'</td>';
                        tc += '<td class="td-project-name" style="overflow: hidden; white-space: normal;max-width: 10%;">'+v.project_name+'</td>';
                        tc += '<td class="td-email" style="overflow: hidden; white-space: normal;max-width: 15%;">'+v.email+'</td>';
                        tc += '<td class="td-ip_address" style="overflow: hidden; white-space: normal;max-width: 50%;">'+ v.ip_address+'</td>';
                        tc += '<td class="td-user_agent" style="overflow: hidden; white-space: normal;max-width: 50%;" title="'+v.user_agent+'">'+ userAgentShort+'</td>';
                        tc += '<td class="td-link_open_count" style="overflow: hidden; white-space: normal;max-width: 10%;">'+v.link_open_count+'</td>';
                        tc += '<td class="td-action" style="overflow: hidden; white-space: normal;max-width: 15%;">'+actionFormatted+'</td>';
                        tc += '</tr>';
                        num++;
                    }); 
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#portfolioLogTable').html(tc);
                    var prevLink = $('#portfolioLogTableRecord a.prev');
                    var nextLink = $('#portfolioLogTableRecord a.next');
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
});