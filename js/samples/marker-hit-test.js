DEMO.Sample = (function() {
    
    /* internals */
    
    var SEARCH_URL = 'http://ws.geonames.org/searchJSON?country=AU&fcode=PPL&maxRows=100',
        minRotate = 0,
        maxRotate = Math.PI / 2,
        map,
        clusterer;
        
    function animateMarkers(easingType) {
        var aniOpts,
            markers = map.markers.find(),
            marker;

        // iterate through the markers
        for (var ii = markers.length; ii--; ) {
            marker = markers[ii];

            // initialise the animation opts
            aniOpts = {
                easing: easingType || 'sine.out',
                duration: Math.random() * 1000 + 500 | 0
            };

            // animate the marker
            marker.animate('scale', [4], [1], aniOpts);
            // marker.animate('rotate', [0], [Math.PI * 4], aniOpts);
            marker.animate('translate', [0, -400], [0, 0], aniOpts);        
        } // for
    }        
        
    function loadData(data){
        var ii;

        // clear any existing markers
        map.markers.clear();

        // create the cities
        for (ii = 0 ; ii < data.geonames.length; ii++) {
            var placeData = data.geonames[ii],
                position = T5.Geo.Position.init(placeData.lat, placeData.lng);

            // initialise the new marker
            var marker = new T5.Marker({
                    population: placeData.population,
                    name: placeData.name,
                    xy: T5.GeoXY.init(position),
                    markerStyle: 'image',
                    imageUrl: '/img/square-marker.png',
                    size: 15
                });

            // add the marker to the map
            map.markers.add(marker);
        } // for
        
        animateMarkers();

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
    
    function handleHoverHit(evt, elements, absXY, relXY, offsetXY) {
        updateMarkerImages(elements, '/img/square-marker-highlight.png');
    } // handleHoverHit
    
    function handleHoverOut(evt, elements, absXY, relXY, offsetXY) {
        updateMarkerImages(elements, '/img/square-marker.png');
    } // handleHoverOut

    function handleTap(evt, elements, absXY, relXY, offsetXY) {
        var tappedNames = [],
            markers = [],
            ii, jj;
            
        COG.info('captured tap: hit ' + elements.length + ' elements');

        for (ii = elements.length; ii--; ) {
            var marker = elements[ii].target;
            
            // check for a cluster
            if (marker.children) {
                for (jj = marker.children.length; jj--; ) {
                    markers[markers.length] = marker.children[jj];
                } // for
            }
            else {
                markers[markers.length] = marker;
            }

            if (marker) {
                tapMarker(marker);
            } // if
        } // for
        
        // iterate through the markers and add the names
        for (ii = markers.length; ii--; ) {
            tappedNames.push(markers[ii].name);
        } // for

        DEMO.status('tapped: ' + tappedNames.join(', '), 1200);
    } // handleTap
    
    function loadEasingTypes() {
        var types = ['sine.out', 'sine.in', 'quad.in', 'bounce.out', 'linear'],
            items = '';
        
        for (var ii = 0; ii < types.length; ii++) {
            items += '<a href="#">' + types[ii] + '</a>\n';
        } // for
        
        $('#easing-types').html(items).bind('click', function(evt) {
            animateMarkers(evt.target.innerText);
            
            return false;
        });
    } // loadEasingTypes
    
    function updateMarkerImages(elements, imageUrl) {
        for (var ii = elements.length; ii--; ) {
            var marker = elements[ii].target;
            
            marker.reset = true;
            marker.imageUrl = imageUrl;
        } // for
        
        map.invalidate();
    } // updateMarkerImages
    
    /* exports */
    
    var _sample = {
        extraLibs: ['/js/tile5/dev/plugins/clusterer.js'],
        
        run: function(container, renderer, generatorType, generatorOpts) {
            // create the map
            map = new T5.Map({
                container: container,
                minZoom: 2,
                maxZoom: 5,
                renderer: renderer,
                zoombar: {
                    bgImage: '/img/zoom-bg.png'
                }
            });
            
            // goto the map start position
            map.gotoPosition(T5.Geo.Position.parse("-27 133"), 3);
            
            map.setLayer('tiles', new T5.ImageLayer(generatorType, generatorOpts));
            map.bind('tapHit', handleTap);
            map.bind('hoverHit', handleHoverHit);
            map.bind('hoverOut', handleHoverOut);

            // Initiate a request using GRUNTS jsonp call and send the returned information to loadData();
            DEMO.status('Loading City Data from Geonames');
            COG.jsonp(SEARCH_URL, loadData);
            
            // load the easing types
            loadEasingTypes();
            
            $('#cluster').click(function() {
                /*
                MANUAL CLUSTERING TEST
                var tmpClusterer = new T5.Clusterer(),
                    clusterLayer = tmpClusterer.checkLayer(map.getLayer('markers'));
                    
                // if we have a cluster layer, then remove the markers and add the cluster layer
                if (clusterLayer) {
                    map.setLayer(clusterLayer.id, clusterLayer);
                    map.removeLayer('markers');
                } // if
                */
                
                if (! clusterer) {
                    clusterer = new T5.Clusterer(map);
                } // if..else
            });
            
            return map;
        }
    };
    
    return _sample;
})();
