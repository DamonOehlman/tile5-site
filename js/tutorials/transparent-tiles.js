(function() {
TUTOR.tutorials.worldGlassBroken = function(map) {
    // reset the images repository to remove any post-processed images
    T5.Images.reset();
    
    // create the mapbox provider using the world-glass tileset
    var mbProvider = new T5.Geo.MapBox.MapProvider({
        tileset: 'world-glass'
    });
    
    // update the map provider as it has already been initialized
    map.provider(mbProvider);
    
    // goto tokyo (for something different)
    map.gotoPosition(new T5.Geo.Position(35.729, 139.702), 6);
}; // worldGlassBroken

TUTOR.tutorials.worldClassClearingBackground = function(map) {
    // reset the images repository to remove any post-processed images
    T5.Images.reset();
    
    // create the mapbox provider using the world-glass tileset
    var mbProvider = new T5.Geo.MapBox.MapProvider({
        tileset: 'world-glass',
        clearBackground: true
    });
    
    // update the map provider as it has already been initialized
    map.provider(mbProvider);
    
    // goto tokyo (for something different)
    map.gotoPosition(new T5.Geo.Position(35.729, 139.702), 6);
    map.trigger('invalidate');
}; // worldClassClearingBackground

TUTOR.tutorials.worldClassBackgroundColor = function(map) {
    // reset the images repository to remove any post-processed images
    T5.Images.reset();
    
    // create the mapbox provider using the world-glass tileset
    var mbProvider = new T5.Geo.MapBox.MapProvider({
        tileset: 'world-glass',
        tileBackgroundColor: '#333'
    });
    
    // update the map provider as it has already been initialized
    map.provider(mbProvider);
    
    // goto tokyo (for something different)
    map.gotoPosition(new T5.Geo.Position(35.729, 139.702), 6);
}; // worldClassBackgroundColor
})();
