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
    return match ? decodeURIComponent(match[2]) : null;
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
        learnMore: 'Politique de Confidentialite',
        settings: 'Voir la politique',
        decline: 'Refuser',
        accept: 'Accepter',
      };
    }

    return {
      message:
        'We use essential cookies to run the site and analytics cookies only when you explicitly consent.',
      learnMore: 'Privacy Policy',
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

  function acceptCookies() {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_EXPIRY_DAYS);
    loadTagManager();
    hideBanner();
  }

  function declineCookies() {
    setCookie(COOKIE_NAME, 'declined', COOKIE_EXPIRY_DAYS);
    hideBanner();
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
