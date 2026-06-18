(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');
      var stream = box.getAttribute('data-stream');
      var prepared = false;
      var hls = null;

      function setVisiblePlaying() {
        if (button) button.classList.add('is-hidden');
      }

      function recoverVisible() {
        if (button) button.classList.remove('is-hidden');
      }

      function prepare() {
        if (!video || !stream || prepared) return;
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) return;
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              prepared = false;
            }
          });
        } else {
          video.src = stream;
        }
      }

      function play() {
        if (!video) return;
        prepare();
        setVisiblePlaying();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            recoverVisible();
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) play();
        });
        video.addEventListener('play', setVisiblePlaying);
        video.addEventListener('pause', function () {
          if (!video.ended) recoverVisible();
        });
        video.addEventListener('ended', recoverVisible);
      }
    });
  });
})();
