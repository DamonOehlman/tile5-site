DEMO = (function() {
    
    
    /* internals */
    
    var sampleId = location.hash.replace(/.*\/(.*)$/, '$1'),
        t5loaders = {
            '0.9.3': function(chain) {
                return chain;
            },
            
            dev: function(chain) {
                return chain
                    .script('/js/tile5/dev/tile5.js').wait()
                    .script('/js/tile5/dev/geo/osm.js')
                    // TODO: do this more intelligently
                    .script('/js/tile5/dev/plugins/zoomify.js');
            }
        };
    
    function getSampleConfig(callback) {
        callback({
            geoip: true,
            version: 'dev'
        });
    } // getSampleConfig
    
    /* exports */
    
    function loadCode(callback) {
        $.ajax({
            url: '/js/samples/' + sampleId + '.js',
            dataType: 'text',
            success: function(data) {
                callback(data);
            }
        });
    } // loadCode
    
    function run() {
        getSampleConfig(function(config) {
            var chain = $LAB;
            
            // load geo ip if required
            chain = config.geoip ? chain.script('http://j.maxmind.com/app/geoip.js') : chain;
            
            // run the tile5 loader
            chain = t5loaders[config.version](chain).wait();
            
            // finally load the sample
            chain.script('/js/samples/' + sampleId + '.js');
        });
    } // run
    
    return {
        loadCode: loadCode,
        run: run
    };
})();