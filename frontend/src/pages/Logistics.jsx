import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, BarChart3, Bot, 
  Download, Search, Maximize2, RefreshCw,
  Building2, Truck as TruckIcon, LayoutDashboard,
  TrendingUp, Activity, AlertCircle
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '../components/common/charts/MetricCard';
import { logisticsAPI } from '../services/api/logisticsAPI';
import { inventoryAPI } from '../services/api/inventoryAPI';
import { agentAPI } from '../services/api/agentAPI';
import { formatDate } from '@/utils/dateUtils';

export const Logistics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Orders data
  const [orders, setOrders] = useState([
    { OrderID: 214, Status: 'Processing', CustomerID: 'CUST014', ProductID: 'USR005', Quantity: 1, OrderDate: '2026-01-19T14:11:40.681734' },
    { OrderID: 208, Status: 'Processing', CustomerID: 'CUST008', ProductID: 'USR004', Quantity: 3, OrderDate: '2026-01-19T14:11:40.681711' },
    { OrderID: 207, Status: 'Processing', CustomerID: 'CUST007', ProductID: 'USR004', Quantity: 2, OrderDate: '2026-01-13T14:11:40.681707' },
    { OrderID: 213, Status: 'Cancelled', CustomerID: 'CUST013', ProductID: 'USR002', Quantity: 1, OrderDate: '2026-01-11T14:11:40.681730' },
    { OrderID: 210, Status: 'Shipped', CustomerID: 'CUST010', ProductID: 'USR001', Quantity: 3, OrderDate: '2026-01-11T14:11:40.681719' },
    { OrderID: 201, Status: 'Processing', CustomerID: 'CUST001', ProductID: 'USR003', Quantity: 2, OrderDate: '2026-01-11T14:11:40.681669' },
    { OrderID: 212, Status: 'Cancelled', CustomerID: 'CUST012', ProductID: 'USR001', Quantity: 2, OrderDate: '2026-01-10T14:11:40.681726' },
    { OrderID: 204, Status: 'Cancelled', CustomerID: 'CUST004', ProductID: 'USR004', Quantity: 1, OrderDate: '2026-01-05T14:11:40.681696' },
    { OrderID: 215, Status: 'Processing', CustomerID: 'CUST015', ProductID: 'USR001', Quantity: 3, OrderDate: '2026-01-02T14:11:40.681737' },
    { OrderID: 209, Status: 'Shipped', CustomerID: 'CUST009', ProductID: 'USR005', Quantity: 1, OrderDate: '2025-12-29T14:11:40.681715' },
  ]);

  // Shipments data
  const [shipments, setShipments] = useState([
    { shipment_id: 'SHIP_007', order_id: 214, courier_id: 'COURIER_001', tracking_number: 'TRK988366230', status: 'out_for_delivery', origin_address: 'Electronics Warehouse, Tech District', destination: 'Customer Address 123 Main St' },
    { shipment_id: 'SHIP_006', order_id: 211, courier_id: 'COURIER_001', tracking_number: 'TRK385627700', status: 'out_for_delivery', origin_address: 'Electronics Warehouse, Tech District', destination: 'Customer Address 456 Oak Ave' },
    { shipment_id: 'SHIP_005', order_id: 207, courier_id: 'COURIER_002', tracking_number: 'TRK59921609', status: 'created', origin_address: 'Electronics Warehouse, Tech District', destination: 'Customer Address 789 Pine Rd' },
    { shipment_id: 'SHIP_004', order_id: 206, courier_id: 'COURIER_002', tracking_number: 'TRK411850763', status: 'created', origin_address: 'Electronics Warehouse, Tech District', destination: 'Customer Address 321 Elm St' },
    { shipment_id: 'SHIP_003', order_id: 205, courier_id: 'COURIER_003', tracking_number: 'TRK197525611', status: 'picked_up', origin_address: 'Electronics Warehouse, Tech District', destination: 'Customer Address 654 Maple Dr' },
    { shipment_id: 'SHIP_002', order_id: 204, courier_id: 'COURIER_003', tracking_number: 'TRK785898687', status: 'picked_up', origin_address: 'Electronics Warehouse, Tech District', destination: 'Customer Address 987 Cedar Ln' },
    { shipment_id: 'SHIP_001', order_id: 202, courier_id: 'COURIER_001', tracking_number: 'TRK444661448', status: 'out_for_delivery', origin_address: 'Electronics Warehouse, Tech District', destination: 'Customer Address 147 Birch Way' },
  ]);

  // Inventory data for chart
  const [inventoryData, setInventoryData] = useState([
    { ProductID: 'USR001', CurrentStock: 25 },
    { ProductID: 'USR002', CurrentStock: 45 },
    { ProductID: 'USR003', CurrentStock: 20 },
    { ProductID: 'USR004', CurrentStock: 30 },
    { ProductID: 'USR005', CurrentStock: 75 },
  ]);

  // Agent activity data
  const [agentActivity, setAgentActivity] = useState([
    { timestamp: '2026-01-19T02:41:40.682616', action: 'Delivery Confirmed', ProductID: 'USR001', quantity: 10, confidence: 0.8, human_review: false, details: 'Delivery confirmed' },
    { timestamp: '2026-01-19T02:35:20.682500', action: 'Restock Request Created', ProductID: 'USR005', quantity: 5, confidence: 0.72, human_review: true, details: 'Inventory replenish' },
    { timestamp: '2026-01-18T15:22:10.682300', action: 'Quality Check', ProductID: 'USR003', quantity: 13, confidence: 0.99, human_review: true, details: 'Monthly stock audit' },
    { timestamp: '2026-01-18T10:15:30.682200', action: 'Low Stock Alert', ProductID: 'USR002', quantity: 16, confidence: 0.75, human_review: false, details: 'Low stock alert: only 16 units remaining' },
    { timestamp: '2026-01-17T14:08:50.682100', action: 'Stock Level Below Reorder', ProductID: 'USR004', quantity: 8, confidence: 0.85, human_review: false, details: 'Stock level below reorder point' },
    { timestamp: '2026-01-17T09:42:15.682000', action: 'Return Request Processed', ProductID: 'USR001', quantity: null, confidence: 0.9, human_review: false, details: 'Return request processed' },
    { timestamp: '2026-01-16T16:30:25.681900', action: 'Return Authorized', ProductID: 'USR005', quantity: null, confidence: 0.88, human_review: false, details: 'Return authorized and processed' },
  ]);

  const getStatusVariant = (status) => {
    const variants = {
      'Processing': 'info',
      'Shipped': 'success',
      'Cancelled': 'destructive',
      'out_for_delivery': 'info',
      'created': 'warning',
      'picked_up': 'info',
      'delivered': 'success',
    };
    return variants[status] || 'default';
  };

  const handleRunProcurementAgent = async () => {
    setLoading(true);
    try {
      await agentAPI.triggerAgent('procurement', { action: 'run' });
      // Refresh activity
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error running procurement agent:', error);
      setLoading(false);
    }
  };

  const handleRunDeliveryAgent = async () => {
    setLoading(true);
    try {
      await agentAPI.triggerAgent('delivery', { action: 'run' });
      // Refresh activity
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error running delivery agent:', error);
      setLoading(false);
    }
  };

  // Overview metrics
  const overviewMetrics = {
    totalOrders: orders.length,
    totalShipments: shipments.length,
    processingOrders: orders.filter(o => o.Status === 'Processing').length,
    inTransitShipments: shipments.filter(s => s.status === 'out_for_delivery').length,
    totalInventory: inventoryData.reduce((sum, item) => sum + item.CurrentStock, 0),
    agentActions: agentActivity.length,
  };

  // Orders trend data (last 7 days)
  const ordersTrendData = [
    { date: '01-13', orders: 2, shipments: 1 },
    { date: '01-14', orders: 0, shipments: 0 },
    { date: '01-15', orders: 1, shipments: 1 },
    { date: '01-16', orders: 1, shipments: 0 },
    { date: '01-17', orders: 2, shipments: 2 },
    { date: '01-18', orders: 2, shipments: 1 },
    { date: '01-19', orders: 2, shipments: 2 },
  ];

  // Order status distribution
  const orderStatusData = [
    { name: 'Processing', value: orders.filter(o => o.Status === 'Processing').length },
    { name: 'Shipped', value: orders.filter(o => o.Status === 'Shipped').length },
    { name: 'Cancelled', value: orders.filter(o => o.Status === 'Cancelled').length },
  ];

  // Shipment status distribution
  const shipmentStatusData = [
    { name: 'Out for Delivery', value: shipments.filter(s => s.status === 'out_for_delivery').length },
    { name: 'Picked Up', value: shipments.filter(s => s.status === 'picked_up').length },
    { name: 'Created', value: shipments.filter(s => s.status === 'created').length },
  ];

  // Inventory trend data
  const inventoryTrendData = [
    { date: '01-13', USR001: 20, USR002: 40, USR003: 18, USR004: 28, USR005: 70 },
    { date: '01-14', USR001: 22, USR002: 42, USR003: 19, USR004: 29, USR005: 72 },
    { date: '01-15', USR001: 21, USR002: 43, USR003: 18, USR004: 30, USR005: 73 },
    { date: '01-16', USR001: 23, USR002: 44, USR003: 19, USR004: 29, USR005: 74 },
    { date: '01-17', USR001: 24, USR002: 45, USR003: 20, USR004: 30, USR005: 75 },
    { date: '01-18', USR001: 24, USR002: 45, USR003: 20, USR004: 30, USR005: 75 },
    { date: '01-19', USR001: 25, USR002: 45, USR003: 20, USR004: 30, USR005: 75 },
  ];

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--info))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
  ];

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'orders'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="h-4 w-4" />
          Orders
        </button>
        <button
          onClick={() => setActiveTab('shipments')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'shipments'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Truck className="h-4 w-4" />
          Shipments
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'agents'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bot className="h-4 w-4" />
          Agents
        </button>
      </div>

      {/* Overview Section */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Logistics & Inventory Overview</h1>
          <p className="text-muted-foreground mt-1">
              Comprehensive view of orders, shipments, inventory, and agent activity
          </p>
      </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Orders"
              value={overviewMetrics.totalOrders}
          icon={Package}
          variant="primary"
              trend="up"
              trendValue="+12.5%"
            />
            <MetricCard
              title="Total Shipments"
              value={overviewMetrics.totalShipments}
              icon={Truck}
              variant="info"
              trend="up"
              trendValue="+8.2%"
            />
            <MetricCard
              title="Processing Orders"
              value={overviewMetrics.processingOrders}
              icon={Activity}
              variant="warning"
        />
        <MetricCard
          title="In Transit"
              value={overviewMetrics.inTransitShipments}
          icon={Truck}
          variant="info"
        />
        <MetricCard
              title="Total Inventory"
              value={overviewMetrics.totalInventory}
              icon={BarChart3}
          variant="success"
              trend="up"
              trendValue="+5.3%"
        />
        <MetricCard
              title="Agent Actions"
              value={overviewMetrics.agentActions}
              icon={Bot}
              variant="accent"
        />
      </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Orders & Shipments Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ordersTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      className="text-xs"
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      className="text-xs"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Orders"
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="shipments" 
                      stroke="hsl(var(--info))" 
                      strokeWidth={2}
                      name="Shipments"
                      dot={{ fill: 'hsl(var(--info))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Shipment Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={shipmentStatusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      className="text-xs"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      className="text-xs"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Inventory Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Levels Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inventoryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      className="text-xs"
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      className="text-xs"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="USR001" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="USR002" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--secondary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="USR003" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--accent))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="USR004" 
                      stroke="hsl(var(--info))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--info))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="USR005" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--success))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Current Stock Levels Bar Chart */}
      <Card>
        <CardHeader>
              <CardTitle>Current Stock Levels by Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="ProductID" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    className="text-xs"
                  />
                  <YAxis 
                    label={{ value: 'CurrentStock', angle: -90, position: 'insideLeft' }}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    className="text-xs"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar 
                    dataKey="CurrentStock" 
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Section */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Order Management</h1>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OrderID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>CustomerID</TableHead>
                    <TableHead>ProductID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>OrderDate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow key={order.OrderID}>
                      <TableCell className="font-medium">{order.OrderID}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.Status)}>
                          {order.Status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.CustomerID}</TableCell>
                      <TableCell>{order.ProductID}</TableCell>
                      <TableCell>{order.Quantity}</TableCell>
                      <TableCell>{formatDateTime(order.OrderDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shipments Section */}
      {activeTab === 'shipments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-heading font-bold tracking-tight">Shipment Tracking</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                      <TableHead>shipment_id</TableHead>
                      <TableHead>order_id</TableHead>
                      <TableHead>courier_id</TableHead>
                      <TableHead>tracking_number</TableHead>
                      <TableHead>status</TableHead>
                      <TableHead>origin_address</TableHead>
                      <TableHead>destination</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                    {shipments.map((shipment) => (
                      <TableRow key={shipment.shipment_id}>
                        <TableCell className="font-medium">{shipment.shipment_id}</TableCell>
                        <TableCell>{shipment.order_id}</TableCell>
                        <TableCell>{shipment.courier_id}</TableCell>
                        <TableCell>{shipment.tracking_number}</TableCell>
                  <TableCell>
                          <Badge variant={getStatusVariant(shipment.status)}>
                            {shipment.status}
                    </Badge>
                  </TableCell>
                        <TableCell>{shipment.origin_address}</TableCell>
                        <TableCell className="max-w-xs truncate">{shipment.destination}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Section */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Inventory Status</h1>
          <Card>
            <CardHeader>
              <CardTitle>Current Stock Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="ProductID" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    className="text-xs"
                  />
                  <YAxis 
                    label={{ value: 'CurrentStock', angle: -90, position: 'insideLeft' }}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    className="text-xs"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar 
                    dataKey="CurrentStock" 
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agents Section */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <h1 className="text-3xl font-heading font-bold tracking-tight">AI Agent Controls</h1>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleRunProcurementAgent} disabled={loading}>
              <Building2 className="h-4 w-4 mr-2" />
              Run Procurement Agent
            </Button>
            <Button onClick={handleRunDeliveryAgent} disabled={loading} variant="outline">
              <TruckIcon className="h-4 w-4 mr-2" />
              Run Delivery Agent
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Agent Activity</CardTitle>
                    <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                    </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>timestamp</TableHead>
                      <TableHead>action</TableHead>
                      <TableHead>ProductID</TableHead>
                      <TableHead>quantity</TableHead>
                      <TableHead>confidence</TableHead>
                      <TableHead>human_review</TableHead>
                      <TableHead>details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentActivity.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">
                          {formatDateTime(activity.timestamp)}
                        </TableCell>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell>{activity.ProductID}</TableCell>
                        <TableCell>{activity.quantity ?? 'None'}</TableCell>
                        <TableCell>{activity.confidence}</TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={activity.human_review}
                            readOnly
                            className="h-4 w-4 rounded border-border"
                          />
                  </TableCell>
                        <TableCell className="max-w-xs truncate">{activity.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
              </div>
        </CardContent>
      </Card>
        </div>
      )}
    </div>
  );
};

export default Logistics;
