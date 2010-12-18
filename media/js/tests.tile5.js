COG.Testing = (function() {
    // initialise variables
    var testSuites = {};
    
    var module = COG.newModule({
        id: "grunt.test",
        requires: ["grunt.core"],
        
        STATUS: {
            notrun: 0,
            running: 1,
            waiting: 2,
            readyToContinue: 4,
            abort: 8
        },
        
        /* reporting functions */
        
        reportProgress: function(message) {
            COG.Log.info("TEST FRAMEWORK: " + message);
        },
        
        reportException: function(error) {
            COG.Log.exception(error);
        },
        
        /* Test Definition */
        
        Test: function(params) {
            params = COG.extend({
                title: "Untitled Test",
                autoReady: true,
                runner: null
            }, params);
            
            // define self
            var self = {
                status: module.STATUS.notrun,
                
                run: function(testData) {
                    if (params.runner) {
                        self.status = module.STATUS.running;
                        try {
                            module.reportProgress("Running test " + params.title);
                            params.runner(self, testData);
                        }
                        catch (e) {
                            module.reportException(e);
                        }
                        finally {
                            if (self.status == module.STATUS.running) {
                                self.status = module.STATUS.waiting;
                            } // if
                        } // try..finally
                    } // if
                    
                    // if the test style is 
                    if (params.autoReady) {
                        self.ready();
                    } // if
                },
                
                ready: function() {
                    self.status = module.STATUS.readyToContinue;
                }
            };
            
            return self;
        },
        
        
        /* test suite */
        
        registerSuite: function(id, suite) {
            if (id) {
                testSuites[id] = suite;
            } // if
        },
        
        runSuite: function(id) {
            if (id && testSuites[id]) {
                testSuites[id].run();
            } // if
        },
        
        eachSuite: function(callback) {
            for (var suiteId in testSuites) {
                callback(testSuites[suiteId]);
            } // for
        },
        
        Suite: function(params) {
            params = COG.extend({
                id: "untitled.suite",
                description: "",
                tests: [],
                testData: {},
                setup: null,
                teardown: null
            }, params);
            
            var testQueue = [];
            var activeTest = null;
            var runInterval = 0;
            
            // define self
            var self = {
                /**
                The queue function is used to queue a new test for execution in the current test module.
                */
                add: function(test) {
                    testQueue.push(test);
                },

                run: function() {
                    // if we have an active test, then returm
                    if (activeTest) {
                        throw new Error("Test Suite already running");
                    } // if
                    
                    // if we have a setup method, then set it up
                    if (params.setup) {
                        params.setup();
                    } // if
                    
                    var ii = 0;
                    
                    // start the run loop
                    runInterval = setInterval(function() {
                        // while we have tests to complete, run
                        if (ii < testQueue.length) {
                            // update the active test
                            activeTest = testQueue[ii];

                            // skip null tests (just in case)
                            if (! activeTest) {
                                ii++;
                            }
                            // execute the test
                            else {
                                if (activeTest.status == module.STATUS.notrun) {
                                    activeTest.run(params.testData);
                                } // if
                                
                                // if the current test is ready to continue, the increment the index
                                if (activeTest.status == module.STATUS.readyToContinue) {
                                    ii++;
                                } // if
                            } // if..else
                        }
                        else {
                            self.stop();
                        } // if..else
                    }, 200);
                },
                
                stop: function() {
                    if (activeTest) {
                        // clear the interval
                        clearInterval(runInterval);
                        
                        // if we have a teardown task
                        if (params.teardown) {
                            params.teardown();
                        } // if
                    } // if
                }
            }; // self
            
            // iterate through the tests defined in the parameters, and add them
            for (var ii = 0; ii < params.tests.length; ii++) {
                self.add(new module.Test(params.tests[ii]));
            } // for
            
            // register the test suite
            module.registerSuite(params.id, self);
            
            return self;
        }
    });
    
    return module;
})();(function() {
    var TEST_X = 5, TEST_Y = 6,
        TEST_VECTOR = new SLICK.Vector(TEST_X, TEST_Y);
    
    new GRUNT.Testing.Suite({
        id: "slick.vector",
        title: "Suite of tests to check vector operations in SlICK",
        
        tests: [
        
        // create vector
        {
            title: "Create Vector",
            runner: function(test, testData) {
                var testVector = new SLICK.Vector(TEST_X, TEST_Y);
                if ((testVector.x !== TEST_X) || (testVector.y !== TEST_Y)) {
                    throw new Error("Vector initialization failed");
                } // if
            }
        },
        
        // create empty vector
        {
            title: "Create Empty Vector",
            runner: function(test, testData) {
                var testVector = new SLICK.Vector();
                if ((testVector.x !== 0) || (testVector.y !== 0)) {
                    throw new Error("Empty Vector initialization failed");
                } // if
            }
        },
        
        // offset vector test
        {
            title: "Offset Vector",
            runner: function(test, testData) {
                var testVector = new SLICK.Vector();
                testVector = SLICK.V.offset(testVector, TEST_X, TEST_Y);
                
                if ((testVector.x !== TEST_X) || (testVector.y !== TEST_Y)) {
                    throw new Error("Offsetting vector failed");
                } // if
            }
        },
        
        // vector size tests
        {
            title: "Get Vector Size (Positive Values)",
            runner: function(test) {
                var size = SLICK.V.absSize(TEST_VECTOR);
                if (size !== Math.max(TEST_X, TEST_Y)) {
                    throw new Error("Error finding correct vector size");
                } // if
            }
        },
        {
            title: "Get Vector Size (Negative Values)",
            runner: function(test) {
                var testVector = new SLICK.Vector(-TEST_X, -TEST_Y),
                    size = SLICK.V.absSize(testVector);
                    
                if (size !== Math.max(TEST_X, TEST_Y)) {
                    throw new Error("Error finding correct vector size with negative values");
                }
            }
        }
        ]
    });
})();

