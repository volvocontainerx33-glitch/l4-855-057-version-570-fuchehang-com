(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-target]'));
    var activeIndex = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showHero(activeIndex + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = parseInt(dot.getAttribute('data-hero-target'), 10);
        showHero(target);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showHero(0);
    startHero();
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

  if (filterInput && queryFromUrl) {
    filterInput.value = queryFromUrl;
  }

  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var typeValue = filterSelect ? filterSelect.value.trim().toLowerCase() : '';

    filterCards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
      var typeMatched = !typeValue || haystack.indexOf(typeValue) !== -1;
      card.classList.toggle('hidden-card', !(keywordMatched && typeMatched));
    });
  }

  if (filterInput || filterSelect) {
    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  }
})();
