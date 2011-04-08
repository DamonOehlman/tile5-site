DEMO.Sample = (function() {
    // initialise variables
    var map,
        vizYear = null,
        beachMarkers = {},
        day = 0,
        dayDelay = 50,
        nextDayTimeout = 0,
        beaches,
        yearData = {};
        
    var BeachMarker = function(params) {
        var stalkLength = null;
        
        function getEntcRating(entc) {
            if (entc < 41) {
                return 4;
            }
            else if (entc < 201) {
                return 3;
            }
            else if (entc < 501) {
                return 2;
            } // if..else
            
            return 1;
        } // getEntcRating
        
        var self = T5.ex(new T5.Marker(params), {
            entc: null,
            
            drawMarker: function(context, viewRect, x, y, state, overlay, view) {
                context.strokeStyle = 'rgba(255, 0, 0, 1)';
                context.strokeWidth = 2;

                if (self.entc) {
                    var rating = getEntcRating(self.entc);
                    
                    // draw the marker (xy specifies the center)
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x + rating * 4, y);
                    context.stroke();
                } // if
                
                // draw the beach marker
                context.beginPath();
                context.arc(x, y, 3, 0, Math.PI * 2, false);
                context.fill();
                context.stroke();
            }
        });
        
        return self;
    };
            
    /* internals */
    
    function handleAddYear() {
        var newYear = $('#newYear').val();
        
        $('ul#years').append(COG.formatStr('<li data-year="{0}">{0}</li>', newYear));
    } // handleAddYear
    
    function handleVisualize() {
        var year = $('#newYear').val();
        
        $('ul#years').html(COG.formatStr('<li data-year="{0}">{0}</li>', year));
        startViz(year);
    } // handleVisualize
    
    function nextDay() {
        day += 1;
        $('ul#years li').html(day);
        
        // get the year data
        var currentData = yearData[vizYear];
        globalData = currentData;
        
        // iterate through each of the beaches in the year data
        for (var beachName in currentData.beaches) {
            processBeach(beachName, currentData.beaches[beachName]);
        } // for
        
        // invalidate the map
        map.invalidate(true);

        // TOOD: check for a leap year
        if (day < 365) {
            nextDayTimeout = setTimeout(nextDay, dayDelay);
        }
    } // nextDay
    
    function pinBeaches() {
        beachMarkers = {};
        
        for (var ii = beaches.length; ii--; ) {
            var beachPos = T5.Geo.Position.init(beaches[ii].lat, beaches[ii].lon);
            
            COG.info('parsing beach ' + beaches[ii].name + ', pos: ' + T5.Geo.Position.toString(beachPos));
            
            // create a marker for the beach
            var marker = new BeachMarker({
                    imageUrl: "/img/pins/pin-158935-1-24.png",
                    imageAnchor: T5.XY.init(8, 24),
                    xy: T5.GeoXY.init(beachPos)
                });
                
            // save the marker to the beach markers list
            beachMarkers[beaches[ii].name] = marker;
            
            // add the marker to the map
            map.markers.add(marker);
            map.invalidate(true);
        } // for
    } // pinBeaches
    
    function processBeach(beachName, beachData) {
        // if the beach data does not yet have a next day property, check what it should be
        if (! beachData.nextDay) {
            beachData.nextDay = parseInt(beachData.samples[0].day, 10);
            beachData.sampleIndex = 0;
        } // if
        
        // check to see whether the beach next sample day is greater than or equal to the current day
        if (beachData.nextDay <= day) {
            var sample = beachData.samples[beachData.sampleIndex];
            
            // update the marker entc value
            if (sample.entc) {
                beachMarkers[beachName].entc = sample.entc;
            } // if
            
            // update the beach data to point to the next sample
            if (beachData.sampleIndex < beachData.samples.length - 1) {
                beachData.sampleIndex = beachData.sampleIndex + 1;
                beachData.nextDay = parseInt(beachData.samples[beachData.sampleIndex].day, 10);
            }
            else {
                beachData.nextDay = 1000;
            } // if..else
        }
    } // processBeach
    
    function startViz(year) {
        $.ajax({
            url: '/js/data/beachwatch/' + year + '.json',
            dataType: 'json',
            success: function(data) {
                yearData[year] = data;
                visualize(year);
            }
        });        
    } // startViz
    
    function visualize(year) {
        day = 0;
        vizYear = year;
        
        // reset the existing viz if one is going...
        clearTimeout(nextDayTimeout);
        
        // clear the beach markers entc
        for (var beach in beachMarkers) {
            beachMarkers[beach].entc = null;
        } // for
        
        nextDayTimeout = setTimeout(nextDay, dayDelay);
    } // visualize
    
    /* exports */
    
    /* initialization */
    
    T5.Generator.register('osm.local-demo', function(params) {
        return COG.extend(new T5.Geo.OSM.Generator(params), {
            getServerDetails: function() {
                return {
                    baseUrl: '/tile/'
                };
            }
        });
    });

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

            map.gotoPosition(T5.Geo.Position.parse("-30.8 150"), 6);

            // load the beaches
            $.ajax({
                url: '/js/data/beachwatch/beaches.json',
                dataType: 'json',
                success: function(data) {
                    beaches = data;

                    // pin the beaches
                    pinBeaches();
                }
            });
            
            // initialise the years
            var items = '';
            for (var year = 1989; year < 2010; year++) {
                items += '<option>' + year + '</option>';
            } // for

            $('#newYear').html(items);
            $('#addToMap').click(handleAddYear);
            $('#visualize').click(handleVisualize);
            
            return map;
        }
    };
})();
