DEMO.Sample = (function() {
    var map,
        stores = [],
        storeIndex = 0,
        yearTimeout = 0,
        glowMarker,
        inactiveMarker;

    function createGlowMarker(size, stopFn) {
        // create the glow marker as a new canvas
        var marker = T5.newCanvas(size, size),
            stopPoints = [0, 0.1, 1];

        // get the canvas context
        var context = marker.getContext('2d'),
            halfSize = size / 2,
            radGrad = context.createRadialGradient(halfSize, halfSize, 0, halfSize, halfSize, halfSize);

        for (var ii = 0; ii < stopPoints.length; ii++) {
            var stopVal = stopPoints[ii],
                alpha = 0.4 - (0.4 * Math.sqrt(stopVal));

            radGrad.addColorStop(stopVal, stopFn(stopVal, alpha));
        } // for

        // draw the glow marker
        context.beginPath();
        context.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2, false);
        context.fillStyle = radGrad;              
        context.fill();

        return marker;
    } // createGlowMarker

    function displayStores(year, withEasing) {
        $('#year_counter').html(year);
        $('#marker_counter').html(storeIndex);

        var store = stores[storeIndex];

        if (! store) {
            return;
        } // if

        while (store && year >= parseInt(store.opening_date, 10)) {
            pinStore(store);
            storeIndex += 1;
            store = stores[storeIndex];
        } // while

        yearTimeout = setTimeout(function() {
            displayStores(year + 1, withEasing);
        }, 250);
    } // displayStores

    function pinStore(store) {
        var storePos = T5.Geo.Position.init(store.latitude, store.longitude),
            marker = new T5.ImageMarker({
                xy: T5.GeoXY.init(storePos),
                image: glowMarker,
                name: store.name,
                opening_date: store.opening_date,
                transformable: true
            }),
            opts = {
                duration: 500,
                complete: function() {
                    marker.animate('scale', [5], [1], { duration: 300 });
                }
            };


        // animate the marker
        marker.animate('scale', [1], [5], opts);

        // add the marker
        map.markers.add(marker);
    } // pinStore

    function reset() {
        // reset the run state
        map.markers.clear();
        clearTimeout(yearTimeout);
        storeIndex = 0;
    } // reset

    function updateButtons() {
        $('.run')
            .removeAttr('disabled')
            .click(function() {
                reset();
                // start displaying stores
                $('.counter').show();
                displayStores(parseInt(stores[0].opening_date, 10), $(this).data('animated'));
        });
    } // updateButtons
    
    // create the glow marker
    glowMarker = createGlowMarker(8, function(stopVal, alpha) {
        var hue = ~~(150 + 70 * stopVal),
            saturation = 80 + ~~((1 - stopVal / 1) * 20),
            lightness = 50;

        return COG.formatStr('hsla({0}, {1}%, {2}%, {3})', hue, saturation, lightness, alpha);
    });

    inactiveMarker = createGlowMarker(8, function(stopVal, alpha) {
        var hue = ~~(50 + 20 * stopVal),
            saturation = 60 + ~~((1 - stopVal / 1) * 20),
            lightness = 50;

        return COG.formatStr('hsla({0}, {1}%, {2}%, {3})', hue, saturation, lightness, alpha);
    });

    // get the walmarts data
    $.ajax({
        url: '/js/data/walmarts.json',
        dataType: 'json',
        success: function(data, textStatus, raw) {
            stores = data;

            updateButtons();
        },
        error: function(raw, textStatus, errorThrown) {
            COG.warn('error: ' + textStatus, errorThrown);
        }
    });

    return {
        run: function(container, renderer, generatorType, generatorOpts) {
            // initialise the map
            map = new T5.Map({
                container: container,
                renderer: renderer
            });

            // create the tiles layer
            map.setLayer('tiles', new T5.ImageLayer(generatorType, $.extend({
                    styleid: 999
            }, generatorOpts)));

            // goto the specified position
            map.gotoPosition(T5.Geo.Position.parse('37.16 -96.68'), 4);
            return map;
        }
    };
})();