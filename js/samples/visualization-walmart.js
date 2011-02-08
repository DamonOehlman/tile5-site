var map,
    stores = [],
    storeIndex = 0,
    yearTimeout = 0,
    glowMarker,
    inactiveMarker;
    
function createGlowMarker(size, stopFn) {
    // create the glow marker as a new canvas
    var marker = T5.Images.newCanvas(size, size),
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

    var store = stores[storeIndex],
        markers = [];
        
    // switch previous markers to the inactive marker
    map.markers.each(function(marker) {
        marker.image = inactiveMarker;
    });
    
    if (! store) {
        return;
    } // if

    while (store && year >= parseInt(store.opening_date, 10)) {
        var storePos = T5.Geo.Position.init(store.latitude, store.longitude);
        
        markers[markers.length] = new T5.ImageMarker({
            xy: T5.GeoXY.init(storePos),
            image: glowMarker,
            tweenIn: withEasing ? T5.easing('sine.out') : null,
            animationSpeed: 250
        });
        
        storeIndex += 1;
        store = stores[storeIndex];
    } // while
    
    // bulk add the markers to the map
    map.markers.add(markers);
    
    yearTimeout = setTimeout(function() {
        displayStores(year + 1, withEasing);
    }, 100);
} // displayStores

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

$(document).ready(function() {
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

    // initialise the map
    map = T5.Map({
        container: 'mapCanvas'
    });

    map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
            // demo api key, register for an API key
            // at http://dev.cloudmade.com/
            apikey: '7960daaf55f84bfdb166014d0b9f8d41',
            styleid: 999
    }));

    // goto the specified position
    map.gotoPosition(T5.Geo.Position.parse('37.16 -96.68'), 3);
});