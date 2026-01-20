import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Edit2, RefreshCw, Download, Upload, Mail, Phone, Globe, 
  Clock, Package, CheckCircle, XCircle, Send, AlertTriangle, FileText, 
  ShoppingCart, Truck, DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/common/ui/Table';
import { Button } from '@/components/common/ui/Button';
import { Input } from '@/components/common/forms/Input';
import { Modal, ModalFooter } from '@/components/common/ui/Modal';
import { Alert } from '@/components/common/ui/Alert';
import { Badge } from '@/components/common/ui/Badge';
import { API_BASE_URL } from '@/utils/constants';

export const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    supplier_id: '',
    name: '',
    contact_email: '',
    contact_phone: '',
    api_endpoint: '',
    lead_time_days: 7,
    minimum_order: 1,
    is_active: true
  });

  // Notification form state
  const [notificationData, setNotificationData] = useState({
    product_id: '',
    product_name: '',
    current_stock: 0,
    reorder_point: 10,
    requested_quantity: 0
  });

  // PO form state
  const [poData, setPOData] = useState({
    po_number: '',
    products: [],
    total_amount: 0
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers`);
      if (!response.ok) throw new Error('Failed to load suppliers');
      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          supplier_id: formData.supplier_id.toUpperCase().trim()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create supplier');
      }
      
      setSuccess('✅ Supplier created successfully!');
      setShowAddModal(false);
      resetForm();
      loadSuppliers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/procurement/suppliers/${selectedSupplier.supplier_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update supplier');
      }
      
      setSuccess('✅ Supplier updated successfully!');
      setShowEditModal(false);
      setSelectedSupplier(null);
      resetForm();
      loadSuppliers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendRestockAlert = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/suppliers/notify-restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: selectedSupplier.supplier_id,
          ...notificationData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send notification');
      }

      setSuccess('📧 Restock alert sent to supplier successfully!');
      setShowNotificationModal(false);
      resetNotificationForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendPO = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/suppliers/send-po`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: selectedSupplier.supplier_id,
          ...poData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send PO');
      }

      setSuccess('📋 Purchase Order sent to supplier successfully!');
      setShowPOModal(false);
      resetPOForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      supplier_id: supplier.supplier_id,
      name: supplier.name || '',
      contact_email: supplier.contact_email || '',
      contact_phone: supplier.contact_phone || '',
      api_endpoint: supplier.api_endpoint || '',
      lead_time_days: supplier.lead_time_days || 7,
      minimum_order: supplier.minimum_order || 1,
      is_active: supplier.is_active !== false
    });
    setShowEditModal(true);
  };

  const openNotificationModal = (supplier) => {
    setSelectedSupplier(supplier);
    setNotificationData({
      product_id: '',
      product_name: '',
      current_stock: 0,
      reorder_point: 10,
      requested_quantity: supplier.minimum_order || 1
    });
    setShowNotificationModal(true);
  };

  const openPOModal = (supplier) => {
    setSelectedSupplier(supplier);
    setPOData({
      po_number: `PO-${Date.now()}`,
      products: [],
      total_amount: 0
    });
    setShowPOModal(true);
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      name: '',
      contact_email: '',
      contact_phone: '',
      api_endpoint: '',
      lead_time_days: 7,
      minimum_order: 1,
      is_active: true
    });
  };

  const resetNotificationForm = () => {
    setNotificationData({
      product_id: '',
      product_name: '',
      current_stock: 0,
      reorder_point: 10,
      requested_quantity: 0
    });
  };

  const resetPOForm = () => {
    setPOData({
      po_number: '',
      products: [],
      total_amount: 0
    });
  };

  const exportSuppliers = () => {
    const dataStr = JSON.stringify(suppliers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `suppliers_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.is_active).length,
    avgLeadTime: suppliers.length > 0 
      ? (suppliers.reduce((sum, s) => sum + (s.lead_time_days || 0), 0) / suppliers.length).toFixed(1)
      : 0,
    withEmail: suppliers.filter(s => s.contact_email).length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg gradient-primary shadow-glow-primary">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Supplier Management</h1>
            <p className="text-muted-foreground">Manage suppliers, send restock alerts & purchase orders</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSuppliers} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-primary hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <Building2 className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Suppliers</p>
                <p className="text-3xl font-bold mt-2">{stats.active}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-success opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Lead Time</p>
                <p className="text-3xl font-bold mt-2">{stats.avgLeadTime} <span className="text-sm">days</span></p>
              </div>
              <Clock className="h-10 w-10 text-warning opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-info hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Email</p>
                <p className="text-3xl font-bold mt-2">{stats.withEmail}</p>
              </div>
              <Mail className="h-10 w-10 text-info opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Suppliers</CardTitle>
            <Button onClick={exportSuppliers} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading suppliers...</div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground">No suppliers found. Add your first supplier to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier ID</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.supplier_id}>
                      <TableCell className="font-mono font-semibold">{supplier.supplier_id}</TableCell>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {supplier.contact_email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{supplier.contact_email}</span>
                            </div>
                          )}
                          {supplier.contact_phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {supplier.contact_phone}
                            </div>
                          )}
                          {!supplier.contact_email && !supplier.contact_phone && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {supplier.lead_time_days} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Package className="h-3 w-3" />
                          {supplier.minimum_order}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {supplier.is_active ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => openEditModal(supplier)}
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            title="Edit supplier"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => openNotificationModal(supplier)}
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            title="Send restock alert"
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => openPOModal(supplier)}
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            title="Send purchase order"
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Supplier"
        description="Create a new supplier entry in the system"
        size="lg"
      >
        <form onSubmit={handleAddSupplier}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Supplier ID *"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                placeholder="e.g., SUPPLIER_004"
                required
              />
              <Input
                label="Company Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., ABC Components Ltd."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                type="email"
                icon={Mail}
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="orders@company.com"
              />
              <Input
                label="Contact Phone"
                icon={Phone}
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+1-555-0123"
              />
            </div>

            <Input
              label="API Endpoint"
              icon={Globe}
              value={formData.api_endpoint}
              onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
              placeholder="http://supplier.com/api"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Lead Time (days)"
                type="number"
                icon={Clock}
                value={formData.lead_time_days}
                onChange={(e) => setFormData({ ...formData, lead_time_days: parseInt(e.target.value) || 1 })}
                min="1"
                max="365"
              />
              <Input
                label="Minimum Order Quantity"
                type="number"
                icon={Package}
                value={formData.minimum_order}
                onChange={(e) => setFormData({ ...formData, minimum_order: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_add"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="is_active_add" className="text-sm font-medium">
                Active Supplier
              </label>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Supplier
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSupplier(null);
          resetForm();
        }}
        title="Edit Supplier"
        description={`Update information for ${selectedSupplier?.supplier_id}`}
        size="lg"
      >
        <form onSubmit={handleUpdateSupplier}>
          <div className="space-y-4">
            <Input
              label="Supplier ID"
              value={formData.supplier_id}
              disabled
              className="bg-muted"
            />

            <Input
              label="Company Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., ABC Components Ltd."
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                type="email"
                icon={Mail}
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="orders@company.com"
              />
              <Input
                label="Contact Phone"
                icon={Phone}
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+1-555-0123"
              />
            </div>

            <Input
              label="API Endpoint"
              icon={Globe}
              value={formData.api_endpoint}
              onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
              placeholder="http://supplier.com/api"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Lead Time (days)"
                type="number"
                icon={Clock}
                value={formData.lead_time_days}
                onChange={(e) => setFormData({ ...formData, lead_time_days: parseInt(e.target.value) || 1 })}
                min="1"
                max="365"
              />
              <Input
                label="Minimum Order Quantity"
                type="number"
                icon={Package}
                value={formData.minimum_order}
                onChange={(e) => setFormData({ ...formData, minimum_order: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_edit"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="is_active_edit" className="text-sm font-medium">
                Active Supplier
              </label>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => {
              setShowEditModal(false);
              setSelectedSupplier(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Update Supplier
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Send Restock Alert Modal */}
      <Modal
        isOpen={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false);
          setSelectedSupplier(null);
          resetNotificationForm();
        }}
        title="Send Restock Alert"
        description={`Send urgent restock notification to ${selectedSupplier?.name}`}
        size="lg"
      >
        <form onSubmit={handleSendRestockAlert}>
          <div className="space-y-4">
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              This will send an automated email to the supplier requesting immediate restocking.
            </Alert>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-semibold">{selectedSupplier?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-mono">{selectedSupplier?.contact_email || 'No email'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lead Time:</span>
                <span>{selectedSupplier?.lead_time_days} days</span>
              </div>
            </div>

            <Input
              label="Product ID *"
              value={notificationData.product_id}
              onChange={(e) => setNotificationData({ ...notificationData, product_id: e.target.value })}
              placeholder="e.g., USR001"
              required
            />

            <Input
              label="Product Name *"
              value={notificationData.product_name}
              onChange={(e) => setNotificationData({ ...notificationData, product_name: e.target.value })}
              placeholder="e.g., BOAST PB-01 BLUE POWER BANK"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Current Stock *"
                type="number"
                icon={Package}
                value={notificationData.current_stock}
                onChange={(e) => setNotificationData({ ...notificationData, current_stock: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
              <Input
                label="Reorder Point *"
                type="number"
                icon={AlertTriangle}
                value={notificationData.reorder_point}
                onChange={(e) => setNotificationData({ ...notificationData, reorder_point: parseInt(e.target.value) || 0 })}
                min="1"
                required
              />
            </div>

            <Input
              label="Requested Quantity *"
              type="number"
              icon={ShoppingCart}
              value={notificationData.requested_quantity}
              onChange={(e) => setNotificationData({ ...notificationData, requested_quantity: parseInt(e.target.value) || 0 })}
              min={selectedSupplier?.minimum_order || 1}
              helperText={`Minimum order: ${selectedSupplier?.minimum_order || 1} units`}
              required
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => {
              setShowNotificationModal(false);
              setSelectedSupplier(null);
              resetNotificationForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Send className="h-4 w-4" />
              Send Alert
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Send Purchase Order Modal */}
      <Modal
        isOpen={showPOModal}
        onClose={() => {
          setShowPOModal(false);
          setSelectedSupplier(null);
          resetPOForm();
        }}
        title="Send Purchase Order"
        description={`Create and send PO to ${selectedSupplier?.name}`}
        size="lg"
      >
        <form onSubmit={handleSendPO}>
          <div className="space-y-4">
            <Alert variant="info">
              <FileText className="h-4 w-4" />
              This will generate and send a formal purchase order to the supplier.
            </Alert>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-semibold">{selectedSupplier?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-mono">{selectedSupplier?.contact_email || 'No email'}</span>
              </div>
            </div>

            <Input
              label="PO Number *"
              value={poData.po_number}
              onChange={(e) => setPOData({ ...poData, po_number: e.target.value })}
              placeholder="PO-20250103-001"
              required
            />

            <Input
              label="Total Amount *"
              type="number"
              icon={DollarSign}
              value={poData.total_amount}
              onChange={(e) => setPOData({ ...poData, total_amount: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />

            <div className="text-sm text-muted-foreground">
              Note: Product line items can be added through the API. This form sends a basic PO confirmation.
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => {
              setShowPOModal(false);
              setSelectedSupplier(null);
              resetPOForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Truck className="h-4 w-4" />
              Send PO
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
