"""Browser checks for budgeting tools, language continuity and sales intake."""

from email import message_from_bytes
from urllib.parse import urlsplit

from playwright.sync_api import expect


def exercise_buying_guides(browser, origin):
    context = browser.new_context(locale="en-GB", viewport={"width": 390, "height": 844})
    context.add_cookies([dict(name="skylar_cookie_consent", value="accepted", url=origin)])
    page = context.new_page()
    page.route("**/*", lambda route: route.continue_()
               if urlsplit(route.request.url).hostname == "127.0.0.1" else route.abort())
    try:
        page.goto(origin + "/services/ai-data-sciences.html?lang=fr")
        page.get_by_role("link", name="Estimer la valeur d’un pilote").click()
        result = page.locator("#estimate-result")
        expect(result.locator("dd").nth(0)).to_have_text("40")
        expect(result.locator("dd").last).to_have_text("4 mois")
        page.get_by_role("button", name="Switch to English").click()
        expect(result.locator("dd").last).to_have_text("4 months")
        # Ask the browser for its own number format (ICU differs across platforms).
        currency = page.evaluate("""() => new Intl.NumberFormat('en-BE',
            {style:'currency', currency:'EUR'}).format(12000)""")
        expect(result.locator("dd").nth(2)).to_have_text(currency)
        page.get_by_role("spinbutton", name="Cases per month", exact=True).fill("0")
        expect(result).to_contain_text("Setup cost is not recovered")
        page.locator("#estimate-running").fill("0")
        expect(result).to_contain_text("Setup cost is not recovered")
        page.locator("#estimate-setup").fill("0")
        expect(result).to_contain_text("No setup cost")
        page.locator("#estimate-cases").fill("-1")
        expect(result.locator("dd")).to_have_count(0)
        page.locator("#estimate-cases").fill("")
        expect(result).to_contain_text("Check all five")
        page.locator("#estimate-cases").fill("200")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        share = page.locator('.guide-sharing:visible a[href^="mailto:"]')
        share.evaluate("a => { a.addEventListener('click', e => e.preventDefault()); a.click(); }")
        assert not page.evaluate("window.dataLayer.some(e => e.event === 'contact_channel_click')")
        page.evaluate("window.print = () => {window.printRequested = true}")
        page.get_by_role("button", name="Print or save this guide as PDF").click()
        assert page.evaluate("window.printRequested")
        page.emulate_media(media="print")
        expect(result).to_be_visible()
        expect(page.locator(".guide-print")).to_be_hidden()
        expect(page.locator("body > .header")).to_be_hidden()
        page.emulate_media(media="screen")

        page.goto(origin + "/services/collaboration-solutions.html?lang=fr")
        page.get_by_role("link", name="Chiffrer une migration vers Microsoft 365").click()
        expect(page.locator("article")).to_contain_text("15 800 €")
        page.get_by_role("link", name="Préparer un plan de migration").click()
        expect(page.locator("#subject")).to_have_value("Migration vers Microsoft 365")
        expect(page.locator("#enquiry-service")).to_be_hidden()

        page.goto(origin + "/contact.html?topic=consultation&lang=fr")
        service = page.get_by_role("combobox", name="Service souhaité (facultatif)", exact=True)
        expect(service.locator("option")).to_have_count(7)
        service.select_option("support")
        expect(page.locator("#subject")).to_have_value("Assistance informatique")
        expect(page.locator("#message-hint [data-lang-fr]")).to_contain_text("plages horaires")
        service.select_option("")
        expect(page.locator("#message-hint [data-lang-fr]")).to_contain_text("échéance")
        expect(page.locator("#subject")).to_have_value("Échange sur un projet")
        service.select_option("app-development")
        page.locator("#subject").fill("My scoped project")
        page.locator('button[data-lang="en"]').click()
        expect(page.locator("#subject")).to_have_value("My scoped project")
        expect(page.locator("#enquiry-service")).to_have_value("app-development")
        page.locator("#name").fill("Example")
        page.locator("#email").fill("client@example.invalid")
        page.locator("#message").fill("Project details")
        page.locator("#privacy").check()
        pending = []
        page.route("https://formspree.io/**", lambda route: pending.append(route))
        page.locator("button[type=submit]:visible").click()
        expect(page.locator("#contactForm")).to_have_attribute("aria-busy", "true")
        page.locator('button[data-lang="fr"]').click()
        request = pending[0].request
        content_type = request.headers["content-type"]
        payload = message_from_bytes(f"Content-Type: {content_type}\r\n\r\n".encode()
                                     + request.post_data_buffer)
        fields = {part.get_param("name", header="content-disposition"): part.get_payload(decode=True)
                  for part in payload.get_payload()}
        assert fields["topic"] == b"app-development" and fields["reply_language"] == b"en"
        assert fields["subject"] == b"My scoped project" and "article" not in fields
        pending[0].fulfill(json={"ok": True})
        expect(page.locator("#formMessage")).to_contain_text("Merci")
        expect(page.locator("#subject")).to_have_value("Échange sur un projet")
        assert page.evaluate("window.dataLayer.find(e => e.event === 'generate_lead').language") == "en"

        page.goto(origin + "/privacy-policy.html")
        for href in ["mailto:privacy@skylar-solutions.com", "mailto:admin@skylar-solutions.com"]:
            anchor = page.locator(f'a[href="{href}"]').first
            anchor.evaluate("a => { a.addEventListener('click', e => e.preventDefault()); a.click(); }")
        assert page.evaluate("window.dataLayer.filter(e => e.event === 'contact_channel_click').length") == 1

        page.add_init_script("""Object.defineProperty(window, 'localStorage', {
          get() { throw new DOMException('Storage unavailable', 'SecurityError'); }
        })""")
        page.goto(origin + "/index.html?lang=fr")
        page.get_by_role("link", name="Découvrir l’équipe").click()
        expect(page.get_by_role("heading", name="Notre équipe de direction")).to_be_visible()
        assert urlsplit(page.url).fragment == "team"
        assert page.locator(".member-bio:visible").first.inner_text().startswith("Arthur pilote")
        page.get_by_role("link", name="Présenter mon projet").click()
        expect(page.locator("html")).to_have_attribute("lang", "fr")
        expect(page.locator("#subject")).to_have_value("Échange sur un projet")
        page.goto(origin + "/en/index.html")
        expect(page.locator("html")).to_have_attribute("lang", "en")
        expect(page.get_by_role("heading", level=1)).to_have_text("AI, data and software for regulated teams")
    finally:
        context.close()
