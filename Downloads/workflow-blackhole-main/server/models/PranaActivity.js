const mongoose = require('mongoose');

const PranaActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  session_id: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  cognitive_state: {
    type: String,
    enum: ['ON_TASK', 'THINKING', 'IDLE', 'DISTRACTED', 'AWAY', 'OFF_TASK', 'DEEP_FOCUS'],
    required: true
  },
  // Time distribution (in seconds, sum should be ~5)
  active_seconds: {
    type: Number,
    default: 0
  },
  idle_seconds: {
    type: Number,
    default: 0
  },
  away_seconds: {
    type: Number,
    default: 0
  },
  // Focus metrics
  focus_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  // Raw signals from browser
  raw_signals: {
    dwell_time_ms: Number,
    hover_loops: Number,
    rapid_click_count: Number,
    scroll_depth: Number,
    mouse_velocity: Number,
    inactivity_ms: Number,
    tab_visible: Boolean,
    panel_focused: Boolean
  },
  // Metadata
  date: {
    type: Date,
    default: function() {
      return new Date(this.timestamp).setHours(0, 0, 0, 0);
    },
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
PranaActivitySchema.index({ user: 1, date: -1 });
PranaActivitySchema.index({ user: 1, session_id: 1, timestamp: -1 });
PranaActivitySchema.index({ date: -1, cognitive_state: 1 });

// Virtual for activity status
PranaActivitySchema.virtual('is_active').get(function() {
  return ['ON_TASK', 'THINKING', 'DEEP_FOCUS'].includes(this.cognitive_state);
});

// Virtual for productivity level
PranaActivitySchema.virtual('productivity_level').get(function() {
  if (this.focus_score >= 80) return 'HIGH';
  if (this.focus_score >= 60) return 'MEDIUM';
  if (this.focus_score >= 40) return 'LOW';
  return 'VERY_LOW';
});

module.exports = mongoose.model('PranaActivity', PranaActivitySchema);
