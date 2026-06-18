(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function activate(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        schedule();
      });
    });

    activate(0);
    schedule();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));
    groups.forEach(function (group) {
      var input = group.querySelector('.movie-search');
      var year = group.querySelector('.movie-year');
      var type = group.querySelector('.movie-type');
      var region = group.querySelector('.movie-region');
      var cards = Array.prototype.slice.call(group.querySelectorAll('.movie-card'));
      var empty = group.querySelector('.no-results');

      function apply() {
        var keyword = normalize(input && input.value);
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var selectedRegion = region ? region.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear && card.dataset.year !== selectedYear) {
            matched = false;
          }
          if (selectedType && card.dataset.type.indexOf(selectedType) === -1) {
            matched = false;
          }
          if (selectedRegion && card.dataset.region.indexOf(selectedRegion) === -1) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      [input, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-wrap'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-overlay');
      var hlsUrl = player.getAttribute('data-hls');
      var hlsInstance = null;
      var started = false;

      function bind() {
        if (!video || !hlsUrl || started) {
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(hlsUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = hlsUrl;
        }
      }

      function play() {
        bind();
        if (button) {
          button.hidden = true;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (button) {
              button.hidden = false;
            }
          });
        }
      }

      if (button && video) {
        button.addEventListener('click', play);
        video.addEventListener('click', function () {
          if (!started) {
            play();
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setMobileMenu();
    setHero();
    setFilters();
    setPlayers();
  });
})();
