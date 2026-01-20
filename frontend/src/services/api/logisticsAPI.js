import apiClient from './baseAPI';

export const logisticsAPI = {
  // Orders
  getOrders: (params) => apiClient.get('/api/logistics/orders', { params }),
  getOrder: (id) => apiClient.get(`/api/logistics/orders/${id}`),
  createOrder: (data) => apiClient.post('/api/logistics/orders', data),
  updateOrder: (id, data) => apiClient.put(`/api/logistics/orders/${id}`, data),
  deleteOrder: (id) => apiClient.delete(`/api/logistics/orders/${id}`),
  
  // Shipments
  getShipments: (params) => apiClient.get('/api/logistics/shipments', { params }),
  getShipment: (id) => apiClient.get(`/api/logistics/shipments/${id}`),
  trackShipment: (trackingNumber) => apiClient.get(`/api/logistics/track/${trackingNumber}`),
  updateShipmentStatus: (id, status) => apiClient.patch(`/api/logistics/shipments/${id}/status`, { status }),
  
  // Deliveries
  getDeliveries: (params) => apiClient.get('/api/logistics/deliveries', { params }),
  getDelivery: (id) => apiClient.get(`/api/logistics/deliveries/${id}`),
  scheduleDelivery: (data) => apiClient.post('/api/logistics/deliveries', data),
  
  // Restock
  getRestockRequests: (params) => apiClient.get('/api/logistics/restock', { params }),
  createRestockRequest: (data) => apiClient.post('/api/logistics/restock', data),
  approveRestock: (id) => apiClient.post(`/api/logistics/restock/${id}/approve`),
  
  // Dashboard
  getDashboardMetrics: () => apiClient.get('/api/logistics/dashboard/metrics'),
};

export default logisticsAPI;
