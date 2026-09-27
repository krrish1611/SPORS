# Report 01: Database & Backend Data Storage Verification

**Database Host**: `findmy-fundraiser-portal.c.aivencloud.com:23890`
**Database Engine**: MySQL 8.0 (Aiven Cloud Managed)
**Production Backend**: `https://phone-lost-and-found.vercel.app`
**Local Backend**: `http://localhost:9000`

---

## 1. Database Connection & Schema Audit

Live diagnostic test executed via `backend/test_endpoints.js`:
- SSL CA Certificate handshake: **VERIFIED (OK)**
- Pool ping latency: **< 120ms**

### Tables Audit:
| Table Name | Primary Key | Critical Columns | Notes |
|------------|-------------|------------------|-------|
| `users` | `userid` (int) | `username`, `contact`, `address`, `password`, `role` | Role defaults to `'user'`; support `'admin'` and `'police'`. |
| `device` | `deviceid` (varchar) | `devicename`, `username`, `lat`, `lon`, `time`, `imei`, `serialno` | Stores registered handsets. |
| `lost` | `lostid` (int) | `deviceid`, `username` | Stores currently flagged lost devices. |
| `track` | `trackid` (int auto) | `deviceid`, `latitude`, `longitude`, `timestamp` | BLE location uploads from community scanners. |
| `chats` | `chat_id` (int auto) | `deviceid`, `session_id`, `sender_username`, `receiver_username`, `message`, `timestamp` | E2E anonymous message history. |

---

## 2. Issues Discovered & Resolved

### Issue 1.1: Alphabetical Timestamp Sorting in `track` Table
- **Problem**: In the `track` table, `timestamp` is defined as `varchar(50)`. Historical records contain mixed formats (`ISO 8601` vs `4:55:08 PM`). Sorting by `ORDER BY timestamp DESC` sorts strings alphabetically, causing 12-hour timestamps to sort ahead of modern ISO dates.
- **Fix**: Updated all queries (`/storeLocation`, `/locatedevice/:id`, and `/admin/stats`) to sort by `trackid DESC`. Since `trackid` is an `AUTO_INCREMENT INT` primary key, ordering by `trackid DESC` guarantees 100% strict chronological accuracy.
- **Verification**: Verified via `test_endpoints.js` — returns exact latest uploaded coordinates for device `SIH_TEAM_SAPPHIRE001`.

### Issue 1.2: Dead Dev-Tunnel Request Hangs
- **Problem**: `frontend/src/lib/api.ts` was hardcoded to try `https://4zxl3477-9000.inc1.devtunnels.ms` first. Because the dev tunnel is inactive, all requests on localhost hung for up to 10 seconds before falling back to production.
- **Fix**: Replaced with `http://localhost:9000` equipped with an `AbortController` (1.5-second timeout). If the local Express server is not running, it falls back to `https://phone-lost-and-found.vercel.app` instantly without perceptible lag.

---

## 3. Live Endpoint Verification Matrix

| Endpoint | Method | Target | Response Code | Data Persistence Check |
|----------|--------|--------|---------------|------------------------|
| `/storeLocation` | POST | Vercel / MySQL | 200 OK | ✅ Row inserted into `track`, fetched back, verified. |
| `/locatedevice/:id` | GET | Vercel / MySQL | 200 OK | ✅ Successfully returns device coordinates, name, and last seen. |
| `/admin/stats` | GET | Vercel / MySQL | 200 OK | ✅ Returns lost devices count (4) joined with latest `track` coordinates. |
| `/chats` | POST | Vercel / MySQL | 200 OK | ✅ Inserts chat record with timestamp and session ID. |
| `/chats/:session_id` | GET | Vercel / MySQL | 200 OK | ✅ Returns chronological chat thread for session. |
| `/my-chats` | GET | Vercel / MySQL | 200 OK | ✅ Returns active sessions grouped by session_id. |
