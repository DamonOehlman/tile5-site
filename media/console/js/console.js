CONSOLE = (function() {
    var map, 
        activeProvider,
        activeSample,
        activeDataset,
        activeCapabilities = {},
        activeMode,
        lastDatasetIndex,
        resizeTimeout = 0,
        // define providers
        providers = {
            decarta: {
                title: 'deCarta',
                instance: new TILE5.Geo.Decarta.MapProvider()
            },
        
            cloudmade: {
                title: 'Cloudmade',
                instance: new TILE5.Geo.Cloudmade.MapProvider({ apikey: "7960daaf55f84bfdb166014d0b9f8d41" })
            },
            
            bing: {
                title: 'Bing',
                instance: new TILE5.Geo.Bing.MapProvider({apikey: "AgZHtHdj6xF41EcwYw2Yo0y1kDICGOLJ2ATmDGMFTUX-lSBqssPHcx50lx65oOly"})
            }
        },
        // define interfaces
        interfaces = {
            desktop: {
                layout: "desktop",
                init: function() {
                    var mainContent = $("#demo-main");
                    mainContent.height($(window).height() - mainContent.offset().top - $("footer").outerHeight());
                    
                    $("h1").html("Tile5 Desktop / iPad Demo Interface");
                }
            },
            
            mobile: {
                layout: "mobile",
                init: function() {
                    
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
       
    function getActiveProvider() {
        return providers[activeProvider].instance;
    } // getActiveProvider
        
    function buildInterface(interfaceId, callback) {
        var iface = interfaces[interfaceId];
        
        if (iface) {
            $.ajax({
                url: "/media/console/interfaces/" + iface.layout + ".html?ticks=" + new Date().getTime(),
                success: function(data) {
                    $("#console").html(data);
                    
                    // initialise the layout
                    iface.init();

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
        var modeElement = $("#" + activeMode).get(0),
            modeWindowWidth = $(window).width() - $("#sidebar").outerWidth() - 1,
            modeWindowHeight = $("#demo-main").height()  - $("#modes li").outerHeight() - 1;
        
        if (modeElement && (modeElement.tagName.toUpperCase() == "CANVAS")) {
            $(modeElement).attr("width", modeWindowWidth).attr("height", modeWindowHeight);
            
            if (map) {
                map.repaint();
                GRUNT.WaterCooler.say("view.wake", { id: "" });
            } // if
        } // if
        else if (modeElement) {
            $(modeElement).css("width", modeWindowWidth).css("height", modeWindowHeight);
        } // if..else
    } // sizePageElements
    
    function changeMode(modeId) {
        activeMode = modeId;
        $("#modes li").removeClass("active");
        $("#mode_" + modeId).addClass("active");

        $(".mode").hide();

        sizePageElements();
        
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
    
    function changeProvider(providerId) {
        if (providerId != activeProvider) {
            activeProvider = providerId;

            $("#providers li").removeClass("active");

            if (providers[providerId]) {
                activeSample = null;
                var mainContent = $("#demo-main");

                updateCapabilityStatus(providerId);
                $("#provider_" + providerId).addClass("active");

                if (map) {
                    map.cleanup();
                } // if

                // update the map
                map = new TILE5.Geo.UI.Tiler({
                    container: "mapCanvas",
                    autoSize: false,
                    crosshair: false,
                    provider: getActiveProvider()
                });
                
                loadSamples();
                runCodeSample(map, "0");
                // map.gotoPosition(TILE5.Geo.P.parse("-27.468 153.028"), 10);
            } // if
        }
    } // changeProvider
    
    function updateCapabilityStatus(providerId) {
        $("#caps .capability").each(function() {
            var engine = null;
            try {
                engine = TILE5.Geo.getEngine(this.id, providerId);
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
        });
        
        selectDataset(1);
    } // loadDatasets
    
    function selectDataset(index) {
        activeDataset = CONSOLE.Datasets[index ? index : 0];
        
        $("#datasets li").removeClass("active");
        $("#dataset_" + (index ? index : 0)).addClass("active");
        
        if (map && (index !== lastDatasetIndex)) {
            runCodeSample(map, activeSample);
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
                codeString = codeString.replace(matches[0], "TILE5.Geo.P.parse(\"" + posData.latlng + "\") /* " + posData.title + " */");
            } // if
            
            matches = /CONSOLE\.getPosition\((\d)+\)/.exec(codeString);
        } // while
        
        $("#code-content").remove();
        $("#code-marker").after("<pre id='code-content' class='brush: js; toolbar: false;'>" + codeString + "</pre>");
        
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
                return TILE5.Geo.P.parse(posData.latlng);
            } // if
            
            return null;
        }
    };
    
    $(document).ready(function() {
        if (Modernizr.canvas) {
            buildInterface(screen.width > 480 ? "desktop" : "mobile", function() {
                // now do the work on activating the interface
                displayProviders();
            
                // set the initial provider to decarta
                loadDatasets();
                changeMode("mapCanvas");
                changeProvider("decarta");
            
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
        TILE5.Resources.loadImage("/media/img/pins/pin-158935-1-24.png");
        TILE5.Resources.loadImage("/media/img/pins/pin-158935-1-noshadow-24.png");
    });
    
    /*
    NOTE: these details are the account details for me (Damon Oehlman) on the decarta devzone.
    For your own API key, simply register at http://devzone.decarta.com/
    */
    TILE5.Geo.Decarta.applyConfig({
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