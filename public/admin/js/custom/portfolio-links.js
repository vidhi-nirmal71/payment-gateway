$(document).ready(function () {
    let requestPage = 1;
    let urlPath = window.location.pathname;
    let selectedProjects = {};
    getportfolioLinksTableData();

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        getportfolioLinksTableData();
    });

    $('#ndaPortfolio').change(function() {
        if($('#searchPortfolio').val()){
            getPortfolio();
        }
    });

    $('#linkStatus').on('change', function () {
		getportfolioLinksTableData();
  	});

    // ajax call for Portfolio Table data
    function getportfolioLinksTableData() {
        $('#portfolioLinksTable').append(loading());
        var linkStatus = $('#linkStatus').val() ?? null;

        $.ajax({
            url: APP_URL+'/portfolio/link/fetch',
            type: 'GET',
            data: { page: requestPage, linkStatus: linkStatus },
            success: function (res) {
                $('#portfolioLinksTable').find('.loading-wrapper').remove(); // Remove loading message

                if(res.count == 0){
                    $('#portfolioLinksTable').html(tableNoData);
                }else{
                    let tc = `<table class="table tablecontentcss table-hover table-striped" id="portfolioLinksTableData"><thead class="table-light"><tr>
                            <th style="width:5%;">No</th>
                            <th style="width:60%;">Project Names</th>
                            <th style="width:15%;">Expiry Time</th>
                            <th style="width:10%;">Email</th>
                            <th style="width:10%;">Created By</th>
                            <th style="width:10%;" class="text-center">Action</th>
                            </tr></thead><tbody class="table-border-bottom-0" id="notice-table-body">`;

                    let num = res.data.st;
                    $.each(res.data.data, function (k, v) {
                        tc += '<tr>';
                        tc += '<td>'+num+'</td>';
                        tc += '<td><a href="'+APP_URL+'/portfolio/link/details/'+v.id+'" class="project-name-link td-portfolio-name portfolio-link" title="Show Details">'+v.portfolio_names+'</a></td>';
                        tc += '<td class="td-expiry_time '+ v.status_color +'">'+v.expiry_time+'</td>';
                        tc += '<td class="td-is_email">'+v.is_email+'</td>';
                        tc += '<td class="td-is_email">'+v.created_by+'</td>';
                        tc += '<td class="text-center">';
                        tc += '<span class="text-primary cursor-pointer copy-link" title="Copy Link" data-link="' + APP_URL + "/portfolio/link/view/" + v.link + '" title="Copy Link">';
                        tc += '<i class="bx bx-copy me-1"></i></span>';
                        if(res.data.permission.view == true){
                            tc += '<a href="'+APP_URL+'/portfolio/link/details/'+v.id+'" class="showPortfolio cursor-pointer" title="Show Details">';
                            tc += '<span class="text-primary cursor"><i class="bx bx-show me-1"></i></span></a>';
                        }
                        if(res.data.permission.delete == true){
                            tc += '<label title="Delete Portfolio Link" class="deletePortfolioLink cursor-pointer" data-id="'+v.id+'" data-portfolio-link="' + APP_URL + "/portfolio/link/view/" + v.link + '""> <span class="text-danger cursor"><i class="bx bx-trash me-1"></i></span> </label>';
                        }

                        tc += '</td></tr>';
                        num++;
                    }); 
                    tc += '</tbody>';
                    if(res.data.morePage){
                        tc += makePagination(res.data.button);
                    }
                    tc += '</table>';
                    $('#portfolioLinksTable').html(tc);
                    var prevLink = $('#portfolioLinksTable a.prev');
                    var nextLink = $('#portfolioLinksTable a.next');
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

    // $(document).on('click', '.showPortfolio', function(){
    //     let portfolioId = $(this).closest('tr').find('.deletePortfolioLink').data('id');
    
    //     $.ajax({
    //         url: APP_URL + '/portfolio/link/log/' + portfolioId + '/show',
    //         type: 'GET',
    //         success: function (res) {
    //             console.log('res: ', res);
    //             let logsHtml = '';
    
    //             $('.showPortfolioTitle').text('Portfolio Link Log Details');
    //             $('#showPortfolioBody').html(logsHtml);
    //             $('#showPortfolio').offcanvas('show');
    //         },
    //         error: function(xhr, status, error) {
    //             console.log(error);
    //         }
    //     });
    // });

    // Copy link functionality
    $(document).on('click', '.copy-link', function () {
        let link = $(this).data('link');
        if(copyToClipboard(link)){
            successMessage('Link copied');
        }else{
            errorMessage('Something went wrong');
        }
    });

    $(document).on('click', '.common-close-portfolio-button', function() {
        $('#searchPortfolio').val('');
        $('#ndaPortfolio').prop('checked', false);
        $('#generatedUrl').val('');
        $('#generatedUrlContainer').hide();
        $('#expiryTime').val("").trigger('change');
        $('#selectedProjectsDiv').empty();
        selectedProjects = {};

        var modal = $(this).closest('.modal');
        if(modal.find('form').length > 0){
            modal.find('form')[0].reset();
            modal.find('form').hide();
        }
        modal.modal('hide');
    });

    $(document).on('click','.deletePortfolioLink', function () {
        let portfolioLinkId = $(this).data('id');
        let portfolioLink = $(this).data('portfolio-link');
    
        alert('Alert!','Are you sure you want to delete this Portfolio Link? <br> <a href="' + portfolioLink + '" target="_blank" rel="noopener noreferrer"> '+ portfolioLink + '</a>','text-danger')
            .then(function(result) {
                if(result){
                    $.ajax({
                        url:  APP_URL+"/portfolio/link/" + portfolioLinkId + "/delete",
                        type: 'DELETE',
                        success: function(response) {
                            response.success == true ? successMessage(response.message) : errorMessage(response.message);
                            getportfolioLinksTableData();
                        },
                        error: function(xhr, status, error) {
                            errorMessage(xhr.responseText);
                        }
                    });
                }
            });
    });
    
    $("#searchPortfolio").on("keyup", function () {
        getPortfolio();
    });

    function getPortfolio() {
        let searchTerm = $('#searchPortfolio').val().trim();
        let ndaProjectFilter = $('#ndaPortfolio').is(':checked') ? 1 : 0;
        let form = $('#portfolioLinkGenerateForm');
        let selectedProjectDiv = $('#selectedProjectsDiv').children().length;
        let list = $("#portfolioResults");
    
        if (searchTerm.length >= 3) {
            $.ajax({
                url: APP_URL + '/portfolio/search/data',
                method: 'GET',
                dataType: 'json',
                data: {
                    search: searchTerm,
                    nda: ndaProjectFilter,
                },
                success: function (res) {
                    list.empty();
                    form.show();
                    $('.searchResultDiv').show();

                    if (res.data.length === 0) {
                        list.append('<li style="all: unset;">No results found</li>');
                        if (selectedProjectDiv > 0) {
                            showPortfolioFormSections();
                        } else {
                            resetGeneratedLinkSection();
                            hidePortfolioFormSections();
                        }
                    } else {
                        $.each(res.data, function (index, item) {
                            const isChecked = selectedProjects.hasOwnProperty(item.data_id) ? 'checked' : '';
                            const labelClass = item.under_nda ? 'text-danger' : '';

                            list.append(`
                                <li class="list-group-item">
                                    <label for="portfolioCheckbox-${index}" class="w-100 d-flex align-items-center ${labelClass}">
                                        <input type="checkbox" class="portfolioCheckbox me-2" value="${item.data_id}" id="portfolioCheckbox-${index}" data-title="${item.project_title}" data-encrypted="${item.id}" ${isChecked}>
                                        ${item.project_title}
                                    </label>
                                </li>
                            `);
                        });
    
                        showPortfolioFormSections();
                        generateUrlButtonEnableDisable();
                    }
                }
            });
        } else {
            if (selectedProjectDiv > 0) {
                form.show();
                $('.searchResultDiv').hide();
                generateUrlButtonEnableDisable();
            } else {
                resetGeneratedLinkSection();
                generateUrlButtonEnableDisable();
                form.hide();
            }
        }
    }    
    

    function generateUrlButtonEnableDisable() {
        let selectedCheckboxes = $("#selectedProjectsDiv").length;
        if (selectedCheckboxes >= 1 && selectedCheckboxes != 0 && $('#expiryTime').val()) {
            enableGenerateButton();
        } else {
            disableGenerateButton();
        }
    }

    // Generate URL on button click
    $("#generateUrlBtn").on("click", function (e) {
        e.preventDefault();

        let is_email = $('#emailRequired').is(':checked') ? 1 : 0;
        let expiryTime = $('#expiryTime').val();
        let expiryError = $('#expiryError');
        let selectedKeys = Object.values(selectedProjects).map(item => item.encryptedId);
        //Check expiry time
        if (!expiryTime) {
            expiryError.removeClass('d-none');
            return;
        } else {
            expiryError.addClass('d-none');
        }

        if (selectedKeys.length > 0 && expiryTime) {
            let randomString = generateRandomString(12);
            let nda = $('#ndaPortfolio').is(':checked') ? 1 : 0

            $.ajax({
                url: APP_URL + "/portfolio/link/store",
                method: "POST",
                dataType: "json",
                data: {
                    link: randomString,
                    portfolio_ids: selectedKeys,
                    is_email: is_email,
                    expiry_time: expiryTime,
                    is_nda: nda,
                },
                success: function (response) {
                    if (response.success) {
                        let generatedUrl = APP_URL + "/portfolio/link/view/" + randomString;
                        getportfolioLinksTableData();
                        // Show URL with copy button
                        $("#generatedUrlContainer").html(`
                            <div class="input-group mt-3">
                                <input type="text" class="form-control" id="generatedUrl" value="${generatedUrl}" readonly>
                                <button class="btn btn-secondary" id="copyUrlBtn">Copy</button>
                            </div>
                        `).show();
                        $('#closeModal').show();
                        generateUrlButtonEnableDisable();
                    } else {
                        $('#closeModal').hide();
                        errorMessage("Error saving data. Please try again.");
                    }
                },
                error: function () {
                    $('#closeModal').hide();
                    errorMessage("An error occurred while saving data.");
                }
            });
        }
    });

    // Copy URL to clipboard
    $(document).on("click", "#copyUrlBtn", function (e) {
        e.preventDefault();
        $("#generatedUrl").select();
        document.execCommand("copy");
        successMessage("URL copied to clipboard!");
    });

    function generateRandomString(length = 10) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    $(document).on("change", "#expiryTime, #ndaPortfolio, .portfolioCheckbox", function () {
        generateUrlButtonEnableDisable();
    });

    function disableGenerateButton() {
        $("#generateUrlBtn").prop("disabled", true).addClass("blur-button").hide();
    }
    
    function enableGenerateButton() {
        $("#generateUrlBtn").prop("disabled", false).removeClass("blur-button").show();
    }

    $(document).on('change', '.portfolioCheckbox', function () {
        const projectId = $(this).val();
        const projectTitle = $(this).data('title');
        const encryptedId = $(this).data('encrypted');
    
        if ($(this).is(':checked')) {
            selectedProjects[projectId] = {
                title: projectTitle,
                encryptedId: encryptedId,
            };
        } else {
            delete selectedProjects[projectId];
        }
    
        renderSelectedProjects();
    });

    function renderSelectedProjects() {
        let container = $('#selectedProjectsDiv');
        container.empty();
    
        if (Object.keys(selectedProjects).length === 0) {
            container.hide();
            $('#generatedUrlContainer').hide();
            $('#generatedUrl').val('');
            $('#expiryTime').val("").trigger('change');
            generateUrlButtonEnableDisable();
            return;
        }
    
        container.show();
    
        $.each(selectedProjects, function (id, item) {
            container.append(`
                <span class="badge d-inline-flex align-items-center px-3 py-2 text-bg-light border border-primary rounded-pill me-2 mb-2">
                    <span class="me-2 text-primary fw-semibold">${item.title}</span>
                    <span class="ms-2 btn-project-close text-secondary fw-bold cursor-pointer remove-project" data-id="${id}"style="font-size: 1rem; line-height: 1;">×</span>
                </span>
            `);
        });
    }
    $(document).on('click', '.btn-project-close', function () {
        const id = $(this).data('id');
        delete selectedProjects[id];
    
        $(`.portfolioCheckbox[value="${id}"]`).prop('checked', false); // uncheck in list
        renderSelectedProjects();
    });
    
    function resetGeneratedLinkSection() {
        $('#generatedUrlContainer').hide();
        $('#generatedUrl').val('');
    }
    
    function showPortfolioFormSections() {
        $('.expiryTimeBlock').show();
        $('.requiredEmailDiv').show();
        generateUrlButtonEnableDisable();
    }
    
    function hidePortfolioFormSections() {
        $('.expiryTimeBlock').hide();
        $('.requiredEmailDiv').hide();
        generateUrlButtonEnableDisable();
    }
});