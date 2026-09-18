# Panthers Esports Backend - Render Deployment Guide

This guide walks you through deploying the **Panthers Esports API** (`PanthersEsports.Api`) and its **PostgreSQL database** on [Render](https://render.com).

---

## 🚀 Option 1: 1-Click Deployment with Render Blueprints (Recommended)

Render reads the `render.yaml` file in this repository and automatically creates both the **Web Service** and the **PostgreSQL Database** for you.

### Steps:
1. Push your latest code changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure backend for Render deployment"
   git push origin main
   ```
2. Open the [Render Dashboard](https://dashboard.render.com).
3. Click the **New +** button in the top navigation and select **Blueprint**.
4. Connect your GitHub repository (`panthers-esports` or your repo name).
5. Render will detect `render.yaml` and display:
   - **Service**: `panthers-esports-api` (Docker web service, Free plan)
   - **Database**: `panthers-postgres` (PostgreSQL, Free plan)
6. Click **Apply**.
7. Render will automatically provision the database, inject `DATABASE_URL`, build the Docker container, and start the API!

---

## 🛠️ Option 2: Manual Setup via Render Dashboard

If you prefer setting up services individually via the Render UI:

### Step 1: Create the PostgreSQL Database
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **PostgreSQL**.
2. Set the following details:
   - **Name**: `panthers-postgres`
   - **Database**: `panthers_esports`
   - **User**: `panthers_user`
   - **Region**: Choose closest to your users (e.g., `Oregon (US West)` or `Singapore`)
   - **Plan**: `Free`
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (or **External Database URL**).

### Step 2: Create the Web Service
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `panthers-esports-api`
   - **Region**: Same region as your database
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `PanthersEsports.Api`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: `Free`
4. Expand **Advanced** -> **Health Check Path**:
   - Set **Health Check Path** to `/health`
5. Under **Environment Variables**, add:
   | Key | Value | Note |
   |---|---|---|
   | `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* | Links API to PostgreSQL |
   | `ASPNETCORE_ENVIRONMENT` | `Production` | Runs in production mode |
   | `ALLOWED_ORIGINS` | `https://panthers-esports-one.vercel.app,http://localhost:3000,http://localhost:5173` | Allows frontend CORS |

6. Click **Create Web Service**.

---

## 🔍 Verifying the Deployment

Once Render finishes building and deploying:

1. **Check Health Status**:
   Visit your Render service URL:
   ```
   https://panthers-esports-api.onrender.com/health
   ```
   You should see:
   ```json
   {
     "status": "healthy",
     "service": "Panthers Esports API",
     "timestamp": "..."
   }
   ```

2. **Explore Swagger UI**:
   Open Swagger documentation in your browser:
   ```
   https://panthers-esports-api.onrender.com/swagger
   ```
   You can test endpoints directly:
   - `GET /api/Tournaments`
   - `GET /api/Tournaments/{id}/slots`
   - `GET /api/Leaderboard`

---

## 🔗 Connecting Frontend to the Render Backend

Once your backend is live on Render:
1. In your Vercel project settings for `panthers-esports-one.vercel.app`, add an environment variable:
   ```
   VITE_API_URL=https://panthers-esports-api.onrender.com
   ```
2. Redeploy the frontend on Vercel to use the new environment variable.
