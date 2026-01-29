const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const fs = require('fs');
const geolib = require('geolib');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const UserTag = require('../models/UserTag');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const DailyAttendance = require('../models/DailyAttendance');
const { reverseGeocode } = require('../utils/reverseGeocode');

// SIMPLE RULE: Spam validation = EXACTLY 8 hours for cumulative calculation
const SPAM_VALIDATION_HOURS = 8;

// Configure multer for Excel file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// Office coordinates - Blackhole Infiverse LLP Mumbai
// Address: Road Number 3, near Hathi Circle, above Bright Connection, Kala Galli, Motilal Nagar II, Goregaon West, Mumbai, Maharashtra
const OFFICE_COORDINATES = {
  latitude: parseFloat(process.env.OFFICE_LAT) || 19.158900,
  longitude: parseFloat(process.env.OFFICE_LNG) || 72.838645
};
const OFFICE_RADIUS = parseInt(process.env.OFFICE_RADIUS) || 2000; // meters
const MAX_WORKING_HOURS = parseInt(process.env.MAX_WORKING_HOURS) || 10;
const AUTO_END_DAY_ENABLED = process.env.AUTO_END_DAY_ENABLED === 'true';
const OFFICE_ADDRESS = 'Blackhole Infiverse LLP, Road Number 3, near Hathi Circle, above Bright Connection, Kala Galli, Motilal Nagar II, Goregaon West, Mumbai, Maharashtra';

