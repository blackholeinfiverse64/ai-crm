import React, { useState, useEffect } from 'react';
import { 
  Workflow, Play, Pause, Plus, Settings, CheckCircle, 
  Clock, AlertCircle, Zap, TrendingUp
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';

export const Workflows = () => {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState([]);

  const metrics = {
    totalWorkflows: 12,
    activeWorkflows: 8,
    executedToday: 45,
    successRate: 94.2,
  };

  const mockWorkflows = [
    {
      id: 'WF-001',
      name: 'Automated Restock Workflow',
      description: 'Automatically creates restock requests when inventory is low',
      status: 'active',
      trigger: 'Low Stock Alert',
      lastRun: new Date(Date.now() - 3600000),
      executions: 156,
      successRate: 96.5,
    },
    {
      id: 'WF-002',
      name: 'Order Processing Workflow',
      description: 'Processes new orders and creates shipments',
      status: 'active',
      trigger: 'New Order Created',
      lastRun: new Date(Date.now() - 1800000),
      executions: 234,
      successRate: 98.2,
    },
    {
      id: 'WF-003',
      name: 'Supplier Notification Workflow',
      description: 'Sends notifications to suppliers for purchase orders',
      status: 'paused',
      trigger: 'Purchase Order Created',
      lastRun: new Date(Date.now() - 86400000),
      executions: 89,
      successRate: 92.1,
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setWorkflows(mockWorkflows);
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

  if (loading) {
    return <LoadingSpinner text="Loading workflows..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Automated Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor automated workflow processes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Workflows"
          value={metrics.totalWorkflows.toLocaleString()}
          icon={Workflow}
          variant="primary"
        />
        <MetricCard
          title="Active Workflows"
          value={metrics.activeWorkflows.toLocaleString()}
          icon={Play}
          variant="success"
        />
        <MetricCard
          title="Executed Today"
          value={metrics.executedToday.toLocaleString()}
          icon={Zap}
          variant="accent"
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="border-l-4 border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{workflow.id}</p>
                </div>
                <Badge variant={getStatusVariant(workflow.status)}>
                  {workflow.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Trigger:</span>
                  <span className="font-medium">{workflow.trigger}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Run:</span>
                  <span className="font-medium">{formatRelativeTime(workflow.lastRun)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Executions:</span>
                  <span className="font-medium">{workflow.executions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">{workflow.successRate}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {workflow.status === 'active' ? (
                  <>
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Run Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1">
                    <Play className="h-4 w-4 mr-1" />
                    Activate
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

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Execution Time</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Automated Restock Workflow</TableCell>
                <TableCell>Low Stock Alert</TableCell>
                <TableCell>
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                </TableCell>
                <TableCell>2.3s</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(new Date(Date.now() - 3600000))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Order Processing Workflow</TableCell>
                <TableCell>New Order Created</TableCell>
                <TableCell>
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                </TableCell>
                <TableCell>1.8s</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(new Date(Date.now() - 1800000))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Workflows;
