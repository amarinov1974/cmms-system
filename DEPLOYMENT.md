# Deploy CMMS to Railway

This guide walks you through deploying the CMMS app on Railway (Option A: all on Railway).

## Overview

You will create **3 services** in one Railway project:

1. **PostgreSQL** – database  
2. **Backend** – Node.js API  
3. **Frontend** – React app (static site)

## Prerequisites

- [Railway account](https://railway.app) (free tier works)
- GitHub repo with your CMMS code (push your project to GitHub first)
- Git installed locally

---

## Step 1: Create a Railway project

1. Go to [railway.app](https://railway.app) and log in.
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Select your `cmms-system` repository.
5. Railway will create a project (initially with one service). We’ll reconfigure it.

---

## Step 2: Add PostgreSQL

1. In your project, click **+ New**.
2. Choose **Database** → **PostgreSQL**.
3. Railway creates the database and sets `DATABASE_URL` automatically.
4. Click the PostgreSQL service → **Variables** → copy the value of `DATABASE_URL` (you’ll need it for the backend).
5. Click the PostgreSQL service → **Settings** → **Generate Domain** (optional, for direct DB access).

---

## Step 3: Deploy the backend

1. Click **+ New** → **GitHub Repo**.
2. Select the same `cmms-system` repo.
3. Click the new service → **Settings**.
4. Set **Root Directory** to `packages/backend`.
5. Set **Build Command** to:  
   `npm run build`
6. Set **Start Command** to:  
   `npm run start`
7. Click **Variables** and add:

   | Variable           | Value                          |
   |--------------------|--------------------------------|
   | `DATABASE_URL`     | (from PostgreSQL service)      |
   | `SESSION_SECRET`   | (random string, e.g. from 1Password) |
   | `FRONTEND_URL`     | *(leave empty for now)*        |
   | `NODE_ENV`         | `production`                   |

   To get `DATABASE_URL`: click the PostgreSQL service → Variables → **Reference** next to `DATABASE_URL` and choose your backend service.

8. Go to **Settings** → **Networking** → **Generate Domain**.
9. Copy the backend URL (e.g. `https://cmms-backend-production-xxxx.up.railway.app`).
10. Add to backend variables:  
    `FRONTEND_URL` = *(you’ll set this after deploying the frontend)*

---

## Step 4: Deploy the frontend

1. Click **+ New** → **GitHub Repo**.
2. Select the same `cmms-system` repo.
3. Click the new service → **Settings**.
4. Set **Root Directory** to `packages/frontend`.
5. Set **Build Command** to:  
   `npm run build`
6. Set **Start Command** to:  
   `npx serve -s dist -l $PORT`
7. Click **Variables** and add:

   | Variable           | Value                                                |
   |--------------------|------------------------------------------------------|
   | `VITE_API_URL`     | `https://YOUR-BACKEND-URL/api`                       |

   Replace `YOUR-BACKEND-URL` with your backend domain (e.g. `https://cmms-backend-production-xxxx.up.railway.app/api`).

8. Go to **Settings** → **Networking** → **Generate Domain**.
9. Copy the frontend URL (e.g. `https://cmms-frontend-production-yyyy.up.railway.app`).

---

## Step 5: Link backend and frontend

1. Open the **Backend** service → **Variables**.
2. Set `FRONTEND_URL` to your frontend URL (e.g. `https://cmms-frontend-production-yyyy.up.railway.app`).
3. Redeploy the backend so CORS uses the correct origin (Variables → … → Redeploy).

---

## Step 6: Database migration and seed

The backend `start` script runs `prisma migrate deploy`, so migrations apply automatically on deploy.

To seed data:

1. Install [Railway CLI](https://docs.railway.app/guides/cli).
2. Run:

   ```bash
   cd packages/backend
   railway link   # select your project and backend service
   railway run npm run db:seed
   ```

---

## Step 7: Test the app

1. Open your **frontend** URL in a browser.
2. Log in (use seeded users).
3. Test flows and API calls; confirm CORS and sessions work.

---

## Troubleshooting

| Issue                    | Check                                                       |
|--------------------------|-------------------------------------------------------------|
| CORS errors              | `FRONTEND_URL` on backend matches frontend domain exactly   |
| 401 / session issues     | Same-site cookies; ensure backend and frontend use `https`  |
| DB connection failed     | `DATABASE_URL` is set and correct for the backend service   |
| Frontend blank / 404     | `VITE_API_URL` is correct and points to `/api`              |
| Migrations fail          | `DATABASE_URL` format is correct for Prisma (PostgreSQL)    |

---

## Environment summary

### Backend

- `DATABASE_URL` – from PostgreSQL (reference)
- `SESSION_SECRET` – random secret
- `FRONTEND_URL` – frontend public URL
- `NODE_ENV` – `production`
- `PORT` – set by Railway (no need to configure)

### Frontend

- `VITE_API_URL` – backend public URL + `/api`

---

## Cost

Railway’s free tier includes a monthly credit. For this setup:

- PostgreSQL: ~\$5/month (or included in plan)
- Backend: pay-per-use
- Frontend: pay-per-use

Monitor usage in the Railway dashboard.
