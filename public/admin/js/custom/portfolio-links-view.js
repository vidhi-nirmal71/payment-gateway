$(document).ready(function () {
    requestPage = 1;
    let urlPath = window.location.pathname;
    let link = urlPath.split("/").pop();

    getportfolioLinksViewTableData();

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            var $offcanvas = $('#showPortfolioLinkData');
            var offcanvasInstance = bootstrap.Offcanvas.getInstance($offcanvas[0]);
    
            if (offcanvasInstance) {
                offcanvasInstance.hide();
            }
        }
    });

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        getportfolioLinksViewTableData();
    });

    // ajax call for Portfolio Table data
    function getportfolioLinksViewTableData() {
        // if( (urlPath != '/portfolio/create') && searchFilterState == 0){

            $('#portfolioLinksViewTable').append(loading());
            $.ajax({
                url: APP_URL+'/portfolio/link-project/fetch',
                type: 'GET',
                data: { page: requestPage, link: link},
                success: function (res) {
                    $('#portfolioLinksViewTable').find('.loading-wrapper').remove(); // Remove loading message

                    if(res.count == 0){
                        $('#portfolioLinksViewTable').html(tableNoData);
                    }else{
                        let tc = `<table class="table tablecontentcss table-hover table-striped" id="portfolioLinksViewTableData"><thead class="table-light"><tr>
                                <th style="width:5%;">No</th>
                                <th style="width:20%;">Project Title</th>
                                <th style="width:15%;">Technology</th>
                                <th style="width:10%;">Platform Type</th>
                                <th style="width:10%;">Industry</th>
                                <th style="width:10%;">Country</th>
                                <th style="width:5%;">Under NDA</th>
                                <th style="width:5%;">Action</th>
                                </tr></thead><tbody class="table-border-bottom-0" id="notice-table-body">`;

                        let num = res.data.st;
                        $.each(res.data.data, function (k, v) {
                            tc += '<tr>';
                            tc += '<td>' + num + '</td>';
                            tc += `<td class="showportfolioDetails cursor-pointer text-primary" data-bs-toggle="offcanvas" data-bs-target="#showPortfolioLinkData" aria-controls="offcanvasEnd" title="Show Details">${sliceText(v.project_title,60)}</td>`;
                            tc += '<td class="td-technology">' + v.technology + '</td>';
                            tc += '<td class="td-team-lead d-none">' + v.team_lead + '</td>';
                            tc += '<td class="td-platform-type">' + v.platform_type + '</td>';
                            tc += '<td class="td-industry">' + v.industry + '</td>';
                            tc += '<td class="td-country">' + v.country + '</td>';
                            tc += '<td class="td-origin d-none">' + v.origin + '</td>';
                            tc += '<td class="td-under-nda">' + v.under_nda + '</td>';
                            tc += '<td class="td-dev-hours d-none">' + v.dev_hours + '</td>';

                            // Hidden columns
                            tc += '<td class="td-project-id d-none">' + v.id + '</td>';
                            tc += '<td class="td-figma-link d-none">' + v.figma_link + '</td>';
                            tc += '<td class="td-production-url d-none">' + v.production_url + '</td>';
                            tc += '<td class="td-staging-url d-none">' + v.staging_url + '</td>';
                            tc += '<td class="td-description d-none">' + v.description + '</td>';
                            tc += '<td class="td-database d-none">' + v.database + '</td>';
                            tc += `<td class="td-images d-none" data-images='${JSON.stringify(v.images)}'></td>`;
                            tc += '<td class="text-center">';
                            tc += '<label class="showportfolioDetails cursor-pointer" data-bs-toggle="offcanvas" data-bs-target="#showPortfolioLinkData" aria-controls="offcanvasEnd">';
                            tc += '<span class="text-primary cursor"><i class="bx bx-show me-1"></i></span></label>';
                            tc += '</td>';
                            tc += '</tr>';
                            num++;
                        });
                        tc += '</tbody>';
                        if(res.data.morePage){
                            tc += makePagination(res.data.button);
                        }
                        tc += '</table>';
                        $('#portfolioLinksViewTable').html(tc);
                        var prevLink = $('#portfolioLinksViewTable a.prev');
                        var nextLink = $('#portfolioLinksViewTable a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }
                    requestPage = 1;
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        // }
    }

    //Show Portfolio
    $(document).on('click', '.showportfolioDetails', function(e) {
        var row = $(this).closest('tr');
        var projectId = row.find('.td-project-id').first().text().trim();

        if(projectId){
            $.ajax({
                url: APP_URL + "/portfolio/link/view-project/store",
                method: "POST",
                dataType: "json",
                data: {
                    projectId: projectId,
                    link: link,
                },
                success: function (response) {                   
                },
                error: function () {
                }
            });
        }

        var projectTitle = row.find('.td-project-title').first().text().trim();
        // var teamLead = row.find('.td-team-lead').first().text().trim();
        var technology = row.find('.td-technology').first().text().trim();
        var platformType = row.find('.td-platform-type').first().text().trim();
        var industry = row.find('.td-industry').first().text().trim();
        var country = row.find('.td-country').first().text().trim();
        // var origin = row.find('.td-origin').first().text().trim();
        var underNda = row.find('.td-under-nda').first().text().trim();
        // var devHours = row.find('.td-dev-hours').first().text().trim();

        // Hidden fields
        var figmaLink = row.find('.td-figma-link').first().text().trim();
        var productionUrl = row.find('.td-production-url').first().text().trim();
        var stagingUrl = row.find('.td-staging-url').first().text().trim();
        var database = row.find('.td-database').first().text().trim();
        var description = row.find('.td-description').first().html().trim();
        var imagesData = row.find('.td-images').data('images');
        let imageHtml = '';
        if (Array.isArray(imagesData)) {
            imagesData.forEach(img => {
                imageHtml += `
                    <img src="${img.path}" alt="${img.name}" title="Click to view Image" class="portfolio-image-preview" data-src="${img.full_url}" style="max-width: 100px; margin: 5px; cursor: pointer;"/>`;
            });
        }

        $('.showPortfolioLinkDataTitle').text('Project Details');
        let htmlData = '';

        if (underNda && underNda.toLowerCase() === 'yes') {
            htmlData += `
                <tr>
                    <td colspan="2">
                        <div style="color: #d8000c; font-weight: bold;">
                            🚫 This project is under NDA. Do not share it with anyone.
                        </div>
                    </td>
                </tr>
            `;
        }
        
        if (projectTitle && projectTitle !== '-') htmlData += `<tr><th>Project Title:</th> <td>${projectTitle}</td></tr>`;
        // if (teamLead && teamLead !== '-') htmlData += `<tr><th>Team Lead:</th> <td>${teamLead}</td></tr>`;
        if (technology && technology !== '-') htmlData += `<tr><th>Technology:</th> <td>${technology}</td></tr>`;
        if (platformType && platformType !== '-') htmlData += `<tr><th>Platform Type:</th> <td>${platformType}</td></tr>`;
        if (industry && industry !== '-') htmlData += `<tr><th>Industry:</th> <td>${industry}</td></tr>`;
        if (country && country !== '-') htmlData += `<tr><th>Country:</th> <td>${country}</td></tr>`;
        // if (origin && origin !== '-') htmlData += `<tr><th>Origin:</th> <td>${origin}</td></tr>`;
        // if (devHours && devHours !== '-') htmlData += `<tr><th>Dev Hours:</th> <td>${devHours}</td></tr>`;
        if (figmaLink && figmaLink !== '-') htmlData += `<tr><th>Figma Link:</th> <td>${figmaLink}</td></tr>`;
        if (productionUrl && productionUrl !== '-') htmlData += `<tr><th>Production URL:</th> <td>${productionUrl}</td></tr>`;
        if (stagingUrl && stagingUrl !== '-') htmlData += `<tr><th>Staging URL:</th> <td>${stagingUrl}</td></tr>`;
        if (database && database !== '-') htmlData += `<tr><th>Database:</th> <td>${database}</td></tr>`;
        if (description && description !== '-') htmlData += `<tr><th style="vertical-align: top;">Description:</th> <td>${description}</td></tr>`;

        if (Array.isArray(imagesData) && imagesData.length > 0) {
            let imageHtml = '';
            imagesData.forEach(img => {
                imageHtml += `
                    <img src="${img.path}" alt="${img.name}" title="Click to view Image" class="portfolio-image-preview" data-src="${img.full_url}" style="max-width: 100px; margin: 5px; cursor: pointer;"/>`;
            });
            htmlData += `<tr><th style="vertical-align: top;">Screenshots:</th> <td>${imageHtml}</td></tr>`;
        }

        $('#showPortfolioLinkDataBody').html(htmlData);
        
    });
    
    // Image preview functionality with previous and next buttons
    $('#closePreview, #imagePreviewOverlay').on('click', function () {
        $('#imagePreviewContainer').fadeOut();
    });

    // Function to initialize image preview
    initImagePreview('.portfolio-image-preview');
});