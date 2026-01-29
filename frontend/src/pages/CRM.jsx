import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, TrendingUp, DollarSign, Target, Plus, Search, Filter, 
  Building2, Phone, Mail, Calendar, Activity, Award, 
  BarChart3, PieChart, Clock, CheckCircle2, AlertCircle,
  UserCheck, FileText, TrendingDown, Briefcase, MapPin,
  RefreshCw
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import Alert from '../components/common/ui/Alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { crmAPI } from '../services/api/crmAPI';
import { dashboardAPI } from '../services/api/dashboardAPI';

export const CRM = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [metrics, setMetrics] = useState({
    totalAccounts: 0,
    activeLeads: 0,
    opportunities: 0,
    conversionRate: 0,
    pipelineValue: 0,
    avgDealSize: 0,
    closedWon: 0,
    closedLost: 0,
  });

  // Fetch all CRM data
  const fetchCRMData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data for overview metrics
      if (activeTab === 'overview') {
        try {
          const dashboardResponse = await dashboardAPI.getAccounts({ limit: 1 });
          const dashboardData = dashboardResponse.data;
          
          // Calculate metrics from dashboard data
          const totalAccounts = dashboardData?.total || dashboardData?.accounts?.length || 0;
          
          // Fetch leads for metrics
          let leadsData = [];
          try {
            const leadsResponse = await crmAPI.getLeads({ limit: 100 });
            leadsData = leadsResponse.data?.leads || leadsResponse.data || [];
          } catch (err) {
            console.warn('Failed to fetch leads:', err);
          }

          // Fetch opportunities for metrics
          let oppsData = [];
          try {
            const oppsResponse = await crmAPI.getOpportunities({ limit: 100 });
            oppsData = oppsResponse.data?.opportunities || oppsResponse.data || [];
          } catch (err) {
            console.warn('Failed to fetch opportunities:', err);
          }

          // Calculate metrics
          const activeLeads = leadsData.filter(l => l.lead_status !== 'converted').length;
          const totalOpps = oppsData.length;
          const closedWon = oppsData.filter(o => o.stage === 'closed_won' || o.opportunity_stage === 'closed_won').length;
          const closedLost = oppsData.filter(o => o.stage === 'closed_lost' || o.opportunity_stage === 'closed_lost').length;
          const pipelineValue = oppsData.reduce((sum, o) => sum + (parseFloat(o.amount || o.opportunity_amount || 0)), 0);
          const avgDealSize = totalOpps > 0 ? pipelineValue / totalOpps : 0;
          const conversionRate = leadsData.length > 0 ? (closedWon / leadsData.length) * 100 : 0;

          setMetrics({
            totalAccounts,
            activeLeads,
            opportunities: totalOpps,
            conversionRate: Math.round(conversionRate * 10) / 10,
            pipelineValue: Math.round(pipelineValue),
            avgDealSize: Math.round(avgDealSize),
            closedWon,
            closedLost,
          });
        } catch (err) {
          console.warn('Failed to fetch dashboard data:', err);
        }
      }

      // Fetch accounts
      try {
        const accountsResponse = await crmAPI.getAccounts({ limit: 100 });
        const accountsData = accountsResponse.data?.accounts || accountsResponse.data || [];
        setAccounts(accountsData.map(acc => ({
          id: acc.account_id || acc.id,
          name: acc.name || acc.account_name,
          industry: acc.industry,
          value: acc.annual_revenue || 0,
          revenue: acc.annual_revenue || 0,
          stage: acc.lifecycle_stage || 'prospect',
          contact: acc.primary_contact || '',
          email: acc.email,
          phone: acc.phone,
          territory: acc.territory || '',
          accountType: acc.account_type || 'customer',
          manager: acc.account_manager_id || '',
          lastActivity: acc.updated_at ? new Date(acc.updated_at) : new Date()
        })));
      } catch (err) {
        console.warn('Failed to fetch accounts:', err);
      }

      // Fetch leads
      try {
        const leadsResponse = await crmAPI.getLeads({ limit: 100 });
        const leadsData = leadsResponse.data?.leads || leadsResponse.data || [];
        setLeads(leadsData.map(lead => ({
          id: lead.lead_id || lead.id,
          name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.company_name,
          company: lead.company_name || lead.company,
          email: lead.email,
          phone: lead.phone,
          status: lead.lead_status || lead.status || 'new',
          source: lead.lead_source || lead.source || 'website',
          budget: parseFloat(lead.budget || lead.estimated_value || 0),
          territory: lead.territory || '',
          assignedTo: lead.assigned_to || lead.owner || '',
          created: lead.created_at ? new Date(lead.created_at) : new Date()
        })));
      } catch (err) {
        console.warn('Failed to fetch leads:', err);
      }

      // Fetch opportunities
      try {
        const oppsResponse = await crmAPI.getOpportunities({ limit: 100 });
        const oppsData = oppsResponse.data?.opportunities || oppsResponse.data || [];
        setOpportunities(oppsData.map(opp => ({
          id: opp.opportunity_id || opp.id,
          name: opp.opportunity_name || opp.name,
          accountId: opp.account_id,
          accountName: opp.account_name || '',
          stage: opp.opportunity_stage || opp.stage || 'prospecting',
          probability: parseFloat(opp.probability || opp.close_probability || 0),
          amount: parseFloat(opp.opportunity_amount || opp.amount || 0),
          closeDate: opp.close_date ? new Date(opp.close_date) : new Date(),
          owner: opp.owner || opp.assigned_to || '',
          products: opp.products || ''
        })));
      } catch (err) {
        console.warn('Failed to fetch opportunities:', err);
      }

      // Fetch activities
      try {
        const activitiesResponse = await crmAPI.getActivities({ limit: 100 });
        const activitiesData = activitiesResponse.data?.activities || activitiesResponse.data || [];
        setActivities(activitiesData.map(act => ({
          id: act.activity_id || act.id,
          subject: act.subject || act.activity_subject || '',
          type: act.activity_type || act.type || 'call',
          status: act.activity_status || act.status || 'planned',
          accountId: act.account_id,
          accountName: act.account_name || '',
          dueDate: act.due_date ? new Date(act.due_date) : new Date(),
          assignedTo: act.assigned_to || act.owner || '',
          outcome: act.outcome || act.result || null
        })));
      } catch (err) {
        console.warn('Failed to fetch activities:', err);
      }

    } catch (err) {
      console.error('Error fetching CRM data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCRMData();
  }, [fetchCRMData]);

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

  // Chart data (computed from real data)
  const opportunityStageData = (() => {
    const stageCounts = {};
    opportunities.forEach(opp => {
      const stage = opp.stage || 'unknown';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });
    return Object.entries(stageCounts).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
  })();

  const leadSourceData = (() => {
    const sourceCounts = {};
    leads.forEach(lead => {
      const source = lead.source || 'unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    return Object.entries(sourceCounts).map(([name, count]) => ({ name: name.replace('_', ' '), count })).filter(item => item.count > 0);
  })();

  const revenueByTerritory = (() => {
    const territoryRevenue = {};
    accounts.forEach(acc => {
      const territory = acc.territory || 'Unknown';
      territoryRevenue[territory] = (territoryRevenue[territory] || 0) + (acc.revenue || 0);
    });
    return Object.entries(territoryRevenue).map(([territory, revenue]) => ({ territory, revenue })).filter(item => item.revenue > 0);
  })();

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
          value={`${(metrics.pipelineValue / 1000000).toFixed(1)}M`}
          trend="up"
          trendValue="+15%"
          icon={DollarSign}
          variant="accent"
        />
        <MetricCard
          title="Avg Deal Size"
          value={`${(metrics.avgDealSize / 1000).toFixed(0)}K`}
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
                  <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
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
                <p className="text-2xl font-bold">20.0M</p>
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
            {activities.slice(0, 5).map((activity) => (
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
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.id}</TableCell>
                <TableCell className="font-semibold">{account.name}</TableCell>
                <TableCell>{account.industry}</TableCell>
                <TableCell>
                  <Badge variant="outline">{account.accountType}</Badge>
                </TableCell>
                <TableCell>{account.territory}</TableCell>
                <TableCell>{(account.revenue / 1000000).toFixed(1)}M</TableCell>
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
          value="850K"
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
              {leads.map((lead) => (
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
                  <TableCell>{(lead.budget / 1000).toFixed(0)}K</TableCell>
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
          value={`${(metrics.pipelineValue / 1000000).toFixed(1)}M`}
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
              {opportunities.map((opp) => (
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
                  <TableCell className="font-semibold">{(opp.amount / 1000).toFixed(0)}K</TableCell>
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
              {activities.map((activity) => (
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCRMData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" onClose={() => setError(null)}>
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </Alert>
      )}

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
