# CORS Error Fix Instructions

## Problem
The frontend is getting CORS errors because:
1. The backend server is not running, OR
2. The backend server needs to be restarted to apply CORS changes

## Solution

### Step 1: Check if Backend is Running
Open a browser and go to: `http://localhost:8000/health`

If you get a connection error, the backend is NOT running.

### Step 2: Start/Restart the Backend Server

**Option A: Using Python directly**
```bash
cd backend
python api_app.py
```

**Option B: Using uvicorn (recommended)**
```bash
cd backend
uvicorn api_app:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Verify Backend is Running
- Open: `http://localhost:8000/docs` - Should show FastAPI documentation
- Open: `http://localhost:8000/health` - Should return `{"status": "healthy", ...}`

### Step 4: Verify CORS is Working
After starting the backend, check the browser console. CORS errors should disappear.

### Step 5: Test Authentication
1. Make sure you're logged in on the frontend
2. Check `localStorage.getItem('token')` in browser console - should have a token
3. If no token, log in again at `/auth/login`

## Current CORS Configuration
The backend is configured to allow:
- `http://localhost:3000` (Frontend)
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite alternative)
- `http://localhost:8501` (Streamlit)
- `http://localhost:8503` (Streamlit)

## Common Issues

### Issue 1: Backend not starting
- Check if port 8000 is already in use
- Check Python version (should be 3.8+)
- Check if all dependencies are installed: `pip install -r requirements.txt`

### Issue 2: Still getting CORS errors after restart
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for specific error messages
- Verify frontend is running on `http://localhost:3000`

### Issue 3: 401 Unauthorized errors
- Make sure you're logged in
- Check if token exists in localStorage
- Try logging out and logging back in
- Check backend logs for authentication errors

## Quick Test Commands

```bash
# Test backend health
curl http://localhost:8000/health

# Test CORS (should return CORS headers)
curl -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization" -X OPTIONS http://localhost:8000/health -v
```

## Next Steps
1. Start the backend server
2. Verify it's accessible at `http://localhost:8000/health`
3. Refresh the frontend
4. Check browser console - errors should be resolved

