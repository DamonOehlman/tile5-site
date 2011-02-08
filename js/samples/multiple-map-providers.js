var map,
    startPosition,
    styleA = T5.Style.get(T5.Style.define('a', {
        globalAlpha: 1
    })),
    styleB = T5.Style.get(T5.Style.define('b', {
        globalAlpha: 0
    })),
    tween;

$(document).ready(function() {
    /*
    function tweenLayers(from, to) {
        tween = T5.tweenValue(from, to, T5.easing('sine.in'), null, 2000);
        tween.requestUpdates(function(value, complete) {
            // update the style values
            styleA.update('globalAlpha', value);
            styleB.update('globalAlpha', 1 - value);

            // if complete, then go again (in reverse)
            if (complete) {
                tweenLayers(to, from);
            } // if
        });
    } // tweenLayers
    */
    
    // initialise the start position
    startPosition = new T5.Geo.Position(geoip_latitude(), geoip_longitude());
    
    // initialise the map
    map = T5.Map({
        container: 'mapCanvas'
    });
    
    /*
    map.setLayer('tiles', new T5.ImageLayer('bing', {
        apikey: 'AgZHtHdj6xF41EcwYw2Yo0y1kDICGOLJ2ATmDGMFTUX-lSBqssPHcx50lx65oOly',
        style: 'Road'
    }));
    */
    
    map.setLayer('tiles', new T5.ImageLayer('decarta'));

    /*
    map.setLayer('tiles2', new T5.ImageLayer('osm.cloudmade', {
            // demo api key, register for an API key
            // at http://dev.cloudmade.com/
            apikey: '7960daaf55f84bfdb166014d0b9f8d41',
            style: 'b',
            styleid: 998,
            zindex: 50
    }));
    */

    // goto the specified position
    map.gotoPosition(startPosition, 9);
});

// Initialise deCarta demo credentials
// to use decarta mapping apply for an API key @ http://devzone.decarta.com/
T5.Geo.Decarta.applyConfig({
    server: "http://ws.decarta.com/openls",
    clientName: "racq-do",
    clientPassword: "mz5ff3",
    configuration: "global-decarta", 
    geocoding: {
        countryCode: "US",
        language: "EN"
    }
});