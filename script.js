// Skylar Solutions - Shared site behavior

const LANGUAGE_STORAGE_KEY = 'language';
const LANGUAGE_CODES = ['en', 'fr'];

function checkWebpSupport() {
  const canvas =
    typeof document === 'object' ? document.createElement('canvas') : {};
  canvas.width = canvas.height = 1;

  return (
    typeof canvas.toDataURL === 'function' &&
    canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  );
}

function getSavedLanguage() {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return LANGUAGE_CODES.includes(storedLanguage)
    ? storedLanguage
    : document.documentElement.lang || 'en';
}

function resolveTitleVariant(lang) {
  const html = document.documentElement;
  const body = document.body;
  const titleNode = document.querySelector('title');

  const titleByLang =
    html?.dataset?.[`title${lang.toUpperCase()}`] ||
    body?.dataset?.[`title${lang.toUpperCase()}`] ||
    titleNode?.dataset?.[`title${lang.toUpperCase()}`];

  return titleByLang || null;
}

function updateDocumentTitle(lang) {
  const nextTitle = resolveTitleVariant(lang);

  if (nextTitle) {
    document.title = nextTitle;
  }
}

function replaceWithWebpImage() {
  if (!checkWebpSupport()) {
    return;
  }

  document.querySelectorAll('img[data-src-webp]').forEach((image) => {
    const webpSrc = image.getAttribute('data-src-webp');
    const webpSrcset = image.getAttribute('data-srcset-webp');

    if (webpSrc) {
      image.src = webpSrc;
    }

    if (webpSrcset) {
      image.srcset = webpSrcset;
    }
  });
}

function setLanguageVisibility(lang) {
  document.querySelectorAll('[data-lang-en], [data-lang-fr]').forEach((element) => {
    const showInEn = element.hasAttribute('data-lang-en');
    const showInFr = element.hasAttribute('data-lang-fr');
    const isVisible = (lang === 'en' && showInEn) || (lang === 'fr' && showInFr);

    element.hidden = !isVisible;
    element.setAttribute('aria-hidden', String(!isVisible));
  });

  document.querySelectorAll('.language-content').forEach((section) => {
    const isVisible = section.id === `content-${lang}`;
    section.hidden = !isVisible;
    section.setAttribute('aria-hidden', String(!isVisible));
  });
}

function updateLanguageControls(lang) {
  document.querySelectorAll('.language-switcher [data-lang]').forEach((control) => {
    const isActive = control.getAttribute('data-lang') === lang;

    control.classList.toggle('active', isActive);
    control.setAttribute('aria-pressed', String(isActive));

    if (control.tagName === 'BUTTON') {
      control.type = 'button';
    }
  });

  const langToggleButton = document.getElementById('lang-toggle');
  if (langToggleButton) {
    langToggleButton.textContent = lang === 'en' ? 'FR' : 'EN';
    langToggleButton.setAttribute('data-lang', lang);
  }
}

function updateLanguageContent(lang) {
  document.documentElement.setAttribute('lang', lang);
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  updateDocumentTitle(lang);
  setLanguageVisibility(lang);
  updateLanguageControls(lang);
}

function showFormMessage(form, message, type) {
  let messageElement =
    form.querySelector('.form-message') || document.getElementById('formMessage');

  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.className = 'form-message';
    form.appendChild(messageElement);
  }

  messageElement.textContent = message;
  messageElement.className = `form-message ${type}`;
  messageElement.style.display = 'block';
  messageElement.setAttribute('role', 'status');
  messageElement.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  if (type === 'success') {
    window.setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
}

function getActiveSubmitButton(form) {
  const activeLanguage = document.documentElement.lang || 'en';

  const scopedButton = form.querySelector(
    `[data-lang-${activeLanguage}] button[type="submit"], button[type="submit"][data-lang-${activeLanguage}]`
  );

  return scopedButton || form.querySelector('button[type="submit"]');
}

function setupLanguageControls(initialLanguage) {
  document.querySelectorAll('.language-switcher [data-lang]').forEach((control) => {
    if (control.tagName === 'A') {
      control.setAttribute('role', 'button');
      control.setAttribute('tabindex', '0');
    }

    const changeLanguage = (event) => {
      event.preventDefault();
      updateLanguageContent(control.getAttribute('data-lang') || initialLanguage);
    };

    control.addEventListener('click', changeLanguage);
    control.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        changeLanguage(event);
      }
    });
  });

  const langToggleButton = document.getElementById('lang-toggle');
  if (langToggleButton) {
    langToggleButton.addEventListener('click', () => {
      const nextLanguage =
        (langToggleButton.getAttribute('data-lang') || initialLanguage) === 'en'
          ? 'fr'
          : 'en';
      updateLanguageContent(nextLanguage);
    });
  }
}

