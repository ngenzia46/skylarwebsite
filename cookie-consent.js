/**
 * Cookie consent and analytics bootstrap.
 * Optional tracking only loads after an explicit accept action.
 */

(function cookieConsentManager() {
  'use strict';

  const COOKIE_NAME = 'skylar_cookie_consent';
  const COOKIE_EXPIRY_DAYS = 365;
  const GTM_ID = 'GTM-WLX4WF3M';
  const CONSENT_VALUES = new Set(['accepted', 'declined']);
  let gtmLoaded = false;

  function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  }

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    const secureFlag = window.location.protocol === 'https:' ? ';Secure' : '';
    document.cookie =
      `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Lax${secureFlag}`;
  }

  function getStoredConsent() {
    const value = getCookie(COOKIE_NAME);
    return CONSENT_VALUES.has(value) ? value : null;
  }

  function getPrivacyPageUrl() {
    return window.location.pathname.includes('/services/')
      ? '../privacy-policy.html'
      : 'privacy-policy.html';
  }

  function getBannerCopy(lang) {
    if (lang === 'fr') {
      return {
        message:
          'Nous utilisons des cookies essentiels pour faire fonctionner le site et des cookies analytiques uniquement avec votre consentement.',
        learnMore: 'Politique de confidentialité',
        label: 'Choix des cookies',
        settings: 'Voir la politique',
        decline: 'Refuser',
        accept: 'Accepter',
      };
    }

    return {
      message:
        'We use essential cookies to run the site and analytics cookies only when you explicitly consent.',
      learnMore: 'Privacy Policy',
      label: 'Cookie choices',
      settings: 'View policy',
      decline: 'Decline',
      accept: 'Accept',
    };
  }

  function ensureBanner() {
    let banner = document.getElementById('cookieConsent');

    if (banner) {
      return banner;
    }

    banner = document.createElement('div');
    banner.id = 'cookieConsent';
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-consent-text">
          <p id="cookieConsentMessage"></p>
        </div>
        <div class="cookie-consent-buttons">
          <button id="cookieSettings" class="cookie-consent-btn cookie-consent-decline" type="button"></button>
          <button id="cookieDecline" class="cookie-consent-btn cookie-consent-decline" type="button"></button>
          <button id="cookieAccept" class="cookie-consent-btn cookie-consent-accept" type="button"></button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    return banner;
  }

  function updateBannerCopy() {
    const lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
    const copy = getBannerCopy(lang);
    document.getElementById('cookieConsent').setAttribute('aria-label', copy.label);
    const message = document.getElementById('cookieConsentMessage');
    const settingsButton = document.getElementById('cookieSettings');
    const declineButton = document.getElementById('cookieDecline');
    const acceptButton = document.getElementById('cookieAccept');

    if (message) {
      message.innerHTML = `${copy.message} <a href="${getPrivacyPageUrl()}#cookies">${copy.learnMore}</a>.`;
    }

    if (settingsButton) {
      settingsButton.textContent = copy.settings;
    }

    if (declineButton) {
      declineButton.textContent = copy.decline;
    }

    if (acceptButton) {
      acceptButton.textContent = copy.accept;
    }
  }

  function showBanner() {
    const banner = ensureBanner();
    updateBannerCopy();
    banner.classList.add('show');
  }

  function hideBanner() {
    const banner = document.getElementById('cookieConsent');
    if (banner) {
      banner.classList.remove('show');
    }
  }

  function loadTagManager() {
    if (gtmLoaded || !GTM_ID) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    script.dataset.cookieManaged = 'true';
    document.head.appendChild(script);

    gtmLoaded = true;
  }

  const preferences = () => document.getElementById('manage-cookies');
  let openedFromSettings = false;

  function finishChoice() {
    hideBanner();
    if (openedFromSettings) preferences()?.focus();
    openedFromSettings = false;
  }

  function acceptCookies() {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_EXPIRY_DAYS);
    loadTagManager();
    finishChoice();
  }

  function declineCookies() {
    setCookie(COOKIE_NAME, 'declined', COOKIE_EXPIRY_DAYS);
    finishChoice();
    if (gtmLoaded) window.location.reload();
  }

  function openPolicy() {
    window.location.href = `${getPrivacyPageUrl()}#cookies`;
  }

  function bindEvents() {
    const acceptButton = document.getElementById('cookieAccept');
    const declineButton = document.getElementById('cookieDecline');
    const settingsButton = document.getElementById('cookieSettings');

    if (acceptButton) {
      acceptButton.addEventListener('click', acceptCookies);
    }

    if (declineButton) {
      declineButton.addEventListener('click', declineCookies);
    }

    if (settingsButton) {
      settingsButton.addEventListener('click', openPolicy);
    }
  }

  function init() {
    ensureBanner();
    updateBannerCopy();
    bindEvents();
    preferences()?.addEventListener('click', () => {
      openedFromSettings = true;
      showBanner();
      document.getElementById('cookieDecline').focus();
    });

    // Only fixed event names and channel labels are sent. Never read form values here.
    let started = false;
    document.getElementById('contactForm')?.addEventListener('input', () => {
      if (!started && getStoredConsent() === 'accepted' && gtmLoaded) {
        window.dataLayer.push({ event: 'enquiry_start', language: document.documentElement.lang });
        started = true;
      }
    });
    const salesEmails = new Set([
      'admin@skylar-solutions.com', 'ngenzi@skylar-solutions.com', 'esele@skylar-solutions.com',
    ]);
    const salesPhones = new Set(['+3210250018', '+32474690382']);
    document.addEventListener('click', event => {
      if (getStoredConsent() !== 'accepted' || !gtmLoaded) return;
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      let channel;
      if (link.protocol === 'tel:' && salesPhones.has(link.pathname)) channel = 'phone';
      if (link.protocol === 'mailto:' && salesEmails.has(link.pathname.toLowerCase())) channel = 'email';
      if (link.origin === 'https://wa.me' && link.pathname === '/32474690382') channel = 'whatsapp';
      if (channel) window.dataLayer.push({
        event: 'contact_channel_click', contact_channel: channel, language: document.documentElement.lang,
      });
    });
    document.addEventListener('enquiry-sent', event => {
      if (getStoredConsent() === 'accepted' && gtmLoaded) {
        window.dataLayer.push({
          event: 'generate_lead',
          enquiry_topic: event.detail.topic,
          ...(event.detail.edition && { enquiry_edition: event.detail.edition }),
          language: event.detail.language,
        });
      }
    });

    const observer = new MutationObserver(() => {
      updateBannerCopy();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });

    const consent = getStoredConsent();

    if (consent === 'accepted') {
      loadTagManager();
      hideBanner();
      return;
    }

    if (consent === 'declined') {
      hideBanner();
      return;
    }

    window.setTimeout(showBanner, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
