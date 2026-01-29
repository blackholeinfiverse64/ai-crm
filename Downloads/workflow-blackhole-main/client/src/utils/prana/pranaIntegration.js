// PRANA Integration for Blackhole EMS
// Integrates cognitive state monitoring with the existing EMS system

import { initSignalCapture } from './signals';
import { initStateEngine } from './prana_state_engine';
import { initPacketBuilder } from './prana_packet_builder';

let signalCapture = null;
let stateEngine = null;
let packetBuilder = null;
let isInitialized = false;
let packetEmissionInterval = null;

/**
 * Initialize PRANA monitoring system
 * @param {Object} userContext - User context containing user_id
 * @returns {Object} PRANA instances
 */
export function initializePrana(userContext = {}) {
  if (isInitialized) {
    console.log('[PRANA] Already initialized');
    return { signalCapture, stateEngine, packetBuilder };
  }

  console.log('[PRANA] Initializing monitoring system...');

  try {
    // Initialize signal capture (mouse, keyboard, tab events)
    signalCapture = initSignalCapture();
    
    // Initialize cognitive state engine
    stateEngine = initStateEngine(signalCapture);
    
    // Context provider for packet builder
    const contextProvider = {
      getContext() {
        const storedUser = localStorage.getItem('WorkflowUser');
        let userId = null;
        
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            userId = user.id;
          } catch (error) {
            console.error('[PRANA] Error parsing user context:', error);
          }
        }

        return {
          user_id: userId || userContext.user_id || null,
          session_id: sessionStorage.getItem('session_id') || generateSessionId(),
          lesson_id: null // Not applicable for EMS
        };
      }
    };
    
    // Initialize packet builder
    packetBuilder = initPacketBuilder(signalCapture, stateEngine, contextProvider);
    
    // Start sending packets to backend every 5 seconds
    startPacketEmission();
    
    isInitialized = true;
    console.log('[PRANA] ✅ Monitoring system initialized successfully');
    
    return { signalCapture, stateEngine, packetBuilder };
  } catch (error) {
    console.error('[PRANA] ❌ Failed to initialize:', error);
    return null;
  }
}

/**
 * Start emitting PRANA packets to the backend
 */
function startPacketEmission() {
  if (packetEmissionInterval) {
    clearInterval(packetEmissionInterval);
  }

  // Emit packets every 5 seconds
  packetEmissionInterval = setInterval(() => {
    if (!packetBuilder || !stateEngine || !signalCapture) {
      console.warn('[PRANA] Components not initialized');
      return;
    }

    const packet = buildPranaPacket();
    sendPacketToBackend(packet);
  }, 5000);
}

/**
 * Build a PRANA packet from current state
 * @returns {Object} PRANA packet
 */
function buildPranaPacket() {
  const signals = signalCapture.getSignals();
  const cognitiveState = stateEngine.getCurrentState();
  const transitionLog = stateEngine.getTransitionLog();
  
  // Get user context
  const storedUser = localStorage.getItem('WorkflowUser');
  let userId = null;
  
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      userId = user.id;
    } catch (error) {
      console.error('[PRANA] Error parsing user:', error);
    }
  }

  // Calculate time distribution (active, idle, away)
  const timeDistribution = calculateTimeDistribution(transitionLog);
  
  // Calculate focus score (0-100)
  const focusScore = calculateFocusScore(signals, cognitiveState, timeDistribution);

  const packet = {
    user_id: userId,
    session_id: sessionStorage.getItem('session_id') || generateSessionId(),
    timestamp: new Date().toISOString(),
    cognitive_state: cognitiveState,
    
    // Time distribution (in seconds, sum = 5)
    active_seconds: timeDistribution.active,
    idle_seconds: timeDistribution.idle,
    away_seconds: timeDistribution.away,
    
    // Focus metrics
    focus_score: focusScore,
    
    // Raw signals
    raw_signals: {
      dwell_time_ms: signals.dwell_time_ms,
      hover_loops: signals.hover_loops,
      rapid_click_count: signals.rapid_click_count,
      scroll_depth: signals.scroll_depth,
      mouse_velocity: signals.mouse_velocity,
      inactivity_ms: signals.inactivity_ms,
      keyboard_inactivity_ms: signals.keyboard_inactivity_ms,
      mouse_inactivity_ms: signals.mouse_inactivity_ms,
      keypress_count: signals.keypress_count,
      typing_speed_wpm: signals.typing_speed_wpm,
      tab_visible: signals.tab_visible,
      panel_focused: signals.panel_focused
    }
  };

  return packet;
}

