# 🎯 PRANA Integration Demonstration Guide

## 🚀 Quick Start - View the Demo NOW!

### Both Servers Are Running:
- **Backend (API)**: http://localhost:5001
- **Frontend (Web App)**: http://localhost:5174

---

## 📋 Step-by-Step Demo Instructions

### Step 1: Open the Application
1. Open your browser and go to: **http://localhost:5174**
2. You'll see the login page

### Step 2: Login with Admin Credentials
```
Email: blackholeadmin321@gmail.com
Password: #8779751324$!
```

### Step 3: View PRANA Demo Page
Once logged in, navigate to: **http://localhost:5174/prana-demo**

Or add it to the sidebar navigation if needed.

---

## 🎨 What You'll See on the Demo Page

### 1. **Your Current Activity Status** (Top Card - Blue Border)
This shows YOUR real-time monitoring data:

- **Cognitive State Badge** - Your current state (ON_TASK, THINKING, DEEP_FOCUS, IDLE, DISTRACTED, AWAY, OFF_TASK)
- **Tab Visible** - Whether the browser tab is visible (✅/❌)
- **Window Focused** - Whether the window has focus (✅/❌)

### 2. **Real-time Signals** (Right Panel)
Live metrics updating every second:
- **Mouse Velocity** - How fast you're moving your mouse (px/s)
- **Hover Loops** - Circular mouse movements detected
- **Rapid Clicks** - Quick succession clicks
- **Scroll Depth** - How far you've scrolled (%)
- **Inactivity** - Time since last activity (seconds)

### 3. **How PRANA Works** (Info Cards)
Explains the three-stage process:
- Signal Capture (mouse, clicks, scrolls, tab visibility)
- State Detection (AI determines cognitive state)
- Real-time Updates (data sent to server every 5 seconds)

### 4. **Recent State Transitions**
Shows your cognitive state changes over time with timestamps

### 5. **Admin Live Monitor** (For Admin Users Only)
Shows ALL employees' activity in real-time with:
- User name and email
- Current cognitive state
- Last active time
- Focus score

---

## 🧪 Interactive Testing

Try these actions and watch the demo page update in real-time:

### Test 1: Mouse Movement
**Action**: Move your mouse rapidly across the screen  
**Expected**: "Mouse Velocity" increases to 100+ px/s, state may change to "ON_TASK"

### Test 2: Rapid Clicking
**Action**: Click the mouse button rapidly 3+ times  
**Expected**: "Rapid Clicks" counter increases, cognitive state becomes "ON_TASK"

### Test 3: Scrolling
**Action**: Scroll up and down this page  
**Expected**: "Scroll Depth" percentage changes, shows engagement

### Test 4: Tab Switching
**Action**: Switch to another browser tab  
**Expected**: 
- "Tab Visible" changes to ❌
- Cognitive state changes to "AWAY"
- When you come back, it changes back

### Test 5: Inactivity
**Action**: Don't touch mouse/keyboard for 30 seconds  
**Expected**: 
- "Inactivity" counter increases
- State changes from ON_TASK → THINKING → IDLE

### Test 6: Deep Focus
**Action**: Rapidly click, scroll, and move mouse continuously  
**Expected**: State changes to "DEEP_FOCUS" with high focus score

---

## 🔍 Behind the Scenes - Check Browser Console

### Open Developer Tools (F12) and check:

```javascript
// You should see these logs:
[PRANA] Initializing monitoring system...
[PRANA] Monitoring started for user: <your-user-id>
[PRANA] Current state: ON_TASK, Focus: 0.75
[PRANA] Packet sent to server successfully
```

### Check Network Tab:
Look for POST requests to `/api/prana/ingest` every 5 seconds

**Request Payload Example:**
```json
{
  "cognitive_state": "ON_TASK",
  "focus_score": 0.75,
  "raw_signals": {
    "mouse_velocity": 125.5,
    "hover_loops": 2,
    "rapid_click_count": 3,
    "scroll_depth": 45,
    "inactivity_ms": 1500,
    "tab_visible": true,
    "panel_focused": true
  },
  "time_distribution": {
    "ON_TASK": 0.6,
    "THINKING": 0.3,
    "IDLE": 0.1
  }
}
```

---

## 👨‍💼 Admin Features

### As an admin, you can:

1. **View Live Monitor** on the demo page (scroll to bottom)
2. **See All Employees** in real-time
3. **Monitor Cognitive States** with color-coded badges:
   - 🟢 Green = ON_TASK (productive)
   - 🔵 Blue = THINKING (processing)
   - 🟣 Purple = DEEP_FOCUS (highly engaged)
   - 🟡 Yellow = IDLE (inactive)
   - 🟠 Orange = DISTRACTED (multitasking)
   - 🔴 Red = AWAY (tab not visible)

4. **Check Focus Scores** (0.0 to 1.0 scale)

### Testing Multi-User Monitoring:
1. Open another browser (or incognito window)
2. Login with a different user account
3. Go back to admin account on `/prana-demo`
4. See both users in the Live Monitor!

---

## 📊 API Endpoints Available

### For Frontend/Testing:

