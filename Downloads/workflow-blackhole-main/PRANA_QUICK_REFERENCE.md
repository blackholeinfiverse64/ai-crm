# 🎯 PRANA - Quick Reference Card

## 🔗 URLs
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:5001
- **Demo Page**: http://localhost:5174/prana-demo

## 🔑 Admin Login
```
Email:    blackholeadmin321@gmail.com
Password: #8779751324$!
```

## 🎨 Cognitive States
| State | Color | Trigger |
|-------|-------|---------|
| ON_TASK | 🟢 Green | Active clicking/scrolling |
| THINKING | 🔵 Blue | Minimal activity |
| DEEP_FOCUS | 🟣 Purple | Continuous engagement |
| IDLE | 🟡 Yellow | 30s inactivity |
| DISTRACTED | 🟠 Orange | Tab switching |
| AWAY | 🔴 Red | Tab not visible |
| OFF_TASK | ⚫ Dark Red | Prolonged absence |

## 📡 Data Flow
```
Browser → Signals (1s) → State Engine → Packet (5s) → Backend → MongoDB
```

## 🧪 Quick Tests
1. **Mouse**: Move fast → Velocity increases
2. **Clicks**: Click 3x → Rapid clicks +1
3. **Scroll**: Scroll page → Depth % changes
4. **Tab**: Switch tabs → State = AWAY
5. **Idle**: Wait 30s → State = IDLE

## 📁 Key Files
- Integration: `client/src/utils/prana/pranaIntegration.js`
- State Logic: `client/src/utils/prana/state_engine.js`
- API Routes: `server/routes/prana.js`
- Demo Page: `client/src/pages/PranaDemo.jsx`
- Live Monitor: `client/src/components/admin/PranaLiveMonitor.jsx`

## 🔍 Debug Checklist
- [ ] Backend running? → `curl http://localhost:5001/api/ping`
- [ ] Frontend running? → Open http://localhost:5174
- [ ] Console logs? → F12, check for "[PRANA]" messages
- [ ] Network requests? → F12 > Network > Filter "prana"
- [ ] MongoDB data? → Check `pranaactivities` collection

## 📊 API Endpoints
```http
POST   /api/prana/ingest              # Send activity data
GET    /api/prana/user/:userId        # Get user history
GET    /api/prana/summary/:userId     # Get daily summary
GET    /api/prana/live-status         # Get all active users
GET    /api/prana/analytics/:userId   # Get analytics
```

## ⚡ Quick Commands
```powershell
# Check servers
Test-NetConnection localhost -Port 5001 -InformationLevel Quiet  # Backend
Test-NetConnection localhost -Port 5174 -InformationLevel Quiet  # Frontend

# View logs (in respective PowerShell windows)
# Backend: See MongoDB connection, API requests
# Frontend: See Vite dev server, HMR updates

# Test API
curl http://localhost:5001/api/ping

# Kill servers (if needed)
Get-Process node | Stop-Process -Force
```

## 📝 Common Issues

**Issue**: Demo page stuck on "Initializing..."  
**Fix**: Refresh page, wait 2 seconds

**Issue**: Signals not updating  
**Fix**: Check browser console for errors, verify backend connection

**Issue**: Admin monitor empty  
**Fix**: Have another user login and navigate to any page

**Issue**: State stuck  
**Fix**: Interact with page (move mouse, click, scroll)

## 🎯 Success Indicators
✅ Demo page shows cognitive state badge  
✅ Signals update every ~1 second  
✅ Console shows "[PRANA] Packet sent" every 5s  
✅ Network tab shows POST /api/prana/ingest  
✅ Admin monitor shows active users  

---

**Ready to explore? Open: http://localhost:5174/prana-demo** 🚀
