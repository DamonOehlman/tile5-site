(function() {
    $(document).ready(function() {
        if (! Modernizr.canvas) {
            var warning = '<p class="canvas-fail">' + 
                'Unfortunately the browser you are using does not support canvas, which means ' + 
                'that Tile5 will not function - at all. If you are interested in trying to bring ' + 
                'canvas support to your current browser (likelihood is that it is Internet Explorer) ' + 
                'please consider supporting this ' + 
                '<a href="http://www.challengepost.com/challenge/tile5-canvas-polyfill-challenge">challenge</a>' + 
                ' to bring a more fullsome canvas polyfill to IE.</p>';
            
            $('#main').prepend(warning);
        } // if
    });
})();