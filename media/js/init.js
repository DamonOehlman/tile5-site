TILE5DEMO = (function() {
    var module = {
        map: null,
        
        sizeCanvas: function() {
            var offset = $("#mapCanvas").offset(),
                footerHeight = $("footer").outerHeight();
            
            $("#mapCanvas")
                .attr("width", $(window).width() - offset.left)
                .attr("height", $(window).height() - offset.top - footerHeight);
        }
    };
    
    var comms = [];
    
    function processComms() {
        while (comms.length > 0) {
            var msg = comms.shift();
            document.location = msg;
        } // while
        
        setTimeout(processComms, 500);
    }
    
    // check for native device request in the url
    if ((/native/i).test(window.location.href)) {
        GRUNT.WaterCooler.addPipe(function(message, args) {
            comms.push("tile5://" + message + "/");
        });
    } // if
    
    
    setTimeout(processComms, 500);
    return module;
})();