#!/usr/bin/env python3
"""Static validation checks for the public Skylar Solutions site."""

from __future__ import annotations

import re
import sys
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

            resolved = (path.parent / target.split("#", 1)[0].split("?", 1)[0]).resolve()
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

    if issues:
        print("Site validation failed:\n")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("Site validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