function setupNavigation() {
  const navbarToggle = document.querySelector('.navbar-toggle');
  const mobileNav = document.querySelector('.nav-menu') || document.querySelector('.navbar');

  if (navbarToggle && mobileNav) {
    navbarToggle.addEventListener('click', () => {
      navbarToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
      navbarToggle.setAttribute('aria-expanded', String(mobileNav.classList.contains('active')));
    });
  }

  document.querySelectorAll('.dropdown-toggle, .dropdown > a').forEach((toggle) => {
    const parent = toggle.closest('.dropdown');
    const menu = parent?.querySelector('.dropdown-menu');

    if (!parent || !menu) {
      return;
    }

    toggle.addEventListener('click', (event) => {
      if (window.innerWidth <= 1024) {
        event.preventDefault();
        parent.classList.toggle('active');
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');

      if (!targetId || targetId === '#') {
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (!targetElement) {
        return;
      }

      event.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (mobileNav && navbarToggle) {
        mobileNav.classList.remove('active');
        navbarToggle.classList.remove('active');
      }
    });
  });

  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.navbar a, .nav-menu a').forEach((link) => {
    const href = link.getAttribute('href');

    if (!href || href.startsWith('#') || href.startsWith('http')) {
      return;
    }

    const linkPath = new URL(href, window.location.href).pathname.replace(/\/$/, '') || '/';
    const isIndex = currentPath === '/' && (linkPath === '/' || linkPath.endsWith('/index.html'));
    const isCurrent = linkPath === currentPath || isIndex;

    link.classList.toggle('active', isCurrent);
  });
}

