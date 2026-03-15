# Skylar Solutions Production Checklist

## Before each release
- Run `python3 scripts/validate_site.py`.
- Confirm the contact form submits successfully through Formspree in both English and French.
- Verify cookie consent appears on first load, declines cleanly, and only loads analytics after acceptance.
- Smoke test navigation, language switching, FAQ toggles, blog filters, and back-to-top behavior on desktop and mobile widths.

## Hosting and domain
- Confirm `CNAME`, DNS, and TLS certificate all point to the live production host.
- Ensure Brotli or gzip compression is enabled for HTML, CSS, JS, SVG, and JSON.
- Serve long cache headers for versioned static assets and short cache headers for HTML.

## Security headers
- Configure `Content-Security-Policy` with only the domains the site currently needs.
- Enable `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- If the current host cannot set these headers, front the site with a host or CDN layer that can.

## SEO and analytics
- Rebuild and re-upload `sitemap.xml` if page URLs change.
- Confirm `robots.txt` references the live sitemap location.
- Verify canonical URLs, social tags, and translated page titles on all public pages.
- Review Lighthouse CI output for regressions before shipping.
