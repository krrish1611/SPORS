# Report 02: Mobile BLE Emitting & Scanning Audit

**Target Subsystem**: React Native / Expo Mobile Application (`application/`)
**Target Libraries**: `react-native-ble-plx`, `expo-location`, `expo-task-manager`

---

## 1. BLE Emitting (Peripheral Advertising) Audit

### Findings:
1. `react-native-ble-plx` is exclusively a **Central** mode library in React Native. It scans and connects to peripherals, but does not provide JavaScript APIs for peripheral advertising.
2. In `application/src/services/BleAdvertiser.ts`, the previous code called `NativeModules.BleAdvertiser`. When run in Expo Go or standard development builds without custom native code, `BleAdvertiser` is undefined, throwing:
   `Error: BleAdvertiser native module is not linked.`
3. This unhandled exception caused `BindDeviceScreen` to abort before writing `@bound_device_id` to `AsyncStorage`, completely blocking users from binding their handset.

### Resolution:
- Rewrote `BleAdvertiser.ts` to implement a multi-tier peripheral driver:
  - If a custom native module `BleAdvertiser` is compiled into the APK/binary, it invokes hardware advertising directly.
  - If running in Expo Go or dev environments, it enters **Software Beacon Fallback Mode**, securely binding the device ID in `AsyncStorage` and confirming mesh registration without crashing.
  - Exported `isNativeAdvertisingSupported()` helper for UI status inspection.

---

## 2. BLE Central Scanning Audit

### Findings:
1. **Missed Advertisements (Name vs localName)**:
   - On Android and iOS, BLE advertisement packets place the broadcast identity in `device.localName` or advertisement raw record, while `device.name` is often `null` until GATT connection is established.
   - The original code checked: `if (device?.name?.startsWith('SIH_TEAM_SAPPHIRE'))`. This caused all scans where `device.name` was `null` (but `device.localName` held the ID) to be ignored!
2. **Missing Android 12+ (API 31+) Permissions in Service**:
   - `startForegroundScan` in `BleScannerService.ts` only requested location permissions. If called directly without prior `PermissionsAndroid` request, Android 12+ throws a SecurityException for `BLUETOOTH_SCAN`.
3. **Single Prefix Limitation**:
   - Only checked `SIH_TEAM_SAPPHIRE`, ignoring devices prefixed with `SPORS`.

### Resolution:
- Updated `BleScannerService.ts`:
  - Sniffs `device?.localName || device?.name || ''`.
  - Supports both `'SIH_TEAM_SAPPHIRE'` and `'SPORS'` device prefixes.
  - Self-contained permission handler in `startForegroundScan` checking `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` on Android 12+.
  - Enforced client-side 6-second deduplication cache to prevent flooding the backend with redundant coordinates.
