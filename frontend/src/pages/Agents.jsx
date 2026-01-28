import React, { useState, useEffect } from 'react';
import { 
  Bot, Play, Pause, RefreshCw, Settings, Activity, 
  TrendingUp, Zap, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { agentAPI } from '../services/api/agentAPI';
import { formatRelativeTime } from '@/utils/dateUtils';

export const Agents = () => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);

  const metrics = {
    totalAgents: 12,
    activeAgents: 8,
    pausedAgents: 2,
    totalActions: 1523,
    successRate: 94.5,
  };

  const mockAgents = [
    {
      id: 'AGENT-001',
      name: 'Restock Agent',
      type: 'restock',
      status: 'active',
      description: 'Monitors inventory and creates restock requests',
      lastRun: new Date(Date.now() - 3600000),
      actionsToday: 45,
      successRate: 96.2,
      avgExecutionTime: '2.3s',
    },
    {
      id: 'AGENT-002',
      name: 'Procurement Agent',
      type: 'procurement',
      status: 'active',
      description: 'Handles purchase orders and supplier communication',
      lastRun: new Date(Date.now() - 7200000),
      actionsToday: 32,
      successRate: 92.8,
      avgExecutionTime: '5.1s',
    },
    {
      id: 'AGENT-003',
      name: 'Delivery Agent',
      type: 'delivery',
      status: 'active',
      description: 'Manages shipments and delivery tracking',
      lastRun: new Date(Date.now() - 1800000),
      actionsToday: 67,
      successRate: 98.1,
      avgExecutionTime: '1.8s',
    },
    {
      id: 'AGENT-004',
      name: 'Inventory Optimizer',
      type: 'optimization',
      status: 'paused',
      description: 'Optimizes inventory levels using AI',
      lastRun: new Date(Date.now() - 86400000),
      actionsToday: 0,
      successRate: 89.5,
      avgExecutionTime: '12.5s',
    },
  ];

  const mockLogs = [
    { id: 1, agent: 'Restock Agent', action: 'Created restock request', status: 'success', timestamp: new Date(Date.now() - 300000) },
    { id: 2, agent: 'Procurement Agent', action: 'Sent purchase order', status: 'success', timestamp: new Date(Date.now() - 600000) },
    { id: 3, agent: 'Delivery Agent', action: 'Updated shipment status', status: 'success', timestamp: new Date(Date.now() - 900000) },
    { id: 4, agent: 'Restock Agent', action: 'Low stock alert triggered', status: 'warning', timestamp: new Date(Date.now() - 1200000) },
    { id: 5, agent: 'Procurement Agent', action: 'Supplier response received', status: 'success', timestamp: new Date(Date.now() - 1800000) },
  ];

  useEffect(() => {
    setTimeout(() => {
      setAgents(mockAgents);
      setAgentLogs(mockLogs);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusVariant = (status) => {
    const variants = {
      active: 'success',
      paused: 'warning',
      error: 'destructive',
    };
    return variants[status] || 'default';
  };

  const handleRunAgent = (agentId) => {
    console.log('Running agent:', agentId);
    // TODO: Call agentAPI.triggerAgent(agentId)
  };

  const handlePauseAgent = (agentId) => {
    console.log('Pausing agent:', agentId);
    // TODO: Call agentAPI.pauseAgent(agentId)
  };

  const handleResumeAgent = (agentId) => {
    console.log('Resuming agent:', agentId);
    // TODO: Call agentAPI.resumeAgent(agentId)
  };

  if (loading) {
    return <LoadingSpinner text="Loading agents..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">AI Agents Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your AI agents
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Agent Settings
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Agents"
          value={metrics.totalAgents.toLocaleString()}
          icon={Bot}
          variant="primary"
        />
        <MetricCard
          title="Active Agents"
          value={metrics.activeAgents.toLocaleString()}
          icon={Zap}
          variant="success"
        />
        <MetricCard
          title="Paused Agents"
          value={metrics.pausedAgents.toLocaleString()}
          icon={Pause}
          variant="warning"
        />
        <MetricCard
          title="Total Actions"
          value={metrics.totalActions.toLocaleString()}
          icon={Activity}
          variant="accent"
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="border-l-4 border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{agent.id}</p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(agent.status)}>
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Run:</span>
                  <span className="font-medium">{formatRelativeTime(agent.lastRun)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Actions Today:</span>
                  <span className="font-medium">{agent.actionsToday}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">{agent.successRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Time:</span>
                  <span className="font-medium">{agent.avgExecutionTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {agent.status === 'active' ? (
                  <>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleRunAgent(agent.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePauseAgent(agent.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleResumeAgent(agent.id)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Agent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.agent}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'success' ? 'success' : 'warning'}>
                      {log.status === 'success' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelativeTime(log.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agents;