// Enhanced start day with geolocation validation and work from home option
router.post('/start-day/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    let { latitude, longitude, address, accuracy, workFromHome, homeLocation } = req.body;
    
    // Verify user authorization
    if (req.user.id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Validate geolocation
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Geolocation data required',
        code: 'LOCATION_REQUIRED'
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if user has already started day
    const existingRecord = await Attendance.findOne({
      user: userId,
      date: today
    });
    
    if (existingRecord && existingRecord.startDayTime) {
      return res.status(400).json({ 
        error: 'Day already started',
        startTime: existingRecord.startDayTime,
        code: 'DAY_ALREADY_STARTED'
      });
    }
    
    let workLocationType = 'Office';
    let locationValidated = false;
    
    if (workFromHome) {
      // Work from home - lock the location and get exact address
      workLocationType = 'Home';
      locationValidated = true;
      
      // If address is not provided or is generic, reverse geocode to get exact address
      let wfhAddress = address;
      if (!wfhAddress || wfhAddress === 'Work From Home' || wfhAddress.toLowerCase().includes('work from home')) {
        try {
          const geocodeResult = await reverseGeocode(latitude, longitude);
          // Always use the full address from geocoding result
          wfhAddress = geocodeResult.fullAddress || geocodeResult.displayName || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          console.log(`📍 User ${userId} starting work from home at: ${wfhAddress} (${latitude}, ${longitude})`);
        } catch (error) {
          console.warn(`⚠️ Reverse geocoding failed for WFH location: ${error.message}`);
          // Always provide coordinates as fallback address
          wfhAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          console.log(`📍 User ${userId} starting work from home at coordinates: ${wfhAddress}`);
        }
      } else {
        console.log(`📍 User ${userId} starting work from home at: ${wfhAddress} (${latitude}, ${longitude})`);
      }
      // Update address variable for later use
      address = wfhAddress;
    } else {
      // Check if user is within office radius
      const distance = geolib.getDistance(
        { latitude: OFFICE_COORDINATES.latitude, longitude: OFFICE_COORDINATES.longitude },
        { latitude, longitude }
      );
      
      if (distance > OFFICE_RADIUS) {
        return res.status(400).json({
          error: `You must be within ${OFFICE_RADIUS}m of office premises to start your day.`,
          distance: distance,
          allowedRadius: OFFICE_RADIUS,
          officeAddress: OFFICE_ADDRESS,
          officeCoordinates: OFFICE_COORDINATES,
          code: 'LOCATION_TOO_FAR',
          suggestion: 'Either go to office or select "Work From Home" option'
        });
      }
      
      workLocationType = 'Office';
      locationValidated = true;
      
      console.log(`🏢 User ${userId} starting work from office at distance: ${distance}m`);
    }
    
    const startTime = new Date();
    
    // Always reverse geocode to get detailed address (for both office and WFH)
    let finalAddress = address;
    if (!finalAddress || finalAddress === 'Work From Home' || finalAddress === 'Office Location' || finalAddress.toLowerCase().includes('work from home')) {
      try {
        const geocodeResult = await reverseGeocode(latitude, longitude);
        finalAddress = geocodeResult.fullAddress || geocodeResult.displayName || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        console.log(`📍 User ${userId} location geocoded: ${finalAddress} (${latitude}, ${longitude})`);
      } catch (error) {
        console.warn(`⚠️ Reverse geocoding failed: ${error.message}`);
        finalAddress = finalAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    }
    
    // Create or update attendance record
    let attendanceRecord;
    
    if (existingRecord) {
      // Update existing record
      existingRecord.startDayTime = startTime;
      existingRecord.startDayLocation = {
        latitude,
        longitude,
        address: finalAddress,
        accuracy
      };
      existingRecord.workPattern = workFromHome ? 'Remote' : 'Regular';
      existingRecord.isPresent = true;
      existingRecord.isVerified = locationValidated;
      existingRecord.spamStatus = 'Valid'; // Normal start-day flow - not spam
      existingRecord.autoEnded = false;
      
      if (existingRecord.source === 'Biometric') {
        existingRecord.source = 'Both';
      } else {
        existingRecord.source = 'StartDay';
      }
      
      attendanceRecord = existingRecord;
    } else {
      // Create new record
      attendanceRecord = new Attendance({
        user: userId,
        date: today,
        startDayTime: startTime,
        startDayLocation: {
          latitude,
          longitude,
          address: finalAddress,
          accuracy
        },
        workPattern: workFromHome ? 'Remote' : 'Regular',
        isPresent: true,
        isVerified: locationValidated,
        source: 'StartDay',
        spamStatus: 'Valid', // Normal start-day flow - not spam
        autoEnded: false
      });
    }
    
    await attendanceRecord.save();
    
    // Also create/update DailyAttendance record for enhanced tracking
    const DailyAttendance = require('../models/DailyAttendance');
    
    let dailyRecord = await DailyAttendance.findOne({
      user: userId,
      date: today
    });
    
    if (dailyRecord) {
      // Update existing daily record
      dailyRecord.startDayTime = startTime;
      dailyRecord.startDayLocation = {
        latitude,
        longitude,
        address: finalAddress,
        accuracy
      };
      dailyRecord.workLocationType = workLocationType;
      dailyRecord.isPresent = true;
      dailyRecord.status = 'Present';
      dailyRecord.source = 'StartDay';
      dailyRecord.spamStatus = 'Valid'; // Normal start-day flow - not spam
      dailyRecord.autoEnded = false;
    } else {
      // Create new daily record
      dailyRecord = new DailyAttendance({
        user: userId,
        date: today,
        startDayTime: startTime,
        startDayLocation: {
          latitude,
          longitude,
          address: finalAddress,
          accuracy
        },
        workLocationType: workLocationType,
        isPresent: true,
        status: 'Present',
        source: 'StartDay',
        spamStatus: 'Valid', // Normal start-day flow - not spam
        autoEnded: false
      });
    }
    
    await dailyRecord.save();
    
    // Update today's aim with work location if it exists (don't create default aims)
    try {
      const Aim = require('../models/Aim');
      let todayAim = await Aim.findOne({
        user: userId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      if (todayAim) {
        // Update existing aim with work location
        todayAim.workLocation = workLocationType;
        await todayAim.save();
        console.log(`🏢 Updated aim work location to ${workLocationType} for user ${userId}`);
      } else {
        console.log(`📝 No aim found for user ${userId} - user should set their own aim`);
      }
    } catch (aimError) {
      // Don't fail start-day if aim update fails
      console.warn(`⚠️ Failed to update aim work location for user ${userId}:`, aimError.message);
    }
    
    // Emit socket event
    if (req.io) {
      req.io.emit('attendance:day-started', {
        userId,
        startTime,
        location: { latitude, longitude, address },
        workLocationType
      });
    }
    
    res.json({
      success: true,
      message: `Day started successfully${workFromHome ? ' from home' : ' from office'}!`,
      startTime,
      location: { latitude, longitude, address },
      workLocationType,
      distanceFromOffice: workFromHome ? null : geolib.getDistance(
        { latitude: OFFICE_COORDINATES.latitude, longitude: OFFICE_COORDINATES.longitude },
        { latitude, longitude }
      )
    });
    
  } catch (error) {
    console.error('❌ Start day error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to start day',
      details: error.message,
      code: 'START_DAY_ERROR'
    });
  }
});

// 🔧 FIXED: Enhanced end day with ONLY progress validation (aim validation removed)
router.post('/end-day/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude, address, accuracy, notes } = req.body;
    
    // Verify user authorization
    if (req.user.id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const attendanceRecord = await Attendance.findOne({
      user: userId,
      date: today
    });
    
    if (!attendanceRecord || !attendanceRecord.startDayTime) {
      return res.status(400).json({ 
        error: 'Day not started yet. Please start your day first.',
        code: 'DAY_NOT_STARTED'
      });
    }
    
    if (attendanceRecord.endDayTime) {
      return res.status(400).json({ 
        error: 'Day already ended',
        endTime: attendanceRecord.endDayTime,
        code: 'DAY_ALREADY_ENDED'
      });
    }
    
    // =====================================
    // MANDATORY VALIDATIONS BEFORE END DAY
    // =====================================
    
    // ✅ ONLY CHECK PROGRESS - AIM VALIDATION REMOVED
    const Progress = require('../models/Progress');
    const todayProgress = await Progress.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Check if progress exists (lenient validation - just needs to exist)
    const hasProgressContent = todayProgress && (
      (todayProgress.notes && todayProgress.notes.trim() !== '') ||
      (todayProgress.achievements && todayProgress.achievements.trim() !== '') ||
      (todayProgress.blockers && todayProgress.blockers.trim() !== '') ||
      (todayProgress.tasksCompleted && todayProgress.tasksCompleted.length > 0) ||
      todayProgress.percentageCompleted !== undefined
    );
    
    // RELAXED VALIDATION: Only warn, don't block
    if (!hasProgressContent) {
      console.log(`⚠️ User ${userId} is ending day without detailed progress - allowing anyway`);
      // Don't block - just log the warning
    }
    
    // 🎯 Get aim for reference but don't block end-day if not completed
    const Aim = require('../models/Aim');
    const todayAim = await Aim.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    console.log(`✅ Progress validation passed for user ${userId} - Progress: ${hasProgressContent ? 'Yes' : 'No'} (notes: ${!!todayProgress?.notes}, achievements: ${!!todayProgress?.achievements}, blockers: ${!!todayProgress?.blockers}), Aim: ${todayAim?.completionStatus || 'No aim set'}`);
    
    // =====================================
    // PROCEED WITH END DAY
    // =====================================
    
    const endTime = new Date();
    
    // Check if this is a WFH employee and get exact address if needed
    const isWFH = attendanceRecord.workPattern === 'Remote' || 
                   attendanceRecord.startDayLocation?.address?.toLowerCase().includes('work from home') ||
                   attendanceRecord.startDayLocation?.address?.toLowerCase().includes('wfh');
    
    let endDayAddress = address;
    
    // If WFH and address is not provided or is generic, reverse geocode to get exact address
    if (isWFH && (!endDayAddress || endDayAddress === 'Work From Home' || endDayAddress.toLowerCase().includes('work from home'))) {
      if (latitude && longitude) {
        try {
          const geocodeResult = await reverseGeocode(latitude, longitude);
          endDayAddress = geocodeResult.fullAddress || geocodeResult.displayName || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          console.log(`📍 User ${userId} ending WFH day at: ${endDayAddress} (${latitude}, ${longitude})`);
        } catch (error) {
          console.warn(`⚠️ Reverse geocoding failed for WFH end location: ${error.message}`);
          endDayAddress = latitude && longitude ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : 'Work From Home';
        }
      } else {
        endDayAddress = endDayAddress || 'Work From Home';
      }
    }
    
    attendanceRecord.endDayTime = endTime;
    if (latitude && longitude) {
      attendanceRecord.endDayLocation = {
        latitude,
        longitude,
        address: endDayAddress || address,
        accuracy
      };
    }
    
    if (notes) {
      attendanceRecord.employeeNotes = notes;
    }

    // Calculate detailed working hours BEFORE saving
    const startTime = attendanceRecord.startDayTime;
    const totalMilliseconds = endTime - startTime;
    const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
    const hoursWorked = totalMilliseconds / (1000 * 60 * 60);

    // Update attendance record with calculated values
    attendanceRecord.hoursWorked = Math.round(hoursWorked * 100) / 100;
    attendanceRecord.isPresent = true;
    
    // Calculate overtime if applicable
    const standardHours = 8;
    if (hoursWorked > standardHours) {
      attendanceRecord.overtimeHours = Math.round((hoursWorked - standardHours) * 100) / 100;
    } else {
      attendanceRecord.overtimeHours = 0;
    }

    // Mark as verified since it's manually ended with validations
    attendanceRecord.isVerified = true;
    attendanceRecord.approvalStatus = 'Auto-Approved';
    attendanceRecord.spamStatus = 'Valid'; // Normal end-day flow - not spam
    attendanceRecord.autoEnded = false;

    await attendanceRecord.save();
    
    // =====================================
    // LOCATION DISCREPANCY DETECTION
    // =====================================
    const LocationDiscrepancy = require('../models/LocationDiscrepancy');
    const MonitoringAlert = require('../models/MonitoringAlert');
    const LOCATION_DISCREPANCY_THRESHOLD = parseInt(process.env.LOCATION_DISCREPANCY_THRESHOLD) || 5000; // 5km default
    
    // Check if both start and end locations exist and calculate distance
    if (attendanceRecord.startDayLocation && 
        attendanceRecord.startDayLocation.latitude && 
        attendanceRecord.endDayLocation && 
        attendanceRecord.endDayLocation.latitude) {
      
      try {
        const discrepancy = await LocationDiscrepancy.createDiscrepancy({
          user: userId,
          attendance: attendanceRecord._id,
          date: today,
          startLocation: {
            latitude: attendanceRecord.startDayLocation.latitude,
            longitude: attendanceRecord.startDayLocation.longitude,
            address: attendanceRecord.startDayLocation.address,
            accuracy: attendanceRecord.startDayLocation.accuracy,
            timestamp: attendanceRecord.startDayTime
          },
          endLocation: {
            latitude: attendanceRecord.endDayLocation.latitude,
            longitude: attendanceRecord.endDayLocation.longitude,
            address: attendanceRecord.endDayLocation.address,
            accuracy: attendanceRecord.endDayLocation.accuracy,
            timestamp: endTime
          },
          threshold: LOCATION_DISCREPANCY_THRESHOLD
        });
        
        // If discrepancy found, create alert for admin
        if (discrepancy) {
          const user = await User.findById(userId).select('name email employeeId');
          
          // Create monitoring alert for admin
          await MonitoringAlert.createAlert({
            employee: userId,
            alert_type: 'location_discrepancy',
            severity: discrepancy.severity,
            title: '📍 Location Discrepancy Detected',
            description: `${user?.name || 'Employee'} started and ended day at locations ${discrepancy.distanceKm.toFixed(2)}km apart`,
            data: {
              discrepancyId: discrepancy._id,
              attendanceId: attendanceRecord._id,
              distanceKm: discrepancy.distanceKm,
              distanceM: discrepancy.distance,
              startLocation: {
                lat: discrepancy.startLocation.latitude,
                lng: discrepancy.startLocation.longitude,
                address: discrepancy.startLocation.address
              },
              endLocation: {
                lat: discrepancy.endLocation.latitude,
                lng: discrepancy.endLocation.longitude,
                address: discrepancy.endLocation.address
              },
              startTime: attendanceRecord.startDayTime,
              endTime: endTime
            },
            status: 'active',
            auto_generated: true,
            notification_sent: true,
            notification_channels: ['dashboard']
          });
          
          // Mark discrepancy as alert sent
          discrepancy.alertSent = true;
          discrepancy.alertSentAt = new Date();
          await discrepancy.save();
          
          // Emit socket event for real-time admin notification
          if (req.io) {
            req.io.emit('location-discrepancy-alert', {
              userId,
              userName: user?.name,
              discrepancyId: discrepancy._id,
              distanceKm: discrepancy.distanceKm,
              severity: discrepancy.severity,
              timestamp: new Date()
            });
          }
          
          console.log(`⚠️ Location discrepancy detected for user ${userId}: ${discrepancy.distanceKm}km between start and end locations`);
        }
      } catch (error) {
        console.error('Error checking location discrepancy:', error);
        // Don't fail the end-day process if discrepancy check fails
      }
    }
    
    // Update DailyAttendance record as well
    const DailyAttendance = require('../models/DailyAttendance');
    const dailyRecord = await DailyAttendance.findOne({
      user: userId,
      date: today
    });
    
    if (dailyRecord) {
      dailyRecord.endDayTime = endTime;
      if (latitude && longitude) {
        dailyRecord.endDayLocation = {
          latitude,
          longitude,
          address,
          accuracy
        };
      }
      dailyRecord.totalHoursWorked = Math.round(hoursWorked * 100) / 100;
      dailyRecord.isPresent = true;
      dailyRecord.status = 'Present';
      dailyRecord.dailyProgressCompleted = true;
      dailyRecord.dailyAimCompleted = todayAim ? (todayAim.completionStatus !== 'Pending') : false;
      dailyRecord.aimCompletionStatus = todayAim?.completionStatus || 'Not Set';
      dailyRecord.aimCompletionComment = todayAim?.completionComment || '';
      dailyRecord.spamStatus = 'Valid'; // Normal end-day flow - not spam
      dailyRecord.autoEnded = false;
      
      await dailyRecord.save();
    }
    
    // Emit socket event
    if (req.io) {
      req.io.emit('attendance:day-ended', {
        userId,
        endTime,
        hoursWorked: attendanceRecord.hoursWorked,
        progressCompleted: true,
        aimCompleted: todayAim ? (todayAim.completionStatus !== 'Pending') : false
      });
    }
    
    res.json({
      success: true,
      message: `Day ended successfully! You worked ${attendanceRecord.hoursWorked} hours today.`,
      data: {
        endTime,
        startTime: attendanceRecord.startDayTime,
        hoursWorked: attendanceRecord.hoursWorked,
        overtimeHours: attendanceRecord.overtimeHours,
        isOvertime: attendanceRecord.overtimeHours > 0,
        attendanceId: attendanceRecord._id,
        validations: {
          progressCompleted: true,
          aimCompleted: todayAim ? (todayAim.completionStatus !== 'Pending') : false,
          aimStatus: todayAim?.completionStatus || 'Not Set'
        }
      }
    });

  } catch (error) {
    console.error('❌ End day error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to end day',
      details: error.message,
      code: 'END_DAY_ERROR'
    });
  }
});

