var view;


$LAB.script('/js/tile5/dev/plugins/zoomify.js').wait(function() {
    // initialise the map
    view = T5.Zoomify.View({
        container: 'mapCanvas',
        minZoom: 1,
        maxZoom: 3
    });
    
    view.setLayer('tiles', new T5.ImageLayer('zoomify', {
        imagePath: '/img/tiles/epicworld/',
        fullWidth: 2000,
        fullHeight: 1417
    }));
});