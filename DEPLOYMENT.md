# 🚀 VisionAIoT Deployment Guide (Render + Supabase)

This project is now restructured for a seamless **Full-Stack Deployment**.

## 📁 Project Structure
- `/frontend`: React + Vite (Static Site)
- `/backend`: Node.js + Express + Prisma (Web Service)

---

## ☁️ STEP 1: Supabase Setup (Database)
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Go to **Settings > Database**.
3. Copy the **Connection String** (use the Transaction Pooler if possible).
4. In your Render Backend settings, add this as `DATABASE_URL`.

## 🗄️ STEP 2: Supabase Schema Migration
Before your backend can work, you need to create the tables in Supabase:
1. Open your **Supabase Dashboard**.
2. Go to **SQL Editor**.
3. Create a **New Query**.
4. Copy-paste the content of `backend/prisma/schema.prisma` (Note: In a hackathon, it's easier to run `npx prisma db push` from your local machine once you update your local `.env` with the Supabase `DATABASE_URL`).

---

## 🛠️ STEP 3: Deploy Backend (Render Web Service)
1. Click **New > Web Service**.
2. Connect this GitHub repo.
3. **Root Directory**: `backend`
4. **Build Command**: `npm install && npx prisma generate`
5. **Start Command**: `npm run dev` (or `node src/index.js` once built)
6. **Environment Variables**:
   - `DATABASE_URL`: Your Supabase connection string.
   - `PORT`: 4000 (Render will override this, which is fine).
   - `NODE_ENV`: production

---

## 🌐 STEP 3: Deploy Frontend (Render Static Site)
1. Click **New > Static Site**.
2. Connect this GitHub repo.
3. **Root Directory**: `frontend`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_URL`: Your Render Backend URL (e.g., `https://aiot-api.onrender.com`)
   - `VITE_WS_URL`: Your Render Backend URL (same as above)

---

## ⚙️ STEP 4: AI Worker (Local/Edge)
Keep your `violence_alert_worker.py` running locally on your laptop or Jetson. 
It will connect to the **Production Backend URL** once you update the `BACKEND_URL` in the script.

🚀 **Go Live!**
- itzdevilsunny/aiot
