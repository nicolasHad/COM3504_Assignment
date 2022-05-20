$(document).ready(function () {
    $('#selection_mainPage').on('change', function () {
        if (this.value === 'Join a room') {
            $("#initial_form").show();
            $("#storiesBody").hide();
        } else {
            $("#storiesBody").show();
            $("#initial_form").hide();
        }
    });
});
