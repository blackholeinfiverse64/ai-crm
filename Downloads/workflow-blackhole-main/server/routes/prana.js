const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PranaActivity = require('../models/PranaActivity');
const User = require('../models/User');

// @route   POST /api/prana/ingest
// @desc    Ingest PRANA activity packet from client
// @access  Private
router.post('/ingest', auth, async (req, res) => {
  try {
    const { 
      session_id, 
      cognitive_state, 
      active_seconds, 
      idle_seconds, 
      away_seconds,
      focus_score,
      raw_signals 
    } = req.body;

    // Validate required fields
    if (!session_id || !cognitive_state || focus_score === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: session_id, cognitive_state, focus_score' 
      });
    }

    // Create new PRANA activity record
    const pranaActivity = new PranaActivity({
      user: req.user.id,
      session_id,
      cognitive_state,
      active_seconds: active_seconds || 0,
      idle_seconds: idle_seconds || 0,
      away_seconds: away_seconds || 0,
      focus_score,
      raw_signals: raw_signals || {}
    });

    await pranaActivity.save();

    // Emit real-time update to admin dashboard via Socket.IO
    if (req.io) {
      req.io.emit('prana:activity', {
        userId: req.user.id,
        userName: req.user.name,
        cognitive_state,
        focus_score,
        timestamp: pranaActivity.timestamp
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'PRANA packet ingested successfully',
      data: {
        id: pranaActivity._id,
        cognitive_state,
        focus_score
      }
    });
  } catch (error) {
    console.error('[PRANA] Error ingesting packet:', error);
    res.status(500).json({ error: 'Failed to ingest PRANA packet' });
  }
});

