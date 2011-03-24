DEMO.Sample = (function() {
    var YQL_QUERY = "http://query.yahooapis.com/v1/public/yql?format=json&q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.iris.edu%2Fservlet%2Feventserver%2FeventsXML.do%3Fpriority%3Dtime%26StartDate%3D20110311%26PointsMax%3D1000%26LatMax%3D82.81%26LatMin%3D-70.14%26LonMax%3D178.95%26LonMin%3D-171.21'",
        TIME_INCREMENT = 60000,
        DAY_MILLIS = 86400000,
        HOUR_MILLIS = 3600000,
        ZOOMLEVEL_DEFAULT = 6,
        zoomLevelScaling = 1,
        reDate = /(\d{4})\/(\d{2})\/(\d{2})\s(\d{2})\:(\d{2}).*/,
        map,
        quakes = [],
        quakeIdx = 0,
        quakeCount = 0,
        runId = 0,
        currentTime;
        
    /* drawable implementation */
    
    var Quake = function(params) {
        
        function draw(drawData) {
            var context = drawData.context,
                saturation = Math.max(0, 1 - (currentTime.getTime() - this.dt.getTime()) / (HOUR_MILLIS*6)) * 100 | 0,
                hue = Math.min(160, this.dkm / 5);
                
            // if we are using the canvas renderer a context will be available
            // so we will just draw exactly what we want
            if (context) {
                context.fillStyle = 'hsla(' + hue + ', ' + saturation + '%, 50%, 0.4)';

                context.arc(
                    this.xy.x, 
                    this.xy.y, 
                    (this.size * zoomLevelScaling) >> 1,
                    0,
                    Math.PI * 2,
                    false
                );
                context.fill();
            }
            // otherwise just let the renderer do what it wants
            // (given of course that it wants to do something)
            else if (drawData.draw) {
                drawData.draw.call(this, drawData);
            } // if..else
        } // prepPath
        
        params.stroke = false;
        
        // call the inherited constructor
        T5.Arc.call(this, params);
        
        // override default drawable behaviour
        COG.extend(this, {
            draw: draw
        });
    };
    
    Quake.prototype = COG.extend(T5.Arc.prototype, {
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
            
    function displayData(data) {
        if (! data.query.results) {
            loadCached();
            return;
        } // if
        
        parseData(data.query.results);
        DEMO.status();
        
        createClock();
        
        // update the display on draw complete
        map.bind('enterFrame', runClock);
        map.invalidate();
    } // displayData
    
    function handleHoverHit(evt, elements, absXY, relXY, offsetXY) {
        for (var ii = elements.length; ii--; ) {
            var quake = elements[ii].target;
            if (quake.animations === 0) {
                quake.animate('scale', [quake.scaling], [1], {
                    duration: 300,
                    easing: 'back.out'
                });
            } // if
        } // for
    } // handleHit

    function handleHoverOut(evt, elements, absXY, relXY, offsetXY) {
        for (var ii = elements.length; ii--; ) {
            var quake = elements[ii].target;
            quake.animate('scale', [quake.scaling], [0.1]);
        } // for
    } // handleHoverOut

    
    
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
                    size: Math.pow(2, quakeMag) | 0,

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
                matches[2] - 1, // month
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
        
        // while the quake time is less than the current display and goto the next
        while (quakeIdx < quakes.length && quakes[quakeIdx].dt < currentTime) {
            showQuake(quakes[quakeIdx]);
            quakeIdx++;
            quakeCount++;
        } // while
        
        // increment the current time by five minutes
        currentTime = new Date(currentTime.getTime() + TIME_INCREMENT);
        if (quakeIdx >= quakes.length) {
            DEMO.status('End of Data');
        } // if
        
        $('#quake_counter').html(quakeCount + 1);
        map.invalidate();
    } // runClock
    
    function start() {
        // clear the timeout
        map.markers.clear();
        
        // update the current time
        currentTime = parseDate($('#date-start').val());
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
    } // start
    
    function showQuake(quakeMarker) {
        // animate the marker
        quakeMarker.scale(0.1);
        quakeMarker.animate('scale', [0.01], [1], {
            duration: 500,
            complete: function() {
                quakeMarker.animate('scale', [1], [0.05], {
                    easing: 'sine.in',
                    duration: 1000,
                    complete: function() {
                        quakeMarker.past = true;
                    }
                });
            }
        });
        
        // add the marker
        map.markers.add(quakeMarker, true);
    } // showQuake
    
    $('#btnRun').click(start);
    
    return {
        run: function(container, renderer, generatorType, generatorOpts) {
            map = T5.Map({
                // Point to which canvas element to draw in
                container: container,
                renderer: renderer
            });

            map.setLayer('tiles', new T5.ImageLayer(generatorType, $.extend({
                    styleid: 3
            }, generatorOpts)));

            map.bind('zoomLevelChange', function(evt, zoomLevel) {
                zoomLevelScaling = zoomLevel / ZOOMLEVEL_DEFAULT;
            });

            //map.bind('hoverHit', handleHoverHit);
            //map.bind('hoverOut', handleHoverOut);
            map.gotoPosition(T5.Geo.Position.init(38, 139.22), ZOOMLEVEL_DEFAULT);            

            // start the simulation
            start();
            
            return map;
        }
    };
})();
