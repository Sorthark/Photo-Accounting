# Photo Accounting

A creamy white, eye-friendly photography studio bookkeeping web app.

## Tech Stack

- Vue 3 + TypeScript + Vite
- Element Plus + Element Plus Icons
- Pinia, Day.js, SCSS

## Features

- Login-protected dashboard
- Calendar, entry form, income/expense tracking
- Project management, statistics, CSV export
- Hidden calendar easter egg (9+ entries per month)

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Login (Demo Accounts)

The app uses **frontend demo authentication** — no backend server yet.

| Username | Password   | Notes              |
|----------|------------|--------------------|
| `admin`  | `123456`   | Default admin      |
| `studio` | `studio123`| Studio account     |

Share the **deployed site URL** plus one of the accounts above so others can log in.

> Session is stored in the browser (`sessionStorage`). Closing the tab ends the session.

## Share With Others (Deploy)

1. Build: `npm run build`
2. Deploy the `dist/` folder to any static host, for example:
   - [GitHub Pages](https://pages.github.com/)
   - [Vercel](https://vercel.com/)
   - [Netlify](https://www.netlify.com/)
3. Send collaborators the public URL and demo login credentials.

### GitHub Pages (example)

```bash
npm run build
# Push dist to gh-pages branch or use GitHub Actions
```

Repository: https://github.com/Sorthark/Photo-Accounting

## Production Auth (Future)

For real multi-user login, replace `src/stores/auth.ts` with a backend API (JWT/session) and user database. The current demo store is for prototyping only.
