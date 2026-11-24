"""Exercise archived advice, service discovery and attributed project enquiries."""

from urllib.parse import parse_qs, urlsplit

from playwright.sync_api import expect


def exercise_buyers(browser, origin):
    context = browser.new_context(locale="en-GB", viewport={"width": 390, "height": 844})
    context.add_cookies([dict(name="skylar_cookie_consent", value="accepted", url=origin)])
    page = context.new_page()
    page.route("**/*", lambda route: route.continue_()
               if urlsplit(route.request.url).hostname == "127.0.0.1" else route.abort())
    try:
        page.goto(origin + "/blog.html?lang=fr")
        query = page.get_by_role("searchbox", name="Rechercher dans les articles")
        query.fill("cote ivoire")
        expect(page.locator(".blog-card:visible")).to_have_count(1)
        expect(page.locator("#archive-count")).to_have_text("1 article")
        page.locator('[data-filter="security"]:visible').click()
        expect(page.locator("#archive-count")).to_have_text("Aucun article trouvé.")
        page.get_by_role("button", name="Effacer la recherche et les filtres").click()
        expect(query).to_be_focused()
        expect(page.locator(".blog-card:visible")).to_have_count(page.locator(".blog-card").count())
        for slug in ("odoo-mistakes", "blockchain-enterprise", "it-support-strategy"):
            link = page.locator(f'h2 a[href="blog-{slug}.html"]')
            expect(link.locator("[data-lang-fr]")).to_be_visible()
            link.click()
            expect(page.locator("article div[lang=fr] h2").first).to_be_visible()
            page.locator('button[data-lang="en"]').click()
            expect(page.locator("article div[lang=en] h2").first).to_be_visible()
            assert parse_qs(urlsplit(page.url).query)["lang"] == ["en"]
            page.goto(origin + "/blog.html?lang=fr")

        page.goto(origin + "/services/ai-data-sciences.html?lang=fr")
        page.get_by_role("link", name="Rapprochement des paiements M-PESA au Kenya").click()
        page.locator('article a[href*="edition="]').click()
        expect(page.locator("#subject")).to_have_value("Rapprochement des paiements M-PESA")
        page.locator('button[data-lang="en"]').click()
        expect(page.locator("#subject")).to_have_value("M-PESA reconciliation")
        params = parse_qs(urlsplit(page.url).query)
        assert params["topic"] == ["ai-data-sciences"] and params["lang"] == ["en"]
        assert urlsplit(page.url).fragment == "enquiry"

        page.locator("#name").fill("Example")
        page.locator("#email").fill("prospect@example.invalid")
        page.locator("#message").fill("Original scope")
        page.locator("#privacy").check()
        pending = []
        page.route("https://formspree.io/**", lambda route: pending.append(route))
        page.locator("button[type=submit]:visible").click()
        expect(page.locator("#contactForm")).to_have_attribute("aria-busy", "true")
        page.locator("#message").fill("Updated scope")
        assert len(pending) == 1
        body = pending[0].request.post_data_buffer
        assert b'kenya-mpesa-reconciliation' in body and b'Original scope' in body
        assert b'Updated scope' not in body
        pending[0].fulfill(json={"ok": True})
        expect(page.locator("#formMessage")).to_contain_text("later edits")
        expect(page.locator("#message")).to_have_value("Updated scope")
        events = page.evaluate("window.dataLayer.filter(e => e.event === 'generate_lead')")
        assert events == [{"event": "generate_lead", "language": "en",
                           "enquiry_topic": "ai-data-sciences",
                           "enquiry_edition": "kenya-mpesa-reconciliation"}]
        page.goto(origin + "/contact.html?topic=support&edition=kenya-mpesa-reconciliation&lang=en")
        expect(page.locator("#subject")).to_have_value("IT support")
        page.goto(origin + "/contact.html?lang=unsupported&topic=unknown&edition=private-text")
        expect(page.locator("#subject")).to_have_value("")
        expect(page.locator("html")).to_have_attribute("lang", "en")
    finally:
        context.close()
