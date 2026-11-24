#!/usr/bin/env python3
"""Static validation checks for the public Skylar Solutions site."""

from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PAGES = [
    ROOT / "index.html",
    ROOT / "about.html",
    ROOT / "blog.html",
    ROOT / "contact.html",
    ROOT / "careers.html",
    ROOT / "privacy-policy.html",
    ROOT / "terms.html",
    ROOT / "services" / "services.html",
    ROOT / "services" / "app-development.html",
    ROOT / "services" / "ai-data-sciences.html",
    ROOT / "services" / "cyber-security.html",
    ROOT / "services" / "collaboration-solutions.html",
    ROOT / "services" / "blockchain-nft.html",
    ROOT / "services" / "support.html",
]
HTML_EXCLUSIONS = {
    ROOT / "services" / "service-template.html",
    ROOT / "services" / "service-footer-template.html",
}


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def check_internal_links() -> list[str]:
    issues: list[str] = []

    for path in ROOT.rglob("*.html"):
        if path in HTML_EXCLUSIONS or ".git" in path.parts:
            continue

        text = read_text(path)

        for match in re.finditer(r"""(?:href|src)=['"]([^'"]+)['"]""", text):
            target = match.group(1)
            if target.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "#", "data:")):
                continue

            asset = target.split("#", 1)[0].split("?", 1)[0]
            base = ROOT if asset.startswith("/") else path.parent
            resolved = (base / asset.lstrip("/")).resolve()
            if not resolved.exists():
                issues.append(f"{path.relative_to(ROOT)} -> missing asset/link target: {target}")

    return issues


def check_public_pages() -> list[str]:
    issues: list[str] = []

    for path in PUBLIC_PAGES:
        text = read_text(path)
        rel = path.relative_to(ROOT)

        has_language_buttons = (
            re.search(r'<button[^>]+data-lang="en"', text) is not None
            and re.search(r'<button[^>]+data-lang="fr"', text) is not None
        )

        expectations = {
            "canonical link": 'rel="canonical"' in text,
            "cookie consent stylesheet": "cookie-consent.css" in text,
            "cookie consent script": "cookie-consent.js" in text,
            "language switcher buttons": has_language_buttons,
            "deferred shared script": re.search(r'<script src="(?:\.\./)?script\.js" defer', text)
            is not None,
            "translated title metadata": "data-title-en" in text and "data-title-fr" in text,
        }

        for label, ok in expectations.items():
            if not ok:
                issues.append(f"{rel} -> missing {label}")

        disallowed = {
            "placeholder analytics": "G-XXXXXXXXXX",
            "hardcoded GTM bootstrap": "GTM-WLX4WF3M",
            "hash-based language toggle": 'href="#" data-lang="',
            "hardcoded cookie banner": 'id="cookieConsent"',
        }

        for label, marker in disallowed.items():
            if marker in text:
                issues.append(f"{rel} -> contains {label}")

    return issues


def check_search_urls() -> list[str]:
    origin = "https://" + read_text(ROOT / "CNAME").strip()
    expected = set()
    issues = []
    for page in [*PUBLIC_PAGES, *ROOT.glob("blog-*.html")]:
        path = "" if page == ROOT / "index.html" else page.relative_to(ROOT).as_posix()
        url = f"{origin}/{path}"
        expected.add(url)
        markup = read_text(page)
        if f'rel="canonical" href="{url}"' not in markup:
            issues.append(f"{page.name} -> expected canonical URL {url}")

        if page.parent == ROOT / "services":
            for name in ("og:type", "og:title", "og:description", "og:image"):
                if f'property="{name}" content="' not in markup:
                    issues.append(f"{page.name} -> missing {name} for service sharing")
            if f'property="og:url" content="{url}"' not in markup:
                issues.append(f"{page.name} -> social preview URL differs from canonical")
        for target in re.findall(re.escape(origin) + r'(/[^"\s<>]*?\.html)', markup):
            if not (ROOT / target.lstrip("/")).is_file():
                issues.append(f"{page.name} -> missing production page {target}")

    locations = {node.text for node in ET.parse(ROOT / "sitemap.xml").iterfind(".//{*}loc")}
    if locations != expected:
        issues.append("sitemap.xml -> URLs differ from the configured public pages")
    if f"Sitemap: {origin}/sitemap.xml" not in read_text(ROOT / "robots.txt").splitlines():
        issues.append("robots.txt -> sitemap URL differs from configured domain")
    return issues


def check_redirect_page() -> list[str]:
    issues: list[str] = []
    redirect_page = ROOT / "en" / "index.html"
    text = read_text(redirect_page)

    if "../index.html" not in text:
        issues.append("en/index.html -> expected redirect to ../index.html")

    return issues


def main() -> int:
    issues = []
    issues.extend(check_internal_links())
    issues.extend(check_public_pages())
    issues.extend(check_redirect_page())
    issues.extend(check_search_urls())

    if issues:
        print("Site validation failed:\n")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("Site validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
