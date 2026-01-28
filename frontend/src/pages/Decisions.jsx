import React, { useState, useEffect } from 'react';
import { 
  Brain, Zap, TrendingUp, Target, Play, Settings,
  Route, Package, BarChart3, Clock
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { Modal, ModalFooter } from '../components/common/ui/Modal';
import { aiDecisionsAPI } from '../services/api/aiDecisionsAPI';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';

export const Decisions = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('make'); // make, workflows, analytics, settings
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState('route_optimization');

  const metrics = {
    totalDecisions: 1248,
    avgConfidence: 87.5,
    successRate: 92.3,
    avgExecutionTime: '3.2s',
  };

  const mockHistory = [
    { id: 1, type: 'Route Optimization', confidence: 92.5, status: 'success', timestamp: new Date(Date.now() - 3600000) },
    { id: 2, type: 'Procurement Decision', confidence: 88.3, status: 'success', timestamp: new Date(Date.now() - 7200000) },
    { id: 3, type: 'Inventory Forecast', confidence: 85.7, status: 'success', timestamp: new Date(Date.now() - 10800000) },
    { id: 4, type: 'Supplier Selection', confidence: 91.2, status: 'success', timestamp: new Date(Date.now() - 14400000) },
  ];

  useEffect(() => {
    setTimeout(() => {
      setDecisionHistory(mockHistory);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading AI decision engine..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">AI Decision Engine</h1>
          <p className="text-muted-foreground mt-1">
            Intelligent decision-making for logistics operations
          </p>
        </div>
        <Button onClick={() => setShowDecisionModal(true)}>
          <Play className="h-4 w-4 mr-2" />
          Make Decision
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Decisions"
          value={metrics.totalDecisions.toLocaleString()}
          icon={Brain}
          variant="primary"
        />
        <MetricCard
          title="Avg Confidence"
          value={`${metrics.avgConfidence}%`}
          icon={Target}
          variant="success"
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={TrendingUp}
          variant="accent"
        />
        <MetricCard
          title="Avg Execution"
          value={metrics.avgExecutionTime}
          icon={Clock}
          variant="secondary"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('make')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'make'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Make Decisions
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'workflows'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Workflows
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Decision Analytics
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'settings'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Make Decisions Tab */}
      {activeTab === 'make' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hover onClick={() => { setDecisionType('route_optimization'); setShowDecisionModal(true); }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Route className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Route Optimization</h3>
                  <p className="text-sm text-muted-foreground">Optimize delivery routes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover onClick={() => { setDecisionType('procurement_decision'); setShowDecisionModal(true); }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-8 w-8 text-accent" />
                <div>
                  <h3 className="font-semibold">Procurement Decision</h3>
                  <p className="text-sm text-muted-foreground">Make procurement choices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover onClick={() => { setDecisionType('inventory_forecast'); setShowDecisionModal(true); }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-8 w-8 text-secondary" />
                <div>
                  <h3 className="font-semibold">Inventory Forecast</h3>
                  <p className="text-sm text-muted-foreground">Forecast inventory needs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover onClick={() => { setDecisionType('delay_assessment'); setShowDecisionModal(true); }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-8 w-8 text-warning" />
                <div>
                  <h3 className="font-semibold">Delay Assessment</h3>
                  <p className="text-sm text-muted-foreground">Assess delivery delays</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover onClick={() => { setDecisionType('supplier_selection'); setShowDecisionModal(true); }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-8 w-8 text-success" />
                <div>
                  <h3 className="font-semibold">Supplier Selection</h3>
                  <p className="text-sm text-muted-foreground">Choose best supplier</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Decision Workflows</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Card hover>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Automated Route Optimization</h3>
                      <p className="text-sm text-muted-foreground">Runs daily at 6:00 AM</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card hover>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Procurement Decision Workflow</h3>
                      <p className="text-sm text-muted-foreground">Triggers on low stock</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Decision History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisionHistory.map((decision) => (
                  <TableRow key={decision.id}>
                    <TableCell className="font-medium">{decision.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${decision.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{decision.confidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">{decision.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(decision.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Decision Engine Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Confidence Threshold</label>
                <Input type="number" step="0.01" defaultValue="0.7" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Risk Tolerance</label>
                <Input type="number" step="0.01" defaultValue="0.5" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Optimization Weight</label>
                <Input type="number" step="0.01" defaultValue="1.0" />
              </div>
              <Button>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={showDecisionModal}
        title={`Make ${decisionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
        onClose={() => setShowDecisionModal(false)}
      >
          <div className="space-y-4">
            {decisionType === 'route_optimization' && (
              <>
                <Input label="Number of Orders" type="number" defaultValue="3" />
                <Input label="Vehicle Capacity" type="number" defaultValue="100" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="High Priority Orders" type="number" defaultValue="1" />
                  <Input label="Medium Priority Orders" type="number" defaultValue="2" />
                </div>
              </>
            )}
            {decisionType === 'procurement_decision' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Item A Stock" type="number" defaultValue="15" />
                  <Input label="Item B Stock" type="number" defaultValue="8" />
                  <Input label="Item C Stock" type="number" defaultValue="25" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Item A Demand" type="number" defaultValue="50" />
                  <Input label="Item B Demand" type="number" defaultValue="30" />
                  <Input label="Item C Demand" type="number" defaultValue="40" />
                </div>
              </>
            )}
            {decisionType === 'inventory_forecast' && (
              <>
                <Input label="Product ID" placeholder="PROD-001" />
                <Input label="Historical Period (days)" type="number" defaultValue="30" />
                <Input label="Forecast Period (days)" type="number" defaultValue="7" />
              </>
            )}
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDecisionModal(false)}>Cancel</Button>
            <Button onClick={() => setShowDecisionModal(false)}>
              <Zap className="h-4 w-4 mr-2" />
              Make Decision
            </Button>
          </ModalFooter>
      </Modal>
    </div>
  );
};

export default Decisions;
