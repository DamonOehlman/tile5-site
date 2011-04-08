DEMO.Sample = (function() {
    var arcRadius = 500, // distance in km
        angle = 0,
        cycleSpeed = 5000,
        startPosition,
        planeStart,
        lastTickCount = 0,
        TWO_PI = Math.PI * 2,
        map,
        plane;

    function getPlaneScale() {
        return (map.getZoomLevel() / 16) * 0.7;
    } // getPlaneScale

    function movePlane(evt, tickCount) {
        // if we have a last tick count we can perform some animation
        if (lastTickCount) {
            var deltaChange = (tickCount - lastTickCount) / cycleSpeed,
                newPosition;

            angle = (angle + (TWO_PI * deltaChange)) % TWO_PI;
            newPosition = T5.Geo.Position.offset(
                startPosition, 
                arcRadius * Math.sin(angle),
                arcRadius * Math.cos(angle));

            T5.GeoXY.updatePos(plane.xy, newPosition);

            plane.rotate(TWO_PI - angle);
            // map.panToPosition(newPosition);
            map.invalidate();
        }

        lastTickCount = tickCount;
        // map.invalidate();
    } // movePlane


    return {
        run: function(container, renderer, generatorType, generatorOpts) {
            startPosition = DEMO.getHomePosition();
            planeStart = T5.Geo.Position.offset(startPosition, 0, -arcRadius);

            // initialise the map
            map = new T5.Map({
                container: container,
                clipping: false,
                renderer: renderer
            });

            map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
                    // demo api key, register for an API key
                    // at http://dev.cloudmade.com/
                    apikey: '7960daaf55f84bfdb166014d0b9f8d41'
            }));

            // goto the specified position
            map.gotoPosition(startPosition, 5);
            COG.info('plane start position = ', planeStart);

            // create the plane marker
            if (renderer === 'three:webgl') {
                T5.defineStyle('ship', {
                    fill: '#444444'
                });
                
                plane = new T5.Marker({
                    xy: T5.GeoXY.init(planeStart),
                    markerStyle: 'model.ascii',
                    style: 'ship',
                    modelUrl: '/models/rusty_ship.js',
                    z: 30
                });
            }
            else {
                plane = new T5.Marker({
                    xy: T5.GeoXY.init(planeStart),
                    markerStyle: 'image',
                    size: 100,
                    imageUrl: '/img/fly/plane.png'
                });
            }

            // make the plane transformable
            plane.scale(getPlaneScale());

            // add the marker to the map
            map.markers.animated = true;
            map.markers.add(plane);

            // handle the draw complete
            map.bind('enterFrame', movePlane);

            // handle zoom level changes
            map.bind('zoomLevelChange', function(evt, zoomLevel) {
                plane.scale = getPlaneScale();
            });

            // handle tapping markers
            map.bind('tapHit', function(evt, elements, absXY, relXY, offsetXY) {
                DEMO.status('tapped the plane', 1200);
            });
            
            return map;
        }
    };
})();