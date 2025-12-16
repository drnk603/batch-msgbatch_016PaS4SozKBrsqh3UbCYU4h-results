(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  const app = window.__app;

  const debounce = (func, wait) => {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  };

  const initBurgerMenu = () => {
    if (app.burgerInitialized) return;
    app.burgerInitialized = true;

    const nav = document.querySelector('.c-nav');
    const toggle = document.querySelector('.c-nav__toggle');
    const navList = document.querySelector('.c-nav__list');
    const navLinks = document.querySelectorAll('.c-nav__link');

    if (!nav || !toggle || !navList) return;

    let isOpen = false;

    const closeMenu = () => {
      if (!isOpen) return;
      isOpen = false;
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
      navList.style.height = '0';
    };

    const openMenu = () => {
      if (isOpen) return;
      isOpen = true;
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
      navList.style.height = 'calc(100vh - var(--header-h))';
    };

    const toggleMenu = () => {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !nav.contains(e.target)) {
        closeMenu();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 150));
  };

  const initSmoothScroll = () => {
    if (app.smoothScrollInitialized) return;
    app.smoothScrollInitialized = true;

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;

        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);
        
        if (targetEl) {
          e.preventDefault();
          const header = document.querySelector('.l-header');
          const headerHeight = header ? header.offsetHeight : 80;
          const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
          });
        }
      });
    });
  };

  const initScrollSpy = () => {
    if (app.scrollSpyInitialized) return;
    app.scrollSpyInitialized = true;

    const sections = document.querySelectorAll('[id]');
    const navLinks = document.querySelectorAll('.c-nav__link');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.remove('is-active');
            link.removeAttribute('aria-current');
            
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('is-active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      if (section.id) {
        observer.observe(section);
      }
    });
  };

  const initLazyLoading = () => {
    if (app.lazyLoadInitialized) return;
    app.lazyLoadInitialized = true;

    const images = document.querySelectorAll('img:not([loading])');
    const videos = document.querySelectorAll('video:not([loading])');

    images.forEach(img => {
      const isCritical = img.classList.contains('c-logo__img') || 
                        img.closest('.l-hero') || 
                        img.hasAttribute('data-critical');
      
      if (!isCritical) {
        img.setAttribute('loading', 'lazy');
      }
    });

    videos.forEach(video => {
      video.setAttribute('loading', 'lazy');
    });
  };

  const initScrollAnimations = () => {
    if (app.scrollAnimationsInitialized) return;
    app.scrollAnimationsInitialized = true;

    const animatedElements = document.querySelectorAll('.c-card, .c-button, .c-event, .c-testimonial, h1, h2, h3, p, .l-hero__title, .l-hero__subtitle, .l-hero__description');

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '0';
          entry.target.style.transform = 'translateY(30px)';
          entry.target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            });
          });
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      observer.observe(el);
    });
  };

  const initRippleEffect = () => {
    if (app.rippleInitialized) return;
    app.rippleInitialized = true;

    const createRipple = (event, element) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.width = '0';
      ripple.style.height = '0';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.5)';
      ripple.style.transform = 'translate(-50%, -50%)';
      ripple.style.pointerEvents = 'none';
      ripple.style.transition = 'width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out';
      ripple.style.opacity = '1';

      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);

      requestAnimationFrame(() => {
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.opacity = '0';
      });

      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    const buttons = document.querySelectorAll('.c-button, .btn, .c-nav__link');
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        createRipple(e, this);
      });
    });
  };

  const initHoverAnimations = () => {
    if (app.hoverInitialized) return;
    app.hoverInitialized = true;

    const cards = document.querySelectorAll('.c-card, .card, .card-hover');
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        this.style.transform = 'translateY(-8px) scale(1.02)';
      });

      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });

    const buttons = document.querySelectorAll('.c-button, .btn');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease-out';
        this.style.transform = 'translateY(-3px) scale(1.05)';
      });

      button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });

    const links = document.querySelectorAll('a:not(.c-button):not(.btn)');
    links.forEach(link => {
      link.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease-out';
      });
    });
  };

  const initCountUp = () => {
    if (app.countUpInitialized) return;
    app.countUpInitialized = true;

    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    const animateCounter = (element) => {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += step;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };

      updateCounter();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  };

  const initFormValidation = () => {
    if (app.formValidationInitialized) return;
    app.formValidationInitialized = true;

    const forms = document.querySelectorAll('.c-form, form');

    const validators = {
      name: {
        pattern: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
        message: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben)'
      },
      email: {
        pattern: /^[^s@]+@[^s@]+.[^s@]+$/,
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      },
      phone: {
        pattern: /^[ds+-()]{10,20}$/,
        message: 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen)'
      },
      message: {
        minLength: 10,
        message: 'Bitte geben Sie mindestens 10 Zeichen ein'
      }
    };

    const showError = (field, message) => {
      field.setAttribute('aria-invalid', 'true');
      field.style.borderColor = 'var(--color-error)';
      
      let errorElement = field.parentElement.querySelector('.c-form__error');
      if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'c-form__error';
        errorElement.setAttribute('role', 'alert');
        field.parentElement.appendChild(errorElement);
      }
      errorElement.textContent = message;
      errorElement.style.opacity = '0';
      errorElement.style.transform = 'translateY(-10px)';
      errorElement.style.transition = 'all 0.3s ease-out';
      
      requestAnimationFrame(() => {
        errorElement.style.opacity = '1';
        errorElement.style.transform = 'translateY(0)';
      });
    };

    const clearError = (field) => {
      field.removeAttribute('aria-invalid');
      field.style.borderColor = '';
      
      const errorElement = field.parentElement.querySelector('.c-form__error');
      if (errorElement) {
        errorElement.style.opacity = '0';
        errorElement.style.transform = 'translateY(-10px)';
        setTimeout(() => errorElement.remove(), 300);
      }
    };

    const validateField = (field) => {
      const fieldName = field.name || field.id;
      const fieldValue = field.value.trim();
      const fieldType = field.type;

      clearError(field);

      if (field.hasAttribute('required') && !fieldValue) {
        showError(field, 'Dieses Feld ist erforderlich');
        return false;
      }

      if (!fieldValue) return true;

      if (fieldName.includes('name') || fieldName === 'form-name' || field.id === 'contact-name') {
        if (!validators.name.pattern.test(fieldValue)) {
          showError(field, validators.name.message);
          return false;
        }
      }

      if (fieldType === 'email' || fieldName.includes('email')) {
        if (!validators.email.pattern.test(fieldValue)) {
          showError(field, validators.email.message);
          return false;
        }
      }

      if (fieldType === 'tel' || fieldName.includes('phone')) {
        if (fieldValue && !validators.phone.pattern.test(fieldValue)) {
          showError(field, validators.phone.message);
          return false;
        }
      }

      if (field.tagName === 'TEXTAREA' || fieldName.includes('message')) {
        if (fieldValue.length < validators.message.minLength) {
          showError(field, validators.message.message);
          return false;
        }
      }

      if (fieldType === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        showError(field, 'Bitte akzeptieren Sie die Bedingungen');
        return false;
      }

      return true;
    };

    forms.forEach(form => {
      const fields = form.querySelectorAll('input, textarea, select');
      
      fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        
        field.addEventListener('input', debounce(() => {
          if (field.hasAttribute('aria-invalid')) {
            validateField(field);
          }
        }, 500));
      });

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        let isValid = true;
        const formFields = this.querySelectorAll('input, textarea, select');
        
        formFields.forEach(field => {
          if (!validateField(field)) {
            isValid = false;
          }
        });

        if (!isValid) {
          const firstError = this.querySelector('[aria-invalid="true"]');
          if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Wird gesendet...';
          
          const style = document.createElement('style');
          style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
          document.head.appendChild(style);

          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1000);
        }
      });
    });
  };

  const initScrollToTop = () => {
    if (app.scrollToTopInitialized) return;
    app.scrollToTopInitialized = true;

    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.setAttribute('aria-label', 'Nach oben scrollen');
    scrollToTopBtn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, var(--color-accent), var(--color-accent-dark));
      color: var(--color-text-dark);
      border: none;
      border-radius: 50%;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s ease-out;
      z-index: 999;
      box-shadow: var(--shadow-lg);
    `;

    document.body.appendChild(scrollToTopBtn);

    const toggleButton = () => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
        scrollToTopBtn.style.transform = 'translateY(0)';
      } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.visibility = 'hidden';
        scrollToTopBtn.style.transform = 'translateY(20px)';
      }
    };

    window.addEventListener('scroll', throttle(toggleButton, 200));

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    scrollToTopBtn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.1)';
      this.style.boxShadow = 'var(--shadow-hover)';
    });

    scrollToTopBtn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = 'var(--shadow-lg)';
    });
  };

  const initCookieBanner = () => {
    if (app.cookieBannerInitialized) return;
    app.cookieBannerInitialized = true;

    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');

    const hideBanner = () => {
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => {
        banner.style.display = 'none';
      }, 500);
    };

    const showBanner = () => {
      banner.style.display = 'block';
      requestAnimationFrame(() => {
        banner.style.transform = 'translateY(0)';
      });
    };

    if (!localStorage.getItem('cookiesAccepted')) {
      setTimeout(showBanner, 1000);
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        hideBanner();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'false');
        hideBanner();
      });
    }
  };

  const initPrivacyModal = () => {
    if (app.privacyModalInitialized) return;
    app.privacyModalInitialized = true;

    const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
    
    privacyLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        if (this.getAttribute('href').includes('#')) {
          return;
        }
      });
    });
  };

  const initImageAnimations = () => {
    if (app.imageAnimationsInitialized) return;
    app.imageAnimationsInitialized = true;

    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      img.style.opacity = '0';
      img.style.transform = 'scale(0.95)';
      img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.complete) {
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
          } else {
            img.addEventListener('load', () => {
              img.style.opacity = '1';
              img.style.transform = 'scale(1)';
            });
          }
          
          observer.unobserve(img);
        }
      });
    }, { threshold: 0.1 });

    images.forEach(img => observer.observe(img));
  };

  const initHeaderScroll = () => {
    if (app.headerScrollInitialized) return;
    app.headerScrollInitialized = true;

    const header = document.querySelector('.l-header');
    if (!header) return;

    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.style.boxShadow = 'var(--shadow-xl)';
        header.style.transform = 'translateY(0)';
      } else {
        header.style.boxShadow = 'var(--shadow-md)';
      }

      if (currentScroll > lastScroll && currentScroll > 300) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }

      lastScroll = currentScroll;
    };

    header.style.transition = 'all 0.4s ease-out';
    window.addEventListener('scroll', throttle(handleScroll, 100));
  };

  app.init = () => {
    initLazyLoading();
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initScrollAnimations();
    initRippleEffect();
    initHoverAnimations();
    initCountUp();
    initFormValidation();
    initScrollToTop();
    initCookieBanner();
    initPrivacyModal();
    initImageAnimations();
    initHeaderScroll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();
