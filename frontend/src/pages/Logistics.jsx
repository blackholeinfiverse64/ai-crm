import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, Plus, Search, Filter } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { formatDate } from '@/utils/dateUtils';

export const Logistics = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const metrics = {
    totalOrders: 1248,
    inTransit: 89,
    delivered: 1102,
    pending: 57,
  };

  const mockOrders = [
    { id: 'ORD-1001', customer: 'Acme Corp', status: 'in_transit', items: 5, destination: 'New York, NY', date: new Date(), amount: 1250 },
    { id: 'ORD-1002', customer: 'Tech Solutions', status: 'delivered', items: 3, destination: 'San Francisco, CA', date: new Date(), amount: 890 },
    { id: 'ORD-1003', customer: 'Global Industries', status: 'pending', items: 12, destination: 'Chicago, IL', date: new Date(), amount: 3420 },
    { id: 'ORD-1004', customer: 'StartUp Inc', status: 'processing', items: 7, destination: 'Austin, TX', date: new Date(), amount: 1680 },
    { id: 'ORD-1005', customer: 'Enterprise LLC', status: 'in_transit', items: 15, destination: 'Seattle, WA', date: new Date(), amount: 4250 },
  ];

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      in_transit: 'info',
      delivered: 'success',
      cancelled: 'destructive',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return <LoadingSpinner text="Loading logistics data..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Logistics Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage orders, shipments, and deliveries
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          icon={Package}
          variant="primary"
        />
        <MetricCard
          title="In Transit"
          value={metrics.inTransit.toLocaleString()}
          icon={Truck}
          variant="info"
        />
        <MetricCard
          title="Delivered"
          value={metrics.delivered.toLocaleString()}
          icon={MapPin}
          variant="success"
        />
        <MetricCard
          title="Pending"
          value={metrics.pending.toLocaleString()}
          icon={Package}
          variant="warning"
        />
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search orders..."
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>{order.destination}</TableCell>
                  <TableCell>{formatDate(order.date, 'PP')}</TableCell>
                  <TableCell>${order.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
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
};

export default Logistics;