/**
 * AUTO END DAY AT MIDNIGHT - NEW IMPLEMENTATION
 * This endpoint is called by a scheduled job at midnight (12:00 AM)
 * It auto-ends all unended work days and marks them as spam (Pending Review)
 * Admin can later validate these records (max 8 hours)
 */
router.post('/auto-end-day-midnight', auth, async (req, res) => {
  try {
    // Only allow Admin or system to run this
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ 
        error: 'Only Admin can trigger midnight auto-end',
        code: 'ADMIN_REQUIRED'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date (the day that just ended at midnight)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    console.log(`🕛 Running midnight auto-end for date: ${yesterday.toISOString().split('T')[0]}`);

    // Find all attendance records from yesterday that started but haven't ended
    const activeAttendance = await Attendance.find({
      date: {
        $gte: yesterday,
        $lte: yesterdayEnd
      },
      startDayTime: { $exists: true, $ne: null },
      endDayTime: { $exists: false }
    }).populate('user', 'name email');

    const autoEndedUsers = [];
    const midnightTime = today; // Midnight of the new day

    for (const record of activeAttendance) {
      try {
        // Calculate actual hours worked (from start to midnight)
        const startTime = new Date(record.startDayTime);
        const hoursWorked = (midnightTime - startTime) / (1000 * 60 * 60);

        // Auto end the day at midnight
        record.endDayTime = midnightTime;
        record.hoursWorked = Math.round(hoursWorked * 100) / 100;
        record.autoEnded = true;
        record.spamStatus = 'Pending Review';
        record.spamReason = 'User did not click End Day before midnight - auto-ended by system';
        record.systemNotes = `Auto-ended at midnight. Original hours: ${record.hoursWorked}h. Admin validation grants exactly ${SPAM_VALIDATION_HOURS}h`;
        record.employeeNotes = (record.employeeNotes || '') + ' [Auto-ended at midnight - Pending admin review]';

        // Set overtime to 0 for spam records
        record.overtimeHours = 0;
        
        // Mark as unverified pending review
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
          dailyRecord.spamReason = 'User did not click End Day before midnight';
          dailyRecord.systemNotes = `Auto-ended at midnight. Actual hours: ${record.hoursWorked}h. Admin validation grants exactly ${SPAM_VALIDATION_HOURS}h`;
          await dailyRecord.save();
        }

        autoEndedUsers.push({
          userId: record.user._id,
          userName: record.user.name,
          userEmail: record.user.email,
          date: yesterday.toISOString().split('T')[0],
          startTime: record.startDayTime,
          hoursWorked: record.hoursWorked,
          autoEndTime: midnightTime,
          spamStatus: 'Pending Review'
        });

        console.log(`⚠️ Auto-ended work day for ${record.user.name} - ${record.hoursWorked}h (marked as spam)`);

        // Emit socket event if available
        if (req.io) {
          req.io.emit('attendance:auto-ended-midnight', {
            userId: record.user._id,
            userName: record.user.name,
            date: yesterday.toISOString().split('T')[0],
            hoursWorked: record.hoursWorked,
            reason: 'Did not end day before midnight',
            spamStatus: 'Pending Review'
          });
        }
      } catch (recordError) {
        console.error(`Error auto-ending record for user ${record.user?.name}:`, recordError);
      }
    }

    console.log(`✅ Midnight auto-end complete. Processed ${autoEndedUsers.length} records.`);

    res.json({
      success: true,
      message: `Auto-ended ${autoEndedUsers.length} unfinished work day(s) at midnight`,
      autoEndedUsers,
      date: yesterday.toISOString().split('T')[0],
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Midnight auto-end error:', error);
    res.status(500).json({ 
      error: 'Failed to process midnight auto-end',
      details: error.message 
    });
  }
});

/**
 * POST /api/attendance/validate-spam-hours/:recordId
 * Admin validates spam hours - SIMPLE RULE: User gets EXACTLY 8 hours (not more, not less)
 * These 8 hours add to cumulative hours
 */
router.post('/validate-spam-hours/:recordId', auth, adminAuth, async (req, res) => {
  try {
    const { recordId } = req.params;
    const { reason } = req.body;

    // Find the attendance record
    const record = await Attendance.findById(recordId).populate('user', 'name email');
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (!record.autoEnded) {
      return res.status(400).json({ error: 'This record was not auto-ended' });
    }

    // SIMPLE LOGIC: Calculate correct hours if endDayTime is missing
    let actualHoursWorked = record.hoursWorked;
    
    if (!record.endDayTime && record.startDayTime) {
      // Record was never properly ended - calculate up to midnight of start day
      const startTime = new Date(record.startDayTime);
      const startDate = new Date(record.date);
      const midnightAfterStart = new Date(startDate);
      midnightAfterStart.setDate(midnightAfterStart.getDate() + 1);
      midnightAfterStart.setHours(0, 0, 0, 0);
      
      actualHoursWorked = (midnightAfterStart - startTime) / (1000 * 60 * 60);
      
      // Update the record with correct end time (midnight)
      record.endDayTime = midnightAfterStart;
      record.hoursWorked = Math.round(actualHoursWorked * 100) / 100;
      
      console.log(`🔧 Fixed missing endDayTime for ${record.user.name}: Hours to midnight: ${record.hoursWorked}h`);
    } else if (record.endDayTime && record.startDayTime) {
      // Recalculate to ensure accuracy
      const startTime = new Date(record.startDayTime);
      const endTime = new Date(record.endDayTime);
      actualHoursWorked = (endTime - startTime) / (1000 * 60 * 60);
      record.hoursWorked = Math.round(actualHoursWorked * 100) / 100;
    }

    // Save original hours before updating
    const originalHours = record.hoursWorked;

    // SIMPLE RULE: Spam validation = EXACTLY 8 hours (not more, not less)
    const validatedHours = 8;
    
    // Detect if this is a midnight span
    const isMidnightSpan = record.spanType === 'MIDNIGHT_SPAN' || 
                           (record.spamReason && record.spamReason.toLowerCase().includes('midnight'));

    // Update record with EXACTLY 8 hours
    record.hoursWorked = validatedHours;
    record.spamStatus = 'Valid';
    record.validatedBy = req.user.id;
    record.validatedAt = new Date();
    record.spamReason = reason || (isMidnightSpan 
      ? `Midnight span validated - Fixed ${validatedHours}h granted (actual: ${originalHours}h)` 
      : `Admin validated - User gets exactly ${validatedHours} hours (actual: ${originalHours}h)`);
    record.approvalStatus = 'Approved';

    await record.save();

    // Also update DailyAttendance
    const dailyRecord = await DailyAttendance.findOne({
      user: record.user._id,
      date: record.date
    });

    if (dailyRecord) {
      dailyRecord.totalHoursWorked = validatedHours;
      dailyRecord.spamStatus = 'Valid';
      dailyRecord.validatedBy = req.user.id;
      dailyRecord.validatedAt = new Date();
      dailyRecord.spamReason = `Admin validated - Exactly 8 hours granted`;
      await dailyRecord.save();
    }

    console.log(`✅ Admin validated spam record for ${record.user.name}: Granted exactly 8h (actual was: ${originalHours}h)`);

    res.json({
      success: true,
      message: `Validated spam record - User gets exactly 8 hours`,
      data: {
        recordId: record._id,
        userName: record.user.name,
        actualHours: originalHours,
        validatedHours: validatedHours,
        rule: 'Spam validation always grants exactly 8 hours',
        validatedBy: req.user.name,
        validatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Validate spam hours error:', error);
    res.status(500).json({ error: 'Failed to validate spam hours', details: error.message });
  }
});

// Legacy auto-end day endpoint - returns info about new midnight system
router.post('/auto-end-day', auth, async (req, res) => {
  return res.status(400).json({ 
    error: 'Auto end day during work hours is disabled. Work days are auto-ended at midnight if not manually ended.',
    code: 'AUTO_END_DISABLED',
    info: 'Unended work days at midnight go to spam queue for admin validation (max 8 hours)'
  });
});

// OLD AUTO-END DAY CODE (DISABLED):
// router.post('/auto-end-day', auth, async (req, res) => {
//   try {
//     if (!AUTO_END_DAY_ENABLED) {
//       return res.status(400).json({ error: 'Auto end day is disabled' });
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Find all attendance records that started today but haven't ended
//     const activeAttendance = await Attendance.find({
//       date: today,
//       startDayTime: { $exists: true },
//       endDayTime: { $exists: false }
//     }).populate('user', 'name email');

//     const autoEndedUsers = [];
//     const currentTime = new Date();

//     for (const record of activeAttendance) {
//       const hoursWorked = (currentTime - record.startDayTime) / (1000 * 60 * 60);

//       if (hoursWorked >= MAX_WORKING_HOURS) {
//         // Auto end the day
//         record.endDayTime = currentTime;
//         record.employeeNotes = `Auto-ended after ${MAX_WORKING_HOURS} hours of work`;
//         record.autoEnded = true;

//         await record.save();

//         autoEndedUsers.push({
//           userId: record.user._id,
//           userName: record.user.name,
//           hoursWorked: Math.round(hoursWorked * 100) / 100,
//           autoEndTime: currentTime
//         });

//         // Emit socket event
//         if (req.io) {
//           req.io.emit('attendance:auto-day-ended', {
//             userId: record.user._id,
//             userName: record.user.name,
//             endTime: currentTime,
//             hoursWorked: record.hoursWorked,
//             reason: 'Exceeded maximum working hours'
//           });
//         }
//       }
//     }

//     res.json({
//       success: true,
//       message: `Auto-ended ${autoEndedUsers.length} user(s)`,
//       autoEndedUsers,
//       maxWorkingHours: MAX_WORKING_HOURS
//     });

//   } catch (error) {
//     console.error('Auto end day error:', error);
//     res.status(500).json({ error: 'Failed to auto end day' });
//   }
// });

// Get attendance analytics
// Reverse geocode endpoint (for frontend to get address details)
// IMPORTANT: This route must be defined before parameterized routes like /user/:userId
router.get('/reverse-geocode', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }
    
    console.log(`📍 Reverse geocoding request for: ${lat}, ${lng}`);
    const geocodeResult = await reverseGeocode(lat, lng);
    console.log(`✅ Reverse geocoding result:`, {
      fullAddress: geocodeResult.fullAddress,
      area: geocodeResult.area,
      city: geocodeResult.city,
      state: geocodeResult.state,
      pincode: geocodeResult.pincode
    });
    
    // Build formatted address from components
    const addressParts = [];
    if (geocodeResult.houseNumber) addressParts.push(geocodeResult.houseNumber);
    if (geocodeResult.road) addressParts.push(geocodeResult.road);
    if (geocodeResult.area) addressParts.push(geocodeResult.area);
    if (geocodeResult.city) addressParts.push(geocodeResult.city);
    if (geocodeResult.state) addressParts.push(geocodeResult.state);
    if (geocodeResult.pincode) addressParts.push(geocodeResult.pincode);
    if (geocodeResult.country) addressParts.push(geocodeResult.country);
    
    const formattedAddress = addressParts.length > 0 
      ? addressParts.join(', ')
      : geocodeResult.fullAddress || geocodeResult.displayName;
    
    res.json({
      success: true,
      data: {
        fullAddress: geocodeResult.fullAddress || geocodeResult.displayName,
        displayName: geocodeResult.displayName,
        pincode: geocodeResult.pincode || 'N/A',
        area: geocodeResult.area || 'N/A',
        city: geocodeResult.city || 'N/A',
        state: geocodeResult.state || 'N/A',
        country: geocodeResult.country || 'N/A',
        road: geocodeResult.road || 'N/A',
        houseNumber: geocodeResult.houseNumber || 'N/A',
        formattedAddress: formattedAddress || geocodeResult.fullAddress || geocodeResult.displayName
      }
    });
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reverse geocode location'
    });
  }
});

