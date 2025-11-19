from playwright.sync_api import Page, expect, sync_playwright

def test_mobile_controls(page: Page):
    # 1. Arrange: Go to the Play page
    # Note: ::1:5173 suggests it's listening on IPv6, but localhost usually resolves to it.
    # Vite usually starts on 5173.
    page.goto("http://localhost:5173/play")

    # 2. Wait for canvas to load (game client loader)
    page.wait_for_selector("canvas")

    # 3. Check if Mobile Controls are visible
    # The controls have specific icons or buttons.
    # Let's look for the joystick or buttons.
    # The joystick container has class "relative w-32 h-32 bg-black/30"
    # But simpler to look for buttons with roles or svg contents.
    # We can look for the "Sword" icon which is in the attack button.

    # We can also check for text "Leave Game" in the menu to ensure page loaded.

    # Take a screenshot
    page.screenshot(path="/home/jules/verification/mobile_controls.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        # Need to emulate mobile to ensure touch events might be active if logic depends on it
        # But currently my code renders it always.
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 375, "height": 667},
            is_mobile=True,
            has_touch=True
        )
        page = context.new_page()
        try:
            test_mobile_controls(page)
        finally:
            browser.close()
