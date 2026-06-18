(() => {
    const ready = (fn) => {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    };

    ready(() => {
        const mobileToggle = document.querySelector('.mobile-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener('click', () => {
                const open = mobileNav.classList.toggle('open');
                mobileToggle.setAttribute('aria-expanded', String(open));
            });
        }

        const hero = document.querySelector('[data-hero]');
        if (hero) {
            const slides = Array.from(hero.querySelectorAll('.hero-slide'));
            const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
            const prev = hero.querySelector('[data-hero-prev]');
            const next = hero.querySelector('[data-hero-next]');
            let current = 0;
            let timer = null;

            const show = (index) => {
                if (!slides.length) return;
                current = (index + slides.length) % slides.length;
                slides.forEach((slide, idx) => slide.classList.toggle('active', idx === current));
                dots.forEach((dot, idx) => dot.classList.toggle('active', idx === current));
            };

            const start = () => {
                stop();
                timer = window.setInterval(() => show(current + 1), 5200);
            };

            const stop = () => {
                if (timer) window.clearInterval(timer);
            };

            dots.forEach((dot, idx) => dot.addEventListener('click', () => {
                show(idx);
                start();
            }));

            if (prev) {
                prev.addEventListener('click', () => {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', () => {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        const filterSections = document.querySelectorAll('[data-filter-section]');
        filterSections.forEach((section) => {
            const input = section.querySelector('[data-filter-input]');
            const typeSelect = section.querySelector('[data-filter-type]');
            const yearSelect = section.querySelector('[data-filter-year]');
            const regionSelect = section.querySelector('[data-filter-region]');
            const cards = Array.from(section.querySelectorAll('[data-filter-card]'));

            if (section.hasAttribute('data-query-from-url') && input) {
                const params = new URLSearchParams(window.location.search);
                const q = params.get('q');
                if (q) input.value = q;
            }

            const apply = () => {
                const q = input ? input.value.trim().toLowerCase() : '';
                const type = typeSelect ? typeSelect.value : '';
                const year = yearSelect ? yearSelect.value : '';
                const region = regionSelect ? regionSelect.value : '';

                cards.forEach((card) => {
                    const text = (card.dataset.text || '').toLowerCase();
                    const okText = !q || text.includes(q);
                    const okType = !type || card.dataset.type === type;
                    const okYear = !year || card.dataset.year === year;
                    const okRegion = !region || card.dataset.region === region;
                    card.style.display = okText && okType && okYear && okRegion ? '' : 'none';
                });
            };

            [input, typeSelect, yearSelect, regionSelect].forEach((control) => {
                if (control) control.addEventListener('input', apply);
                if (control) control.addEventListener('change', apply);
            });

            apply();
        });

        const playerData = document.getElementById('movie-player-data');
        const video = document.getElementById('movieVideo');
        const overlay = document.querySelector('.player-overlay');
        if (playerData && video && overlay) {
            let payload = null;
            let hlsInstance = null;
            try {
                payload = JSON.parse(playerData.textContent.trim());
            } catch (err) {
                payload = null;
            }

            const prepare = () => {
                if (!payload || !payload.url || video.dataset.ready === '1') return;
                const playUrl = payload.url;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = playUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(playUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = playUrl;
                }
                video.dataset.ready = '1';
            };

            const begin = () => {
                prepare();
                overlay.classList.add('hidden');
                const promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(() => {
                        overlay.classList.remove('hidden');
                    });
                }
            };

            overlay.addEventListener('click', begin);
            video.addEventListener('click', () => {
                if (video.paused) begin();
            });
            video.addEventListener('play', () => overlay.classList.add('hidden'));
            video.addEventListener('pause', () => {
                if (!video.ended) overlay.classList.remove('hidden');
            });
            window.addEventListener('pagehide', () => {
                if (hlsInstance) hlsInstance.destroy();
            });
        }
    });
})();
