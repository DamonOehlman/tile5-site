DEMO.Sample = (function() {
    
    var frameBufferSize = 4096,
        bufferSize = frameBufferSize >> 1,
        peakBuckets = 256,
        sampleInterval = (bufferSize / 2) / peakBuckets,
        signal = new Float32Array(peakBuckets),
        attenuators = new Float32Array(bufferSize / 2),
        peak = new Float32Array(peakBuckets),
        shapeBuckets = [],
        countryStats = {},
        countryStatsBuckets = {},
        fft,
        map;
        
    /* internals */
    
    function assignCountries() {
        // get the world layer
        var worldLayer = map.getLayer('world'),
            countryShapes = worldLayer.find(),
            ii;
    
        // reset the shape buckets
        for (ii = peakBuckets; ii--; ) {
            shapeBuckets[ii] = [];
        } // for
            
        // iterate through the countries and assign to buckets
        for (ii = countryShapes.length; ii--; ) {
            var countryData = countryShapes[ii].properties,
                bucketIndex = countryStatsBuckets[countryData.name];
                
            // if the bucket index is defined
            if (typeof bucketIndex !== 'undefined') {
                shapeBuckets[bucketIndex].push(countryShapes[ii]);
                countryShapes[ii].style = 'bucket_' + bucketIndex;
            }
            else {
                countryShapes[ii].style = null;
            } // if..else
        } // for
        
        // invalidate the map
        map.invalidate();
    } // assignCountries
    
    function handleAudio(evt) {
        // deinterleave and mix down to mono
        signal = DSP.getChannel(DSP.MIX, evt.frameBuffer);

        // perform forward transform
        fft.forward(signal);
        
        // calculate peak values
        for (var ii = 0; ii < peakBuckets; ii++) {
            var attenuation = -1 * Math.log((fft.bufferSize/2 - ii * sampleInterval) * (0.5/fft.bufferSize/2)) * fft.bufferSize,
                specValue = (fft.spectrum[ii * sampleInterval] * attenuation); // attenuators[ii * sampleInterval]); // equalize, attenuates low freqs and boosts highs
                
            COG.info('attentuation = ' + attuentation + ', spec value = ' + specValue);
            
            // calculate the peak value
            if ((! peak[ii]) || peak[ii] < specValue) {
                // update the peak
                peak[ii] = specValue;
                
                // animate the countries in that group
                for (var shapeIndex = shapeBuckets[ii].length; ii--; ) {
                    var shape = shapeBuckets[ii][shapeIndex];
                    if (shape) {
                        shape.animate('scale', [0.7], [1]);
                    } // if
                } // for
            }
            // otherwise decrement the peak
            else {
                peak[ii] *= 0.99;
            } // if..else
        } // for
        

        /*
        // calculate peak values
        for ( var i = 0; i < bufferSize; i++ ) {
          fft.spectrum[i] *= -1 * Math.log((fft.bufferSize/2 - i) * (0.5/fft.bufferSize/2)) * fft.bufferSize; // equalize, attenuates low freqs and boosts highs

          if ( peak[i] < fft.spectrum[i] ) {
            peak[i] = fft.spectrum[i];
          } else {
            peak[i] *= 0.99; // peak slowly falls until a new peak is found
          }
        }        
        */
        
        // COG.info('processed some audio');
    } // handleAudio
    
    function handleLoadedMetadata(evt) {
        COG.info('loaded metadata');
        evt.target.mozFrameBufferLength = frameBufferSize;
        evt.target.addEventListener('MozAudioAvailable', handleAudio, false);
    } // handleLoadedMetadata
    
    function init() {
        var ii;
        
        fft = new FFT(bufferSize, 44100);
        
        // initialise the attentuators
        for (ii = attenuators.length; ii--; ) {
            attenuators[ii] = -1 * Math.log((bufferSize/2 - ii) * (bufferSize >> 2)) * bufferSize;
        } // for
        
        // initialise the peak values
        for (ii = peakBuckets; ii--; ) {
            peak[ii] = 0;
        } // for
        
        // load the current track
        $('#track')
            .bind('loadedmetadata', handleLoadedMetadata)
            .attr('src', '/audio/rock_the_insight.ogg');
    } // init
    
    function initStyles() {
        for (var ii = peakBuckets; ii--; ) {
            var hue = ii/peakBuckets * 360 | 0;
            
            T5.defineStyle('bucket_' + ii, {
                fill: 'hsla(' + hue + ', 50%, 50%, 1.0)'
            });
        } // for
    } // initStyles
    
    function loadFrequencyData() {
        DEMO.status('Loading Population Data');

        // load the population data
        $.ajax({
            url: '/js/data/population.json',
            dataType: 'json',
            success: processStats,
            error: function(raw, textStatus, errorThrown) {
                DEMO.status('Error loading population data: ' + textStatus, 1000);
            }
        });
    } // loadFrequencyData
    
    function processStats(data) {
        var minVal,
            maxVal,
            val,
            country,
            peakBucket;
            
        // update the country stats
        countryStats = data;
        
        // reset the frequency data
        countryStatsFreqs = {};
            
        // iterate through the data and 
        for (country in countryStats) {
            countryStats[country] = parseInt(countryStats[country].replace(/\,/g, ''), 10);
            val = Math.log(countryStats[country]);
            
            // calculate the min and max values
            minVal = minVal ? Math.min(val, minVal) : val;
            maxVal = maxVal ? Math.max(val, maxVal) : val;
        } // for
        
        // now store the frequency data
        for (country in countryStats) {
            val = Math.log(countryStats[country]);
            peakBucket = 256 - (val/maxVal * 256) | 0;
            
            countryStatsBuckets[country] = peakBucket;
        } // for
        
        init();
        initStyles();
        assignCountries();
        
        // hide the status window
        DEMO.status();
    } // processStats    
    
    /* exports */
    
    return {
        extraLibs: ['/js/libs/dsp.js'],
        generators: [],
        
        run: function(container, renderer, generatorType, generatorOpts) {
            // initialise the map
            map = new T5.Map({
                container: container,
                renderer: renderer
            });

            // set the map background to an oceanesque colour...
            $('#mapContainer').css('background', '#5f8dd3');

            // goto the specified position
            map.gotoPosition(T5.Geo.Position.init(20, 0), 2);

            DEMO.status('Loading World Data');

            // get the walmarts data
            $.ajax({
                url: '/js/data/world.json',
                dataType: 'json',
                success: function(data, textStatus, raw) {
                    DEMO.status('Parsing GeoJSON');

                    T5.GeoJSON.parse(data, function(layers) {
                        for (layerId in layers) {
                            map.setLayer('world', layers[layerId]);
                            break;
                        } // for
                        
                        loadFrequencyData();
                    });
                },
                error: function(raw, textStatus, errorThrown) {
                    DEMO.status('Error loading data', 1000);
                }
            });
            
            return map;            
        }
    };
})();