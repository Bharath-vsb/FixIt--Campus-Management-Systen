# FixIt Campus Management - Render Deployment Guide

This guide explains how to deploy the FixIt Campus Management system to Render using the Free Tier, with secure Cloudinary photo evidence storage.

## Architecture Overview
- **Frontend**: React + TypeScript (Vite) deployed as a Render Static Site.
- **Backend**: ASP.NET Core 8 Web API deployed as a Render Docker Web Service.
- **Database**: Render Free PostgreSQL.
- **Photo Storage**: Cloudinary (Free Tier) using Authenticated Delivery for security.

---

## 1. Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. From the Cloudinary Dashboard, copy the **API Environment Variable** (it looks like `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`).
3. You will need this URL for the backend configuration.

## 2. Deploy Infrastructure via Render Blueprint
The repository contains a `render.yaml` Blueprint which defines the exact infrastructure (Database, Backend, Frontend).

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New** -> **Blueprint**.
3. Connect your GitHub repository containing the FixIt project.
4. Render will automatically detect `render.yaml` and prompt you to create the resources.
5. Click **Apply**.
   *Note: The frontend and backend builds may fail initially because secrets (JWT, Cloudinary) are missing and the database is not migrated. This is expected.*

## 3. Configure Secrets
Once the services are created in the Render dashboard:

**For the Backend (`fixit-backend`):**
Navigate to the **Environment** tab and add the following missing secrets:
- `CLOUDINARY_URL`: Paste the full `cloudinary://...` URL.
- `Jwt__Key`: A strong random string (e.g., `ThisIsAMuchLongerSecretKeyForProductionUsage2026!`).
- `Jwt__Issuer`: `FixItApp` (or your preferred issuer).
- `Jwt__Audience`: `FixItUsers` (or your preferred audience).
- `CORS_ORIGINS`: Find the URL of your deployed frontend (e.g., `https://fixit-frontend.onrender.com`) and paste it here.

**For the Frontend (`fixit-frontend`):**
Navigate to the **Environment** tab and ensure the placeholder is updated:
- `VITE_API_BASE_URL`: Set this to your actual deployed backend URL (e.g., `https://fixit-backend.onrender.com/api`).

## 4. Manual EF Core Database Migration (Crucial Step)
Render's Free Web Service tier does not support automated `preDeployCommand` hooks. You must run the database migrations manually from your local machine.

1. In the Render Dashboard, go to your **PostgreSQL Database** (`fixit-db`).
2. Scroll down to **External Database URL** and copy the connection string.
3. On your local machine, open a terminal in the `/backend` folder.
4. Run the EF Core database update command against the remote database:
   ```bash
   dotnet ef database update --connection "YOUR_EXTERNAL_RENDER_DB_CONNECTION_STRING"
   ```
5. Wait for the command to finish. This creates all tables and applies schema modifications securely.

## 5. Finalize Deployment
1. Go to the **Backend** service in the Render Dashboard.
2. Click **Manual Deploy** -> **Deploy latest commit** (to ensure it picks up the environment variables and the newly migrated database).
3. Wait for the backend to become live.
4. Go to the **Frontend** service and click **Manual Deploy** -> **Deploy latest commit**.
5. Once complete, open your frontend URL!

---

## 6. Local Development
Your local development workflow remains unaffected:
- Run `docker-compose up` or `dotnet run` locally.
- The system will naturally default to the local physical file storage (`uploads/` folder) because the `PORT` and `STORAGE_PROVIDER` variables are not strictly set to Render overrides locally.
- `VITE_API_BASE_URL` falls back to `http://localhost:5046/api` locally.
