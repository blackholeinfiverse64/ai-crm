// Prevent server from crashing on unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️  Uncaught Exception:', error);
});

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const socketIo = require("socket.io");
// const jwt = require("jsonwebtoken");
// const path = require("path");
// const userNotificationRoutes = require('./routes/user-notifications');
// const taskRoutes = require("./routes/tasks");
// const departmentRoutes = require("./routes/departments");
// const userRoutes = require("./routes/users");
// const authRoutes = require("./routes/auth");
// const aiRoutes = require("./routes/ai");
// const adminRoutes = require('./routes/admin');
// const dashboardRoutes = require('./routes/dashboard');
// const submissionRoutes = require('./routes/submission');
// const aiNewRoutes = require('./routes/aiRoutes');
// const progressRoutes = require('./routes/progress'); // Add this line
// const notificationRoutes = require('./routes/notifications'); // Add this line
// const aimRoutes = require('./routes/aims_unified');
// // const aiRoutePy = require('./routes/aiRoutePy')
// // Create Express app
// const app = express();

// // Create HTTP server and initialize Socket.IO
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: ['http://localhost:5173','http://192.168.1.2:5173','https://main-workflow.vercel.app'],  // Replace with your frontend's URL
//     methods: ['GET', 'POST'],
//     credentials: true,  // Allow credentials (cookies, HTTP authentication)
//   },
// });

// // CORS Configuration
// const corsOptions = {
//   origin: ['http://localhost:5173','http://192.168.1.2:5173','https://main-workflow.vercel.app'],  // Replace with your frontend's URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,  // Allow credentials (cookies, HTTP authentication)
// };
// app.use(cors(corsOptions));

// app.use(express.json());

// // Connect to MongoDB
// require('dotenv').config();  // Add this line at the top

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));


// // Socket.IO connection
// io.on("connection", (socket) => {
//   console.log("New client connected");

//   socket.on("join", (rooms) => {
//     if (Array.isArray(rooms)) {
//       rooms.forEach((room) => socket.join(room));
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

// // Make io available to routes
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// app.get('/api/ping', (req, res) => {
//   res.json({ message: 'Pong!' });
// });


// // Serve static files from Vite build
// app.use(express.static(path.join(__dirname, '../client/dist')));

// // Serve frontend only for non-API routes
// app.get(/^\/(?!api).*/, (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });


// // Routes
// app.use("/api/tasks", taskRoutes);
// app.use("/api/departments", departmentRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/ai", aiRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/submissions", submissionRoutes);
// app.use('/api/new/ai', aiNewRoutes);
// app.use('/api/progress', progressRoutes); // Add this line
// app.use('/api/notifications', notificationRoutes); // Add this line
// app.use('/api/aims', aimRoutes);
// app.use('/api/user-notifications', userNotificationRoutes);

// // app.use('/api/new/ai',aiRoutePy)



// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: "Something went wrong!" });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const path = require("path");
const userNotificationRoutes = require('./routes/user-notifications');
const taskRoutes = require("./routes/tasks");
const departmentRoutes = require("./routes/departments");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const dashboardFixedRoutes = require('./routes/dashboardFixed');
const submissionRoutes = require('./routes/submission');
const aiNewRoutes = require('./routes/aiRoutes');
const progressRoutes = require('./routes/progress'); // Add this line
const notificationRoutes = require('./routes/notifications'); // Add this line
const aimRoutes = require('./routes/aims_universal');
const pushRoutes = require('./routes/push'); // Add this line
const attendanceRoutes = require('./routes/attendance'); // New attendance routes
const leaveRoutes = require('./routes/leave'); // New leave routes
const enhancedSalaryRoutes = require('./routes/enhancedSalary'); // Enhanced salary with live attendance
const enhancedAimsRoutes = require('./routes/enhancedAims'); // Enhanced aims routes
const consentRoutes = require('./routes/consent'); // Consent routes
const alertRoutes = require('./routes/alerts'); // Alert routes
const emsRoutes = require('./routes/ems'); // EMS automation routes
const procurementRoutes = require('./routes/procurement'); // Procurement routes
const chatbotRoutes = require('./routes/chatbot'); // Admin chatbot routes
const biometricAttendanceRoutes = require('./routes/biometricAttendance'); // Biometric attendance and salary routes
const hourlyBasedSalaryRoutes = require('./routes/hourlyBasedSalary'); // Hourly-based salary management
const newSalaryRoutes = require('./routes/newSalaryManagement'); // New salary management system
const pranaRoutes = require('./routes/prana'); // PRANA cognitive monitoring routes
const { startAttendancePersistenceCron, syncExistingAttendance } = require('./services/attendanceCronJobs'); // Attendance persistence cron
// Middleware imports
const auth = require('./middleware/auth');
const adminAuth = require('./middleware/adminAuth');
// const aiRoutePy = require('./routes/aiRoutePy')
// Create Express app
const app = express();

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      const allowed = [
        'https://blackhole-workflow.vercel.app',
        'https://main-workflow.vercel.app',
        'https://blackholeworkflow.onrender.com',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      const isLocalhost = origin && /^http:\/\/localhost:\d+$/.test(origin);
      if (!origin || isLocalhost || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      'https://blackhole-workflow.vercel.app',
      'https://main-workflow.vercel.app',
      'https://blackholeworkflow.onrender.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    const isLocalhost = origin && /^http:\/\/localhost:\d+$/.test(origin);
    if (!origin || isLocalhost || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://blackhole-workflow.vercel.app',
    'https://main-workflow.vercel.app',
    'https://blackholeworkflow.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  if (origin && /^http:\/\/localhost:\d+$/.test(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  } else if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// Connect to MongoDB
require('dotenv').config();  // Add this line at the top

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


// Socket.IO connection
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("join", (rooms) => {
    if (Array.isArray(rooms)) {
      rooms.forEach((room) => {
        socket.join(room);
        console.log(`👤 Socket ${socket.id} joined room: ${room}`);
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'Pong!' });
});

// Test Linux browser detection endpoint
app.get('/api/test-browser-detection', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    console.log('🧪 Testing Linux browser detection...');

    const results = {};

    // Test if commands are installed
    try {
      await execAsync('which xdotool');
      results.xdotool = 'installed';
      console.log('✅ xdotool is installed');
    } catch (error) {
      results.xdotool = 'not installed: ' + error.message;
      console.log('❌ xdotool not installed:', error.message);
    }

    try {
      await execAsync('which wmctrl');
      results.wmctrl = 'installed';
      console.log('✅ wmctrl is installed');
    } catch (error) {
      results.wmctrl = 'not installed: ' + error.message;
      console.log('❌ wmctrl not installed:', error.message);
    }

    try {
      await execAsync('which scrot');
      results.scrot = 'installed';
      console.log('✅ scrot is installed');
    } catch (error) {
      results.scrot = 'not installed: ' + error.message;
      console.log('❌ scrot not installed:', error.message);
    }

    try {
      await execAsync('which convert');
      results.imagemagick = 'installed';
      console.log('✅ imagemagick is installed');
    } catch (error) {
      results.imagemagick = 'not installed: ' + error.message;
      console.log('❌ imagemagick not installed:', error.message);
    }

    // Test X11 environment
    try {
      const { stdout } = await execAsync('echo $DISPLAY');
      results.display = stdout.trim() || 'not set';
      console.log('🖥️ DISPLAY environment:', results.display);
    } catch (error) {
      results.display = 'error: ' + error.message;
    }

    res.json({
      success: true,
      platform: process.platform,
      commands: results,
      message: 'Linux command test completed'
    });

  } catch (error) {
    console.error('🧪 Command test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      platform: process.platform
    });
  }
});


// Serve static files from Vite build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve frontend only for non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


// Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard", dashboardFixedRoutes); // Enhanced dashboard APIs (attendance-summary, merge-analysis, etc.)
app.use("/api/submissions", submissionRoutes);
app.use('/api/new/ai', aiNewRoutes);
app.use('/api/progress', progressRoutes); // Add this line
app.use('/api/notifications', notificationRoutes); // Add this line
app.use('/api/aims', aimRoutes);
app.use('/api/user-notifications', userNotificationRoutes);
app.use("/api/push", pushRoutes) // Added push routes use
app.use("/api/monitoring", require("./routes/monitoring")); // Employee monitoring routes
app.use("/api/ems-signals", require("./routes/emsSignals")); // EMS Signal Layer - Real-time activity signals
app.use("/api/attendance", attendanceRoutes); // Attendance management routes
app.use("/api/attendance-dashboard", require("./routes/attendanceDashboard")); // Live attendance dashboard routes
app.use("/api/leave", leaveRoutes); // Leave management routes
app.use("/api/enhanced-salary", enhancedSalaryRoutes); // Enhanced salary with live attendance and WFH tracking
app.use("/api/enhanced-aims", enhancedAimsRoutes); // Enhanced aims with progress routes
app.use('/api/consent', consentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ems', emsRoutes); // EMS automation routes
app.use('/api/procurement', procurementRoutes); // Procurement routes
app.use('/api/chatbot', chatbotRoutes); // Admin chatbot routes
app.use('/api/biometric', biometricAttendanceRoutes); // Biometric attendance and salary management routes
app.use('/api/hourly-salary', hourlyBasedSalaryRoutes); // Hourly-based salary management routes
app.use('/api/new-salary', newSalaryRoutes); // New salary management system
app.use('/api/prana', pranaRoutes); // PRANA cognitive activity monitoring routes

// app.use('/api/new/ai',aiRoutePy)



// Auto-end day background job - DISABLED
// Work days now continue indefinitely until user manually ends them
// const Attendance = require('./models/Attendance');
// const DailyAttendance = require('./models/DailyAttendance');

// const autoEndDayJob = async () => {
//   try {
//     const AUTO_END_DAY_ENABLED = process.env.AUTO_END_DAY_ENABLED === 'true';
//     const MAX_WORKING_HOURS = parseInt(process.env.MAX_WORKING_HOURS) || 8;

//     if (!AUTO_END_DAY_ENABLED) return;

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Find all attendance records that started today but haven't ended
//     const activeAttendance = await Attendance.find({
//       date: today,
//       startDayTime: { $exists: true },
//       endDayTime: { $exists: false }
//     }).populate('user', 'name email');

//     const currentTime = new Date();

//     for (const record of activeAttendance) {
//       const hoursWorked = (currentTime - record.startDayTime) / (1000 * 60 * 60);

//       if (hoursWorked >= MAX_WORKING_HOURS) {
//         // Auto end the day
//         record.endDayTime = currentTime;
//         record.employeeNotes = `Auto-ended after ${MAX_WORKING_HOURS} hours of work`;
//         record.autoEnded = true;

//         // Calculate hours worked
//         const startTime = new Date(record.startDayTime);
//         const endTime = currentTime;
//         const timeDiff = endTime - startTime;
//         const calculatedHours = Math.round((timeDiff / (1000 * 60 * 60)) * 100) / 100;
//         record.hoursWorked = calculatedHours;

//         await record.save();

//         // Also update DailyAttendance for permanent storage
//         await DailyAttendance.findOneAndUpdate(
//           { user: record.user._id, date: today },
//           {
//             $set: {
//               endDayTime: currentTime,
//               hoursWorked: calculatedHours,
//               status: 'present',
//               autoEnded: true,
//               employeeNotes: `Auto-ended after ${MAX_WORKING_HOURS} hours of work`
//             }
//           },
//           { upsert: true, new: true }
//         );

//         console.log(`✅ Auto-ended day for user: ${record.user.name} after ${calculatedHours} hours`);

//         // Emit socket event
//         io.emit('attendance:auto-day-ended', {
//           userId: record.user._id,
//           userName: record.user.name,
//           endTime: currentTime,
//           hoursWorked: calculatedHours,
//           reason: 'Exceeded maximum working hours'
//         });
//       }
//     }
//   } catch (error) {
//     console.error('❌ Auto end day job error:', error);
//   }
// };

// Run auto-end day job every 30 minutes - DISABLED
// setInterval(autoEndDayJob, 30 * 60 * 1000);

// Run on server start to catch any that should have already ended - DISABLED
// autoEndDayJob();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Midnight auto-end scheduler for unended work days
const Attendance = require('./models/Attendance');
const DailyAttendance = require('./models/DailyAttendance');
const User = require('./models/User');

// SIMPLE RULE: Spam validation = EXACTLY 8 hours for cumulative calculation
const SPAM_VALIDATION_HOURS = 8;
// WFH Maximum Hours Cap - ONLY applies to WFH employees
const WFH_MAX_HOURS_PER_DAY = 8;

/**
 * Midnight Auto-End Job
 * Runs at 12:00 AM every day to auto-end unfinished work sessions
 * - WFH employees: Hours capped at 8 hours max per calendar day
 * - WFO employees: NO cap, can work unlimited hours (12, 14, 16+)
 * Hours go to spam queue (WFH max 8h, WFO actual hours can be validated by admin)
 */
const midnightAutoEndJob = async () => {
  try {
    console.log('🕛 Running midnight auto-end job...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date (the day that just ended at midnight)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Find all attendance records from yesterday that started but haven't ended
    const activeAttendance = await Attendance.find({
      date: {
        $gte: yesterday,
        $lte: yesterdayEnd
      },
      startDayTime: { $exists: true, $ne: null },
      endDayTime: { $exists: false }
    }).populate('user', 'name email');

    const autoEndedCount = [];
    const midnightTime = today; // Midnight of the new day

    for (const record of activeAttendance) {
      try {
        // Calculate actual hours worked (from start to midnight)
        const startTime = new Date(record.startDayTime);
        let hoursWorked = (midnightTime - startTime) / (1000 * 60 * 60);

        // Validation: Ensure hours are reasonable (max 24 hours in a day)
        if (hoursWorked > 24 || hoursWorked < 0) {
          console.error(`⚠️ Invalid hours calculation for ${record.user.name}: ${hoursWorked}h - Skipping`);
          continue;
        }

        // ============================================
        // WFH HOUR CAPPING LOGIC - ONLY FOR WFH EMPLOYEES
        // WFO employees have NO cap - they can work unlimited hours
        // ============================================
        let isWFH = false;
        const originalHours = hoursWorked;
        
        // Check if user is WFH by workMode or workPattern
        if (record.workPattern === 'Remote') {
          isWFH = true;
        } else if (record.user?._id) {
          const userDoc = await User.findById(record.user._id).select('workMode').lean();
          if (userDoc?.workMode === 'WFH') {
            isWFH = true;
          }
        }
        
        // Apply WFH cap ONLY for WFH employees
        // WFO employees keep their actual hours (no cap)
        if (isWFH && hoursWorked > WFH_MAX_HOURS_PER_DAY) {
          hoursWorked = WFH_MAX_HOURS_PER_DAY;
          console.log(`📍 WFH Cap Applied for ${record.user.name}: ${originalHours.toFixed(2)}h → ${hoursWorked}h`);
        }

        // MIDNIGHT SPAN LOGIC: Session spans from one day to next
        const spanType = 'MIDNIGHT_SPAN';
        
        // Determine fixed hours based on work mode
        const fixedHours = isWFH ? WFH_MAX_HOURS_PER_DAY : SPAM_VALIDATION_HOURS;
        
        // Auto end the day at midnight
        record.endDayTime = midnightTime;
        record.hoursWorked = Math.round(hoursWorked * 100) / 100;
        record.autoEnded = true;
        record.spamStatus = 'Pending Review';
        record.spamReason = isWFH 
          ? 'WFH session spans midnight - auto-ended with 8h cap'
          : 'Session spans midnight - auto-ended by system';
        record.spanType = spanType; // Mark as midnight span
        record.spanDetails = {
          startDate: yesterday.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          actualHours: Math.round(originalHours * 100) / 100,
          fixedHours: fixedHours,
          splitRequired: Boolean(!isWFH && originalHours > 24), // Only split for WFO multi-day sessions
          isWFH: isWFH
        };
        record.systemNotes = isWFH 
          ? `WFH Midnight span: ${originalHours.toFixed(2)}h actual → ${hoursWorked}h (8h max cap applied)`
          : `WFO Midnight span: ${originalHours.toFixed(2)}h actual. Admin validation grants ${fixedHours}h fixed`;
        record.employeeNotes = (record.employeeNotes || '') + 
          (isWFH 
            ? ' [WFH Auto-ended at midnight - 8h cap applied]'
            : ' [Auto-ended at midnight - Span session pending admin review]');
        record.overtimeHours = isWFH ? 0 : Math.max(0, hoursWorked - 8); // WFH has no overtime
        record.approvalStatus = 'Pending';

        await record.save();

        // Also update DailyAttendance record
        const dailyRecord = await DailyAttendance.findOne({
          user: record.user._id,
          date: {
            $gte: yesterday,
            $lte: yesterdayEnd
          }
        });

        if (dailyRecord) {
          dailyRecord.endDayTime = midnightTime;
          dailyRecord.totalHoursWorked = record.hoursWorked;
          dailyRecord.autoEnded = true;
          dailyRecord.spamStatus = 'Pending Review';
          dailyRecord.spamReason = isWFH 
            ? 'WFH session spans midnight - 8h cap applied'
            : 'Session spans midnight - requires validation';
          dailyRecord.spanType = 'MIDNIGHT_SPAN';
          dailyRecord.spanDetails = record.spanDetails;
          dailyRecord.systemNotes = isWFH
            ? `WFH Midnight span: ${originalHours.toFixed(2)}h actual → ${record.hoursWorked}h (8h cap)`
            : `WFO Midnight span: ${originalHours.toFixed(2)}h actual → ${SPAM_VALIDATION_HOURS}h fixed on validation`;
          dailyRecord.overtimeHours = isWFH ? 0 : Math.max(0, record.hoursWorked - 8);
          await dailyRecord.save();
        }

        autoEndedCount.push({
          userName: record.user.name,
          hoursWorked: record.hoursWorked,
          isWFH: isWFH,
          originalHours: originalHours
        });

        console.log(`⚠️ Auto-ended work day for ${record.user.name} - ${record.hoursWorked}h${isWFH ? ' (WFH capped)' : ' (WFO)'} (marked as spam)`);

        // Emit socket event
        io.emit('attendance:auto-ended-midnight', {
          userId: record.user._id,
          userName: record.user.name,
          date: yesterday.toISOString().split('T')[0],
          hoursWorked: record.hoursWorked,
          reason: 'Did not end day before midnight',
          spamStatus: 'Pending Review'
        });
      } catch (recordError) {
        console.error(`Error auto-ending record for user ${record.user?.name}:`, recordError);
      }
    }

    console.log(`✅ Midnight auto-end complete. Processed ${autoEndedCount.length} records.`);
    
  } catch (error) {
    console.error('❌ Midnight auto-end job error:', error);
  }
};

// Schedule midnight job using setInterval
const scheduleMidnightJob = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next midnight
  
  const msUntilMidnight = midnight - now;
  
  console.log(`🕛 Next midnight auto-end scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
  console.log(`   Next run at: ${midnight.toLocaleString()}`);
  
  // Schedule for next midnight
  setTimeout(() => {
    midnightAutoEndJob();
    // Then run every 24 hours
    setInterval(midnightAutoEndJob, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
};

// Manual trigger endpoint for testing (admin only)
app.post('/api/admin/trigger-midnight-job', auth, adminAuth, async (req, res) => {
  try {
    console.log('🔧 Manually triggering midnight auto-end job...');
    await midnightAutoEndJob();
    res.json({ 
      success: true, 
      message: 'Midnight auto-end job executed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Manual trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger midnight job', details: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`🕛 Midnight Auto-End: ENABLED (unended days go to spam, validation grants exactly ${SPAM_VALIDATION_HOURS}h)`);
  console.log(`📊 Spam validation rule: EXACTLY ${SPAM_VALIDATION_HOURS} hours (not more, not less)`);
  
  // Schedule midnight auto-end job
  scheduleMidnightJob();
  
  // Start attendance persistence cron job
  console.log('🕐 Starting attendance persistence cron job (runs daily at 11:59 PM)...');
  startAttendancePersistenceCron();
  
  // Sync existing attendance data for the last 30 days (non-blocking)
  console.log('📊 Syncing historical attendance data for the last 30 days...');
  syncExistingAttendance().catch(err => {
    console.error('❌ Error syncing historical attendance (non-critical):', err.message);
  });
  console.log('✅ Server initialization complete');
});