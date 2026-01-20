import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  UserCheck, 
  Box, 
  Truck, 
  Briefcase, 
  Mail, 
  Zap, 
  Workflow 
} from 'lucide-react';
import MetricCard from '../components/common/charts/MetricCard';
import LineChart from '../components/common/charts/LineChart';
import BarChart from '../components/common/charts/BarChart';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import Badge from '../components/common/ui/Badge';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { formatRelativeTime } from '@/utils/dateUtils';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [metrics, setMetrics] = useState({
    totalOrders: 1248,
    activeAccounts: 532,
    products: 3842,
    suppliers: 156,
    employees: 48,
    emailsSent: 2847,
    rlActions: 1523,
    aiWorkflows: 12,
    revenue: 128540,
  });

  const salesData = [
    { name: 'Jan', sales: 4000, orders: 240 },
    { name: 'Feb', sales: 3000, orders: 198 },
    { name: 'Mar', sales: 5000, orders: 320 },
    { name: 'Apr', sales: 4500, orders: 278 },
    { name: 'May', sales: 6000, orders: 389 },
    { name: 'Jun', sales: 5500, orders: 349 },
  ];

  const categoryData = [
    { name: 'Mon', logistics: 45, crm: 32, inventory: 28 },
    { name: 'Tue', logistics: 52, crm: 38, inventory: 35 },
    { name: 'Wed', logistics: 48, crm: 41, inventory: 30 },
    { name: 'Thu', logistics: 61, crm: 45, inventory: 38 },
    { name: 'Fri', logistics: 55, crm: 39, inventory: 33 },
  ];

  const recentActivity = [
    { id: 1, type: 'order', message: 'New order #1245 created', time: new Date(Date.now() - 300000), status: 'success' },
    { id: 2, type: 'inventory', message: 'Low stock alert for Product XYZ', time: new Date(Date.now() - 600000), status: 'warning' },
    { id: 3, type: 'delivery', message: 'Shipment #8821 delivered', time: new Date(Date.now() - 900000), status: 'success' },
    { id: 4, type: 'agent', message: 'AI Agent processed 15 orders', time: new Date(Date.now() - 1200000), status: 'info' },
    { id: 5, type: 'crm', message: 'New lead converted to customer', time: new Date(Date.now() - 1800000), status: 'success' },
  ];

  useEffect(() => {
    // Data is already available, no need to wait
    setLoading(false);

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-heading font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          trend="up"
          trendValue="+12.5%"
          icon={Package}
          variant="primary"
        />
        <MetricCard
          title="Active Accounts"
          value={metrics.activeAccounts.toLocaleString()}
          trend="up"
          trendValue="+8.2%"
          icon={UserCheck}
          variant="secondary"
        />
        <MetricCard
          title="Products"
          value={metrics.products.toLocaleString()}
          trend="up"
          trendValue="+5.7%"
          icon={Box}
          variant="accent"
        />
        <MetricCard
          title="Suppliers"
          value={metrics.suppliers.toLocaleString()}
          trend="up"
          trendValue="+3.4%"
          icon={Truck}
          variant="success"
        />
        <MetricCard
          title="Employees"
          value={metrics.employees.toLocaleString()}
          trend="up"
          trendValue="+2.1%"
          icon={Briefcase}
          variant="primary"
        />
        <MetricCard
          title="Emails Sent"
          value={metrics.emailsSent.toLocaleString()}
          trend="up"
          trendValue="+18.9%"
          icon={Mail}
          variant="secondary"
        />
        <MetricCard
          title="RL Actions"
          value={metrics.rlActions.toLocaleString()}
          trend="up"
          trendValue="+24.3%"
          icon={Zap}
          variant="accent"
        />
        <MetricCard
          title="AI Workflows"
          value={metrics.aiWorkflows.toLocaleString()}
          trend="up"
          trendValue="+16.7%"
          icon={Workflow}
          variant="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="transform transition-all duration-300 hover:scale-[1.02]">
          <LineChart
            title="Sales & Orders Trend"
            data={salesData}
            lines={[
              { dataKey: 'sales', name: 'Sales ($)', color: 'hsl(var(--primary))' },
              { dataKey: 'orders', name: 'Orders', color: 'hsl(var(--secondary))' },
            ]}
            height={300}
          />
        </div>
        
        <div className="transform transition-all duration-300 hover:scale-[1.02]">
          <BarChart
            title="Activity by Category"
            data={categoryData}
            bars={[
              { dataKey: 'logistics', name: 'Logistics', color: 'hsl(var(--primary))' },
              { dataKey: 'crm', name: 'CRM', color: 'hsl(var(--secondary))' },
              { dataKey: 'inventory', name: 'Inventory', color: 'hsl(var(--accent))' },
            ]}
            height={300}
          />
        </div>
      </div>

      {/* Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-l-4 border-primary/50 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id}
                  className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent transition-all duration-300 border border-transparent hover:border-primary/20"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                  } animate-pulse`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(activity.time)}
                    </p>
                  </div>
                  <Badge variant={activity.status} className="transition-transform group-hover:scale-110">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-l-4 border-secondary/50 shadow-lg shadow-secondary/10 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SystemStatusItem label="CRM System" isOnline={true} />
            <SystemStatusItem label="Inventory" isOnline={true} />
            <SystemStatusItem label="Employee System" isOnline={true} />
            <SystemStatusItem label="EMS Automation" isOnline={true} />
            <SystemStatusItem label="RL Learning" isOnline={false} />
            <SystemStatusItem label="AI Decisions" isOnline={true} />
            <SystemStatusItem label="Logistics" isOnline={true} />
            <SystemStatusItem label="Suppliers" isOnline={true} />
            <SystemStatusItem label="AI Agents" isOnline={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SystemStatusItem = ({ label, isOnline }) => (
  <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-muted/30 hover:to-transparent transition-all duration-300 border border-transparent hover:border-secondary/20">
    <span className="text-sm font-medium group-hover:text-secondary transition-colors">{label}</span>
    <div className="flex items-center gap-2">
      <div className={`relative w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
        {isOnline && (
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
        isOnline 
          ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
          : 'bg-red-500/10 text-red-600 border border-red-500/20'
      }`}>
        {isOnline ? 'ONLINE' : 'OFFLINE'}
      </span>
    </div>
  </div>
);

export default Dashboard;
