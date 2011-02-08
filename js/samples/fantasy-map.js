var view;

$(document).ready(function() {
    // initialise the map
    view = T5.Zoomify.View({
        container: 'mapCanvas'
    });
    
    view.setLayer('tiles', new T5.ImageLayer('zoomify', {
        imagePath: '/img/tiles/epicworld/',
        fullWidth: 2000,
        fullHeight: 1417
    }));
});
