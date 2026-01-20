import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, DollarSign, Target, Plus, Search, Filter, 
  Building2, Phone, Mail, Calendar, Activity, Award, 
  BarChart3, PieChart, Clock, CheckCircle2, AlertCircle,
  UserCheck, FileText, TrendingDown, Briefcase, MapPin
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const CRM = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, accounts, leads, opportunities, activities
  const [selectedAccount, setSelectedAccount] = useState(null);

  const metrics = {
    totalAccounts: 532,
    activeLeads: 148,
    opportunities: 67,
    conversionRate: 24.8,
    pipelineValue: 1500000,
    avgDealSize: 83500,
    closedWon: 28,
    closedLost: 12,
  };

  const mockAccounts = [
    { 
      id: 'ACC-001', 
      name: 'TechCorp Industries', 
      industry: 'Technology', 
      value: 125000, 
      revenue: 5000000,
      stage: 'negotiation', 
      contact: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1-555-0101',
      territory: 'West Coast',
      accountType: 'customer',
      manager: 'Sarah Johnson',
      lastActivity: new Date(Date.now() - 86400000) 
    },
    { 
      id: 'ACC-002', 
      name: 'Global Manufacturing Ltd', 
      industry: 'Manufacturing', 
      value: 89000,
      revenue: 15000000, 
      stage: 'proposal', 
      contact: 'Robert Johnson',
      email: 'robert.johnson@globalmanuf.com',
      phone: '+1-555-0102',
      territory: 'Midwest',
      accountType: 'distributor',
      manager: 'Mike Chen',
      lastActivity: new Date(Date.now() - 172800000) 
    },
    { 
      id: 'ACC-003', 
      name: 'Retail Solutions Inc', 
      industry: 'Retail', 
      value: 210000,
      revenue: 8000000, 
      stage: 'closed_won', 
      contact: 'Jane Doe',
      email: 'jane.doe@retailsolutions.com',
      phone: '+1-555-0103',
      territory: 'East Coast',
      accountType: 'customer',
      manager: 'Lisa Wang',
      lastActivity: new Date(Date.now() - 259200000) 
    },
  ];

  const mockLeads = [
    {
      id: 'LEAD-001',
      name: 'David Brown',
      company: 'StartupTech Co',
      email: 'david@startuptech.co',
      phone: '+1-555-1001',
      status: 'new',
      source: 'website',
      budget: 100000,
      territory: 'West Coast',
      assignedTo: 'Sarah Johnson',
      created: new Date(Date.now() - 432000000)
    },
    {
      id: 'LEAD-002',
      name: 'Emma Garcia',
      company: 'MidSize Corp',
      email: 'emma@midsize.com',
      phone: '+1-555-1002',
      status: 'contacted',
      source: 'trade_show',
      budget: 250000,
      territory: 'Midwest',
      assignedTo: 'Mike Chen',
      created: new Date(Date.now() - 1036800000)
    },
    {
      id: 'LEAD-003',
      name: 'Robert Taylor',
      company: 'Enterprise Solutions',
      email: 'robert@enterprise.com',
      phone: '+1-555-1003',
      status: 'qualified',
      source: 'referral',
      budget: 500000,
      territory: 'East Coast',
      assignedTo: 'Lisa Wang',
      created: new Date(Date.now() - 1728000000)
    },
  ];

  const mockOpportunities = [
    {
      id: 'OPP-001',
      name: 'TechCorp Logistics Upgrade',
      accountId: 'ACC-001',
      accountName: 'TechCorp Industries',
      stage: 'proposal',
      probability: 75,
      amount: 300000,
      closeDate: new Date(Date.now() + 3888000000),
      owner: 'Sarah Johnson',
      products: 'Logistics Platform, Analytics Dashboard',
    },
    {
      id: 'OPP-002',
      name: 'Global Manufacturing Partnership',
      accountId: 'ACC-002',
      accountName: 'Global Manufacturing Ltd',
      stage: 'negotiation',
      probability: 60,
      amount: 750000,
      closeDate: new Date(Date.now() + 5184000000),
      owner: 'Mike Chen',
      products: 'Full Platform Suite, Integration Services',
    },
    {
      id: 'OPP-003',
      name: 'Retail Chain Expansion',
      accountId: 'ACC-003',
      accountName: 'Retail Solutions Inc',
      stage: 'prospecting',
      probability: 25,
      amount: 450000,
      closeDate: new Date(Date.now() + 7776000000),
      owner: 'Lisa Wang',
      products: 'Inventory Management, Order Processing',
    },
  ];

  const mockActivities = [
    {
      id: 'ACT-001',
      subject: 'Initial discovery call',
      type: 'call',
      status: 'completed',
      accountId: 'ACC-001',
      accountName: 'TechCorp Industries',
      dueDate: new Date(Date.now() - 172800000),
      assignedTo: 'Sarah Johnson',
      outcome: 'Identified key requirements for logistics upgrade',
    },
    {
      id: 'ACT-002',
      subject: 'Product demonstration',
      type: 'meeting',
      status: 'planned',
      accountId: 'ACC-002',
      accountName: 'Global Manufacturing Ltd',
      dueDate: new Date(Date.now() + 259200000),
      assignedTo: 'Mike Chen',
      outcome: null,
    },
    {
      id: 'ACT-003',
      subject: 'Proposal presentation',
      type: 'meeting',
      status: 'in_progress',
      accountId: 'ACC-003',
      accountName: 'Retail Solutions Inc',
      dueDate: new Date(Date.now() + 86400000),
      assignedTo: 'Lisa Wang',
      outcome: null,
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setAccounts(mockAccounts);
      setLoading(false);
    }, 800);
  }, []);

  const getStageVariant = (stage) => {
    const variants = {
      discovery: 'info',
      qualification: 'info',
      proposal: 'warning',
      negotiation: 'warning',
      prospecting: 'info',
      closed_won: 'success',
      closed_lost: 'destructive',
    };
    return variants[stage] || 'default';
  };

  const getLeadStatusVariant = (status) => {
    const variants = {
      new: 'info',
      contacted: 'warning',
      qualified: 'success',
      converted: 'success',
    };
    return variants[status] || 'default';
  };

  const getActivityStatusVariant = (status) => {
    const variants = {
      completed: 'success',
      in_progress: 'warning',
      planned: 'info',
    };
    return variants[status] || 'default';
  };

  // Chart data
  const opportunityStageData = [
    { name: 'Prospecting', value: 3 },
    { name: 'Proposal', value: 8 },
    { name: 'Negotiation', value: 12 },
    { name: 'Closed Won', value: 28 },
  ];

  const leadSourceData = [
    { name: 'Website', count: 42 },
    { name: 'Trade Show', count: 35 },
    { name: 'Referral', count: 28 },
    { name: 'Email Campaign', count: 22 },
    { name: 'Cold Call', count: 15 },
  ];

  const revenueByTerritory = [
    { territory: 'West Coast', revenue: 5200000 },
    { territory: 'Midwest', revenue: 4800000 },
    { territory: 'East Coast', revenue: 6100000 },
    { territory: 'South', revenue: 3900000 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return <LoadingSpinner text="Loading CRM data..." />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'accounts':
        return renderAccountsTab();
      case 'leads':
        return renderLeadsTab();
      case 'opportunities':
        return renderOpportunitiesTab();
      case 'activities':
        return renderActivitiesTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Accounts"
          value={metrics.totalAccounts.toLocaleString()}
          trend="up"
          trendValue="+8.2%"
          icon={Users}
          variant="primary"
        />
        <MetricCard
          title="Active Leads"
          value={metrics.activeLeads.toLocaleString()}
          trend="up"
          trendValue="+12.5%"
          icon={TrendingUp}
          variant="secondary"
        />
        <MetricCard
          title="Pipeline Value"
          value={`$${(metrics.pipelineValue / 1000000).toFixed(1)}M`}
          trend="up"
          trendValue="+15%"
          icon={DollarSign}
          variant="accent"
        />
        <MetricCard
          title="Avg Deal Size"
          value={`$${(metrics.avgDealSize / 1000).toFixed(0)}K`}
          trend="up"
          trendValue="+8%"
          icon={Award}
          variant="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunities by Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Opportunities by Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={opportunityStageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {opportunityStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leadSourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Territory - Reduced Width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Revenue by Territory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueByTerritory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="territory" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Territory Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Territory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$20.0M</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Territory</p>
                <p className="text-lg font-semibold">East Coast</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="text-lg font-semibold text-success">+12.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  {activity.type === 'call' && <Phone className="h-5 w-5 text-primary" />}
                  {activity.type === 'meeting' && <Calendar className="h-5 w-5 text-primary" />}
                  {activity.type === 'email' && <Mail className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{activity.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.accountName} • {activity.assignedTo}
                      </p>
                    </div>
                    <Badge variant={getActivityStatusVariant(activity.status)}>
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {activity.outcome && (
                    <p className="text-sm text-muted-foreground mt-2">{activity.outcome}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {formatDate(activity.dueDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccountsTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Account Management
          </CardTitle>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search accounts..."
              icon={Search}
              className="w-64"
            />
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account ID</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Territory</TableHead>
              <TableHead>Annual Revenue</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.id}</TableCell>
                <TableCell className="font-semibold">{account.name}</TableCell>
                <TableCell>{account.industry}</TableCell>
                <TableCell>
                  <Badge variant="outline">{account.accountType}</Badge>
                </TableCell>
                <TableCell>{account.territory}</TableCell>
                <TableCell>${(account.revenue / 1000000).toFixed(1)}M</TableCell>
                <TableCell>{account.manager}</TableCell>
                <TableCell>{formatRelativeTime(account.lastActivity)}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedAccount(account)}
                  >
                    View 360°
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderLeadsTab = () => (
    <div className="space-y-6">
      {/* Lead Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="New Leads"
          value="42"
          icon={UserCheck}
          variant="info"
        />
        <MetricCard
          title="Contacted"
          value="35"
          icon={Phone}
          variant="warning"
        />
        <MetricCard
          title="Qualified"
          value="28"
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          title="Total Budget"
          value="$850K"
          icon={DollarSign}
          variant="primary"
        />
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-secondary" />
            Lead Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.id}</TableCell>
                  <TableCell className="font-semibold">{lead.name}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>
                    <Badge variant={getLeadStatusVariant(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.source.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>${(lead.budget / 1000).toFixed(0)}K</TableCell>
                  <TableCell>{lead.territory}</TableCell>
                  <TableCell>{lead.assignedTo}</TableCell>
                  <TableCell>{formatRelativeTime(lead.created)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Convert
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderOpportunitiesTab = () => (
    <div className="space-y-6">
      {/* Opportunity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Opportunities"
          value={metrics.opportunities.toLocaleString()}
          icon={Briefcase}
          variant="primary"
        />
        <MetricCard
          title="Pipeline Value"
          value={`$${(metrics.pipelineValue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          variant="accent"
        />
        <MetricCard
          title="Closed Won"
          value={metrics.closedWon.toLocaleString()}
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          title="Closed Lost"
          value={metrics.closedLost.toLocaleString()}
          icon={TrendingDown}
          variant="destructive"
        />
      </div>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Sales Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOpportunities.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium">{opp.id}</TableCell>
                  <TableCell className="font-semibold">{opp.name}</TableCell>
                  <TableCell>{opp.accountName}</TableCell>
                  <TableCell>
                    <Badge variant={getStageVariant(opp.stage)}>
                      {opp.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${opp.probability}%` }}
                        />
                      </div>
                      <span className="text-sm">{opp.probability}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${(opp.amount / 1000).toFixed(0)}K</TableCell>
                  <TableCell>{formatDate(opp.closeDate)}</TableCell>
                  <TableCell>{opp.owner}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivitiesTab = () => (
    <div className="space-y-6">
      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Activities"
          value="142"
          icon={Activity}
          variant="primary"
        />
        <MetricCard
          title="Completed"
          value="89"
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          title="Planned"
          value="35"
          icon={Clock}
          variant="info"
        />
        <MetricCard
          title="In Progress"
          value="18"
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.id}</TableCell>
                  <TableCell className="font-semibold">{activity.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.type}</Badge>
                  </TableCell>
                  <TableCell>{activity.accountName}</TableCell>
                  <TableCell>
                    <Badge variant={getActivityStatusVariant(activity.status)}>
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(activity.dueDate)}</TableCell>
                  <TableCell>{activity.assignedTo}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {activity.outcome || '-'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">🏢 CRM Dashboard </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive customer relationship management system
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'accounts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="h-4 w-4 inline mr-2" />
          Accounts
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'leads'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Leads
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'opportunities'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <DollarSign className="h-4 w-4 inline mr-2" />
          Opportunities
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'activities'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="h-4 w-4 inline mr-2" />
          Activities
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default CRM;
