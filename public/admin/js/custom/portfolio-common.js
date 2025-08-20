function initImagePreview(selector) {
    let allPreviewImages = [];
    let currentImageIndex = 0;

    $(document).on('click', selector, function () {
        const $group = $(this).closest('td').find(selector);
        allPreviewImages = $group.map(function () {
            return $(this).data('src');
        }).get();

        currentImageIndex = $group.index(this);

        showImage(currentImageIndex);
        $('#imagePreviewContainer').fadeIn();
        $(document).on('keydown.imagePreview', handleKeyNavigation); // Namespaced event
    });

    function showImage(index) {
        const screenWidth = $(window).width();
        const screenHeight = $(window).height();

        $('#previewImage').css({
            'max-width': (screenWidth - 100) + 'px',
            'max-height': (screenHeight - 100) + 'px'
        });

        $('#previewImage').attr('src', allPreviewImages[index]);
        $('#imageCounter').text(`Image ${index + 1} of ${allPreviewImages.length}`);

        $('#prevImage').toggle(index > 0);
        $('#nextImage').toggle(index < allPreviewImages.length - 1);
    }

    $('#nextImage').on('click', function () {
        if (currentImageIndex < allPreviewImages.length - 1) {
            currentImageIndex++;
            showImage(currentImageIndex);
        }
    });

    $('#prevImage').on('click', function () {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            showImage(currentImageIndex);
        }
    });

    $('#closePreview, #imagePreviewOverlay').on('click', function () {
        $('#imagePreviewContainer').fadeOut();
        $(document).off('keydown.imagePreview'); // Remove only image preview key events
    });

    function handleKeyNavigation(e) {
        if (e.key === 'ArrowRight') {
            $('#nextImage').click();
        } else if (e.key === 'ArrowLeft') {
            $('#prevImage').click();
        } else if (e.key === 'Escape') {
            $('#closePreview').click();
        }
    }
}