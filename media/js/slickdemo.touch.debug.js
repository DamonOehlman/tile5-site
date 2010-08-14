// initialise variables
var totalMove = null;
var touchDown = null;

$(document).ready(function() {
    $("#mainview").height($(window).height()).width($(window).width());
    
    var canvas = $("#mainview").get(0);
    var context = canvas.getContext('2d');
    
    // initailise the canvas width and height
    canvas.width = $("#mainview").width();
    canvas.height = $("#mainview").height();
    
    // touch enable the main view
    $("#mainview").canTouchThis({
        touchStartHandler: function(x, y) {
            touchDown = new SLICK.Vector(x, y);
            totalMove = new SLICK.Vector();
            $("#debuginfo").html("touch start @ " + touchDown);
            
            context.beginPath();
            context.moveTo(x, y);
        },
        tapHandler: function(x, y) {
            $("#debuginfo").html("tapped @ " + x + ", " + y);
        },
        doubleTapHandler: function(x, y) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        },
        moveHandler: function(x, y) {
            totalMove.x += x;
            totalMove.y += y;

            $("#debuginfo").html("total move from first touch = " + totalMove);
            
            if (touchDown && totalMove) {
                context.lineTo(touchDown.x + totalMove.x, touchDown.y + totalMove.y);
                context.stroke();
            } // if
        }
    });
});