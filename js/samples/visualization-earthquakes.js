QUAKES = (function() {
    var YQL_QUERY = "http://query.yahooapis.com/v1/public/yql?format=json&q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.iris.edu%2Fservlet%2Feventserver%2FeventsXML.do%3Fpriority%3Dtime%26PointsMax%3D200%26LatMax%3D82.81%26LatMin%3D-70.14%26LonMax%3D178.95%26LonMin%3D-171.21'",
        TIME_INCREMENT = 120000,
        DAY_MILLIS = 86400000,
        HOUR_MILLIS = 3600000,
        START_DATE = '2011/03/11 04:00:00.000',
        reDate = /(\d{4})\/(\d{2})\/(\d{2})\s(\d{2})\:(\d{2}).*/,
        map,
        quakes = [],
        quakeIdx = 0,
        currentTime;
        
    /* drawable implementation */
    
    var Quake = function(params) {
        
        function prepPath(context, offsetX, offsetY, width, height, state) {
            var alpha = Math.max(0.01, 1 - (currentTime.getTime() - this.dt.getTime()) / (HOUR_MILLIS*2));
            
            context.fillStyle = 'hsla(' + Math.max(360, this.dkm / 50) + ', 50%, 50%, ' + alpha + ')';
            context.strokeStyle = 'rgba(0, 0, 0, 0)';
            
            context.beginPath();
            context.arc(
                this.xy.x - offsetX,
                this.xy.y - offsetY,
                this.size >> 1,
                0,
                Math.PI * 2,
                false
            );

            return true;
        } // prepPath
        
        // call the inherited constructor
        T5.Drawable.call(this, params);
        
        // override default drawable behaviour
        COG.extend(this, {
            prepPath: prepPath
        });
    };
    
    Quake.prototype = COG.extend(T5.Drawable.prototype, {
        constructor: Quake
    });
    
    /* internal functions */
    
    function createClock() {
        $('#mapContainer').before('<div id="quakeClock"></div>');
        $('#quakeClock').css({
            background: '#f8f8f8',
            padding: '6px',
            margin: '10px',
            'text-align': 'center',
            '-webkit-border-radius': '4px',
            '-moz-border-radius': '4px'
        });
    } // createClock
            
    function createMap() {
        map = T5.Map({
            // Point to which canvas element to draw in
            container: 'mapCanvas'
        });
        
        map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
                // demo api key, register for an API key
                // at http://dev.cloudmade.com/
                apikey: '7960daaf55f84bfdb166014d0b9f8d41',
                styleid: 3
        }));     
        
        map.gotoPosition(T5.Geo.Position.init(37.09, 139.22), 4);
    } // createMap
    
    function displayData(data) {
        if (! data.query.results) {
            loadCached();
            return;
        } // if
        
        parseData(data.query.results);
        DEMO.status();
        
        createClock();
        setTimeout(runClock, 0);
    } // displayData
    
    function loadCached() {
        DEMO.status('Request failed - using cached data');
        $.ajax({
            url: '/js/data/cached-quakes.json',
            dataType: 'json',
            success: displayData
        });
    } // loadCached
    
    function parseData(results) {
        if (! results.events) {
            DEMO.status('No events found - unable to display', 1000);
            return;
        } // if
        
        DEMO.status('Parsing data');
        
        var events = results.events.event;
        
        // add the quakes in chronoligical order (feed returns them in reverse)
        for (var ii = events.length; ii--; ) {
            var quakePos = T5.Geo.Position.parse(events[ii].lat + ' ' + events[ii].lng),
                quakeMag = parseFloat(events[ii].mag),
                quake = new Quake({
                    // standard drawable properties
                    xy: T5.GeoXY.init(quakePos),
                    transformable: true,
                    fill: true,
                    size: quakeMag * 5 | 0,

                    // custom quake properties
                    dt: parseDate(events[ii].date),
                    mag: quakeMag,
                    dkm: parseFloat(events[ii].dkm)
                });
            
            quakes[quakes.length] = quake;
        } // for
        
        quakeIdx = 0;
        while (quakeIdx < quakes.length && quakes[quakeIdx].dt < currentTime) {
            quakeIdx++;
        } // while
        
        COG.info('first quake index = ' + quakeIdx);
    } // if
    
    function parseDate(inputStr) {
        var matches = reDate.exec(inputStr);
        if (matches) {
            return new Date(Date.UTC(
                matches[1], // year
                matches[2], // month
                matches[3], // minutes
                matches[4], // hours
                matches[5]  // minutes
            ));
        } // if

        return null;
    } // parseDate    
    
    function runClock() {
        // update the current time
        $('#quakeClock').html(currentTime.toString());
        map.invalidate();
        
        // while the quake time is less than the current display and goto the next
        while (quakeIdx < quakes.length && quakes[quakeIdx].dt < currentTime) {
            var marker = quakes[quakeIdx];
            
            
            // animate the marker
            marker.scale(0.1);
            marker.animate('scale', [0.1], [1], 'back.out', 2000, function() {
                // marker.animate('scale', [1], [0], 'sine.in', 1000);
            });
            
            // add the marker
            map.markers.add(marker);
            
            quakeIdx++;
        } // while
        
        // increment the current time by five minutes
        currentTime = new Date(currentTime.getTime() + TIME_INCREMENT);
        if (quakeIdx >= quakes.length) {
            DEMO.status('End of Data');
        } // if
        
        setTimeout(runClock, 100);
    } // runClock
    
    createMap();
    
    currentTime = parseDate(START_DATE);
    COG.info('current date = ' + currentTime.toString());

    // get the data
    DEMO.status('Requesting earthquake data');
    $.ajax({
        url: YQL_QUERY,
        dataType: 'jsonp',
        timeout: 10000,
        success: displayData,
        error: loadCached
    });
    
    return {
        getMap: function() {
            return map;
        },
        
        getQuakes: function() { 
            return quakes;
        }
    };
})();
