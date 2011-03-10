GEOCOMMONS_DEMO = (function() {
    // define constants
    var BASEURL = 'http://geocommons.com/overlays/{0}/features.json?geojson=1',
        REQUEST_TIMEOUT = 15000;
    
    // initialise variables
    var map,
        loading = false,
        layerData = {},
        sequenceCounter = 0;
        
    /* internal functions */
    
    function displayOverlay(overlayId, data) {
        T5.GeoJSON.parse(
            data, 
            function(layers) {
                COG.info('geojson parsing complete for: ' + overlayId);
                
                for (var layerId in layers) {
                    var layer = layers[layerId];
                    
                    // if the layer supports styling then apply
                    layer.style = 'area.parkland';
                    map.setLayer(layerId, layer);
                } // for
            }, {
                simplify: true
            });        
    } // displayOverlay
    
    function loadLayerData(layerId, callback, sequenceId) {
        if (layerData[layerId]) {
            callback(layerData[layerId]);
        }
        else {
            var allowCached = $('#allowcached').attr('checked'),
                ajaxOpts = {
                    url: COG.formatStr(BASEURL, layerId),
                    dataType: 'jsonp',
                    success: function(data, textStatus, raw) {
                        COG.info('received response');
                        layerData[layerId] = data;
                        callback(data);
                    
                    },
                    error: function(raw, textStatus, errorThrown) {
                        COG.info('error triggered');
                        DEMO.status();
                    },
                    complete: function(raw, textStatus) {
                        COG.info('complete triggered');
                        if (! layerData[layerId]) {
                            DEMO.status();
                        } // if
                    }
                };
                
            COG.info('allow cached = ' + allowCached);
            if (allowCached) {
                ajaxOpts = $.extend(ajaxOpts, {
                    cache: true,
                    jsonpCallback: 'callback' + layerId
                });
            } // if
            
            DEMO.status('Retrieving Layer (#' + layerId + ') Data');
            
            $.ajax(ajaxOpts);
        } // if..else
    } // loadLayerData
    
    function resetMap(callback) {
        map.gotoPosition(T5.Geo.Position.init(41.77131167976406, -101.07421875), 2, callback);
        
        map.markers.clear();
        map.markers.add(new T5.ImageMarker({
            imageUrl: "/img/pins/pin-158935-1-24.png",
            imageAnchor: T5.XY.init(8, 24),
            xy: T5.GeoXY.init(T5.Geo.Position.init(41.77131167976406, -101.07421875))
        }));
    } // resetMap
    
    /* exports */
    
    function load(overlayId) {
        var sequenceId;
        
        // increment sequence counter and assign
        sequenceCounter += 1;
        sequenceId = sequenceCounter;
        
        // update the value of the layer id box
        $('#layerid').val(overlayId);

        // load the layer data
        loadLayerData(overlayId, function(data) {
            // if this request is still valid then process
            if (sequenceId === sequenceCounter) {
                DEMO.status('parsing GeoJSON data');
                resetMap(function() {
                    displayOverlay(overlayId, data);

                    DEMO.status();
                });
            } // if
        }, sequenceId);
    } // loadOverlay
    
    /* module definition */
    
    var module = {
        load: load,
        select: function(dsid) {
            currentDataset = dsid;
            retrieveData(dsid, map.getBoundingBox());
        }
    };
    
    $(document).ready(function() {
        DEMO.loadStyle('map-overlays');

        map = new T5.Map({
            container: "mapCanvas"
        });
        
        map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
                // demo api key, register for an API key
                // at http://dev.cloudmade.com/
                apikey: '7960daaf55f84bfdb166014d0b9f8d41'
        }));
        
        resetMap();
        module.map = map;
        
        $('#geojson-samples a').each(function() {
            var layerId = $(this).attr('data-layerid');
            
            $(this).click(function() {
                load(layerId);
                return false;
            });
            
            $(this).after(' <a class="geocommons" target="_blank" href="http://geocommons.com/overlays/' + layerId + '">geocommons</a>');
        });
    });
    
    return module;
})();