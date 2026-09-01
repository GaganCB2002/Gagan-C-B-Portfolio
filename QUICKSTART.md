# Quick Start Guide

## Prerequisites
1. **Node.js 18+** installed
2. **MongoDB** - Either local or Atlas (cloud, free)

## Option A: Use MongoDB Atlas (Recommended - Free Cloud)
1. Go to https://www.mongodb.com/atlas
2. Create free account → Create M0 cluster (free)
3. Database Access → Add Database User (username/password)
4. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
5. Clusters → Connect → Drivers → Copy connection string
6. Edit `backend/server/.env`:
   ```
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/gagan-portfolio?retryWrites=true&w=majority
   ```

## Option B: Install MongoDB Locally (Windows)
1. Download: https://www.mongodb.com/try/download/community
2. Install as Windows Service
3. Default runs on port 27017

## Run the Project

### Terminal 1 - Backend
```powershell
cd "D:\Gagan C B Portfolio\gagan-portfolio\backend\server"
npm install
npm run dev
```
Should show: `Portfolio server running on http://localhost:3001` and `[DB] MongoDB connected`

### Terminal 2 - Frontend
```powershell
cd "D:\Gagan C B Portfolio\gagan-portfolio\frontend"
npm install
npm run dev
```
Should show: `VITE ready in xxx ms` and `Local: http://localhost:5173`

## Login Credentials (After seeding)
- **Email**: gagancb2002@gmail.com
- **Password**: Gagan@2002@2026

## Seed Admin User (First time only)
```powershell
cd "D:\Gagan C B Portfolio\gagan-portfolio\backend\server"
node database/seed.js
```

## Troubleshooting

**"Could not connect to server"** on login page:
- Backend not running → Start backend first (Terminal 1)
- MongoDB not connected → Check backend terminal for `[DB] MongoDB connected`

**"Invalid credentials"**:
- Run seed script to create admin user
- Check password matches exactly: `Gagan@2002@2026`

**CORS errors**:
- Backend `.env` has `CORS_ORIGIN=*` (allows all)

**Rate limited (4 hours)**:
- After 5 failed attempts, wait 4 hours or clear MongoDB `users` collection