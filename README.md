# Photo Accounting

Photography studio bookkeeping — Vue 3 frontend + Express/SQLite backend.

## Quick Start (Local)

```bash
# Install frontend + backend dependencies
npm install
npm install --prefix server

# Run web (5173) + API (3001) together
npm run dev
```

Open http://localhost:5173

### Default admin (created on first API start)

| Username | Password |
|----------|----------|
| `admin`  | `123456` |

New users can **Register** — each account has isolated projects & records on the server.

## Production (Single Server)

Build frontend and serve both from the API:

```bash
npm install
npm install --prefix server
cp server/.env.example server/.env   # edit JWT_SECRET & CLIENT_ORIGIN

npm run start
```

Open http://localhost:3001 (API serves `dist/` static files).

### Remote deployment checklist

1. Deploy to a VPS / Railway / Render with Node.js 20+
2. Set environment variables in `server/.env`:
   - `JWT_SECRET` — long random string
   - `CLIENT_ORIGIN` — your public URL, e.g. `https://photo.example.com`
   - `PORT` — host port (often `3001` or platform default)
3. Run `npm run start`
4. Put Nginx/Caddy in front with HTTPS (recommended)
5. Share the public URL — users **Register** or use admin account

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/bootstrap` | Projects + records |
| CRUD | `/api/projects`, `/api/records` | Data sync |

Data is stored in `server/data/photo-accounting.db` (SQLite).

## Tech Stack

- **Frontend:** Vue 3, Element Plus, Pinia, Vite
- **Backend:** Express, better-sqlite3, JWT, bcrypt

Repository: https://github.com/Sorthark/Photo-Accounting
