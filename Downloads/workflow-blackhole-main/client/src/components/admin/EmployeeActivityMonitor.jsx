import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mouse, Keyboard, Clock, Activity, Zap, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/lib/api';

export default function EmployeeActivityMonitor({ employee }) {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      fetchActivityData(employee._id);
      const interval = setInterval(() => fetchActivityData(employee._id), 3000); // Update every 3s
      return () => clearInterval(interval);
    }
  }, [employee]);

  const fetchActivityData = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/prana/live-status`, {
        headers: { 'x-auth-token': localStorage.getItem('WorkflowToken') },
        params: { userId }
      });
      setActivityData(response.data.data);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setActivityData(null);
    } finally {
      setLoading(false);
    }
  };

  const getWorkStatus = () => {
    if (!activityData) return { status: 'Unknown', color: 'gray', description: 'No data available' };

    const mouseInactive = activityData.mouse_inactivity_ms || 0;
    const keyboardInactive = activityData.keyboard_inactivity_ms || 0;
    const bothInactive = Math.min(mouseInactive, keyboardInactive);

    // Working if either mouse or keyboard was active in last 30 seconds
    if (bothInactive < 30000) {
      return { 
        status: 'Working', 
        color: 'green', 
        description: 'Active input detected'
      };
    }

    // Idle if 30s-5min inactivity
    if (bothInactive < 300000) {
      return { 
        status: 'Idle', 
        color: 'yellow', 
        description: 'Brief pause in activity'
      };
    }

    // Away if >5min inactivity
    return { 
      status: 'Away', 
      color: 'red', 
      description: 'Extended inactivity'
    };
  };

  const formatInactivity = (ms) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const workStatus = getWorkStatus();

  return (
    <div className="space-y-6">
      {/* Activity Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {employee ? employee.name : 'No Employee Selected'}
            </span>
            {employee && (
              <Badge 
                variant={workStatus.color === 'green' ? 'default' : 'secondary'}
                className={`
                  ${workStatus.color === 'green' ? 'bg-green-500 hover:bg-green-600' : ''}
                  ${workStatus.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}
                  ${workStatus.color === 'red' ? 'bg-red-500 hover:bg-red-600' : ''}
                `}
              >
                {workStatus.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!employee ? (
            <div className="flex flex-col items-center justify-center h-[600px] text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No Employee Selected</p>
              <p className="text-sm text-muted-foreground mt-2">
                Select an employee from the left sidebar to view their real-time activity
              </p>
            </div>
          ) : loading && !activityData ? (
            <div className="flex items-center justify-center h-[600px]">
              <p className="text-muted-foreground">Loading activity data...</p>
            </div>
          ) : (
              <div className="space-y-6">
                {/* Work Status Card */}
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">{workStatus.status}</h3>
                      <p className="text-sm text-muted-foreground">{workStatus.description}</p>
                      {activityData?.last_update && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last update: {new Date(activityData.last_update).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mouse Activity */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Mouse className="h-4 w-4" />
                        Mouse Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Inactivity</span>
                        <Badge variant="outline" className="font-mono">
                          {formatInactivity(activityData?.mouse_inactivity_ms)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Clicks</span>
                        <span className="font-medium">{activityData?.click_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Movements</span>
                        <span className="font-medium">{activityData?.mouse_move_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Velocity</span>
                        <span className="font-medium">{activityData?.mouse_velocity?.toFixed(2) || 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keyboard Activity */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Keyboard className="h-4 w-4" />
                        Keyboard Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Inactivity</span>
                        <Badge variant="outline" className="font-mono">
                          {formatInactivity(activityData?.keyboard_inactivity_ms)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Keypresses</span>
                        <span className="font-medium">{activityData?.keypress_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Typing Speed</span>
                        <span className="font-medium">{activityData?.typing_speed_wpm || 0} WPM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Error Rate</span>
                        <span className="font-medium">{activityData?.error_rate?.toFixed(1) || 0}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Metrics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Session Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Cognitive State</p>
                        <p className="font-medium">{activityData?.cognitive_state || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tab Changes</p>
                        <p className="font-medium">{activityData?.tab_switch_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Scroll Events</p>
                        <p className="font-medium">{activityData?.scroll_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Focus Duration</p>
                        <p className="font-medium">{formatInactivity(activityData?.focus_duration_ms)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Real-time Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live monitoring • Updates every 3 seconds</span>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
