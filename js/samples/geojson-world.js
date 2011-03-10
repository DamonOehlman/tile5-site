var map;

function displayFirstElement(elements, hideDelay) {
    if (elements.length > 0) {
        var props = elements[0].target ? elements[0].target.properties : null;
        if (props) {
            DEMO.status(props.name, hideDelay);
            elements[0].target.scale = hideDelay ? 1 : 1.2;
        } // if
    } // if
}

$(document).ready(function() {
    DEMO.loadStyle('map-overlays');

    // initialise the map
    map = new T5.Map({
        container: 'mapCanvas',
        clipping: true,
        minZoom: 3,
        maxZoom: 10
    });

    // set the map background to an oceanesque colour...
    // $('#mapCanvas').css('background', '#5f8dd3');

    // goto the specified position
    map.gotoPosition(T5.Geo.Position.parse('37.16 -96.68'), 3);
    
    map.bind('hoverHit', function(evt, elements, absXY, relXY, offsetXY) {
        displayFirstElement(elements);
    });
    
    map.bind('tapHit', function(evt, elements, absXY, relXY, offsetXY) {
        displayFirstElement(elements, 1000);
    });    
    
    map.bind('hoverOut', function(evt, elements, absXY, relXY, offsetXY) {
        displayFirstElement(elements, 100);
    });

    DEMO.status('Loading World Data');
    
    // get the walmarts data
    $.ajax({
        url: '/js/data/world.json',
        dataType: 'json',
        success: function(data, textStatus, raw) {
            DEMO.status('Parsing GeoJSON');

            T5.GeoJSON.parse(data, function(layers) {
                for (layerId in layers) {
                    layers[layerId].style = 'area.simple';
                    layers[layerId].hoverStyle = 'area.highlight';
                    layers[layerId].downStyle = 'area.highlight';
                    
                    map.setLayer(layerId, layers[layerId]);
                } // for
                
                DEMO.status();
            });
        },
        error: function(raw, textStatus, errorThrown) {
            DEMO.status('Error loading data', 1000);
        }
    });    
});