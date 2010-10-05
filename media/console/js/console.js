CONSOLE = (function() {
    
    /* define providers */
    
    var providers = {
        decarta: {
            title: 'deCarta',
            createInstance: function() {
                return new T5.Geo.Decarta.MapProvider();
            }
        },
    
        cloudmade: {
            title: 'Cloudmade',
            createInstance: function() {
                return new T5.Geo.Cloudmade.MapProvider({
                    apikey: "7960daaf55f84bfdb166014d0b9f8d41"
                });
            }
        },
        
        bing: {
            title: 'Bing (Road)',
            createInstance: function() {
                return new T5.Geo.Bing.MapProvider({
                    apikey: "AgZHtHdj6xF41EcwYw2Yo0y1kDICGOLJ2ATmDGMFTUX-lSBqssPHcx50lx65oOly",
                    style: "Road"
                });
            }
        },
        
        bingAerial: {
            title: 'Bing (Aerial)',
            createInstance: function() {
                return new T5.Geo.Bing.MapProvider({
                    apikey: "AgZHtHdj6xF41EcwYw2Yo0y1kDICGOLJ2ATmDGMFTUX-lSBqssPHcx50lx65oOly",
                    style: "AerialWithLabels"
                });
            }
        },
        
        nearmap: {
            title: 'nearmap (AU only)',
            createInstance: function() {
                return new T5.Geo.NearMap.MapProvider();
            }
        }
    };
    
    /* define interfaces */
    
    var interfaces = {
        desktop: {
            layout: "desktop",
            init: function() {
                var mainContent = $("#demo-main");
                mainContent.height($(window).height() - mainContent.offset().top - $("footer").outerHeight());
                
                $("h1").html("Tile5 Desktop / iPad Demo Interface");
            },
            
            resize: function() {
                var modeElement = $("#" + activeMode).get(0),
                    modeWindowWidth = $(window).width() - $("#sidebar").outerWidth() - 1,
                    modeWindowHeight = $("#demo-main").height()  - $("#modes li").outerHeight() - 1;

                if (modeElement && (modeElement.tagName.toUpperCase() == "CANVAS")) {
                    $(modeElement).attr("width", modeWindowWidth).attr("height", modeWindowHeight);

                    if (map) {
                        map.repaint();
                        GT.say("view.wake", { id: "" });
                    } // if
                } // if
                else if (modeElement) {
                    $(modeElement).css("width", modeWindowWidth).css("height", modeWindowHeight);
                } // if..else
            }
        },
        
        mobile: {
            layout: "mobile",
            preInit: function() {
            },
            
            init: function() {
                $('#demo-settings').click(function() {
                    $('#mapContainer').fadeOut('fast', function() {
                        $('#demo-menu').show();
                    });
                });
                
                $('button.update').click(function() {
                    $('#demo-menu').fadeOut('fast', function() {
                        $('#mapContainer').show();
                        scrollTo(0, 0);
                    });
                });
                
                setTimeout(function() {
                    scrollTo(0, 0);
                }, 100);
            },
            
            resize: function() {
                var modeElement = $("#" + activeMode).get(0);

                if (modeElement && (modeElement.tagName.toUpperCase() == "CANVAS")) {
                    $(modeElement).attr("width", screen.width).attr("height", 340);

                    if (map) {
                        map.repaint();
                        GT.say("view.wake", { id: "" });
                    } // if
                } // if
            }
        },
        
        oldbrowser: {
            layout: "oldbrowser",
            init: function() {
                var mainContent = $("#sad");
                mainContent.height($(window).height() - mainContent.offset().top - $("footer").outerHeight());
            }
        }
    };
    
    /* other variable definitions */
    
    var map,
        activeProvider,
        activeInterface,
        activeSample,
        activeDataset,
        activeCapabilities = {},
        activeMode,
        lastDatasetIndex,
        resizeTimeout = 0;
       
    function getActiveProvider() {
        if (! providers[activeProvider].instance) {
            providers[activeProvider].instance = providers[activeProvider].createInstance();
        } // if
        
        return providers[activeProvider].instance;
    } // getActiveProvider
        
    function buildInterface(interfaceId, callback) {
        activeInterface = interfaces[interfaceId];
        
        if (activeInterface) {
            if (activeInterface.preInit) {
                activeInterface.preInit();
            } // if
            
            $.ajax({
                url: "/media/console/interfaces/" + activeInterface.layout + ".html?ticks=" + new Date().getTime(),
                success: function(data) {
                    $("#console").html(data);
                    
                    // initialise the layout
                    activeInterface.init();

                    // if teh callback is defined, then run it
                    if (callback) {
                        callback();
                    }
                }
            });
        } // if
    } // buildInterface
    
    /* mode management */
    
    function sizePageElements() {
        if (activeInterface.resize) {
            activeInterface.resize();
        } // if
    } // sizePageElements
    
    function changeMode(modeId) {
        activeMode = modeId;
        $("#modes li").removeClass("active");
        $("#mode_" + modeId).addClass("active");

        $(".mode").hide();

        sizePageElements();
        
        if (modeId == "mapCanvas") {
            $(".slider").show();
        }
        else {
            $(".slider").fadeOut();
        }
        
        $("#" + modeId).fadeIn("normal");
    } // changeMode
    
    function handleModeUpdates() {
        $("#modes a").click(function() {
            changeMode(this.href.replace(/^.*\#(.*)$/, "$1"));
            
            return false;
        });
    } // handleModeUpdates
    
    /* provider selection, etc */
    
    function checkProviderChange() {
        // get the provider specified by the url
        var urlProvider = document.location.href.replace(/^.*\#(.*)$/, "$1");
        
        // if the provider specified by the url is not the same as the active provide, then change the map 
        // provider
        if (urlProvider != activeProvider) {
            changeProvider(urlProvider);
        } // if
    } // checkProviderChange
    
    function createMap() {
        // create the provider
        var mapProvider = getActiveProvider();
        
        // create the map
        map = new T5.Map({
            container: "mapCanvas",
            autoSize: false,
            crosshair: false,
            panAnimationDuration: 600,
            panAnimationEasing: T5.easing('sine.out'),
            provider: mapProvider
        });
    } // createMap
    
    function changeProvider(providerId) {
        if (providerId != activeProvider) {
            var initMap = (! map);
            
            activeProvider = providerId;

            $("#providers li").removeClass("active");

            if (providers[providerId]) {
                activeSample = null;
                var mainContent = $("#demo-main");

                updateCapabilityStatus(providerId);
                $("#provider_" + providerId).addClass("active");
                
                loadSamples();

                if (initMap) {
                    createMap();
                    
                    map.bind("zoomLevelChange", function(zoomLevel) {
                        var zoomRange = map.provider().getZoomRange();

                        var rangeApi = $("#zoom").data("rangeinput"),
                            rangeConfig = rangeApi ? rangeApi.getConf() : null;

                        if (rangeApi) {
                            // update the zoom parameters
                            rangeConfig.min = zoomRange.min;
                            rangeConfig.max = zoomRange.max;

                            // set the value
                            if (zoomLevel !== rangeApi.getValue()) {
                                rangeApi.setValue(zoomLevel);
                            } // if
                        } // if
                    });
                    
                    runCodeSample(map, "0");
                }
                else {
                    var provider = getActiveProvider();
                    if (provider) {
                        var centerPos = map.getCenterPosition();
                        
                        map.provider(provider);
                        map.gotoPosition(centerPos, map.getZoomLevel());
                    }
                } // if..else
                
                if (map) {
                    map.annotations.clear();
                    map.repaint();
                } // if

                setTimeout(updateProviderInformation, 1000);
            } // if
        }
    } // changeProvider
    
    function updateProviderInformation() {
        // if we do have a current 
        var currentProvider = getActiveProvider(),
            logoUrl = currentProvider ? currentProvider.getLogoUrl() : null,
            copyrightText = currentProvider ? currentProvider.getCopyright() : "",
            logoImage = $('#providerLogo').get(0);
            
        if (logoImage) {
            logoImage.src = logoUrl ? logoUrl : "/media/img/tile5-flat.png";
        } // if

        $("#copyright").html(copyrightText);
    } // updateProviderInformation
    
    function updateCapabilityStatus(providerId) {
        $("#caps .capability").each(function() {
            var engine = null;
            try {
                engine = T5.Geo.getEngine(this.id, providerId);
            } 
            catch (e) {}
            
            // update the capability status
            activeCapabilities[this.id] = engine && (engine.id == providerId);
            
            // update the display
            $(this).removeClass("yes").removeClass("no");
            $(this).addClass(activeCapabilities[this.id] ? "yes" : "no");
        });
    } // updateCapabilityStatus
    
    function displayProviders() {
        var listHtml = "";
        
        for (var providerId in providers) {
            listHtml += "<li id='provider_" + providerId + "'><a href='#" + providerId + "'>" + providers[providerId].title + "</a></li>";
        } // for
        
        $("#providers").html(listHtml).find("a").click(function() {
            setTimeout(checkProviderChange, 50);
        });
    } // displayProviders
    
    /* geo dataset selection, etc */
    
    function getPositionData(index) {
        if (activeDataset && (activeDataset.positions.length > index)) {
            return activeDataset.positions[index];
        } // if
        
        return null;
    } // getPositionData
    
    function loadDatasets() {
        var listHtml = "";
        for (var ii = 0; ii < CONSOLE.Datasets.length; ii++) {
            listHtml += "<li id='dataset_" + ii + "'><a href='#" + ii + "'>" + CONSOLE.Datasets[ii].title + "</a></li>";
        } // for
        
        $("#datasets").html(listHtml).find("a").click(function() {
            selectDataset(this.href.replace(/^.*\#(\d+)$/, "$1"));
            return false;
        });
        
        selectDataset(0);
    } // loadDatasets
    
    function selectDataset(index) {
        activeDataset = CONSOLE.Datasets[index ? index : 0];
        
        $("#datasets li").removeClass("active");
        $("#dataset_" + (index ? index : 0)).addClass("active");
        
        if (map && (index !== lastDatasetIndex)) {
            runCodeSample(map, "0");
            lastDatasetIndex = index;
        } // if
    } // selectDataset
    
    /* code sample selection, etc */
    
    function findSampleInstance(index) {
        return index < CONSOLE.Catalog.length ? CONSOLE.Catalog[index] : null;
    } // findSampleInstance
    
    function runCodeSample(map, sampleId) {
        var sample;
        
        // if the active sample is already defined, then see if we need to clean it up
        if (activeSample) {
            sample = findSampleInstance(activeSample);
            if (sample && sample.cleanup) {
                sample.cleanup(map);
            } // if
        } // if
        
        // update the active sample
        activeSample = sampleId;

        $("#samples li").removeClass("active");
        if (activeSample) {
            $("#sample_" + activeSample).addClass("active");

            sample = findSampleInstance(activeSample);
            if (sample && sample.code) {
                sample.code(map);

                updateCodeBox(sample.code);
            } // if

            $("#sampletitle").html(sample.title + " Sample Code");
        } // if
    } // runCodeSample
    
    function updateCodeBox(code) {
        var codeString = code ? code.toString() : "";
        codeString = codeString.replace(/^function.*?\{\n?/, "").replace(/\}.*$/, "");
        
        // replace position references with the actual values
        var matches = /CONSOLE\.getPosition\((\d)+\)/.exec(codeString);
        while (matches) {
            var posData = getPositionData(parseInt(matches[1], 10));
            if (posData) {
                codeString = codeString.replace(matches[0], "T5.Geo.P.parse(\"" + posData.latlng + "\") /* " + posData.title + " */");
            } // if
            
            matches = /CONSOLE\.getPosition\((\d)+\)/.exec(codeString);
        } // while
        
        $("#code-content").remove();
        $("#code-marker").after("<pre id='code-content' class='brush: js; toolbar: false;'>" + codeString + "</pre>");

        var mapInitCode = createMap.toString(),
            initProviderCode = providers[activeProvider].createInstance.toString();
            
        initProviderCode = initProviderCode.replace(/^function.*?\{\n\s*return?/, "").replace(/\;\s*\}.*$/, "");
        mapInitCode = mapInitCode.replace("getActiveProvider()", initProviderCode);
        
        $("#init-content").remove();
        $("#init-marker").after("<pre id='init-content' class='brush: js; toolbar: false;'>" + mapInitCode + "</pre>");
        
        SyntaxHighlighter.highlight();
    } // updateCodeBox
    
    function loadSamples() {
        var listHtml = "";
        
        for (var ii = 0; ii < CONSOLE.Catalog.length; ii++) {
            var sample = CONSOLE.Catalog[ii],
                metRequirements = true;
                
            if (sample.requires) {
                for (var jj = 0; jj < sample.requires.length; jj++) {
                    metRequirements = metRequirements && activeCapabilities[sample.requires[jj]];
                } // for
            } // if
            
            if (metRequirements) {
                listHtml += "<li id='sample_" + ii +"'><a href='#" + ii + "'>" + sample.title + "</a></li>";
            } // if
        } // for
        
        $("#samples").html(listHtml).find("a").click(function() {
            runCodeSample(map, this.href.replace(/^.*\#(.*)$/, "$1"));
            return false;
        });
    } // loadSamples
    
    var module = {
        getPosition: function(index) {
            var posData = getPositionData(index);
            if (posData) {
                return T5.Geo.P.parse(posData.latlng);
            } // if
            
            return null;
        },
        
        getMap: function() {
            return map;
        }
    };
    
    $(document).ready(function() {
        if (Modernizr.canvas) {
            buildInterface(screen.width > 480 ? "desktop" : "mobile", function() {
                // now do the work on activating the interface
                displayProviders();
                
                $("#zoom").rangeinput();
                $("#zoom").change(function(evt, value) {
                    map.setZoomLevel(value);
                });
            
                // set the initial provider to decarta
                loadDatasets();
                changeMode("mapCanvas");

                // set the initial provider
                changeProvider(document.location.hash ? document.location.hash.slice(1) : "decarta");
            
                // update mode listeners
                handleModeUpdates();
            
                $(window).bind("resize", function() {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(function() {
                        sizePageElements();
                    }, 50);
                });
            });
        }
        else {
            buildInterface("oldbrowser", function() {
                
            });
        } // if..else
        
        // preload some images
        T5.Images.load("/media/img/pins/pin-158935-1-24.png");
        T5.Images.load("/media/img/pins/pin-158935-1-noshadow-24.png");
    });
    
    /*
    NOTE: these details are the account details for me (Damon Oehlman) on the decarta devzone.
    For your own API key, simply register at http://devzone.decarta.com/
    */
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
    
    return module;
})();