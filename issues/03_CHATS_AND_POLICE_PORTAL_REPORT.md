# Report 03: Anonymous Chat & Police Section Audit

**Target Subsystem**: `frontend/src/components/AnonymousChat.tsx` & `frontend/src/pages/Dashboard.tsx`
**Backend Endpoints**: `/chats`, `/chats/:session_id`, `/my-chats`, `/admin/stats`, `/admin/chats`

---

## 1. Anonymous Chat Audit

### Verification:
1. **Message Persistence**:
   - Sent test payload to `POST /chats` with test session ID.
   - Message was successfully written to the `chats` table with accurate MySQL `DATETIME`.
   - Fetched back via `GET /chats/:session_id` and verified chronological sorting.
   - Verified that `DELETE /chats WHERE session_id = ...` cleans up cleanly without constraint violations.
2. **Polling & Real-time Update**:
   - `AnonymousChat.tsx` polls `/chats/:session_id` every 5 seconds.
   - Message bubbles automatically distinguish between current user (`isMe: true`) and counterparty.
   - Removed artificial AI gimmick comments (`// No messages yet...`) for cleaner UI presentation.

---

## 2. Police Portal (`/police` & `/admin`) Audit

### Findings:
1. **Static Incident Map Display**:
   - Previously, the incident map on `Dashboard.tsx` was fixed to `stats.devices[0]`. Clicking other incidents in the list had no effect on the map.
2. **Uncaught Null Coordinates**:
   - When a device in the database has not yet received a BLE mesh ping (e.g. `SIH_TEAM_SAPPHIRE004` which currently has `lat: null`), the incident list rendered `GPS: null° N, null° E`.
   - `parseFloat("null")` passed `NaN` to the map center.

### Resolution:
- Updated `Dashboard.tsx`:
  - Added interactive `selectedIncident` state. Clicking any reported lost handset in the incident list activates it with an `Active Focus` badge and dynamically re-centers the Map on that device.
  - Handled pending coordinates with a clean fallback badge: `Coordinates Pending (Mesh Ping Expected)` instead of `null° N, null° E`.
  - Added safe numeric fallbacks for map center.
