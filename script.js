// Skylar Solutions - Shared site behavior

const LANGUAGE_STORAGE_KEY = 'language';
const LANGUAGE_CODES = ['en', 'fr'];

function getSavedLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (LANGUAGE_CODES.includes(stored)) return stored;
  } catch {
    // Storage can be disabled by the browser.
  }
  return navigator.languages?.map(code => code.split('-')[0])
    .find(code => LANGUAGE_CODES.includes(code)) || 'en';
}

function resolveTitleVariant(lang) {
  const html = document.documentElement;
  const body = document.body;
  const titleNode = document.querySelector('title');

  const attribute = 'data-title-' + lang;
  const titleByLang = html.getAttribute(attribute) ||
    body.getAttribute(attribute) || titleNode?.getAttribute('data-lang-' + lang);

  return titleByLang || null;
}

function updateDocumentTitle(lang) {
  const nextTitle = resolveTitleVariant(lang);

  if (nextTitle) {
    document.title = nextTitle;
  }
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
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // The selected language still applies to this page.
  }
  document.querySelectorAll('header a[data-lang-en][data-lang-fr]').forEach(link => {
    const label = link.getAttribute(`data-lang-${lang}`);
    const text = Array.from(link.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    if (label && text) text.nodeValue = label + ' ';
  });
  updateDocumentTitle(lang);
  setLanguageVisibility(lang);
  updateLanguageControls(lang);
  updateEnquirySubject(lang);
  updateMessageHint(lang);
}

function showFormMessage(form, message, type) {
  let messageElement =
    form.querySelector('.form-message') || document.getElementById('formMessage');

  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.className = 'form-message';
    form.appendChild(messageElement);
  }

  const recovery = form.querySelector('#delivery-recovery');
  if (recovery) recovery.hidden = type !== 'error';
  messageElement.textContent = message;
  messageElement.className = `form-message ${type}`;
  messageElement.style.display = 'block';
  messageElement.setAttribute('role', 'status');
  messageElement.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

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

  const servicesToggle = document.querySelector('.services-toggle');
  const dropdown = servicesToggle?.closest('.dropdown');

  if (navbarToggle && mobileNav) {
    navbarToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('active');
      navbarToggle.classList.toggle('active', open);
      navbarToggle.setAttribute('aria-expanded', String(open));
      if (!open) {
        dropdown?.classList.remove('active');
        servicesToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  servicesToggle?.addEventListener('click', () => {
    const expanded = dropdown.classList.toggle('active');
    servicesToggle.setAttribute('aria-expanded', String(expanded));
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !mobileNav?.classList.contains('active')) return;
    if (dropdown?.classList.contains('active')) {
      dropdown.classList.remove('active');
      servicesToggle.setAttribute('aria-expanded', 'false');
      servicesToggle.focus();
    } else {
      navbarToggle.click();
      navbarToggle.focus();
    }
  });

  mobileNav?.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]') && mobileNav.classList.contains('active')) {
      navbarToggle?.click();
    }
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

const enquiryTopics = new Map([
  ['ai-consultation', ['AI project consultation', 'Consultation sur un projet IA']],
  ['microsoft365-migration', ['Microsoft 365 migration', 'Migration vers Microsoft 365']],
  ['odoo-implementation', ['Odoo implementation', 'Mise en place d’Odoo']],
  ['consultation', ['Project consultation', 'Échange sur un projet']],
  ['app-development', ['Application development', 'Développement d’applications']],
  ['ai-data-sciences', ['AI and data science', 'IA et science des données']],
  ['cyber-security', ['Cybersecurity', 'Cybersécurité']],
  ['collaboration-solutions', ['Collaboration tools', 'Outils collaboratifs']],
  ['blockchain-nft', ['Blockchain and NFT', 'Blockchain et NFT']],
  ['support', ['IT support', 'Assistance informatique']],
  ['insight-updates', ['Research updates', 'Actualités et études']],
  ['ai-enterprise-solutions', ['Brief on enterprise AI', 'Note sur l’IA en entreprise']],
  ['cybersecurity-practices', ['Brief on cybersecurity practices', 'Note sur la cybersécurité']],
  ['cloud-computing-strategy', ['Brief on cloud strategy', 'Note sur la stratégie cloud']],
  ['digital-transformation-success-stories', ['Digital transformation projects', 'Projets de transformation numérique']],
  ['machine-learning-business-intelligence', ['Machine learning and reporting', 'Apprentissage automatique et reporting']],
  ['software-development-methodologies', ['Software development methods', 'Méthodes de développement logiciel']],
]);

function updateEnquirySubject(lang) {
  const subject = document.querySelector('#contactForm [name="subject"]');
  const topic = new URLSearchParams(location.search).get('topic');
  const labels = enquiryTopics.get(topic);
  if (!subject || !labels || subject.value !== subject.defaultValue) return;
  subject.defaultValue = labels[lang === 'fr' ? 1 : 0];
}

