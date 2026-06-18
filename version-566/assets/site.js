(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-broken');
      });
    });

    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 5000);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        restart();
      });
    }

    restart();

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
      var search = form.querySelector('[data-filter-search]');
      var type = form.querySelector('[data-filter-type]');
      var region = form.querySelector('[data-filter-region]');
      var genre = form.querySelector('[data-filter-genre]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));

      function val(el) {
        return el ? String(el.value || '').trim().toLowerCase() : '';
      }

      function txt(card, name) {
        return String(card.getAttribute(name) || '').toLowerCase();
      }

      function apply() {
        var q = val(search);
        var t = val(type);
        var r = val(region);
        var g = val(genre);
        cards.forEach(function (card) {
          var haystack = [
            txt(card, 'data-title'),
            txt(card, 'data-region'),
            txt(card, 'data-type'),
            txt(card, 'data-genre'),
            txt(card, 'data-tags')
          ].join(' ');
          var ok = true;
          if (q && haystack.indexOf(q) === -1) ok = false;
          if (t && txt(card, 'data-type') !== t) ok = false;
          if (r && txt(card, 'data-region') !== r) ok = false;
          if (g && txt(card, 'data-genre').indexOf(g) === -1) ok = false;
          card.hidden = !ok;
        });
      }

      ['input', 'change'].forEach(function (eventName) {
        [search, type, region, genre].forEach(function (el) {
          if (el) el.addEventListener(eventName, apply);
        });
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });

      apply();
    });
  });
})();