function setupContactForm() {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) {
    return;
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let isValid = true;
    const requiredFields = contactForm.querySelectorAll('[required]');

    requiredFields.forEach((field) => {
      if (!field.value?.trim?.() && field.type !== 'checkbox') {
        isValid = false;
        field.classList.add('error');
      } else if (field.type === 'checkbox' && !field.checked) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });

    const emailField = contactForm.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailField.value)) {
        isValid = false;
        emailField.classList.add('error');
      }
    }

    if (!isValid) {
      showFormMessage(
        contactForm,
        document.documentElement.lang === 'fr'
          ? 'Veuillez remplir correctement tous les champs obligatoires.'
          : 'Please complete all required fields correctly.',
        'error'
      );
      return;
    }

    const formData = new FormData(contactForm);
    const submitButton = getActiveSubmitButton(contactForm);
    const originalButtonText = submitButton?.textContent || '';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent =
        document.documentElement.lang === 'fr' ? 'Envoi en cours...' : 'Sending...';
    }

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        showFormMessage(
          contactForm,
          document.documentElement.lang === 'fr'
            ? 'Merci pour votre message. Nous reviendrons vers vous sous peu.'
            : 'Thank you for your message. We will get back to you shortly.',
          'success'
        );
        contactForm.reset();
      } else {
        let errorMessage =
          document.documentElement.lang === 'fr'
            ? 'Une erreur est survenue. Veuillez réessayer.'
            : 'An error occurred. Please try again.';

        try {
          const data = await response.json();
          if (Array.isArray(data.errors) && data.errors.length > 0) {
            errorMessage = data.errors.map((error) => error.message).join(', ');
          }
        } catch (_error) {
          // Ignore JSON parsing errors and use the generic message above.
        }

        showFormMessage(contactForm, errorMessage, 'error');
      }
    } catch (_error) {
      showFormMessage(
        contactForm,
        document.documentElement.lang === 'fr'
          ? 'Erreur de connexion. Veuillez verifier votre connexion internet.'
          : 'Connection error. Please check your internet connection.',
        'error'
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

function setupHoverTransitions() {
  document
    .querySelectorAll('.btn, .service-card, .blog-card, .testimonial-card')
    .forEach((element) => {
      element.addEventListener('mouseenter', () => {
        element.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      });

      element.addEventListener('mouseleave', () => {
        element.style.transition = 'all 0.3s ease';
      });
    });
}

function setupBackToTopButton() {
  const backToTopButton = document.querySelector('.back-to-top');

  if (!backToTopButton) {
    return () => {};
  }

  const updateBackToTopButton = () => {
    backToTopButton.classList.toggle('visible', window.pageYOffset > 300);
  };

  backToTopButton.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  return updateBackToTopButton;
}

function setupHeaderAndHeroEffects() {
  const animateElements = document.querySelectorAll('.animate');
  const header = document.querySelector('.header');
  const heroSection = document.querySelector('.home-hero');
  const heroImage = document.querySelector('.hero-image img');

  const checkIfInView = () => {
    const windowHeight = window.innerHeight;

    animateElements.forEach((element) => {
      if (element.getBoundingClientRect().top < windowHeight - 100) {
        element.classList.add('animate-visible');
      }
    });
  };

  const updateHeader = () => {
    if (!header) {
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) {
      header.classList.add('scrolled');
      const blurAmount = Math.min(scrollTop / 200, 10);
      const bgOpacity = Math.min(0.9, 0.7 + scrollTop / 1000);

      header.style.backdropFilter = `blur(${blurAmount}px)`;
      header.style.webkitBackdropFilter = `blur(${blurAmount}px)`;
      header.style.backgroundColor = `rgba(255, 255, 255, ${bgOpacity})`;
    } else {
      header.classList.remove('scrolled');
      header.style.backdropFilter = 'blur(0px)';
      header.style.webkitBackdropFilter = 'blur(0px)';
      header.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    }

    const shadowOpacity = Math.min(0.15, scrollTop / 500);
    header.style.boxShadow = `0 4px 20px rgba(0, 0, 0, ${shadowOpacity})`;
  };

  const updateHeroParallax = () => {
    if (!heroSection || !heroImage) {
      return;
    }

    const scrollPosition = window.pageYOffset;
    if (scrollPosition >= heroSection.offsetHeight) {
      return;
    }

    heroImage.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    heroImage.style.opacity = String(
      Math.max(1 - (scrollPosition / heroSection.offsetHeight) * 0.5, 0.5)
    );
  };

  return () => {
    checkIfInView();
    updateHeader();
    updateHeroParallax();
  };
}

function setupTestimonials() {
  const testimonialSlider = document.querySelector('.testimonial-slider');
  if (!testimonialSlider) {
    return;
  }

  const testimonials = testimonialSlider.querySelectorAll('.testimonial');
  const prevButton = testimonialSlider.querySelector('.slider-prev');
  const nextButton = testimonialSlider.querySelector('.slider-next');
  let currentIndex = 0;

  const showTestimonial = (index) => {
    testimonials.forEach((testimonial, testimonialIndex) => {
      testimonial.classList.toggle('active', testimonialIndex === index);
    });
  };

  showTestimonial(currentIndex);

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      showTestimonial(currentIndex);
    });
  }

  if (testimonials.length > 1) {
    window.setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    }, 5000);
  }
}

function setupFaqItems() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) {
      return;
    }

    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');

    const toggleItem = () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) {
            otherAnswer.style.maxHeight = '0';
          }
        }
      });

      item.classList.toggle('active', !isActive);
      answer.style.maxHeight = isActive ? '0' : `${answer.scrollHeight}px`;
    };

    question.addEventListener('click', toggleItem);
    question.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleItem();
      }
    });
  });
}

function setupBlogFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const blogCards = document.querySelectorAll('.blog-card[data-category]');

  if (!filterButtons.length || !blogCards.length) {
    return;
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter');
      const activeLanguage = document.documentElement.lang || 'en';

      filterButtons.forEach((candidate) => {
        const matchesLanguage =
          candidate.hasAttribute(`data-lang-${activeLanguage}`) ||
          (!candidate.hasAttribute('data-lang-en') && !candidate.hasAttribute('data-lang-fr'));

        candidate.classList.toggle('active', candidate === button && matchesLanguage);
      });

      blogCards.forEach((card) => {
        const matches = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !matches;
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add(checkWebpSupport() ? 'webp' : 'no-webp');
  replaceWithWebpImage();

  const initialLanguage = getSavedLanguage();
  setupLanguageControls(initialLanguage);
  updateLanguageContent(initialLanguage);
  setupNavigation();
  setupContactForm();
  setupHoverTransitions();
  setupTestimonials();
  setupFaqItems();
  setupBlogFilters();

  const runScrollEffects = setupHeaderAndHeroEffects();
  const updateBackToTopButton = setupBackToTopButton();

  runScrollEffects();
  updateBackToTopButton();

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      runScrollEffects();
      updateBackToTopButton();
      ticking = false;
    });
  });
});
