(function() {
function prepareMap(map) {
    // goto brisbane :)
    map.gotoPosition(T5.Geo.P.parse('-27.468 153.028'), 7);
    
    // remove the poly demo layer
    map.removeLayer('polyDemo');
} // prepareMap

TUTOR.tutorials.styledGeopoly = function(map) {
    // prepare the map for the demo
    prepareMap(map);

    // create a new poly layer
    var polyDemo = new T5.PolyLayer({
        style: 'area.parkland'
    });
    
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

TUTOR.tutorials.styleOverride = function(map) {
    // initialise position array
    var poly1 = [
            '-26.638, 153.078', 
            '-27.557, 151.941',
            '-27.994, 153.413',
            '-26.638, 153.078'
        ],
        poly2 = [
            '-26.647, 150.172',
            '-28.208, 152.012',
            '-26.180, 152.661',
            '-26.647, 150.172'
        ];
    
    // prepare the map for the demo
    prepareMap(map);

    // create a new poly layer
    var polyDemo = new T5.PolyLayer({
        style: 'area.parkland'
    });
    
    // create a simple poly
    polyDemo.add(new T5.Geo.UI.Poly(poly1, {
        fill: true 
    }));
    
    // now add another layer with a style override
    polyDemo.add(new T5.Geo.UI.Poly(poly2, {
        fill: true,
        style: 'area.purple'
    }));
    
    map.setLayer('polyDemo', polyDemo);
}; // simpleRectangle
})();

