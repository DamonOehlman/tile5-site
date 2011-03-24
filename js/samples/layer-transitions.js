DEMO.Sample = (function() {
    var map,
        styleA = T5.getStyle(T5.defineStyle('a', {
            globalAlpha: 1
        })),
        styleB = T5.getStyle(T5.defineStyle('b', {
            globalAlpha: 0
        })),
        tween;

    function tweenLayers(from, to) {
        COG.tweenValue(from, to, T5.easing('sine.in'), 2000, function(val, complete) {
            // update the style values
            styleA.update('globalAlpha', val);
            styleB.update('globalAlpha', 1 - val);
            map.invalidate();

            // if complete, then go again (in reverse)
            if (complete) {
                tweenLayers(to, from);
            } // if
        });
    } // tweenLayers
    
    return {
        preventTileChange: true,
        generators: ['osm.cloudmade'],
        
        run: function(container, renderer, generatorType, generatorOpts) {
            // initialise the map
            map = new T5.Map({
                container: container,
                renderer: renderer
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
            map.gotoPosition(DEMO.getHomePosition(), 13);
            tweenLayers(0, 1);
            
            return map;
        }
    };
})();
