import apiClient from './baseAPI';

export const inventoryAPI = {
  // Inventory
  getInventory: (params) => apiClient.get('/api/inventory', { params }),
  getInventoryItem: (id) => apiClient.get(`/api/inventory/${id}`),
  updateStock: (id, data) => apiClient.patch(`/api/inventory/${id}/stock`, data),
  adjustStock: (id, data) => apiClient.post(`/api/inventory/${id}/adjust`, data),
  
  // Stock Levels
  getLowStock: (threshold) => apiClient.get('/api/inventory/low-stock', { params: { threshold } }),
  getStockAlerts: () => apiClient.get('/api/inventory/alerts'),
  
  // Forecasting
  getDemandForecast: (productId, params) => apiClient.get(`/api/inventory/forecast/${productId}`, { params }),
  getSeasonalTrends: (productId) => apiClient.get(`/api/inventory/trends/${productId}`),
  getPredictiveAnalytics: () => apiClient.get('/api/inventory/analytics/predictive'),
  
  // Optimization
  getOptimizationSuggestions: () => apiClient.get('/api/inventory/optimization'),
  getReorderPoints: () => apiClient.get('/api/inventory/reorder-points'),
  updateReorderPoint: (id, data) => apiClient.put(`/api/inventory/${id}/reorder-point`, data),
  
  // Dashboard
  getDashboardMetrics: () => apiClient.get('/api/inventory/dashboard/metrics'),
  getStockMovements: (params) => apiClient.get('/api/inventory/movements', { params }),
};

export default inventoryAPI;
