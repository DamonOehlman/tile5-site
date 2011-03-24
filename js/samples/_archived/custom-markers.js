DEMO.Sample = (function() {
    // Set the source of the JSON 
    var SEARCH_URL = 'http://ws.geonames.org/searchJSON?country=AU&fcode=PPL&maxRows=100',
        MAX_MARKER_SIZE = 30,
        TWO_PI = Math.PI * 2,
        maxPopulation = 0;

    function loadData(data){
        var ii;

        // clear any existing markers
        map.markers.clear();

        // first pass - calculate the max population
        maxPopulation = 0;
        for (ii = 0; ii < data.geonames.length; ii++) {
            maxPopulation = Math.max(data.geonames[ii].population, maxPopulation);
        } // for

        // create the cities
        for (ii = 0 ; ii < data.geonames.length; ii++) {
            var placeData = data.geonames[ii],
                position = T5.Geo.Position.init(placeData.lat, placeData.lng);

            // initialise the new marker
            var marker = new T5.Marker({
                population: placeData.population,
                name: placeData.name,
                size: placeData.population / maxPopulation * MAX_MARKER_SIZE | 0,
                style: 'area.simple',
                fill: true,
                xy: T5.GeoXY.init(position)
            });

            // add the marker to the map
            map.markers.add(marker);
        } // for
        
        DEMO.status();
    } // loadData

    return {
        styles: ['map-overlays'],
        
        run: function(container, renderer, generatorType, generatorOpts) {
            map = new T5.Map({
                // Point to which canvas element to draw in
                container: container,
                renderer: renderer,
                // set clipping on to prevent redraw where tiles are not displayed
                clipping: true
            });

            map.setLayer('tiles', new T5.ImageLayer(generatorType, generatorOpts));
            map.gotoPosition(T5.Geo.Position.parse("-27 133"), 4);

            // Initiate a request using GRUNTS jsonp call and send the returned information to loadData();
            DEMO.status('Loading City Data');
            COG.jsonp(SEARCH_URL, loadData);
        }
    };
})();

