(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) return;
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) return;
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    var hero = document.querySelector("[data-hero]");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var yearFilter = scope.querySelector("[data-year-filter]");
      var sortFilter = scope.querySelector("[data-sort-filter]");
      var list = scope.querySelector("[data-card-list]");
      if (!list) return;
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      if (yearFilter) {
        var years = cards.map(function (card) { return card.getAttribute("data-year") || ""; })
          .filter(Boolean)
          .filter(function (value, i, arr) { return arr.indexOf(value) === i; })
          .sort(function (a, b) { return parseInt(b, 10) - parseInt(a, 10); });
        years.forEach(function (year) {
          var option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearFilter.appendChild(option);
        });
      }
      function apply() {
        var keyword = normalize(input && input.value);
        var year = yearFilter ? yearFilter.value : "";
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" "));
          var matched = (!keyword || haystack.indexOf(keyword) >= 0) && (!year || card.getAttribute("data-year") === year);
          card.classList.toggle("hidden-by-filter", !matched);
        });
        if (sortFilter && sortFilter.value !== "default") {
          var visible = cards.slice().sort(function (a, b) {
            if (sortFilter.value === "year-desc") {
              return (parseInt(b.getAttribute("data-year"), 10) || 0) - (parseInt(a.getAttribute("data-year"), 10) || 0);
            }
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
          });
          visible.forEach(function (card) {
            list.appendChild(card);
          });
        }
      }
      if (input) input.addEventListener("input", apply);
      if (yearFilter) yearFilter.addEventListener("change", apply);
      if (sortFilter) sortFilter.addEventListener("change", apply);
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) return;
    var input = document.querySelector("[data-search-page-input]");
    var summary = document.querySelector("[data-search-summary]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) input.value = query;
    function render() {
      var keyword = normalize(input && input.value);
      var list = window.SEARCH_MOVIES.filter(function (item) {
        if (!keyword) return true;
        return normalize([item.title, item.year, item.region, item.type, item.genre, item.category, item.tags].join(" ")).indexOf(keyword) >= 0;
      }).slice(0, 120);
      results.innerHTML = list.map(function (item) {
        return [
          '<article class="movie-card">',
          '<a class="poster-link" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="poster-glow"></span><span class="play-pill">播放</span></a>',
          '<div class="card-body"><h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p>' + escapeHtml(item.oneLine) + '</p>',
          '<div class="tag-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
          '</div></article>'
        ].join("");
      }).join("");
      if (summary) {
        summary.textContent = keyword ? "搜索结果" : "片库推荐";
      }
    }
    function escapeHtml(value) {
      return (value || "").replace(/[&<>'"]/g, function (char) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char];
      });
    }
    if (input) input.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
