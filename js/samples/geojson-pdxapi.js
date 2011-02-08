PDXDEMO = (function() {
    // define constants
    var PDXAPI = 'http://pdxapi.com/{0}/geojson?bbox={1},{2},{3},{4}',
        MAXDIST = 40;
    
    // initialise variables
    var map,
        lastUrl = '',
        seqCounter = 0,
        datasources = {},
        layerZ = 800,
        currentDataset = '';
        
    function defineLayer(dsid, styleId) {
        // add the datasource to the list of datasources
        datasources[dsid] = {
            style: styleId ? styleId : null,
            enabled: false,
            requestActive: false,
            zindex: layerZ--
        };
        
        $('#datasources').append(COG.formatStr(
            '<tr><td id="{0}_title">{0}</td>' +
            '<td align="center"><input id="{0}_check" type="checkbox" value="{0}" /></td>' + 
            '</tr>', dsid));
        
        $('#' + dsid + '_check').change(function() {
            toggleLayer(this.value);
        });
    } // defineLayer
        
    function retrieveData(dsid, bounds) {
        var requestId, 
            boundsSize = T5.Geo.Position.calcDistance(bounds.min, bounds.max),
            dsUrl = COG.formatStr(PDXAPI,
                dsid,
                bounds.min.lon,
                bounds.min.lat,
                bounds.max.lon,
                bounds.max.lat);
                
        if (datasources[dsid].requestActive) {
            return;
        } // if

        if (boundsSize > MAXDIST) {
            showMessage('Selected bounds too large - try zooming in', 'error', 3000);
            return;
        } // if
                
        COG.info('selected dataset: ' + dsid + ', bounds size = ', boundsSize);
        $('#' + dsid + '_title').prepend('<img src="/img/loading-2.gif" />');
        
        datasources[dsid].requestActive = true;
        COG.jsonp(dsUrl, function(data) {
            updateData(dsid, data);
        });
        
        lastUrl = dsUrl;
    } // retrieveData
    
    function showMessage(msg, msgClass, autohide) {
        var messageContainer = $('#status');
        
        messageContainer
            .removeClass('error info')
            .html(msg)
            .addClass(msgClass ? msgClass : 'info')
            .slideDown();
        
        if (autohide) {
            setTimeout(function() {
                messageContainer.slideUp();
            }, autohide);
        } // if
    } // showMessage
    
    function toggleLayer(dsid) {
        var layerDetails = datasources[dsid];
        
        // update the enabled state
        layerDetails.enabled = ! layerDetails.enabled;
        
        // refresh the display
        if (layerDetails.enabled) {
            retrieveData(dsid, map.getBoundingBox());
        }
        else {
            map.removeLayer(dsid);
        }
    } // toggleLayer
    
    function updateData(dsid, data) {
        COG.info('received data for dataset: ' + dsid);
        
        T5.GeoJSON.parse(
            data.rows, 
            function(layers) {
                COG.info('geojson parsing complete for: ' + dsid);
                
                for (layerId in layers) {
                    var layer = layers[layerId];
                    
                    layer.style = datasources[dsid].style;
                    layer.zindex = datasources[dsid].zindex;

                    map.setLayer(dsid + layerId, layer);
                }
                
                $('#' + dsid + '_title img').remove();
                datasources[dsid].requestActive = false;
            }, {
                rowPreParse: function(row) {
                    return row.value.geometry;
                }
            });
    } // updateData
    
    function updateLayers(bounds) {
        for (var dsid in datasources) {
            if (datasources[dsid].enabled) {
                retrieveData(dsid, bounds);
            } // if
        } // for
    } // updateLayers
    
    var module = {
        map: map,
        
        select: function(dsid) {
            currentDataset = dsid;
            retrieveData(dsid, map.getBoundingBox());
        }
    };
    
    $(document).ready(function() {
        T5.Style.load('/js/tile5/style/map-overlays.js');
        
        // defineLayer('bicycle_network', 'path.bike');
        defineLayer('bridges');
        // defineLayer('business_associations');
        // defineLayer('buslines');
        // defineLayer('council');
        // defineLayer('counties');
        defineLayer('guardrails');
        defineLayer('neighborhoods', 'area.general');
        defineLayer('parks', 'area.parkland');
        // defineLayer('parks_taxlots');
        // defineLayer('parks_trails');
        // defineLayer('pavement_moratorium');
        defineLayer('pedestrian_districts', 'area.general');
        defineLayer('schools');
        // defineLayer('redline_1938');
        // defineLayer('zipcode');
        
        $('#provider-selector').hide();
        // $("#pdxCanvas").attr('width', $("#main").width());
        $('#datasets').change(function() {
            module.select($(this).val());
        });
        
        map = new T5.Map({
            container: 'mapCanvas'
        });
        
        map.setLayer('tiles', new T5.ImageLayer('osm.cloudmade', {
                // demo api key, register for an API key
                // at http://dev.cloudmade.com/
                apikey: '7960daaf55f84bfdb166014d0b9f8d41'
        }));
        
        map.gotoPosition(T5.Geo.Position.init(45.5280, -122.6646), 15, function() {
            map.bind('boundsChange', function(evt, bounds) {
                updateLayers(bounds);
            });
        });
        
        module.map = map;
    });
    
    return module;
})();