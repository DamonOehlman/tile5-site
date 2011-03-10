DEMO = (function() {
    
    // initialise constants
    var DEFAULT_CONFIG = {
        version: '0.9.4.2'
    };
    
    /* internals */
    
    var activeConfig,
        removeStatusTimeout,
        sampleId = location.hash.replace(/.*\/(.*?)($|\?.*$)/, '$1'),
        t5loaders = {
            '0.9.3': function(chain) {
                return chain;
            },
            
            '0.9.4.1': function(chain) {
                return chain
                    .script('/js/tile5/0.9.4.1/tile5.js').wait()
                    .script('/js/tile5/0.9.4.1/geo/osm.js');
            },

            '0.9.4.2': function(chain) {
                return chain
                    .script('/js/tile5/0.9.4.2/tile5.js').wait()
                    .script('/js/tile5/0.9.4.2/geo/osm.js');
            },

            dev: function(chain) {
                return chain
                    .script('/js/tile5/dev/tile5.js').wait()
                    .script('/js/tile5/dev/geo/osm.js');
            }
        };
        
    function displaySampleTitle(headerTarget) {
        var header = $(headerTarget ? headerTarget : 'h1'),
            headerText = header.html();
            
        header.html((headerText ? headerText + ': ' : '') + makePretty(sampleId));
    } // displaySampleTitle
    
    function getSampleConfig(callback) {
        var reQueryParams = /^.*?\?(.*)$/,
            queryParams = {};
        
        if (reQueryParams.test(document.location.href)) {
            var paramsSplit = document.location.href.replace(reQueryParams, '$1').split('&');
            
            for (var ii = 0; ii < paramsSplit.length; ii++) {
                var kvp = paramsSplit[ii].split('=');
                
                // if the value is not empty, then update
                if (kvp[1]) {
                    queryParams[kvp[0]] = kvp[1];
                } // if
            } // for
        } // if
        
        callback($.extend({}, DEFAULT_CONFIG, queryParams));
    } // getSampleConfig
    
    function loadControls(snippetId, callback) {
        $.ajax({
            url: '/snippets/' + snippetId + '.html',
            dataType: 'text',
            success: function(content) {
                $('#demoControls').html(content).show();
                
                if (callback) {
                    callback();
                } // if
            }
        });
    } // loadControls
    
    function makePretty(input) {
        var chunks = input.split('-');
        
        for (var ii = chunks.length; ii--; ) {
            if (chunks[ii].length > 0) {
                chunks[ii] = chunks[ii][0].toUpperCase() + chunks[ii].slice(1).toLowerCase();
            } // if
        } // for
        
        return chunks.join(' ').replace(/geojson/i, 'GeoJSON');
    } // makePretty
    
    /* exports */
    
    function getHomePosition() {
        return T5.Geo.Position.init(-27.45, 153.02);
    } // getHomePosition
    
    function loadCode(callback) {
        $.ajax({
            url: '/js/samples/' + sampleId + '.js',
            dataType: 'text',
            success: function(data) {
                callback(data);
            }
        });
    } // loadCode
    
    function loadStyle(styleFile) {
        T5.Style.load('/js/tile5/' + activeConfig.version + '/style/' + styleFile + '.js');
    } // loadStyle
    
    function requireEngine(engineId) {
        return $LAB.script('/js/tile5/' + activeConfig.version + '/geo/' + engineId + '.js');
    } // requireEngine
    
    function run(overrideSampleId, headerTarget) {
        var chain = $LAB;

        function loadSample() {
            // finally load the sample
            chain.script('/js/samples/' + sampleId + '.js');
        } // loadSample
        
        // if the overrideSampleId is specified, then use that
        if (overrideSampleId) {
            sampleId = overrideSampleId;
        } // if
        
        // if we find a map global then detach it
        if (typeof map !== 'undefined') {
            map.detach();
        } // if
        
        // display the sample title
        displaySampleTitle(headerTarget);
        
        getSampleConfig(function(config) {
            // save the active config
            activeConfig = config;
            
            // run the tile5 loader
            chain = t5loaders[config.version](chain).wait();
                    
            if (config.controls) {
                loadControls(config.controls, loadSample);
            }
            else {
                loadSample();
            } // if..else
        });
    } // run
    
    function status(message, delay) {
        clearTimeout(removeStatusTimeout);
        
        if (typeof message !== 'undefined') {
            $('#statusMessage').html(message).addClass('dropped');
        }
        else {
            $('#statusMessage').removeClass('dropped');
        }
        
        if (delay) {
            removeStatusTimeout = setTimeout(function() {
                $('#statusMessage').removeClass('dropped');
            }, delay);
        } // if
    } // status
    
    return {
        getHomePosition: getHomePosition,
        loadCode: loadCode,
        loadStyle: loadStyle,
        requireEngine: requireEngine,
        run: run,
        status: status
    };
})();