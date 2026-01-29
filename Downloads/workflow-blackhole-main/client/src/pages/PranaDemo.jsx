import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { getPranaState } from '../utils/prana/pranaIntegration';
import PranaLiveMonitor from '../components/admin/PranaLiveMonitor';
import { useAuth } from '../context/auth-context';
import { Activity, Brain, Eye, MousePointer, Timer, Zap } from 'lucide-react';

const stateColors = {
  'ON_TASK': 'bg-green-500 text-white',
  'THINKING': 'bg-blue-500 text-white',
  'DEEP_FOCUS': 'bg-purple-500 text-white',
  'IDLE': 'bg-yellow-500 text-white',
  'DISTRACTED': 'bg-orange-500 text-white',
  'AWAY': 'bg-red-500 text-white',
  'OFF_TASK': 'bg-red-600 text-white'
};

const stateIcons = {
  'ON_TASK': Activity,
  'THINKING': Brain,
  'DEEP_FOCUS': Zap,
  'IDLE': Timer,
  'DISTRACTED': Eye,
  'AWAY': MousePointer,
  'OFF_TASK': MousePointer
};

export default function PranaDemo() {
  const { user } = useAuth();
  const [pranaState, setPranaState] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Refresh PRANA state every second
    const interval = setInterval(() => {
      const state = getPranaState();
      setPranaState(state);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshState = () => {
    setIsRefreshing(true);
    const state = getPranaState();
    setPranaState(state);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'Manager';

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PRANA Monitoring Demo</h1>
          <p className="text-gray-500 mt-1">
            Real-time cognitive activity monitoring system
          </p>
        </div>
        <Button onClick={refreshState} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh State'}
        </Button>
      </div>

      {/* Current User Status */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Your Current Activity Status
          </CardTitle>
          <CardDescription>
            PRANA is monitoring your browser activity in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pranaState ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Cognitive State */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Cognitive State</label>
                  <div className="mt-2">
                    {pranaState.cognitiveState && (
                      <>
                        {(() => {
                          const StateIcon = stateIcons[pranaState.cognitiveState];
                          return (
                            <Badge className={`${stateColors[pranaState.cognitiveState]} text-lg py-2 px-4`}>
                              <StateIcon className="h-5 w-5 mr-2" />
                              {pranaState.cognitiveState.replace('_', ' ')}
                            </Badge>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500">Tab Visible</div>
                    <div className="text-lg font-bold">
                      {pranaState.signals?.tab_visible ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500">Window Focused</div>
                    <div className="text-lg font-bold">
                      {pranaState.signals?.panel_focused ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Signals */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-600">Real-time Signals</label>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Mouse Velocity</span>
                    <Badge variant="outline">{pranaState.signals?.mouse_velocity || 0} px/s</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Hover Loops</span>
                    <Badge variant="outline">{pranaState.signals?.hover_loops || 0}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Rapid Clicks</span>
                    <Badge variant="outline">{pranaState.signals?.rapid_click_count || 0}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Scroll Depth</span>
                    <Badge variant="outline">{pranaState.signals?.scroll_depth || 0}%</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Keypress Count</span>
                    <Badge variant="outline">{pranaState.signals?.keypress_count || 0}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Typing Speed</span>
                    <Badge variant="outline">{pranaState.signals?.typing_speed_wpm || 0} WPM</Badge>
                  </div>
                </div>
                
                {/* Inactivity Metrics */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Inactivity Tracking</label>
                  
                  <div className="flex justify-between items-center p-2 bg-amber-50 border border-amber-200 rounded">
                    <span className="text-sm font-semibold">Overall Inactivity</span>
                    <Badge className="bg-amber-600 text-white">
                      {Math.round((pranaState.signals?.inactivity_ms || 0) / 1000)}s
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-sm">🖱️ Mouse Inactivity</span>
                    <Badge className="bg-blue-600 text-white">
                      {Math.round((pranaState.signals?.mouse_inactivity_ms || 0) / 1000)}s
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-purple-50 border border-purple-200 rounded">
                    <span className="text-sm">⌨️ Keyboard Inactivity</span>
                    <Badge className="bg-purple-600 text-white">
                      {Math.round((pranaState.signals?.keyboard_inactivity_ms || 0) / 1000)}s
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-500">
                Initializing PRANA monitoring...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How PRANA Works</CardTitle>
          <CardDescription>
            Understanding the monitoring system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Signal Capture</h3>
              </div>
              <p className="text-sm text-gray-600">
                Passive monitoring of mouse movements, clicks, scrolls, and tab visibility. No content is captured.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">State Detection</h3>
              </div>
              <p className="text-sm text-gray-600">
                AI-powered state machine determines your cognitive state based on activity patterns.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Real-time Updates</h3>
              </div>
              <p className="text-sm text-gray-600">
                Data is sent to the server every 5 seconds for admin monitoring and analytics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* State History */}
      {pranaState?.stateHistory && pranaState.stateHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent State Transitions</CardTitle>
            <CardDescription>
              Your cognitive state changes over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pranaState.stateHistory.slice(-10).reverse().map((entry, index) => {
                const StateIcon = stateIcons[entry.state];
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <StateIcon className="h-4 w-4" />
                      <Badge className={stateColors[entry.state]}>
                        {entry.state.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin View */}
      {isAdmin && (
        <>
          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard - Live Monitor</h2>
            <p className="text-gray-500 mb-6">
              As an admin, you can see all employees' activity in real-time
            </p>
          </div>
          <PranaLiveMonitor />
        </>
      )}

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Privacy & Data Collection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <div className="space-y-2">
            <p><strong>✅ What PRANA collects:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Mouse movement patterns (velocity, position changes)</li>
              <li>Click frequencies and scroll depth</li>
              <li>Tab/window visibility status</li>
              <li>Inactivity duration</li>
            </ul>
            
            <p className="mt-4"><strong>❌ What PRANA does NOT collect:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Screenshots or screen recordings</li>
              <li>Keystrokes or typed content</li>
              <li>URLs or website addresses</li>
              <li>File names or application names</li>
              <li>Any personal or sensitive content</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Try It Out!</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-green-800">
          <div className="space-y-3">
            <p><strong>Move your mouse around</strong> - Watch the "Mouse Velocity" change</p>
            <p><strong>Click rapidly</strong> - See "Rapid Clicks" counter increase</p>
            <p><strong>Scroll this page</strong> - Notice "Scroll Depth" updating</p>
            <p><strong>Switch tabs</strong> - Observe state change to "AWAY"</p>
            <p><strong>Stay still for 30 seconds</strong> - State will change to "IDLE"</p>
            <p className="mt-4 font-semibold">
              Your cognitive state and signals are being monitored in real-time! 
              {isAdmin && ' Check the Live Monitor below to see all users.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
