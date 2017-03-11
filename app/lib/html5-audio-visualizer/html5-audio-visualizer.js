/**
 * An audio spectrum visualizer built with HTML5 Audio API
 * Author:Wayou
 * License: MIT
 * Feb 15, 2014
 */
window.onload = function() {
    // new Visualizer().ini();
};
var Visualizer = function() {
    this.file = null; //the current file
    this.fileName = null; //the current file name
    this.audioContext = null;
    this.source = null; //the audio source
    this.info = document.getElementById('info').innerHTML; //used to upgrade the UI information
    this.infoUpdateId = null; //to store the setTimeout ID and clear the interval
    this.animationId = null;
    this.status = 0; //flag for sound is playing 1 or stopped 0
    this.forceStop = false;
    this.allCapsReachBottom = false;
};
Visualizer.prototype = {
    ini: function() {
        this._prepareAPI();
        this._addEventListner();
    },
    _prepareAPI: function() {
        //fix browser vender for AudioContext and requestAnimationFrame
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            this.audioContext = new AudioContext();
        } catch (e) {
            this._updateInfo('!Your browser does not support AudioContext', false);
            console.log(e);
        }
    },
    _addEventListner: function() {
        var that = this,
            audioInput = document.getElementById('uploadedFile'),
            dropContainer = document.getElementsByTagName("canvas")[0];
    },
    _start: function() {
        //read and decode the file into audio array buffer
        var that = this,
            file = this.file,
            fr = new FileReader();
        fr.onload = function(e) {
            var fileResult = e.target.result;
            var audioContext = that.audioContext;
            if (audioContext === null) {
                return;
            };
            that._updateInfo('Decoding the audio', true);
            audioContext.decodeAudioData(fileResult, function(buffer) {
                that._updateInfo('Decode succussfully,start the visualizer', true);
                that._visualize(audioContext, buffer);
            }, function(e) {
                that._updateInfo('!Fail to decode the file', false);
                console.error(e);
            });
        };
        fr.onerror = function(e) {
            that._updateInfo('!Fail to read the file', false);
            console.error(e);
        };
        //assign the file to the reader
        this._updateInfo('Starting read the file', true);
        fr.readAsArrayBuffer(file);
    },
    _visualize: function(audioContext, buffer) {
        var context = new AudioContext();
        var analyser = context.createAnalyser();
        var audio = document.getElementById('prismatic-audio')

        var source = context.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(context.destination);
        this.status = 1;
        //connect the source to the analyser
        // audioBufferSouceNode.connect(analyser);
        //connect the analyser to the destination(the speaker), or we won't hear the sound
        // analyser.connect(audioContext.destination);
        //then assign the buffer to the buffer source node
        // audioBufferSouceNode.buffer = buffer;
        //play the source
        // if (!audioBufferSouceNode.start) {
        //     audioBufferSouceNode.start = audioBufferSouceNode.noteOn //in old browsers use noteOn method
        //     audioBufferSouceNode.stop = audioBufferSouceNode.noteOff //in old browsers use noteOff method
        // };
        //stop the previous sound if any
        // if (this.animationId !== null) {
        //     cancelAnimationFrame(this.animationId);
        // }
        // if (this.source !== null) {
        //     this.source.stop(0);
        // }
        // audioBufferSouceNode.start(0);
        // this.status = 1;
        // this.source = audioBufferSouceNode;
        // audioBufferSouceNode.onended = function() {
        //     that._audioEnd(that);
        // };
        // this._updateInfo('Playing ' + this.fileName, false);
        // this.info = 'Playing ' + this.fileName;
        // document.getElementById('fileWrapper').style.opacity = 0.2;
        this._drawSpectrum(analyser);
    },
    _drawSpectrum: function(analyser) {

        var that = this,
            canvas = document.getElementById('canvas'),
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            newHeight = cheight,
            meterWidth = 5, //width of the meters in the spectrum
            gap = function() {
                return meterWidth / 5 + 1; //gap between meters  
            },
            capHeight = 2,
            capStyle = '#fff',
            meterNum = function() {
                return canvas.width / (meterWidth + 2); //count of the meters
            },
            capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
        ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, newHeight); //x , y , canvasWidth, canvasHeight
        // gradient.addColorStop(1, '#0f0');
        // gradient.addColorStop(0.5, '#ff0');
        // gradient.addColorStop(0, '#f00');
        // gradient.addColorStop(0, '#8ED6FF');
        // // dark blue
        // gradient.addColorStop(1, '#004CB3');
        gradient.addColorStop(0, '#ca72ff');
        // dark blue
        gradient.addColorStop(1, '#8440ad');;;
        var drawMeter = function() {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            if (that.status === 0) {
                //fix when some sounds end the value still not back to zero
                for (var i = array.length - 1; i >= 0; i--) {
                    array[i] = 0;
                };
                allCapsReachBottom = true;
                for (var i = capYPositionArray.length - 1; i >= 0; i--) {
                    allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
                };
                if (allCapsReachBottom) {
                    cancelAnimationFrame(that.animationId); //since the sound is stoped and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
                    return;
                };
            };
            var step = Math.round(array.length / meterNum()); //sample limited data from the total array
            ctx.clearRect(0, 0, cwidth, newHeight);
            for (var i = 0; i < meterNum(); i++) {
                var value = array[i * step];
                if (capYPositionArray.length < Math.round(meterNum())) {
                    capYPositionArray.push(value);
                };
                // ctx.fillStyle = capStyle;
                // // draw the cap, with transition effect
                // if (value < capYPositionArray[i]) {
                //     ctx.fillRect(i * 12, newHeight - (--capYPositionArray[i]), meterWidth, capHeight);
                // } else {
                //     ctx.fillRect(i * 12, newHeight - value, meterWidth, capHeight);
                //     capYPositionArray[i] = value;
                // };
                ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look

                // var barHeight = newHeight - value + capHeight;
                // var canvasBarHeightDifference = canvas.height - barHeight;

                // barHeight = canvasBarHeightDifference > 0 ? barHeight - canvasBarHeightDifference : barHeight;

                var barHeightPercentage = (value / 255.00);
                var barHeight = barHeightPercentage * newHeight;

                ctx.fillRect(i * (meterWidth + gap()), newHeight - barHeight, meterWidth, newHeight); //the meter (x, y, width, height)
            }
            that.animationId = requestAnimationFrame(drawMeter);
        }
        this.animationId = requestAnimationFrame(drawMeter);
    },
    _audioEnd: function(instance) {
        if (this.forceStop) {
            this.forceStop = false;
            this.status = 1;
            return;
        };
        this.status = 0;
        var text = 'HTML5 Audio API showcase | An Audio Viusalizer';
        document.getElementById('fileWrapper').style.opacity = 1;
        document.getElementById('info').innerHTML = text;
        instance.info = text;
        document.getElementById('uploadedFile').value = '';
    },
    _updateInfo: function(text, processing) {
        var infoBar = document.getElementById('info'),
            dots = '...',
            i = 0,
            that = this;
        infoBar.innerHTML = text + dots.substring(0, i++);
        if (this.infoUpdateId !== null) {
            clearTimeout(this.infoUpdateId);
        };
        if (processing) {
            //animate dots at the end of the info text
            var animateDot = function() {
                if (i > 3) {
                    i = 0
                };
                infoBar.innerHTML = text + dots.substring(0, i++);
                that.infoUpdateId = setTimeout(animateDot, 250);
            }
            this.infoUpdateId = setTimeout(animateDot, 250);
        };
    }
}