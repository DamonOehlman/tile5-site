// initialise the decarta options
if (TILE5.Geo.Decarta) {
    TILE5.Geo.Decarta.applyConfig({
        server: "http://ws.decarta.com/openls",
        clientName: "racq-do",
        clientPassword: "mz5ff3",
        configuration: "old-english-tile", 
        geocoding: {
            countryCode: "US",
            language: "EN"
        }
    });
} // if