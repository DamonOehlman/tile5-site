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

var map = null;
$(document).ready(function() {
    TILE5DEMO.sizeCanvas();
    
    var provider = new TILE5.Geo.Decarta.MapProvider();
    provider.setZoomRange(3, 17);
    
    map = new TILE5.Geo.UI.Tiler({
        container: "mapCanvas",
        autoSize: false,
        provider: provider
    });
    
    map.gotoPosition(TILE5.Geo.P.parse("-27.468 153.028"), 10);
});