(function() {
    var TESTPOS_1_LAT = -27.468, 
        TESTPOS_1_LON = 153.028,
        TESTPOS_1 = TESTPOS_1_LAT + " " + TESTPOS_1_LON;
    
    new GRUNT.Testing.Suite({
        id: "slick.geo",
        title: "Suite of tests to Geo operations in SLICK",
        testData: {},
        
        tests: [
        {
            title: "Parse Position",
            runner: function(test, testData) {
                testData.pos1 = SLICK.Geo.P.parse(TESTPOS_1);
                
                if ((testData.pos1.lat !== TESTPOS_1_LAT) || (testData.pos1.lon !== TESTPOS_1_LON)) {
                    throw new Error("Parsed Position not equal to raw values");
                } // if
            }
        },
        
        {
            title: "Position String Conversion",
            runner: function(test, testData) {
                var testStr = SLICK.Geo.P.toString(testData.pos1);
                if (testStr != TESTPOS_1) {
                    throw new Error("String output does not equal original input");
                } // if
            }
        },
        
        {
            title: "Position String Conversion (null value)",
            runner: function(test, testData) {
                var testStr = SLICK.Geo.P.toString();
                if (testStr != "") {
                    throw new Error("String conversion for empty pos not valid");
                }
            }
        },
        
        {
            title: "Parse Created Position",
            runner: function(test, testData) {
                var testPos = SLICK.Geo.P.parse(testData.pos1);
                
                if ((! testPos) || (testPos.lat !== TESTPOS_1_LAT) || (testPos.lon !== TESTPOS_1_LON)) {
                    throw new Error("Parse existing position failed, testPos (" + SLICK.Geo.P.toString(testPos) + ") != source (" + SLICK.Geo.P.toString(testData.pos1) + ")");
                }
            }
        },
        
        /* bounding box tests */
        
        {
            title: "Create Bounding Box from Existing Positions",
            runner: function(test, testData) {
                var testBounds = new SLICK.Geo.BoundingBox(testData.pos1, testData.pos1);
                
                if ((! testBounds) || (! testBounds.min) || (! testBounds.max)) {
                    throw new Error("Bounding box creation failed");
                }
                
                if ((testBounds.min.lat !== testData.pos1.lat) || (testBounds.min.lon !== testData.pos1.lon)) {
                    throw new Error("Bounding box min invalid value");
                } // if
                
                if ((testBounds.max.lat !== testData.pos1.lat) || (testBounds.max.lon !== testData.pos1.lon)) {
                    throw new Error("Bounding box max invalid value");
                } // if
            }
        }
        ]
    });
})();

