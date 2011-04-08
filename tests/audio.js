AUDIOTEST = (function() {
    
    var canvas,
        context,
        frameBufferSize = 4096,
        bufferSize = frameBufferSize >> 1,
        peakBuckets = 256,
        sampleInterval = (bufferSize / 2) / peakBuckets,
        signal = new Float32Array(peakBuckets),
        equalizers = new Float32Array(peakBuckets),
        peak = new Float32Array(peakBuckets),
        shapeBuckets = [],
        colorBuckets = [],
        countryStats = {},
        countryStatsBuckets = {},
        startOffset = 0,
        fft,
        map;
        
    /* internals */
    
    function handleAudio(evt) {
        // deinterleave and mix down to mono
        signal = DSP.getChannel(DSP.MIX, evt.frameBuffer);

        // perform forward transform
        fft.forward(signal);
        
        // calculate peak values
        for (var ii = 0; ii < peakBuckets; ii++) {
            var specValue = (fft.spectrum[ii * sampleInterval] *= equalizers[ii]); // equalize, attenuates low freqs and boosts highs
                
            // calculate the peak value
            if (peak[ii] < specValue) {
                // update the peak
                peak[ii] = specValue;
                // COG.info('new peak in bucket ' + ii + ' = ' + specValue);
            }
            // otherwise decrement the peak
            else {
                peak[ii] *= 0.99;
            } // if..else
        } // for
        
        paintSpectrum();
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
        for (ii = equalizers.length; ii--; ) {
            //equalizers[ii] = Math.log((ii + 0.1) * sampleInterval) * bufferSize;
            equalizers[ii] = -1 * Math.log((fft.bufferSize/2 - ii * sampleInterval) * (0.5/fft.bufferSize/2)) * fft.bufferSize;
        } // for
        
        // apply very rudimentary compression some of the base equalizers
        for (ii = 6; ii--; ) {
            equalizers[ii] /= 10;
        } // for
        
        // initialise the peak values
        for (ii = peakBuckets; ii--; ) {
            peak[ii] = 0;
        } // for
        
        // initialise the color buckets
        for (ii = peakBuckets; ii--; ) {
            colorBuckets[ii] = 'hsl(' + (ii/peakBuckets * 360 | 0) + ', 100%, 50%)';
        } // for
        
        // initialise the canvas size
        canvas = $('#spectrum')[0];
        canvas.width = peakBuckets;
        
        // get the context
        context = canvas.getContext('2d');
        
        // load the current track
        $('#track')
            .bind('loadedmetadata', handleLoadedMetadata)
            .attr('src', '/audio/eedl_slumber.ogg');
    } // init
    
    function paintSpectrum() {
        var specHeight = canvas.height,
            barWidth = canvas.width / peakBuckets | 0,
            barX,
            magnitude;
            
        COG.info('painting spectrum');
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        for (var ii = peakBuckets; ii--; ) {
            magnitude = fft.spectrum[ii * sampleInterval] | 0;
            
            barX = ii * barWidth;
            
            // COG.info('fill style = ' + colorBuckets[ii] + ', barX = ' + barX + ', width = ' + barWidth);
            context.fillStyle = colorBuckets[ii];
            context.fillRect(barX, specHeight - magnitude, barWidth, magnitude);
            
            context.beginPath();
            context.arc(barX + (barWidth >> 1), specHeight - peak[ii], 1, 0, Math.PI * 2, false);
            context.fill();
        } // for
    }
    
    $(document).ready(init);
    
    return {
        getContext: function() {
            return context;
        }
    };
})();