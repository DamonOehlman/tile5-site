DEMO = (function() {
    
    // initialise constants
    var tickCount = new Date().getTime(),
        activeSample = null,
        sampleMap = null,
        DEFAULT_GENERATOR = 'osm.cloudmade',
        DEFAULT_VERSION = 'dev',
        DEFAULT_RENDERER = 'canvas',
        DEFAULT_CONFIG = {
            version: 'dev' // '0.9.4.2'
        };
    
    /* internals */
    
    var activeConfig,
        removeStatusTimeout,
        sampleId = location.hash.replace(/.*\/(.*?)($|\?.*$)/, '$1'),
        currentGen = '',
        currentOpts = {
            zoombar: {
                images: '/img/zoom.png'
            }
        },
        currentVersion = DEFAULT_VERSION,
        currentRenderer = location.hash.replace('#', '') || DEFAULT_RENDERER,
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
                return chain
                    .script('/js/tile5/dev/tile5.js').wait()
                    .script('/js/tile5/dev/plugins/renderer.zoombar.js');
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
            },
            'osm.wms': {
                mapurl: 'http://www2.demis.nl/worldmap/wms.asp?Service=WMS&Version=1.1.0&Request=GetMap&WIDTH=256&HEIGHT=256&SRS=EPSG:4326&Layers=Countries&Format=image/png&'
            }
        },
        
        // define the generator dependencies
        generatorDeps = {
            'osm.cloudmade': function(loader, version, callback) {
                return loader
                    .script('/js/tile5/' + version + '/engines/osm.js?v=' + tickCount).wait()
                    .script('/js/tile5/' + version + '/engines/cloudmade.js?v=' + tickCount)
                    .wait(callback);
            },
            
            decarta: function(loader, version, callback) {
                return loader
                    .script('/js/tile5/' + version + '/engines/decarta.js?v=' + tickCount)
                    .wait(function() {
                        T5.Decarta.applyConfig({
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
                    .script('/js/tile5/' + version + '/engines/bing.js?v=' + tickCount)
                    .wait(function() {
                        callback(loader);
                    });
            },
            
            'osm.wms': function(loader, version, callback) {
                return loader
                    .script('/js/tile5/' + version + '/engines/osm.js?v=' + tickCount).wait()
                    .script('/js/tile5/' + version + '/engines/wms.js?v=' + tickCount)
                    .wait(callback);
            }
        },
        
        // define renderer dependencies
        rendererDeps = {
            'canvas/dom': function(chain) {
                return chain.script('/js/tile5/dev/plugins/renderer.dom.js');
            },
            
            raphael: function(chain) {
                return chain
                    .script('/js/libs/raphael.js').wait()
                    .script('/js/tile5/dev/plugins/renderer.raphael.js');
            },
            
            'three:webgl': function(chain) {
                return chain
                    .script('/js/libs/Three.js').wait()
                    .script('/js/tile5/dev/plugins/renderer.three.js');
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
    
    function loadDeps(callback) {
        var deps = rendererDeps[currentRenderer],
            extraLibs = DEMO.Sample.extraLibs || [];
        
        function loadExtraLibs() {
            if (extraLibs.length > 0) {
                var chain = $LAB;
                
                for (var ii = 0; ii < extraLibs.length; ii++) {
                    chain = chain.script(extraLibs[ii]);
                } // for
                
                chain.wait(callback);
            }
            else if (callback) {
                callback();
            } // if..else
        } // loadExtraLibs
        
        if (deps) {
            deps($LAB).wait(loadExtraLibs);
        }
        else {
            loadExtraLibs();
        } // if..else
    } // loadDeps
    
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
        
        // use the default id if not set
        id = id || DEFAULT_GENERATOR;
        
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
        var statsElem = $('#demoStats')[0];
        if (statsElem) {
            $LAB.script('/js/libs/Stats.js').wait(function() {
                var stats = new Stats();

                // add the stats display to the dom
                statsElem.appendChild(stats.domElement);
                setInterval(function() {
                    stats.update();
                }, 1000 / 60);

                statsLoaded = true;
            });
        } // if
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
    
    function updateCombo(selector, validOpts, initValue) {
        var enabledOpts,
            currentValue = initValue || $(selector).val();
        
        $(selector + ' option:disabled').removeAttr('disabled');
        if (validOpts) {
            $(selector + ' option').each(function() {
                if (validOpts.indexOf(this.value) < 0) {
                    $(this).attr('disabled', 'disabled');
                } // if
            });
        } // if
        
        if (! initValue) {
            // select the first valid option
            enabledOpts = $(selector + ' option:enabled');
            if (enabledOpts.length) {
                initValue = enabledOpts[0].value;
            } // if
        }
        
        $(selector).val(initValue);
    } // updateCombo
    
    function updateControls() {
        updateCombo('#renderer', DEMO.Sample ? DEMO.Sample.renderers : null, currentRenderer);
        updateCombo('#generator', DEMO.Sample ? DEMO.Sample.generators : null);
        
        // bind to controls
        $('#renderer').change(function() {
            // update the current renderer
            currentRenderer = $(this).val();

            // change the renderer on the fly :)
            if (sampleMap) {
                loadDeps(function() {
                    sampleMap.renderer(currentRenderer + '/zoombar');
                });
            } // if
        });
        
        $('#generator').change(function() {
            loadGenerator($(this).val(), $LAB);
        });
        
        $('#btnRestart').click(function() {
            if (sampleMap) {
                sampleMap.unbind();
            } // if
            
            run();
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
        var deps = rendererDeps[currentRenderer];
        
        if (firstRun) {
            // update the controls
            updateControls();
        } // if
        
        loadDeps(function() {
            loadGenerator($('#generator').val(), $LAB, function() {
                // remove any children of the map container
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
                        currentRenderer + '/zoombar', 
                        currentGen, 
                        currentOpts);

                    if (! statsLoaded) {
                        loadStats();
                    } // if
                } // if
            });
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