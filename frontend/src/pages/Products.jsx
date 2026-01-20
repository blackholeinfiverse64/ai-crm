import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Edit2, Trash2, Upload, 
  Image as ImageIcon, Grid, List, Eye
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import MetricCard from '../components/common/charts/MetricCard';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/common/ui/Table';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { Modal, ModalFooter } from '../components/common/ui/Modal';
import { productAPI } from '../services/api/productAPI';
import { formatDate } from '@/utils/dateUtils';

export const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const metrics = {
    totalProducts: 3842,
    inStock: 3420,
    lowStock: 156,
    outOfStock: 266,
  };

  const mockProducts = [
    { 
      id: 'PROD-001', 
      name: 'Wireless Mouse', 
      category: 'Electronics', 
      price: 29.99, 
      stock: 150,
      image: 'https://via.placeholder.com/200',
      supplier: 'TechParts Inc',
      status: 'in_stock'
    },
    { 
      id: 'PROD-002', 
      name: 'Mechanical Keyboard', 
      category: 'Electronics', 
      price: 89.99, 
      stock: 45,
      image: 'https://via.placeholder.com/200',
      supplier: 'TechParts Inc',
      status: 'in_stock'
    },
    { 
      id: 'PROD-003', 
      name: 'USB-C Cable', 
      category: 'Accessories', 
      price: 12.99, 
      stock: 5,
      image: 'https://via.placeholder.com/200',
      supplier: 'CableCo',
      status: 'low_stock'
    },
    { 
      id: 'PROD-004', 
      name: 'Monitor Stand', 
      category: 'Furniture', 
      price: 49.99, 
      stock: 0,
      image: 'https://via.placeholder.com/200',
      supplier: 'FurniturePro',
      status: 'out_of_stock'
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner text="Loading products..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory and catalog
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts.toLocaleString()}
          icon={Package}
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
          icon={Package}
          variant="warning"
        />
        <MetricCard
          title="Out of Stock"
          value={metrics.outOfStock.toLocaleString()}
          icon={Package}
          variant="destructive"
        />
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Input
                placeholder="Search products..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="all">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} hover className="overflow-hidden">
              <div className="relative h-48 bg-muted flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <Badge 
                  variant={getStatusVariant(product.status)}
                  className="absolute top-2 right-2"
                >
                  {product.status.replace('_', ' ')}
                </Badge>
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.id}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold">${product.price}</span>
                  <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowImageModal(true);
                    }}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Products List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover" />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-semibold">${product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.supplier}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(product.status)}>
                        {product.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowImageModal(true);
                          }}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        title="Add New Product"
        onClose={() => setShowAddModal(false)}
      >
          <div className="space-y-4">
            <Input label="Product Name" placeholder="Enter product name" />
            <Input label="Product ID" placeholder="PROD-XXX" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price" type="number" placeholder="0.00" />
              <Input label="Stock" type="number" placeholder="0" />
            </div>
            <select className="w-full px-4 py-2 rounded-lg border border-border bg-background">
              <option>Select Category</option>
              <option>Electronics</option>
              <option>Accessories</option>
              <option>Furniture</option>
            </select>
            <Input label="Supplier" placeholder="Supplier name" />
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={() => setShowAddModal(false)}>Add Product</Button>
          </ModalFooter>
        </Modal>

      {/* Edit Product Modal */}
      {selectedProduct && (
        <Modal
          isOpen={showEditModal}
          title="Edit Product"
          onClose={() => setShowEditModal(false)}
        >
          <div className="space-y-4">
            <Input label="Product Name" defaultValue={selectedProduct.name} />
            <Input label="Product ID" defaultValue={selectedProduct.id} disabled />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price" type="number" defaultValue={selectedProduct.price} />
              <Input label="Stock" type="number" defaultValue={selectedProduct.stock} />
            </div>
            <select className="w-full px-4 py-2 rounded-lg border border-border bg-background" defaultValue={selectedProduct.category}>
              <option>Electronics</option>
              <option>Accessories</option>
              <option>Furniture</option>
            </select>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={() => setShowEditModal(false)}>Save Changes</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Image Upload Modal */}
      {selectedProduct && (
        <Modal
          isOpen={showImageModal}
          title="Upload Product Image"
          onClose={() => setShowImageModal(false)}
        >
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop an image here, or click to select
              </p>
              <Button variant="outline" size="sm">
                Select Image
              </Button>
            </div>
            {selectedProduct.image && (
              <div className="mt-4">
                <img src={selectedProduct.image} alt="Preview" className="w-full rounded-lg" />
              </div>
            )}
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowImageModal(false)}>Cancel</Button>
            <Button onClick={() => setShowImageModal(false)}>Upload Image</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default Products;
