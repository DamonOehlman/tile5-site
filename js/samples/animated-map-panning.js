DEMO.Sample = (function() {
    // initialise geonames url
    var cities = [{
        name: 'Moscow',
        pos: '55.7522222 37.6155556',
        population: 10381222
    }, {
        name: 'London',
        pos: '51.508528775862885 -0.12574195861816406',
        population: 7556900
        
    }, {
        name: 'Baghdad',
        pos: '33.340582 44.400876',
        population: 5672513
    }, {
        name: 'Ankara',
        pos: '39.9198743755027 32.8542709350586',
        population: 3517182
        
    }, {
        name: 'Berlin',
        pos: '52.524368165134284 13.410530090332031',
        population: 3426354
    }, {
        name: 'Madrid',
        pos: '40.4165020941502 -3.70256423950195',
        population: 3255944
    }, {
        name: 'Roma',
        pos: '41.8947384616695 12.4839019775391',
        population: 2563241
    }, {
        name: 'Paris',
        pos: '48.85341 2.3488',
        population: 2138551
    }];

    // initialise variables
    var easingEffect = 'sine.out',
        map,
        cityIndex = 0;

    /* define some internal functions */

    function nextCity() {
        var cityData = cities[cityIndex++],
            cityPos = T5.Geo.Position.parse(cityData.pos);
            
        COG.info('city index = ' + cityIndex);

        // clear the map markers and add one for the new city
        map.markers.clear();
        map.markers.add(new T5.ImageMarker({
            imageUrl: "/img/pins/pin-158935-1-24.png",
            imageAnchor: T5.XY.init(8, 24),
            xy: T5.GeoXY.init(cityPos)
        }));
        
        // pan to the next city position
        map.panToPosition(
            cityPos, 
            function() {
                setTimeout(nextCity, 1000);
            }, 
            COG.easing(easingEffect), 
            2500);
            
        if (cityIndex >= cities.length) {
            cityIndex = 0;
        } // if
    }

    return {
        run: function(container, renderer, generatorType, generatorOpts) {
            map = new T5.Map({
                container: container,
                renderer: renderer
            });

            map.setLayer('tiles', new T5.ImageLayer(generatorType, generatorOpts));
            map.gotoPosition(T5.Geo.Position.parse(cities[cities.length - 1].pos), 6);
            
            setTimeout(nextCity, 1000);
            
            $("#demoControls button.anitype").unbind().click(function() {
                easingEffect = this.innerText;
            });
            
            $('#btnNextCity').unbind().click(nextCity);
            
            return map;
        }
    };
})();