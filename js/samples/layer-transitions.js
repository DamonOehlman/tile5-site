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
    startPosition = T5.Geo.Position.init(geoip_latitude(), geoip_longitude());
    
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
    
    // initialise the map
    map = new T5.Map({
        container: 'mapCanvas'
    });
    
    map.setLayer('tiles1', new T5.ImageLayer('osm.cloudmade', {
            // demo api key, register for an API key
            // at http://dev.cloudmade.com/
            apikey: '7960daaf55f84bfdb166014d0b9f8d41',
            style: 'a',
            styleid: 997
    }));

    map.setLayer('tiles2', new T5.ImageLayer('osm.cloudmade', {
            // demo api key, register for an API key
            // at http://dev.cloudmade.com/
            apikey: '7960daaf55f84bfdb166014d0b9f8d41',
            style: 'b',
            styleid: 998,
            zindex: 50
    }));

    // goto the specified position
    map.gotoPosition(startPosition, 13);
    tweenLayers(0, 1);
});
