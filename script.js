// Skylar Solutions - Main JavaScript

function checkWebpSupport() {
  const canvas =
    typeof document === 'object' ? document.createElement('canvas') : {};
  canvas.width = canvas.height = 1;

  return (
    typeof canvas.toDataURL === 'function' &&
    canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  );
}

if (checkWebpSupport()) {
  document.documentElement.classList.add('webp');
} else {
  document.documentElement.classList.add('no-webp');
}

function replaceWithWebpImage() {
  if (!checkWebpSupport()) {
    return;
  }

  document.querySelectorAll('img[data-src-webp]').forEach((img) => {
    const webpSrc = img.getAttribute('data-src-webp');
    const webpSrcset = img.getAttribute('data-srcset-webp');

    if (webpSrc) {
      img.src = webpSrc;
    }

    if (webpSrcset) {
      img.srcset = webpSrcset;
    }
  });
}

function getSavedLanguage() {
  return localStorage.getItem('language') || document.documentElement.lang || 'en';
}

function updateDocumentTitle(lang) {
  const titleEn = document.documentElement.dataset.titleEn || document.body?.dataset.titleEn;
  const titleFr = document.documentElement.dataset.titleFr || document.body?.dataset.titleFr;

  if (titleEn && titleFr) {
    document.title = lang === 'fr' ? titleFr : titleEn;
  }
}

function updateLanguageContent(lang) {
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('language', lang);
  updateDocumentTitle(lang);

  document.querySelectorAll('.language-switcher [data-lang]').forEach((control) => {
    const isActive = control.getAttribute('data-lang') === lang;
    control.classList.toggle('active', isActive);

    if (control.tagName === 'BUTTON') {
      control.setAttribute('aria-pressed', String(isActive));
    }
  });

  document.querySelectorAll('.language-content').forEach((section) => {
    const isActive = section.id === `content-${lang}`;
    section.hidden = !isActive;
    section.style.display = isActive ? '' : 'none';
  });

  const langToggleBtn = document.getElementById('lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.textContent = lang === 'en' ? 'FR' : 'EN';
    langToggleBtn.setAttribute('data-lang', lang);
  }
}

function showFormMessage(form, message, type) {
  let messageEl = form.querySelector('.form-message') || document.getElementById('formMessage');

  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.className = 'form-message';
    form.appendChild(messageEl);
  }

  messageEl.textContent = message;
  messageEl.className = `form-message ${type}`;
  messageEl.style.display = 'block';

  if (type === 'success') {
    window.setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  replaceWithWebpImage();

  const initialLanguage = getSavedLanguage();
  updateLanguageContent(initialLanguage);

  document.querySelectorAll('.language-switcher [data-lang]').forEach((control) => {
    control.addEventListener('click', (event) => {
      event.preventDefault();
      updateLanguageContent(control.getAttribute('data-lang') || 'en');
    });
  });

  const langToggleBtn = document.getElementById('lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const nextLanguage =
        (langToggleBtn.getAttribute('data-lang') || initialLanguage) === 'en' ? 'fr' : 'en';
      updateLanguageContent(nextLanguage);
    });
  }

  const navbarToggle = document.querySelector('.navbar-toggle');
  const mobileNav = document.querySelector('.nav-menu') || document.querySelector('.navbar');

  if (navbarToggle && mobileNav) {
    navbarToggle.addEventListener('click', () => {
      navbarToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
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

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      let isValid = true;
      const requiredFields = contactForm.querySelectorAll('[required]');

      requiredFields.forEach((field) => {
        if (!field.value.trim() && field.type !== 'checkbox') {
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
        const errorMsg =
          document.documentElement.lang === 'fr'
            ? 'Veuillez remplir tous les champs obligatoires correctement.'
            : 'Please fill in all required fields correctly.';
        showFormMessage(contactForm, errorMsg, 'error');
        return;
      }

      const formData = new FormData(contactForm);
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;

      submitButton.disabled = true;
      submitButton.textContent =
        document.documentElement.lang === 'fr' ? 'Envoi en cours...' : 'Sending...';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          const successMsg =
            document.documentElement.lang === 'fr'
              ? 'Merci pour votre message! Nous vous contacterons sous peu.'
              : 'Thank you for your message! We will be in touch soon.';
          showFormMessage(contactForm, successMsg, 'success');
          contactForm.reset();
        } else {
          const data = await response.json();
          const errorMsg = data.errors
            ? data.errors.map((err) => err.message).join(', ')
            : document.documentElement.lang === 'fr'
              ? 'Une erreur est survenue. Veuillez réessayer.'
              : 'An error occurred. Please try again.';
          showFormMessage(contactForm, errorMsg, 'error');
        }
      } catch (error) {
        const errorMsg =
          document.documentElement.lang === 'fr'
            ? 'Erreur de connexion. Veuillez vérifier votre connexion internet.'
            : 'Connection error. Please check your internet connection.';
        showFormMessage(contactForm, errorMsg, 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }

  const animateElements = document.querySelectorAll('.animate');
  const header = document.querySelector('.header');
  const backToTopButton = document.querySelector('.back-to-top');
  const heroSection = document.querySelector('.home-hero');
  const heroImage = document.querySelector('.hero-image img');

  function checkIfInView() {
    const windowHeight = window.innerHeight;

    animateElements.forEach((element) => {
      if (element.getBoundingClientRect().top < windowHeight - 100) {
        element.classList.add('animate-visible');
      }
    });
  }

  function updateHeader() {
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
  }

  function updateHeroParallax() {
    if (!heroSection || !heroImage) {
      return;
    }

    const scrollPosition = window.pageYOffset;
    if (scrollPosition >= heroSection.offsetHeight) {
      return;
    }

    heroImage.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    heroImage.style.opacity = String(Math.max(1 - (scrollPosition / heroSection.offsetHeight) * 0.5, 0.5));
  }

  function updateBackToTopButton() {
    if (!backToTopButton) {
      return;
    }

    backToTopButton.classList.toggle('visible', window.pageYOffset > 300);
  }

  checkIfInView();
  updateHeader();
  updateHeroParallax();
  updateBackToTopButton();

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      checkIfInView();
      updateHeader();
      updateHeroParallax();
      updateBackToTopButton();
      ticking = false;
    });
  });

  if (backToTopButton) {
    backToTopButton.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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

  const testimonialSlider = document.querySelector('.testimonial-slider');
  if (testimonialSlider) {
    const testimonials = testimonialSlider.querySelectorAll('.testimonial');
    const prevBtn = testimonialSlider.querySelector('.slider-prev');
    const nextBtn = testimonialSlider.querySelector('.slider-next');
    let currentIndex = 0;

    function showTestimonial(index) {
      testimonials.forEach((testimonial, testimonialIndex) => {
        testimonial.classList.toggle('active', testimonialIndex === index);
      });
    }

    showTestimonial(currentIndex);

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
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

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) {
      return;
    }

    question.addEventListener('click', () => {
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
    });
  });
});
