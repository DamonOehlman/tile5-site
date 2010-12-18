(function() {
function prepareMap(map) {
    // goto brisbane :)
    map.gotoPosition(T5.Geo.P.parse('-27.468 153.028'), 7);
    
    // remove the poly demo layer
    map.removeLayer('polyDemo');
} // prepareMap

TUTOR.tutorials.simpleRectangle = function(map) {
    // prepare the map for the demo
    prepareMap(map);

    // create a new poly layer
    var polyDemo = new T5.PolyLayer();
    
    // create a simple poly
    var testPoly = new T5.Poly([
        new T5.Geo.GeoVector(T5.Geo.P.parse('-26.638, 153.078')),
        new T5.Geo.GeoVector(T5.Geo.P.parse('-27.557, 151.941')),
        new T5.Geo.GeoVector(T5.Geo.P.parse('-27.994, 153.413')),
        new T5.Geo.GeoVector(T5.Geo.P.parse('-26.638, 153.078'))
    ], { fill: true });
    
    polyDemo.add(testPoly);
    map.setLayer('polyDemo', polyDemo);
}; // simpleRectangle

TUTOR.tutorials.simpleRectangleGeopoly = function(map) {
    // prepare the map for the demo
    prepareMap(map);

    // create a new poly layer
    var polyDemo = new T5.PolyLayer();
    
    // create a simple poly
    var testPoly = new T5.Geo.UI.Poly([
        '-26.638, 153.078',
        '-27.557, 151.941',
        '-27.994, 153.413',  // can also use T5.Geo.P.parse()
        '-26.638, 153.078'   // or initialise position with new T5.Geo.Position
    ], { fill: true });
    
    polyDemo.add(testPoly);
    map.setLayer('polyDemo', polyDemo);
}; // simpleRectangle
})();