router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate, userId, department } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Build match condition
    const matchCondition = {
      date: { $gte: start, $lte: end }
    };

    if (userId) {
      matchCondition.user = new mongoose.Types.ObjectId(userId);
    }

    if (department) {
      const users = await User.find({ department }).select('_id');
      matchCondition.user = { $in: users.map(u => u._id) };
    }

    // Get overall statistics
    const stats = await Attendance.getAttendanceStats(start, end, userId);

    // Get daily breakdown
    const dailyStats = await Attendance.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalEmployees: { $addToSet: '$user' },
          presentCount: { $sum: { $cond: ['$isPresent', 1, 0] } },
          verifiedCount: { $sum: { $cond: ['$isVerified', 1, 0] } },
          leaveCount: { $sum: { $cond: ['$isLeave', 1, 0] } },
          discrepancyCount: { $sum: { $cond: ['$hasDiscrepancy', 1, 0] } },
          avgHours: { $avg: '$hoursWorked' },
          totalOvertimeHours: { $sum: '$overtimeHours' }
        }
      },
      {
        $project: {
          date: '$_id',
          totalEmployees: { $size: '$totalEmployees' },
          presentCount: 1,
          verifiedCount: 1,
          leaveCount: 1,
          discrepancyCount: 1,
          absentCount: { $subtract: [{ $size: '$totalEmployees' }, '$presentCount'] },
          attendanceRate: {
            $multiply: [
              { $divide: ['$presentCount', { $size: '$totalEmployees' }] },
              100
            ]
          },
          avgHours: { $round: ['$avgHours', 2] },
          totalOvertimeHours: { $round: ['$totalOvertimeHours', 2] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get top performers
    const topPerformers = await Attendance.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$user',
          attendanceRate: {
            $avg: { $cond: ['$isPresent', 100, 0] }
          },
          avgHours: { $avg: '$hoursWorked' },
          totalOvertimeHours: { $sum: '$overtimeHours' },
          discrepancies: { $sum: { $cond: ['$hasDiscrepancy', 1, 0] } }
        }
      },
      { $sort: { attendanceRate: -1, avgHours: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          avatar: '$user.avatar',
          attendanceRate: { $round: ['$attendanceRate', 1] },
          avgHours: { $round: ['$avgHours', 2] },
          totalOvertimeHours: { $round: ['$totalOvertimeHours', 2] },
          discrepancies: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats,
        dailyBreakdown: dailyStats,
        topPerformers,
        dateRange: { start, end }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get user-specific attendance records
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    // Verify user authorization
    if (req.user.id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const skip = (page - 1) * limit;

    const records = await Attendance.find({
      user: userId,
      date: { $gte: start, $lte: end }
    })
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('leaveReference', 'reason leaveType')
    .populate('approvedBy', 'name');

    const total = await Attendance.countDocuments({
      user: userId,
      date: { $gte: start, $lte: end }
    });

    const stats = await Attendance.getAttendanceStats(start, end, userId);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      }
    });

  } catch (error) {
    console.error('User attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch user attendance' });
  }
});

