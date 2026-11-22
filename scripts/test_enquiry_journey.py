"""Run with Playwright and Chromium installed. Uses only local site content."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse

from playwright.sync_api import expect, sync_playwright


def exercise(browser, origin):
    page = browser.new_page(locale="en-GB")
    page.route("**/*", lambda route: route.continue_()
               if urlparse(route.request.url).hostname == "127.0.0.1"
               else route.abort())
    page.context.add_cookies([dict(name="skylar_cookie_consent", value="declined", url=origin)])
    page.goto(origin + "/blog-odoo-mistakes.html")
    page.locator("article .cta-section a").click()
    expect(page.locator("#subject")).to_have_value("Odoo implementation")
    page.locator('button[data-lang="fr"]').click()
    expect(page.locator("#subject")).to_have_value("Mise en place d’Odoo")
    page.locator("#subject").fill("Mon projet")
    page.locator('button[data-lang="en"]').click()
    expect(page.locator("#subject")).to_have_value("Mon projet")
    page.locator("#name").fill("   ")
    page.locator("#email").fill("test@example.com")
    page.locator("#message").fill("Project requirements")
    page.locator("#privacy").check()
    submit = page.locator('button[type="submit"]:visible')
    submit.click()
    expect(page.locator("#name")).to_be_focused()
    page.locator("#name").fill("Test")
    submit.click()
    expect(page.locator("#formMessage")).to_contain_text("Delivery is unconfirmed")
    expect(page.locator("#message")).to_have_value("Project requirements")
    page.route("https://formspree.io/**", lambda route: route.fulfill(json={"ok": True}))
    submit.click()
    expect(page.locator("#formMessage")).to_contain_text("Thank you")
    expect(page.locator("#message")).to_have_value("")
    expect(submit).to_be_enabled()
    questions = page.locator(".faq-question")
    questions.first.press("Enter")
    expect(questions.first).to_have_attribute("aria-expanded", "true")
    questions.nth(1).press("Space")
    expect(questions.first).to_have_attribute("aria-expanded", "false")
    expect(page.locator(".faq-answer").nth(1)).to_be_visible()
    page.goto(origin + "/blog.html")
    page.locator('[data-filter="ai"]:visible').click()
    assert page.locator('.blog-card:visible').count() == page.locator('.blog-card[data-category="ai"]').count()
    page.locator('button[data-lang="fr"]').click()
    expect(page.locator('[data-filter="ai"]:visible')).to_have_attribute("aria-pressed", "true")
    page.locator('[data-filter="all"]:visible').click()
    assert page.locator('.blog-card:visible').count() == page.locator('.blog-card').count()
    page.close()


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server, sync_playwright() as playwright:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = playwright.chromium.launch()
        try:
            exercise(browser, f"http://127.0.0.1:{server.server_port}")
            print("Enquiry journey passed")
        finally:
            browser.close()
            server.shutdown()
