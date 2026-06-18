(function () {
  window.initMoviePlayer = function (videoId, triggerId, overlayId, source) {
    var video = document.getElementById(videoId);
    var trigger = document.getElementById(triggerId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    var attached = false;
    if (!video || !source) return;

    function attach() {
      if (attached) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = source;
      attached = true;
    }

    function play() {
      attach();
      video.controls = true;
      if (overlay) overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) overlay.classList.remove("is-hidden");
        });
      }
    }

    if (trigger) trigger.addEventListener("click", play);
    if (overlay && overlay !== trigger) overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) play();
    });
    window.addEventListener("pagehide", function () {
      if (hls) hls.destroy();
    });
  };
})();