// @route   GET /api/prana/user/:userId
// @desc    Get PRANA activity for a specific user
// @access  Private (Admin/Manager)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    // Check if user has permission (Admin or Manager)
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build query
    const query = { user: userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else {
      // Default to last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.date = { $gte: sevenDaysAgo };
    }

    const activities = await PranaActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('[PRANA] Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// @route   GET /api/prana/summary/:userId
// @desc    Get PRANA activity summary for a user
// @access  Private (Admin/Manager)
router.get('/summary/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    // Check if user has permission
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Default to today
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Aggregate PRANA data
    const summary = await PranaActivity.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          date: {
            $gte: targetDate,
            $lt: nextDay
          }
        }
      },
      {
        $group: {
          _id: '$user',
          total_packets: { $sum: 1 },
          avg_focus_score: { $avg: '$focus_score' },
          total_active_seconds: { $sum: '$active_seconds' },
          total_idle_seconds: { $sum: '$idle_seconds' },
          total_away_seconds: { $sum: '$away_seconds' },
          state_distribution: {
            $push: {
              state: '$cognitive_state',
              focus_score: '$focus_score',
              timestamp: '$timestamp'
            }
          }
        }
      }
    ]);

    if (summary.length === 0) {
      return res.json({
        success: true,
        message: 'No activity data found for this date',
        data: {
          total_packets: 0,
          avg_focus_score: 0,
          total_active_time: 0,
          total_idle_time: 0,
          total_away_time: 0,
          state_counts: {}
        }
      });
    }

    const data = summary[0];
    
    // Calculate state distribution
    const stateCounts = {};
    data.state_distribution.forEach(item => {
      stateCounts[item.state] = (stateCounts[item.state] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total_packets: data.total_packets,
        avg_focus_score: Math.round(data.avg_focus_score * 10) / 10,
        total_active_time: data.total_active_seconds,
        total_idle_time: data.total_idle_seconds,
        total_away_time: data.total_away_seconds,
        state_counts: stateCounts,
        recent_activities: data.state_distribution.slice(-10).reverse()
      }
    });
  } catch (error) {
    console.error('[PRANA] Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// @route   GET /api/prana/live-status
// @desc    Get live PRANA status for all active users or specific user
// @access  Private (Admin/Manager)
router.get('/live-status', auth, async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { userId } = req.query;

    // If userId provided, get specific user's latest activity
    if (userId) {
      const latestActivity = await PranaActivity.findOne({
        user: userId
      })
      .sort({ timestamp: -1 })
      .lean();

      if (!latestActivity) {
        return res.json({
          success: true,
          data: null,
          message: 'No activity data found for this user'
        });
      }

      // Extract raw signals
      const rawSignals = latestActivity.raw_signals || {};

      res.json({
        success: true,
        data: {
          cognitive_state: latestActivity.cognitive_state,
          focus_score: latestActivity.focus_score,
          last_update: latestActivity.timestamp,
          mouse_inactivity_ms: rawSignals.mouse_inactivity_ms || 0,
          keyboard_inactivity_ms: rawSignals.keyboard_inactivity_ms || 0,
          click_count: rawSignals.click_count || 0,
          mouse_move_count: rawSignals.mouse_move_count || 0,
          mouse_velocity: rawSignals.mouse_velocity || 0,
          keypress_count: rawSignals.keypress_count || 0,
          typing_speed_wpm: rawSignals.typing_speed_wpm || 0,
          error_rate: rawSignals.error_rate || 0,
          tab_switch_count: rawSignals.tab_switch_count || 0,
          scroll_count: rawSignals.scroll_count || 0,
          focus_duration_ms: rawSignals.focus_duration_ms || 0
        }
      });
      return;
    }

    // Get last 30 seconds of activity for all users
    const thirtySecondsAgo = new Date(Date.now() - 30000);

    const recentActivities = await PranaActivity.find({
      timestamp: { $gte: thirtySecondsAgo }
    })
    .populate('user', 'name email avatar')
    .sort({ timestamp: -1 })
    .lean();

    // Group by user to get latest status
    const userStatusMap = new Map();
    
    recentActivities.forEach(activity => {
      const userId = activity.user._id.toString();
      if (!userStatusMap.has(userId)) {
        userStatusMap.set(userId, {
          user: activity.user,
          cognitive_state: activity.cognitive_state,
          focus_score: activity.focus_score,
          last_active: activity.timestamp,
          is_active: ['ON_TASK', 'THINKING', 'DEEP_FOCUS'].includes(activity.cognitive_state)
        });
      }
    });

    const liveStatus = Array.from(userStatusMap.values());

    res.json({
      success: true,
      count: liveStatus.length,
      data: liveStatus
    });
  } catch (error) {
    console.error('[PRANA] Error fetching live status:', error);
    res.status(500).json({ error: 'Failed to fetch live status' });
  }
});

// @route   GET /api/prana/analytics/:userId
// @desc    Get detailed PRANA analytics for a user
// @access  Private (Admin/Manager)
router.get('/analytics/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    // Check permission
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get detailed analytics
    const analytics = await PranaActivity.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          date: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: '$date',
            state: '$cognitive_state'
          },
          count: { $sum: 1 },
          avg_focus: { $avg: '$focus_score' },
          total_active: { $sum: '$active_seconds' },
          total_idle: { $sum: '$idle_seconds' },
          total_away: { $sum: '$away_seconds' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Format for charting
    const dailyData = {};
    
    analytics.forEach(item => {
      const dateKey = item._id.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          states: {},
          total_packets: 0,
          avg_focus: 0,
          total_active_time: 0,
          total_idle_time: 0,
          total_away_time: 0
        };
      }
      
      dailyData[dateKey].states[item._id.state] = item.count;
      dailyData[dateKey].total_packets += item.count;
      dailyData[dateKey].avg_focus += item.avg_focus * item.count;
      dailyData[dateKey].total_active_time += item.total_active;
      dailyData[dateKey].total_idle_time += item.total_idle;
      dailyData[dateKey].total_away_time += item.total_away;
    });

    // Calculate weighted averages
    Object.keys(dailyData).forEach(date => {
      const data = dailyData[date];
      data.avg_focus = data.total_packets > 0 
        ? Math.round((data.avg_focus / data.total_packets) * 10) / 10 
        : 0;
    });

    res.json({
      success: true,
      data: Object.values(dailyData)
    });
  } catch (error) {
    console.error('[PRANA] Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

module.exports = router;
