# Kweza Attendance

## Project Structure

- `frontend`: Admin dashboard (Vite + React) with Vercel Functions API routes in `frontend/api/`.
- `expo`: Mobile app (Expo) for QR scanning.
- `backend`: Legacy local Express + SQLite server (not used when hosting on Vercel).

## Local Development

Admin dashboard:
```
cd frontend
npm install
npm run dev
```

Local backend (SQLite):
```
cd backend
npm install
npm start
```

Expo app:
```
cd expo
npm install
npx expo start
```

## Hosting on Vercel + Supabase (Admin + API + Database)

1. Create a Supabase Postgres database and copy the **connection string**.
2. Create a Vercel project with **Root Directory** set to `frontend`.
3. Add these Vercel Environment Variables:
   - `SUPABASE_DATABASE_URL` (or `SUPABASE_DB_URL`) with your connection string
   - `JWT_SECRET`
   - `QR_VALUE` (default: `KWEZA-ATTENDANCE-CHECKIN`)
   - `VITE_API_BASE` (leave empty to use same-origin `/api`)
4. Deploy.

## Expo App (Hosted API)

Point the Expo app to your hosted API:
```
EXPO_PUBLIC_API_BASE=https://your-vercel-domain
```

## Admin Login

Default seed credentials:
- Username: `admin`
- Password: `admin123`

Change the password after first login.
