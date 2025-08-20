$(document).ready(function () {
    requestPage = 1;
    var searchFilterState = 0;
    let urlPath = window.location.pathname;
    let tempVideoData = null;
    //Filter on portfolio tab
    var tableFilterData = {
        'underNDA': null,
        'link': null,
        'images' : null,
        'search' : null,
        'technologyValue' : null,
        'platformType' : null,
    };

    $('#underNDAFilter , #linkFilter, #imagesFilter, #searchInputFilter, #technologyFilter, #approvedFilter, #platformTypeFilter').on('change',function () {
        getportfolioTableData();
    });

    if ( !window.location.pathname.endsWith('/edit') && !window.location.pathname.endsWith('/create') ) {
        getportfolioTableData();
    }

    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        getportfolioTableData();
    });

    // ajax call for Portfolio Table data
    function getportfolioTableData() {
        if( (urlPath != '/portfolio/create') && searchFilterState == 0){
            tableFilterData['underNDA'] = $('#underNDAFilter').prop('checked') ? 1 : null;
            tableFilterData['link'] = $('#linkFilter').prop('checked') ? 1 : null;
            tableFilterData['images'] = $('#imagesFilter').prop('checked') ? 1 : null;
            tableFilterData['search'] = $('#searchInputFilter').val() ? $('#searchInputFilter').val() : null;
            tableFilterData['technologyValue'] = $('#technologyFilter').val() ? $('#technologyFilter').val() : null;
            tableFilterData['approvedValue'] = $('#approvedFilter').val() ? $('#approvedFilter').val() : 'all';
            tableFilterData['platformType'] = $('#platformTypeFilter').val() ? $('#platformTypeFilter').val() : null;

            // hide show reset button
            const shouldApplyFilter = tableFilterData.approvedValue !== 'all' || Object.entries(tableFilterData).some(([key, value]) => key !== 'approvedValue' && value !== null);
            shouldApplyFilter ? $('.reset-search').show() : $('.reset-search').hide();

            $('#portfolioTable').append(loading());
            $.ajax({
                url: APP_URL+'/portfolio/fetch',
                type: 'GET',
                data: { page: requestPage, tableFilterData: tableFilterData},
                success: function (res) {
                    $('#portfolioTable').find('.loading-wrapper').remove(); // Remove loading message

                    if(res.count == 0){
                        $('#portfolioTable').html(tableNoData);
                    }else{
                        let detailView = res.data.detailed_view == true ? '' : 'd-none';

                        let tc = `<table class="table tablecontentcss table-hover table-striped" id="portfolioTableData"><thead class="table-light"><tr>
                                <th style="width: 70px;">No</th>
                                <th>Project Title</th>
                                <th>Technology</th>
                                <th class="text-center" style="width: 100px;">Approved</th>
                                <th class="text-center" style="width: 100px;">Origin</th>
                                <th class="text-center" style="width: 220px;">Action</th>
                                </tr></thead><tbody class="table-border-bottom-0" id="notice-table-body">`;

                        let num = res.data.st;
                        $.each(res.data.data, function (k, v) {
                            var editUrl = APP_URL+"/portfolio/" + v.id + "/edit";
                            var previewUrl = APP_URL+"/portfolio/" + v.id + "/preview";
                            tc += '<tr data-id="'+v.id+'" data-project-id="'+v.project_id+'" data-doc-id="'+v.document_id+'">';
                            tc += '<td>'+num+'</td>';
                            tc += '<td class="td-project-name cursor-pointer text-primary" style="overflow: hidden; white-space: normal; max-width: 10%;">' +
                                        '<a href="' + previewUrl + '" target="_blank" style="text-decoration: none;">' + v.project_title + '</a>' +
                                    '</td>';
                            tc += '<td class="td-tech" style="overflow: hidden; white-space: normal;max-width: 10%;">'+v.technology+'</td>';
                            tc += '<td class="td-approved-status text-center" style="overflow: hidden; white-space: normal;max-width: 10%;">'+(v.approve == 1 ? 'Yes' : 'No')+'</td>';
                            // tc += '<td class="td-description '+detailView+'" style="overflow: hidden; white-space: normal;max-width: 50%;">'+ v.description+'</td>';
                            tc += '<td class="td-origin text-center">'+v.origin+'</td>';
                            tc += '<td class="">';


                            if(res.data.permission.download == true){
                                tc += '<label class="dwnPdfPortfolio cursor-pointer ms-1 me-1" title="Download Pdf Portfolio" data-flag="Pdf">';
                                tc += '<span class="text-primary ">PDF</span> </label>';
                            }
                            if(res.data.permission.download == true){
                                tc += '<label class="dwnPdfPortfolio cursor-pointer ms-1" title="Download Docx Portfolio" data-flag="Docx">';
                                tc += '<span class="text-primary cursor">DOC</span></label>';
                            }
                            if(res.data.permission.approve == true){
                                tc +='<div class="form-check form-switch ms-2 float-start"> <input class="form-check-input approveCheck" type="checkbox" '+ (v.approve == 1 ? "checked" : "" ) +'> </div>';
                            }

                            tc += '<a href="'+ previewUrl +'" target="_blank" class="previewport cursor-pointer ms-1 me-1" title="Preview Portfolio">';
                            tc += '<span class="text-primary cursor"><i class="bx bx-show"></i></span></a>';

                            if(res.data.permission.edit == true){
                                tc += '<a href="'+ editUrl +'" class="editport cursor-pointer ms-1 me-1" title="Edit Portfolio">';
                                tc += '<span class="text-info cursor"><i class="bx bx-edit-alt"></i></span></a>';
                            }
                            if(res.data.permission.delete == true){
                                tc += '<label title="Delete Portfolio" class="deletePortfolio cursor-pointer ms-1 me-1"> <span class="text-danger cursor"> <i class="bx bx-trash"></i> </span> </label>';
                            }

                            tc += '</td></tr>';
                            num++;
                        }); 
                        tc += '</tbody>';
                        if(res.data.morePage){
                            tc += makePagination(res.data.button);
                        }
                        tc += '</table>';
                        $('#portfolioTable').html(tc);
                        var prevLink = $('#portfolioTable a.prev');
                        var nextLink = $('#portfolioTable a.next');
                        prevLink.html('<i class="tf-icon bx bx-chevron-left"></i>');
                        nextLink.html('<i class="tf-icon bx bx-chevron-right"></i>');
                    }
                    requestPage = 1;
                    searchFilterState = 0;
                },
                error: function (xhr, status, error) {
                    console.log(error);
                },
            });
        }
    }

    $(document).on('click','.deletePortfolio', function(){
        let portfolioId = $(this).closest('tr').data('id');
        let portfolioName = $(this).closest('tr').find('.td-project-name').text();

        alert('Alert!','Are you sure you want to delete this Portfolio? <br> <span>Name: ' + portfolioName + '</span>', 'text-danger')
            .then(function(result) {
                if(result){
                    $.ajax({
                        url:  APP_URL+"/portfolio/" + portfolioId + "/delete",
                        type: 'DELETE',
                        success: function(response) {
                            response.success == true ? successMessage(response.message) : errorMessage(response.message);
                            getportfolioTableData();
                        },
                        error: function(xhr, status, error) {
                            errorMessage(xhr.responseText);
                        }
                    });
                }
            });
    });

    $(document).on('click', '#resetSearchBtn', function(){
        searchFilterState = 1;
        $('#searchInputFilter').val('');
        $('#technologyFilter').val(null).trigger('change');
        $('#underNDAFilter').prop('checked', false);
        $('#linkFilter').prop('checked', false);
        $('#imagesFilter').prop('checked', false);
        $('#platformTypeFilter').val(null).trigger('change');
        $('#approvedFilter').val('all').trigger('change');
        searchFilterState = 0;
        getportfolioTableData();
    });

    // Add Portfollio btn
    $(document).on('click', '.addportfolio', function(){
        $('.modal-title').text('Add Portfolio');
    })

    // Edit portfolio form
    // $(document).on('click', '.editport', function(){
    //     var id = $(this).data('item-id');
    //     $.ajax({
    //         url: APP_URL+'/portfolio/'+ id + '/edit',
    //         type: 'GET',
    //         data: { id: id },
    //         success: function (response) {
    //             $('#project-portfolio-form').validate().resetForm();
    //             $('#project-portfolio-form .error').removeClass('error');
    //             $('#project-portfolio-form .error-message').empty();
    //             $('#validationMessages').empty();
    //             $('.modal-title').text('Edit Portfolio');
    //             $('#projectTitle').val(response.data.project_title);
    //             $('#url').val(response.data.url);
    //             $('#description').val(response.data.description);
    //             $('#keywords').val(response.data.keywords);
    //             $('#technology').val(response.data.technology);
    //             $('#devHours').val(response.data.dev_hours);
    //             $('#client').val(response.data.client);
    //             $('#developer').val(response.data.developer);
    //             $('#teamLead').val(response.data.team_lead);
    //             $('#bde').val(response.data.bde);
    //             $('#challenging_task').val(response.data.challenging_task);
    //             $('#comment').val(response.data.comment);
    //             $("#urlType option[value='"+response.data.url_type +"']"
    //             ).prop("selected", true);
    //             if(response.data.under_nda != null){
    //                 $('#underNDA').prop('checked', true);
    //             }else{
    //                 $('#underNDA').prop('checked', false);
    //             }
    //             // Move Dropzone configuration outside the modal show event
    //             // initializeDropzone(response.data.portfolioImagesPath);

    //             $('#portfolioModal').modal('show');
    //         },
    //         error: function (xhr, status, error) {
    //             console.log(error);
    //         },
    //     });
    // });


    //Check URL
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
    if ($('#productionUrl').length) {
        $('#productionUrl').on('blur', function () {
            checkURLStatus('productionUrl', 'production_url-status');
        });
    }
    
    if ($('#stagingurl').length) {
        $('#stagingurl').on('blur', function () {
            checkURLStatus('stagingurl', 'staging_url-status');
        });
    }

    // document.getElementById('figmaLink').addEventListener('blur', function () {
    //     checkURLStatus('figmaLink', 'figma_link-status');
    // });

    $.validator.addMethod('summerNoteRequired', function(value, element) {
        var content = $(element).summernote('code').trim();
        return content !== '' && content !== '<p><br></p>';
    }, 'This field is required.');
    $.validator.addMethod('summerNoteRequired', function(value, element) {
        var content = $(element).summernote('code').trim();
        return content !== '' && content !== '<p><br></p>';
    }, 'This field is required.');
    
    $.validator.addMethod('summerNoteRequired', function(value, element) {
        var content = $(element).summernote('code').trim();
        return content !== '' && content !== '<p><br></p>';
    }, 'This field is required.');
    

    //save portfolio form
    $(document).on('click', '#savePortfolio', function() {
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

        if($('#project-portfolio-form').valid()) {
            disableSubmitBtn('#savePortfolio');

            // if ($('#figmaLink').val().trim()) { 
            //     const figmaRegex = /^(https?:\/\/)?(www\.)?figma\.com\/file\/[a-zA-Z0-9]+\/?/;
                
            //     if (!figmaRegex.test(figmaLink)) {
            //         $('#figma_url-status').html(`<span class="text-danger">Invalid Figma URL</span>`);
            //         enableSubmitBtn('#savePortfolio');
            //     }
            // }
            const formData = new FormData($('#project-portfolio-form')[0]);

            // Append tempVideoData values manually
            if (typeof tempVideoData !== 'undefined' && tempVideoData !== null) {
                formData.append('video_title', tempVideoData.video_title);
                formData.append('video_description', tempVideoData.video_description);
                formData.append('video_visibility', tempVideoData.video_visibility);
                formData.append('video_attachment', tempVideoData.video_attachment); // File object
            }
            $.ajax({
                url: $('#project-portfolio-form').attr('action'),
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                beforeSend: function () {
                    $('.error-message').text('');
                },
                success: function (response) {
                    $('#videoNote').addClass('d-none');

                    $('#project-portfolio-form').validate();
                    if( urlPath == '/portfolio/create' || urlPath == '/portfolio'){
                        $('#project-portfolio-form').resetForm();
                    }
                    enableSubmitBtn('#savePortfolio');
                    successMessage(response.message);
                    $(location).attr('href', '/portfolio');
                    // if( urlPath != '/portfolio/create' ){
                    //     $('#portfolioModal').modal('hide');
                    //     getportfolioTableData();
                    // }
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
                        errorMessage(xhr.responseJSON.message);
                    }
                },
            });
        }
    });

    //Download portfolio PDF/Docx
    $(document).on('click', '.dwnPdfPortfolio', function() {
        var id = $(this).closest('tr').data('id');
        var flag = $(this).data('flag');
        window.open('/portfolio/file/download/' + id + '?flag=' + flag);
    });

    // Approve portfolio
    $(document).on('click', '.approveCheck', function() {
        let $this = $(this);
        let checkedValue = $this.prop('checked');
        let portfolioId = $this.closest('tr').data('id');
        let projectName = $this.closest('tr').find('.td-project-name').text();
        approvePortfolio(checkedValue,portfolioId,projectName, $this);
    });

    $(document).on('click', '.editApproveCheck', function() {
        let $this = $(this);
        let checkedValue = $this.prop('checked');
        let portfolioId = $('.portfolio_edit_id').val();
        let projectName = $('.portfolio_project_name').text();
        approvePortfolio(checkedValue,portfolioId,projectName, $this);
    });

    function approvePortfolio(checkedValue,portfolioId, projectName, $this){
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
    }

    toggleUrlFields();

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

    $('#cancelBtn').on('click', function() {
        $('#project-portfolio-form')[0].reset();

        if (Dropzone.instances.length > 0) {
            Dropzone.instances.forEach(function (dz) {
                dz.removeAllFiles(true);
            });
        }
    
        $('#image-preview').empty();
    
        if (urlPath != '/portfolio') {
            window.location.href = '/portfolio';
        } else {
            $('#portfolioModal').modal('hide');
        }
    });

    $(document).on('click', '#uploadYoutubeBtn', function () {
        if (tempVideoData) {
            $('#portfolioVideoModal').modal('show');
        }else{
            openVideoUploadModal();
        }
    });

    function openVideoUploadModal() {
        const $form = $('#new-portfolio-video-form');
        $form[0].reset();
        $form.trigger('reset');
        $form.validate().resetForm();
        $form.find('.error').removeClass('error');
        $form.find('.valid').removeClass('valid');
        $form.find('.input-error').removeClass('input-error');
        $('#portfolioVideoModal').modal('show');
    }

	$('#new-portfolio-video-form').validate({
		highlight: function(element, errorClass, validClass) {
			$(element).addClass(errorClass).removeClass(validClass);
			$(element).parent('div').addClass('input-error').removeClass(validClass);
		},
		unhighlight: function(element, errorClass, validClass) {
			$(element).removeClass(errorClass).addClass(validClass);
			$(element).parent('div').removeClass('input-error').addClass(validClass);
		},
		errorPlacement: function(error, element) {
			if ($(element).parent('.input-group').length) {
				$(error).insertAfter($(element).parent());
			} else {
				$(error).insertAfter($(element));
			}
		},
		rules: {
			video_title: {
				required: true,
				maxlength: 255
			},
			video_attachment: {
				required: true,
				extension: "mp4|mov|avi|mkv|webm"
			}
		},
		messages: {
			video_title: {
				required: "Title is required",
				maxlength: "The title must not be greater than 255 characters"
			},
			video_attachment: {
				required: "Upload Video is required",
				extension: "Only video files (mp4, mov, avi, mkv, webm) are allowed."
			}
		}
	});
	
	$(document).on('click', '#saveVideo', function() {
        if ($('#new-portfolio-video-form').valid()) {
            const videoFile = $('#video_attachment')[0].files[0];
            tempVideoData = {
                video_title: $('#video_title').val(),
                video_description: $('#video_description').val(),
                video_visibility: $('#video_visibility').val(),
                video_attachment: videoFile
            };
            $('#cancelUploadIcon').removeClass('d-none');
            $('#videoNote').removeClass('d-none');
            $('#portfolioVideoModal').modal('hide');
        }
    });

    $(document).on('click', '#cancelUploadIcon', function () {

        alert('Alert!', 'Are you sure you want to remove the selected video?')
        .then(function (result) {
            if (result) {
                $('#new-portfolio-video-form')[0].reset();
                $('#cancelUploadIcon').addClass('d-none');
                $('#videoNote').addClass('d-none');
                tempVideoData = null;
            }
        });
    });

    $(document).on('click', '.deleteYoutubeVideo', function () {
        const videoId = $(this).data('id');
        const portfolioId = $(this).data('portfolio-id');

        if(!videoId || !portfolioId) {
            errorMessage('Video not found or not yet uploaded.');
            return;
        }
    
        alert('Alert!', 'Are you sure you want to delete this video on YouTube?')
            .then(function (result) {
                if (result) {
                    $.ajax({
                        url: APP_URL + "/portfolio/youtube/" + videoId + "/delete",
                        type: 'DELETE',
                        data: {
                            portfolio_id: portfolioId
                        },
                        success: function (response) {
                            response.success ? successMessage(response.message): errorMessage(response.message);
                            $('#currentVideoWrapper').addClass('d-none');
                            $('.uploadeVideoBlock').removeClass('d-none');
                        },
                        error: function (xhr) {
                            errorMessage(xhr.responseText);
                        }
                    });
                }
            });
    });
});