```http
POST /api/prana/ingest
# Sends activity data from client
Body: { cognitive_state, focus_score, raw_signals, time_distribution }

GET /api/prana/user/:userId
# Get specific user's activity history
Response: [{ cognitive_state, timestamp, focus_score, ... }]

GET /api/prana/summary/:userId?startDate=X&endDate=Y
# Get daily summaries
Response: { average_focus, state_distribution, total_sessions }

GET /api/prana/live-status
# Get all currently active users (last 5 minutes)
Response: [{ userId, name, current_state, last_active, ... }]

GET /api/prana/analytics/:userId?days=7
# Get analytics for time period
Response: { trends, patterns, productivity_metrics }
```

---

## 🎯 Key Features Demonstrated

### ✅ Fully Implemented:

1. **Passive Monitoring** - No invasive tracking
2. **Real-time Updates** - 5-second intervals
3. **AI State Detection** - 7 cognitive states
4. **Admin Dashboard** - Live employee monitoring
5. **MongoDB Storage** - All data persisted
6. **Socket.IO Integration** - Real-time broadcasts
7. **Privacy-Focused** - No screenshots, keylogging, or URLs

### 🔒 Privacy Guarantees:

**PRANA Collects:**
- Mouse movement patterns
- Click frequencies
- Scroll behavior
- Tab visibility
- Inactivity duration

**PRANA Does NOT Collect:**
- Screenshots
- Keystrokes
- URLs
- File names
- Application names
- Personal content

---

## 🎨 Visual State Guide

| State | Color | Icon | Meaning |
|-------|-------|------|---------|
| ON_TASK | Green | 📊 | Actively working on tasks |
| THINKING | Blue | 🧠 | Processing, low activity |
| DEEP_FOCUS | Purple | ⚡ | High engagement, continuous activity |
| IDLE | Yellow | ⏱️ | No activity detected |
| DISTRACTED | Orange | 👁️ | Switching tabs, multitasking |
| AWAY | Red | 🖱️ | Tab not visible or window unfocused |
| OFF_TASK | Dark Red | 🚫 | Prolonged inactivity |

---

## 🔧 Troubleshooting

### Problem: Demo page shows "Initializing PRANA monitoring..."
**Solution**: Refresh the page, PRANA takes ~2 seconds to initialize

### Problem: Signals not updating
**Solution**: 
1. Check browser console for errors
2. Verify backend is running on port 5001
3. Check Network tab for failed requests

### Problem: Admin Live Monitor shows "No active employees"
**Solution**: 
1. Open another browser/tab with a logged-in user
2. Wait 5 seconds for first data packet
3. Refresh the demo page

### Problem: State stuck on "IDLE"
**Solution**: Move your mouse or click to generate activity

---

## 📱 Next Steps

### To Add PRANA to Other Pages:

1. **Import the Live Monitor Component:**
   ```javascript
   import PranaLiveMonitor from '../components/admin/PranaLiveMonitor';
   ```

2. **Add to Admin Dashboard:**
   ```jsx
   {user.role === 'Admin' && <PranaLiveMonitor />}
   ```

3. **Create Custom Views:**
   - Weekly productivity reports
   - Team focus analytics
   - Individual performance tracking

### To Customize PRANA:

1. **Edit State Thresholds:**
   - File: `client/src/utils/prana/state_engine.js`
   - Adjust timing and signal weights

2. **Change Update Interval:**
   - File: `client/src/utils/prana/pranaIntegration.js`
   - Line: `setInterval(..., 5000)` → change 5000ms

3. **Add New Signals:**
   - File: `client/src/utils/prana/signals.js`
   - Add new signal collectors
   - Update state engine logic

---

## 🎉 Success Indicators

You know PRANA is working when:

✅ Demo page shows your current cognitive state  
✅ Signals update every ~1 second  
✅ Browser console shows "[PRANA] Packet sent" every 5 seconds  
✅ Network tab shows POST /api/prana/ingest requests  
✅ Admin Live Monitor displays active users  
✅ State changes when you interact with the page  
✅ MongoDB has `pranaactivities` collection with data  

---

## 📚 Documentation

For more details, see:
- **PRANA_INTEGRATION_GUIDE.md** - Technical documentation
- **server/routes/prana.js** - API endpoint implementations
- **client/src/utils/prana/** - Core PRANA modules
- **client/src/components/admin/PranaLiveMonitor.jsx** - Admin dashboard

---

## 🎯 Demo Checklist

- [ ] Backend server running (http://localhost:5001)
- [ ] Frontend server running (http://localhost:5174)
- [ ] Logged in as admin (blackholeadmin321@gmail.com)
- [ ] Navigated to /prana-demo
- [ ] See cognitive state badge
- [ ] See real-time signals updating
- [ ] Tested mouse movement → velocity changes
- [ ] Tested tab switching → state changes to AWAY
- [ ] Tested inactivity → state changes to IDLE
- [ ] Checked browser console for PRANA logs
- [ ] Checked Network tab for /api/prana/ingest requests
- [ ] Viewed Admin Live Monitor (scroll to bottom)
- [ ] Opened second browser/user to test multi-user monitoring

---

## 🚀 You're All Set!

The PRANA monitoring system is **fully integrated and working**.  

**Start exploring at: http://localhost:5174/prana-demo**

Interact with the page and watch your cognitive state change in real-time! 🎯
