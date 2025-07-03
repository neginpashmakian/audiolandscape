define(function () {
  "use strict";

  function requiredOptions(opt) {
    if (!opt.bufferWidth) {
      throw new Error("bufferWidth is required");
    }
    if (!opt.onTick) {
      throw new Error("onTick is required");
    }
  }

  function AudioData(options) {
    requiredOptions(options || {});
    this.bufferWidth = options.bufferWidth;
    this.onTick = options.onTick;

    // Create a single shared AudioContext
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = null;
    this.source = null;

    if (options.src) {
      this.loadUrl(options.src);
    }
  }

  AudioData.prototype.loadUrl = function (url) {
    const that = this;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = function () {
      that.onLoadAudio(xhr.response);
    };

    xhr.onerror = function () {
      console.error("Error loading audio from", url);
    };

    xhr.send();
  };

  AudioData.prototype.onLoadAudio = function (data) {
    const that = this;
    const context = this.context;
    const bufferWidth = this.bufferWidth * 2;

    context.decodeAudioData(data, function (buffer) {
      that.analyser = context.createAnalyser();
      that.analyser.fftSize = bufferWidth;
      that.analyser.connect(context.destination);

      that.source = context.createBufferSource();
      that.source.buffer = buffer;
      that.source.connect(that.analyser);

      that.source.start(0);
      that.start();
    });
  };

  AudioData.prototype.useMicInput = function () {
    const that = this;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        const source = that.context.createMediaStreamSource(stream);
        that.analyser = that.context.createAnalyser();
        that.analyser.fftSize = that.bufferWidth * 2;

        source.connect(that.analyser);
        that.start();
      })
      .catch(function (err) {
        console.error("Microphone access denied or failed:", err);
      });
  };

  AudioData.prototype.start = function () {
    const analyser = this.analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const onTick = this.onTick;
    const bufferWidth = this.bufferWidth;

    function tick() {
      requestAnimationFrame(tick);
      analyser.getByteFrequencyData(dataArray);
      onTick(Array.from(dataArray).slice(0, bufferWidth));
    }

    requestAnimationFrame(tick);
  };

  return AudioData;
});
