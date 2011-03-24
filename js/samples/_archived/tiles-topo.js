T5.Generator.register('osm.topo', function(params) {
    params.tilePath = 'x{1}y{2}z{0}.png';
    params.flipX = false;
    params.flipY = true;
    
    return COG.extend(new T5.Geo.OSM.Generator(params), {
        getServerDetails: function() {
            return {
                baseUrl: 'http://98.129.239.246:8080/geowebcache/service/kml/nsw:topo/'
            };
        }
    });
});

// initialise the map
var map = new T5.Map({
    container: 'mapContainer'
});

map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
        // demo api key, register for an API key
        // at http://dev.cloudmade.com/
        apikey: '7960daaf55f84bfdb166014d0b9f8d41'
}));

map.setLayer('tiles-topo', new T5.ImageLayer('osm.topo', {
        zIndex: 40
}));

// goto the specified position
map.gotoPosition(T5.Geo.Position.parse("-34 151"), 8);