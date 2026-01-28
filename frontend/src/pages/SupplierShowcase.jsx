import React, { useState, useEffect } from 'react';
import { 
  Store, Grid, List, Search, Filter, Download,
  Mail, Package, FileText, Eye, ShoppingCart
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/ui/Card';
import Button from '../components/common/ui/Button';
import Input from '../components/common/forms/Input';
import Badge from '../components/common/ui/Badge';
import { LoadingSpinner } from '../components/common/ui/Spinner';
import { Modal, ModalFooter } from '../components/common/ui/Modal';
import { productAPI } from '../services/api/productAPI';

export const SupplierShowcase = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const mockProducts = [
    {
      id: 'PROD-001',
      name: 'Wireless Mouse',
      category: 'Electronics',
      price: 29.99,
      stock: 150,
      image: 'https://via.placeholder.com/300',
      supplier: 'TechParts Inc',
      weight: 0.1,
      dimensions: '10x5x3 cm',
      description: 'Ergonomic wireless mouse with precision tracking',
    },
    {
      id: 'PROD-002',
      name: 'Mechanical Keyboard',
      category: 'Electronics',
      price: 89.99,
      stock: 45,
      image: 'https://via.placeholder.com/300',
      supplier: 'TechParts Inc',
      weight: 0.8,
      dimensions: '45x15x3 cm',
      description: 'RGB mechanical keyboard with cherry switches',
    },
    {
      id: 'PROD-003',
      name: 'USB-C Cable',
      category: 'Accessories',
      price: 12.99,
      stock: 200,
      image: 'https://via.placeholder.com/300',
      supplier: 'CableCo',
      weight: 0.05,
      dimensions: '1m length',
      description: 'High-speed USB-C charging cable',
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || product.supplier === supplierFilter;
    return matchesCategory && matchesSupplier;
  });

  if (loading) {
    return <LoadingSpinner text="Loading product showcase..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Supplier Showcase</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Input
                placeholder="Search products..."
                icon={Search}
                className="flex-1"
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
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="all">All Suppliers</option>
                <option value="TechParts Inc">TechParts Inc</option>
                <option value="CableCo">CableCo</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
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

      {/* Products Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} hover className="overflow-hidden">
              <div className="relative h-64 bg-muted flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4">
                  {product.category}
                </Badge>
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="text-2xl font-bold">${product.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-medium">{product.stock} units</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">{product.weight} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">{product.dimensions}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowQuoteModal(true);
                    }}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowProductModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} hover>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <span className="text-2xl font-bold">${product.price}</span>
                    </div>
                    <p className="text-muted-foreground mb-3">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <span><strong>Stock:</strong> {product.stock} units</span>
                      <span><strong>Weight:</strong> {product.weight} kg</span>
                      <span><strong>Dimensions:</strong> {product.dimensions}</span>
                      <Badge>{product.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowQuoteModal(true);
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Request Quote
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Spec Sheet
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          isOpen={showProductModal}
          title={selectedProduct.name}
          onClose={() => setShowProductModal(false)}
        >
          <div className="space-y-4">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full rounded-lg" />
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{selectedProduct.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Price:</span>
                <p className="font-semibold text-xl">${selectedProduct.price}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Stock:</span>
                <p className="font-semibold">{selectedProduct.stock} units</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Weight:</span>
                <p className="font-semibold">{selectedProduct.weight} kg</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Dimensions:</span>
                <p className="font-semibold">{selectedProduct.dimensions}</p>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowProductModal(false)}>Close</Button>
            <Button onClick={() => {
              setShowProductModal(false);
              setShowQuoteModal(true);
            }}>
              <Mail className="h-4 w-4 mr-2" />
              Request Quote
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Quote Request Modal */}
      {selectedProduct && (
        <Modal
          isOpen={showQuoteModal}
          title="Request Quote"
          onClose={() => setShowQuoteModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product</label>
              <p className="font-semibold">{selectedProduct.name}</p>
            </div>
            <Input label="Your Name" placeholder="John Doe" />
            <Input label="Company Name" placeholder="Company Inc" />
            <Input label="Email" type="email" placeholder="your@email.com" />
            <Input label="Phone" placeholder="+1-555-0100" />
            <Input label="Quantity" type="number" placeholder="100" />
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Notes</label>
              <textarea 
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                rows="3"
                placeholder="Any special requirements..."
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowQuoteModal(false)}>Cancel</Button>
            <Button onClick={() => setShowQuoteModal(false)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Quote Request
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default SupplierShowcase;

