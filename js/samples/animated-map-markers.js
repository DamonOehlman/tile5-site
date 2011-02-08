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
    
function movePlane(evt, offset, tickCount) {
    // if we have a last tick count we can perform some animation
    if (lastTickCount) {
        var deltaChange = (tickCount - lastTickCount) / cycleSpeed,
            newPosition;
        
        angle = (angle + (TWO_PI * deltaChange)) % TWO_PI;
        newPosition = T5.Geo.Position.offset(
            startPosition, 
            arcRadius * Math.sin(angle),
            arcRadius * Math.cos(angle));
        
        plane.rotation = TWO_PI - angle;
        T5.GeoXY.updatePos(plane.xy, newPosition);
        map.panToPosition(newPosition);
    }
    
    lastTickCount = tickCount;
    map.markers.changed();
} // movePlane

$(document).ready(function() {
    startPosition = T5.Geo.Position.init(geoip_latitude(), geoip_longitude());
    planeStart = T5.Geo.Position.offset(startPosition, 0, -arcRadius);

    // initialise the map
    map = T5.Map({
        container: 'mapCanvas'
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
    plane = new T5.ImageMarker({
        xy: T5.GeoXY.init(planeStart),
        imageUrl: '/img/fly/plane.png',
        scale: getPlaneScale()
    });

    // add the marker to the map
    map.markers.animated = true;
    map.markers.add(plane);

    // handle the draw complete
    map.bind('drawComplete', movePlane);

    // handle zoom level changes
    map.bind('zoomLevelChange', function(evt, zoomLevel) {
        plane.scale = getPlaneScale();
    });

    // handle tapping markers
    map.markers.bind('markerTap', function(evt, absXY, relXY, markers) {
       COG.info('hit the plane - yeah :)');
    });
});
