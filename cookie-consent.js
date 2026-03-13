/**
 * Cookie Consent Management
 * GDPR-compliant cookie consent banner
 */

(function() {
    'use strict';

    const COOKIE_NAME = 'skylar_cookie_consent';
    const COOKIE_EXPIRY_DAYS = 365;

    // Check if consent was already given
    function hasConsent() {
        return getCookie(COOKIE_NAME) !== null;
    }

    // Get cookie value
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    // Set cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = 'expires=' + date.toUTCString();
        document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
    }

    // Show the cookie banner
    function showBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.add('show');
        }
    }

    // Hide the cookie banner
    function hideBanner() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.remove('show');
        }
    }

    // Accept all cookies
    function acceptCookies() {
        setCookie(COOKIE_NAME, 'accepted', COOKIE_EXPIRY_DAYS);
        hideBanner();
        // Enable analytics/tracking if needed
        enableAnalytics();
    }

    // Decline cookies (essential only)
    function declineCookies() {
        setCookie(COOKIE_NAME, 'declined', COOKIE_EXPIRY_DAYS);
        hideBanner();
    }

    // Enable analytics (placeholder for Google Analytics, etc.)
    function enableAnalytics() {
        // If you have Google Analytics or other tracking scripts,
        // initialize them here after consent is given
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted'
            });
        }
    }

    // Show cookie settings modal (simplified - just declines)
    function showSettings() {
        // For a simple implementation, settings just declines non-essential cookies
        declineCookies();
    }

    // Initialize cookie consent
    function init() {
        // If no consent recorded, show the banner
        if (!hasConsent()) {
            // Small delay to let the page render first
            setTimeout(showBanner, 500);
        } else {
            // If previously accepted, enable analytics
            if (getCookie(COOKIE_NAME) === 'accepted') {
                enableAnalytics();
            }
        }

        // Set up event listeners
        const acceptBtn = document.getElementById('cookieAccept');
        const settingsBtn = document.getElementById('cookieSettings');
        const declineBtn = document.getElementById('cookieDecline');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', acceptCookies);
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', showSettings);
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', declineCookies);
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
