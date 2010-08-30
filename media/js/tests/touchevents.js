$(document).ready(function() {
    var html = "";
    
    html += "<li class='touchSupport'>" + ("createTouch" in document).toString() + "</li>";
    html += "<li class='userAgent'>" + navigator.userAgent + "</li>";
    
    for (var key in window) {
            html += "<li>" + key + "</li>";
    } // for
    
    $("#events").html(html);
});

/*
document.addEventListener('mousedown', function(evt) {
    alert(evt.pageX);
}, false);
*/

document.body.addEventListener("MozTouchDown", function(evt) {
    for (var keyname in evt) {
        alert(keyname);
    }
});