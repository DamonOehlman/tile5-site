FRUITY = (function() {
    
    /* internals */
    
    var view,
        sprites,
        plane;
        
    function handleAnimFrame(evt) {
        COG.info('frame');
    } // handleAnimFrame
    
    function handleTap(evt, elements, absXY, relXY, offsetXY) {
        DEMO.status('tapped the plane', 500);
    } // handleTap
    
    /* initialization */
    
    view = new T5.View({
        container: 'mapCanvas'
    });
    
    // handle the draw complete event
    view.bind('drawComplete', handleAnimFrame);
    view.bind('tapHit', handleTap);
    
    // add a shape layer for our sprites
    sprites = new T5.ShapeLayer();
    view.setLayer('sprites', sprites);
    
    // create the plane
    plane = new T5.ImageDrawable({
        xy: T5.XY.init(100, 100),
        imageUrl: '/img/fly/plane.png',
        transformable: true,
        draggable: true
    });
    
    // add the sprite
    sprites.add(plane);
})();