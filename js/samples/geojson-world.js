var map;

$(document).ready(function() {
    T5.Style.load('/js/tile5/style/map-overlays.js');

    // initialise the map
    map = T5.Map({
        container: 'mapCanvas'
    });
    
    /*
    map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
            // demo api key, register for an API key
            // at http://dev.cloudmade.com/
            apikey: '7960daaf55f84bfdb166014d0b9f8d41',
            styleid: 999
    }));
    */

    // goto the specified position
    map.gotoPosition(T5.Geo.P.parse('37.16 -96.68'), 3);
    
    // get the walmarts data
    $.ajax({
        url: '/js/data/world.json',
        dataType: 'json',
        success: function(data, textStatus, raw) {
            COG.info('parsing geojson data');
            T5.GeoJSON.parse(data, function(layers) {
                for (layerId in layers) {
                    layers[layerId].style = 'area.simple';
                    
                    map.setLayer(layerId, layers[layerId]);
                } // for
            });
        },
        error: function(raw, textStatus, errorThrown) {
            COG.warn('error: ' + textStatus, errorThrown);
        }
    });    
});