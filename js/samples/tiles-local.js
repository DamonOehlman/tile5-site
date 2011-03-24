T5.Generator.register('osm.local-demo', function(params) {
    return COG.extend(new T5.Geo.OSM.Generator(params), {
        getServerDetails: function() {
            return {
                baseUrl: '/tile/'
            };
        }
    });
});

DEMO.Sample = (function() {
    return {
        run: function(container, renderer, generator, generatorOpts) {
            // initialise the map
            var map = new T5.Map({
                container: container,
                minZoom: 2,
                maxZoom: 5,
                renderer: renderer
            });

            map.setLayer('tiles', new T5.ImageLayer('osm.local-demo'));

            // goto the specified position
            map.gotoPosition(T5.Geo.Position.parse('37.16 -96.68'), 2, function() {
                map.markers.add(new T5.ImageMarker({
                    imageUrl: "/img/pins/pin-158935-1-24.png",
                    imageAnchor: T5.XY.init(8, 24),
                    xy: T5.GeoXY.init(map.getCenterPosition()),
                    tweenIn: COG.easing('sine.out')
                }));
            });
            
            return map;
        }
    };
})();