DEMO = (function() {
    
    // initialise constants
    var tickCount = new Date().getTime(),
        activeSample = null,
        sampleMap = null,
        DEFAULT_VERSION = 'dev',
        DEFAULT_CONFIG = {
            version: 'dev' // '0.9.4.2'
        };
    
    /* internals */
    
    var activeConfig,
        removeStatusTimeout,
        sampleId = location.hash.replace(/.*\/(.*?)($|\?.*$)/, '$1'),
        currentGen = '',
        currentOpts = {},
        currentVersion = DEFAULT_VERSION,
        statsLoaded = false,
        
        // define version loaders
        t5loaders = {
            '0.9.3': function(chain) {
                return chain;
            },
            
            '0.9.4.1': function(chain) {
                return chain.script('/js/tile5/0.9.4.1/tile5.js');
            },

            '0.9.4.2': function(chain) {
                return chain.script('/js/tile5/0.9.4.2/tile5.js');
            },

            dev: function(chain) {
                return chain.script('/js/tile5/dev/tile5.js?v=' + tickCount);
            }
        },
        
        // define tile generators
        generatorOpts = {
            'osm.cloudmade': {
                // demo api key, register for an API key
                // at http://dev.cloudmade.com/
                apikey: '7960daaf55f84bfdb166014d0b9f8d41'
            }, 
            
            decarta: {},
            'osm.mapbox': {},
            'osm.mapquest': {},
            bing: {
                apikey: "AgZHtHdj6xF41EcwYw2Yo0y1kDICGOLJ2ATmDGMFTUX-lSBqssPHcx50lx65oOly",
                style: "Road"
            }
        },
        
        // define the generator dependencies
        generatorDeps = {
            'osm.cloudmade': function(loader, version, callback) {
                return loader
                    .script('/js/tile5/' + version + '/geo/osm.js?v=' + tickCount)
                    .wait(callback);
            },
            
            decarta: function(loader, version, callback) {
                return loader
                    .script('/js/tile5/' + version + '/geo/decarta.js?v=' + tickCount)
                    .wait(function() {
                        T5.Geo.Decarta.applyConfig({
                            server: "http://ws.decarta.com/openls",
                            clientName: "racq-do",
                            clientPassword: "mz5ff3",
                            configuration: "global-decarta", 
                            geocoding: {
                                countryCode: "US",
                                language: "EN"
                            }
                        });
                        
                        callback(loader);
                    });
            },
            
            bing: function(loader, version, callback) {
                return loader
                    .script('/js/tile5/' + version + '/geo/bing.js?v=' + tickCount)
                    .wait(function() {
                        callback(loader);
                    });
            }
        },
        
        // define renderer dependencies
        rendererDeps = {
            'three:webgl': function(chain) {
                return chain
                    .script('/js/libs/Three.js').wait()
                    .script('/js/tile5/dev/plugins/renderer.three.js?v=' + tickCount);
            },
            /*
            'three:canvas': function(chain) {
                return chain.script('/js/libs/Three.js');
            }
            */
            webgl: function(chain) {
                return chain
                    .script('/js/tile5/dev/plugins/renderer.webgl.js?v=' + tickCount);
            }
        };
        
    function canChangeTiles() {
        return activeSample && sampleMap && (! activeSample.preventTileChange);
    } // canChangeTiles
        
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
    
    function handleUserMessages() {
        T5.bind('userMessage', function(evt, msgType, msgKey, msgHtml) {
            var msgTarget = $('#usermessages-' + msgType),
                existingMsg = msgTarget.find('li.message[data-key=' + msgKey + ']');
                
            if (existingMsg.length > 0) {
                existingMsg.html(msgHtml);
            }
            else {
                msgTarget.append('<li class="message" data-key="' + msgKey + '">' + msgHtml + '</li>');
            } // if..else
        });
    } // handleUserMessages
    
    function loadControls(snippetId, callback) {
        $.ajax({
            url: '/snippets/' + snippetId + '.html?ticks=' + (new Date().getTime()),
            dataType: 'text',
            success: function(content) {
                $('#demoControls').html(content).show();
                
                if (callback) {
                    callback();
                } // if
            }
        });
    } // loadControls
    
    function loadGenerator(id, loader, callback) {
        
        function updateAndReload() {
            // update the current generator and opts
            currentGen = id;
            currentOpts = $.extend({}, generatorOpts[id]);
            
            if (canChangeTiles()) {
                sampleMap.removeLayer('tiles');
                sampleMap.setLayer('tiles', new T5.ImageLayer(currentGen, currentOpts));
                sampleMap.invalidate();
            } // if
            
            if (callback) {
                callback(loader);
            }
        } // updateAndReload
        
        // remove existing acknowledgements
        $('#usermessages-ack li').remove();
        
        // if a generator loader function is defined, then load it
        if (generatorDeps[id]) {
            generatorDeps[id](loader, currentVersion, updateAndReload);
        }
        else {
            updateAndReload();
        } // if..else
    } // loadGenerator
    
    function loadStats() {
        $LAB.script('/js/libs/Stats.js').wait(function() {
            var stats = new Stats();

            // add the stats display to the dom
            $('#demoStats')[0].appendChild(stats.domElement);
            setInterval(function() {
                stats.update();
            }, 1000 / 60);
            
            statsLoaded = true;
        });
    } // loadStats
    
    function makePretty(input) {
        var chunks = input.split('-');
        
        for (var ii = chunks.length; ii--; ) {
            if (chunks[ii].length > 0) {
                chunks[ii] = chunks[ii][0].toUpperCase() + chunks[ii].slice(1).toLowerCase();
            } // if
        } // for
        
        return chunks.join(' ').replace(/geojson/i, 'GeoJSON');
    } // makePretty
    
    function updateCombo(selector, validOpts) {
        var enabledOpts,
            currentValue = $(selector).val();
        
        $(selector + ' option:disabled').removeAttr('disabled');
        if (validOpts) {
            $(selector + ' option').each(function() {
                if (validOpts.indexOf(this.value) < 0) {
                    $(this).attr('disabled', 'disabled');
                } // if
            });
        } // if
        
        // select the first valid option
        enabledOpts = $(selector + ' option:enabled');
        if (enabledOpts.length) {
            $(selector).val(enabledOpts[0].value);
        } // if
    } // updateCombo
    
    function updateControls() {
        updateCombo('#renderer', DEMO.Sample ? DEMO.Sample.renderers : null);
        updateCombo('#generator', DEMO.Sample ? DEMO.Sample.generators : null);
        
        // bind to controls
        $('#renderer').change(function() {
            var deps = rendererDeps[$(this).val()];

            $('#mapContainer *').remove();
            if (deps) {
                deps($LAB).wait(DEMO.run);
            }
            else {
                DEMO.run();
            } // if..else
        });
        
        $('#generator').change(function() {
            loadGenerator($(this).val(), $LAB);
        });        
    } // updateControls
    
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
    
    function loadStyles(styles) {
        if (styles) {
            for (var ii = styles.length; ii--; ) {
                T5.loadStyles('/js/tile5/' + currentVersion + '/style/' + styles[ii] + '.js');
            } // for
        } // if
    } // loadStyles
    
    function init(config, callback) {
        config = $.extend({
            version: DEFAULT_VERSION
        }, config);
        
        // update the current version
        currentVersion = config.version = 'dev'; // TODO: remove this
        
        // load the tile5 version
        var versionLoader = t5loaders[config.version],
            loader = versionLoader ? versionLoader($LAB).wait(function() {
                if (callback) {
                    handleUserMessages();
                    callback(loader);
                } // if
            }) : null;
    } // init
    
    function run(firstRun) {
        if (firstRun) {
            // update the controls
            updateControls();
        } // if
        
        loadGenerator($('#generator').val(), $LAB, function() {
            // remove any children of the map container
            $('#mapContainer *').remove();
            
            if (activeSample) {
                // if we have a stop method then stop
                if (activeSample.stop) {
                    activeSample.stop();
                } // if

                // if we have a map, then unbind
                if (sampleMap) {
                    sampleMap.detach();
                    sampleMap = null;
                } // if

                // clear the active sample
                activeSample = null;
            } // if

            // update the active sample
            activeSample = DEMO.Sample;

            // if we have an active sample, then run it
            if (activeSample && activeSample.run) {
                loadStyles(DEMO.Sample.styles);

                sampleMap = activeSample.run(
                    'mapContainer', 
                    $('#renderer').val(), 
                    currentGen, 
                    currentOpts);
                    
                if (! statsLoaded) {
                    loadStats();
                } // if
            } // if
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
        Sample: null,
        
        getHomePosition: getHomePosition,
        getMap: function() {
            return sampleMap;
        },
        
        init: init,
        loadCode: loadCode,
        run: run,
        status: status
    };
})();