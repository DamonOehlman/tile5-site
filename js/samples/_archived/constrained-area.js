var map,
    tiles,
    minPos = T5.Geo.Position.init(-9.45, 109.51),
    maxPos = T5.Geo.Position.init(-43.71, 155.74),
    startPosition = T5.Geo.Position.init(-37.814, 144.963);
    

$(document).ready(function() {
    
    // initialise the map
    map = T5.Map({
        container: 'mapContainer'
    });
    
    tiles = map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
            // demo api key, register for an API key
            // at http://dev.cloudmade.com/
            apikey: '7960daaf55f84bfdb166014d0b9f8d41',
            minXY: T5.GeoXY.init(minPos),
            maxXY: T5.GeoXY.init(maxPos)
    }));
    
    // goto the specified position
    map.gotoPosition(startPosition, 5);
});
