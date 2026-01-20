# 🚀 Project Setup Guide

This guide will help you run the AI CRM project successfully.

## ✅ Prerequisites Installed

- ✅ Python 3.13.9
- ✅ Node.js v22.17.1
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed

## 📋 Setup Steps

### 1. Backend Server (FastAPI)

The backend server should be running on **http://localhost:8000**

**To start manually:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn api_app:app --host 0.0.0.0 --port 8000
```

**API Documentation:** http://localhost:8000/docs

### 2. Frontend Server (React + Vite)

The frontend server should be running on **http://localhost:3000** (or check the terminal output)

**To start manually:**
```powershell
cd frontend
npm run dev
```

### 3. Environment Variables (IMPORTANT)

You need to create a `.env` file in the `frontend` directory with your Supabase credentials:

**Create `frontend/.env`:**
```env
VITE_SUPABASE_URL=https://lslfjbnbcfhrlmloebax.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

**To get your Supabase credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

**Note:** If you don't have Supabase set up yet, follow the instructions in `frontend/QUICKSTART.md`

## 🌐 Access Points

Once both servers are running:

- **Frontend Application:** http://localhost:3000 (or the port shown in terminal)
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Backend Dashboards (if started):**
  - CRM Dashboard: http://localhost:8502
  - Main Dashboard: http://localhost:8503
  - Product Catalog: http://localhost:8505

## 🛠️ Troubleshooting

### Backend not starting?
1. Make sure the virtual environment is activated
2. Check if port 8000 is already in use: `netstat -ano | findstr :8000`
3. Install missing dependencies: `pip install -r requirements.txt`

### Frontend not starting?
1. Make sure Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Check if `.env` file exists with correct Supabase credentials
4. Check if port 3000 (or the configured port) is available

### Supabase connection errors?
1. Verify your `.env` file has correct Supabase URL and key
2. Check Supabase project is active
3. Follow `frontend/QUICKSTART.md` for complete Supabase setup

## 📚 Additional Resources

- **Frontend Quick Start:** `frontend/QUICKSTART.md`
- **Backend README:** `backend/README.md`
- **Authentication Setup:** `frontend/AUTH_SYSTEM_README.md`

## 🎯 Quick Start Commands

**Start Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn api_app:app --host 0.0.0.0 --port 8000
```

**Start Frontend (in a new terminal):**
```powershell
cd frontend
npm run dev
```

**Or use the batch file (Windows):**
```powershell
cd backend
.\run_project.bat
```

This will start the backend API and all Streamlit dashboards.

---

**Happy coding! 🚀**