const projectQuestions = new Map([
  ['app-development', ['Which workflow should the application support, and who will use it?', 'Quel processus l’application doit-elle prendre en charge et qui l’utilisera ?']],
  ['ai-data-sciences', ['What decision or task should the pilot improve? Which data is available?', 'Quelle décision ou tâche le pilote doit-il améliorer ? De quelles données disposez-vous ?']],
  ['cyber-security', ['Which systems should the review cover, and what decision will it inform?', 'Quels systèmes la revue doit-elle couvrir et quelle décision doit-elle éclairer ?']],
  ['collaboration-solutions', ['Which tools do you use today and which teams would move first?', 'Quels outils utilisez-vous et quelles équipes participeraient à la première phase ?']],
  ['blockchain-nft', ['What needs to be traced, and which organisations need to verify it?', 'Que souhaitez-vous retracer et quels organismes doivent pouvoir le vérifier ?']],
  ['support', ['Which applications need support and during which hours?', 'Quelles applications nécessitent une assistance et sur quelles plages horaires ?']],
]);

function updateMessageHint(lang) {
  const hint = document.getElementById('message-hint');
  const questions = projectQuestions.get(new URLSearchParams(location.search).get('topic'));
  if (hint && questions) {
    hint.querySelector(`[data-lang-${lang}]`).textContent = questions[lang === 'fr' ? 1 : 0];
  }
}

function setupEnquiryRecovery(form) {
  const recovery = form.querySelector('#delivery-recovery');
  if (!recovery) return;
  const manual = recovery.querySelector('.manual-copy');
  const status = recovery.querySelector('.copy-status');
  const field = manual.querySelector('textarea');
  recovery.querySelector('button').addEventListener('click', async () => {
    const content = ['subject', 'message', 'name', 'email', 'phone', 'company']
      .map(name => form.elements.namedItem(name).value.trim()).filter(Boolean).join('\n\n');
    try {
      await navigator.clipboard.writeText(content);
      status.textContent = document.documentElement.lang === 'fr' ? 'Demande copiée.' : 'Enquiry copied.';
    } catch {
      manual.hidden = false;
      field.value = content;
      field.focus();
      field.select();
    }
  });
  function clearCopy() {
    manual.hidden = true;
    field.value = '';
    status.textContent = '';
  }
  form.addEventListener('input', clearCopy);
  form.addEventListener('reset', clearCopy);
}

function setupContactForm() {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) {
    return;
  }

  setupEnquiryRecovery(contactForm);
  contactForm.addEventListener('input', event => event.target.setCustomValidity?.(''));
  let sending = false;
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (sending) return;
    for (const field of contactForm.querySelectorAll('[required]')) {
      if (field.type !== 'checkbox' && !field.value.trim()) {
        field.setCustomValidity(document.documentElement.lang === 'fr'
          ? 'Veuillez renseigner ce champ.' : 'Please complete this field.');
      }
    }
    if (!contactForm.reportValidity()) return;

    sending = true;
    const formData = new FormData(contactForm);
    const submitButtons = contactForm.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => { button.disabled = true; });
    contactForm.setAttribute('aria-busy', 'true');
    showFormMessage(contactForm, document.documentElement.lang === 'fr'
      ? 'Envoi en cours…' : 'Sending…', 'pending');

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        signal: controller.signal,
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
        const topic = new URLSearchParams(location.search).get('topic');
        contactForm.dispatchEvent(new CustomEvent('enquiry-sent', {
          bubbles: true,
          detail: enquiryTopics.has(topic) ? topic : 'general',
        }));
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
          ? 'Envoi non confirmé. Votre texte est conservé. Vous pouvez réessayer ou nous écrire par courriel.'
          : 'Delivery is unconfirmed. Your text is still here. You can retry or contact us by email.',
        'error'
      );
    } finally {
      window.clearTimeout(timeout);
      sending = false;
      contactForm.removeAttribute('aria-busy');
      submitButtons.forEach(button => { button.disabled = false; });
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

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('awaiting-reveal');
          observer.unobserve(entry.target);
        }
      });
    });
    animateElements.forEach(element => {
      element.classList.add('awaiting-reveal');
      observer.observe(element);
    });
  }

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
    if (!heroSection || !heroImage || motion.matches) {
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

    answer.id ||= 'faq-answer-' + Array.from(faqItems).indexOf(item);
    question.setAttribute('aria-controls', answer.id);
    question.setAttribute('aria-expanded', String(item.classList.contains('active')));
    answer.hidden = !item.classList.contains('active');
    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');

    const toggleItem = () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) {
            otherAnswer.hidden = true;
            otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          }
        }
      });

      item.classList.toggle('active', !isActive);
      question.setAttribute('aria-expanded', String(!isActive));
      answer.hidden = isActive;
      answer.style.maxHeight = isActive ? '0' : 'none';
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
    button.classList.toggle('active', button.dataset.filter === 'all');
    button.setAttribute('aria-pressed', String(button.dataset.filter === 'all'));
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter');


      filterButtons.forEach((candidate) => {
        const selected = candidate.dataset.filter === filter;
        candidate.classList.toggle('active', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      });

      blogCards.forEach((card) => {
        const matches = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !matches;
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
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
