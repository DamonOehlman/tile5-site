TUTOR = (function() {
    
    var maps = {},
        sampleRun = {},
        commonProvider = new T5.Geo.Cloudmade.MapProvider({
            apikey: "7960daaf55f84bfdb166014d0b9f8d41"
        });
    
    function createDemoCanvas(pre) {
        $(pre).after('<div class="showme"><canvas id="map_' + pre.id + '"></canvas></div>');
    } // createDemoCanvas
    
    function getMap(pre) {
        // if the map has not been created then do that now
        if (! maps[pre.id]) {
            var map = new T5.Map({
                container: 'map_' + pre.id,
                provider: commonProvider
            });
            
            // add the map to the list
            maps[pre.id] = map;
        } // if
        
        return maps[pre.id];
    } // getMap
    
    
    function showMe(pre) {
        COG.Log.info('showing example: ' + pre.id);
        
        // look for a canvas that has been setup for the map
        var demoCanvas = $('#map_' + pre.id)[0],
            map;
        
        // if the canvas doesn't exist, then create it
        if (! demoCanvas) {
            createDemoCanvas(pre);
        } // if
        
        // get the map for the current demo
        map = getMap(pre);
        
        // reset the map state
        map.markers.clear();
        
        // run the tutorial
        TUTOR.tutorials[pre.id](map);

        // track running the sample
        if (! sampleRun[pre.id]) {
            // track the tutorial sample
            track('Run Tutorial Sample', {
                tutorial: $('h1').html(),
                sample: pre.id
            });

            sampleRun[pre.id] = true;
        } // if
    } // showMe
    
    function linky() {
        var reT5 = /\s(T5\.\S+)/;
        
        // iterate through each paragraph and 
        $('p').each(function() {
            var content = $(this).html(),
                match = reT5.exec(content),
                counter = 0;
                
            // while we have a match, do the replacement
            while (match) {
                content = content.replace(match[0], ' <code>' + match[1] + '</code>');
                
                reT5.lastIndex = -1;
                match = reT5.exec(content);
            } // if
            
            $(this).html(content);
        });
    } // linky
    
    function loadSnippets() {
        $('pre')
            .each(function() {
                if (TUTOR.tutorials[this.id]) {
                    // get the script text
                    var scriptText = TUTOR.tutorials[this.id].toString();
                    
                    // replace the outer function call
                    scriptText = scriptText
                        .replace(/^function.*?\{\n?/, "")
                        .replace(/\}.*$/, "")
                        .replace(/^[ ]{0,4}(.*)$/mg, '$1');
                    
                    // update the html block
                    $(this).html(scriptText);
                
                    // add a show me link
                    $(this).after('<a href="#' + this.id + '" class="showme">Show Me</a>');
                } // if
            });
            
        $('a.showme').click(function() {
            // get the target example id
            var targetId = this.href.replace(/^.*(#.*)$/, '$1');
            
            showMe($(targetId)[0]);
        });
    } // loadSnippet
    
    function track(text, params) {
        if (location.host.indexOf('tile5.org') >= 0) {
            mpmetrics.track(text, params);
        }
        else {
            COG.Log.info('tracking disabled [dev url]');
        }
    } // trackTutorial
    
    var module = {
        tutorials: {}
    };
    
    $(document).ready(function() {
        loadSnippets();
        linky();

        track('Tutorial', {
            title: $('h1').html()
        });
    });
    
    return module;
})();