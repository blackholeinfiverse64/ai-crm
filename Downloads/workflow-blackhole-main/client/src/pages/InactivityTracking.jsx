import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { API_URL } from '../lib/api';
import { Calendar, Clock, Keyboard, Mouse, User, AlertTriangle } from 'lucide-react';

export default function InactivityTracking() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchActivityData(selectedEmployee);
    }
  }, [selectedEmployee, dateRange]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('WorkflowToken');
      const response = await fetch(`${API_URL}/prana/live-status`, {
        headers: { 'x-auth-token': token }
      });

      if (response.ok) {
        const result = await response.json();
        const uniqueEmployees = result.data?.map(d => d.user) || [];
        setEmployees(uniqueEmployees);
        if (uniqueEmployees.length > 0) {
          setSelectedEmployee(uniqueEmployees[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('WorkflowToken');
      
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate.setHours(0, 0, 0, 0);
      }

      const response = await fetch(
        `${API_URL}/prana/user/${userId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: { 'x-auth-token': token }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setActivityData(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInactivityStats = () => {
    if (activityData.length === 0) return null;

    const stats = {
      totalRecords: activityData.length,
      avgMouseInactivity: 0,
      avgKeyboardInactivity: 0,
      maxMouseInactivity: 0,
      maxKeyboardInactivity: 0,
      highInactivityPeriods: 0,
      totalIdleTime: 0,
      totalActiveTime: 0
    };

    activityData.forEach(record => {
      const mouseInactivity = record.raw_signals?.mouse_inactivity_ms || 0;
      const keyboardInactivity = record.raw_signals?.keyboard_inactivity_ms || 0;

      stats.avgMouseInactivity += mouseInactivity;
      stats.avgKeyboardInactivity += keyboardInactivity;
      stats.maxMouseInactivity = Math.max(stats.maxMouseInactivity, mouseInactivity);
      stats.maxKeyboardInactivity = Math.max(stats.maxKeyboardInactivity, keyboardInactivity);

      // Count high inactivity periods (both mouse and keyboard > 60 seconds)
      if (mouseInactivity > 60000 && keyboardInactivity > 60000) {
        stats.highInactivityPeriods++;
      }

      // Track idle vs active time
      if (record.cognitive_state === 'IDLE' || record.cognitive_state === 'AWAY' || record.cognitive_state === 'OFF_TASK') {
        stats.totalIdleTime++;
      } else {
        stats.totalActiveTime++;
      }
    });

    stats.avgMouseInactivity = Math.round(stats.avgMouseInactivity / activityData.length);
    stats.avgKeyboardInactivity = Math.round(stats.avgKeyboardInactivity / activityData.length);

    return stats;
  };

  const getInactivityLevel = (ms) => {
    const seconds = ms / 1000;
    if (seconds < 30) return { level: 'Active', color: 'bg-green-500' };
    if (seconds < 60) return { level: 'Normal', color: 'bg-blue-500' };
    if (seconds < 120) return { level: 'Idle', color: 'bg-yellow-500' };
    if (seconds < 300) return { level: 'Inactive', color: 'bg-orange-500' };
    return { level: 'Away', color: 'bg-red-500' };
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const stats = calculateInactivityStats();
  const selectedEmployeeData = employees.find(e => e._id === selectedEmployee);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Employee Inactivity Tracking</h1>
        <p className="text-gray-500 mt-1">
          Monitor keyboard and mouse inactivity patterns across your team
        </p>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Employee & Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Employee</label>
              <select
                value={selectedEmployee || ''}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select an employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      {stats && selectedEmployeeData && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  <Mouse className="h-4 w-4 inline mr-1" />
                  Avg Mouse Inactivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(stats.avgMouseInactivity)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max: {formatTime(stats.maxMouseInactivity)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  <Keyboard className="h-4 w-4 inline mr-1" />
                  Avg Keyboard Inactivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(stats.avgKeyboardInactivity)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max: {formatTime(stats.maxKeyboardInactivity)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  High Inactivity Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.highInactivityPeriods}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  &gt;60s both mouse & keyboard
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Active vs Idle Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.totalActiveTime / stats.totalRecords) * 100)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalActiveTime} active / {stats.totalIdleTime} idle
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Activity Timeline - {selectedEmployeeData.name}</CardTitle>
              <CardDescription>
                Showing {activityData.length} activity records for {dateRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : activityData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No activity data available for this period
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {activityData.map((record, index) => {
                    const mouseInactivity = record.raw_signals?.mouse_inactivity_ms || 0;
                    const keyboardInactivity = record.raw_signals?.keyboard_inactivity_ms || 0;
                    const mouseLevel = getInactivityLevel(mouseInactivity);
                    const keyboardLevel = getInactivityLevel(keyboardInactivity);

                    return (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {new Date(record.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <Badge className={`${record.cognitive_state === 'IDLE' || record.cognitive_state === 'AWAY' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                            {record.cognitive_state}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Mouse className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-semibold">Mouse Activity</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Inactivity:</span>
                                <Badge className={mouseLevel.color}>
                                  {formatTime(mouseInactivity)}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Velocity:</span>
                                <span className="font-semibold">
                                  {record.raw_signals?.mouse_velocity || 0} px/s
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Clicks:</span>
                                <span className="font-semibold">
                                  {record.raw_signals?.rapid_click_count || 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Keyboard className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-semibold">Keyboard Activity</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Inactivity:</span>
                                <Badge className={keyboardLevel.color}>
                                  {formatTime(keyboardInactivity)}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Keypresses:</span>
                                <span className="font-semibold">
                                  {record.raw_signals?.keypress_count || 0}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Typing Speed:</span>
                                <span className="font-semibold">
                                  {record.raw_signals?.typing_speed_wpm || 0} WPM
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Focus Score: <span className="font-semibold">{Math.round(record.focus_score * 100)}%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Scroll Depth: <span className="font-semibold">{record.raw_signals?.scroll_depth || 0}%</span>
                          </div>
                          <div className="text-xs">
                            {record.raw_signals?.tab_visible ? (
                              <Badge variant="outline" className="text-xs bg-green-50">Tab Visible</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50">Tab Hidden</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
