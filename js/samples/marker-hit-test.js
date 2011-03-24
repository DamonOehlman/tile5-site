DEMO.Sample = (function() {
    
    /* internals */
    
    var SEARCH_URL = 'http://ws.geonames.org/searchJSON?country=AU&fcode=PPL&maxRows=100',
        minRotate = 0,
        maxRotate = Math.PI / 2,
        map;

    function loadData(data){
        var ii;

        // clear any existing markers
        map.markers.clear();

        // create the cities
        for (ii = 0 ; ii < data.geonames.length; ii++) {
            var placeData = data.geonames[ii],
                position = T5.Geo.Position.init(placeData.lat, placeData.lng);

            // initialise the new marker
            var marker = new T5.ImageMarker({
                    population: placeData.population,
                    name: placeData.name,
                    imageUrl: "/img/pins/pin-158935-1-noshadow-24.png",
                    imageAnchor: T5.XY.init(8, 24),
                    xy: T5.GeoXY.init(position)
                }),
                aniOpts = {
                    easing: 'sine.out',
                    duration: Math.random() * 500 + 250
                };

            marker.animate('scale', [1.5], [1], aniOpts);
            marker.animate('translate', [0, -400], [0, 0], aniOpts);

            // add the marker to the map
            map.markers.add(marker);
        } // for

        DEMO.status('TIP: Hover over markers to highlight, tap to get info.', 1200);
        map.invalidate();
    } // loadData

    function tapMarker(marker) {
        marker.animate(
            'rotate', 
            [marker.tapped ? maxRotate : minRotate], 
            [marker.tapped ? minRotate : maxRotate], {
                easing: 'bounce.out',
                complete: function() {
                    marker.tapped = ! marker.tapped;
                }
            }
        );
    } // tapMarker

    function handleHover(evt, elements, absXY, relXY, offsetXY) {
        for (var ii = elements.length; ii--; ) {
            elements[ii].target.changeImage('/img/pins/pin-158935-1-24-orange.png');
        } // for

        // invalidate the map
        map.invalidate();
    } // handleHit

    function handleHoverOut(evt, elements, absXY, relXY, offsetXY) {
        for (var ii = elements.length; ii--; ) {
            elements[ii].target.changeImage('/img/pins/pin-158935-1-noshadow-24.png');
        } // for

        // invalidate the map
        map.invalidate();
    } // handleHoverOut

    function handleTap(evt, elements, absXY, relXY, offsetXY) {
        var tappedNames = [];

        for (var ii = elements.length; ii--; ) {
            var marker = elements[ii].target;

            tappedNames.push(marker.name);
            tapMarker(marker);
        } // for

        DEMO.status('tapped: ' + tappedNames.join(', '), 1200);
    } // handleTap

    return {
        run: function(container, renderer, generatorType, generatorOpts) {
            // create the map
            map = new T5.Map({
                container: container,
                minZoom: 3,
                maxZoom: 5,
                renderer: renderer
            });
            
            // goto the map start position
            map.gotoPosition(T5.Geo.Position.parse("-27 133"), 4);
            
            map.setLayer('tiles', new T5.ImageLayer(generatorType, generatorOpts));
            map.bind('hoverHit', handleHover);
            map.bind('hoverOut', handleHoverOut);
            map.bind('tapHit', handleTap);

            // Initiate a request using GRUNTS jsonp call and send the returned information to loadData();
            DEMO.status('Loading City Data from Geonames');
            COG.jsonp(SEARCH_URL, loadData);
            
            return map;
        }
    };
})();
