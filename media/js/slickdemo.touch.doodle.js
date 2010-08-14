// initialise variables
var totalMove = null;
var touchDown = null;

$(document).ready(function() {
    $("#mainview").height($(window).height()).width($(window).width());
    
    var canvas = $("#mainview").get(0);
    var context = canvas.getContext('2d');
    var savedBackground = null;
    
    // initailise the canvas width and height
    canvas.width = $("#mainview").width();
    canvas.height = $("#mainview").height();
    
    // touch enable the main view
    $("#mainview").canTouchThis({
        minMoveDist: 0,
        touchStartHandler: function(x, y) {
            touchDown = new SLICK.Vector(x, y);
            totalMove = new SLICK.Vector();
            
            context.beginPath();
            context.moveTo(x, y);
        },
        doubleTapHandler: function(x, y) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            $("#debuginfo").html("Cleared...").slideDown('normal', function() {
                setTimeout(function() {
                    $("#debuginfo").html('').slideUp();
                }, 2000);
            });
        },
        
        pinchZoomHandler: function(touchesStart, touches_current) {
            // get the rectangle for the current rect
            var startRect = touchesStart.getRect();
            var rect = touches_current.getRect();
            
            // if we don't have a saved background, then get it
            if (! savedBackground) {
                savedBackground = context.getImageData(0, 0, canvas.width, canvas.height);
            }
            // otherwise, restore the saved background
            else {
                context.putImageData(savedBackground, 0, 0, canvas.width, canvas.height);
            } // if..else
            
            // now draw the rectangle
            context.beginPath();
            context.strokeRect(startRect.origin.x, startRect.origin.y, startRect.dimensions.width, startRect.dimensions.height);
            context.strokeRect(rect.origin.x, rect.origin.y, rect.dimensions.width, rect.dimensions.height);
            context.stroke();
        },
        
        pinchZoomEndHandler: function(touches_start, touches_end) {
            // clear the saved background
            savedBackground = null;
        },
        
        moveHandler: function(x, y) {
            totalMove.x += x;
            totalMove.y += y;

            if (touchDown && totalMove) {
                context.lineTo(touchDown.x + totalMove.x, touchDown.y + totalMove.y);
                context.stroke();
            } // if
        }
    });
});