$(document).ready(function() {
    $("#searchInput").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        var rowIndex = 1;
        var visibleRows = 0;
        $("#uTable tbody tr").filter(function() {
            var isVisible = $(this).find("td:nth-child(2)").text().toLowerCase().indexOf(value) > -1;
            $(this).toggle(isVisible);
            if (isVisible) {
                $(this).find("td:first-child").text(rowIndex++);
                visibleRows++;
            }
        });
        if (visibleRows === 0) {
            $("#uTable tbody").append('<tr class="no-results"><td colspan="3" class="text-center">No results found</td></tr>');
        }
    });
});