/**
 * Send PRANA packet to backend
 * @param {Object} packet - PRANA packet to send
 */
async function sendPacketToBackend(packet) {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const token = localStorage.getItem('WorkflowToken');

    const response = await fetch(`${API_URL}/prana/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'x-auth-token': token })
      },
      body: JSON.stringify(packet)
    });

    if (!response.ok) {
      throw new Error(`Failed to send PRANA packet: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[PRANA] ✅ Packet sent successfully:', result);
  } catch (error) {
    console.error('[PRANA] ❌ Failed to send packet:', error);
  }
}

/**
 * Calculate time distribution from state history
 * @param {Array} stateHistory - Recent state transitions
 * @returns {Object} Time distribution
 */
function calculateTimeDistribution(stateHistory) {
  // Simple approximation: last 5 seconds of states
  // In production, this would be more sophisticated
  const recentStates = stateHistory.slice(-5);
  
  let active = 0;
  let idle = 0;
  let away = 0;
  
  recentStates.forEach(state => {
    if (state.state === 'AWAY' || state.state === 'DISTRACTED') {
      away += 1;
    } else if (state.state === 'IDLE') {
      idle += 1;
    } else {
      active += 1;
    }
  });
  
  const total = active + idle + away || 1;
  
  return {
    active: Math.round((active / total) * 5),
    idle: Math.round((idle / total) * 5),
    away: Math.round((away / total) * 5)
  };
}

/**
 * Calculate focus score (0-100)
 * @param {Object} signals - Raw signals
 * @param {string} cognitiveState - Current cognitive state
 * @param {Object} timeDistribution - Time distribution
 * @returns {number} Focus score (0-100)
 */
function calculateFocusScore(signals, cognitiveState, timeDistribution) {
  let score = 100;
  
  // Deduct for negative signals
  if (signals.inactivity_ms > 10000) score -= 20;
  if (signals.rapid_click_count > 2) score -= 15;
  if (signals.hover_loops > 5) score -= 10;
  if (!signals.tab_visible) score -= 30;
  if (!signals.panel_focused) score -= 20;
  
  // Deduct for negative states
  if (cognitiveState === 'AWAY') score -= 40;
  if (cognitiveState === 'DISTRACTED') score -= 30;
  if (cognitiveState === 'IDLE') score -= 25;
  if (cognitiveState === 'OFF_TASK') score -= 35;
  
  // Bonus for deep focus
  if (cognitiveState === 'DEEP_FOCUS') score += 10;
  
  // Deduct based on time distribution
  score -= (timeDistribution.away * 5);
  score -= (timeDistribution.idle * 3);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate a unique session ID
 * @returns {string} Session ID
 */
function generateSessionId() {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', sessionId);
  return sessionId;
}

/**
 * Get current PRANA state and signals
 * @returns {Object} Current PRANA data
 */
export function getPranaState() {
  if (!isInitialized) {
    return null;
  }

  return {
    signals: signalCapture?.getSignals(),
    cognitiveState: stateEngine?.getCurrentState(),
    stateHistory: stateEngine?.getTransitionLog()
  };
}

/**
 * Stop PRANA monitoring
 */
export function stopPrana() {
  if (packetEmissionInterval) {
    clearInterval(packetEmissionInterval);
    packetEmissionInterval = null;
  }
  
  isInitialized = false;
  console.log('[PRANA] Monitoring stopped');
}

export default {
  initializePrana,
  getPranaState,
  stopPrana
};