// Verify attendance for a specific day
router.get('/verify/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: userId,
      date: targetDate
    }).populate('user', 'name email');

    if (!attendance) {
      return res.json({
        success: true,
        data: {
          isPresent: false,
          isVerified: false,
          message: 'No attendance record found for this date'
        }
      });
    }

    res.json({
      success: true,
      data: {
        ...attendance.toObject(),
        statusDisplay: attendance.statusDisplay,
        statusColor: attendance.statusColor
      }
    });

  } catch (error) {
    console.error('Verify attendance error:', error);
    res.status(500).json({ error: 'Failed to verify attendance' });
  }
});

// Get live attendance data for dashboard
router.get('/live', adminAuth, async (req, res) => {
  try {
    const { date, department, status } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    // Set date range for the day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active users
    let userQuery = { isActive: { $ne: false } }; // Users who are not explicitly deactivated
    if (department && department !== 'all') {
      userQuery.department = department;
    }
    
    const allUsers = await User.find(userQuery)
      .select('_id name email avatar department employeeId')
      .lean();

    console.log(`📊 Found ${allUsers.length} active users`);

    // Fetch attendance records for today
    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('user', 'name email avatar department employeeId')
      .sort({ updatedAt: -1 })
      .lean();

    console.log(`📊 Found ${attendance.length} attendance records for today`);

    // Create a map of user attendance
    const attendanceMap = new Map();
    attendance.forEach(record => {
      if (record.user && record.user._id) {
        attendanceMap.set(record.user._id.toString(), record);
      }
    });

    // Build complete attendance list with all users
    const completeAttendance = allUsers.map(user => {
      const userId = user._id.toString();
      const attendanceRecord = attendanceMap.get(userId);
      
      if (attendanceRecord) {
        // User has attendance record
        return {
          ...attendanceRecord,
          status: attendanceRecord.isPresent ? 
            (attendanceRecord.isLate ? 'late' : 'present') :
            (attendanceRecord.isLeave ? 'on-leave' : 'absent')
        };
      } else {
        // User has no attendance - mark as absent
        return {
          _id: null, // No attendance record ID
          user: user,
          date: startOfDay,
          isPresent: false,
          isVerified: false,
          isLeave: false,
          isLate: false,
          status: 'absent',
          startDayTime: null,
          endDayTime: null,
          hoursWorked: 0,
          workPattern: null,
          source: null
        };
      }
    });

    // Apply status filter if provided
    let filteredAttendance = completeAttendance;
    if (status && status !== 'all') {
      filteredAttendance = completeAttendance.filter(record => {
        if (status === 'present') return record.isPresent && !record.isLate;
        if (status === 'absent') return !record.isPresent && !record.isLeave;
        if (status === 'late') return record.isLate;
        if (status === 'on-leave') return record.isLeave;
        return true;
      });
    }

    // Calculate comprehensive stats
    const totalEmployees = allUsers.length;
    const presentToday = completeAttendance.filter(a => a.isPresent).length;
    const absentToday = completeAttendance.filter(a => !a.isPresent && !a.isLeave).length;
    const lateToday = completeAttendance.filter(a => a.isLate).length;
    const onLeaveToday = completeAttendance.filter(a => a.isLeave).length;
    const onTimeToday = presentToday - lateToday;
    const dayStartedCount = completeAttendance.filter(a => a.startDayTime).length;
    const dayEndedCount = completeAttendance.filter(a => a.endDayTime).length;

    const totalHoursToday = completeAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
    const avgHoursToday = presentToday > 0 ? Math.round((totalHoursToday / presentToday) * 100) / 100 : 0;

    const stats = {
      totalEmployees,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday,
      onTimeToday,
      dayStartedCount,
      dayEndedCount,
      presentPercentage: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100 * 10) / 10 : 0,
      absentPercentage: totalEmployees > 0 ? Math.round((absentToday / totalEmployees) * 100 * 10) / 10 : 0,
      onTimePercentage: presentToday > 0 ? Math.round((onTimeToday / presentToday) * 100 * 10) / 10 : 0,
      avgHoursToday,
      totalHoursToday: Math.round(totalHoursToday * 100) / 100
    };

    res.json({
      success: true,
      data: {
        attendance: filteredAttendance,
        stats,
        date: targetDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Get live attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live attendance data',
      details: error.message
    });
  }
});

