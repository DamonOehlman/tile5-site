// initialise geonames url
var SEARCH_URL = 'http://ws.geonames.org/citiesJSON?formatted=true' + 
        '&north=60.7&south=31.2&west=-18.3&east=45.3&lang=en&style=full';

// initialise variables
var easingEffect = 'sine.out',
    cities = [],
    map,
    loaded = false,
    cityIndex = 0;
    
/* define some internal functions */

function loadCities(geonames) {
    cities = [];
    
    for (var ii = 0; ii < geonames.length; ii++) {
        // create the position from the geonames data
        var pos = T5.Geo.Position.init(geonames[ii].lat, geonames[ii].lng);
        
        // add the position to the cities array
        cities.push(pos);
    }
} // getCities

function nextCity() {
    // increment the city index
    cityIndex += 1;
    if (cityIndex >= cities.length) {
        cityIndex = 0;
    } // if
    
    // clear the map markers and add one for the new city
    map.markers.clear();
    map.markers.add(new T5.ImageMarker({
            imageUrl: "/img/pins/pin-158935-1-24.png",
            imageAnchor: T5.XY.init(8, 24),
            xy: T5.GeoXY.init(cities[cityIndex])
        }));
    
    // pan to the next city position
    map.panToPosition(
        cities[cityIndex],
        function() {
            setTimeout(nextCity, 500);
        },
        T5.easing(easingEffect),
        2500);
}
    
function tour(data) {
    if (data && data.geonames) {
        loadCities(data.geonames);
        
        // reset the city index and start the tour
        map.gotoPosition(cities[0], 5);
        setTimeout(nextCity, 1000);
    }
} // tour

$(document).ready(function() {
    /* initialise the map */

    map = new T5.Map({
        container: "mapCanvas"
    });

    map.setLayer('tiles', new T5.ImageLayer('osm.mapquest'));

    /* initialise sample easing type buttons */

    $("#sample-controls").html(
        '<a href="#">sine.out</a>' + 
        '<a href="#">back.out</a>' + 
        '<a href="#">bounce.out</a>' + 
        '<a href="#">elastic.out</a>');

    $("#sample-controls a").click(function() {
        easingEffect = this.innerText;
        return false;
    });

    /* execute the JSONP request to geonames.org */

    COG.jsonp(SEARCH_URL, tour);    
});