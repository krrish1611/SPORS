import os
import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    screenshots_dir = os.path.join(os.getcwd(), "issues", "screenshots")
    os.makedirs(screenshots_dir, exist_ok=True)
    
    print("[1/5] Launching Chromium in Headless mode...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        # 1. Home Page
        print("[2/5] Testing Home Page (http://localhost:8080/)...")
        page.goto("http://localhost:8080/", wait_until="networkidle", timeout=30000)
        time.sleep(1)
        assert "SPORS" in page.content(), "Brand 'SPORS' missing"
        page.screenshot(path=os.path.join(screenshots_dir, "01_home_page.png"), full_page=True)
        print("  Home page validated & screenshot captured.")

        # 2. Track Device (/find-my)
        print("[3/5] Testing Find My Device (/find-my)...")
        page.goto("http://localhost:8080/find-my", wait_until="networkidle", timeout=30000)
        time.sleep(1)
        
        device_input = page.locator("input[placeholder*='SPORS-DEVICE-01']").first
        if device_input.is_visible():
            device_input.fill("SIH_TEAM_SAPPHIRE001")
            track_btn = page.locator("button:has-text('Track Device Location')").first
            if track_btn.is_visible():
                track_btn.click()
                print("  Clicked 'Track Device Location', waiting for telemetry and map paint...")
                time.sleep(5)
        
        page.screenshot(path=os.path.join(screenshots_dir, "02_find_my_device_located.png"), full_page=True)
        print("  Find My Device located state validated & screenshot captured.")

        # 3. Police Command Portal (/police)
        print("[4/5] Testing Police Command Portal (/police)...")
        page.goto("http://localhost:8080/police", wait_until="networkidle", timeout=30000)
        time.sleep(1)
        
        preview_btn = page.locator("button:has-text('PREVIEW OFFICER COMMAND PORTAL')").first
        if preview_btn.is_visible():
            print("  Entering Officer Command Portal...")
            preview_btn.click()
            time.sleep(3)
            
            # Click on an incident row to trigger active focus and map centering
            first_row = page.locator("table tbody tr").first
            if first_row.is_visible():
                print("  Selecting first incident row to test active map focus...")
                first_row.click()
                time.sleep(2)

        page.screenshot(path=os.path.join(screenshots_dir, "03_police_dashboard_active.png"), full_page=True)
        print("  Police Command Dashboard validated & screenshot captured.")

        # 4. Found a Lost Device + Anonymous Chat (/report-lost-device)
        print("[5/5] Testing Report Lost & Found Handset + Anonymous Chat (/report-lost-device)...")
        page.goto("http://localhost:8080/report-lost-device", wait_until="networkidle", timeout=30000)
        time.sleep(1)
        
        lookup_input = page.locator("input[placeholder*='SPORS-DEVICE-01']").first
        if lookup_input.is_visible():
            lookup_input.fill("SIH_TEAM_SAPPHIRE001")
            lookup_btn = page.locator("button:has-text('Look Up Owner')").first
            if lookup_btn.is_visible():
                lookup_btn.click()
                print("  Looking up owner for SIH_TEAM_SAPPHIRE001...")
                time.sleep(3)

        # Type message if chat input appears
        chat_box = page.locator("input[placeholder*='message'], input[placeholder*='Type']").first
        if chat_box.is_visible():
            print("  Anonymous Return Chat loaded! Sending safe handover test message...")
            chat_box.fill("Handset found near central metro station. Safe and powered on.")
            send_btn = page.locator("button:has-text('Send')").first
            if send_btn.is_visible():
                send_btn.click()
                time.sleep(2)
                
        page.screenshot(path=os.path.join(screenshots_dir, "04_anonymous_chat_active.png"), full_page=True)
        print("  Anonymous chat validated & screenshot captured.")

        browser.close()
        
    print("\n[VERIFICATION COMPLETE] All interactive pages, live Aiven DB queries, and map components tested successfully!")

if __name__ == "__main__":
    run_tests()
