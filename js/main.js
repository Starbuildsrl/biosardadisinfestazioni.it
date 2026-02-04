document.addEventListener('DOMContentLoaded', async function () {

  // =============================================
  // 0. LOAD HEADER AND FOOTER COMPONENTS
  // =============================================
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');
  const serviziSidebarPlaceholder = document.getElementById('servizi-sidebar-placeholder');
  const ctaPreventivoPlaceholder = document.getElementById('cta-preventivo-placeholder');
  const base = document.body.dataset.base || './';
  const servizi = document.body.dataset.servizi !== undefined ? document.body.dataset.servizi : 'servizi/';

  const fetches = [
    fetch(base + 'components/header.html'),
    fetch(base + 'components/footer.html')
  ];
  if (serviziSidebarPlaceholder) {
    fetches.push(fetch(base + 'components/servizi-sidebar.html'));
  }

  if (headerPlaceholder && footerPlaceholder) {
    try {
      const results = await Promise.all(fetches);
      const headerRes = results[0];
      const footerRes = results[1];

      if (headerRes.ok && footerRes.ok) {
        let headerHtml = await headerRes.text();
        let footerHtml = await footerRes.text();
        headerHtml = headerHtml.replace(/\{\{base\}\}/g, base).replace(/\{\{servizi\}\}/g, servizi);
        footerHtml = footerHtml.replace(/\{\{base\}\}/g, base).replace(/\{\{servizi\}\}/g, servizi);

        headerPlaceholder.innerHTML = headerHtml;
        footerPlaceholder.innerHTML = footerHtml;

        // Load servizi sidebar (solo sulle pagine servizi)
        if (serviziSidebarPlaceholder && results[2] && results[2].ok) {
          let sidebarHtml = await results[2].text();
          sidebarHtml = sidebarHtml.replace(/\{\{base\}\}/g, base).replace(/\{\{servizi\}\}/g, servizi);
          serviziSidebarPlaceholder.innerHTML = sidebarHtml;
        }

        // Set active nav link based on current page
        const pathname = (window.location.pathname || '/').replace(/\/$/, '') || '/';
        const isHome = pathname === '' || pathname === '/' || pathname.endsWith('/index.html');
        const pathNorm = pathname.replace(/^\//, '').toLowerCase();
        const mainNavLinks = document.querySelectorAll('.main-nav a[href], .mobile-nav a[href]');

        mainNavLinks.forEach(function (link) {
          const fullHref = link.getAttribute('href') || '';
          const hasHash = fullHref.indexOf('#') !== -1;
          const href = fullHref.split('#')[0].replace(/^\.\//, '').replace(/\/$/, '').toLowerCase();
          const isMatch = (pathNorm === 'index.html' || pathNorm === '') && (href === 'index.html' || href === '') && !hasHash ||
            (pathNorm !== 'index.html' && pathNorm !== '' && (
              pathNorm === href ||
              (pathNorm === 'chi-siamo.html' && href.indexOf('chi-siamo') !== -1) ||
              (pathNorm === 'contatti.html' && href.indexOf('contatti') !== -1) ||
              (pathNorm.startsWith('servizi/') && href && (pathNorm === 'servizi/' + href || pathNorm.endsWith(href)))
            ));
          if (isMatch) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        // Reviews Google (componente riutilizzabile)
        var reviewsPlaceholder = document.getElementById('reviews-placeholder');
        if (reviewsPlaceholder) {
          fetch(base + 'components/reviews.html')
            .then(function (res) { return res.ok ? res.text() : ''; })
            .then(function (html) {
              if (!html) return;
              reviewsPlaceholder.innerHTML = html.trim();
            })
            .catch(function () {});
        }

        // CTA Preventivo banner (componente riutilizzabile)
        if (ctaPreventivoPlaceholder) {
          fetch(base + 'components/cta-preventivo-banner.html')
            .then(function (res) { return res.ok ? res.text() : ''; })
            .then(function (html) {
              if (!html) return;
              const bannerHtml = html.replace(/\{\{base\}\}/g, base);
              ctaPreventivoPlaceholder.innerHTML = bannerHtml.trim();
            })
            .catch(function () {});
        }

        // Set active link in servizi sidebar
        if (serviziSidebarPlaceholder && serviziSidebarPlaceholder.innerHTML) {
          const sidebarLinks = serviziSidebarPlaceholder.querySelectorAll('.service-sidebar-list a');
          sidebarLinks.forEach(function (link) {
            const href = (link.getAttribute('href') || '').toLowerCase();
            if (pathNorm.endsWith(href)) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }

        // Header scrolled on non-home pages
        const siteHeaderEl = document.querySelector('.site-header');
        if (siteHeaderEl && !isHome) {
          siteHeaderEl.classList.add('scrolled');
        }
      }
    } catch (err) {
      console.warn('Components load failed:', err);
    }
  }

  // =============================================
  // 0b. COOKIE BANNER (banner sotto)
  // =============================================
  const cookieConsentKey = 'biosarda-cookie-consent';
  if (!localStorage.getItem(cookieConsentKey)) {
    const bannerBase = document.body.dataset.base || './';
    fetch(bannerBase + 'components/cookie-banner.html')
      .then(function (res) { return res.ok ? res.text() : ''; })
      .then(function (html) {
        if (!html) return;
        const bannerHtml = html.replace(/\{\{base\}\}/g, bannerBase);
        const wrap = document.createElement('div');
        wrap.innerHTML = bannerHtml.trim();
        const banner = wrap.firstElementChild;
        if (!banner) return;
        document.body.appendChild(banner);

        const acceptBtn = document.getElementById('cookie-banner-accept');
        if (acceptBtn) {
          acceptBtn.addEventListener('click', function () {
            localStorage.setItem(cookieConsentKey, 'accepted');
            banner.classList.add('hidden');
          });
        }
      })
      .catch(function () {});
  }

  // =============================================
  // 1. MOBILE MENU TOGGLE
  // =============================================
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileOverlay = document.querySelector('.mobile-overlay');

  function openMobileMenu() {
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileOverlay.classList.add('visible');
    mobileOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileOverlay.classList.remove('visible');
    mobileOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (menuToggle && mobileNav && mobileOverlay) {
    menuToggle.addEventListener('click', function () {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileOverlay.addEventListener('click', closeMobileMenu);

    const mobileNavLinks = mobileNav.querySelectorAll('a');
    mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // =============================================
  // 2. MOBILE DROPDOWN TOGGLE
  // =============================================
  const mobileDropdownToggle = document.querySelector('.mobile-dropdown-toggle');
  const mobileDropdownItems = document.querySelector('.mobile-dropdown-items');

  if (mobileDropdownToggle && mobileDropdownItems) {
    mobileDropdownToggle.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!isExpanded));
      mobileDropdownItems.classList.toggle('open');
    });
  }

  // =============================================
  // 3. STICKY HEADER ON SCROLL
  // =============================================
  const siteHeader = document.querySelector('.site-header');

  if (siteHeader) {
    const alwaysScrolled = siteHeader.classList.contains('scrolled');

    if (!alwaysScrolled) {
      function handleScroll() {
        if (window.scrollY > 100) {
          siteHeader.classList.add('scrolled');
        } else {
          siteHeader.classList.remove('scrolled');
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
  }

  // =============================================
  // 4. SMOOTH SCROLL FOR ANCHOR LINKS
  // =============================================
  const HEADER_OFFSET = 70;

  // Scroll to hash on load (e.g. from footer link to chi-siamo.html#credenziali)
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      window.addEventListener('load', function () {
        const y = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    }
  }

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const targetPosition = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // Update URL hash without jumping
    if (history.pushState) {
      history.pushState(null, null, href);
    }
  });

  // =============================================
  // 5. FAQ ACCORDION
  // =============================================
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(function (question) {
    question.addEventListener('click', function () {
      const parentItem = this.closest('.faq-item');
      const answer = parentItem.querySelector('.faq-answer');
      const isOpen = parentItem.classList.contains('open');

      // Close all other open items
      faqQuestions.forEach(function (otherQuestion) {
        const otherItem = otherQuestion.closest('.faq-item');
        const otherAnswer = otherItem.querySelector('.faq-answer');

        if (otherItem !== parentItem && otherItem.classList.contains('open')) {
          otherItem.classList.remove('open');
          otherQuestion.setAttribute('aria-expanded', 'false');
          otherAnswer.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isOpen) {
        parentItem.classList.remove('open');
        this.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        parentItem.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // =============================================
  // 6. LAZY LOAD GOOGLE MAPS IFRAME
  // =============================================
  const mapContainer = document.getElementById('map-container');

  if (mapContainer && 'IntersectionObserver' in window) {
    const mapObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const src = mapContainer.getAttribute('data-src');
          if (src) {
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.width = '100%';
            iframe.height = '300';
            iframe.style.border = '0';
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('title', 'Mappa sede Biosarda Disinfestazioni');
            iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');

            mapContainer.innerHTML = '';
            mapContainer.appendChild(iframe);
          }
          observer.unobserve(mapContainer);
        }
      });
    }, {
      rootMargin: '200px 0px',
      threshold: 0
    });

    mapObserver.observe(mapContainer);
  }

  // =============================================
  // 7. CONTACT FORM VALIDATION
  // =============================================
  const contactForm = document.querySelector('form[aria-label="Modulo di contatto"]');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      let isValid = true;

      // Clear previous errors
      const formGroups = contactForm.querySelectorAll('.form-group');
      formGroups.forEach(function (group) {
        group.classList.remove('error');
        const existingError = group.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
      });

      // Validate required fields
      const requiredFields = contactForm.querySelectorAll('[required]');
      requiredFields.forEach(function (field) {
        const formGroup = field.closest('.form-group');
        const isCheckbox = field.type === 'checkbox';
        const isEmpty = isCheckbox ? !field.checked : !field.value.trim();

        if (isEmpty) {
          isValid = false;
          formGroup.classList.add('error');

          const errorMsg = document.createElement('span');
          errorMsg.className = 'error-message';
          errorMsg.setAttribute('role', 'alert');
          errorMsg.textContent = isCheckbox ? 'Devi accettare l\'Informativa Privacy per inviare il messaggio.' : 'Questo campo è obbligatorio';
          formGroup.appendChild(errorMsg);
        }

        // Validate email format
        const value = field.value ? field.value.trim() : '';
        if (field.type === 'email' && value && !isEmpty) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            isValid = false;
            formGroup.classList.add('error');

            const errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.setAttribute('role', 'alert');
            errorMsg.textContent = 'Inserisci un indirizzo email valido';
            formGroup.appendChild(errorMsg);
          }
        }
      });

      if (!isValid) {
        e.preventDefault();
        // Focus first error field
        const firstError = contactForm.querySelector('.form-group.error input, .form-group.error textarea, .form-group.error select');
        if (firstError) {
          firstError.focus();
        }
        // Scroll to first error
        const firstErrorGroup = contactForm.querySelector('.form-group.error');
        if (firstErrorGroup) {
          const yOffset = -100;
          const y = firstErrorGroup.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });

    // Remove error state on input or change (checkbox)
    function clearFieldError(e) {
      const formGroup = e.target.closest('.form-group');
      if (formGroup && formGroup.classList.contains('error')) {
        formGroup.classList.remove('error');
        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
      }
    }
    contactForm.addEventListener('input', clearFieldError);
    contactForm.addEventListener('change', clearFieldError);
  }

  // =============================================
  // 8. GALLERY LIGHTBOX
  // =============================================
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (galleryItems.length > 0) {
    // Create lightbox DOM
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Visualizzazione immagine ingrandita');
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="Chiudi">&times;</button>' +
      '<button class="lightbox-prev" aria-label="Immagine precedente">&#10094;</button>' +
      '<button class="lightbox-next" aria-label="Immagine successiva">&#10095;</button>' +
      '<div class="lightbox-content"><img src="" alt=""></div>' +
      '<div class="lightbox-caption"></div>';

    document.body.appendChild(overlay);

    const lbImg = overlay.querySelector('.lightbox-content img');
    const lbCaption = overlay.querySelector('.lightbox-caption');
    const lbClose = overlay.querySelector('.lightbox-close');
    const lbPrev = overlay.querySelector('.lightbox-prev');
    const lbNext = overlay.querySelector('.lightbox-next');

    var currentItems = [];
    var currentIndex = 0;

    function openLightbox(item) {
      // Get all items in the same gallery-grid
      var grid = item.closest('.gallery-grid');
      currentItems = grid ? Array.from(grid.querySelectorAll('.gallery-item')) : [item];
      currentIndex = currentItems.indexOf(item);
      showImage(currentIndex);
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function showImage(index) {
      var img = currentItems[index].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = (index + 1) + ' / ' + currentItems.length;
      currentIndex = index;
    }

    function closeLightbox() {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function prevImage() {
      var newIndex = currentIndex <= 0 ? currentItems.length - 1 : currentIndex - 1;
      showImage(newIndex);
    }

    function nextImage() {
      var newIndex = currentIndex >= currentItems.length - 1 ? 0 : currentIndex + 1;
      showImage(newIndex);
    }

    // Event listeners
    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () {
        openLightbox(item);
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', prevImage);
    lbNext.addEventListener('click', nextImage);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    });
  }

});
