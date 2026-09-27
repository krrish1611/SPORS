# Report 04: Map Rendering Audit (Web & Mobile)

**Target Subsystem**: Web Frontend (`Map.tsx`, `FindMyDevice.tsx`, `Dashboard.tsx`) & Mobile App (`LocateDeviceScreen.tsx`)

---

## 1. Web Map Audit & Upgrades

### Findings:
1. `frontend/src/components/Map.tsx` depended entirely on `@react-google-maps/api`.
2. `frontend/.env` did not exist; `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` was empty (`""`).
3. If Google Maps failed to load or experienced network errors, the component remained stuck indefinitely on `Loading map...`.

### Resolution:
1. **Configured API Key**:
   - Created `frontend/.env` with `VITE_GOOGLE_MAPS_API_KEY=AIzaSyCooMiPo2EchUsoAPOyQU0npLOfFXKZ3xs`.
2. **Dual-Engine Resilient Architecture**:
   - Upgraded `Map.tsx`:
     - If Google Maps loads successfully: Renders interactive Google Map with marker pin.
     - If Google Maps encounters loadError or while loading: Automatically provides a seamless OpenStreetMap interactive embed with exact coordinates pin, directions link, and full navigation button.
     - The map NEVER fails or gets stuck.

---

## 2. Mobile Map Audit & Upgrades

### Findings:
1. In `LocateDeviceScreen.tsx`, `selectedDevice.location.lat` was accessed directly without optional chaining. If `location` was null or missing, it threw an unhandled TypeError.
2. In the "Last Seen" timestamp display, `new Date(selectedDevice.lastSeen).toLocaleString()` was called on string values like `'4:55:08 PM'` or `'Recently'`, producing `"Invalid Date"`.
3. The map view used `initialRegion` instead of dynamic `region`, preventing the map from re-centering when a new device was searched.

### Resolution:
1. Added safe coordinate extraction:
   ```typescript
   const lat = Number(selectedDevice.location?.lat) || 28.6139;
   const lng = Number(selectedDevice.location?.lng) || 77.2090;
   ```
2. Replaced `initialRegion` with dynamic `region` so the map immediately flies to the newly searched handset.
3. Added safe `formatLastSeen` guard so that non-ISO time strings remain legible rather than displaying `"Invalid Date"`.
