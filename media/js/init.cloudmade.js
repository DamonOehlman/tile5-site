/*
NOTE: The API key used for cloudmade here is for the development use of Damon Oehlman
For your own API key, simply register at http://developers.cloudmade.com/
*/
$(document).ready(function() {
    TILE5DEMO.sizeCanvas();
    
    var map = new TILE5.Geo.UI.Tiler({
        container: "mapCanvas",
        autoSize: false,
        provider: new TILE5.Geo.Cloudmade.MapProvider({ apikey: "7960daaf55f84bfdb166014d0b9f8d41" })
    });
    
    map.gotoPosition(TILE5.Geo.P.parse("40.752784 -73.985624"), 10);
});