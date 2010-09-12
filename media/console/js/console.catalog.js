CONSOLE.Catalog = (function() {
    var catalog = [],
        callbackIds = {};
    
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
            var centerPos = T5.Geo.B.getCenter(map.getBoundingBox());
            
            // create the new annotation
            var annotation = new T5.Geo.UI.ImageAnnotation({
                imageUrl: "/media/img/pins/pin-158935-1-24.png",
                animatingImageUrl: "/media/img/pins/pin-158935-1-noshadow-24.png",
                imageAnchor: new T5.Vector(8, 24),
                pos: centerPos,
                tweenIn: T5.easing('bounce.out'),
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
        title: "Touch Pin",
        code: function(map) {
            // bind to the geo tap event of the map
            var cid = map.bind("geotap", function(absXY, relXY, touchPos, touchBounds) {
                // create the new annotation
                var annotation = new T5.Geo.UI.ImageAnnotation({
                    imageUrl: "/media/img/pins/pin-158935-1-24.png",
                    animatingImageUrl: "/media/img/pins/pin-158935-1-noshadow-24.png",
                    imageAnchor: new T5.Vector(8, 24),
                    pos: touchPos,
                    tweenIn: T5.easing('bounce.out'),
                    animationSpeed: 1000
                });

                // add an annotation at the center position
                map.annotations.add(annotation);                
            });
            
            // save the callback id so we can unbind the event later
            callbackIds["geotap"] = cid;
        },
        
        cleanup: function(map) {
            for (var evtName in callbackIds) {
                map.unbind(evtName, callbackIds[evtName]);
            } // for
            
            callbackIds = {};
            map.annotations.clear();
            map.repaint();
        }
    });
    
    catalog.push({
        title: "Locate Me",
        code: function(map) {
            map.locate();
        }
    });
    
    catalog.push({
        title: "A - B Route",
        requires: ["route"],
        code: function(map) {
            T5.Geo.Routing.calculate({
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