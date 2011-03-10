TUTOR.tutorials.simpleMapMarker = function(map) {
    var centerPos = T5.Geo.Position.parse("-27.468 153.028");

    // goto the specified position, once this is complete, add the marker
    map.gotoPosition(centerPos, 12, function() {
        // create the new annotation
        var marker = new T5.ImageMarker({
            imageUrl: "/img/pins/pin-158935-1-24.png",
            animatingImageUrl: "/img/pins/pin-158935-1-noshadow-24.png",
            imageAnchor: T5.XY.init(8, 24),
            xy: T5.GeoXY.init(centerPos),
            tweenIn: T5.easing('sine.out'),
            animationSpeed: 500
        });

        map.markers.add(marker);    
    });
}; // simpleMapMarker