import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { API_URL } from '../../lib/api';

const stateColors = {
  'ON_TASK': 'bg-green-500',
  'THINKING': 'bg-blue-500',
  'DEEP_FOCUS': 'bg-purple-500',
  'IDLE': 'bg-yellow-500',
  'DISTRACTED': 'bg-orange-500',
  'AWAY': 'bg-red-500',
  'OFF_TASK': 'bg-red-600'
};

const stateLabels = {
  'ON_TASK': 'On Task',
  'THINKING': 'Thinking',
  'DEEP_FOCUS': 'Deep Focus',
  'IDLE': 'Idle',
  'DISTRACTED': 'Distracted',
  'AWAY': 'Away',
  'OFF_TASK': 'Off Task'
};

export function PranaLiveMonitor() {
  const [liveStatus, setLiveStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStatus = async () => {
    try {
      const token = localStorage.getItem('WorkflowToken');
      const response = await fetch(`${API_URL}/prana/live-status`, {
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const result = await response.json();
        setLiveStatus(result.data || []);
      }
    } catch (error) {
      console.error('[PRANA] Error fetching live status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFocusColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Employee Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Employee Activity Monitor</span>
          <Badge variant="outline" className="bg-green-50">
            {liveStatus.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {liveStatus.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active employees at the moment
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveStatus.map((status, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {status.user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {status.user.email}
                    </div>
                  </div>
                  {status.user.avatar && (
                    <img
                      src={status.user.avatar}
                      alt={status.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">State:</span>
                    <Badge className={`${stateColors[status.cognitive_state]} text-white text-xs`}>
                      {stateLabels[status.cognitive_state]}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Focus Score:</span>
                    <span className={`text-sm font-bold ${getFocusColor(status.focus_score)}`}>
                      {status.focus_score}%
                    </span>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Inactivity:</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="bg-blue-50 p-1 rounded">
                        <div className="text-gray-500">🖱️ Mouse</div>
                        <div className="font-semibold">
                          {Math.round((status.raw_signals?.mouse_inactivity_ms || 0) / 1000)}s
                        </div>
                      </div>
                      <div className="bg-purple-50 p-1 rounded">
                        <div className="text-gray-500">⌨️ Keyboard</div>
                        <div className="font-semibold">
                          {Math.round((status.raw_signals?.keyboard_inactivity_ms || 0) / 1000)}s
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Status:</span>
                    <Badge variant={status.is_active ? "default" : "secondary"} className="text-xs">
                      {status.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-400 text-right">
                    Updated: {new Date(status.last_active).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PranaLiveMonitor;
