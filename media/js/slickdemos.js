TILE5DEMOS = (function() {
    // define some constants
    var DEMO_TARGET_ELEMENT = "demotarget";
    
    // define variables
    var demosAvailable = Modernizr.canvas,
        moduleCategories = {},
        activeModuleId = null,
        map = null,
        indicatorImage,
        indicatorOffset,
        demoPositions = {
            decarta: TILE5.Geo.P.parse("37.337647 -121.889749"),
            google: TILE5.Geo.P.parse("37.423327 -122.0864"),
            jfk: TILE5.Geo.P.parse("40.644699 -73.782806"),
            empirestate: TILE5.Geo.P.parse("40.752784 -73.985624"),
            sanjose: TILE5.Geo.P.parse("37.339167 -121.894722"),
            newyork: TILE5.Geo.P.parse("40.714167 -74.005833"),
            miami: TILE5.Geo.P.parse("25.774167 -80.193611")
        };
        
    function findModule(moduleId) {
        for (var catId in moduleCategories) {
            for (var ii = 0; ii < moduleCategories[catId].length; ii++) {
                if (moduleCategories[catId][ii].id == moduleId) {
                    return moduleCategories[catId][ii];
                } // if
            } // for
        } // for
        
        return null;
    } // findModule
    
    function runModule(moduleId) {
        if (moduleId != activeModuleId) {
            var module = findModule(moduleId);
            // showSplash();
            if (module && module.run) {
                $("#updates").html("");
                module.run();
                activeModuleId = moduleId;
            } // if
        } // if
    } // runModule
    
    function hideSplash() {
        $("#splash").fadeOut("fast", function() {
            $("#" + DEMO_TARGET_ELEMENT).fadeIn();
        });
    } // hideSplash
    
    function showSplash() {
        $("#" + DEMO_TARGET_ELEMENT).fadeOut("fast", function() {
            $("#splash").fadeIn();
        });
    }
    
    function initMap(callback, provider) {
        if ((! map) || provider) {
            if (map) {
                map.cleanup();
            } // if
            
            // create the map with the updated provider
            map = new TILE5.Mapping.Tiler({
                container: DEMO_TARGET_ELEMENT,
                crosshair: false,
                provider: provider ? provider : new TILE5.Geo.Decarta.MapProvider(),
                
                tapHandler: dropPin
            });

            map.gotoPosition(demoPositions.empirestate, 2);
        } // if
    } // initMap
    
    function dropPin(absXY, relXY, tapPos, tapBounds) {
        map.annotations.clear();
        
        var annotation = new TILE5.Mapping.ImageAnnotation({
            imageUrl: "/media/img/pins/pin-158935-1-24.png",
            animatedImageUrl: "/media/img/pins/pin-158935-1-noshadow-24.png",
            imageAnchor: new TILE5.Vector(8, 24),
            tweenIn: TILE5.Animation.Easing.Sine.Out,
            animationSpeed: 300,
            pos: tapPos
        });
        
        map.annotations.add(annotation);
    } // dropPin
    
    var module = {
        register: function(category, title, activator, description) {
            if (! moduleCategories[category]) {
                moduleCategories[category] = [];
            } // if
            
            moduleCategories[category].push({
                id: GRUNT.generateObjectID("module"),
                title: title,
                description: description ? description : "",
                run: activator
            });
        },
        
        createLinks: function() {
            $("ul.demos").each(function() {
                // get the modules for the category matching the element id
                var modules = moduleCategories[this.id];
                if (modules) {
                    for (var ii = 0; ii < modules.length; ii++) {
                        $(this).append("<li><a id='" + modules[ii].id + "' href='#'>" + modules[ii].title + "</a></li>");
                    } // for
                } // if
            });
            
            $("ul.demos a").click(function() {
                runModule(this.id);
            });
        },
        
        createButton: function(title, action) {
            // initialise the button id
            var id = GRUNT.generateObjectID("button");
            $("#updates").append("<a class='demo-action' href='#' id='" + id + "'>" + title +"</a><br />");
            $("#" + id).click(action);
        }
    };
    
	// load the arrow image
	TILE5.Resources.loadImage("/media/img/car.png", function(image) {
		indicatorImage = image;
		
		// calculate the arrow offset
		indicatorOffset = new TILE5.Vector(indicatorImage.width * 0.5, indicatorImage.height * 0.5);
	});
    
    // register the core demos
    module.register("mapping", "Display Map (deCarta)", function() {
        initMap(null, new TILE5.Geo.Decarta.MapProvider());
        
        map.gotoPosition(demoPositions.empirestate, 14, function() {
            hideSplash();
            
            $("#updates").html("Click / tap on the map to drop a test annotation.");
        });
    });
    
    /*
    // register the core demos
    module.register("mapping", "Display Map (Cloudmade)", function() {
        initMap(null, new TILE5.Geo.Cloudmade.MapProvider({ apikey: "7960daaf55f84bfdb166014d0b9f8d41" }));
        
        map.gotoPosition(demoPositions.empirestate, 14, function() {
            hideSplash();
        });
    });
    */
    
    module.register("mapping", "Sample Route", function() {
        initMap();
        
        $("a.demo-action").remove();
        
        TILE5.Geo.Routing.calculate({
            waypoints: [
                demoPositions.google, 
                demoPositions.decarta 
            ],
            map: map,
            success: function() {
                hideSplash();
                module.createButton("Animate", function() {
                    map.animateRoute();
                });
                
                module.createButton("Animate (Auto-Center)", function() {
                    map.animateRoute(TILE5.Animation.Easing.Sine.Out, 5000, null, true);
                });

                module.createButton("Animate (Bouncy)", function() {
                    map.animateRoute(TILE5.Animation.Easing.Bounce.Out, 5000);
                });
                
                module.createButton("Animate (Image)", function() {
                    map.animateRoute(TILE5.Animation.Easing.Sine.InOut, 5000, function(context, offset, indicatorXY, theta) {
                        if (indicatorImage) {
                            context.save();
                            try {
                                context.translate(indicatorXY.x, indicatorXY.y);
                                context.rotate(theta);
                                context.drawImage(indicatorImage, -indicatorOffset.x, -indicatorOffset.y);
                            }
                            finally {
                                context.restore();
                            } // try..finally
                        } // if
                    });
                });
            }
        });
        
    });
    
    $(document).ready(function() {
        module.createLinks();
        if (! demosAvailable) {
            $("#updates").html(
                "Sorry - your browser isn't cool enough to run the HTML5 canvas." +
                "Slick isn't going to work. You need something like Chrome, Firefox, Safari," + 
                "Opera, or a cool mobile webkit-based browser."
            );
        } // if
    });
    
    return module;
})();