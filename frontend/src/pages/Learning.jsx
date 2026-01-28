import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, TrendingUp, TrendingDown, Award, 
  Play, Save, RefreshCw, BarChart3, Target, Zap
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { Modal, ModalFooter } from '../components/common/ui/Modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { rlAPI } from '../services/api/rlAPI';

export const Learning = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, performance, control, insights
  const [agentRankings, setAgentRankings] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);

  const metrics = {
    totalActions: 1523,
    averageReward: 42.5,
    learningStatus: 'improving',
    progressRate: 68.5,
  };

  const mockRankings = [
    { rank: 1, agentName: 'Restock Agent', avgReward: 58.2, totalActions: 456, trend: 12.5 },
    { rank: 2, agentName: 'Delivery Agent', avgReward: 52.8, totalActions: 389, trend: 8.3 },
    { rank: 3, agentName: 'Procurement Agent', avgReward: 48.5, totalActions: 312, trend: 5.7 },
    { rank: 4, agentName: 'Inventory Optimizer', avgReward: 35.2, totalActions: 198, trend: -2.1 },
  ];

  const rewardHistory = [
    { action: 1, reward: 45.2 },
    { action: 2, reward: 48.5 },
    { action: 3, reward: 52.1 },
    { action: 4, reward: 49.8 },
    { action: 5, reward: 55.3 },
    { action: 6, reward: 58.7 },
    { action: 7, reward: 56.2 },
    { action: 8, reward: 60.1 },
  ];

  useEffect(() => {
    setTimeout(() => {
      setAgentRankings(mockRankings);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      improving: 'text-success',
      stable: 'text-warning',
      declining: 'text-destructive',
    };
    return colors[status] || 'text-muted-foreground';
  };

  if (loading) {
    return <LoadingSpinner text="Loading RL learning system..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">RL Learning System</h1>
          <p className="text-muted-foreground mt-1">
            Reinforcement Learning with reward/penalty loops for AI agent optimization
          </p>
        </div>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Run RL Workflow
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Actions"
          value={metrics.totalActions.toLocaleString()}
          icon={Zap}
          variant="primary"
        />
        <MetricCard
          title="Average Reward"
          value={metrics.averageReward.toFixed(1)}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Learning Status"
          value={metrics.learningStatus}
          icon={GraduationCap}
          variant="accent"
        />
        <MetricCard
          title="Progress Rate"
          value={`${metrics.progressRate}%`}
          icon={Target}
          variant="secondary"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'performance'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Agent Performance
        </button>
        <button
          onClick={() => setActiveTab('control')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'control'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Learning Control
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'insights'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Insights
        </button>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rewardHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="action" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reward" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Avg Reward</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentRankings.map((agent) => (
                    <TableRow key={agent.rank}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {agent.rank <= 3 && <Award className="h-4 w-4 text-warning" />}
                          <span className="font-bold">{agent.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell>{agent.avgReward.toFixed(1)}</TableCell>
                      <TableCell>{agent.totalActions}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {agent.trend > 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          <span className={agent.trend > 0 ? 'text-success' : 'text-destructive'}>
                            {agent.trend > 0 ? '+' : ''}{agent.trend.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Agent</label>
                <select className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                  <option>Restock Agent</option>
                  <option>Delivery Agent</option>
                  <option>Procurement Agent</option>
                  <option>Inventory Optimizer</option>
                </select>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold mb-1">456</div>
                    <div className="text-sm text-muted-foreground">Total Actions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold mb-1">58.2</div>
                    <div className="text-sm text-muted-foreground">Average Reward</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold mb-1">+12.5%</div>
                    <div className="text-sm text-muted-foreground">Improvement Trend</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Optimization Suggestions</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Increase confidence threshold to 0.75 for better decision accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Adjust risk tolerance to 0.6 for more aggressive optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Consider reducing optimization weight to 0.9 for stability</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Tab */}
      {activeTab === 'control' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Record Manual Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input label="Agent Name" placeholder="manual_agent" />
                <div>
                  <label className="text-sm font-medium mb-2 block">Action Type</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                    <option>restock_decision</option>
                    <option>procurement_order</option>
                    <option>delivery_routing</option>
                    <option>inventory_allocation</option>
                    <option>supplier_selection</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Confidence Score" type="number" step="0.01" defaultValue="0.7" />
                  <Input label="Expected Cost" type="number" defaultValue="1000" />
                </div>
                <Input label="Parameters (JSON)" placeholder='{"test": true}' />
                <Button className="w-full">
                  Record Action
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Record Action Outcome</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <label className="text-sm">Action Successful</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Actual Cost" type="number" defaultValue="950" />
                  <Input label="Actual Time (hours)" type="number" defaultValue="20" />
                </div>
                <Input label="Customer Satisfaction" type="number" step="0.1" defaultValue="4.0" />
                <Input label="Business Impact" type="number" step="0.1" defaultValue="6.0" />
                <Button className="w-full">
                  Record Outcome
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <span className="font-medium">Actions Recorded</span>
                  <Badge variant="success">1523</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <span className="font-medium">Rewards Calculated</span>
                  <Badge variant="success">1523</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                  <span className="font-medium">Agents Learning</span>
                  <Badge variant="accent">4</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm">• Run more agent actions to improve learning accuracy</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm">• Average reward is positive - system is performing well</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm">• Consider increasing challenge level for better optimization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Learning Data
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Learning Data
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Learning;
