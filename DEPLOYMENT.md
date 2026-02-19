# Deploy CMMS to Railway – Detailed Guide

This guide walks you through deploying the CMMS app on Railway step by step, with exact clicks and values.

---

## Overview

You will have **3 services** in one Railway project:

| Service     | Role              | What it runs                          |
|------------|-------------------|----------------------------------------|
| Postgres   | Database          | PostgreSQL (Railway manages it)       |
| @cmms/backend  | API server        | Node.js + Express + Prisma             |
| @cmms/frontend | Web app          | React (built to static files, served) |

---

## Prerequisites

1. **GitHub account** – Railway deploys from GitHub.
2. **Railway account** – Sign up at [railway.app](https://railway.app).
3. **Code on GitHub** – Your CMMS repo must be pushed to GitHub (e.g. `your-username/cmms-system`).
4. **Git** – Installed locally so you can push the latest code (including the standalone backend `tsconfig.json`).

---

# Step-by-step instructions

---

## Step 1: Create the project and add PostgreSQL

### 1.1 New project from GitHub

1. Go to [railway.app](https://railway.app) and log in.
2. Click **“New Project”** (or **“Add new project”**).
3. Choose **“Deploy from GitHub repo”**.
4. If asked, authorize Railway to access your GitHub and pick the account/org that owns the repo.
5. In the repo list, select **your CMMS repository** (e.g. `cmms-system`) and confirm.
6. Railway creates a project and usually adds **one service** from that repo. You will change this service into the backend and add the rest.

### 1.2 Add PostgreSQL

1. On the project page, click **“+ New”** (or **“Add service”**).
2. Choose **“Database”**.
3. Click **“PostgreSQL”**.
4. Wait until the Postgres service shows **“Online”** (green).
5. Click the **Postgres** service card to open it.
6. Open the **“Variables”** tab. You should see `DATABASE_URL` (and possibly `PGHOST`, `PGPORT`, etc.). You will use `DATABASE_URL` for the backend in the next step.

**Optional:** In the Postgres service **Settings** tab, under **Networking**, you can click **“Generate Domain”** if you ever want to connect to the DB from outside Railway (e.g. a GUI client). For normal deployment you don’t need this.

---

## Step 2: Configure and deploy the backend

### 2.1 Use the existing service or add one

- If Railway created **one service** when you connected GitHub, click that service (it might be named after your repo).
- If you don’t see a GitHub service, click **“+ New”** → **“GitHub Repo”** → select the same CMMS repo again.

Rename the service to something clear (e.g. **@cmms/backend**): click the service name at the top and type the new name.

### 2.2 Set Root Directory

1. With the backend service open, go to the **“Settings”** tab.
2. Find **“Root Directory”** (or **“Source”** → **“Root Directory”**).
3. Set it to exactly:  
   **`packages/backend`**  
   (no leading slash, no trailing slash). This makes Railway build and run only the backend package.

### 2.3 Build and start commands

In the same **Settings** tab:

1. **Build Command** – set to:  
   **`npm run build`**
2. **Start Command** – set to:  
   **`npm run start`**

If Railway already filled these from `railway.json`, they should already be correct. Confirm they match the above.

### 2.4 Variables (environment variables)

1. Open the **“Variables”** tab for the **backend** service.
2. Add or edit variables. You can use **“Raw Editor”** or **“Add variable”** for each.

Add these:

| Variable        | How to set it |
|-----------------|----------------|
| **DATABASE_URL** | Click **“New Variable”** (or **“Add reference”**). Choose **“Reference”** (or **“Variable from another service”**). Select the **Postgres** service and the variable **`DATABASE_URL`**. This keeps the backend using the same database URL Railway gives Postgres. |
| **SESSION_SECRET** | Create a **plain variable**. Name: `SESSION_SECRET`. Value: a long random string (e.g. 32+ characters). You can generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in a terminal, or use a password manager. |
| **NODE_ENV**     | Create a **plain variable**. Name: `NODE_ENV`. Value: **`production`**. |
| **FRONTEND_URL** | Leave this for **Step 4** after you have the frontend URL. You can add the variable now with an empty value or a placeholder like `https://placeholder.up.railway.app` and change it later. |

Save/apply the variables.

### 2.5 Generate a public URL for the backend

1. Stay in the **backend** service.
2. Go to **“Settings”** (or **“Networking”**).
3. Under **“Networking”** / **“Public networking”**, click **“Generate Domain”**.
4. Railway will assign a URL like:  
   **`https://your-backend-name-production-xxxx.up.railway.app`**
5. Copy this **full URL** (including `https://`). You will use it as **YOUR-BACKEND-URL** for the frontend and for **FRONTEND_URL** later.

### 2.6 Deploy and check logs

1. Trigger a deploy: either push a commit to your GitHub repo, or in Railway click **“Deploy”** / **“Redeploy”** for the backend service.
2. Open the **“Deployments”** tab and click the latest deployment.
3. Check **“Build Logs”**: you should see `npm run build` (Prisma generate + TypeScript compile) succeed.
4. Check **“Deploy Logs”** (runtime): you should see the app start (e.g. “CMMS Backend running on …”) and no crash. If it crashes, the error message in the logs (e.g. missing env var, DB connection) will tell you what to fix.

The backend must be **running** (not crashed) before the frontend will work.

---

## Step 3: Deploy the frontend

### 3.1 Add the frontend service

1. From the project page (click the project name or “Back” so you see all services), click **“+ New”**.
2. Choose **“GitHub Repo”**.
3. Select the **same** CMMS repository again.
4. A new service is created. Rename it to something like **@cmms/frontend**.

### 3.2 Root Directory

1. Open the **frontend** service → **“Settings”**.
2. Set **Root Directory** to:  
   **`packages/frontend`**

### 3.3 Build and start commands

In **Settings**:

1. **Build Command**:  
   **`npm run build`**
2. **Start Command**:  
   **`npx serve -s dist -l $PORT`**  
   (`-s` = SPA mode so routes like `/amm` work; `$PORT` is provided by Railway.)

### 3.4 Frontend variable: backend API URL

The frontend must call your **backend** API. That URL is baked in at **build time** via Vite.

1. Open the **frontend** service → **“Variables”**.
2. Add a variable:  
   - **Name:** **`VITE_API_URL`**  
   - **Value:** **`https://YOUR-BACKEND-URL/api`**  
   Replace `YOUR-BACKEND-URL` with the backend domain you copied in Step 2.5 (no trailing slash before `/api`).  
   Example: **`https://cmms-backend-production-abc123.up.railway.app/api`**

Save the variables.

### 3.5 Generate domain and deploy

1. In the frontend service, go to **Settings** → **Networking** → **“Generate Domain”**.
2. Copy the frontend URL, e.g. **`https://cmms-frontend-production-yyyy.up.railway.app`**.
3. Trigger a deploy (push to GitHub or **Redeploy**). Check **Build Logs** to ensure `npm run build` succeeds.

---

## Step 4: Connect backend and frontend (CORS)

The backend only allows requests from the URL you set in **FRONTEND_URL**. Without it, the browser will block requests (CORS errors).

1. Open the **backend** service → **“Variables”**.
2. Set **FRONTEND_URL** to the **exact** frontend URL you copied in Step 3.5 (e.g. `https://cmms-frontend-production-yyyy.up.railway.app`). No trailing slash.
3. Save. Redeploy the backend (so it restarts with the new variable). After redeploy, the backend should stay **Online**.

---

## Step 5: Seed the database (optional but recommended)

The backend runs **Prisma migrations** automatically on start (`prisma migrate deploy`). To load initial data (companies, users, etc.):

1. Install the **Railway CLI**:  
   [https://docs.railway.app/guides/cli](https://docs.railway.app/guides/cli)  
   (e.g. `npm i -g @railway/cli` or download from GitHub.)
2. Log in: run **`railway login`** in a terminal.
3. In your project folder:  
   **`cd packages/backend`**
4. Link the CLI to your project and backend service:  
   **`railway link`**  
   Select the right project and the **backend** service when prompted.
5. Run the seed:  
   **`railway run npm run db:seed`**  
   This runs the seed script inside Railway’s environment (with the same `DATABASE_URL` as the backend).

You can now log in with the seeded users on the frontend.

---

## Step 6: Test the app

1. Open the **frontend** URL in your browser (the one you set as **FRONTEND_URL**).
2. You should see the CMMS login/entry page.
3. Log in with a seeded user. Try different roles (AMM, S1, S2, S3, Director, Store Manager) if you have them.
4. If you see **CORS** errors in the browser console (F12 → Console), double-check **FRONTEND_URL** on the backend (exact match, no trailing slash) and that you redeployed the backend after changing it.

---

# Troubleshooting

| Symptom | What to check |
|--------|----------------|
| **Backend build fails** (e.g. tsconfig) | Backend must use a **standalone** `tsconfig.json` (no `extends` from repo root). The repo already has this in `packages/backend/tsconfig.json`. Ensure that file is committed and pushed. |
| **Backend crashed** | In backend **Deployments** → latest deploy → **Deploy Logs**. Look for the first error (missing env, DB connection, Prisma, etc.). Fix the cause and redeploy. |
| **Frontend build failed** | In frontend **Deployments** → **Build Logs**. If it’s “cannot find module” or path errors, the **Root Directory** must be exactly `packages/frontend`. |
| **CORS errors in browser** | Backend **Variables**: **FRONTEND_URL** must equal the frontend’s full origin (e.g. `https://cmms-frontend-production-xxx.up.railway.app`). Then redeploy backend. |
| **401 / session / login fails** | Backend and frontend must both use **HTTPS** in production. Ensure **SESSION_SECRET** is set on the backend. |
| **Database connection error** | Backend **Variables**: **DATABASE_URL** must be the **reference** to the Postgres service’s **DATABASE_URL**, or the exact connection string Railway shows for that Postgres. |
| **Blank page or 404 on refresh** | Frontend start command must include **`-s`** for `serve` (SPA fallback): `npx serve -s dist -l $PORT`. |

---

# Quick reference: variables

### Backend

| Variable        | Example / note |
|-----------------|----------------|
| DATABASE_URL    | Reference from Postgres service |
| SESSION_SECRET  | Long random string |
| NODE_ENV        | `production` |
| FRONTEND_URL    | `https://your-frontend.up.railway.app` (no trailing slash) |
| PORT            | Set by Railway; don’t set manually |

### Frontend

| Variable      | Example / note |
|---------------|----------------|
| VITE_API_URL  | `https://your-backend.up.railway.app/api` (must match backend domain) |

---

# Cost

Railway’s free tier gives a monthly credit. Postgres, backend, and frontend all consume resources. Check **Billing** / **Usage** in the project to avoid surprises. You can set spending limits in your account settings.
