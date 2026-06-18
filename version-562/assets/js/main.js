(function () {
  var body = document.body;
  var toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;
    var show = function (next) {
      if (!slides.length) return;
      slides[index].classList.remove('active');
      if (dots[index]) dots[index].classList.remove('active');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    var restart = function () {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    restart();
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var searchInput = document.querySelector('[data-card-search]');
  var categoryInput = document.querySelector('[data-card-category]');
  if (searchInput && query) {
    searchInput.value = query;
  }

  var filterCards = function () {
    var list = document.querySelector('[data-card-list]');
    if (!list) return;
    var text = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var category = categoryInput ? categoryInput.value : '';
    Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
      var meta = (card.getAttribute('data-meta') || '').toLowerCase();
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var matchText = !text || meta.indexOf(text) > -1 || title.indexOf(text) > -1;
      var matchCategory = !category || cardCategory === category;
      card.classList.toggle('hidden-card', !(matchText && matchCategory));
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }
  if (categoryInput) {
    categoryInput.addEventListener('change', filterCards);
  }
  filterCards();

  var hlsLoader = null;
  var loadHls = function (done) {
    if (window.Hls) {
      done();
      return;
    }
    if (hlsLoader) {
      hlsLoader.addEventListener('load', done, { once: true });
      return;
    }
    hlsLoader = document.createElement('script');
    hlsLoader.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    hlsLoader.async = true;
    hlsLoader.addEventListener('load', done, { once: true });
    hlsLoader.addEventListener('error', done, { once: true });
    document.head.appendChild(hlsLoader);
  };

  var startPlayer = function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.video-cover');
    if (!video) return;
    var src = video.getAttribute('data-hls');
    if (!src) return;
    var playNow = function () {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    };
    var activate = function () {
      if (cover) cover.classList.add('hidden');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) video.src = src;
        playNow();
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsReady) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hlsReady = true;
          }
          playNow();
        } else {
          if (!video.src) video.src = src;
          playNow();
        }
      });
    };
    if (cover) {
      cover.addEventListener('click', activate);
    }
    video.addEventListener('click', function () {
      if (!video.src && !video._hlsReady) activate();
    });
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(startPlayer);
})();
