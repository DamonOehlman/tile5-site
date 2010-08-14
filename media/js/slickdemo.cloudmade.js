// initialise global variables
var map = null;

SLICK.Tiling.Config.TILESIZE = 256;
SLICK.Tiling.Config.TILEBUFFER = 1;

// when the document is loaded, then load the map
jQuery(document).ready(function() {
    // set the tiler height and width
    $("#tiler").attr("height", $(window).height()).attr("width", $(window).width());

    // create the application 
    map = new SLICK.MappingTiler({
        container: "tiler",
        provider: new SLICK.Geo.Cloudmade.MapProvider({
            apikey: "7960daaf55f84bfdb166014d0b9f8d41"
        }),
        panHandler: function(x, y) {
            // update the app with the current map bounds
        }
    });

    map.gotoPosition(new SLICK.Geo.Position("-27.468 153.028"), 10);
    GRUNT.Log.info("MAP initialised");
    
    // make the mode window untouchable
    // TODO: make the jquery extension do this automatically
    $(".untouchable").untouchable();
}); // load