(function() {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeText(value) {
    return String(value || '').replace(/[&<>"]/g, function(token) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[token];
    });
  }

  function initMobileNav() {
    var toggle = $('.mobile-toggle');
    var nav = $('.main-nav');
    var search = $('.header-search');
    if (!toggle || !nav || !search) {
      return;
    }
    toggle.addEventListener('click', function() {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      search.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = $$('[data-hero-slide]');
    var thumbs = $$('[data-hero-target]');
    if (!slides.length || !thumbs.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      thumbs.forEach(function(thumb, i) {
        thumb.classList.toggle('active', i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    thumbs.forEach(function(thumb) {
      thumb.addEventListener('click', function() {
        show(Number(thumb.getAttribute('data-hero-target')) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function initLocalFilter() {
    var input = $('.local-filter');
    if (!input) {
      return;
    }
    var cards = $$('[data-filter-card]');
    input.addEventListener('input', function() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        card.classList.toggle('hidden-by-filter', value && text.indexOf(value) === -1);
      });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function(tag) {
      return '<span>' + escapeText(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card small-card">' +
        '<a class="poster-link" href="' + escapeText(item.url) + '">' +
          '<img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy">' +
          '<span class="year-badge">' + escapeText(item.year) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<div class="card-meta">' + escapeText(item.region) + ' · ' + escapeText(item.type) + '</div>' +
          '<h2><a href="' + escapeText(item.url) + '">' + escapeText(item.title) + '</a></h2>' +
          '<p>' + escapeText(item.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var input = $('#search-page-input');
    var results = $('#search-results');
    var summary = $('#search-summary');
    if (!input || !results || !summary || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;

    function render(value) {
      var keyword = value.trim().toLowerCase();
      var pool = window.MOVIE_INDEX;
      var matched = keyword ? pool.filter(function(item) {
        var text = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.category,
          item.oneLine,
          (item.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }) : pool.slice(0, 60);
      matched = matched.slice(0, 120);
      summary.textContent = keyword ? '搜索结果：' + matched.length + ' 条' : '热门内容';
      results.innerHTML = matched.map(cardTemplate).join('');
    }

    render(q);
    input.addEventListener('input', function() {
      render(input.value);
    });
  }

  initMobileNav();
  initHero();
  initLocalFilter();
  initSearchPage();
}());
