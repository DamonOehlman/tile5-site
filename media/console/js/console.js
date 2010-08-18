CONSOLE = (function() {
    var map, 
        activeProvider,
        activeSample,
        activeDataset,
        lastDatasetIndex,
        // define providers
        providers = {
            decarta: {
                title: 'deCarta',
                instance: new TILE5.Geo.Decarta.MapProvider()
            },
        
            cloudmade: {
                title: 'Cloudmade',
                instance: new TILE5.Geo.Cloudmade.MapProvider({ apikey: "7960daaf55f84bfdb166014d0b9f8d41" })
            }
        },
        // define interfaces
        interfaces = {
            desktop: {
                layout: "desktop",
                init: function() {
                    var mainContent = $("#demo-main"),
                        mapCanvas = $("#mapCanvas");
                    
                    mainContent.height($(window).height() - mainContent.offset().top - $("footer").outerHeight());
                }
            },
            
            mobile: {
                layout: "mobile",
                init: function() {
                    
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
                    $("#main").html(data);
                    
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
    
    function changeMode(modeId) {
        $("#modes li").removeClass("active");
        $("#mode_" + modeId).addClass("active");
        
        var modeElement = $("#" + modeId).get(0),
            modeWindowWidth = $(window).width() - $("#sidebar").outerWidth() - 1,
            modeWindowHeight = $("#demo-main").height()  - $("#modes li").outerHeight() - 1;
        
        $(".mode").hide();

        if (modeElement && (modeElement.tagName.toUpperCase() == "CANVAS")) {
            $(modeElement).attr("width", modeWindowWidth).attr("height", modeWindowHeight);
            
            $(modeElement).fadeIn("normal", function() {
                GRUNT.WaterCooler.say("view.wake", { id: "" });
            });
        } // if
        else if (modeElement) {
            $(modeElement).css("width", modeWindowWidth).css("height", modeWindowWidth).fadeIn();
        } // if..else
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
                var mainContent = $("#demo-main");

                $("#provider_" + providerId).addClass("active");

                if (map) {
                    map.cleanup();
                } // if

                // update the map
                map = new TILE5.Geo.UI.Tiler({
                    container: "mapCanvas",
                    autoSize: false,
                    provider: getActiveProvider()
                });
                
                runCodeSample(map, activeSample);
                // map.gotoPosition(TILE5.Geo.P.parse("-27.468 153.028"), 10);
            } // if
        }
    } // changeProvider
    
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
    
    function findSampleInstance(sampleId) {
        for (var ii = CONSOLE.Catalog.length; ii--; ) {
            if (CONSOLE.Catalog[ii].id == sampleId) {
                return CONSOLE.Catalog[ii];
            } // if
        } // for
        
        return null;
    } // findSampleInstance
    
    function runCodeSample(map, sampleId) {
        // update the active sample
        activeSample = sampleId;
        
        if (activeSample) {
            $("#sample_" + activeSample).addClass("active");
            
            var sample = findSampleInstance(activeSample);
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
            var sample = CONSOLE.Catalog[ii];
            
            listHtml += "<li id='sample_" + sample.id +"'><a href='#" + sample.id + "'>" + sample.title + "</a></li>";
        } // for
        
        $("#samples").html(listHtml).find("a").click(function() {
            runCodeSample(map, this.href.replace(/^.*\#(.*)$/, "$1"));
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
        buildInterface(screen.width > 480 ? "desktop" : "mobile", function() {
            // now do the work on activating the interface
            displayProviders();
            
            // if we have a sample catalog set the sample to the first sample
            if (CONSOLE.Catalog && (CONSOLE.Catalog.length > 0)) {
                activeSample = CONSOLE.Catalog[0].id;
            } // if
            
            // set the initial provider to decarta
            loadSamples();
            loadDatasets();
            changeMode("mapCanvas");
            changeProvider("cloudmade");
            
            // update mode listeners
            handleModeUpdates();
        });
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