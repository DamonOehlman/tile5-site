CONSOLE.Catalog = (function() {
    var catalog = [];
    
    catalog.push({
        id: "simplemap",
        title: "Simple Map",
        code: function(map) {
            map.gotoPosition(CONSOLE.getPosition(0), 10);
        }
    });
    
    return catalog;
})();