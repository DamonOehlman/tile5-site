CONSOLE.Datasets = (function() {
    var datasets = [];
    
    datasets.push({
        id: "au",
        title: "Australia",
        positions: [
            { title: "Brisbane", latlng: "-27.468 153.028" },
            { title: "Sydney", latlng: "-33.870 151.208" }
        ]
    });
    
    datasets.push({
        id: "us-west",
        title: "US (West Coast)",
        positions: [
            { title: "deCarta HQ", latlng: "37.337647 -121.889749" },
            { title: "Googleplex", latlng: "37.423327 -122.0864" }
        ]
    });
    
    
    return datasets;
})();