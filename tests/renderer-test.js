// initialise the start position
var startPos = T5.Geo.Position.init(51.507273368348315, -0.12730836868286133),
    map = new T5.Map({
        // Point to which canvas element to draw in
        container: 'mapContainer',
    	renderer: (renderer || 'canvas') + '/zoombar',
    	zoombar: {
    	    images: '/img/zoom.png'
    	}
    });

map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
        // demo api key, register for an API key
        // at http://dev.cloudmade.com/
        apikey: '7960daaf55f84bfdb166014d0b9f8d41'
}));

// map.setLayer('tiles', new T5.ImageLayer('decarta'));

// start in london for something difference
map.gotoPosition(startPos, 10);

/*
// add a sphere at the specified position
map.markers.add(new T5.Arc({
	xy: T5.GeoXY.init(startPos),
	size: 20
}));
*/

var marker = new T5.Marker({
        xy: T5.GeoXY.init(startPos),
        draggable: true,
        size: 20,
        hoverStyle: T5.defineStyle('hoverTest', {
                        fill: '#bbbbbb'
                    })
    }),
    polyPoints = [
        T5.GeoXY.init(startPos),
        T5.GeoXY.init(T5.Geo.Position.init(startPos.lat - 1, startPos.lon - 1)),
        T5.GeoXY.init(T5.Geo.Position.init(startPos.lat - 1, startPos.lon + 1)),
        T5.GeoXY.init(startPos)
    ];

// add a sphere at the specified position
map.markers.add(marker);
marker.animate('translate', [0, -200], [0, 0]);

map.markers.add(new T5.Poly([
        T5.GeoXY.init(startPos),
        T5.GeoXY.init(T5.Geo.Position.init(startPos.lat + 3, startPos.lon + 3))
    ], 
    { fill: false })
);

map.markers.add(new T5.Poly(polyPoints, {
    style: T5.defineStyle('test', {
        fill: '#FF0000'
    })
}));