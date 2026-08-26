(function () {
  'use strict';

  /* =========================================================
     Content loading — everything below renders from content/site.json
     so the site can be edited later through the admin CMS.
     ========================================================= */

  function getPath(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : '';
    }, obj);
  }

  function applyTextBindings(root, data) {
    root.querySelectorAll('[data-text]').forEach(function (el) {
      var path = el.getAttribute('data-text');
      var value = path.indexOf('.') === -1 ? getPath(data.contact, path) : getPath(data, path);
      el.textContent = value;
    });
    root.querySelectorAll('[data-field]').forEach(function (el) {
      var field = el.getAttribute('data-field');
      var href = '#';
      if (field === 'emailLink') href = 'mailto:' + data.contact.email;
      else href = getPath(data.contact, field);
      el.setAttribute('href', href);
    });
  }

  function loadImageOrientation(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        var ratio = img.naturalWidth / img.naturalHeight;
        var cls = ratio < 0.85 ? 'is-portrait' : ratio > 1.15 ? 'is-landscape' : 'is-square';
        resolve(cls);
      };
      img.onerror = function () { resolve('is-landscape'); };
      img.src = src;
    });
  }

  function buildHero(data) {
    var slidesWrap = document.getElementById('heroSlides');
    var dotsWrap = document.getElementById('heroDots');
    data.hero.slides.forEach(function (slide, i) {
      var div = document.createElement('div');
      div.className = 'hero-slide' + (i === 0 ? ' is-active' : '');
      var img = document.createElement('img');
      img.src = slide.image;
      img.alt = '';
      if (i === 0) img.loading = 'eager';
      div.appendChild(img);
      slidesWrap.appendChild(div);

      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Foto ' + (i + 1));
      if (i === 0) dot.className = 'is-active';
      dotsWrap.appendChild(dot);
    });
  }

  function buildPhilosophy(data) {
    var q = document.getElementById('philosophyQuote');
    var span = document.createElement('span');
    span.textContent = data.philosophy.quoteHighlight;
    q.appendChild(document.createTextNode(data.philosophy.quoteBefore));
    q.appendChild(span);
    q.appendChild(document.createTextNode(data.philosophy.quoteAfter));
  }

  function buildContactAddress(data) {
    var p = document.getElementById('contactAddress');
    p.appendChild(document.createTextNode(data.contact.addressLine1));
    p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode(data.contact.addressLine2));
  }

  function buildAbout(data) {
    var img = document.getElementById('aboutImage');
    img.src = data.about.image;
    img.alt = data.about.imageAlt;
    img.loading = 'lazy';

    var paras = document.getElementById('aboutParagraphs');
    data.about.paragraphs.forEach(function (text) {
      var p = document.createElement('p');
      p.textContent = text;
      paras.appendChild(p);
    });

    var stats = document.getElementById('aboutStats');
    data.about.stats.forEach(function (stat) {
      var div = document.createElement('div');
      div.className = 'stat';
      var b = document.createElement('b');
      b.textContent = stat.number;
      var span = document.createElement('span');
      span.textContent = stat.label;
      div.appendChild(b);
      div.appendChild(span);
      stats.appendChild(div);
    });
  }

  function buildFilters(data) {
    var wrap = document.getElementById('portfolioFilters');
    data.categories.forEach(function (cat) {
      var a = document.createElement('a');
      a.href = '#' + cat.id;
      a.className = 'filter-btn';
      a.textContent = cat.title;
      wrap.appendChild(a);
    });
  }

  function makeGalleryItem(cat, photo, orientationCls) {
    var figure = document.createElement('figure');
    figure.className = 'gallery-item reveal ' + orientationCls;
    var img = document.createElement('img');
    img.src = photo.image;
    img.alt = photo.alt || '';
    img.loading = 'lazy';
    var tag = document.createElement('span');
    tag.className = 'tag';
    var tagCat = document.createElement('span');
    tagCat.className = 'tag-cat';
    tagCat.textContent = cat.title;
    var tagPhrase = document.createElement('span');
    tagPhrase.className = 'tag-phrase';
    tagPhrase.textContent = photo.phrase || '';
    tag.appendChild(tagCat);
    tag.appendChild(tagPhrase);
    figure.appendChild(img);
    figure.appendChild(tag);
    return figure;
  }

  function buildCategories(data) {
    var wrap = document.getElementById('categorySections');
    var work = data.categories.map(function (cat) {
      return Promise.all(cat.photos.map(function (photo) {
        return loadImageOrientation(photo.image).then(function (cls) {
          return { photo: photo, cls: cls };
        });
      })).then(function (measured) {
        // Feature one random landscape-ish photo, bigger, at the end —
        // keeps every reload feeling a little different without curation effort.
        var featurable = measured.filter(function (m) { return m.cls !== 'is-portrait'; });
        var pool = featurable.length ? featurable : measured;
        var featured = pool[Math.floor(Math.random() * pool.length)];
        var rest = measured.filter(function (m) { return m !== featured; });

        var section = document.createElement('section');
        section.className = 'section-pad portfolio-block' + (cat.altBackground ? ' alt' : '');
        section.id = cat.id;

        var container = document.createElement('div');
        container.className = 'container';

        var head = document.createElement('div');
        head.className = 'portfolio-block-head reveal';
        var headText = document.createElement('div');
        var kicker = document.createElement('span');
        kicker.className = 'kicker';
        kicker.textContent = 'Portfolio · ' + cat.title;
        var h3 = document.createElement('h3');
        h3.textContent = cat.title;
        var p = document.createElement('p');
        p.textContent = cat.description;
        headText.appendChild(kicker);
        headText.appendChild(h3);
        headText.appendChild(p);
        var cta = document.createElement('a');
        cta.href = '#contacto';
        cta.className = 'btn btn-outline';
        cta.textContent = cat.ctaLabel;
        head.appendChild(headText);
        head.appendChild(cta);

        var gallery = document.createElement('div');
        gallery.className = 'gallery';
        rest.forEach(function (m) {
          gallery.appendChild(makeGalleryItem(cat, m.photo, m.cls));
        });
        if (featured) {
          gallery.appendChild(makeGalleryItem(cat, featured.photo, 'is-wide'));
        }

        container.appendChild(head);
        container.appendChild(gallery);
        section.appendChild(container);
        return section;
      });
    });
    return Promise.all(work).then(function (sections) {
      sections.forEach(function (section) { wrap.appendChild(section); });
    });
  }

  function initInteractive() {
    /* ---------- Header scroll state ---------- */
    var header = document.getElementById('siteHeader');
    function onScroll() {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile nav ---------- */
    var hamburger = document.getElementById('hamburgerBtn');
    var navMobile = document.getElementById('navMobile');
    function closeMobileNav() {
      hamburger.classList.remove('is-open');
      navMobile.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    hamburger.addEventListener('click', function () {
      var isOpen = navMobile.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navMobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileNav);
    });

    /* ---------- Back to top ---------- */
    document.getElementById('backToTop').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- Hero slider ---------- */
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.hero-dots button');
    var current = 0;
    var heroTimer;
    function showSlide(index) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    }
    function nextSlide() { showSlide(current + 1); }
    function startHero() {
      heroTimer = setInterval(nextSlide, 5500);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        clearInterval(heroTimer);
        showSlide(i);
        startHero();
      });
    });
    if (slides.length > 1) startHero();

    /* ---------- Lightbox ---------- */
    var galleryItems = document.querySelectorAll('.gallery-item');
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCaption = document.getElementById('lightboxCaption');
    var lightboxClose = document.getElementById('lightboxClose');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var activeItems = [];
    var activeIndex = 0;

    function openLightbox(item) {
      var scope = item.closest('.gallery') || document;
      activeItems = Array.prototype.slice.call(scope.querySelectorAll('.gallery-item'));
      activeIndex = activeItems.indexOf(item);
      renderLightbox();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function renderLightbox() {
      var item = activeItems[activeIndex];
      var img = item.querySelector('img');
      var cat = item.querySelector('.tag-cat').textContent;
      var phrase = item.querySelector('.tag-phrase').textContent;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = cat + ' · ' + phrase;
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function stepLightbox(dir) {
      activeIndex = (activeIndex + dir + activeItems.length) % activeItems.length;
      renderLightbox();
    }

    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () { openLightbox(item); });
    });
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function () { stepLightbox(-1); });
    lightboxNext.addEventListener('click', function () { stepLightbox(1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });

    /* ---------- Active nav link on scroll ---------- */
    var navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');
    var sections = Array.prototype.map.call(navLinks, function (link) {
      return document.querySelector(link.getAttribute('href'));
    }).filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      var navIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = '#' + entry.target.id;
          var link = document.querySelector('.nav-desktop a[href="' + id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove('active'); });
            link.classList.add('active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { navIo.observe(s); });
    }
  }

  fetch('content/site.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      document.title = data.meta.title;
      applyTextBindings(document, data);
      buildHero(data);
      buildPhilosophy(data);
      buildFilters(data);
      buildContactAddress(data);
      buildAbout(data);
      return buildCategories(data);
    })
    .then(initInteractive)
    .catch(function (err) {
      console.error('No se pudo cargar content/site.json', err);
    });
})();
