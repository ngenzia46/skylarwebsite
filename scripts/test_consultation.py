"""Browser coverage for the commercial contact paths and consent choices."""

from urllib.parse import urlsplit

from playwright.sync_api import expect


def exercise_consultation(browser, origin):
    context = browser.new_context(locale="fr-BE", viewport={"width": 390, "height": 844})
    page = context.new_page()
    external = []

    def intercept(route):
        if urlsplit(route.request.url).hostname == "127.0.0.1":
            route.continue_()
        else:
            external.append(route.request.url)
            route.abort()

    page.route("**/*", intercept)
    try:
        services = [
            "app-development", "ai-data-sciences", "cyber-security",
            "collaboration-solutions", "blockchain-nft", "support",
        ]
        for topic in services:
            page.goto(f"{origin}/services/{topic}.html")
            expect(page.locator("html")).to_have_attribute("lang", "fr")
            cta = page.locator(".page-hero .service-enquiry")
            expect(cta).to_have_attribute("href", f"../contact.html?topic={topic}#enquiry")
            expect(cta.locator("[data-lang-fr]")).to_be_visible()
            expect(page.locator("footer a[href='tel:+3210250018']")).to_be_visible()

        page.locator("#cookieDecline").click()
        cta.click()
        expect(page.locator("#subject")).to_have_value("Assistance informatique")
        expect(page.locator("#message-hint")).to_contain_text("plages horaires")
        expect(page.locator("#phone")).to_be_hidden()
        page.locator("summary").click()
        page.locator("#phone").fill("012345")
        page.locator("#email").fill("prospect@example.invalid")
        page.locator("#name").fill("A. Prospect")
        page.locator("#message").fill("Projet pilote")
        page.locator("#privacy").check()
        page.route("https://formspree.io/**", lambda route: route.fulfill(status=503, json={}))
        page.locator("button[type=submit]:visible").click()
        expect(page.locator("#delivery-recovery")).to_be_visible()
        # Exercise the fallback on devices that deny clipboard access.
        page.evaluate("Object.defineProperty(navigator, 'clipboard', {value: undefined})")
        page.locator(".copy-enquiry").click()
        copied = page.locator("#enquiry-copy")
        expect(copied).to_be_focused()
        assert "Projet pilote" in copied.input_value() and "012345" in copied.input_value()
        expect(page.locator("a[href='https://wa.me/32474690382']")).to_be_visible()
        expect(page.locator("a[href*='maps/dir/']")).to_be_visible()
        assert not any("google.com/maps" in request for request in external)
        assert not page.evaluate("window.dataLayer")

        page.goto(origin + "/privacy-policy.html#cookies")
        settings = page.get_by_role("button", name="Modifier mes préférences")
        settings.click()
        page.locator("#cookieAccept").click()
        expect(settings).to_be_focused()
        page.goto(origin + "/contact.html")
        page.locator("#name").fill("Do not measure this name")
        page.locator("#email").fill("private@example.invalid")
        page.locator("#message").fill("Private scope")
        page.locator("#privacy").check()
        # Keep the test inside the browser while exercising the real click handler.
        wa = page.locator("a[href='https://wa.me/32474690382']")
        wa.evaluate("a => a.addEventListener('click', event => event.preventDefault())")
        wa.click()
        page.route("https://formspree.io/**", lambda route: route.fulfill(json={"ok": True}))
        page.locator("button[type=submit]:visible").click()
        expect(page.locator("#formMessage")).to_contain_text("Merci")
        expect(page.locator("#delivery-recovery")).to_be_hidden()
        business_events = page.evaluate("window.dataLayer.filter(entry => entry.event !== 'gtm.js')")
        assert business_events == [
            {"event": "enquiry_start", "language": "fr"},
            {"event": "contact_channel_click", "contact_channel": "whatsapp", "language": "fr"},
            {"event": "generate_lead", "enquiry_topic": "general", "language": "fr"},
        ], business_events
        page.goto(origin + "/privacy-policy.html#cookies")
        settings.click()
        with page.expect_navigation():
            page.locator("#cookieDecline").click()
        assert not page.evaluate("window.dataLayer")
        assert not page.locator("script[data-cookie-managed]").count()

        # GitHub Pages serves 404.html at the original (possibly nested) URL.
        missing = origin + "/old/services/missing"
        not_found = page.request.get(origin + "/404.html").text()
        page.route(missing, lambda route: route.fulfill(
            status=404, content_type="text/html", body=not_found
        ))
        response = page.goto(missing)
        assert response.status == 404
        expect(page.get_by_role("heading", name="Page introuvable")).to_be_visible()
        page.get_by_role("link", name="Présenter un projet").click()
        expect(page).to_have_url(origin + "/contact.html#enquiry")
    finally:
        context.close()
