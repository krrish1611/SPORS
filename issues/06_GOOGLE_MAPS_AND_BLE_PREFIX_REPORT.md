# 06: Google Maps Fix & Strict BLE Prefix Emitting/Scanning Report

## 1. Problem Identification

### A. Google Maps Not Opening Properly
- **Issue**: Google Maps was failing to load properly, displaying a blocking alert modal: *"This page can't load Google Maps correctly. Do you own this website?"* and rendering darkened watermarks (*"For development purposes only"*).
- **Root Cause**: The Google Maps JavaScript SDK (`@react-google-maps/api`) was being initialized with an unbilled / restricted placeholder API key. Google Cloud blocks JavaScript API map rendering if billing or domain restrictions fail.
- **Resolution**:
  - Re-architected [`Map.tsx`](file:///c:/Users/krrish/OneDrive/Desktop/spors%20sih/phone-lost-and-found-main/phone-lost-and-found-main/frontend/src/components/Map.tsx) to use official, zero-error Google Maps embed endpoints (`https://maps.google.com/maps?q=${lat},${lng}&t=m&z=15&output=embed`).
  - Added an interactive layer switcher: **Google Map (Roadmap)**, **Google Satellite (`t=k`)**, and **OpenStreetMap (OSM)**.
  - Added an **"Open in Google Maps"** navigation button that launches `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` for native turn-by-turn routing.
  - Result: Google Maps now opens 100% cleanly without ANY alert modals, billing errors, or watermarks.

### B. BLE Emitting Prefix Requirement
- **Requirement**: When the mobile device emits a BLE beacon, it must strictly emit the prefix provided to it (e.g. `SIH_TEAM_SAPPHIRE` or `SPORS`).
- **Implementation**:
  - Updated [`BleAdvertiser.ts`](file:///c:/Users/krrish/OneDrive/Desktop/spors%20sih/phone-lost-and-found-main/phone-lost-and-found-main/application/src/services/BleAdvertiser.ts) with `formatAdvertisedBeaconName(deviceId, prefix)` and `startAdvertising(deviceId, prefix)`.
  - Upgraded [`BindDeviceScreen.tsx`](file:///c:/Users/krrish/OneDrive/Desktop/spors%20sih/phone-lost-and-found-main/phone-lost-and-found-main/application/src/screens/BindDeviceScreen.tsx) with a **BLE Broadcast Prefix Configuration Card** (`SIH_TEAM_SAPPHIRE`, `SPORS`, Custom) and live broadcast ID preview.
  - Device IDs are automatically normalized to guarantee they start with the selected prefix (e.g., `001` becomes `SIH_TEAM_SAPPHIRE001`).

### C. BLE Scanning Strict Prefix Filtering
- **Requirement**: When BLE scanning is active, it must capture ONLY packets emitted with the prefix we gave, strictly dropping all unrelated Bluetooth noise.
- **Implementation**:
  - Updated [`BleScannerService.ts`](file:///c:/Users/krrish/OneDrive/Desktop/spors%20sih/phone-lost-and-found-main/phone-lost-and-found-main/application/src/services/BleScannerService.ts) to accept `targetPrefix?: string` and read `@ble_scan_prefix` from AsyncStorage.
  - Added strict prefix gate:
    ```ts
    if (!detectedName.startsWith(activePrefix)) {
      return; // Discarded: Not part of our prefix network
    }
    ```
  - Upgraded [`ScannerScreen.tsx`](file:///c:/Users/krrish/OneDrive/Desktop/spors%20sih/phone-lost-and-found-main/phone-lost-and-found-main/application/src/screens/ScannerScreen.tsx) with a **Capture Prefix Filter UI**, allowing users to select or type their target prefix and see active filter status (`Capturing ONLY "<prefix>*"`).
  - Unrelated Bluetooth devices (smart watches, wireless headphones, fitness trackers, smart home tags) are dropped without processing.

### D. Mobile App Native Google Maps Navigation
- Added direct **"Open in Google Maps App"** button in [`LocateDeviceScreen.tsx`](file:///c:/Users/krrish/OneDrive/Desktop/spors%20sih/phone-lost-and-found-main/phone-lost-and-found-main/application/src/screens/LocateDeviceScreen.tsx) that launches native Google Maps turn-by-turn navigation via `Linking.openURL`.

---

## 2. Verification & Automated Test Results

1. **Mobile Automated Test Suite** (`application/test_mobile_flow.js`):
   - **Prefix Emitting Tests**:
     - `formatBeaconName("001", "SIH_TEAM_SAPPHIRE")` -> `SIH_TEAM_SAPPHIRE001` (PASS)
     - `formatBeaconName("SIH_TEAM_SAPPHIRE001", "SIH_TEAM_SAPPHIRE")` -> `SIH_TEAM_SAPPHIRE001` (PASS)
     - `formatBeaconName("DEVICE_X", "SPORS")` -> `SPORSDEVICE_X` (PASS)
   - **Prefix Scanning Strict Filtering Tests**:
     - Packet `SIH_TEAM_SAPPHIRE001` -> **CAPTURED** (PASS)
     - Packet `Apple Watch Ultra` -> **DROPPED** (PASS)
     - Packet `JBL Flip 6` -> **DROPPED** (PASS)
     - Packet `SPORS-PHONE-09` (when filtering for `SIH_TEAM_SAPPHIRE`) -> **DROPPED** (PASS)
     - Packet `SIH_TEAM_SAPPHIRE_ALPHA` -> **CAPTURED** (PASS)
2. **TypeScript Compilation**:
   - `application/`: `npx tsc --noEmit` -> **0 errors**
   - `frontend/`: `npm run build` -> **0 errors (built in 3.45s)**
3. **Playwright Visual Verification**:
   - `02_find_my_device_located.png`: Real Google Maps loaded cleanly with red pin and layer switcher.
   - `03_police_dashboard_active.png`: Real Google Maps loaded cleanly with active incident focus and zero watermarks.
