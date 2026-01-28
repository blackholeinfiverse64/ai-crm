import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Download, Filter, Calendar, TrendingUp,
  FileText, PieChart, LineChart as LineChartIcon
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('sales');

  const salesData = [
    { name: 'Jan', sales: 4000, orders: 240 },
    { name: 'Feb', sales: 3000, orders: 198 },
    { name: 'Mar', sales: 5000, orders: 320 },
    { name: 'Apr', sales: 4500, orders: 278 },
    { name: 'May', sales: 6000, orders: 389 },
    { name: 'Jun', sales: 5500, orders: 349 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#8884d8' },
    { name: 'Accessories', value: 25, color: '#82ca9d' },
    { name: 'Furniture', value: 20, color: '#ffc658' },
    { name: 'Other', value: 20, color: '#ff7300' },
  ];

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading reports..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Generate and view comprehensive business reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          hover 
          className={selectedReport === 'sales' ? 'border-l-4 border-primary' : ''}
          onClick={() => setSelectedReport('sales')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Sales Report</h3>
                <p className="text-sm text-muted-foreground">Revenue & orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          hover 
          className={selectedReport === 'inventory' ? 'border-l-4 border-primary' : ''}
          onClick={() => setSelectedReport('inventory')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-semibold">Inventory Report</h3>
                <p className="text-sm text-muted-foreground">Stock levels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          hover 
          className={selectedReport === 'crm' ? 'border-l-4 border-primary' : ''}
          onClick={() => setSelectedReport('crm')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-secondary" />
              <div>
                <h3 className="font-semibold">CRM Report</h3>
                <p className="text-sm text-muted-foreground">Leads & opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          hover 
          className={selectedReport === 'logistics' ? 'border-l-4 border-primary' : ''}
          onClick={() => setSelectedReport('logistics')}
        >
          <CardContent className="pt-6">
      <div className="flex items-center gap-3">
              <LineChartIcon className="h-8 w-8 text-success" />
              <div>
                <h3 className="font-semibold">Logistics Report</h3>
                <p className="text-sm text-muted-foreground">Shipments & deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Report */}
      {selectedReport === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales & Orders Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Report */}
      {selectedReport === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Inventory report details coming soon...</p>
          </CardContent>
        </Card>
      )}

      {/* CRM Report */}
      {selectedReport === 'crm' && (
        <Card>
          <CardHeader>
            <CardTitle>CRM Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">CRM report details coming soon...</p>
          </CardContent>
        </Card>
      )}

      {/* Logistics Report */}
      {selectedReport === 'logistics' && (
        <Card>
          <CardHeader>
            <CardTitle>Logistics Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Logistics report details coming soon...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
