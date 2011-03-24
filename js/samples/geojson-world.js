DEMO.Sample = (function() {
    var map;

    function addLayer(layerId, layer) {
        // initialise the layer styles
        layer.style = 'area.simple';
        layer.hoverStyle = 'area.highlight';
        layer.downStyle = 'area.highlight';

        map.setLayer(layerId, layer);
    }

    function animate() {
        map.eachLayer(function(layer) {
            animateLayer(layer);
        });
    }

    function animateLayer(layer) {
        var shapes = layer.find(),
            aniDuration,
            startX, startY,
            aniOpts;

        // animate the shapes (just because)
        for (var ii = shapes.length; ii--; ) {
            aniDuration = (Math.random() * 1000 + 500) | 0;
            startX = (Math.random() * 4000 - 2000) | 0;
            startY = (Math.random() * 4000 - 2000) | 0;

            aniOpts = {
                easing: 'sine.out',
                duration: aniDuration
            };

            shapes[ii].animate('translate', [startX, startY], [0, 0], aniOpts);
            shapes[ii].animate('scale', [0.1], [1], aniOpts);
            shapes[ii].animate('rotate', [0], [Math.PI * 4], aniOpts);
        } // for
    } // animateLayer

    function displayFirstElement(elements, hideDelay) {
        if (elements.length > 0) {
            var props = elements[0].target ? elements[0].target.properties : null;
            if (props) {
                DEMO.status(props.name, hideDelay);
            } // if
        } // if
    } 
    
    $('#animate').click(animate);
    
    return {
        engines: [],
        styles: ['map-overlays'],
        preventTileChange: true,
        
        run: function(container, renderer, generatorType, generatorOpts) {
            // initialise the map
            map = new T5.Map({
                container: 'mapContainer',
                clipping: true,
                minZoom: 2,
                maxZoom: 10,
                renderer: renderer
            });

            // set the map background to an oceanesque colour...
            $('#mapContainer').css('background', '#5f8dd3');

            // goto the specified position
            map.gotoPosition(T5.Geo.Position.init(20, 0), 1);

            map.bind('hoverHit', function(evt, elements, absXY, relXY, offsetXY) {
                displayFirstElement(elements);
            });

            map.bind('tapHit', function(evt, elements, absXY, relXY, offsetXY) {
                displayFirstElement(elements, 1000);
            });    

            map.bind('hoverOut', function(evt, elements, absXY, relXY, offsetXY) {
                displayFirstElement(elements, 100);
            });

            DEMO.status('Loading World Data');

            // get the walmarts data
            $.ajax({
                url: '/js/data/world.json',
                dataType: 'json',
                success: function(data, textStatus, raw) {
                    DEMO.status('Parsing GeoJSON');

                    T5.GeoJSON.parse(data, function(layers) {
                        for (layerId in layers) {
                            addLayer(layerId, layers[layerId]);
                        } // for

                        DEMO.status();
                    });
                },
                error: function(raw, textStatus, errorThrown) {
                    DEMO.status('Error loading data', 1000);
                }
            });
            
            return map;
        }
    };
})();