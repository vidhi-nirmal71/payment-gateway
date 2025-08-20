$(document).ready(function () {
    requestPage = 1;
    documents();

    // Pagination click event
    $(document).on('click', '.btnClick', function () {
        requestPage = $(this).attr('data-page');
        documents();
    });

    $('#uploadedByType').select2();

    // Setup form validation
    $.validator.addMethod('filesize', function (value, element, param) {
        return this.optional(element) || (element.files[0].size <= param);
    }, 'File size must be less than {0} bytes');

    $('#documentForm').validate({
        rules: {
            title: {
                required: true,
                maxlength: 255
            },
            'attachments[]': {
                required: {
                    depends: function(element) {
                        // Required only in add mode
                        return $('input[name="_method"]').length === 0;
                    }
                },
                extension: allowedExtensions,
                filesize: (allowedMaxFileSize * 1024 * 1024) // 1000 MB
            }
        },
        messages: {
            title: {
                required: "The title is required.",
                maxlength: "The title must not exceed 255 characters."
            },
            'attachments[]': {
                required: "Please attach a document.",
                extension: "Only documents and images are allowed. (No videos)",
                filesize: "The file size must not exceed "+allowedMaxFileSize+" MB."
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass(errorClass).removeClass(validClass);
            $(element).parent('div').addClass('input-error').removeClass(validClass);
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass(errorClass).addClass(validClass);
            $(element).parent('div').removeClass('input-error').addClass(validClass);
        },
        errorPlacement: function (error, element) {
            if ($(element).parent('.input-group').length) {
                $(error).insertAfter($(element).parent());
            } else if ($(element).hasClass('select2-hidden-accessible')) {
                $(error).insertAfter($(element).next('span'));
            } else {
                $(error).insertAfter($(element));
            }
        }
    });

    $('#searchInput').on('change', function () {
		requestPage = 1;
		documents();
  	});

    $('#uploadedByType').on('change', function () {
		requestPage = 1;
		documents();
  	});

    // Save Document data
    $(document).on('click', '#saveFileForm', function (e) {
        e.preventDefault();

        if ($('#documentForm').valid()) {
            disableSubmitBtn('#saveFileForm');

            let files = $('#attachment')[0].files;
            let chunkSize = 200 * 1024 * 1024; // 200MB per chunk

            // Detect edit mode and get correct endpoint
            let isEditMode = $('#documentForm input[name="_method"]').val() === 'PUT';
            let updateId = null;
            let uploadUrl = APP_URL + '/documents/store';
            if (isEditMode) {
                // Extract id from form action
                let action = $('#documentForm').attr('action');
                let match = action.match(/\/documents\/([^\/]+)\/update/);
                if (match && match[1]) {
                    updateId = match[1];
                    uploadUrl = APP_URL + '/documents/' + updateId + '/update';
                }
            }

            // Helper to upload one file in chunks (for all files)
            function uploadFileChunks(file, fileIndex, totalFiles, onComplete) {
                let totalChunks = Math.ceil(file.size / chunkSize);
                let fileName = file.name;
                let uploadChunk = function(chunkNumber) {
                    let start = (chunkNumber - 1) * chunkSize;
                    let end = Math.min(start + chunkSize, file.size);
                    let chunkBlob = file.slice(start, end);

                    let formData = new FormData();
                    formData.append('chunk', chunkBlob);
                    formData.append('chunkNumber', chunkNumber);
                    formData.append('totalChunks', totalChunks);
                    formData.append('fileName', fileName);

                    // Only with last chunk of last file, send metadata
                    if (fileIndex === totalFiles - 1 && chunkNumber === totalChunks) {
                        formData.append('title', $('#title').val());
                        formData.append('description', $('#description').val());
                        formData.append('access_type', $('input[name="access_type"]:checked').val());
                        let teamMembers = $('#teamMember').val();
                        if (teamMembers) {
                            for (let i = 0; i < teamMembers.length; i++) {
                                formData.append('team_members[]', teamMembers[i]);
                            }
                        }
                    }

                    $.ajax({
                        url: uploadUrl,
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            if (chunkNumber < totalChunks) {
                                uploadChunk(chunkNumber + 1);
                            } else {
                                onComplete();
                            }
                        },
                        error: function (xhr) {
                            enableSubmitBtn('#saveFileForm');
                            errorMessage('Chunk upload failed.');
                        }
                    });
                };
                uploadChunk(1);
            }

            // Always upload files one-by-one, even if small
            let fileIndex = 0;
            function uploadNextFile() {
                if (fileIndex < files.length) {
                    uploadFileChunks(files[fileIndex], fileIndex, files.length, function() {
                        fileIndex++;
                        uploadNextFile();
                    });
                } else {
                    // All files uploaded, reset form
                    $('.newRowAppended').empty();
                    $('#documentForm').validate().resetForm();
                    $('.select2').trigger('change');
                    documents();
                    $('#documentModal').modal('hide');
                    enableSubmitBtn('#saveFileForm');
                    successMessage(isEditMode ? 'Document updated successfully.' : 'Files uploaded successfully.');
                }
            }
            uploadNextFile();
        }
    });    

    // Add Document button click
    $(document).on('click', '.addFile', function(){
        $('#documentModal .modal-title').text('Add Document');
        $('#documentForm').attr('action', 'documents/store');

        $('#teamMember').empty();
        $('#teamMember').val(null).trigger('change');

        $('.selected-file').hide();
        $('.attachment').hide();
        $('#attachment, #title, #description').val('');
        $('#documentForm input[name="_method"]').remove();
        $('#saveFileForm').text('Save');
        $('.uploaded-files').html('');

        $('#documentModal').modal('show');
        formValidationReset("#documentForm");
    });

    // Ajax call for fetch data
    function documents() {
        $('#documentTable').append(loading());

        let searchInput = $('#searchInput').val();
        let uploadedByType = $('#uploadedByType').val();

        $.ajax({
            url: APP_URL + '/documents/fetchdata',
            type: 'GET',
            data: { page: requestPage, search: searchInput, uploaded_by: uploadedByType },
            success: function (res) {
                if (res.data.data.length === 0) {
                    $('#documentTable').html(tableNoData);
                } else {
                    let html = `<table class="table table-striped tablecontentcss table-hover" id="docTable">
                        <thead class="table-light">
                            <tr>
                                <th width="30%">Title</th>
                                <th width="30%">Description</th>
                                <th width="8%" class="text-center">Access</th>
                                <th width="12%">Uploaded By</th>
                                <th width="12%" class="text-center">Uploaded At</th>
                                <th width="8%">Action</th>
                            </tr>
                        </thead>
                        <tbody class="table-border-bottom-0">`;

                    // <td class="text-center">${doc.sharedByOther == 'Y' ? "<i class='bx bx-check'></i> " : ''}</td>
                    $.each(res.data.data, function (k, doc) {
                        let fileListHtml = '';
                        if (doc.files.length === 1) {
                            const file = doc.files[0];
                            fileListHtml = `${file.name} (${formatFileSize(file.size)})`;
                        } else if (doc.files.length > 1) {
                            fileListHtml = '<ol class="mb-0">';
                            doc.files.forEach(file => {
                                const downloadUrl = `/documents/files/download/${file.id}`;
                                fileListHtml += `<li>${file.name} (${formatFileSize(file.size)})
                                                    <a href="${downloadUrl}"> <i class="bx bx-download cursor ps-1"></i> </a>
                                                </li>`;
                            });
                            fileListHtml += '</ol>';
                        }

                        html += `<tr data-id="${doc.id}" data-doc-id="${doc.docId}">
                                <td class="td-title">${sliceText(doc.title, 60)}</td>
                                <td class="td-description">${sliceText(doc.description, 60)}</td>
                                <td class="text-center">${doc.isPublic == 0 ? "<i class='bx bx-lock-alt text-success' title='Private'></i>" : "<i class='bx bx-lock-open-alt text-danger' title='Public'></i>"}</td>
                                <td class="td-uploadedBy">${doc.uploadedBy}</td>
                                <td class="td-uploadedAt text-center">${doc.uploadedAt}</td>
                                <td class="td-fileName d-none">${fileListHtml}</td>
                                <td class="td-sharedWith d-none">${doc.sharedWith}</td>
                                <td class="td-titleFull d-none">${doc.title}</td>
                                <td class="td-descFull d-none">${doc.description}</td>
                                <td class="td-isPublic d-none">${doc.isPublic}</td>
                                <td class="td-sharedByOther d-none">${doc.sharedByOther}</td>
                                <td>`;

                        html +=`<label title="Copy Document Link" class="text-dark cursor-pointer copyDocLink" data-link="${APP_URL}/documents/share/${doc.docId}">
                                    <i class="bx bx-copy me-1"></i></label>`;
                        html += `<label title="Download Document" class="text-secondary cursor-pointer downloadDocument">
                                    <i class="bx bx-download cursor me-2 ps-1"></i>
                                    </label>`;
                        html +=`<label title="Show Document Details" class="text-primary cursor-pointer showDocDetails" data-bs-toggle="offcanvas" data-bs-target="#showData" aria-controls="showData">
                                    <i class="bx bx-show me-1"></i></label>`;
                        if(doc.sharedByOther == 'N' || res.data.canManageForAll) {
                            html +=`<label title="Edit Document" class="text-info cursor-pointer editDoc">
                                    <i class="bx bx-edit-alt me-1"></i></label>`;
                        }
                        if (doc.sharedByOther == 'N' || res.data.canManageForAll) {
                            html += `<label title="Delete Document" class="text-danger cursor-pointer deleteDoc">
                                        <i class="bx bx-trash me-1"></i>
                                    </label>`;
                        }
                        html += `</td></tr>`;
                    });

                    html += '</tbody>';
                    if (res.data.morePage) {
                        html += makePagination(res.data.button);
                    }

                    html += '</table>';
                    $('#documentTable').html(html);
                    $('#docTable a.prev').html('<i class="tf-icon bx bx-chevron-left"></i>');
                    $('#docTable a.next').html('<i class="tf-icon bx bx-chevron-right"></i>');
                }
            },
            error: function (xhr) {
                console.log(xhr);
            }
        });
    }

    // link copy to clipboard
    $(document).on('click', '.copyDocLink', function () {
        let link = $(this).data('link');
        if(copyToClipboard(link)){
            successMessage('Link copied');
        }else{
            errorMessage('Something went wrong');
        }
    });

    // Download Document
    $(document).on('click', '.downloadDocument', function () {
        let id = $(this).closest('tr').data('doc-id');
        window.open(APP_URL + '/documents/' + id + '/download', '_blank');
    });

    // fetch team members for filter
    $('#documentModal').on('shown.bs.modal', function () {
        teamMemberDropdownRender();
    });

    $(document).on('change', 'input[name="access_type"]', function () {
        toggleTeamMemberDropdown();
    });

    function toggleTeamMemberDropdown() {
        if ($('#private').is(':checked')) {
            $('.teamMemberParent').show();
            teamMemberDropdownRender();
        } else {
            $('.teamMemberParent').hide();
        }
    }

    function teamMemberDropdownRender() {
        $('#teamMember').select2({
            dropdownParent: $('#documentModal'),
            placeholder: "Team Member",
            allowClear: false,
            minimumInputLength: 3,
            ajax: {
                dataType: 'json',
                delay: 250,
                url: APP_URL + '/search/users',
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
    }

    //View Document
    $(document).on('click', '.showDocDetails', function () {
        let $row = $(this).closest('tr');
        let id = $row.data('id');
        let docId = $row.data('doc-id');
        let title = $row.find('.td-titleFull').text().trim();
        let description = $row.find('.td-descFull').text().trim();
        let uploadedBy = $row.find('.td-uploadedBy').text().trim();
        let fileName = $row.find('.td-fileName').html();
        let sharedWith = $row.find('.td-sharedWith').text().trim();
        let uploadedAt = $row.find('.td-uploadedAt').text().trim();
        let isPublic = $row.find('.td-isPublic').text().trim() == 0 ? 'No' : 'Yes';
        let size = $row.find('.td-size').text().trim();
        let sharedByOther = $row.find('.td-sharedByOther').text().trim();

        $('.showDataTitle').text('Document Details');
        $('#showDataBody').empty();

        // Show names in bullet list format for sharedWith
        var namesArray = (sharedWith || "")
            .split(',')
            .map(function(name) { return name.trim(); })
            .filter(function(name) { return name.length > 0; });

        let bulletListHtml = '';
        let sharedByOtherRow = '';
        if (namesArray.length > 0) {
            bulletListHtml = '<ol class="mb-0">' + namesArray.map(function(name) {
                return '<li>' + name + '</li>';
            }).join('') + '</ol>';

            // Show sharedByOther only if it is 'N' and isPublic is 'No'
            sharedByOtherRow = (sharedByOther == 'N' && isPublic == 'No') ? "<tr><th>Shared With:</th><td>" + bulletListHtml + "</td></tr>" : '';
        }

        addDataToSidebar(title, description, fileName, docId, uploadedBy, uploadedAt, isPublic, sharedByOtherRow);  // Add data to sidebar

        // fetch document logs if document owned by self
        if(sharedByOther == 'N'){
            $.ajax({
                url: APP_URL + '/documents/log/' + id,
                type: 'GET',
                data: { id: id },
                success: function (res) {
                    if (res.success) {
                        if (res.success && res.data.length > 0) {
                            let logs = res.data;
                            let bulletListHtml = '<ul>';
                            logs.forEach(log => {
                                const actionType = log.action == 1 ? 'Downloaded' : 'Viewed';
                                const userName = log.user ? log.user.name : 'Unknown';
                                bulletListHtml += `<li><strong>${userName}</strong> ${actionType} at ${log.created_at}</li>`;
                            });

                            bulletListHtml += '</ul>';

                            // Append to #showDataBody
                            $('#showDataBody').append(`
                                <tr>
                                    <th>Log Details:</th>
                                    <td>${bulletListHtml}</td>
                                </tr>
                            `);
                        }
                    }
                },
                error: function(xhr) {
                    errorMessage('Failed to fetch log details');
                }
            });
        }
    });

    //edit Document popup
    $(document).on('click', '.editDoc', function () {
        let id = $(this).closest('tr').data('id');

        $('.modal-title').html('Edit Document');
        formValidationReset("#documentForm");

        $.ajax({
            url: APP_URL + '/documents/' + id + '/edit',
            type: 'GET',
            success: function (res) {
                if (res.success) {
                    const doc = res.data;
                    $('#documentForm').attr('action', APP_URL + '/documents/' + id + '/update');
                    $('#documentForm input[name="_method"]').remove();
                    $('#documentForm').append('<input type="hidden" name="_method" value="PUT">');
                    $('#attachment').removeAttr('required');

                    $('.title').val(doc.title);
                    $('.description').val(doc.description ?? '');

                    // 0 = Private, 1 = Public
                    if (doc.is_public == 1) {
                        $('#public').prop('checked', true);
                        $('.teamMemberParent').hide();
                        $('#teamMember').val(null).trigger('change');
                    } else {
                        $('.teamMemberParent').show();
                        $('#private').prop('checked', true);

                        // Preselect team members for Select2 with AJAX
                        if (doc.shared_with_users && Array.isArray(doc.shared_with_users)) {
                            const selectedUserIds = [];

                            doc.shared_with_users.forEach(user => {
                                if ($('#teamMember option[value="' + user.id + '"]').length === 0) {
                                    const newOption = new Option(user.name, user.id, true, true);
                                    $('#teamMember').append(newOption);
                                }
                                selectedUserIds.push(user.id);
                            });
                            $('#teamMember').val(selectedUserIds).trigger('change');
                        }
                    }

                    // Show selected file
                    $('.uploaded-files').empty();
                    if (doc.details && Array.isArray(doc.details)) {
                        doc.details.forEach(file => {
                            let fileHtml = `
                                <div class="uploaded-file-item d-flex justify-content-between align-items-center mb-2" data-file-id="${file.id}" title="Delete this file">
                                    <span>${file.original_name}</span>
                                    <i class="bx bx-trash me-1 text-danger remove-file" style="cursor: pointer;" data-file-id="${file.id}"></i>
                                </div>
                            `;
                            $('.uploaded-files').append(fileHtml);
                        });
                    }

                    $('#saveFileForm').text('Update');
                    $('#documentModal').modal('show');

                } else {
                    errorMessage(res.message || 'Failed to fetch document details');
                }
            },
            error: function (xhr) {
                console.log(xhr);
                errorMessage('Something went wrong!');
            }
        });
    });

    $(document).on('click', '.remove-file', function () {
        const fileId = $(this).data('file-id');
        const fileItem = $(this).closest('.uploaded-file-item');

        var confirmMsg = 'Are you sure you want to delete this file?';
		alert('Alert!', confirmMsg, 'text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: `${APP_URL}/document-files/${fileId}`,
                    type: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Ensure this meta tag exists
                    },
                    success: function (response) {
                        fileItem.remove();
                        successMessage(response.message);
                    },
                    error: function (xhr) {
                        errorMessage('Failed to delete file. Please try again.');
                    }
                });
            }
        });
    });

    //Delete Document
    $(document).on('click', '.deleteDoc', function () {
        let id = $(this).closest('tr').data('id');
        alert('Alert!','Are you sure you want to delete this file?','text-danger')
        .then(function(result) {
            if(result){
                $.ajax({
                    url: APP_URL+'/documents/' + id + '/delete',
                    type: 'DELETE',
                    success: function(response) {
                        documents();
                        successMessage(response.message);
                    },
                    error: function(xhr, status, error) {
                        console.error(xhr.responseText);
                    }
                });
            }
        });
    });

    // view from share link
    if (documentSidebar) {
        history.pushState(null, '', APP_URL + '/documents');    // Update URL

        $('.showDataTitle').text('Document Details');   // Sidebar Title
        $('#showDataBody').empty();
        let docId = documentSidebar.docId;
        let title = documentSidebar.title || '-';
        let description = documentSidebar.description || '-';
        let files = documentSidebar.uploadedFiles || '-';

        let uploadedBy = documentSidebar.uploaded_by?.name || '-';
        let uploadedAt = documentSidebar.uploadedAt || '-';
        let isPublic = documentSidebar.is_public == 1 ? 'Yes' : 'No';

        let fileListHtml = '';
        if (files.length > 0) {
            fileListHtml = '<ol class="mb-0">' + files.map(file => {
                const downloadUrl = `/documents/files/download/${file.id}`;
                return `<li> ${file.name} (${formatFileSize(file.size)})
                            <a href="${downloadUrl}" download> <i class="bx bx-download cursor ps-1"></i> </a>
                        </li>`;
            }).join('') + '</ol>';
        }

        let fileName = files.length > 0 ? fileListHtml : '-';

        // Handle shared users
        let sharedUsers = documentSidebar.shared_with_users || [];
        let bulletListHtml = '';
        if (sharedUsers.length > 0) {
            bulletListHtml = '<ol>' + sharedUsers.map(user =>
                `<li>${user.name}</li>`
            ).join('') + '</ol>';
        }

        let sharedByOtherRow = (documentSidebar.is_public == 0 && sharedUsers.length > 0) ? `<tr><th>Shared With:</th><td>${bulletListHtml}</td></tr>` : '';

        addDataToSidebar(title, description, fileName, docId, uploadedBy, uploadedAt, isPublic, sharedByOtherRow);  // Add data to sidebar

        // Now open the sidebar (trigger your offcanvas/modal if not already shown)
        $('#showData').offcanvas('show');
    }

    function formatFileSize(bytes, precision = 2) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        bytes = Math.max(bytes, 0);
        let pow = bytes ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
        pow = Math.min(pow, units.length - 1);
        const formatted = (bytes / Math.pow(1024, pow)).toFixed(precision);

        return formatted + ' ' + units[pow];
    }

    function addDataToSidebar(title, description, fileName, docId, uploadedBy, uploadedAt, isPublic, sharedByOtherRow) {
        $('#showDataBody').html(`
            <tr> <th>Title:</th> <td>${title}</td> </tr>
            <tr> <th>Description:</th> <td>${description.replace(/\n/g, '<br>')}</td> </tr>
            <tr> <th>Uploaded File(s):</th> <td> ${fileName} </td> </tr>
            <tr> <th>Download Zip:</th> <td>
                <a href="${APP_URL}/documents/${docId}/download" target="_blank" title="Click to download '${title}'">
                    Download <i class="bx bx-download cursor ps-1"></i>
                </a>
            </td> </tr>
            <tr> <th>Uploaded By:</th> <td>${uploadedBy}</td> </tr>
            <tr> <th>Uploaded At:</th> <td>${uploadedAt}</td> </tr>
            <tr> <th>Is Public:</th> <td>${isPublic}</td> </tr>
            ${sharedByOtherRow}
        `);
    }

});