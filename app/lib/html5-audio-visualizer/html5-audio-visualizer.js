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
    this.analyser = null;
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
            this.analyser = this.audioContext.createAnalyser();
            var audio = document.getElementById('prismatic-audio')

            this.source = this.audioContext.createMediaElementSource(audio);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
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
    _visualize: function(audioContext, buffer) {
        this.status = 1;
        this._drawSpectrum(this.analyser);
    },
    _drawSpectrum: function(analyser) {

        var that = this,
            canvas = document.getElementById('canvas'),
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            newHeight = cheight,
            meterWidth = 10, //width of the meters in the spectrum
            gap = function() {
                return meterWidth / 5 + 1; //gap between meters  
            },
            capHeight = 0,
            capStyle = '#fff',
            meterNum = function() {
                return Math.floor(canvas.width / (meterWidth + 2)); //count of the meters - only need 70%
            },
            capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
        ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, newHeight); //x , y , canvasWidth, canvasHeight
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
            for (var i = 0; i < meterNum() - 8; i++) {
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