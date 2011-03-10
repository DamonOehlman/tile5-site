// Set the source of the JSON 
var SEARCH_URL = 'http://ws.geonames.org/searchJSON?country=AU&fcode=PPL&maxRows=100';

function loadData(data){
    var ii;
    
    // clear any existing markers
    map.markers.clear();
    
    // create the cities
    for (ii = 0 ; ii < data.geonames.length; ii++) {
        var placeData = data.geonames[ii],
            position = T5.Geo.Position.init(placeData.lat, placeData.lng);
            
        // initialise the new marker
        var marker = new T5.ImageMarker({
            population: placeData.population,
            name: placeData.name,
            imageUrl: "/img/pins/pin-158935-1-24.png",
            tweenIn: COG.easing('bounce.out'),
            imageAnchor: T5.XY.init(8, 24),
            xy: T5.GeoXY.init(position)
        });
        
        // add the marker to the map
        map.markers.add(marker);
    } // for
    
    DEMO.status('TIP: Hover over markers to highlight, tap to get info.', 1200);
    map.invalidate();
} // loadData

function handleHover(evt, elements, absXY, relXY, offsetXY) {
    for (var ii = elements.length; ii--; ) {
        elements[ii].target.changeImage('/img/pins/pin-158935-1-24-orange.png');
    } // for
    
    // invalidate the map
    map.invalidate();
} // handleHit

function handleHoverOut(evt, elements, absXY, relXY, offsetXY) {
    for (var ii = elements.length; ii--; ) {
        elements[ii].target.changeImage('/img/pins/pin-158935-1-24.png');
    } // for
    
    // invalidate the map
    map.invalidate();
} // handleHoverOut

function handleTap(evt, elements, absXY, relXY, offsetXY) {
    var tappedNames = [];
    
    for (var ii = elements.length; ii--; ) {
        tappedNames.push(elements[ii].target.name);
    } // for
    
    DEMO.status('tapped: ' + tappedNames.join(', '), 1200);
} // handleTap

var map = new T5.Map({
    // Point to which canvas element to draw in
    container: 'mapCanvas',
    minZoom: 3,
    maxZoom: 5
});

map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
        // demo api key, register for an API key
        // at http://dev.cloudmade.com/
        apikey: '7960daaf55f84bfdb166014d0b9f8d41'
}));

// Draw the map
map.gotoPosition(T5.Geo.Position.parse("-27 133"), 4);

map.bind('hoverHit', handleHover);
map.bind('hoverOut', handleHoverOut);
map.bind('tapHit', handleTap);

// Initiate a request using GRUNTS jsonp call and send the returned information to loadData();
DEMO.status('Loading City Data from Geonames');
COG.jsonp(SEARCH_URL, loadData);