(function () {
    'use strict';

    var doc = document;

    /* ---------- Reading progress bar ---------- */
    var progressBar = doc.querySelector('.progress-bar');

    function updateProgress() {
        var scrollTop = window.scrollY || doc.documentElement.scrollTop;
        var docHeight = doc.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (progressBar) {
            progressBar.style.width = pct + '%';
        }
    }

    /* ---------- Table of contents drawer ---------- */
    var tocToggle = doc.querySelector('.toc-toggle');
    var tocPanel = doc.querySelector('.toc-panel');
    var tocScrim = doc.querySelector('.toc-scrim');
    var tocClose = doc.querySelector('.toc-close');
    var tocLinks = Array.prototype.slice.call(doc.querySelectorAll('.toc-list a'));

    function openToc() {
        if (!tocPanel) return;
        tocPanel.classList.add('is-open');
        tocScrim.classList.add('is-open');
        tocToggle.setAttribute('aria-expanded', 'true');
    }

    function closeToc() {
        if (!tocPanel) return;
        tocPanel.classList.remove('is-open');
        tocScrim.classList.remove('is-open');
        tocToggle.setAttribute('aria-expanded', 'false');
    }

    if (tocToggle) {
        tocToggle.addEventListener('click', function () {
            var isOpen = tocPanel.classList.contains('is-open');
            if (isOpen) { closeToc(); } else { openToc(); }
        });
    }
    if (tocClose) tocClose.addEventListener('click', closeToc);
    if (tocScrim) tocScrim.addEventListener('click', closeToc);
    tocLinks.forEach(function (link) {
        link.addEventListener('click', closeToc);
    });
    doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeToc();
    });

    /* ---------- Back to top ---------- */
    var backToTop = doc.querySelector('.back-to-top');

    function updateBackToTop() {
        if (!backToTop) return;
        if (window.scrollY > 800) {
            backToTop.classList.add('is-visible');
        } else {
            backToTop.classList.remove('is-visible');
        }
    }

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Scroll handling (throttled via rAF) ---------- */
    var ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateProgress();
                updateBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    updateProgress();
    updateBackToTop();

    /* ---------- Reveal-on-scroll for chapters, images, poems ---------- */
    var revealTargets = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));

    if ('IntersectionObserver' in window && revealTargets.length) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

        revealTargets.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        revealTargets.forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    /* ---------- Language toggle (preserve scroll position across pages) ---------- */
    var langToggle = doc.getElementById('lang-toggle');

    if (langToggle) {
        langToggle.addEventListener('click', function () {
            var base = this.getAttribute('href').split('#')[0];
            if (location.hash) {
                this.setAttribute('href', base + location.hash);
            }
        });
    }

    /* ---------- Active chapter highlighting in TOC ---------- */
    var chapters = Array.prototype.slice.call(doc.querySelectorAll('.chapter[id]'));

    if ('IntersectionObserver' in window && chapters.length && tocLinks.length) {
        var linkByHash = {};
        tocLinks.forEach(function (link) {
            linkByHash[link.getAttribute('href')] = link;
        });

        var chapterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var link = linkByHash['#' + entry.target.id];
                if (!link) return;
                if (entry.isIntersecting) {
                    tocLinks.forEach(function (l) { l.classList.remove('is-active'); });
                    link.classList.add('is-active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        chapters.forEach(function (chapter) {
            chapterObserver.observe(chapter);
        });
    }
})();
