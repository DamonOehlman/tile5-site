var YQL_BASE = 'http://query.yahooapis.com/v1/public/yql?q=',
    map;

function handleBoundsChange(evt, mapBounds) {
    var center = T5.Geo.BoundingBox.getCenter(mapBounds),
        yqlQuery = COG.formatStr(
            'select * ' + 
            'from foursquare.venues ' + 
            'where geolat="{0}" ' + 
            'and geolong="{1}" ' + 
            'and l=50', center.lat, center.lon);

    COG.jsonp(
        YQL_BASE + escape(yqlQuery) + 
        '&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
        showVenuePins);
} // handleBoundsChange

function showVenuePins(yqlData) {
    try {
        var venues = yqlData.query.results.venues.group.venue,
            markers = [];

        // add th new markers
        for (var ii = 0; ii < venues.length; ii++) {
            var pos = T5.Geo.Position.init(venues[ii].geolat, venues[ii].geolong),
                iconurl = venues[ii].primarycategory ? venues[ii].primarycategory.iconurl : null;
            
            if (iconurl) {
                markers.push(new T5.ImageMarker({
                    imageUrl: iconurl,
                    scale: 0.75,
                    xy: T5.GeoXY.init(pos)
                }));
            } // if
        } // for
        
        // clear existing markers
        map.markers.clear();
        map.markers.add(markers);
    }
    catch (e) {
        COG.exception(e);
    } // try..catch
} // showVenuePins

$(document).ready(function() {
    // initialise the map
    map = T5.Map({
        container: 'mapContainer'
    });

    map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
        // demo api key, register for an API key
        // at http://dev.cloudmade.com/
        apikey: '7960daaf55f84bfdb166014d0b9f8d41'
    }));    

    // bind to the bounds change event
    map.bind('boundsChange', handleBoundsChange);

    // goto sydney
    map.gotoPosition(T5.Geo.Position.parse('-33.8635 151.2123'), 17);    
});