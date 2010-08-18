CONSOLE.Catalog = (function() {
    var catalog = [];
    
    catalog.push({
        title: "Simple Map",
        code: function(map) {
            map.gotoPosition(CONSOLE.getPosition(0), 10);
        }
    });
    
    catalog.push({
        title: "Pin Center",
        code: function(map) {
            // clear existing annotations
            map.annotations.clear();
            
            // find the current center of the map
            var centerPos = TILE5.Geo.B.getCenter(map.getBoundingBox());
            
            // create the new annotation
            var annotation = new TILE5.Geo.UI.ImageAnnotation({
                imageUrl: "/media/img/pins/pin-158935-1-24.png",
                animatingImageUrl: "/media/img/pins/pin-158935-1-noshadow-24.png",
                imageAnchor: new TILE5.Vector(8, 24),
                pos: centerPos,
                tweenIn: TILE5.Animation.Easing.Bounce.Out,
                animationSpeed: 1000
            });
            
            // add an annotation at the center position
            map.annotations.add(annotation);
        },
        
        cleanup: function(map) {
            map.annotations.clear();
            map.repaint();
        }
    });
    
    catalog.push({
        title: "A - B Route",
        requires: ["route"],
        code: function(map) {
            TILE5.Geo.Routing.calculate({
                waypoints: [
                    CONSOLE.getPosition(0), 
                    CONSOLE.getPosition(1) 
                ],
                map: map,
                success: function() {
                    map.clearBackground();
                    
                    /* create some console action buttons */
                }
            });
        },
        cleanup: function(map) {
            map.removeLayer("route");
        }
    });
    
    return catalog;
})();