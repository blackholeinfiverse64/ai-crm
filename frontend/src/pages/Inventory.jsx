import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, AlertTriangle, TrendingUp, TrendingDown, 
  Plus, Search, Filter, RefreshCw, Package
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { Alert } from '../components/common/ui/Alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { inventoryAPI } from '../services/api/inventoryAPI';

export const Inventory = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const metrics = {
    totalItems: 1248,
    inStock: 1102,
    lowStock: 89,
    outOfStock: 57,
    totalValue: 245000,
  };

  const mockInventory = [
    { 
      id: 'INV-001', 
      productName: 'Wireless Mouse', 
      productId: 'PROD-001',
      currentStock: 150, 
      reorderPoint: 50,
      unitCost: 15.50,
      totalValue: 2325,
      status: 'in_stock',
      lastRestocked: new Date(Date.now() - 86400000)
    },
    { 
      id: 'INV-002', 
      productName: 'Mechanical Keyboard', 
      productId: 'PROD-002',
      currentStock: 45, 
      reorderPoint: 30,
      unitCost: 45.00,
      totalValue: 2025,
      status: 'in_stock',
      lastRestocked: new Date(Date.now() - 172800000)
    },
    { 
      id: 'INV-003', 
      productName: 'USB-C Cable', 
      productId: 'PROD-003',
      currentStock: 5, 
      reorderPoint: 20,
      unitCost: 8.00,
      totalValue: 40,
      status: 'low_stock',
      lastRestocked: new Date(Date.now() - 259200000)
    },
    { 
      id: 'INV-004', 
      productName: 'Monitor Stand', 
      productId: 'PROD-004',
      currentStock: 0, 
      reorderPoint: 10,
      unitCost: 25.00,
      totalValue: 0,
      status: 'out_of_stock',
      lastRestocked: new Date(Date.now() - 345600000)
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setInventory(mockInventory);
      setLowStockItems(mockInventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock'));
      setLoading(false);
    }, 800);
  }, []);

  const getStatusVariant = (status) => {
    const variants = {
      in_stock: 'success',
      low_stock: 'warning',
      out_of_stock: 'destructive',
    };
    return variants[status] || 'default';
  };

  const filteredInventory = inventory.filter(item => 
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stockChartData = [
    { name: 'In Stock', value: metrics.inStock, color: '#22c55e' },
    { name: 'Low Stock', value: metrics.lowStock, color: '#f59e0b' },
    { name: 'Out of Stock', value: metrics.outOfStock, color: '#ef4444' },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading inventory..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor stock levels and manage inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adjust Stock
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Alert variant="warning" className="border-l-4 border-warning">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <h4 className="font-semibold">Low Stock Alert</h4>
            <p className="text-sm">
              {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'items'} {lowStockItems.some(i => i.status === 'out_of_stock') ? 'are out of stock or' : ''} need restocking
            </p>
          </div>
        </Alert>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Items"
          value={metrics.totalItems.toLocaleString()}
          icon={ShoppingCart}
          variant="primary"
        />
        <MetricCard
          title="In Stock"
          value={metrics.inStock.toLocaleString()}
          icon={Package}
          variant="success"
        />
        <MetricCard
          title="Low Stock"
          value={metrics.lowStock.toLocaleString()}
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Out of Stock"
          value={metrics.outOfStock.toLocaleString()}
          icon={Package}
          variant="destructive"
        />
        <MetricCard
          title="Total Value"
          value={`$${metrics.totalValue.toLocaleString()}`}
          icon={TrendingUp}
          variant="accent"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm text-muted-foreground">
                      Current: {item.currentStock} | Reorder: {item.reorderPoint}
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No low stock items</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search inventory..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <TableHead>Product</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Point</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.productId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.currentStock}
                      {item.currentStock < item.reorderPoint && (
                        <TrendingDown className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.reorderPoint}</TableCell>
                  <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">${item.totalValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(item.lastRestocked).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Adjust
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

export default Inventory;
