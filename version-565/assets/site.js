(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPageFilter() {
    var input = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-hidden", value && haystack.indexOf(value) === -1);
      });
    });
  }

  function cardMarkup(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(item.href) + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"card-year\">" + escapeHtml(item.year) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"card-meta\">" + escapeHtml(item.type + " · " + item.region) + "</div>",
      "<h3><a href=\"" + escapeHtml(item.href) + "\">" + escapeHtml(item.title) + "</a></h3>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initGlobalSearch() {
    var input = document.getElementById("globalSearchInput");
    var button = document.getElementById("globalSearchButton");
    var results = document.getElementById("searchResults");
    var data = window.siteSearchData || [];
    if (!input || !results || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    input.value = q;

    function render() {
      var value = input.value.trim().toLowerCase();
      var list = data.filter(function (item) {
        if (!value) {
          return true;
        }
        return item.search.indexOf(value) !== -1;
      }).slice(0, 180);
      results.innerHTML = list.length ? list.map(cardMarkup).join("") : "<div class=\"empty-state\">没有找到匹配影片</div>";
    }

    input.addEventListener("input", render);
    if (button) {
      button.addEventListener("click", render);
    }
    render();
  }

  function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("playerOverlay");
    if (!video || !source) {
      return;
    }

    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    initMenu();
    initHero();
    initPageFilter();
    initGlobalSearch();
  });
})();
