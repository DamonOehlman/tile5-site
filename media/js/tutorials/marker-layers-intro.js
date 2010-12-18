TUTOR.tutorials.simpleMapMarker = function(map) {
    var centerPos = T5.Geo.P.parse("-27.468 153.028");

    // create the new annotation
    var annotation = new T5.ImageAnnotation({
        imageUrl: "/media/img/pins/pin-158935-1-24.png",
        animatingImageUrl: "/media/img/pins/pin-158935-1-noshadow-24.png",
        imageAnchor: new T5.Vector(8, 24),
        xy: new T5.Geo.GeoVector(centerPos),
        tweenIn: T5.easing('sine.out'),
        animationSpeed: 500
    });
    
    map.gotoPosition(centerPos, 12);
    map.markers.add(annotation);    
}; // simpleMapMarker