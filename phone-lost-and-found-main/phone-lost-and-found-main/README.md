# SPORS – Phone Lost & Found Network

SPORS (also referred to as **FindMyNet**) is a community-driven lost-and-found platform for mobile devices. When a device goes missing it continues broadcasting a low-energy Bluetooth signal; other phones that are part of the network silently detect that signal as they walk by and anonymously report the device's last-known GPS coordinates back to the server, letting the owner see it on a map.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started (Local Setup)](#getting-started-local-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Database Setup](#3-database-setup)
  - [4. Frontend Setup](#4-frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## How It Works

```
Lost device                Other phones in the network              Owner
     │                              │                                 │
     │── BLE Broadcast ──►  Detected by nearby phones ──► Saves GPS location ──► Map view
```

1. **Broadcast Signal** – A device that has been reported as lost continuously sends a secure, low-energy Bluetooth (BLE) beacon.
2. **Network Detection** – Other phones running the app detect the beacon as they pass by and silently record the GPS coordinates.
3. **Secure Locate** – The owner logs in, opens the *Find My Device* page, and sees the last-known location pinned on a Google Map.

The location-reporting step is completely anonymous; the helper's identity is never stored.

---

## Features

| Feature | Description |
|---|---|
| 📡 BLE Community Detection | Scan for nearby lost-device beacons and report their location |
| 📍 Real-time Location Tracking | View the latest or historical GPS coordinates on an interactive map |
| 🔒 User Authentication | Register / log in to manage your own devices |
| 📱 Device Management | Associate multiple devices to a single account |
| 🗺️ Google Maps Integration | Interactive map with device markers and address info |
| 🌗 Dark / Light Theme | Toggle between dark and light UI modes |
| 📢 Report Lost | Mark any of your devices as lost to start tracking |
| 🤝 Report Found | Help the community by scanning for lost devices nearby |

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MySQL 8 (Aiven Cloud) | Persistent storage |
| Firebase Admin SDK | Authentication utilities |
| Vercel | Serverless deployment |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool / dev server |
| React Router v6 | Client-side routing |
| TanStack React Query | Server-state management |
| shadcn-ui + Radix UI | Accessible component library |
| Tailwind CSS | Utility-first styling |
| Google Maps API | Interactive device map |
| Mapbox GL | Alternative map engine |
| React Hook Form + Zod | Form handling & validation |
| Lucide React | Icon library |

---

## Project Structure

```
phone-lost-and-found/
├── backend/                  # Express.js REST API
│   ├── index.js              # Main server entry point
│   ├── package.json
│   └── vercel.json           # Vercel deployment config
└── frontend/                 # React + TypeScript SPA
    ├── src/
    │   ├── App.tsx           # App root & route definitions
    │   ├── main.tsx          # React DOM entry point
    │   ├── pages/
    │   │   ├── Home.tsx          # Landing page
    │   │   ├── FindMyDevice.tsx  # Search & locate a device
    │   │   ├── ReportLost.tsx    # Report a device as lost
    │   │   └── ReportFound.tsx   # Bluetooth scan to help find devices
    │   ├── components/
    │   │   ├── LoginDialog.tsx   # Login / register modal
    │   │   ├── Map.tsx           # Google Maps wrapper
    │   │   ├── Layout.tsx        # App shell
    │   │   └── ui/               # shadcn-ui component library
    │   └── contexts/
    │       └── AuthContext.tsx   # Global auth state
    ├── public/               # Static assets (logos, banners)
    ├── index.html
    └── vite.config.ts
```

---

## Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** v18 or later – [Download](https://nodejs.org/)
- **npm** v9 or later (bundled with Node.js)
- **MySQL 8** – local installation or a cloud instance (e.g. [Aiven](https://aiven.io/))
- A **Google Maps API key** – [Get one](https://developers.google.com/maps/documentation/javascript/get-api-key)
- A **Firebase project** (optional, for advanced auth) – [Console](https://console.firebase.google.com/)

---

## Getting Started (Local Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/M0NSTER01/phone-lost-and-found.git
cd phone-lost-and-found
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with your database credentials (see [Environment Variables](#environment-variables)).

### 3. Database Setup

Connect to your MySQL instance and run the following SQL to create the required tables:

```sql
CREATE DATABASE IF NOT EXISTS findmy;
USE findmy;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  firstname   VARCHAR(100),
  lastname    VARCHAR(100),
  email       VARCHAR(150),
  contact     VARCHAR(20),
  address     TEXT
);

CREATE TABLE IF NOT EXISTS device (
  deviceid    VARCHAR(100) PRIMARY KEY,
  devicename  VARCHAR(150),
  username    VARCHAR(100),
  lat         DOUBLE,
  lon         DOUBLE,
  address     TEXT,
  time        DATETIME,
  FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS track (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  deviceid    VARCHAR(100),
  latitude    DOUBLE,
  longitude   DOUBLE,
  timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lost (
  deviceid    VARCHAR(100) PRIMARY KEY,
  username    VARCHAR(100)
);
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Open `src/components/Map.tsx` and replace the placeholder Google Maps API key with your own key.

---

## Environment Variables

Create a file called `.env` inside the `backend/` directory:

```env
# MySQL / Aiven connection
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=findmy

# Set to "true" if your database requires SSL (e.g. Aiven cloud)
DB_SSL=true
```

> **Security note:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

## Running the Application

### Start the Backend (development)

```bash
cd backend
node index.js
```

The API server starts on **http://localhost:9000**.

### Start the Frontend (development)

```bash
cd frontend
npm run dev
```

The React dev server starts on **http://localhost:8080**.

Open your browser and navigate to `http://localhost:8080` to use the application.

### Build the Frontend for Production

```bash
cd frontend
npm run build      # outputs to frontend/dist/
npm run preview    # locally preview the production build
```

---

## API Reference

All API endpoints are served from the backend server (`http://localhost:9000` locally).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Create a new user account |
| `POST` | `/login` | Authenticate a user |
| `POST` | `/setlocation` | Update a device's current location |
| `POST` | `/storeLocation` | Store a location entry (throttled to 5 seconds) |
| `POST` | `/reportlost/:deviceId` | Mark a device as lost |
| `GET`  | `/device/:id` | Get details for a specific device |
| `GET`  | `/locatedevice/:id` | Get the latest location for a device |
| `GET`  | `/getlocation/:deviceId` | Get the full location history for a device |

### Example: Register a User

```bash
curl -X POST http://localhost:9000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123","email":"alice@example.com"}'
```

### Example: Report a Device as Lost

```bash
curl -X POST http://localhost:9000/reportlost/DEVICE-ID-HERE \
  -H "Content-Type: application/json" \
  -d '{"username":"alice"}'
```

---

## Deployment

### Backend → Vercel

The `backend/vercel.json` is already configured for serverless deployment:

```json
{
  "version": 2,
  "builds": [{ "src": "./index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.js" }]
}
```

1. Install the [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
2. From the `backend/` directory run: `vercel --prod`
3. Add all `.env` keys as **Environment Variables** in the Vercel project dashboard.

### Frontend → Vercel / Lovable

**Option A – Vercel:**
1. From the `frontend/` directory run: `vercel --prod`
2. Set the build command to `npm run build` and the output directory to `dist`.

**Option B – Lovable:**
Open the [Lovable project](https://lovable.dev/projects/YOUR-PROJECT-ID) and click **Share → Publish**.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`.

Please follow the existing code style and ensure the frontend lints cleanly (`npm run lint` inside `frontend/`) before submitting.

---

*Built with ❤️ for the Smart India Hackathon.*