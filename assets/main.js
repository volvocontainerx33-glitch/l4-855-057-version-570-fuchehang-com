
(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        if (slides.length < 2) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide-target')) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function initSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search-form'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var url = './search.html';
                if (query) {
                    url += '?q=' + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function initFilters() {
        var input = document.querySelector('.filter-input');
        var grid = document.querySelector('.filter-grid');
        if (!input || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var empty = document.querySelector('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input.classList.contains('global-filter-input') && initial) {
            input.value = initial;
        }

        function applyFilter() {
            var query = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var hit = !query || haystack.indexOf(query) !== -1;
                card.style.display = hit ? '' : 'none';
                if (hit) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    }

    function loadHls() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error('hls'));
            };
            document.head.appendChild(script);
        });
    }

    function safePlay(video) {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }
    }

    function setupMoviePlayer(config) {
        var root = document.getElementById(config.rootId);
        if (!root) {
            return;
        }
        var video = root.querySelector('video');
        var overlay = root.querySelector('.player-overlay');
        var started = false;
        var hlsInstance = null;

        function start() {
            if (!video || started) {
                if (video) {
                    safePlay(video);
                }
                return;
            }
            started = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = config.url;
                video.load();
                safePlay(video);
                return;
            }
            loadHls().then(function (Hls) {
                if (Hls && Hls.isSupported && Hls.isSupported()) {
                    hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(config.url);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        safePlay(video);
                    });
                    safePlay(video);
                } else {
                    video.src = config.url;
                    video.load();
                    safePlay(video);
                }
            }).catch(function () {
                video.src = config.url;
                video.load();
                safePlay(video);
            });
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hlsInstance && hlsInstance.destroy) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchForms();
        initFilters();
    });

    window.MovieSite = {
        setupMoviePlayer: setupMoviePlayer
    };
})();
