DEMO.Sample = (function() {
    var map,
        startPos,
        endPos;

    function addMarker(pos, markerType) {
        // update the start marker position
        var marker = new T5.Marker({
            xy: T5.GeoXY.init(pos),
            markerStyle: 'image',
            size: 20,
            imageUrl: '/img/square-marker-route-' + markerType + '.png',
            markerType: markerType,
            draggable: true
        });

        // handle the drop event for the marker
        marker.bind('dragDrop', handleMarkerDragDrop);

        map.markers.add(marker);
        map.invalidate(true);
    } // addMarker

    function handleGeoTap(evt, absXY, relXY, tapPos) {
        if (! startPos) {
            startPos = T5.Geo.Position.copy(tapPos);
            addMarker(startPos, 'start');
        }
        else if (! endPos) {
            endPos = T5.Geo.Position.copy(tapPos);
            addMarker(endPos, 'end');

            // generate and display the route
            DEMO.status('Generating Route');
            T5.RouteTools.calculate({
                waypoints: [startPos, endPos],
                map: map,
                success: function() {
                    $('.animator').removeAttr('disabled');
                    DEMO.status();
                }
            });        
        } // if..else

    } // handleGeoTap

    function handleHover(evt, elements, absXY, relXY, offsetXY) {
        for (var ii = elements.length; ii--; ) {
            if (elements[ii].type === 'line') {
                elements[ii].target.style = 'waypointsHover';
            } // if
        } // for

        // invalidate the map
        map.invalidate();
    } // handleHit

    function handleHoverOut(evt, elements, absXY, relXY, offsetXY) {
        for (var ii = elements.length; ii--; ) {
            if (elements[ii].type === 'line') {
                elements[ii].target.style = 'waypoints';
            } // if
        } // for

        // invalidate the map
        map.invalidate();
    } // handleHit

    function handleMarkerDragDrop(evt) {
        if (evt.source.markerType === 'start') {
            startPos = evt.source.xy.pos;
        }
        else {
            endPos = evt.source.xy.pos;
        } // if..else

        if (startPos && endPos) {
            DEMO.status('Rerouting');

            // generate and display the route
            T5.RouteTools.calculate({
                waypoints: [startPos, endPos],
                map: map,
                success: function() {
                    DEMO.status();
                }
            });        
        } // if
    } // handleMarkerDragDrop

    function animateRoute() {
        // get the routing layer
        var routeLayer = map.getLayer('route'),
            elem = $(this);

        if (routeLayer) {
            // get the easing
            var easing = COG.easing($('#animate-easing').val()),
                duration = parseInt($('#animate-duration').val(), 10);

            routeLayer.getAnimation(
                easing, 
                duration ? duration : 2000,
                null
            ).addToView(map);
        } // if    
    }
    
    $('.animator').attr('disabled', 'disabled');
    $('#animate').click(animateRoute);    
    
    return {
        generators: ['decarta'],
        extraLibs: ['/js/tile5/dev/plugins/geo.routetools.js'],
        
        run: function(container, renderer, generator, generatorOpts) {
            // initialise the map
            map = new T5.Map({
                container: 'mapContainer',
                clipping: true,
                renderer: renderer
            });

            map.setLayer('tiles', new T5.ImageLayer('decarta'));
            map.bind('geotap', handleGeoTap);
            map.bind('hoverHit', handleHover);
            map.bind('hoverOut', handleHoverOut);

            // goto the specified position
            map.gotoPosition(T5.Geo.Position.init(-37.814, 144.963), 5);

            return map;
        }
    };
})();