// Upload and process biometric Excel file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    console.log('📁 Processing biometric file:', req.file.originalname);

    const BiometricUpload = require('../models/BiometricUpload');
    
    // Read the Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      fs.unlinkSync(req.file.path); // Clean up
      return res.status(400).json({ 
        success: false,
        error: 'No data found in Excel file' 
      });
    }

    const attendanceData = [];
    const preview = [];
    const errors = [];
    let dateRange = { start: null, end: null };
    
    // Process each row (skip header)
    let rowNumber = 0;
    worksheet.eachRow((row, index) => {
      if (index === 1) {
        // Store headers
        return;
      }
      
      rowNumber++;
      
      try {
        const employeeId = row.getCell(1).value?.toString().trim();
        const dateValue = row.getCell(2).value;
        const timeIn = row.getCell(3).value;
        const timeOut = row.getCell(4).value;
        const deviceId = row.getCell(5).value?.toString() || 'Unknown';
        const location = row.getCell(6).value?.toString() || 'Main Office';
        
        if (!employeeId || !dateValue) {
          errors.push(`Row ${rowNumber}: Missing employee ID or date`);
          return;
        }
        
        // Parse date
        let attendanceDate;
        if (dateValue instanceof Date) {
          attendanceDate = dateValue;
        } else if (typeof dateValue === 'number') {
          // Excel date serial number
          attendanceDate = new Date((dateValue - 25569) * 86400 * 1000);
        } else {
          attendanceDate = new Date(dateValue);
        }
        
        if (isNaN(attendanceDate.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid date format`);
          return;
        }
        
        // Parse times
        const parseTime = (timeValue, date) => {
          if (!timeValue) return null;
          
          if (timeValue instanceof Date) {
            return timeValue;
          }
          
          if (typeof timeValue === 'number') {
            // Excel time serial (fraction of day)
            const hours = Math.floor(timeValue * 24);
            const minutes = Math.floor((timeValue * 24 * 60) % 60);
            const resultDate = new Date(date);
            resultDate.setHours(hours, minutes, 0, 0);
            return resultDate;
          }
          
          if (typeof timeValue === 'string') {
            const timeParts = timeValue.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
            if (timeParts) {
              const resultDate = new Date(date);
              resultDate.setHours(
                parseInt(timeParts[1]), 
                parseInt(timeParts[2]), 
                parseInt(timeParts[3] || '0'), 
                0
              );
              return resultDate;
            }
          }
          
          return null;
        };
        
        const parsedTimeIn = parseTime(timeIn, attendanceDate);
        const parsedTimeOut = parseTime(timeOut, attendanceDate);
        
        // Calculate hours
        let hours = 0;
        if (parsedTimeIn && parsedTimeOut) {
          hours = (parsedTimeOut - parsedTimeIn) / (1000 * 60 * 60);
          if (hours < 0) hours = 0;
        }
        
        const record = {
          employeeId,
          date: attendanceDate.toISOString().split('T')[0],
          timeIn: parsedTimeIn ? parsedTimeIn.toISOString() : null,
          timeOut: parsedTimeOut ? parsedTimeOut.toISOString() : null,
          hours: Math.round(hours * 100) / 100,
          deviceId,
          location
        };
        
        attendanceData.push(record);
        
        // Update date range
        if (!dateRange.start || attendanceDate < new Date(dateRange.start)) {
          dateRange.start = attendanceDate.toISOString().split('T')[0];
        }
        if (!dateRange.end || attendanceDate > new Date(dateRange.end)) {
          dateRange.end = attendanceDate.toISOString().split('T')[0];
        }
        
        // Add to preview (first 10 records)
        if (preview.length < 10) {
          preview.push(record);
        }
        
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    });
    
    // Create biometric upload record
    const biometricRecord = new BiometricUpload({
      uploadDate: new Date(),
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      processedBy: req.user.id,
      totalRecords: attendanceData.length,
      status: 'Pending Review',
      preview: {
        headers: ['Employee ID', 'Date', 'Time In', 'Time Out', 'Device ID', 'Location'],
        sampleRows: preview,
        totalRows: attendanceData.length,
        detectedFormat: 'Standard'
      },
      summary: {
        dateRange: {
          start: dateRange.start ? new Date(dateRange.start) : null,
          end: dateRange.end ? new Date(dateRange.end) : null
        }
      },
      errorLog: errors.map((err, idx) => ({
        row: idx + 1,
        error: err,
        timestamp: new Date()
      }))
    });
    
    await biometricRecord.save();
    
    // Store processed data temporarily (you might want to use a cache or session storage)
    // For now, we'll include it in the response
    
    console.log(`✅ Processed ${attendanceData.length} records from ${req.file.originalname}`);
    
    res.json({
      success: true,
      message: `Processed ${attendanceData.length} attendance records`,
      preview: preview,
      analysis: {
        totalRecords: attendanceData.length,
        dateRange: dateRange.start && dateRange.end ? 
          `${dateRange.start} to ${dateRange.end}` : 'N/A',
        errors: errors.length,
        fileId: biometricRecord._id
      },
      fileId: biometricRecord._id
    });

  } catch (error) {
    console.error('Biometric upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to process biometric file' 
    });
  }
});

// Confirm and import biometric upload
router.post('/confirm-upload', auth, async (req, res) => {
  try {
    const { fileId, applyChanges } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ 
        success: false,
        error: 'File ID is required' 
      });
    }
    
    const BiometricUpload = require('../models/BiometricUpload');
    const biometricRecord = await BiometricUpload.findById(fileId);
    
    if (!biometricRecord) {
      return res.status(404).json({ 
        success: false,
        error: 'Upload record not found' 
      });
    }
    
    if (!applyChanges) {
      // Just mark as reviewed
      biometricRecord.status = 'Completed';
      biometricRecord.approvalStatus = 'Rejected';
      biometricRecord.rejectionReason = 'User cancelled import';
      await biometricRecord.save();
      
      return res.json({
        success: true,
        message: 'Upload cancelled',
        imported: 0
      });
    }
    
    // Re-read and process the file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(biometricRecord.filePath);
    
    const worksheet = workbook.getWorksheet(1);
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    
    worksheet.eachRow(async (row, index) => {
      if (index === 1) return; // Skip header
      
      try {
        const employeeId = row.getCell(1).value?.toString().trim();
        const dateValue = row.getCell(2).value;
        const timeIn = row.getCell(3).value;
        const timeOut = row.getCell(4).value;
        
        if (!employeeId || !dateValue) {
          skipped++;
          return;
        }
        
        // Find user by employee ID
        const user = await User.findOne({ employeeId: employeeId });
        if (!user) {
          console.log(`User not found for employee ID: ${employeeId}`);
          skipped++;
          return;
        }
        
        // Parse date and times (same logic as before)
        let attendanceDate;
        if (dateValue instanceof Date) {
          attendanceDate = dateValue;
        } else if (typeof dateValue === 'number') {
          attendanceDate = new Date((dateValue - 25569) * 86400 * 1000);
        } else {
          attendanceDate = new Date(dateValue);
        }
        
        attendanceDate.setHours(0, 0, 0, 0);
        
        // Check if attendance already exists
        let existingAttendance = await Attendance.findOne({
          user: user._id,
          date: attendanceDate
        });
        
        if (existingAttendance) {
          // Update existing
          existingAttendance.biometricData = {
            timeIn: timeIn,
            timeOut: timeOut,
            uploadedAt: new Date()
          };
          await existingAttendance.save();
          updated++;
        } else {
          // Create new attendance record
          await Attendance.create({
            user: user._id,
            date: attendanceDate,
            status: 'Present',
            biometricData: {
              timeIn: timeIn,
              timeOut: timeOut,
              uploadedAt: new Date()
            }
          });
          imported++;
        }
        
      } catch (error) {
        console.error(`Error importing row ${index}:`, error);
        skipped++;
      }
    });
    
    // Update biometric record
    biometricRecord.status = 'Completed';
    biometricRecord.approvalStatus = 'Approved';
    biometricRecord.approvedBy = req.user.id;
    biometricRecord.approvedAt = new Date();
    biometricRecord.newRecords = imported;
    biometricRecord.updatedRecords = updated;
    await biometricRecord.save();
    
    res.json({
      success: true,
      message: `Successfully imported ${imported} new records and updated ${updated} records`,
      imported,
      updated,
      skipped
    });
    
  } catch (error) {
    console.error('Confirm upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to confirm upload' 
    });
  }
});

// =====================================
// LOCATION DISCREPANCY ROUTES
// =====================================

// Get location discrepancies (Admin only)
router.get('/location-discrepancies', auth, adminAuth, async (req, res) => {
  try {
    const { status, severity, startDate, endDate, limit = 50 } = req.query;
    
    const LocationDiscrepancy = require('../models/LocationDiscrepancy');
    const query = {};
    
    if (status) query.status = status;
    if (severity) query.severity = severity;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    
    const discrepancies = await LocationDiscrepancy.find(query)
      .populate('user', 'name email employeeId department')
      .populate('attendance', 'startDayTime endDayTime hoursWorked')
      .sort({ date: -1, distance: -1 })
      .limit(parseInt(limit));
    
    // Get statistics
    const stats = await LocationDiscrepancy.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
          avgDistance: { $avg: '$distance' },
          maxDistance: { $max: '$distance' }
        }
      }
    ]);
    
    res.json({
      success: true,
      discrepancies,
      statistics: stats[0] || {
        total: 0,
        pending: 0,
        critical: 0,
        high: 0,
        avgDistance: 0,
        maxDistance: 0
      },
      count: discrepancies.length
    });
  } catch (error) {
    console.error('Error fetching location discrepancies:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch location discrepancies'
    });
  }
});

// Update discrepancy status (Admin only)
router.put('/location-discrepancies/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    
    const LocationDiscrepancy = require('../models/LocationDiscrepancy');
    const discrepancy = await LocationDiscrepancy.findById(id);
    
    if (!discrepancy) {
      return res.status(404).json({
        success: false,
        error: 'Location discrepancy not found'
      });
    }
    
    if (status) {
      discrepancy.status = status;
      if (status === 'reviewed' || status === 'resolved') {
        discrepancy.reviewedBy = req.user.id;
        discrepancy.reviewedAt = new Date();
      }
    }
    
    if (resolutionNotes) {
      discrepancy.resolutionNotes = resolutionNotes;
    }
    
    await discrepancy.save();
    
    res.json({
      success: true,
      message: 'Location discrepancy updated successfully',
      discrepancy
    });
  } catch (error) {
    console.error('Error updating location discrepancy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update location discrepancy'
    });
  }
});

module.exports = router;