(function() {
    var mappingTestData = {
        zoomLevel: 7,
        positions: {
            rocky: new SLICK.Geo.Position("-23.391737 150.503082"),
            goldcoast: new SLICK.Geo.Position("-28.032099 153.434587"),
            brisbane: new SLICK.Geo.Position("-27.4688793718815 153.02282050252"),
            sydney: new SLICK.Geo.Position("-33.8696305453777 151.206959635019"),
            mudgee: new SLICK.Geo.Position("-32.5993604958057 149.587680548429"),
            toowoomba: new SLICK.Geo.Position("-27.5614504516125 151.953289657831")
        },
        addresses: [
            "2649 LOGAN ROAD, EIGHT MILE PLAINS, QLD",
            "49 ROSE LANE, GORDON PARK, QLD", 
            "BRISBANE AIRPORT",
            "BRISBANE INTERNATIONAL AIRPORT",
            "HOLLAND PARK", 
            "BOTANIC GARDENS",
            "CENTRAL STATION, BRISBANE", 
            "QUEENS PARK",
            "DIDDILLIBAH", 
            "ROCKHAMPTON",
            "NORMANTON, QLD",
            "MT WARREN PARK",
            "BALD HILLS",
            "CROWS NEST",
            "MANSFIELD, QLD",
            "BELMONT, QLD",
            "PERTH, QLD",
            "PERTH",
            "BIRDSVILLE",
            "VICTORIA POINT",
            "132 BUCKINGHAMIA PLACE, STRETTON, QLD",
            "MT TAMBORINE",
            "SUNRISE BEACH",
            "HYATT REGENCY COOLUM BEACH",
            "BELLBIRD PARK"
        ]
    };
    
    function geocodeTestAddresses(engine, addressIndex, listCompleteCallback) {
        if ((addressIndex >= 0) && (addressIndex < mappingTestData.addresses.length)) {
            engine.geocode({
                addresses: mappingTestData.addresses[addressIndex], 
                complete: function(requestAddress, possibleMatches) {
                    GRUNT.Log.info("REQUESTED ADDRESS: " + requestAddress);
                    GRUNT.Log.info("got address matches: ", possibleMatches);
                    
                    geocodeTestAddresses(engine, addressIndex + 1, listCompleteCallback);
                }
            });
        }
        else if (listCompleteCallback) {
            listCompleteCallback();
        } // if..else
    }
    
    new GRUNT.Testing.Suite({
        id: "slick.mapping",
        title: "Suite of tests to test mapping in SLICK",
        testData: mappingTestData,
        
        tests: [{
            title: "Display Map",
            autoReady: false,
            runner: function(test, testData) {
                map.gotoPosition(testData.positions.goldcoast, testData.zoomLevel, function() {
                    test.ready();
                });
            }
        }]
    });
    
    new GRUNT.Testing.Suite({
        id: "slick.mapping.routing",
        title: "SLICK Mapping > Route Tests",
        testData: mappingTestData,
        
        tests: [{
            title: "Route from Brisbane to Sydney",
            autoReady: false,
            runner: function(test, testData) {
                GRUNT.Log.info("requesting the route from brisbane to sydney");
                
                // calculate the route between brisbane and sydney
                SLICK.Geo.Routing.calculate({
                    waypoints: [
                        testData.positions.brisbane, 
                        testData.positions.toowoomba, 
                        testData.positions.mudgee,
                        testData.positions.sydney
                    ],
                    map: map
                });
                
                // set the route overlay
                // map.setRoute();
                
                test.ready();
            }
        }]
    });
    
    new GRUNT.Testing.Suite({
        id: "slick.mapping.geocoding",
        title: "SLICK Mapping > Geocoding Tests",
        testData: mappingTestData,
        
        tests: [{
            title: "Geocoding Test",
            autoReady: false,
            runner: function(test, testData) {
                // get a mapping engine for geocoding
                var engine = SLICK.Geo.getEngine("geocode");
                
                if (! engine) {
                    throw new Error("No geocoding capable GEO.Engine found");
                } // if

                geocodeTestAddresses(engine, 0, function() {
                    GRUNT.Log.info("geocoding test complete");
                    test.ready();
                });
            }
        }]
    });
})();
(function() {
    var MINZOOM = 2;
    var MAXZOOM = 19;
    
    function createZoomTest(zoomLevel) {
        testSuite.add(new GRUNT.Testing.Test({
            description: "Test Zoom Level " + zoomLevel,
            runner: function(test, testData) {
                map.gotoPosition(testData.positions.rocky, zoomLevel, function() {
                    test.ready();
                });
            }
        }));
    } // createZoomLevel
    
    var testSuite = new GRUNT.Testing.Suite({
        id: "slick.mapping.cloudmade",
        description: "Suite of tests to test cloudmade mapping in SLICK",
        setup: function() {
        },
        
        teardown: function() {
            
        },
        
        testData: {
            zoomLevel: 7,
            positions: {
                brisbane: new SLICK.Geo.Position("-27.469321 153.02489"),
                rocky: new SLICK.Geo.Position("-23.391737 150.503082"),
                goldcoast: new SLICK.Geo.Position("-28.032099 153.434587")
            }
        },
        
        tests: [{
            title: "Display Map",
            runner: function(test, testData) {
                map.gotoPosition(testData.positions.brisbane, testData.zoomLevel, function() {
                    test.ready();
                });
            }
        }, {
            title: "Add Some Pins",
            runner: function(test, testData) {
                GRUNT.Log.info("adding some pins");
                
                // pin the gold coast
                map.addPOI(new SLICK.Geo.PointOfInterest({
                    id: 1,
                    title: "Brisbane City",
                    pos: testData.positions.brisbane,
                    type: "accommodation"
                }));
                
                test.ready();
            }
        }]
    });
    
    /*
    // add the zoom tests to the test suite
    for (var zoomLevel = MINZOOM; zoomLevel <= MAXZOOM; zoomLevel++) {
        createZoomTest(zoomLevel);
    } // for
    */
})();


