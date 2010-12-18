$(document).ready(function() {
    $('pre').each(function() {
        $(this).addClass('prettyprint');
    });
    
    prettyPrint();
});